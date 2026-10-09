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
  function find(name) { return read().jugadores.find(p => p.usuario.toLowerCase() === String(name).trim().toLowerCase()); }
  function create({ usuario, correo, contrasena }) {
    const db = read();
    if (db.jugadores.some(p => p.usuario.toLowerCase() === usuario.trim().toLowerCase())) return { ok: false, error: "Ese usuario ya está registrado." };
    const player = { id: usuario.trim().toLowerCase(), usuario: usuario.trim(), correo: correo.trim(), contrasena, progreso: { nivel: 1, completados: [], puntuacion: 0 }, creado: new Date().toISOString() };
    db.jugadores.push(player); write(db); return { ok: true, player };
  }
  function complete(name, level, score) {
    const db = read(), player = db.jugadores.find(p => p.usuario.toLowerCase() === String(name).toLowerCase());
    if (!player) return false;
    const done = new Set(player.progreso.completados || []); done.add(Number(level));
    player.progreso.completados = [...done].sort((a, b) => a - b);
    player.progreso.nivel = Math.min(6, Math.max(player.progreso.nivel || 1, Number(level) + 1));
    player.progreso.puntuacion = (player.progreso.puntuacion || 0) + Number(score || 0);
    player.progreso.actualizado = new Date().toISOString(); write(db); return true;
  }
  function progress(name) { const p = find(name); return p ? p.progreso : { nivel: 1, completados: [], puntuacion: 0 }; }
  window.JuegoDB = { read, find, create, complete, progress };
})();
