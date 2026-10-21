const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
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
    const jugador = database.prepare("SELECT usuario, contrasena_hash FROM jugadores WHERE usuario = ? LIMIT 1").get(usuario);
    if (!jugador || !(await verificarHash(contrasena, jugador.contrasena_hash))) {
      responderJson(response, 401, { ok: false, error: "Usuario o contraseña incorrectos." });
      return;
    }
    responderJson(response, 200, { ok: true, usuario: jugador.usuario });
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    responderJson(response, 500, { ok: false, error: "No se pudo iniciar sesión." });
  }
}

function manejarPuntuaciones(request, response, pathname) {
  if (pathname === "/api/puntuaciones" && request.method === "GET") {
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

  if (pathname === "/api/puntuaciones/nivel" && request.method === "POST") {
    leerJson(request).then((data) => {
      const usuario = String(data.usuario || "").trim();
      const nivel = Number(data.nivel);
      if (!usuario || !Number.isInteger(nivel) || nivel < 1 || nivel > 6) {
        responderJson(response, 422, { ok: false, error: "Usuario o nivel inválido." });
        return;
      }

      const jugador = database.prepare("SELECT id FROM jugadores WHERE usuario = ? LIMIT 1").get(usuario);
      if (!jugador) {
        responderJson(response, 404, { ok: false, error: "La cuenta no está registrada." });
        return;
      }

      database.prepare(`
        INSERT OR IGNORE INTO niveles_puntuados (jugador_id, nivel, puntos)
        VALUES (?, ?, 100)
      `).run(jugador.id, nivel);
      responderJson(response, 200, { ok: true });
    }).catch((error) => {
      responderJson(response, error.status || 400, { ok: false, error: error.message || "No se pudo guardar el puntaje." });
    });
    return;
  }

  response.setHeader("Allow", pathname === "/api/puntuaciones" ? "GET" : "POST");
  responderJson(response, 405, { ok: false, error: "Método no permitido." });
}

http.createServer((request, response) => {
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

  if (pathname === "/api/puntuaciones" || pathname === "/api/puntuaciones/nivel") {
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
}).listen(port, "127.0.0.1", () => {
  console.log(`Nuevo Hogar está en http://localhost:${port}/`);
  console.log(`Las cuentas se guardan en ${databasePath}`);
  console.log("Presioná Ctrl+C para detener el servidor.");
});
