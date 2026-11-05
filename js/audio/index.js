/* Punto de entrada del motor de audio.
   Reúne ajustes, síntesis, efectos, música y jetpack en una sola API. */

import { ajustes, cambiarAjustes, obtenerAjustes } from "./ajustes.js";
import { aplicarVolumen, crearContexto, obtenerContexto } from "./contexto.js";
import { probarSonido, reproducir } from "./efectos.js";
import { detenerMusica, escenaDelDocumento, estadoMusica, iniciarMusica } from "./musica.js";
import { configurarJetpack, detenerJetpack } from "./jetpack.js";

function actualizarAjustes(cambios) {
  if (!cambios || typeof cambios !== "object") return obtenerAjustes();

  cambiarAjustes(cambios);
  if (obtenerContexto()) aplicarVolumen(false);

  if ("musica" in cambios) {
    if (ajustes.musica) iniciarMusica(escenaDelDocumento());
    else detenerMusica();
  }
  if ("efectos" in cambios && !ajustes.efectos) detenerJetpack();

  return obtenerAjustes();
}

function estado() {
  const ctx = obtenerContexto();
  const musica = estadoMusica();
  return {
    disponible: Boolean(ctx),
    contexto: ctx ? ctx.state : "sin-contexto",
    musica: musica.activa,
    escena: musica.escena,
    efectos: ajustes.efectos,
    ajustes: obtenerAjustes(),
  };
}

let primerGestoHecho = false;
function primerGesto() {
  if (primerGestoHecho) return;
  primerGestoHecho = true;
  if (!crearContexto()) return;
  iniciarMusica(escenaDelDocumento());
}

document.addEventListener("pointerdown", primerGesto, { passive: true });
document.addEventListener("keydown", primerGesto);
document.addEventListener("click", (evento) => {
  const objetivo = evento.target;
  if (!objetivo || typeof objetivo.closest !== "function") return;
  const control = objetivo.closest("button, a");
  if (!control || control.hasAttribute("data-sin-sonido")) return;
  reproducir("click");
});

document.addEventListener("visibilitychange", () => {
  const ctx = obtenerContexto();
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else ctx.resume().catch(() => {});
});

window.addEventListener("pagehide", () => {
  detenerMusica();
  detenerJetpack();
});

const SonidoJuego = {
  play: reproducir,
  preview: probarSonido,
  startMusic: iniciarMusica,
  stopMusic: detenerMusica,
  setJetpack: configurarJetpack,
  getSettings: obtenerAjustes,
  updateSettings: actualizarAjustes,
  ensure: crearContexto,
  estado,
};

/* Compatibilidad con los scripts clásicos y con js/juego/audio.js. */
window.SonidoJuego = SonidoJuego;

export const play = reproducir;
export const preview = probarSonido;
export const startMusic = iniciarMusica;
export const stopMusic = detenerMusica;
export const setJetpack = configurarJetpack;
export const getSettings = obtenerAjustes;
export const updateSettings = actualizarAjustes;
export const ensure = crearContexto;
export { estado, SonidoJuego };
export default SonidoJuego;
