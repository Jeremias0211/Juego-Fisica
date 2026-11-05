/* Interfaz flotante del asistente: launcher, panel, mensajes y formulario. */

import { responder } from "./respuestas.js";

function inyectarEstilos() {
  if (!document.querySelector('link[href$="Asistente.css"]')) {
    const estilos = document.createElement("link");
    estilos.rel = "stylesheet";
    estilos.href = "../css/Asistente.css";
    document.head.append(estilos);
  }
}

function crearEstructura() {
  const launcher = document.createElement("button");
  launcher.className = "asistente-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Abrir asistente del juego");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "asistenteJuego");
  launcher.innerHTML = '<span aria-hidden="true">✦</span><span class="asistente-launcher-texto">AYUDA</span>';

  const panel = document.createElement("section");
  panel.className = "asistente-panel";
  panel.id = "asistenteJuego";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Asistente del juego");
  panel.hidden = true;
  panel.innerHTML = `
    <header class="asistente-cabecera">
      <div class="asistente-avatar" aria-hidden="true">✦</div>
      <div class="asistente-identidad"><strong>Asistente de misión</strong><span><i></i> Ayuda del juego</span></div>
      <button class="asistente-cerrar" type="button" aria-label="Cerrar asistente">×</button>
    </header>
    <div class="asistente-mensajes" role="log" aria-live="polite" aria-relevant="additions text"></div>
    <div class="asistente-sugerencias" aria-label="Preguntas frecuentes">
      <button type="button" data-pregunta="¿Cuáles son los controles?">Controles</button>
      <button type="button" data-pregunta="¿Cómo recupero oxígeno?">Oxígeno</button>
      <button type="button" data-pregunta="¿Qué habilidad tiene cada nivel?">Habilidades</button>
      <button type="button" data-pregunta="¿Cómo paso al siguiente nivel?">Niveles</button>
      <button type="button" data-pregunta="¿Cuántas vidas tengo?">Vidas</button>
      <button type="button" data-pregunta="¿Cómo funciona el puntaje y el ranking?">Puntaje</button>
    </div>
    <form class="asistente-formulario">
      <label class="solo-lector" for="asistenteEntrada">Escribí una pregunta sobre el juego</label>
      <input id="asistenteEntrada" name="pregunta" maxlength="240" autocomplete="off" placeholder="Preguntá sobre el juego…" required>
      <button type="submit" aria-label="Enviar pregunta">➤</button>
    </form>
    <p class="asistente-aviso">Solo responde consultas sobre Nuevo Hogar.</p>`;

  return { launcher, panel };
}

function conectarEventos(launcher, panel) {
  const mensajes = panel.querySelector(".asistente-mensajes");
  const formulario = panel.querySelector(".asistente-formulario");
  const entrada = panel.querySelector("#asistenteEntrada");
  const closeButton = panel.querySelector(".asistente-cerrar");

  function agregarMensaje(texto, tipo) {
    const burbuja = document.createElement("p");
    burbuja.className = `asistente-mensaje ${tipo}`;
    burbuja.textContent = texto;
    mensajes.append(burbuja);
    mensajes.scrollTop = mensajes.scrollHeight;
    return burbuja;
  }

  function mostrarPanel(abrir) {
    panel.hidden = !abrir;
    launcher.setAttribute("aria-expanded", String(abrir));
    if (abrir) entrada.focus();
  }

  launcher.addEventListener("click", () => {
    const abrir = panel.hidden;
    mostrarPanel(abrir);
    if (abrir && !mensajes.childElementCount) {
      agregarMensaje("¡Hola! Soy tu asistente de misión. ¿En qué te ayudo con el juego?", "bot");
    }
  });

  closeButton.addEventListener("click", () => {
    mostrarPanel(false);
    launcher.focus();
  });

  panel.querySelectorAll("[data-pregunta]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const pregunta = boton.dataset.pregunta;
      agregarMensaje(pregunta, "usuario");
      agregarMensaje(responder(pregunta), "bot");
    });
  });

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();
    const pregunta = entrada.value.trim();
    if (!pregunta) return;
    agregarMensaje(pregunta, "usuario");
    agregarMensaje(responder(pregunta), "bot");
    entrada.value = "";
    entrada.focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      mostrarPanel(false);
      launcher.focus();
    }
  });
}

export function crearAsistente() {
  if (document.getElementById("asistenteJuego")) return;

  inyectarEstilos();
  const { launcher, panel } = crearEstructura();
  document.body.append(launcher, panel);
  conectarEventos(launcher, panel);
}
