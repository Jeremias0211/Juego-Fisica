/* Síntesis básica: ruido compartido, tonos y ráfagas filtradas. */

import { obtenerContexto, obtenerBusEfectos } from "./contexto.js";

let bufferRuido = null;

export function obtenerBufferRuido() {
  const ctx = obtenerContexto();
  if (bufferRuido || !ctx) return bufferRuido;

  const duracion = 1;
  const muestras = Math.floor(ctx.sampleRate * duracion);
  bufferRuido = ctx.createBuffer(1, muestras, ctx.sampleRate);
  const datos = bufferRuido.getChannelData(0);
  for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1;
  return bufferRuido;
}

export function programarTono(opciones) {
  const ctx = obtenerContexto();
  if (!ctx) return;

  const {
    freq,
    hasta,
    tipo = "sine",
    duracion = 0.2,
    volumen = 0.1,
    ataque = 0.008,
    delay = 0,
    detune = 0,
    destino = obtenerBusEfectos(),
  } = opciones;

  const t = ctx.currentTime + Math.max(0, delay);
  const osc = ctx.createOscillator();
  const ganancia = ctx.createGain();

  osc.type = tipo;
  osc.frequency.setValueAtTime(Math.max(20, freq), t);
  if (hasta && hasta !== freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, hasta), t + duracion);
  }
  if (detune) osc.detune.setValueAtTime(detune, t);

  ganancia.gain.setValueAtTime(0.0001, t);
  ganancia.gain.exponentialRampToValueAtTime(Math.max(0.0002, volumen), t + ataque);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t + duracion);

  osc.connect(ganancia).connect(destino);
  osc.start(t);
  osc.stop(t + duracion + 0.03);
}

export function programarRuido(opciones) {
  const ctx = obtenerContexto();
  if (!ctx) return;

  const {
    duracion = 0.25,
    volumen = 0.08,
    tipo = "bandpass",
    freq = 900,
    hasta,
    q = 0.8,
    delay = 0,
    destino = obtenerBusEfectos(),
  } = opciones;

  const t = ctx.currentTime + Math.max(0, delay);
  const fuente = ctx.createBufferSource();
  fuente.buffer = obtenerBufferRuido();
  fuente.loop = true;

  const filtro = ctx.createBiquadFilter();
  filtro.type = tipo;
  filtro.frequency.setValueAtTime(Math.max(30, freq), t);
  if (hasta) filtro.frequency.exponentialRampToValueAtTime(Math.max(30, hasta), t + duracion);
  filtro.Q.value = q;

  const ganancia = ctx.createGain();
  ganancia.gain.setValueAtTime(0.0001, t);
  ganancia.gain.exponentialRampToValueAtTime(Math.max(0.0002, volumen), t + 0.012);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t + duracion);

  fuente.connect(filtro).connect(ganancia).connect(destino);
  fuente.start(t);
  fuente.stop(t + duracion + 0.03);
}
