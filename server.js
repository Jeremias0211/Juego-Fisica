const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" };

http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400).end("Dirección inválida"); return; }
  if (pathname === "/" || pathname === "/index.html") pathname = "/html/Login.html";
  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end("Acceso denegado"); return; }
  fs.readFile(filePath, (error, content) => {
    if (error) { response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" }); response.end(error.code === "ENOENT" ? "No se encontró el archivo" : "No se pudo leer el archivo"); return; }
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    response.end(content);
  });
}).listen(port, "127.0.0.1", () => { console.log(`Nuevo Hogar está en http://localhost:${port}/`); console.log("Presioná Ctrl+C para detener el servidor."); });
