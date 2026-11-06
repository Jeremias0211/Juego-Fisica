/* Entrada del mapa de niveles: progreso, botones, briefing y ranking. */

import { JuegoDB } from "../../datos/index.js";
import { requerirSesion } from "../sesion.js";
import { esEntornoEstatico } from "../entorno.js";
import { crearBriefing } from "./briefing.js";
import { crearRanking } from "./ranking.js";

async function iniciarNiveles() {
  const sesion = requerirSesion();
  if (!sesion || !sesion.jugadorActual) {
    window.location.href = "Login.html";
    return;
  }

  const jugador = sesion.jugadorActual;
  const modoInvitado = sesion.modoInvitado;

  if (!modoInvitado && !esEntornoEstatico()) {
    try {
      const response = await fetch("../api/progreso.php", { cache: "no-store" });
      const serverProgress = await response.json();
      if (response.ok && serverProgress.ok) JuegoDB.mergeServerProgress(jugador, serverProgress);
    } catch (_) {
      /* Permite seguir con el progreso local si el servidor no responde. */
    }
  }

  const progreso = JuegoDB.progress(jugador);
  const botonesNivel = Array.from(document.querySelectorAll(".nivel[data-nivel]"));
  const nombresNivel = new Map(
    botonesNivel.map((btn) => [Number(btn.dataset.nivel), btn.dataset.planeta || `Nivel ${btn.dataset.nivel}`])
  );

  let ranking;

  const briefing = crearBriefing({
    progreso,
    nombresNivel,
    alAbrir: () => ranking?.cerrar(),
    alIniciarMision: (level) => {
      window.location.href = `Juego.html?nivel=${level}`;
    },
  });

  botonesNivel.forEach((btn) => {
    const level = Number(btn.dataset.nivel);
    const completado = progreso.completados.includes(level);
    const unlocked = level <= progreso.nivel || completado;

    btn.classList.toggle("desbloqueado", unlocked);
    btn.classList.toggle("bloqueado", !unlocked);
    btn.disabled = false;
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-controls", "panelBriefing");

    const lock = btn.querySelector(".candado");
    if (lock) lock.textContent = unlocked ? (completado ? "✅" : "🚀") : "🔒";

    const estado = !unlocked ? "Bloqueada" : completado ? "Completada" : "Disponible";
    btn.setAttribute(
      "aria-label",
      `${btn.dataset.planeta || `Nivel ${level}`}, misión ${level}: ${(btn.dataset.concepto || "").toLowerCase()}. ${estado}. Abrir informe de misión.`
    );

    btn.addEventListener("click", () => briefing.abrir(btn, level, completado, unlocked));
  });

  const resumen = document.getElementById("progresoJugador");
  if (resumen) {
    resumen.textContent = `${jugador} · ${progreso.completados.length}/6 misiones · ${progreso.puntuacion} puntos · ⛽ ${Math.floor(progreso.combustible ?? 100)}%`;
  }
  document.getElementById("volver")?.addEventListener("click", () => location.href = "Historia.html");

  ranking = crearRanking({
    jugador,
    modoInvitado,
    progreso,
    alAbrir: () => briefing.cerrar(),
  });

  document.getElementById("abrirRanking")?.addEventListener("click", () => ranking.abrir());

  document.addEventListener("keydown", (event) => {
    if (briefing.manejarTecla(event)) return;
    if (event.key === "Escape" && ranking.estaAbierto()) ranking.cerrar();
  });
}

iniciarNiveles();
