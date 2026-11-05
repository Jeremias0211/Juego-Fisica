/* Entrega de archivos estáticos con protección contra rutas externas. */

const fs = require("node:fs");
const path = require("node:path");
const { root, contentTypes } = require("./config");
const { responderJson } = require("./respuestas");

function servirEstatico(response, pathname) {
  const lowerPathname = pathname.toLowerCase();
  if (lowerPathname.startsWith("/database/") || lowerPathname.endsWith(".php")) {
    responderJson(response, 404, { ok: false, error: "No se encontró el archivo." });
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    responderJson(response, 403, { ok: false, error: "Acceso denegado." });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      responderJson(response, error.code === "ENOENT" ? 404 : 500, {
        ok: false,
        error: error.code === "ENOENT" ? "No se encontró el archivo." : "No se pudo leer el archivo.",
      });
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    response.end(content);
  });
}

module.exports = { servirEstatico };
