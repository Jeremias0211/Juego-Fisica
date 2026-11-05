/* Progreso del jugador, reinicio de la cuenta y cierre de sesión. */

const { database } = require("../base-datos");
const { responderJson } = require("../respuestas");
const { exigirSesion, leerTokenSesion, eliminarSesion } = require("../seguridad");

function manejarProgreso(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }

  const sesion = exigirSesion(request, response);
  if (!sesion) return;

  try {
    const rows = database.prepare(`
      SELECT nivel, puntos
      FROM niveles_puntuados
      WHERE jugador_id = ?
      ORDER BY nivel ASC
    `).all(sesion.jugadorId);

    const completados = rows.map((fila) => Number(fila.nivel));
    const puntuacion = rows.reduce((total, fila) => total + Number(fila.puntos), 0);

    responderJson(response, 200, {
      ok: true,
      completados,
      puntuacion,
      nivel: completados.length ? Math.min(6, Math.max(...completados) + 1) : 1,
    });
  } catch (error) {
    console.error("Error consultando progreso:", error);
    responderJson(response, 500, { ok: false, error: "No se pudo cargar el progreso del jugador." });
  }
}

function manejarReinicioProgreso(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }

  const sesion = exigirSesion(request, response);
  if (!sesion) return;

  try {
    database.prepare("DELETE FROM niveles_puntuados WHERE jugador_id = ?").run(sesion.jugadorId);
    responderJson(response, 200, { ok: true });
  } catch (error) {
    console.error("Error reiniciando progreso:", error);
    responderJson(response, 500, { ok: false, error: "No se pudo reiniciar el progreso de la cuenta." });
  }
}

function manejarCierreSesion(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    responderJson(response, 405, { ok: false, error: "Método no permitido." });
    return;
  }

  const token = leerTokenSesion(request);
  eliminarSesion(token);
  response.setHeader("Set-Cookie", "nh_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  responderJson(response, 200, { ok: true });
}

module.exports = {
  manejarProgreso,
  manejarReinicioProgreso,
  manejarCierreSesion,
};
