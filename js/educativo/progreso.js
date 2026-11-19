/* Progreso educativo local, separado del progreso del juego.
   Se guarda por usuario para no mezclar cuentas ni el modo invitado.
   Esta capa funciona sin backend y no toca MySQL. */

export const CLAVE = "nuevoHogarEducativo:v1";
const VERSION = 1;

function base() {
  return { version: VERSION, jugadores: {} };
}

function normalizar(usuario) {
  const valor = String(usuario || "invitado").trim().toLowerCase();
  return valor || "invitado";
}

function almacenDisponible() {
  try {
    return Boolean(globalThis.localStorage);
  } catch (_) {
    return false;
  }
}

export function leerTodo() {
  if (!almacenDisponible()) return base();
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (datos && typeof datos === "object" && datos.jugadores && typeof datos.jugadores === "object") {
      return { version: Number(datos.version) || VERSION, jugadores: datos.jugadores };
    }
  } catch (_) {
    /* Si el almacenamiento está bloqueado o corrupto, se usa una base vacía. */
  }
  return base();
}

function escribirTodo(datos) {
  if (!almacenDisponible()) return false;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
    return true;
  } catch (_) {
    return false;
  }
}

function asegurarJugador(datos, usuario) {
  const clave = normalizar(usuario);
  if (!datos.jugadores[clave] || typeof datos.jugadores[clave] !== "object") {
    datos.jugadores[clave] = {};
  }
  const jugador = datos.jugadores[clave];
  if (!jugador.fichas || typeof jugador.fichas !== "object") jugador.fichas = {};
  if (!jugador.conceptos || typeof jugador.conceptos !== "object") jugador.conceptos = {};
  if (!jugador.experimentos || typeof jugador.experimentos !== "object") jugador.experimentos = {};
  if (!jugador.logros || typeof jugador.logros !== "object") jugador.logros = {};
  if (!jugador.quiz || typeof jugador.quiz !== "object") {
    jugador.quiz = { mejorPuntaje: 0, intentos: [] };
  }
  if (!Number.isFinite(Number(jugador.quiz.mejorPuntaje))) jugador.quiz.mejorPuntaje = 0;
  if (!Array.isArray(jugador.quiz.intentos)) jugador.quiz.intentos = [];
  return jugador;
}

export function obtenerProgreso(usuario) {
  const datos = leerTodo();
  const jugador = asegurarJugador(datos, usuario);
  return {
    fichas: { ...jugador.fichas },
    conceptos: { ...jugador.conceptos },
    quiz: {
      mejorPuntaje: Number(jugador.quiz.mejorPuntaje) || 0,
      intentos: [...jugador.quiz.intentos]
    },
    experimentos: { ...jugador.experimentos },
    logros: { ...jugador.logros }
  };
}

export function marcarFichaVista(usuario, id) {
  if (!id) return false;
  const datos = leerTodo();
  const jugador = asegurarJugador(datos, usuario);
  const anterior = jugador.fichas[id];
  jugador.fichas[id] = {
    vista: true,
    fecha: anterior?.fecha || new Date().toISOString()
  };
  return escribirTodo(datos);
}

export function fichaVista(usuario, id) {
  const progreso = obtenerProgreso(usuario);
  return Boolean(progreso.fichas[id]?.vista);
}

export function contarFichasVistas(usuario, ids = []) {
  const progreso = obtenerProgreso(usuario);
  return ids.filter((id) => Boolean(progreso.fichas[id]?.vista)).length;
}

export function marcarConceptoVisto(usuario, id) {
  if (!id) return false;
  const datos = leerTodo();
  const jugador = asegurarJugador(datos, usuario);
  jugador.conceptos[id] = {
    visto: true,
    fecha: jugador.conceptos[id]?.fecha || new Date().toISOString()
  };
  return escribirTodo(datos);
}

export function marcarExperimentoUsado(usuario, id) {
  if (!id) return false;
  const datos = leerTodo();
  const jugador = asegurarJugador(datos, usuario);
  jugador.experimentos[id] = {
    usado: true,
    fecha: jugador.experimentos[id]?.fecha || new Date().toISOString()
  };
  return escribirTodo(datos);
}

export function guardarIntentoQuiz(usuario, { puntaje = 0, total = 0, modo = "general" } = {}) {
  const datos = leerTodo();
  const jugador = asegurarJugador(datos, usuario);
  const numeroPuntaje = Math.max(0, Math.min(100, Number(puntaje) || 0));
  const numeroTotal = Math.max(0, Number(total) || 0);
  const intento = {
    fecha: new Date().toISOString(),
    puntaje: numeroPuntaje,
    total: numeroTotal,
    modo: String(modo || "general")
  };
  jugador.quiz.intentos.unshift(intento);
  jugador.quiz.intentos = jugador.quiz.intentos.slice(0, 20);
  jugador.quiz.mejorPuntaje = Math.max(Number(jugador.quiz.mejorPuntaje) || 0, numeroPuntaje);
  const guardado = escribirTodo(datos);
  return { guardado, intento, mejorPuntaje: jugador.quiz.mejorPuntaje };
}

export function otorgarLogro(usuario, id) {
  if (!id) return false;
  const datos = leerTodo();
  const jugador = asegurarJugador(datos, usuario);
  if (jugador.logros[id]?.obtenidoEn) return false;
  jugador.logros[id] = { obtenidoEn: new Date().toISOString() };
  escribirTodo(datos);
  return true;
}

export function logroObtenido(usuario, id) {
  return Boolean(obtenerProgreso(usuario).logros[id]?.obtenidoEn);
}
