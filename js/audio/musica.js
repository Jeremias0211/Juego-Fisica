/* Música procedural: acordes, bajo, arpegios y pulso según la pantalla. */

import { ajustes } from "./ajustes.js";
import { crearContexto, obtenerContexto, obtenerBusMusica } from "./contexto.js";

const ACORDES = [
  [110.0, 261.63, 329.63, 440.0], // La menor
  [87.31, 220.0, 261.63, 349.23], // Fa mayor
  [130.81, 261.63, 329.63, 392.0], // Do mayor
  [98.0, 246.94, 293.66, 392.0], // Sol mayor
];

let escenaMusica = null;
let musicaActiva = false;
let temporizadorMusica = null;
let sesionMusica = null;
let vocesMusica = new Set();
let proximoCompas = 0;
let numeroCompas = 0;

function registrarVoz(voz) {
  vocesMusica.add(voz);
  voz.addEventListener("ended", () => vocesMusica.delete(voz));
}

function tonoMusical(freq, cuando, duracion, volumen) {
  const ctx = obtenerContexto();
  if (!ctx || !sesionMusica) return;

  const osc = ctx.createOscillator();
  const ganancia = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, cuando);
  ganancia.gain.setValueAtTime(0.0001, cuando);
  ganancia.gain.exponentialRampToValueAtTime(Math.max(0.0002, volumen), cuando + 0.03);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, cuando + duracion);
  osc.connect(ganancia).connect(sesionMusica);
  osc.start(cuando);
  osc.stop(cuando + duracion + 0.03);
  registrarVoz(osc);
}

function programarCompas(t, indice, escena, largo) {
  const ctx = obtenerContexto();
  if (!ctx || !sesionMusica) return;

  const acorde = ACORDES[indice % ACORDES.length];
  const intensidad = escena === "juego" ? 1 : 0.78;

  // Colchón de cuerdas: osciladores suaves y desafinados entre sí.
  acorde.slice(1).forEach((frecuencia, i) => {
    [0, 6].forEach((detune, j) => {
      const osc = ctx.createOscillator();
      const ganancia = ctx.createGain();
      osc.type = j === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(frecuencia, t);
      osc.detune.setValueAtTime(detune, t);
      ganancia.gain.setValueAtTime(0.0001, t);
      ganancia.gain.exponentialRampToValueAtTime(0.012 * intensidad / (i + 1), t + 1.3);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, t + largo + 0.9);
      osc.connect(ganancia).connect(sesionMusica);
      osc.start(t);
      osc.stop(t + largo + 1.05);
      registrarVoz(osc);
    });
  });

  // Bajo profundo.
  const bajo = ctx.createOscillator();
  const gananciaBajo = ctx.createGain();
  bajo.type = "sine";
  bajo.frequency.setValueAtTime(acorde[0] / 2, t);
  gananciaBajo.gain.setValueAtTime(0.0001, t);
  gananciaBajo.gain.exponentialRampToValueAtTime(0.05 * intensidad, t + 0.8);
  gananciaBajo.gain.exponentialRampToValueAtTime(0.0001, t + largo + 0.5);
  bajo.connect(gananciaBajo).connect(sesionMusica);
  bajo.start(t);
  bajo.stop(t + largo + 0.7);
  registrarVoz(bajo);

  // Arpegio cristalino.
  const pasos = escena === "juego" ? 8 : 4;
  for (let i = 0; i < pasos; i++) {
    const nota = acorde[(i % (acorde.length - 1)) + 1] * 2;
    const cuando = t + i * (largo / pasos);
    tonoMusical(nota, cuando, escena === "juego" ? 0.55 : 0.9, 0.022 * intensidad);
  }

  // Pulso rítmico muy suave en el modo juego.
  if (escena === "juego") {
    for (let i = 0; i < 4; i++) {
      const cuando = t + i * (largo / 4);
      const pulso = ctx.createOscillator();
      const ganancia = ctx.createGain();
      pulso.type = "sine";
      pulso.frequency.setValueAtTime(58, cuando);
      pulso.frequency.exponentialRampToValueAtTime(38, cuando + 0.12);
      ganancia.gain.setValueAtTime(0.0001, cuando);
      ganancia.gain.exponentialRampToValueAtTime(i === 0 || i === 2 ? 0.045 : 0.022, cuando + 0.01);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, cuando + 0.16);
      pulso.connect(ganancia).connect(sesionMusica);
      pulso.start(cuando);
      pulso.stop(cuando + 0.2);
      registrarVoz(pulso);
    }
  }
}

function programarCompases() {
  const ctx = obtenerContexto();
  if (!musicaActiva || !ctx || !sesionMusica) return;

  const largo = escenaMusica === "juego" ? 3.4 : 4.6;
  if (proximoCompas < ctx.currentTime - 0.1) proximoCompas = ctx.currentTime + 0.05;
  let margen = 0;
  while (proximoCompas < ctx.currentTime + 1.1 && margen < 4) {
    programarCompas(proximoCompas, numeroCompas, escenaMusica, largo);
    proximoCompas += largo;
    numeroCompas++;
    margen++;
  }
}

export function escenaDelDocumento() {
  const valor = document.body && document.body.dataset ? document.body.dataset.musica : "";
  if (valor === "juego") return "juego";
  if (valor === "menu") return "menu";
  return null;
}

export function iniciarMusica(escena) {
  const destino = escena || escenaDelDocumento();
  if (!destino || !ajustes.musica) return;

  const ctx = crearContexto();
  if (!ctx) return;
  if (musicaActiva && escenaMusica === destino) return;

  detenerMusica();
  escenaMusica = destino;
  musicaActiva = true;
  numeroCompas = 0;
  proximoCompas = ctx.currentTime + 0.15;
  sesionMusica = ctx.createGain();
  sesionMusica.gain.setValueAtTime(0.0001, ctx.currentTime);
  sesionMusica.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.1);
  sesionMusica.connect(obtenerBusMusica());
  programarCompases();
  temporizadorMusica = window.setInterval(programarCompases, 350);
}

export function detenerMusica() {
  musicaActiva = false;
  if (temporizadorMusica) {
    window.clearInterval(temporizadorMusica);
    temporizadorMusica = null;
  }

  const ctx = obtenerContexto();
  if (!ctx || !sesionMusica) return;

  const sesion = sesionMusica;
  sesionMusica = null;
  const ahora = ctx.currentTime;
  try {
    sesion.gain.cancelScheduledValues(ahora);
    sesion.gain.setTargetAtTime(0.0001, ahora, 0.07);
  } catch (_) {
    /* La sesión ya podía estar desconectada. */
  }
  vocesMusica.forEach((voz) => {
    try { voz.stop(ahora + 0.25); } catch (_) { /* ya estaba detenida */ }
  });
  vocesMusica.clear();
  window.setTimeout(() => {
    try { sesion.disconnect(); } catch (_) { /* nada */ }
  }, 520);
}

export function estadoMusica() {
  return { activa: musicaActiva, escena: escenaMusica };
}
