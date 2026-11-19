/* Validación de correo y contraseña para crear una cuenta.
   Se usa en el navegador y replica las mismas reglas del servidor Node y PHP.
   No valida el inicio de sesión: las cuentas existentes conservan su acceso. */

export const MIN_CONTRASENA = 8;
export const MAX_CONTRASENA = 200;
export const MAX_CORREO = 254;

const RE_CORREO = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

/* Dominios desechables habituales. La lista es estática: no consulta DNS. */
const DOMINIOS_DESECHABLES = new Set([
  "10mail.org",
  "10minutemail.com",
  "10minutemail.net",
  "1secmail.com",
  "1secmail.net",
  "1secmail.org",
  "burnermail.io",
  "discard.email",
  "discardmail.com",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "eyepaste.com",
  "fakeinbox.com",
  "getnada.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "harakirimail.com",
  "inboxkitten.com",
  "linshiyouxiang.net",
  "mailcatch.com",
  "maildrop.cc",
  "mailinator.com",
  "mailinator.net",
  "mailinator2.com",
  "mailnesia.com",
  "mailpoof.com",
  "mailsac.com",
  "mintemail.com",
  "moakt.com",
  "mohmal.com",
  "mytemp.email",
  "nada.email",
  "sharklasers.com",
  "sogetthis.com",
  "spam4.me",
  "spamgourmet.com",
  "temp-mail.org",
  "tempinbox.com",
  "tempmail.com",
  "tempmail.net",
  "throwawaymail.com",
  "tmail.ws",
  "tmpmail.net",
  "tmpmail.org",
  "trashmail.com",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net"
]);

const DOMINIOS_RESERVADOS = new Set([
  "example.com",
  "example.net",
  "example.org",
  "example.edu",
  "localhost",
  "localhost.localdomain"
]);

const TLD_RESERVADOS = [".test", ".example", ".invalid", ".localhost", ".local", ".onion"];

/* Claves comunes ya normalizadas: minúsculas y solo letras/números. */
const CLAVES_COMUNES = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "11111111",
  "00000000",
  "87654321",
  "abc12345",
  "abc123456",
  "admin123",
  "admin1234",
  "asdfghjk",
  "barcelona",
  "contrasena",
  "contrasena1",
  "contrasena123",
  "espacio123",
  "fisica123",
  "futbol123",
  "hola1234",
  "iloveyou",
  "monkey123",
  "nuevohogar",
  "password",
  "password1",
  "password12",
  "password123",
  "planeta123",
  "qwerty123",
  "qwertyui",
  "riverplate",
  "superman",
  "universo",
  "universo123",
  "welcome1",
  "welcome123"
]);

function normalizarComparacion(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function normalizarCorreo(correo) {
  return String(correo || "").trim().toLowerCase();
}

export function validarCorreo(correo) {
  const valor = normalizarCorreo(correo);

  if (!valor) return { ok: false, error: "Ingresá un correo electrónico." };
  if (valor.length > MAX_CORREO) {
    return { ok: false, error: "El correo no puede superar los 254 caracteres." };
  }

  const arroba = valor.lastIndexOf("@");
  if (arroba < 1 || arroba === valor.length - 1) {
    return { ok: false, error: "Ingresá un correo electrónico válido." };
  }

  const local = valor.slice(0, arroba);
  const dominio = valor.slice(arroba + 1);

  if (
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..") ||
    !RE_CORREO.test(valor)
  ) {
    return { ok: false, error: "Ingresá un correo electrónico válido." };
  }

  if (dominio.length > 253 || !dominio.includes(".")) {
    return { ok: false, error: "Ingresá un correo electrónico válido." };
  }

  const tld = dominio.split(".").pop();
  if (!tld || tld.length < 2) {
    return { ok: false, error: "Ingresá un correo electrónico válido." };
  }

  if (DOMINIOS_DESECHABLES.has(dominio)) {
    return { ok: false, error: "Usá un correo permanente: ese dominio es temporal." };
  }

  if (
    DOMINIOS_RESERVADOS.has(dominio) ||
    TLD_RESERVADOS.some((sufijo) => dominio.endsWith(sufijo))
  ) {
    return { ok: false, error: "Ese dominio está reservado para ejemplos. Usá tu correo real." };
  }

  return { ok: true, correo: valor };
}

export function validarContrasena(clave, usuario = "", correo = "") {
  const valor = String(clave || "");
  const largo = [...valor].length;

  if (largo < MIN_CONTRASENA || largo > MAX_CONTRASENA) {
    return {
      ok: false,
      error: `La contraseña debe tener entre ${MIN_CONTRASENA} y ${MAX_CONTRASENA} caracteres.`
    };
  }

  if (/[\u0000-\u001f\u007f]/.test(valor)) {
    return { ok: false, error: "La contraseña contiene caracteres no permitidos." };
  }

  if (valor !== valor.trim()) {
    return { ok: false, error: "La contraseña no puede empezar ni terminar con espacios." };
  }

  if (!/\p{L}/u.test(valor) || !/\p{Nd}/u.test(valor)) {
    return { ok: false, error: "La contraseña debe incluir al menos una letra y un número." };
  }

  if (/^(.)\1+$/u.test(valor)) {
    return { ok: false, error: "La contraseña no puede ser un solo carácter repetido." };
  }

  const base = normalizarComparacion(valor);
  if (CLAVES_COMUNES.has(base)) {
    return { ok: false, error: "Esa contraseña es demasiado común. Elegí una más difícil de adivinar." };
  }

  const baseUsuario = normalizarComparacion(usuario);
  if (baseUsuario.length >= 3 && base.includes(baseUsuario)) {
    return { ok: false, error: "La contraseña no puede contener tu nombre de usuario." };
  }

  const correoNormalizado = normalizarCorreo(correo);
  const localCorreo = correoNormalizado.split("@")[0] || "";
  const baseCorreo = normalizarComparacion(localCorreo);
  if (baseCorreo.length >= 3 && base.includes(baseCorreo)) {
    return { ok: false, error: "La contraseña no puede contener tu correo electrónico." };
  }

  return { ok: true };
}

export function validarCuenta(usuario, correo, clave) {
  const revisionCorreo = validarCorreo(correo);
  if (!revisionCorreo.ok) return revisionCorreo;

  const revisionClave = validarContrasena(clave, usuario, revisionCorreo.correo);
  if (!revisionClave.ok) return revisionClave;

  return { ok: true, correo: revisionCorreo.correo };
}
