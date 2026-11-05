/* Puente corto entre la lógica del juego y el motor de audio modular. */

import SonidoJuego from "../audio/index.js";

export function sfx(nombre, opciones) {
  try {
    SonidoJuego.play(nombre, opciones);
  } catch (_) {
    /* El juego sigue funcionando aunque el navegador bloquee el audio. */
  }
}

export function audioJuego() {
  return SonidoJuego;
}
