/* Contraseñas seguras y sesiones en memoria para el servidor Node. */

const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const { responderJson } = require("./respuestas");

const deriveKey = promisify(scrypt);
const sessions = new Map();

async function crearHash(contrasena) {
  const salt = randomBytes(16);
  const hash = await deriveKey(contrasena, salt, 64);
  return `scrypt$${salt.toString("hex")}$${Buffer.from(hash).toString("hex")}`;
}

async function verificarHash(contrasena, guardado) {
  const [algoritmo, saltHex, hashHex] = guardado.split("$");
  if (algoritmo !== "scrypt" || !/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{128}$/i.test(hashHex)) {
    return false;
  }
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

function eliminarSesion(token) {
  if (token) sessions.delete(token);
}

module.exports = {
  crearHash,
  verificarHash,
  leerTokenSesion,
  crearSesion,
  exigirSesion,
  eliminarSesion,
};
