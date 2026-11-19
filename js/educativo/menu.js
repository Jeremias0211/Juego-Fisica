/* Resumen educativo del menú principal.
   Solo lee el progreso local: no otorga logros ni toca el progreso del juego. */

import { TODOS_LOS_CUERPOS } from "./datos/planetas.js";
import { estadosLogros, contarLogrosDesbloqueados } from "./logros.js";
import { obtenerProgreso } from "./progreso.js";

export function iniciarResumenEducativo(sesion) {
  const enlace = document.getElementById("educativoProgreso");
  const texto = document.getElementById("educativoProgresoTexto");
  if (!enlace || !texto) return;

  try {
    const usuario = sesion?.jugadorActual || "Invitado";
    const progreso = obtenerProgreso(usuario);
    const fichas = TODOS_LOS_CUERPOS.filter(
      (cuerpo) => Boolean(progreso.fichas[cuerpo.id]?.vista)
    ).length;
    const estados = estadosLogros(usuario);
    const logros = contarLogrosDesbloqueados(estados);
    const experimentos = Object.keys(progreso.experimentos).length;
    const intentos = progreso.quiz.intentos.length;

    if (!fichas && !logros && !experimentos && !intentos) {
      enlace.hidden = true;
      return;
    }

    texto.textContent = `🏅 ${logros} de ${estados.length} logros · ${fichas} de ${TODOS_LOS_CUERPOS.length} fichas`;
    enlace.setAttribute(
      "aria-label",
      `Progreso educativo: ${logros} de ${estados.length} logros y ${fichas} de ${TODOS_LOS_CUERPOS.length} fichas. Ver mis logros`
    );
    enlace.hidden = false;
  } catch (_) {
    /* Si el almacenamiento local falla, el menú sigue funcionando igual. */
    enlace.hidden = true;
  }
}
