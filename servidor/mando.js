/* Puente WebSocket entre el mando Android y la página del juego.
   El navegador no puede abrir un puerto, así que ambos se conectan acá:
     ws://IP:3001/juego?sala=1234  → la página Juego.html
     ws://IP:3001/mando?sala=1234  → la app Android
   El puente reenvía las órdenes del mando al juego y el estado del juego a los mandos de la misma sala. */

const http = require("node:http");
const os = require("node:os");
const { WebSocketServer, WebSocket } = require("ws");

const puertoMando = Number(process.env.MANDO_PORT) || 3001;
const hostMando = process.env.HOST || "0.0.0.0";

const ACCIONES_CONTINUAS = new Set(["left", "right", "jump", "jetpack"]);
const ACCIONES_UNICAS = new Set(["ability", "pause"]);

function direccionesLocales() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((interfaz) => interfaz && !interfaz.internal && (interfaz.family === "IPv4" || interfaz.family === 4))
    .map((interfaz) => interfaz.address);
}

function enviar(socket, mensaje) {
  if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(mensaje));
}

function leerJson(datos) {
  try {
    const mensaje = JSON.parse(datos.toString());
    return mensaje && typeof mensaje === "object" ? mensaje : null;
  } catch {
    return null;
  }
}

/* Valida lo que manda el celular y devuelve solo los campos conocidos. */
function normalizarOrdenMando(mensaje) {
  if (mensaje.tipo === "control" && ACCIONES_CONTINUAS.has(mensaje.accion) && typeof mensaje.activo === "boolean") {
    return { tipo: "control", accion: mensaje.accion, activo: mensaje.activo };
  }
  if (mensaje.tipo === "accion" && ACCIONES_UNICAS.has(mensaje.accion)) {
    return { tipo: "accion", accion: mensaje.accion };
  }
  return null;
}

function crearPuenteMando() {
  const salas = new Map();

  function obtenerSala(codigo) {
    if (!salas.has(codigo)) salas.set(codigo, { juego: null, mandos: new Set(), ultimoEstado: null });
    return salas.get(codigo);
  }

  function limpiarSala(codigo) {
    const sala = salas.get(codigo);
    if (sala && !sala.juego && sala.mandos.size === 0) salas.delete(codigo);
  }

  function avisarMandos(sala) {
    enviar(sala.juego, { tipo: "mandos", cantidad: sala.mandos.size });
  }

  const wss = new WebSocketServer({ noServer: true, maxPayload: 2048 });

  function conectarJuego(socket, codigo) {
    const sala = obtenerSala(codigo);
    if (sala.juego && sala.juego !== socket) sala.juego.close(4000, "Otra pestaña tomó esta sala");
    sala.juego = socket;
    sala.ultimoEstado = null;

    enviar(socket, { tipo: "bienvenida", sala: codigo, ips: direccionesLocales(), puerto: puertoMando });
    avisarMandos(sala);
    sala.mandos.forEach((mando) => enviar(mando, { tipo: "juego", conectado: true }));

    socket.on("message", (datos) => {
      const mensaje = leerJson(datos);
      if (!mensaje || mensaje.tipo !== "estado") return;
      sala.ultimoEstado = mensaje;
      sala.mandos.forEach((mando) => enviar(mando, mensaje));
    });

    socket.on("close", () => {
      if (sala.juego !== socket) return;
      sala.juego = null;
      sala.ultimoEstado = null;
      sala.mandos.forEach((mando) => enviar(mando, { tipo: "juego", conectado: false }));
      limpiarSala(codigo);
    });
  }

  function conectarMando(socket, codigo) {
    const sala = obtenerSala(codigo);
    sala.mandos.add(socket);

    enviar(socket, { tipo: "juego", conectado: Boolean(sala.juego) });
    if (sala.ultimoEstado) enviar(socket, sala.ultimoEstado);
    avisarMandos(sala);

    socket.on("message", (datos) => {
      const mensaje = leerJson(datos);
      if (!mensaje) return;
      if (mensaje.tipo === "ping") {
        enviar(socket, { tipo: "pong", t: mensaje.t });
        return;
      }
      const orden = normalizarOrdenMando(mensaje);
      if (orden) enviar(sala.juego, orden);
    });

    socket.on("close", () => {
      sala.mandos.delete(socket);
      /* Si el celular se corta con un botón apretado, el juego suelta las teclas remotas. */
      enviar(sala.juego, { tipo: "mandoDesconectado" });
      avisarMandos(sala);
      limpiarSala(codigo);
    });
  }

  const servidor = http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Puente del mando de Nuevo Hogar activo. Conectate por WebSocket a /juego o /mando.\n");
  });

  servidor.on("upgrade", (request, socket, head) => {
    let url;
    try {
      url = new URL(request.url, "http://localhost");
    } catch {
      socket.destroy();
      return;
    }
    const rol = url.pathname.replace(/^\/+|\/+$/g, "");
    const codigo = url.searchParams.get("sala") || "";
    if ((rol !== "juego" && rol !== "mando") || !/^\d{4}$/.test(codigo)) {
      socket.write("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.vivo = true;
      ws.on("pong", () => { ws.vivo = true; });
      ws.on("error", () => {});
      if (rol === "juego") conectarJuego(ws, codigo);
      else conectarMando(ws, codigo);
    });
  });

  /* Corta conexiones muertas (Wi-Fi caído, app cerrada sin aviso). */
  const latido = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.vivo) {
        ws.terminate();
        return;
      }
      ws.vivo = false;
      ws.ping();
    });
  }, 15000);
  servidor.on("close", () => clearInterval(latido));

  return servidor;
}

function iniciarPuenteMando() {
  const servidor = crearPuenteMando();

  servidor.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Mando: el puerto ${puertoMando} ya está ocupado. Elegí otro con MANDO_PORT=3002.`);
      return;
    }
    console.error("Mando: no se pudo iniciar el puente:", error.message);
  });

  servidor.listen(puertoMando, hostMando, () => {
    console.log(`Puente del mando Android escuchando en el puerto ${puertoMando}.`);
    direccionesLocales().forEach((ip) => console.log(`  Mando: IP ${ip} · puerto ${puertoMando}`));
  });

  return servidor;
}

module.exports = { crearPuenteMando, iniciarPuenteMando, puertoMando };

if (require.main === module) iniciarPuenteMando();
