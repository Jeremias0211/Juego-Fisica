/* Entrega de archivos estáticos con protección contra rutas externas,
   archivos privados y métodos no permitidos. */

const fs = require("node:fs");
const path = require("node:path");
const { root, contentTypes } = require("./config");
const { responderJson } = require("./respuestas");

const CARPETAS_BLOQUEADAS = new Set([
  ".git",
  ".vscode",
  ".idea",
  "database",
  "servidor",
  "scripts",
  "node_modules",
  "paquete-infinityfree",
  "despliegue",
]);

const ARCHIVOS_BLOQUEADOS = new Set([
  "server.js",
  "package.json",
  "package-lock.json",
  ".htaccess",
  ".gitignore",
  ".env",
  ".nojekyll",
  "paquete-infinityfree.zip",
]);

const EXTENSIONES_BLOQUEADAS = new Set([
  ".php",
  ".sqlite",
  ".sqlite3",
  ".sql",
  ".zip",
  ".log",
  ".env",
  ".bak",
  ".old",
  ".orig",
  ".md",
  ".ini",
  ".lock",
]);

let rootReal = root;
try {
  rootReal = fs.realpathSync(root);
} catch {
  /* Si falla, se mantiene la ruta configurada. */
}

function rutaBloqueada(pathname) {
  if (pathname.includes("\0") || pathname.includes("\\")) return true;

  const segmentos = pathname
    .split("/")
    .filter(Boolean)
    .map((segmento) => segmento.toLowerCase());

  if (segmentos.some((segmento) => segmento.startsWith("."))) return true;
  if (segmentos.some((segmento) => CARPETAS_BLOQUEADAS.has(segmento))) return true;
  if (segmentos[0] === "vendor" && segmentos[1] === "phpmailer") return true;

  const archivo = segmentos.at(-1) || "";
  if (ARCHIVOS_BLOQUEADOS.has(archivo)) return true;

  return EXTENSIONES_BLOQUEADAS.has(path.extname(archivo));
}

function servirEstatico(request, response, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }

  if (rutaBloqueada(pathname)) {
    responderJson(response, 404, { ok: false, error: "No se encontró el archivo." });
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== rootReal && !filePath.startsWith(`${rootReal}${path.sep}`)) {
    responderJson(response, 403, { ok: false, error: "Acceso denegado." });
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      responderJson(response, 404, { ok: false, error: "No se encontró el archivo." });
      return;
    }

    fs.realpath(filePath, (errorReal, rutaReal) => {
      if (
        errorReal ||
        (rutaReal !== rootReal && !rutaReal.startsWith(`${rootReal}${path.sep}`))
      ) {
        responderJson(response, 404, { ok: false, error: "No se encontró el archivo." });
        return;
      }

      const tipo = contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      response.writeHead(200, {
        "Content-Type": tipo,
        "Content-Length": stats.size,
        "Cache-Control": "no-cache",
        "Last-Modified": stats.mtime.toUTCString(),
      });

      if (request.method === "HEAD") {
        response.end();
        return;
      }

      const flujo = fs.createReadStream(filePath);
      flujo.on("error", () => response.destroy());
      flujo.pipe(response);
    });
  });
}

module.exports = { servirEstatico };
