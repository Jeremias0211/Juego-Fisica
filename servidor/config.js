/* Configuración general del servidor alternativo Node + SQLite. */

const path = require("node:path");

const root = path.join(__dirname, "..");
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";
const databaseDirectory = path.join(root, "database");
const databasePath = path.join(databaseDirectory, "nuevo_hogar.sqlite");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

module.exports = {
  root,
  port,
  host,
  databaseDirectory,
  databasePath,
  contentTypes,
};
