/* Credenciales locales para la demo estática sin backend PHP.
   No se guardan contraseñas en texto plano: se guarda un hash con sal.
   Esto es una comodidad para la demo; las cuentas reales viven en MySQL/SQLite. */

const KEY = "nuevoHogarCredenciales";

function leer() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    return data && typeof data === "object" ? data : {};
  } catch (_) {
    return {};
  }
}

function escribir(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function aHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function crearSal() {
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return aHex(bytes);
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

async function hashClave(clave, sal) {
  const texto = `${sal}:${clave}`;
  if (globalThis.crypto?.subtle) {
    const datos = new TextEncoder().encode(texto);
    const digest = await crypto.subtle.digest("SHA-256", datos);
    return aHex(new Uint8Array(digest));
  }

  /* Respaldo simple para navegadores muy viejos o contextos sin Web Crypto. */
  let hash = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return "simple-" + (hash >>> 0).toString(16);
}

export async function guardarCredencial(usuario, clave) {
  const nombre = String(usuario || "").trim().toLowerCase();
  if (!nombre) return false;
  const sal = crearSal();
  const data = leer();
  data[nombre] = {
    sal,
    hash: await hashClave(clave, sal),
    creado: new Date().toISOString(),
  };
  escribir(data);
  return true;
}

export async function verificarCredencial(usuario, clave) {
  const nombre = String(usuario || "").trim().toLowerCase();
  const data = leer();
  const registro = data[nombre];
  if (!registro) {
    return {
      ok: false,
      error: "No hay una cuenta local con ese usuario en este dispositivo. Creá una cuenta o usá el modo invitado.",
    };
  }
  const hash = await hashClave(clave, registro.sal || "");
  if (hash !== registro.hash) {
    return { ok: false, error: "Contraseña incorrecta." };
  }
  return { ok: true };
}
