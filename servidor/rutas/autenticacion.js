/* Registro e inicio de sesión. */

const { database } = require("../base-datos");
const { responderJson, leerJson } = require("../respuestas");
const { crearHash, verificarHash, crearSesion } = require("../seguridad");

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

module.exports = { manejarAutenticacion };
