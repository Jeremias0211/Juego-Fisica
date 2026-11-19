/* Límites de intentos en memoria para el servidor Node.
   No reemplazan un WAF, pero frenan fuerza bruta y abuso de endpoints. */

const { responderJson } = require("./respuestas");

const ventanas = new Map();
const LIMPIEZA_MS = 10 * 60 * 1000;

function ipDe(request) {
  return request.socket?.remoteAddress || "desconocida";
}

function limitar(clave, maximo, ventanaMs) {
  const ahora = Date.now();
  let registro = ventanas.get(clave);

  if (!registro || ahora - registro.inicio >= ventanaMs) {
    registro = { inicio: ahora, cuenta: 0 };
    ventanas.set(clave, registro);
  }

  registro.cuenta += 1;
  return {
    permitido: registro.cuenta <= maximo,
    restante: Math.max(0, Math.ceil((registro.inicio + ventanaMs - ahora) / 1000)),
  };
}

function limitarPeticion(request, response, clave, maximo, ventanaMs) {
  const resultado = limitar(clave, maximo, ventanaMs);
  if (resultado.permitido) return true;

  response.setHeader("Retry-After", String(resultado.restante));
  responderJson(response, 429, {
    ok: false,
    error: "Demasiados intentos. Esperá unos minutos y volvé a probar.",
  });
  return false;
}

function olvidarLimite(clave) {
  ventanas.delete(clave);
}

const limpiador = setInterval(() => {
  const ahora = Date.now();
  for (const [clave, registro] of ventanas) {
    if (ahora - registro.inicio >= LIMPIEZA_MS) ventanas.delete(clave);
  }
}, LIMPIEZA_MS);
limpiador.unref?.();

module.exports = { ipDe, limitar, limitarPeticion, olvidarLimite };
