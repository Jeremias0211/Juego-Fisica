/* Contraseñas seguras y sesiones en memoria para el servidor Node. */

const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const { responderJson } = require("./respuestas");
const { esHttps } = require("./cabeceras");

const deriveKey = promisify(scrypt);
const sessions = new Map();
const DURACION_SESION_MS = 12 * 60 * 60 * 1000;
const MAX_SESIONES = 10000;

async function crearHash(contrasena) {
  const salt = randomBytes(16);
  const hash = await deriveKey(contrasena, salt, 64);
  return `scrypt$${salt.toString("hex")}$${Buffer.from(hash).toString("hex")}`;
}

async function verificarHash(contrasena, guardado) {
  const [algoritmo, saltHex, hashHex] = String(guardado).split("$");
  if (algoritmo !== "scrypt" || !/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{128}$/i.test(hashHex)) {
    return false;
  }
  const esperado = Buffer.from(hashHex, "hex");
  const actual = Buffer.from(await deriveKey(contrasena, Buffer.from(saltHex, "hex"), esperado.length));
  return timingSafeEqual(actual, esperado);
}

function leerTokenSesion(request) {
  const cookie = request.headers.cookie || "";
  const encontrado = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("nh_session="));
  return encontrado ? decodeURIComponent(encontrado.slice("nh_session=".length)) : "";
}

function atributosCookie(request) {
  return `HttpOnly; SameSite=Lax; Path=/${esHttps(request) ? "; Secure" : ""}`;
}

function crearSesion(request, response, jugadorId) {
  if (sessions.size >= MAX_SESIONES) {
    const primera = sessions.keys().next().value;
    if (primera) sessions.delete(primera);
  }

  const token = randomBytes(32).toString("hex");
  sessions.set(token, { jugadorId, expira: Date.now() + DURACION_SESION_MS });
  response.setHeader("Set-Cookie", `nh_session=${token}; ${atributosCookie(request)}`);
}

function exigirSesion(request, response) {
  const token = leerTokenSesion(request);
  const sesion = token ? sessions.get(token) : null;

  if (!sesion || sesion.expira <= Date.now()) {
    if (sesion) sessions.delete(token);
    responderJson(response, 401, { ok: false, error: "Iniciá sesión para guardar tu progreso." });
    return null;
  }

  return { token, jugadorId: sesion.jugadorId };
}

function eliminarSesion(token) {
  if (token) sessions.delete(token);
}

function borrarCookieSesion(request, response) {
  response.setHeader("Set-Cookie", `nh_session=; ${atributosCookie(request)}; Max-Age=0`);
}

const limpiador = setInterval(() => {
  const ahora = Date.now();
  for (const [token, sesion] of sessions) {
    if (sesion.expira <= ahora) sessions.delete(token);
  }
}, 30 * 60 * 1000);
limpiador.unref?.();

module.exports = {
  crearHash,
  verificarHash,
  leerTokenSesion,
  crearSesion,
  exigirSesion,
  eliminarSesion,
  borrarCookieSesion,
};
