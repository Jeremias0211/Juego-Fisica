/* Base local del juego (localStorage). Para publicar con varios dispositivos, reemplazar por una API y una base de datos de servidor. */
(() => {
  const DB_KEY = "nuevoHogarDB";
  const empty = () => ({ version: 1, jugadores: [] });
  function read() {
    try { const data = JSON.parse(localStorage.getItem(DB_KEY) || "null"); if (data && Array.isArray(data.jugadores)) return data; } catch (_) { }
    const db = empty();
    try { const old = JSON.parse(localStorage.getItem("usuario") || "null"); if (old && old.usuario) db.jugadores.push({ id: old.usuario.toLowerCase(), usuario: old.usuario, correo: old.correo || "", contrasena: old.contrasena, progreso: { nivel: 1, completados: [], puntuacion: 0 }, creado: new Date().toISOString() }); } catch (_) { }
    write(db); return db;
  }
  function write(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  function ensureSessionPlayer(db, name) {
    const usuario = String(name || "").trim();
    const normalized = usuario.toLowerCase();
    if (!normalized) return null;
    let player = db.jugadores.find(p => p.usuario.toLowerCase() === normalized);
    if (player) return player;

    const sesionActiva = localStorage.getItem("sesionActiva") === "true";
    const usuarioAutenticado = String(localStorage.getItem("jugadorActual") || "").trim();
    if (!sesionActiva || usuarioAutenticado.toLowerCase() !== normalized) return null;

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
  function find(name) { return ensureSessionPlayer(read(), name); }
  function create({ usuario, correo, contrasena }) {
    const db = read();
    if (db.jugadores.some(p => p.usuario.toLowerCase() === usuario.trim().toLowerCase())) return { ok: false, error: "Ese usuario ya está registrado." };
    const player = { id: usuario.trim().toLowerCase(), usuario: usuario.trim(), correo: correo.trim(), contrasena, progreso: { nivel: 1, completados: [], puntuacion: 0, combustible: 100, nivelActivo: null }, creado: new Date().toISOString() };
    db.jugadores.push(player); write(db); return { ok: true, player };
  }
  function startLevel(name, level, cost = 15) {
    const db = read(), player = ensureSessionPlayer(db, name);
    if (!player) return { ok: false, error: "No se encontró el jugador." };
    const progreso = player.progreso || (player.progreso = { nivel: 1, completados: [], puntuacion: 0 });
    if (!Array.isArray(progreso.completados)) progreso.completados = [];
    if (progreso.combustible == null || !Number.isFinite(Number(progreso.combustible))) progreso.combustible = 100;
    const nivel = Number(level);
    const combustible = Math.max(0, Math.min(100, Number(progreso.combustible)));
    progreso.combustible = combustible;

    if (progreso.completados.includes(nivel)) return { ok: true, combustible, cobrado: false, repetido: true };
    if (Number(progreso.nivelActivo) === nivel) return { ok: true, combustible, cobrado: false, repetido: false };
    if (combustible < cost) {
      write(db);
      return { ok: false, combustible, error: "No hay combustible suficiente para iniciar esta misión." };
    }

    progreso.combustible = combustible - cost;
    progreso.nivelActivo = nivel;
    progreso.actualizado = new Date().toISOString();
    write(db);
    return { ok: true, combustible: progreso.combustible, cobrado: true, repetido: false };
  }
  function complete(name, level, score) {
    const db = read(), player = ensureSessionPlayer(db, name);
    if (!player) return false;
    const progreso = player.progreso || (player.progreso = { nivel: 1, completados: [], puntuacion: 0 });
    if (progreso.combustible == null || !Number.isFinite(Number(progreso.combustible))) progreso.combustible = 100;
    const done = new Set(progreso.completados || []), nivel = Number(level), wasComplete = done.has(nivel);
    done.add(nivel);
    player.progreso.completados = [...done].sort((a, b) => a - b);
    progreso.nivel = Math.min(6, Math.max(progreso.nivel || 1, nivel + 1));
    if (!wasComplete) {
      progreso.puntuacion = (progreso.puntuacion || 0) + Number(score || 0);
      progreso.combustible = Math.min(100, progreso.combustible + 10);
    }
    if (Number(progreso.nivelActivo) === nivel) progreso.nivelActivo = null;
    progreso.actualizado = new Date().toISOString(); write(db); return true;
  }
  function progress(name) {
    const p = find(name);
    const progreso = p ? Object.assign({ nivel: 1, completados: [], puntuacion: 0, combustible: 100, nivelActivo: null }, p.progreso || {}) : { nivel: 1, completados: [], puntuacion: 0, combustible: 100, nivelActivo: null };
    if (!Array.isArray(progreso.completados)) progreso.completados = [];
    if (progreso.combustible == null || !Number.isFinite(Number(progreso.combustible))) progreso.combustible = 100;
    return progreso;
  }
  window.JuegoDB = { read, find, create, startLevel, complete, progress };
})();
