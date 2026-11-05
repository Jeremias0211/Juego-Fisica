/* Contexto de Web Audio API y buses maestros de música y efectos. */

import { ajustes } from "./ajustes.js";

let ctx = null;
let master = null;
let busEfectos = null;
let busMusica = null;
let compresor = null;

export function crearContexto() {
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  try {
    ctx = new AudioCtor();
  } catch (_) {
    return null;
  }

  compresor = ctx.createDynamicsCompressor();
  compresor.threshold.value = -18;
  compresor.knee.value = 24;
  compresor.ratio.value = 6;
  compresor.attack.value = 0.003;
  compresor.release.value = 0.25;

  master = ctx.createGain();
  busEfectos = ctx.createGain();
  busMusica = ctx.createGain();

  busEfectos.connect(master);
  busMusica.connect(master);
  master.connect(compresor);
  compresor.connect(ctx.destination);

  aplicarVolumen(true);
  return ctx;
}

export function obtenerContexto() {
  return ctx;
}

export function obtenerBusEfectos() {
  return busEfectos;
}

export function obtenerBusMusica() {
  return busMusica;
}

export function aplicarVolumen(inmediato) {
  if (!ctx) return;
  const ahora = ctx.currentTime;
  const maestro = Math.pow(ajustes.volumen / 100, 1.6);
  const musica = ajustes.musica ? Math.pow(ajustes.volumenMusica / 100, 1.4) : 0;
  const efectos = ajustes.efectos ? Math.pow(ajustes.volumenEfectos / 100, 1.4) : 0;

  if (inmediato) {
    master.gain.value = maestro;
    busMusica.gain.value = musica;
    busEfectos.gain.value = efectos;
    return;
  }

  master.gain.setTargetAtTime(maestro, ahora, 0.03);
  busMusica.gain.setTargetAtTime(musica, ahora, 0.03);
  busEfectos.gain.setTargetAtTime(efectos, ahora, 0.03);
}
