/* Apertura de SQLite y creación del esquema de cuentas y puntuaciones. */

const fs = require("node:fs");
const { DatabaseSync } = require("node:sqlite");
const { databaseDirectory, databasePath } = require("./config");

fs.mkdirSync(databaseDirectory, { recursive: true });
const database = new DatabaseSync(databasePath);

database.exec(`
  CREATE TABLE IF NOT EXISTS jugadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL COLLATE NOCASE UNIQUE,
    correo TEXT NOT NULL COLLATE NOCASE UNIQUE,
    contrasena_hash TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS niveles_puntuados (
    jugador_id INTEGER NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
    nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 6),
    puntos INTEGER NOT NULL DEFAULT 100,
    completado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (jugador_id, nivel)
  );
`);

module.exports = { database };
