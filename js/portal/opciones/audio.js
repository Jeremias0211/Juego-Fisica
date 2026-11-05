/* Controles de audio del panel de opciones. */

import SonidoJuego from "../../audio/index.js";
import { mostrarEstado } from "./estado.js";

const DEFAULTS = {
  volumen: 80,
  musica: true,
  efectos: true,
  volumenMusica: 55,
  volumenEfectos: 90,
};

function ajustesAudio() {
  return SonidoJuego ? SonidoJuego.getSettings() : { ...DEFAULTS };
}

function guardarAudio(cambios) {
  if (!SonidoJuego) return;
  SonidoJuego.updateSettings(cambios);
}

export function pintarAjustes() {
  const ajustes = ajustesAudio();
  const volumen = document.getElementById("volumen");
  const volumenMusica = document.getElementById("volumenMusica");
  const volumenEfectos = document.getElementById("volumenEfectos");
  const musica = document.getElementById("musica");
  const efectos = document.getElementById("efectos");
  const valorVolumen = document.getElementById("valorVolumen");
  const valorMusica = document.getElementById("valorMusica");
  const valorEfectos = document.getElementById("valorEfectos");

  if (volumen) volumen.value = ajustes.volumen;
  if (volumenMusica) volumenMusica.value = ajustes.volumenMusica;
  if (volumenEfectos) volumenEfectos.value = ajustes.volumenEfectos;

  if (valorVolumen) valorVolumen.textContent = ajustes.volumen + "%";
  if (valorMusica) valorMusica.textContent = ajustes.volumenMusica + "%";
  if (valorEfectos) valorEfectos.textContent = ajustes.volumenEfectos + "%";

  if (musica) musica.checked = ajustes.musica;
  if (efectos) efectos.checked = ajustes.efectos;
}

export function iniciarAudioOpciones() {
  const volumen = document.getElementById("volumen");
  const volumenMusica = document.getElementById("volumenMusica");
  const volumenEfectos = document.getElementById("volumenEfectos");
  const musica = document.getElementById("musica");
  const efectos = document.getElementById("efectos");
  const valorVolumen = document.getElementById("valorVolumen");
  const valorMusica = document.getElementById("valorMusica");
  const valorEfectos = document.getElementById("valorEfectos");
  const probarSonido = document.getElementById("probarSonido");

  volumen?.addEventListener("input", () => {
    if (valorVolumen) valorVolumen.textContent = volumen.value + "%";
    guardarAudio({ volumen: Number(volumen.value) });
  });

  volumenMusica?.addEventListener("input", () => {
    if (valorMusica) valorMusica.textContent = volumenMusica.value + "%";
    guardarAudio({ volumenMusica: Number(volumenMusica.value) });
  });

  volumenEfectos?.addEventListener("input", () => {
    if (valorEfectos) valorEfectos.textContent = volumenEfectos.value + "%";
    guardarAudio({ volumenEfectos: Number(volumenEfectos.value) });
  });

  musica?.addEventListener("change", () => {
    guardarAudio({ musica: musica.checked });
    SonidoJuego?.ensure();
    mostrarEstado(
      musica.checked ? "Música activada. Se guardó tu preferencia." : "Música desactivada.",
      "exito"
    );
  });

  efectos?.addEventListener("change", () => {
    guardarAudio({ efectos: efectos.checked });
    mostrarEstado(efectos.checked ? "Efectos activados." : "Efectos desactivados.", "exito");
  });

  probarSonido?.addEventListener("click", () => {
    if (!SonidoJuego) {
      mostrarEstado("Tu navegador no permite el motor de audio de este juego.", "aviso");
      return;
    }
    SonidoJuego.ensure();
    const ajustes = SonidoJuego.getSettings();
    if (!ajustes.efectos) {
      mostrarEstado("Los efectos están desactivados. Activá el interruptor para escucharlos.", "aviso");
      return;
    }
    SonidoJuego.preview();
    mostrarEstado("Reproduciendo una muestra: salto, orbe y selección.", "exito");
  });

  pintarAjustes();
}
