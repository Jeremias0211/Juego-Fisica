/* Almacén local de jugadores y progreso en localStorage. */

export const DB_KEY = "nuevoHogarDB";

const empty = () => ({ version: 1, jugadores: [] });

export function read() {
  try {
    const data = JSON.parse(localStorage.getItem(DB_KEY) || "null");
    if (data && Array.isArray(data.jugadores)) return data;
  } catch (_) { /* localStorage puede estar bloqueado o tener datos corruptos. */ }

  const db = empty();
  try {
    const old = JSON.parse(localStorage.getItem("usuario") || "null");
    if (old && old.usuario) {
      db.jugadores.push({
        id: old.usuario.toLowerCase(),
        usuario: old.usuario,
        correo: old.correo || "",
        progreso: { nivel: 1, completados: [], puntuacion: 0 },
        creado: new Date().toISOString(),
      });
    }
  } catch (_) { /* El formato anterior era opcional. */ }
  write(db);
  return db;
}

export function write(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function ensureSessionPlayer(db, name) {
  const usuario = String(name || "").trim();
  const normalized = usuario.toLowerCase();
  if (!normalized) return null;

  let player = db.jugadores.find((p) => p.usuario.toLowerCase() === normalized);
  if (player) return player;

  const sesionActiva = localStorage.getItem("sesionActiva") === "true";
  const modoInvitado = localStorage.getItem("modoInvitado") === "true";
  const usuarioAutenticado = String(localStorage.getItem("jugadorActual") || "").trim();
  if ((!sesionActiva && !modoInvitado) || usuarioAutenticado.toLowerCase() !== normalized) return null;

  player = {
    id: normalized,
    usuario,
    correo: "",
    progreso: { nivel: 1, completados: [], puntuacion: 0, combustible: 100, nivelActivo: null },
    creado: new Date().toISOString(),
  };
  db.jugadores.push(player);
  write(db);
  return player;
}

export function find(name) {
  return ensureSessionPlayer(read(), name);
}

export function create({ usuario, correo }) {
  const db = read();
  if (db.jugadores.some((p) => p.usuario.toLowerCase() === usuario.trim().toLowerCase())) {
    return { ok: false, error: "Ese usuario ya está registrado." };
  }
  const player = {
    id: usuario.trim().toLowerCase(),
    usuario: usuario.trim(),
    correo: correo.trim(),
    progreso: { nivel: 1, completados: [], puntuacion: 0, combustible: 100, nivelActivo: null },
    creado: new Date().toISOString(),
  };
  db.jugadores.push(player);
  write(db);
  return { ok: true, player };
}
