/* Estado completo de una partida y operaciones básicas sobre ese estado. */

import { audioJuego, sfx } from "../audio.js";

export function crearEstado(mission) {
  const state = {
    keys: new Set(),
    player: { x: 34, y: 0, vx: 0, vy: 0, width: 34, height: 48, grounded: false },
    orbs: mission.orbs.map((orb) => ({ x: orb[0], lift: orb[1], collected: false })),
    energyCells: (mission.energyCells || []).map((cell) => ({ x: cell[0], lift: cell[1], collected: false })),
    impulsePads: (mission.impulsePads || []).map((x) => ({ x, activated: false })),
    lasers: mission.lasers || [],
    worldLength: mission.world,
    speed: 265,
    baseGravity: 910,
    gravity: 910 * mission.gravity / 9.8,
    jumpSpeed: mission.jumpSpeed || 420,
    lastTime: 0,
    gameTime: 0,
    paused: false,
    lastFloor: null,
    walkTime: 0,
    oxygen: 100,
    collected: 0,
    energyCollected: 0,
    exitActivated: false,
    exitMessageShown: false,
    gravityPulseRemaining: 0,
    abilityCooldown: 0,
    abilityRunRemaining: 0,
    stationUsed: false,
    finished: false,
    gameOver: false,
    lives: 3,
    invulnerability: 0,
    jetpackCollected: false,
    jetpackFuel: 100,
    jetpackUsedInGap: false,
    jetpackSonando: false,
    camera: 0,
    lastReportedOxygen: 100,
    lastReportedJetpack: 100,
    impulseGapUsed: -1,
    impulseGapsPassed: [],
    groundSegments: [],
    rects: [],
  };

  state.groundSegments = obtenerSegmentosSuelo(mission);
  return state;
}

export function obtenerSegmentosSuelo(mission) {
  const gaps = mission.gaps.slice().sort((a, b) => a[0] - b[0]);
  const segments = [];
  let cursor = 0;
  gaps.forEach((gap) => {
    if (gap[0] > cursor) segments.push({ x: cursor, w: gap[0] - cursor });
    cursor = gap[1];
  });
  if (cursor < mission.world) segments.push({ x: cursor, w: mission.world - cursor });
  return segments;
}

export function obtenerRects(mission, floorY, time) {
  const rects = [];
  mission.blocks.forEach((block) => {
    rects.push({ x: block[0], y: floorY - block[1], w: block[2] || 48, h: block[1], type: "block" });
  });
  mission.platforms.forEach((platform) => {
    rects.push({ x: platform[0], y: floorY - platform[2], w: platform[1], h: 14, type: "platform" });
  });
  (mission.movingPlatforms || []).forEach((platform, index) => {
    const velocidad = platform[4];
    const fase = platform[5];
    const oscilacion = Math.sin(time / 1000 * velocidad + fase);
    let px = platform[0];
    const gap = mission.gaps.find((item) => platform[0] >= item[0] - 2 && platform[0] <= item[1] + 2);
    if (gap) {
      const margen = 18;
      const recorrido = Math.max(0, gap[1] - gap[0] - platform[1] - margen * 2);
      const avance = 0.5 - 0.5 * Math.cos(time / 1000 * velocidad + fase);
      px = gap[0] + margen + recorrido * avance;
    }
    const y = floorY - platform[2] + oscilacion * platform[3];
    rects.push({ x: px, y, w: platform[1], h: 14, type: "moving-platform", index });
  });
  return rects;
}

export function laserActivo(laser, time) {
  const period = laser[2] || 2.5;
  const phase = laser[3] || 0;
  const ratio = laser[4] || 0.5;
  const step = ((time / 1000 + phase) % period + period) % period;
  return step < period * ratio;
}

export function limpiarTeclas(state) {
  state.keys.clear();
  document.querySelectorAll("[data-control].activo").forEach((button) => button.classList.remove("activo"));
}

export function reiniciarJugador(state, mission, callbacks, floorY) {
  const player = state.player;
  player.x = 34;
  player.y = floorY - player.height;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;

  state.oxygen = 100;
  state.collected = 0;
  state.energyCollected = 0;
  state.exitActivated = false;
  state.gravityPulseRemaining = 0;
  state.abilityCooldown = 0;
  state.abilityRunRemaining = 0;
  state.exitMessageShown = false;
  state.stationUsed = false;

  state.orbs.forEach((orb) => { orb.collected = false; });
  state.energyCells.forEach((cell) => { cell.collected = false; });
  state.impulsePads.forEach((pad) => { pad.activated = false; });

  state.impulseGapUsed = -1;
  state.impulseGapsPassed = [];
  state.jetpackCollected = false;
  state.jetpackFuel = 100;
  state.jetpackUsedInGap = false;
  state.jetpackSonando = false;

  audioJuego()?.setJetpack(false);
  state.invulnerability = 1.4;
  limpiarTeclas(state);

  callbacks.onOxygenChange(state.oxygen, state.collected, state.orbs.length);
  callbacks.onJetpackChange(state.jetpackFuel, state.jetpackCollected);
  callbacks.onEnergyChange(state.energyCollected, mission.requiredEnergy || 0);
}

export function perderVida(state, mission, callbacks, floorY, message) {
  if (state.invulnerability > 0 || state.gameOver || state.finished) return;
  const texto = String(message || "");
  if (/rayo|láser|laser/i.test(texto)) sfx("laser");
  else if (/caíste|caiste|cráter|crater|vacío|vacio/i.test(texto)) sfx("fall");
  else if (/oxígeno|oxigeno/i.test(texto)) sfx("oxygen");
  else sfx("hurt");

  state.lives = Math.max(0, state.lives - 1);
  callbacks.onLivesChange(state.lives);
  reiniciarJugador(state, mission, callbacks, floorY);

  if (state.lives === 0) {
    state.gameOver = true;
    state.invulnerability = 0;
    callbacks.onGameOver();
    callbacks.onMessage("Se agotaron los 3 corazones. Podés reintentar el nivel.");
    return;
  }
  callbacks.onMessage(message + " Perdiste un corazón; te quedan " + state.lives + ".");
}

export function reiniciarNivel(state, mission, callbacks) {
  state.lives = 3;
  state.gameOver = false;
  state.finished = false;
  state.lastReportedOxygen = 100;
  if (state.lastFloor !== null) reiniciarJugador(state, mission, callbacks, state.lastFloor);
  state.invulnerability = 1.1;
  sfx("select");
  callbacks.onLivesChange(state.lives);
  callbacks.onJetpackChange(state.jetpackFuel, state.jetpackCollected);
  callbacks.onRestart();
  callbacks.onMessage("Nuevo intento: tenés 3 corazones y el combustible de la nave ya está cargado.");
}
