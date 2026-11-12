/* Arranque de la pantalla de juego: sesión, progreso, HUD, p5 y callbacks. */

import { MISIONES } from "./misiones.js";
import { acortarMision, separarObjetosMision } from "./geometria.js";
import { crearEscena } from "./escena/escena.js";
import { audioJuego, sfx } from "./audio.js";
import { JuegoDB as DB } from "../datos/index.js";
import { esEntornoEstatico } from "../portal/entorno.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = localStorage.getItem("jugadorActual");
  const guestMode = localStorage.getItem("modoInvitado") === "true";
  if ((localStorage.getItem("sesionActiva") !== "true" && !guestMode) || !user) {
    location.href = "Login.html";
    return;
  }

  if (!guestMode && !esEntornoEstatico()) {
    try {
      const response = await fetch("../api/progreso.php", { cache: "no-store" });
      const serverProgress = await response.json();
      if (response.ok && serverProgress.ok) DB.mergeServerProgress(user, serverProgress);
    } catch (_) {
      /* La partida puede continuar con el progreso local. */
    }
  }

  const level = Math.max(1, Math.min(MISIONES.length, Number(new URLSearchParams(location.search).get("nivel")) || 1));
  const mission = MISIONES[level - 1];
  acortarMision(mission, [0.78, 0.78, 0.75, 0.78, 0.75, 0.78][level - 1]);
  separarObjetosMision(mission);

  const progress = DB.progress(user);
  if (level > progress.nivel && !progress.completados.includes(level)) {
    location.href = "Niveles.html";
    return;
  }

  document.getElementById("jugador").textContent = user;
  const status = document.getElementById("estado");
  status.textContent = "PLANETA " + level + " / 6 · " + progress.puntuacion + " PUNTOS";
  document.getElementById("planeta").textContent = mission.planet;
  document.getElementById("titulo").textContent = mission.title;
  document.getElementById("descripcion").textContent = mission.description;
  document.getElementById("formula").textContent = mission.formula;

  const next = document.getElementById("siguiente");
  const completionOverlay = document.getElementById("nivelCompletadoOverlay");
  const completionTitle = document.getElementById("tituloNivelCompletado");
  const completionDetail = document.getElementById("detalleNivelCompletado");
  const advanceButton = document.getElementById("avanzarNivel");
  const platformMessage = document.getElementById("mensajePlataforma");
  const retry = document.getElementById("reintentar");
  const pauseButton = document.getElementById("botonPausa");
  const abilityButton = document.getElementById("botonHabilidad");
  const helpControls = document.getElementById("ayudaControles");
  const pauseOverlay = document.getElementById("pausaOverlay");
  const resumeButton = document.getElementById("reanudarJuego");
  const fuelFill = document.getElementById("barraCombustible");
  const fuelValue = document.getElementById("valorCombustible");
  const hearts = document.getElementById("corazones");
  const energyCounter = document.getElementById("contadorEnergia");
  const jetpackPanel = document.getElementById("jetpackPanel");
  const jetpackFill = document.getElementById("barraJetpack");
  const jetpackValue = document.getElementById("valorJetpack");

  let solved = progress.completados.includes(level);
  let paused = false;
  const launch = DB.startLevel(user, level, 15);
  const noFuel = !launch.ok;

  next.textContent = level === MISIONES.length
    ? "VER FINAL DE MISIÓN →"
    : "VOLVER AL MAPA · NIVEL " + (level + 1) + " DESBLOQUEADO →";
  next.hidden = !solved;
  next.addEventListener("click", () => {
    location.href = !noFuel && level === MISIONES.length ? "Final.html" : "Niveles.html";
  });

  advanceButton.textContent = level === MISIONES.length
    ? "VER CRÉDITOS DEL EQUIPO →"
    : "AVANZAR AL NIVEL " + (level + 1) + " →";
  advanceButton.addEventListener("click", () => {
    location.href = level === MISIONES.length ? "Final.html" : "Juego.html?nivel=" + (level + 1);
  });

  function mostrarNivelCompletado(detalle) {
    completionTitle.textContent = level === MISIONES.length ? "¡MISIÓN COMPLETA!" : "¡NIVEL COMPLETADO!";
    completionDetail.textContent = detalle;
    completionOverlay.hidden = false;
    window.setTimeout(() => advanceButton.focus(), 0);
  }

  retry.addEventListener("click", () => game.restartLevel());

  function updateFuelHud(value) {
    const amount = Math.max(0, Math.min(100, Math.floor(value)));
    fuelFill.style.width = amount + "%";
    fuelFill.parentElement.setAttribute("aria-valuenow", String(amount));
    fuelValue.textContent = amount + "%";
  }

  function updateHearts(lives) {
    hearts.textContent = [0, 1, 2].map((index) => index < lives ? "♥" : "♡").join(" ");
    hearts.setAttribute("aria-label", lives + (lives === 1 ? " vida" : " vidas"));
  }

  function updateJetpackHud(value, collected) {
    const amount = Math.max(0, Math.min(100, Math.floor(value)));
    jetpackPanel.hidden = !mission.jetpack;
    if (!mission.jetpack) return;
    jetpackFill.style.width = amount + "%";
    jetpackFill.parentElement.setAttribute("aria-valuenow", String(amount));
    jetpackValue.textContent = collected
      ? (amount > 0 ? "CARGA " + amount + "% · MANTENÉ J" : "SIN CARGA")
      : "BUSCÁ LA MOCHILA";
  }

  function updateEnergyHud(collected, required) {
    energyCounter.hidden = !mission.energyCells;
    if (mission.energyCells) energyCounter.textContent = "⚡ " + collected + " / " + required + " celdas";
  }

  updateFuelHud(launch.combustible ?? progress.combustible ?? 100);
  updateHearts(3);
  updateJetpackHud(100, false);
  updateEnergyHud(0, mission.requiredEnergy || 0);

  abilityButton.textContent = mission.jetpack ? "JETPACK · MANTENER J" : mission.ability.label + " · " + mission.ability.key;
  abilityButton.title = mission.ability.hint;
  abilityButton.setAttribute("aria-label", mission.ability.hint);
  abilityButton.setAttribute("aria-keyshortcuts", mission.ability.key);
  abilityButton.hidden = Boolean(mission.jetpack && window.matchMedia("(pointer: coarse)").matches);
  helpControls.textContent = "A / D: moverse · W o ESPACIO: saltar · Orbes O₂: recargar · " + mission.ability.hint + " · P: pausar";

  platformMessage.textContent = solved
    ? "Nivel completado. Podés volver a jugar o regresar al mapa."
    : (mission.jetpack
      ? "El oxígeno baja. Recogé el jetpack antes del cráter y mantené J para cruzar el tramo largo."
      : "Tenés 3 vidas. Esquivá los rayos láser, superá los cráteres y recogé orbes para recargar oxígeno.");
  if (!solved && launch.cobrado) platformMessage.textContent += " Se gastaron 15% de combustible de la nave.";

  if (!launch.ok) {
    pauseButton.hidden = true;
    platformMessage.textContent = launch.error + " Completá otro nivel para recuperar combustible.";
    next.textContent = "VOLVER AL MAPA";
    next.hidden = false;
    return;
  }

  const oxygenFill = document.getElementById("barraOxigeno");
  const oxygenValue = document.getElementById("valorOxigeno");
  const orbCount = document.getElementById("contadorOrbes");

  function updateOxygenHud(oxygenPercent, collected, totalOrbs) {
    const value = Math.max(0, Math.ceil(oxygenPercent));
    oxygenFill.style.width = value + "%";
    oxygenFill.parentElement.setAttribute("aria-valuenow", String(value));
    oxygenFill.classList.toggle("critico", value <= 25);
    oxygenValue.textContent = value + "%";
    orbCount.textContent = collected + " / " + totalOrbs + " orbes";
  }
  updateOxygenHud(100, 0, mission.orbs.length);

  function completeLevel() {
    if (solved) {
      const detalle = "Este nivel ya estaba completado. El próximo destino está desbloqueado y tu personaje llegó a la salida.";
      platformMessage.textContent = detalle;
      mostrarNivelCompletado(detalle);
      return;
    }
    if (!DB.complete(user, level, 100)) {
      platformMessage.textContent = "No se pudo guardar el progreso. Revisá la sesión e intentá otra vez.";
      return;
    }
    if (!guestMode && !esEntornoEstatico()) {
      fetch("../api/puntuaciones.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nivel: level }),
        keepalive: true,
      }).catch(() => {});
    }
    solved = true;
    const updated = DB.progress(user);
    updateFuelHud(updated.combustible);
    status.textContent = "PLANETA " + level + " / 6 · " + updated.puntuacion + " PUNTOS";
    const detalle = "✅ " + mission.fact + " Sumaste 100 puntos y recuperaste combustible: " + updated.combustible + "%.";
    platformMessage.textContent = detalle;
    next.hidden = true;
    mostrarNivelCompletado(detalle);
  }

  const sceneHost = document.getElementById("contenedorEscena");
  if (!sceneHost) {
    console.error("No se encontró el contenedor de escena (#contenedorEscena)");
    platformMessage.textContent = "Error al cargar el escenario del nivel.";
    return;
  }

  let game;
  try {
    game = new window.p5((sketch) => crearEscena(sketch, mission, {
      onOxygenChange(value, collected, total) {
        updateOxygenHud(value, collected, total);
      },
      onMessage(message) {
        platformMessage.textContent = message;
      },
      onLivesChange: updateHearts,
      onJetpackChange: updateJetpackHud,
      onEnergyChange: updateEnergyHud,
      onGameOver() {
        platformMessage.textContent = "Perdiste las 3 vidas. Reintentá el nivel; no se vuelve a cobrar el combustible de esta misión.";
        retry.hidden = false;
        pauseButton.disabled = true;
        audioJuego()?.setJetpack(false);
        audioJuego()?.stopMusic();
        sfx("gameover");
      },
      onRestart() {
        retry.hidden = true;
        pauseButton.disabled = false;
        next.hidden = !solved;
        audioJuego()?.startMusic("juego");
      },
      onPauseChange(isPaused) {
        paused = isPaused;
        pauseOverlay.hidden = !isPaused;
        pauseButton.textContent = isPaused ? "▶ REANUDAR" : "⏸ PAUSAR";
        pauseButton.setAttribute("aria-expanded", String(isPaused));
        if (isPaused) resumeButton.focus();
        else pauseButton.focus();
      },
      onComplete() {
        pauseButton.disabled = true;
        audioJuego()?.setJetpack(false);
        audioJuego()?.stopMusic();
        sfx("win");
        completeLevel();
      },
    }, sceneHost), sceneHost);
  } catch (error) {
    console.error("Error al inicializar p5", error);
    platformMessage.textContent = "Error al cargar el motor del juego. Revisa la consola.";
    return;
  }

  pauseButton.addEventListener("click", () => {
    try { paused ? game.resumeGame() : game.pauseGame(); } catch (_) { /* La pausa no debe romper la partida. */ }
  });

  if (mission.jetpack) {
    abilityButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      abilityButton.setPointerCapture?.(event.pointerId);
      try { game.setJetpack(true); } catch (_) { /* El botón táctil puede fallar sin romper el juego. */ }
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
      abilityButton.addEventListener(eventName, () => {
        try { game.setJetpack(false); } catch (_) { /* Ignorar si p5 todavía no está listo. */ }
      });
    });
  } else {
    abilityButton.addEventListener("click", () => {
      try { game.useAbility(); } catch (_) { /* Ignorar si p5 todavía no está listo. */ }
    });
  }

  resumeButton.addEventListener("click", () => {
    try { game.resumeGame(); } catch (_) { /* Ignorar si p5 todavía no está listo. */ }
  });
});
