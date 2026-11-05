/* Catálogo de efectos de sonido del juego, generados en tiempo real. */

import { ajustes, limitar } from "./ajustes.js";
import { crearContexto } from "./contexto.js";
import { programarTono, programarRuido } from "./sintesis.js";

export function reproducir(nombre, opciones = {}) {
  if (!ajustes.efectos) return;
  if (!crearContexto()) return;

  switch (nombre) {
    case "jump":
      programarTono({ freq: 300, hasta: 620, tipo: "triangle", duracion: 0.14, volumen: 0.16 });
      break;
    case "jetpackJump":
      programarTono({ freq: 170, hasta: 360, tipo: "sawtooth", duracion: 0.18, volumen: 0.1 });
      programarRuido({ duracion: 0.16, volumen: 0.04, tipo: "bandpass", freq: 500, hasta: 1200, q: 0.9 });
      break;
    case "land": {
      const fuerza = limitar(opciones.fuerza || 1, 0.4, 1.6);
      programarRuido({ duracion: 0.07, volumen: 0.045 * fuerza, tipo: "lowpass", freq: 520, q: 0.8 });
      programarTono({ freq: 125, hasta: 55, tipo: "sine", duracion: 0.13, volumen: 0.13 * fuerza });
      break;
    }
    case "orb":
      programarTono({ freq: 880, hasta: 1320, tipo: "sine", duracion: 0.14, volumen: 0.1 });
      programarTono({ freq: 1320, tipo: "sine", duracion: 0.18, volumen: 0.06, delay: 0.07 });
      break;
    case "energy":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        programarTono({ freq: f, tipo: "triangle", duracion: 0.2, volumen: 0.07, delay: i * 0.07 });
      });
      break;
    case "jetpackPickup":
      programarTono({ freq: 180, hasta: 520, tipo: "sawtooth", duracion: 0.32, volumen: 0.1 });
      programarTono({ freq: 520, hasta: 820, tipo: "triangle", duracion: 0.24, volumen: 0.07, delay: 0.12 });
      break;
    case "impulse":
      programarRuido({ duracion: 0.45, volumen: 0.09, tipo: "bandpass", freq: 300, hasta: 1900, q: 1.2 });
      programarTono({ freq: 150, hasta: 760, tipo: "triangle", duracion: 0.45, volumen: 0.12 });
      break;
    case "pulse":
      programarTono({ freq: 220, hasta: 82, tipo: "sine", duracion: 0.6, volumen: 0.16 });
      programarTono({ freq: 440, hasta: 164, tipo: "sine", duracion: 0.5, volumen: 0.06, delay: 0.05 });
      break;
    case "brake":
      programarRuido({ duracion: 0.28, volumen: 0.09, tipo: "highpass", freq: 1400, hasta: 260 });
      programarTono({ freq: 320, hasta: 120, tipo: "triangle", duracion: 0.2, volumen: 0.06 });
      break;
    case "slingshot":
      programarTono({ freq: 260, hasta: 1180, tipo: "sine", duracion: 0.38, volumen: 0.11 });
      programarRuido({ duracion: 0.3, volumen: 0.05, tipo: "bandpass", freq: 700, hasta: 2400, q: 1.4 });
      break;
    case "beacon":
      [392, 523.25, 659.25].forEach((f, i) => {
        programarTono({ freq: f, tipo: "sine", duracion: 0.7, volumen: 0.06, delay: i * 0.08 });
      });
      programarTono({ freq: 1318.5, tipo: "sine", duracion: 0.5, volumen: 0.035, delay: 0.24 });
      break;
    case "station":
      programarTono({ freq: 659.25, tipo: "sine", duracion: 0.22, volumen: 0.07 });
      programarTono({ freq: 987.77, tipo: "sine", duracion: 0.34, volumen: 0.05, delay: 0.1 });
      break;
    case "laser":
      programarTono({ freq: 1450, hasta: 180, tipo: "sawtooth", duracion: 0.28, volumen: 0.12 });
      programarRuido({ duracion: 0.24, volumen: 0.08, tipo: "bandpass", freq: 2400, hasta: 420, q: 2.2 });
      programarTono({ freq: 160, hasta: 70, tipo: "square", duracion: 0.22, volumen: 0.08, delay: 0.08 });
      break;
    case "hurt":
      programarTono({ freq: 180, hasta: 70, tipo: "square", duracion: 0.28, volumen: 0.11 });
      programarRuido({ duracion: 0.14, volumen: 0.06, tipo: "lowpass", freq: 420 });
      break;
    case "fall":
      programarTono({ freq: 620, hasta: 90, tipo: "sine", duracion: 0.55, volumen: 0.13 });
      programarRuido({ duracion: 0.42, volumen: 0.05, tipo: "lowpass", freq: 360 });
      programarTono({ freq: 82, hasta: 40, tipo: "sine", duracion: 0.2, volumen: 0.16, delay: 0.55 });
      break;
    case "oxygen":
      [880, 660, 880].forEach((f, i) => {
        programarTono({ freq: f, tipo: "square", duracion: 0.11, volumen: 0.05, delay: i * 0.15 });
      });
      break;
    case "gameover":
      [392, 329.63, 261.63, 196].forEach((f, i) => {
        programarTono({ freq: f, tipo: "triangle", duracion: 0.48, volumen: 0.1, delay: i * 0.17 });
      });
      programarTono({ freq: 98, hasta: 49, tipo: "sine", duracion: 1.1, volumen: 0.12, delay: 0.1 });
      break;
    case "win":
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        programarTono({ freq: f, tipo: "triangle", duracion: 0.34, volumen: 0.1, delay: i * 0.11 });
      });
      [523.25, 659.25, 783.99].forEach((f) => {
        programarTono({ freq: f, tipo: "sine", duracion: 1.1, volumen: 0.045, delay: 0.55 });
      });
      break;
    case "select":
      programarTono({ freq: 440, tipo: "sine", duracion: 0.1, volumen: 0.07 });
      programarTono({ freq: 660, tipo: "sine", duracion: 0.14, volumen: 0.06, delay: 0.08 });
      break;
    case "denied":
      programarTono({ freq: 220, hasta: 150, tipo: "square", duracion: 0.18, volumen: 0.06 });
      break;
    case "click":
      programarTono({ freq: 520, hasta: 640, tipo: "triangle", duracion: 0.06, volumen: 0.045 });
      break;
    default:
      break;
  }
}

export function probarSonido() {
  if (!ajustes.efectos) return;
  if (!crearContexto()) return;
  reproducir("jump");
  window.setTimeout(() => reproducir("orb"), 150);
  window.setTimeout(() => reproducir("select"), 360);
}
