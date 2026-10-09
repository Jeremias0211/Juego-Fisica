CREATE DATABASE IF NOT EXISTS nuevo_hogar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nuevo_hogar;

CREATE TABLE IF NOT EXISTS jugadores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(40) NOT NULL UNIQUE,
  correo VARCHAR(254) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planetas (
  nivel TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  nombre VARCHAR(40) NOT NULL,
  concepto_fisica VARCHAR(60) NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS progreso_jugador (
  jugador_id BIGINT UNSIGNED NOT NULL,
  nivel TINYINT UNSIGNED NOT NULL,
  completado BOOLEAN NOT NULL DEFAULT FALSE,
  puntuacion SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  completado_en TIMESTAMP NULL,
  PRIMARY KEY (jugador_id, nivel),
  CONSTRAINT fk_progreso_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE,
  CONSTRAINT fk_progreso_planeta FOREIGN KEY (nivel) REFERENCES planetas(nivel)
);

INSERT INTO planetas (nivel, nombre, concepto_fisica, orden) VALUES
(1, 'Mercurio', 'Impulso', 1),
(2, 'Venus', 'Gravedad y peso', 2),
(3, 'Tierra', 'Inercia', 3),
(4, 'Marte', 'Trayectoria de proyectiles', 4),
(5, 'Júpiter', 'Órbitas y gravedad', 5),
(6, 'Saturno', 'Transformación de energía', 6)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), concepto_fisica=VALUES(concepto_fisica), orden=VALUES(orden);
