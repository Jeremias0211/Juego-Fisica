/* Botón de pantalla completa del panel de opciones. */

import { mostrarEstado } from "./estado.js";

function elementoPantallaCompleta() {
  return document.getElementById("pantallaCompleta");
}

function pantallaActiva() {
  return Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

export function actualizarPantallaCompleta() {
  const boton = elementoPantallaCompleta();
  if (!boton) return;

  const activa = pantallaActiva();
  boton.textContent = activa ? "SALIR" : "ACTIVAR";
  boton.setAttribute("aria-pressed", String(activa));
}

async function alternarPantallaCompleta() {
  const raiz = document.documentElement;
  const activa = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

  try {
    if (activa) {
      const salir = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (salir) await salir.call(document);
    } else {
      const entrar = raiz.requestFullscreen || raiz.webkitRequestFullscreen || raiz.msRequestFullscreen;
      if (!entrar) {
        mostrarEstado("Pantalla completa no está disponible en este navegador.", "aviso");
        return;
      }
      await entrar.call(raiz);
    }

    mostrarEstado(
      pantallaActiva()
        ? "Pantalla completa activada. Presioná Esc para salir."
        : "Pantalla completa desactivada.",
      "exito"
    );
  } catch (_) {
    mostrarEstado("El navegador bloqueó la pantalla completa. Probá con un clic directo.", "aviso");
  }

  actualizarPantallaCompleta();
}

export function iniciarPantallaCompleta() {
  const boton = elementoPantallaCompleta();

  if (boton) {
    if (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen) {
      boton.textContent = "NO DISPONIBLE";
      boton.disabled = true;
    } else {
      boton.addEventListener("click", alternarPantallaCompleta);
    }
  }

  ["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach((evento) => {
    document.addEventListener(evento, actualizarPantallaCompleta);
  });
  actualizarPantallaCompleta();
}
