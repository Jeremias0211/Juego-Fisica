/* Entrada del jugador: teclado, controles táctiles, habilidades y pausa. */

import { audioJuego, sfx } from "../audio.js";
import { limpiarTeclas } from "./estado.js";

export function crearControles({ p, mission, state, callbacks }) {
  const player = state.player;

  function controlar(name, activo) {
    if (!activo) {
      state.keys.delete(name);
      const boton = document.querySelector(`[data-control="${name}"]`);
      boton?.classList.remove("activo");
      return;
    }
    if (state.paused || state.finished || state.gameOver) return;
    if (name === "jetpack") {
      if (!mission.jetpack || !state.jetpackCollected || state.jetpackFuel <= 0) return;
      if (!state.keys.has("jetpack") && player.grounded) {
        player.vy = -state.jumpSpeed * 0.68;
        player.grounded = false;
        sfx("jetpackJump");
      }
    } else if (name === "jump" && !state.keys.has("jump") && player.grounded) {
      player.vy = -state.jumpSpeed;
      player.grounded = false;
      sfx("jump");
    }
    state.keys.add(name);
    document.querySelector(`[data-control="${name}"]`)?.classList.add("activo");
  }

  function useAbility() {
    if (state.paused || state.finished || state.gameOver || !mission.ability) return;
    const type = mission.ability.type;
    if (type === "jetpack") {
      callbacks.onMessage("Mantené J o el botón JETPACK mientras tengas carga.");
      sfx("denied");
      return;
    }
    if (state.abilityCooldown > 0) {
      callbacks.onMessage("La habilidad todavía se está recargando.");
      sfx("denied");
      return;
    }
    if (type === "impulse") {
      if (!player.grounded) {
        callbacks.onMessage("Activá el impulso cuando estés en el suelo, sobre una plataforma amarilla.");
        sfx("denied");
        return;
      }
      const pad = state.impulsePads.find((item) => !item.activated && Math.abs(player.x + player.width / 2 - item.x) < 54);
      if (!pad) {
        callbacks.onMessage("Acercate a una plataforma amarilla junto al borde y presioná E.");
        sfx("denied");
        return;
      }
      pad.activated = true;
      state.impulseGapUsed = mission.gaps.findIndex((gap) => gap[0] > player.x && gap[0] - player.x < 170);
      player.vy = -mission.impulseSpeed;
      player.grounded = false;
      sfx("impulse");
      callbacks.onMessage("¡Impulso activado! La plataforma te lanzó para cruzar el cráter.");
      return;
    }
    if (type === "gravity") {
      state.gravityPulseRemaining = mission.gravityPulse.duration;
      state.abilityCooldown = mission.gravityPulse.cooldown;
      sfx("pulse");
      callbacks.onMessage("¡Pulso gravitatorio! La gravedad de Venus se redujo por un momento.");
      return;
    }
    if (type === "brake") {
      player.vx = 0;
      state.keys.delete("left");
      state.keys.delete("right");
      state.abilityCooldown = 0.7;
      sfx("brake");
      callbacks.onMessage("Freno inercial aplicado: soltaste el movimiento horizontal para alinear el aterrizaje.");
      return;
    }
    if (type === "slingshot") {
      const nearest = (mission.gravityWells || []).map((well) => ({
        well,
        distance: Math.hypot(well[0] - (player.x + player.width / 2), state.lastFloor - well[1] - (player.y + player.height / 2)),
      })).sort((a, b) => a.distance - b.distance)[0];
      if (!nearest || nearest.distance > nearest.well[2] + 35) {
        callbacks.onMessage("Acercate a un campo gravitatorio violeta antes de activar la asistencia.");
        sfx("denied");
        return;
      }
      player.vy = Math.min(player.vy, -900);
      state.abilityRunRemaining = 0.82;
      state.abilityCooldown = 1.4;
      sfx("slingshot");
      callbacks.onMessage("¡Asistencia gravitatoria! El campo curvó tu trayectoria hacia adelante.");
      return;
    }
    if (type === "energy") {
      if (player.x + player.width < state.worldLength - 205) {
        callbacks.onMessage("Acercate al portal para activar la baliza.");
        sfx("denied");
        return;
      }
      if (state.energyCollected < mission.requiredEnergy) {
        callbacks.onMessage("La baliza necesita " + mission.requiredEnergy + " celdas de energía; tenés " + state.energyCollected + ".");
        sfx("denied");
        return;
      }
      state.exitActivated = true;
      sfx("beacon");
      callbacks.onMessage("¡Baliza activada! Avanzá hasta el portal para completar Saturno.");
    }
  }

  function onKeyDown(event) {
    if (event.target.closest && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
    const key = event.key.toLowerCase();
    if (key === "p") {
      event.preventDefault();
      if (event.repeat) return;
      if (state.paused) resumeGame(); else pauseGame();
      return;
    }
    if (state.paused) return;
    if (key === "e") {
      event.preventDefault();
      if (!event.repeat) useAbility();
      return;
    }
    const jump = key === "w" || key === "arrowup" || event.code === "Space";
    const left = key === "a" || key === "arrowleft";
    const right = key === "d" || key === "arrowright";
    const jetpack = key === "j";
    if (!jump && !left && !right && !jetpack) return;
    if (event.code === "Space" && event.target.closest && event.target.closest("button, a")) return;
    if (event.code === "Space" || key.indexOf("arrow") === 0) event.preventDefault();
    if (jetpack) { event.preventDefault(); controlar("jetpack", true); return; }
    if (left) controlar("left", true);
    if (right) controlar("right", true);
    if (jump) controlar("jump", true);
  }

  function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") controlar("left", false);
    if (key === "d" || key === "arrowright") controlar("right", false);
    if (key === "w" || key === "arrowup" || event.code === "Space") controlar("jump", false);
    if (key === "j") controlar("jetpack", false);
  }

  function pauseGame() {
    if (state.paused || state.finished || state.gameOver) return;
    state.paused = true;
    limpiarTeclas(state);
    audioJuego()?.setJetpack(false);
    audioJuego()?.stopMusic();
    sfx("select");
    p.noLoop();
    callbacks.onPauseChange(true);
  }

  function resumeGame() {
    if (!state.paused || state.finished || state.gameOver) return;
    state.paused = false;
    state.lastTime = p.millis();
    audioJuego()?.startMusic("juego");
    sfx("select");
    callbacks.onPauseChange(false);
    p.loop();
  }

  function conectar() {
    document.querySelectorAll(".controles-tactiles [data-control]").forEach((button) => {
      const control = button.dataset.control;
      if (control === "jetpack") button.hidden = !mission.jetpack;
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        controlar(control, true);
      });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
        button.addEventListener(eventName, (event) => {
          event.preventDefault();
          controlar(control, false);
        });
      });
    });

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", () => limpiarTeclas(state));
  }

  return {
    controlar,
    useAbility,
    pauseGame,
    resumeGame,
    setJetpack(active) { controlar("jetpack", active); },
    conectar,
  };
}
