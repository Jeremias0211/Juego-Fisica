/* Consulta del ranking y guardado de niveles puntuados. */

const { database } = require("../base-datos");
const { responderJson, leerJson } = require("../respuestas");
const { exigirSesion } = require("../seguridad");

function manejarPuntuaciones(request, response, pathname) {
  const apiGet = pathname === "/api/puntuaciones.php" || pathname === "/api/puntuaciones";
  const apiPost = apiGet || pathname === "/api/puntuaciones/nivel";

  if (apiGet && request.method === "GET") {
    try {
      const rows = database.prepare(`
        SELECT j.usuario,
               COALESCE(SUM(n.puntos), 0) AS puntuacion,
               COUNT(n.nivel) AS nivelesCompletados
        FROM jugadores j
        LEFT JOIN niveles_puntuados n ON n.jugador_id = j.id
        GROUP BY j.id
        ORDER BY puntuacion DESC, nivelesCompletados DESC, j.usuario COLLATE NOCASE ASC
      `).all();

      responderJson(response, 200, {
        ok: true,
        jugadores: rows.map((jugador, indice) => ({ posicion: indice + 1, ...jugador })),
      });
    } catch (error) {
      console.error("Error consultando puntuaciones:", error);
      responderJson(response, 500, { ok: false, error: "No se pudo cargar la tabla de puntuaciones." });
    }
    return;
  }

  if (apiPost && request.method === "POST") {
    const sesion = exigirSesion(request, response);
    if (!sesion) return;

    leerJson(request).then((data) => {
      const nivel = Number(data.nivel);
      if (!Number.isInteger(nivel) || nivel < 1 || nivel > 6) {
        responderJson(response, 422, { ok: false, error: "El nivel indicado no es válido." });
        return;
      }

      if (nivel > 1) {
        const anterior = database.prepare(
          "SELECT 1 AS completado FROM niveles_puntuados WHERE jugador_id = ? AND nivel = ? LIMIT 1"
        ).get(sesion.jugadorId, nivel - 1);
        if (!anterior) {
          responderJson(response, 409, { ok: false, error: "Completá el planeta anterior antes de guardar este nivel." });
          return;
        }
      }

      database.prepare(`
        INSERT OR IGNORE INTO niveles_puntuados (jugador_id, nivel, puntos)
        VALUES (?, ?, 100)
      `).run(sesion.jugadorId, nivel);
      responderJson(response, 200, { ok: true });
    }).catch((error) => {
      responderJson(response, error.status || 400, {
        ok: false,
        error: error.message || "No se pudo guardar el puntaje.",
      });
    });
    return;
  }

  response.setHeader("Allow", apiGet ? "GET, POST" : "POST");
  responderJson(response, 405, { ok: false, error: "Método no permitido." });
}

module.exports = { manejarPuntuaciones };
