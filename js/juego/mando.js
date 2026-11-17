/* Conexión de la página del juego con el puente del mando Android (servidor/mando.js).
   Muestra el código de sala y la IP en la esquina del escenario, recibe las órdenes
   del celular y le envía el estado de la partida. Si el puente no está corriendo,
   reintenta en silencio y el juego sigue funcionando con teclado y táctil. */

const PUERTO_MANDO = 3001;
const ACCIONES_CONTINUAS = ["left", "right", "jump", "jetpack"];

function codigoSala() {
  let codigo = null;
  try { codigo = sessionStorage.getItem("codigoMando"); } catch (_) { /* Sin almacenamiento: se genera uno nuevo. */ }
  if (!/^\d{4}$/.test(codigo || "")) {
    codigo = String(Math.floor(1000 + Math.random() * 9000));
    try { sessionStorage.setItem("codigoMando", codigo); } catch (_) { /* No es indispensable. */ }
  }
  return codigo;
}

export function conectarMando({ host, onControl, onAccion }) {
  /* GitHub Pages usa https y no puede abrir ws:// hacia la red local. */
  if (location.protocol !== "http:" || typeof WebSocket === "undefined" || !host) return { enviarEstado() {} };

  const sala = codigoSala();
  const insignia = document.createElement("div");
  insignia.className = "insignia-mando";
  insignia.hidden = true;
  insignia.setAttribute("aria-live", "polite");
  host.appendChild(insignia);

  let socket = null;
  let ips = [];
  let mandos = 0;
  let estado = {};
  let reintento = 1000;
  const remotas = new Set();

  function pintar(conectadoAlPuente) {
    if (!conectadoAlPuente) {
      insignia.hidden = true;
      return;
    }
    const ip = ips[0] || location.hostname;
    insignia.hidden = false;
    insignia.classList.toggle("activo", mandos > 0);
    insignia.textContent = mandos > 0
      ? "📱 MANDO CONECTADO · SALA " + sala
      : "📱 MANDO · IP " + ip + " · PUERTO " + PUERTO_MANDO + " · SALA " + sala;
    insignia.title = ips.length > 1 ? "Otras IP de esta PC: " + ips.slice(1).join(", ") : "";
  }

  function soltarRemotas() {
    remotas.forEach((accion) => onControl(accion, false));
    remotas.clear();
  }

  function enviar(mensaje) {
    if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(mensaje));
  }

  function recibir(evento) {
    let mensaje;
    try { mensaje = JSON.parse(evento.data); } catch (_) { return; }
    if (!mensaje || typeof mensaje !== "object") return;

    if (mensaje.tipo === "bienvenida") {
      ips = Array.isArray(mensaje.ips) ? mensaje.ips : [];
      pintar(true);
      enviar({ tipo: "estado", ...estado });
    } else if (mensaje.tipo === "mandos") {
      mandos = Number(mensaje.cantidad) || 0;
      if (mandos === 0) soltarRemotas();
      pintar(true);
      enviar({ tipo: "estado", ...estado });
    } else if (mensaje.tipo === "mandoDesconectado") {
      soltarRemotas();
    } else if (mensaje.tipo === "control" && ACCIONES_CONTINUAS.includes(mensaje.accion)) {
      const activo = mensaje.activo === true;
      if (activo) remotas.add(mensaje.accion); else remotas.delete(mensaje.accion);
      onControl(mensaje.accion, activo);
    } else if (mensaje.tipo === "accion" && (mensaje.accion === "ability" || mensaje.accion === "pause")) {
      onAccion(mensaje.accion);
    }
  }

  function abrir() {
    try {
      socket = new WebSocket("ws://" + location.hostname + ":" + PUERTO_MANDO + "/juego?sala=" + sala);
    } catch (_) {
      return;
    }
    socket.addEventListener("open", () => { reintento = 1000; });
    socket.addEventListener("message", recibir);
    socket.addEventListener("close", (evento) => {
      soltarRemotas();
      mandos = 0;
      pintar(false);
      if (evento.code === 4000) return; /* Otra pestaña tomó la sala. */
      window.setTimeout(abrir, reintento);
      reintento = Math.min(reintento * 2, 10000);
    });
    socket.addEventListener("error", () => { /* El cierre posterior programa el reintento. */ });
  }

  abrir();
  window.addEventListener("pagehide", () => socket?.close());

  return {
    /* Recibe solo los campos que cambiaron y evita enviar mensajes repetidos. */
    enviarEstado(cambios) {
      const siguiente = { ...estado, ...cambios };
      if (JSON.stringify(siguiente) === JSON.stringify(estado)) return;
      estado = siguiente;
      if (mandos > 0) enviar({ tipo: "estado", ...estado });
    },
  };
}
