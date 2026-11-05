const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { DatabaseSync } = require("node:sqlite");
const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";
const databaseDirectory = path.join(root, "database");
const databasePath = path.join(databaseDirectory, "nuevo_hogar.sqlite");
const deriveKey = promisify(scrypt);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

fs.mkdirSync(databaseDirectory, { recursive: true });
const database = new DatabaseSync(databasePath);
const sessions = new Map();
database.exec(`
  CREATE TABLE IF NOT EXISTS jugadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL COLLATE NOCASE UNIQUE,
    correo TEXT NOT NULL COLLATE NOCASE UNIQUE,
    contrasena_hash TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS niveles_puntuados (
    jugador_id INTEGER NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
    nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 6),
    puntos INTEGER NOT NULL DEFAULT 100,
    completado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (jugador_id, nivel)
  );
`);

function responderJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(data));
}

async function leerJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16 * 1024) {
      const error = new Error("La solicitud es demasiado grande.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return data;
  } catch {
    const error = new Error("La solicitud no contiene datos válidos.");
    error.status = 400;
    throw error;
  }
}

async function crearHash(contrasena) {
  const salt = randomBytes(16);
  const hash = await deriveKey(contrasena, salt, 64);
  return `scrypt$${salt.toString("hex")}$${Buffer.from(hash).toString("hex")}`;
}

async function verificarHash(contrasena, guardado) {
  const [algoritmo, saltHex, hashHex] = guardado.split("$");
  if (algoritmo !== "scrypt" || !/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{128}$/i.test(hashHex)) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const actual = Buffer.from(await deriveKey(contrasena, Buffer.from(saltHex, "hex"), esperado.length));
  return timingSafeEqual(actual, esperado);
}

function leerTokenSesion(request) {
  const cookie = request.headers.cookie || "";
  const encontrado = cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith("nh_session="));
  return encontrado ? decodeURIComponent(encontrado.slice("nh_session=".length)) : "";
}

function crearSesion(response, jugadorId) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, jugadorId);
  response.setHeader("Set-Cookie", `nh_session=${token}; HttpOnly; SameSite=Lax; Path=/`);
}

function exigirSesion(request, response) {
  const token = leerTokenSesion(request);
  const jugadorId = token ? sessions.get(token) : null;
  if (!jugadorId) {
    responderJson(response, 401, { ok: false, error: "Iniciá sesión para guardar tu progreso." });
    return null;
  }
  return { token, jugadorId };
}

async function manejarAutenticacion(request, response, pathname) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }

  let data;
  try {
    data = await leerJson(request);
  } catch (error) {
    responderJson(response, error.status || 400, { ok: false, error: error.message });
    return;
  }

  const usuario = String(data.usuario || "").trim();
  const contrasena = String(data.contrasena || "");

  if (pathname === "/api/registrar.php") {
    const correo = String(data.correo || "").trim();
    const largoUsuario = [...usuario].length;
    if (largoUsuario < 3 || largoUsuario > 40) {
      responderJson(response, 422, { ok: false, error: "El usuario debe tener entre 3 y 40 caracteres." });
      return;
    }
    if (correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      responderJson(response, 422, { ok: false, error: "Ingresá un correo electrónico válido." });
      return;
    }
    if ([...contrasena].length < 4) {
      responderJson(response, 422, { ok: false, error: "La contraseña debe tener al menos 4 caracteres." });
      return;
    }

    try {
      const hash = await crearHash(contrasena);
      database.prepare("INSERT INTO jugadores (usuario, correo, contrasena_hash) VALUES (?, ?, ?)").run(usuario, correo, hash);
      responderJson(response, 201, { ok: true });
    } catch (error) {
      if (error.code === "ERR_SQLITE_ERROR" && /UNIQUE constraint failed/i.test(error.message)) {
        responderJson(response, 409, { ok: false, error: "Ese usuario o correo ya está registrado." });
        return;
      }
      console.error("Error registrando jugador:", error);
      responderJson(response, 500, { ok: false, error: "No se pudo crear la cuenta." });
    }
    return;
  }

  if (!usuario || !contrasena) {
    responderJson(response, 422, { ok: false, error: "Completá usuario y contraseña." });
    return;
  }

  try {
    const jugador = database.prepare("SELECT id, usuario, contrasena_hash FROM jugadores WHERE usuario = ? LIMIT 1").get(usuario);
    if (!jugador || !(await verificarHash(contrasena, jugador.contrasena_hash))) {
      responderJson(response, 401, { ok: false, error: "Usuario o contraseña incorrectos." });
      return;
    }
    crearSesion(response, jugador.id);
    responderJson(response, 200, { ok: true, usuario: jugador.usuario });
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    responderJson(response, 500, { ok: false, error: "No se pudo iniciar sesión." });
  }
}

function manejarPuntuaciones(request, response, pathname) {
  const apiGet = pathname === "/api/puntuaciones.php" || pathname === "/api/puntuaciones";
  const apiPost = apiGet || pathname === "/api/puntuaciones/nivel";
  if (apiGet && request.method === "GET") {
    try {
      const rows = database.prepare(`
        SELECT j.usuario,
               COALESCE(SUM(n.puntos), 0) AS puntuacion,
               COUNT(n.nivel) AS nivelesCompletados
        FROM jugadores j
        LEFT JOIN niveles_puntuados n ON n.jugador_id = j.id
        GROUP BY j.id
        ORDER BY puntuacion DESC, nivelesCompletados DESC, j.usuario COLLATE NOCASE ASC
      `).all();
      responderJson(response, 200, {
        ok: true,
        jugadores: rows.map((jugador, indice) => ({ posicion: indice + 1, ...jugador })),
      });
    } catch (error) {
      console.error("Error consultando puntuaciones:", error);
      responderJson(response, 500, { ok: false, error: "No se pudo cargar la tabla de puntuaciones." });
    }
    return;
  }

  if (apiPost && request.method === "POST") {
    const sesion = exigirSesion(request, response);
    if (!sesion) return;
    leerJson(request).then((data) => {
      const nivel = Number(data.nivel);
      if (!Number.isInteger(nivel) || nivel < 1 || nivel > 6) {
        responderJson(response, 422, { ok: false, error: "El nivel indicado no es válido." });
        return;
      }

      if (nivel > 1) {
        const anterior = database.prepare("SELECT 1 AS completado FROM niveles_puntuados WHERE jugador_id = ? AND nivel = ? LIMIT 1").get(sesion.jugadorId, nivel - 1);
        if (!anterior) {
          responderJson(response, 409, { ok: false, error: "Completá el planeta anterior antes de guardar este nivel." });
          return;
        }
      }

      database.prepare(`
        INSERT OR IGNORE INTO niveles_puntuados (jugador_id, nivel, puntos)
        VALUES (?, ?, 100)
      `).run(sesion.jugadorId, nivel);
      responderJson(response, 200, { ok: true });
    }).catch((error) => {
      responderJson(response, error.status || 400, { ok: false, error: error.message || "No se pudo guardar el puntaje." });
    });
    return;
  }

  response.setHeader("Allow", apiGet ? "GET, POST" : "POST");
  responderJson(response, 405, { ok: false, error: "Método no permitido." });
}

function manejarProgreso(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }
  const sesion = exigirSesion(request, response);
  if (!sesion) return;
  try {
    const rows = database.prepare(`
      SELECT nivel, puntos
      FROM niveles_puntuados
      WHERE jugador_id = ?
      ORDER BY nivel ASC
    `).all(sesion.jugadorId);
    const completados = rows.map((fila) => Number(fila.nivel));
    const puntuacion = rows.reduce((total, fila) => total + Number(fila.puntos), 0);
    responderJson(response, 200, {
      ok: true,
      completados,
      puntuacion,
      nivel: completados.length ? Math.min(6, Math.max(...completados) + 1) : 1,
    });
  } catch (error) {
    console.error("Error consultando progreso:", error);
    responderJson(response, 500, { ok: false, error: "No se pudo cargar el progreso del jugador." });
  }
}

function manejarReinicioProgreso(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }
  const sesion = exigirSesion(request, response);
  if (!sesion) return;
  try {
    database.prepare("DELETE FROM niveles_puntuados WHERE jugador_id = ?").run(sesion.jugadorId);
    responderJson(response, 200, { ok: true });
  } catch (error) {
    console.error("Error reiniciando progreso:", error);
    responderJson(response, 500, { ok: false, error: "No se pudo reiniciar el progreso de la cuenta." });
  }
}

function manejarCierreSesion(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }
  const token = leerTokenSesion(request);
  if (token) sessions.delete(token);
  response.setHeader("Set-Cookie", "nh_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  responderJson(response, 200, { ok: true });
}

const servidor = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    responderJson(response, 400, { ok: false, error: "Dirección inválida." });
    return;
  }

  if (pathname === "/" || pathname === "/index.html") {
    response.writeHead(302, { Location: "/html/Login.html" });
    response.end();
    return;
  }

  if (pathname === "/api/registrar.php" || pathname === "/api/iniciar-sesion.php") {
    manejarAutenticacion(request, response, pathname).catch((error) => {
      console.error("Error en autenticación:", error);
      if (!response.headersSent) responderJson(response, 500, { ok: false, error: "Ocurrió un error en el servidor." });
    });
    return;
  }

  if (pathname === "/api/cerrar-sesion.php") {
    manejarCierreSesion(request, response);
    return;
  }

  if (pathname === "/api/progreso.php") {
    manejarProgreso(request, response);
    return;
  }

  if (pathname === "/api/reiniciar-progreso.php") {
    manejarReinicioProgreso(request, response);
    return;
  }

  if (pathname === "/api/puntuaciones.php" || pathname === "/api/puntuaciones" || pathname === "/api/puntuaciones/nivel") {
    manejarPuntuaciones(request, response, pathname);
    return;
  }

  const lowerPathname = pathname.toLowerCase();
  if (lowerPathname.startsWith("/database/") || lowerPathname.endsWith(".php")) {
    responderJson(response, 404, { ok: false, error: "No se encontró el archivo." });
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    responderJson(response, 403, { ok: false, error: "Acceso denegado." });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      responderJson(response, error.code === "ENOENT" ? 404 : 500, { ok: false, error: error.code === "ENOENT" ? "No se encontró el archivo." : "No se pudo leer el archivo." });
      return;
    }
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    response.end(content);
  });
});

servidor.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${port} ya está ocupado. Detené el otro servidor con Ctrl+C o iniciá este con PORT=3001.`);
    process.exitCode = 1;
    return;
  }
  console.error("No se pudo iniciar el servidor:", error.message);
  process.exitCode = 1;
});

servidor.listen(port, host, () => {
  console.log(`Nuevo Hogar está en http://localhost:${port}/`);
  if (host === "0.0.0.0" || host === "::") {
    const direcciones = Object.values(os.networkInterfaces()).flat().filter((interfaz) =>
      interfaz && !interfaz.internal && (interfaz.family === "IPv4" || interfaz.family === 4)
    ).map((interfaz) => interfaz.address);
    direcciones.forEach((direccion) => console.log(`Acceso desde la red Wi-Fi: http://${direccion}:${port}/`));
  }
  console.log(`Las cuentas se guardan en ${databasePath}`);
  console.log("Presioná Ctrl+C para detener el servidor.");
});
