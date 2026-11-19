/* Registro e inicio de sesión. */

const { database } = require("../base-datos");
const { responderJson, leerJson, exigirOrigen } = require("../respuestas");
const { crearHash, verificarHash, crearSesion } = require("../seguridad");
const { ipDe, limitarPeticion, olvidarLimite } = require("../limites");
const { normalizarCorreo, validarCuenta } = require("../validacion-cuenta");

const MAX_CONTRASENA = 200;

function usuarioValido(usuario) {
  return usuario.length >= 3 &&
    [...usuario].length <= 40 &&
    !/[\u0000-\u001f\u007f]/.test(usuario);
}

async function manejarAutenticacion(request, response, pathname) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }

  if (!exigirOrigen(request, response)) return;

  const ip = ipDe(request);
  if (!limitarPeticion(request, response, `auth:${ip}`, 30, 5 * 60 * 1000)) return;

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
    if (!limitarPeticion(request, response, `registro:${ip}`, 10, 60 * 60 * 1000)) return;

    const correo = normalizarCorreo(data.correo);
    const revision = validarCuenta(usuario, correo, contrasena);

    if (!usuarioValido(usuario)) {
      responderJson(response, 422, { ok: false, error: "El usuario debe tener entre 3 y 40 caracteres." });
      return;
    }
    if (!revision.ok) {
      responderJson(response, 422, { ok: false, error: revision.error });
      return;
    }

    try {
      const hash = await crearHash(contrasena);
      const resultado = database
        .prepare("INSERT INTO jugadores (usuario, correo, contrasena_hash) VALUES (?, ?, ?)")
        .run(usuario, revision.correo, hash);
      crearSesion(request, response, Number(resultado.lastInsertRowid));
      responderJson(response, 201, { ok: true, usuario, correo: revision.correo });
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

  if ([...usuario].length > 40 || [...contrasena].length > MAX_CONTRASENA) {
    responderJson(response, 401, { ok: false, error: "Usuario o contraseña incorrectos." });
    return;
  }

  const claveLimite = `login-usuario:${ip}:${usuario.toLowerCase()}`;
  if (!limitarPeticion(request, response, claveLimite, 10, 10 * 60 * 1000)) return;

  try {
    const jugador = database.prepare("SELECT id, usuario, contrasena_hash FROM jugadores WHERE usuario = ? LIMIT 1").get(usuario);
    if (!jugador || !(await verificarHash(contrasena, jugador.contrasena_hash))) {
      responderJson(response, 401, { ok: false, error: "Usuario o contraseña incorrectos." });
      return;
    }
    olvidarLimite(claveLimite);
    crearSesion(request, response, jugador.id);
    responderJson(response, 200, { ok: true, usuario: jugador.usuario });
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    responderJson(response, 500, { ok: false, error: "No se pudo iniciar sesión." });
  }
}

module.exports = { manejarAutenticacion };
