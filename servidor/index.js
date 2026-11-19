/* Servidor HTTP alternativo: enruta la API y entrega los archivos del juego. */

const http = require("node:http");
const os = require("node:os");
const { host, port, databasePath } = require("./config");
const { responderJson } = require("./respuestas");
const { aplicarCabeceras } = require("./cabeceras");
const { ipDe, limitarPeticion } = require("./limites");
const { manejarAutenticacion } = require("./rutas/autenticacion");
const { manejarPuntuaciones } = require("./rutas/puntuaciones");
const {
  manejarProgreso,
  manejarReinicioProgreso,
  manejarCierreSesion,
} = require("./rutas/progreso");
const { servirEstatico } = require("./estaticos");

const METODOS_PERMITIDOS = new Set(["GET", "HEAD", "POST"]);

function crearServidor() {
  const servidor = http.createServer((request, response) => {
    aplicarCabeceras(request, response);

    if (!METODOS_PERMITIDOS.has(request.method)) {
      response.setHeader("Allow", "GET, HEAD, POST");
      responderJson(response, 405, { ok: false, error: "Método no permitido." });
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      responderJson(response, 400, { ok: false, error: "Dirección inválida." });
      return;
    }

    if (pathname === "/" || pathname === "/index.html") {
      response.writeHead(302, { Location: "/html/Login.html" });
      response.end();
      return;
    }

    if (
      pathname.startsWith("/api/") &&
      !limitarPeticion(request, response, `api:${ipDe(request)}`, 300, 60 * 1000)
    ) {
      return;
    }

    if (pathname === "/api/registrar.php" || pathname === "/api/iniciar-sesion.php") {
      manejarAutenticacion(request, response, pathname).catch((error) => {
        console.error("Error en autenticación:", error);
        if (!response.headersSent) {
          responderJson(response, 500, { ok: false, error: "Ocurrió un error en el servidor." });
        }
      });
      return;
    }

    if (pathname === "/api/cerrar-sesion.php") {
      manejarCierreSesion(request, response);
      return;
    }

    if (pathname === "/api/progreso.php") {
      manejarProgreso(request, response);
      return;
    }

    if (pathname === "/api/reiniciar-progreso.php") {
      manejarReinicioProgreso(request, response);
      return;
    }

    if (pathname === "/api/puntuaciones.php" || pathname === "/api/puntuaciones" || pathname === "/api/puntuaciones/nivel") {
      manejarPuntuaciones(request, response, pathname);
      return;
    }

    servirEstatico(request, response, pathname);
  });

  servidor.headersTimeout = 20000;
  servidor.requestTimeout = 30000;
  servidor.keepAliveTimeout = 5000;
  servidor.maxHeadersCount = 100;

  servidor.on("clientError", (error, socket) => {
    if (socket.writable) {
      socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
    } else {
      socket.destroy();
    }
  });

  return servidor;
}

function iniciarServidor() {
  const servidor = crearServidor();

  servidor.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`El puerto ${port} ya está ocupado. Detené el otro servidor con Ctrl+C o iniciá este con PORT=3001.`);
      process.exitCode = 1;
      return;
    }
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exitCode = 1;
  });

  servidor.listen(port, host, () => {
    console.log(`Nuevo Hogar está en http://localhost:${port}/`);
    if (host === "0.0.0.0" || host === "::") {
      const direcciones = Object.values(os.networkInterfaces())
        .flat()
        .filter((interfaz) => interfaz && !interfaz.internal && (interfaz.family === "IPv4" || interfaz.family === 4))
        .map((interfaz) => interfaz.address);
      direcciones.forEach((direccion) => console.log(`Acceso desde la red Wi-Fi: http://${direccion}:${port}/`));
    }
    console.log(`Las cuentas se guardan en ${databasePath}`);
    console.log("Presioná Ctrl+C para detener el servidor.");
  });

  return servidor;
}

module.exports = { crearServidor, iniciarServidor };
