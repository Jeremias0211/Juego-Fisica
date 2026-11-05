/* Ruido continuo del jetpack, activado mientras el jugador lo usa. */

import { ajustes } from "./ajustes.js";
import { crearContexto, obtenerContexto, obtenerBusEfectos } from "./contexto.js";
import { obtenerBufferRuido } from "./sintesis.js";

let jetpackActivo = null;

export function iniciarJetpack() {
  if (jetpackActivo || !ajustes.efectos) return;

  const ctx = crearContexto();
  if (!ctx) return;

  const fuente = ctx.createBufferSource();
  fuente.buffer = obtenerBufferRuido();
  fuente.loop = true;

  const filtro = ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 720;
  filtro.Q.value = 0.9;

  const ganancia = ctx.createGain();
  ganancia.gain.setValueAtTime(0.0001, ctx.currentTime);
  ganancia.gain.exponentialRampToValueAtTime(0.085, ctx.currentTime + 0.08);

  fuente.connect(filtro).connect(ganancia).connect(obtenerBusEfectos());
  fuente.start();
  jetpackActivo = { fuente, ganancia };
}

export function detenerJetpack() {
  if (!jetpackActivo) return;

  const { fuente, ganancia } = jetpackActivo;
  jetpackActivo = null;
  const ctx = obtenerContexto();
  if (!ctx) return;

  const ahora = ctx.currentTime;
  try {
    ganancia.gain.cancelScheduledValues(ahora);
    ganancia.gain.setTargetAtTime(0.0001, ahora, 0.035);
    fuente.stop(ahora + 0.22);
  } catch (_) {
    /* La fuente ya podía estar detenida. */
  }
}

export function configurarJetpack(activo) {
  if (activo) {
    if (ajustes.efectos) iniciarJetpack();
  } else {
    detenerJetpack();
  }
}
