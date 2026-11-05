/* Simulación del nivel: movimiento, colisiones, objetos y condiciones de fin. */

import { audioJuego, sfx } from "../audio.js";
import { laserActivo, limpiarTeclas, obtenerRects, perderVida } from "./estado.js";

function colisionaPeligro(state, floorY, time) {
  for (let i = 0; i < state.lasers.length; i++) {
    const laser = state.lasers[i];
    if (!laserActivo(laser, time)) continue;
    const top = floorY - laser[1];
    const beamWidth = 12;
    const player = state.player;
    const touchesX = player.x + player.width > laser[0] - beamWidth / 2 && player.x < laser[0] + beamWidth / 2;
    const touchesY = player.y + player.height > top && player.y < floorY;
    if (touchesX && touchesY) return "Te alcanzó un rayo láser.";
  }
  return "";
}

export function actualizarJuego(time, dt, floorY, { mission, state, callbacks }) {
  const player = state.player;

  if (state.lastFloor === null) {
    player.y = floorY - player.height;
    player.grounded = true;
  } else if (state.lastFloor !== floorY) {
    const deltaFloor = floorY - state.lastFloor;
    if (Math.abs(deltaFloor) > 4000) {
      player.y = floorY - player.height;
      player.grounded = true;
    } else {
      player.y += deltaFloor;
    }
  }
  state.lastFloor = floorY;

  const rects = obtenerRects(mission, floorY, time);
  state.rects = rects;
  const rectsAnteriores = obtenerRects(mission, floorY, time - dt * 1000);
  let previousX = player.x;
  let previousY = player.y;

  if (player.grounded && dt > 0) {
    rects.filter((rect) => rect.type === "moving-platform").forEach((rect) => {
      const anterior = rectsAnteriores.find((item) => item.type === "moving-platform" && item.index === rect.index);
      const sobreLaPlataforma = player.x + player.width > rect.x + 3 && player.x < rect.x + rect.w - 3;
      if (anterior && sobreLaPlataforma && Math.abs(previousY + player.height - anterior.y) < 8) {
        player.y += rect.y - anterior.y;
        const desplazamiento = rect.x - anterior.x;
        if (desplazamiento) {
          player.x = Math.max(0, Math.min(state.worldLength - player.width, player.x + desplazamiento));
        }
      }
    });
  }

  previousX = player.x;
  previousY = player.y;

  if (!state.finished && !state.gameOver && dt > 0) {
    if (state.invulnerability > 0) state.invulnerability = Math.max(0, state.invulnerability - dt);
    if (state.gravityPulseRemaining > 0) state.gravityPulseRemaining = Math.max(0, state.gravityPulseRemaining - dt);
    if (state.abilityCooldown > 0) state.abilityCooldown = Math.max(0, state.abilityCooldown - dt);
    if (state.abilityRunRemaining > 0) state.abilityRunRemaining = Math.max(0, state.abilityRunRemaining - dt);

    state.oxygen = Math.max(0, state.oxygen - mission.drain * dt);

    if (state.oxygen <= 0) {
      perderVida(state, mission, callbacks, floorY, "Se terminó el oxígeno. El traje te devolvió al inicio con el tanque lleno.");
    } else {
      const direction = ((state.keys.has("right") || state.abilityRunRemaining > 0) ? 1 : 0) - (state.keys.has("left") ? 1 : 0);
      if (mission.inertia) {
        if (direction) player.vx = Math.max(-state.speed, Math.min(state.speed, player.vx + direction * state.speed * 3.2 * dt));
        else player.vx = Math.abs(player.vx) < 12 ? 0 : player.vx - Math.sign(player.vx) * 470 * dt;
      } else {
        player.vx = direction * state.speed;
      }
      player.x = Math.max(0, Math.min(state.worldLength - player.width, player.x + player.vx * dt));
      if ((player.x <= 0 && player.vx < 0) || (player.x >= state.worldLength - player.width && player.vx > 0)) player.vx = 0;

      rects.forEach((rect) => {
        const vertical = player.y + player.height > rect.y + 2 && player.y < rect.y + rect.h - 1;
        const horizontal = player.x + player.width > rect.x && player.x < rect.x + rect.w;
        if (!vertical || !horizontal) return;
        if (player.vx > 0 && previousX + player.width <= rect.x + 2) {
          player.x = rect.x - player.width;
          player.vx = 0;
        } else if (player.vx < 0 && previousX >= rect.x + rect.w - 2) {
          player.x = rect.x + rect.w;
          player.vx = 0;
        }
      });

      const usingJetpack = Boolean(mission.jetpack && state.jetpackCollected && state.keys.has("jetpack") && state.jetpackFuel > 0);
      if (usingJetpack !== state.jetpackSonando) {
        state.jetpackSonando = usingJetpack;
        audioJuego()?.setJetpack(usingJetpack);
      }
      if (usingJetpack) {
        player.vy = Math.max(-mission.jetpack.maxRise, player.vy - mission.jetpack.thrust * dt);
        state.jetpackFuel = Math.max(0, state.jetpackFuel - mission.jetpack.burn * dt);
        const gap = mission.jetpack.requiredGap;
        if (gap && player.x + player.width > gap[0] && player.x < gap[1] && player.y + player.height < floorY - 5) state.jetpackUsedInGap = true;
        if (Math.ceil(state.jetpackFuel) !== state.lastReportedJetpack) {
          state.lastReportedJetpack = Math.ceil(state.jetpackFuel);
          callbacks.onJetpackChange(state.jetpackFuel, state.jetpackCollected);
        }
      }

      (mission.gravityWells || []).forEach((well) => {
        const dx = well[0] - (player.x + player.width / 2);
        const dy = floorY - well[1] - (player.y + player.height / 2);
        const distance = Math.hypot(dx, dy);
        if (distance > 1 && distance < well[2]) {
          const acceleration = well[3] * (1 - distance / well[2]);
          player.vx = Math.max(-state.speed * 1.5, Math.min(state.speed * 1.5, player.vx + dx / distance * acceleration * dt));
          player.vy = Math.max(-800, Math.min(1000, player.vy + dy / distance * acceleration * dt));
        }
      });

      const effectiveGravity = state.gravityPulseRemaining > 0 ? state.gravity * mission.gravityPulse.factor : state.gravity;
      const estabaEnSuelo = player.grounded;
      const velocidadCaida = player.vy;
      player.vy += effectiveGravity * dt;
      player.y += player.vy * dt;
      player.grounded = false;

      if (player.vy >= 0) {
        let landingY = null;
        rects.forEach((rect) => {
          const overlapsX = player.x + player.width > rect.x + 3 && player.x < rect.x + rect.w - 3;
          const oldBottom = previousY + player.height;
          const newBottom = player.y + player.height;
          if (overlapsX && oldBottom <= rect.y + 4 && newBottom >= rect.y && (landingY === null || rect.y < landingY)) {
            landingY = rect.y;
          }
        });
        state.groundSegments.forEach((segment) => {
          const overlapsX = player.x + player.width > segment.x + 2 && player.x < segment.x + segment.w - 2;
          const oldBottom = previousY + player.height;
          const newBottom = player.y + player.height;
          if (overlapsX && oldBottom <= floorY + 4 && newBottom >= floorY && (landingY === null || floorY < landingY)) {
            landingY = floorY;
          }
        });
        if (landingY !== null) {
          player.y = landingY - player.height;
          player.vy = 0;
          player.grounded = true;
          if (!estabaEnSuelo && velocidadCaida > 160) {
            sfx("land", { fuerza: Math.max(0.4, Math.min(1.6, velocidadCaida / 620)) });
          }
        }
      } else {
        rects.forEach((rect) => {
          const overlapsX = player.x + player.width > rect.x + 3 && player.x < rect.x + rect.w - 3;
          const oldTop = previousY;
          const newTop = player.y;
          const bottom = rect.y + rect.h;
          if (overlapsX && oldTop >= bottom - 2 && newTop <= bottom) {
            player.y = bottom;
            player.vy = 0;
          }
        });
      }

      if (direction) state.walkTime += dt * 11;

      const hazardHit = colisionaPeligro(state, floorY, time);
      if (hazardHit) perderVida(state, mission, callbacks, floorY, hazardHit);

      if (mission.jetpack && !state.jetpackCollected) {
        const pickupX = mission.jetpack.pickup[0];
        const pickupY = floorY - mission.jetpack.pickup[1];
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        if (Math.abs(playerCenterX - pickupX) < 42 && Math.abs(playerCenterY - pickupY) < 58) {
          state.jetpackCollected = true;
          sfx("jetpackPickup");
          callbacks.onJetpackChange(state.jetpackFuel, state.jetpackCollected);
          callbacks.onMessage("¡Jetpack recogido! Mantené J para impulsarte y cruzar el cráter ancho.");
        }
      }

      for (let i = 0; i < state.orbs.length; i++) {
        const orb = state.orbs[i];
        if (orb.collected) continue;
        const orbY = floorY - orb.lift;
        const dx = player.x + player.width / 2 - orb.x;
        const dy = player.y + player.height / 2 - orbY;
        if (dx * dx + dy * dy < 34 * 34) {
          orb.collected = true;
          state.collected++;
          state.oxygen = Math.min(100, state.oxygen + mission.refill);
          sfx("orb");
          callbacks.onMessage("¡Recogiste una orbe de oxígeno! El tanque se recargó.");
        }
      }

      for (let i = 0; i < state.energyCells.length; i++) {
        const cell = state.energyCells[i];
        if (cell.collected) continue;
        const cellY = floorY - cell.lift;
        const dx = player.x + player.width / 2 - cell.x;
        const dy = player.y + player.height / 2 - cellY;
        if (dx * dx + dy * dy < 36 * 36) {
          cell.collected = true;
          state.energyCollected++;
          state.exitMessageShown = false;
          sfx("energy");
          callbacks.onEnergyChange(state.energyCollected, mission.requiredEnergy);
          callbacks.onMessage("Celda de energía recolectada: " + state.energyCollected + " / " + mission.requiredEnergy + ".");
        }
      }

      if (!state.stationUsed && player.x + player.width >= mission.station) {
        state.stationUsed = true;
        state.oxygen = 100;
        sfx("station");
        callbacks.onMessage("¡Llegaste a la estación de recarga! Oxígeno al 100%.");
      }

      if (player.y > floorY + 110) {
        perderVida(state, mission, callbacks, floorY, "Caíste en un cráter. Volviste al inicio con oxígeno completo.");
      }

      if (mission.ability && mission.ability.type === "impulse") {
        for (let i = 0; i < mission.gaps.length; i++) {
          if (state.impulseGapsPassed.indexOf(i) !== -1) continue;
          const gap = mission.gaps[i];
          if (player.x + player.width <= gap[1]) continue;
          if (i === state.impulseGapUsed) {
            state.impulseGapsPassed.push(i);
            state.impulseGapUsed = -1;
          } else {
            player.x = Math.max(0, gap[0] - player.width - 6);
            player.y = floorY - player.height;
            player.vx = 0;
            player.vy = 0;
            player.grounded = true;
            sfx("denied");
            callbacks.onMessage("Ese cráter necesita el impulso. Activá E sobre la plataforma amarilla antes de saltar.");
            break;
          }
        }
      }

      if (mission.jetpack && player.x > mission.jetpack.requiredGap[1] && !state.jetpackUsedInGap) {
        player.x = Math.max(0, mission.jetpack.requiredGap[0] - player.width - 6);
        player.y = floorY - player.height;
        player.vx = 0;
        player.vy = 0;
        player.grounded = true;
        sfx("denied");
        callbacks.onMessage("El cráter requiere el jetpack. Recogelo y mantené J durante el cruce.");
      }

      if (mission.requiredEnergy && state.energyCollected < mission.requiredEnergy && player.x + player.width >= state.worldLength - 78) {
        player.x = state.worldLength - player.width - 80;
        player.vx = 0;
        if (!state.exitMessageShown) {
          sfx("denied");
          callbacks.onMessage("La salida sigue sin energía. Reuní las " + mission.requiredEnergy + " celdas para activarla.");
          state.exitMessageShown = true;
        }
      } else if (mission.requiredEnergy && !state.exitActivated && player.x + player.width >= state.worldLength - 145) {
        player.x = state.worldLength - player.width - 145;
        player.vx = 0;
        if (!state.exitMessageShown) {
          sfx("denied");
          callbacks.onMessage("Reuniste la energía. Presioná E o tocá ACTIVAR BALIZA junto al portal.");
          state.exitMessageShown = true;
        }
      } else if (player.x + player.width >= state.worldLength - 78) {
        state.finished = true;
        player.vx = 0;
        limpiarTeclas(state);
        callbacks.onComplete();
      }
    }
  }

  if (Math.ceil(state.oxygen) !== state.lastReportedOxygen) {
    state.lastReportedOxygen = Math.ceil(state.oxygen);
    callbacks.onOxygenChange(state.oxygen, state.collected, state.orbs.length);
  }
}
