/* Apertura, cierre y accesibilidad del modal de opciones. */

import { pintarAjustes } from "./audio.js";
import { actualizarEstadisticas } from "./estadisticas.js";
import { actualizarPantallaCompleta } from "./pantalla-completa.js";
import { mostrarEstado } from "./estado.js";

export function iniciarModal() {
  const menuOpciones = document.getElementById("menuOpciones");
  const panelOpciones = document.getElementById("panelOpciones");
  const cerrarOpciones = document.getElementById("cerrarOpciones");
  const opciones = document.getElementById("opciones");
  let focoAnterior = null;

  function abrirOpciones() {
    if (!menuOpciones) return;
    focoAnterior = document.activeElement;

    menuOpciones.classList.add("activo");
    menuOpciones.setAttribute("aria-hidden", "false");
    opciones?.setAttribute("aria-expanded", "true");
    document.body.classList.add("opciones-abiertas");

    pintarAjustes();
    actualizarEstadisticas();
    actualizarPantallaCompleta();
    mostrarEstado("Los cambios se guardan automáticamente.");

    window.setTimeout(() => {
      if (menuOpciones.classList.contains("activo")) {
        (panelOpciones || menuOpciones).focus();
      }
    }, 80);
  }

  function cerrarModal() {
    if (!menuOpciones) return;

    menuOpciones.classList.remove("activo");
    menuOpciones.setAttribute("aria-hidden", "true");
    opciones?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("opciones-abiertas");

    if (focoAnterior && typeof focoAnterior.focus === "function") {
      focoAnterior.focus();
    }
    focoAnterior = null;
  }

  opciones?.addEventListener("click", abrirOpciones);
  cerrarOpciones?.addEventListener("click", cerrarModal);

  menuOpciones?.addEventListener("click", (evento) => {
    if (evento.target === menuOpciones) cerrarModal();
  });

  document.addEventListener("keydown", (evento) => {
    if (!menuOpciones || !menuOpciones.classList.contains("activo")) return;

    if (evento.key === "Escape") {
      evento.preventDefault();
      cerrarModal();
      return;
    }

    if (evento.key !== "Tab") return;

    const enfocables = panelOpciones
      ? Array.from(
        panelOpciones.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"
        )
      ).filter((elemento) => elemento.offsetParent !== null)
      : [];

    if (!enfocables.length) return;

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    const dentro = panelOpciones && panelOpciones.contains(document.activeElement);

    if (!dentro || document.activeElement === panelOpciones) {
      evento.preventDefault();
      (evento.shiftKey ? ultimo : primero).focus();
      return;
    }

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });
}
