/* Estadísticas del jugador que se muestran dentro del panel de opciones. */

import { JuegoDB } from "../../datos/index.js";
import { leerSesion } from "../sesion.js";

function progresoLocal(jugadorActual) {
  if (JuegoDB) {
    if (jugadorActual && typeof JuegoDB.progress === "function") {
      const progreso = JuegoDB.progress(jugadorActual);
      if (progreso) return progreso;
    }
    if (typeof JuegoDB.read === "function") {
      const datos = JuegoDB.read();
      const jugador = (datos.jugadores || []).find(
        (p) => p.usuario.toLowerCase() === jugadorActual.toLowerCase()
      );
      if (jugador && jugador.progreso) return jugador.progreso;
    }
  }
  return { nivel: 1, completados: [], puntuacion: 0, combustible: 100 };
}

export function actualizarEstadisticas() {
  const { jugadorActual } = leerSesion();
  const statJugador = document.getElementById("statJugador");
  const statNivel = document.getElementById("statNivel");
  const statPuntos = document.getElementById("statPuntos");
  const statCombustible = document.getElementById("statCombustible");
  const statCompletados = document.getElementById("statCompletados");
  const barra = document.getElementById("barraProgresoOpciones");

  if (!statJugador && !statNivel) return;

  const progreso = progresoLocal(jugadorActual);
  const completados = Array.isArray(progreso.completados) ? progreso.completados : [];
  const nivel = Math.max(1, Math.min(6, Number(progreso.nivel) || 1));
  const puntos = Math.max(0, Number(progreso.puntuacion) || 0);
  const combustible = Math.max(0, Math.min(100, Number(progreso.combustible ?? 100)));

  if (statJugador) statJugador.textContent = jugadorActual || "Invitado";
  if (statNivel) statNivel.textContent = nivel + " / 6";
  if (statPuntos) statPuntos.textContent = puntos.toLocaleString("es-AR");
  if (statCombustible) statCombustible.textContent = Math.round(combustible) + "%";
  if (statCompletados) {
    statCompletados.textContent =
      completados.length + " / 6 planeta" + (completados.length === 1 ? "" : "s") + " completado" +
      (completados.length === 1 ? "" : "s");
  }
  if (barra) barra.style.width = Math.round((completados.length / 6) * 100) + "%";
}
