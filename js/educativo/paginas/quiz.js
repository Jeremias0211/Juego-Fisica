/* Cuestionario educativo: modos, ronda de 10, corrección y progreso local. */

import {
  PREGUNTAS_QUIZ,
  PREGUNTAS_POR_RONDA,
  CATEGORIAS_QUIZ
} from "../datos/quiz.js";
import { obtenerProgreso, guardarIntentoQuiz } from "../progreso.js";
import { evaluarLogros } from "../logros.js";
import { requerirSesion } from "../../portal/sesion.js";
import SonidoJuego from "../../audio/index.js";

const sesion = requerirSesion();
if (sesion) iniciar(sesion);

function iniciar(sesionActual) {
  const usuario = sesionActual.jugadorActual || "Invitado";
  const modosValidos = ["planetas", "fisica", "mixto"];

  const inicio = document.getElementById("quizInicio");
  const juego = document.getElementById("quizJuego");
  const resultado = document.getElementById("quizResultado");
  const botonesModo = Array.from(document.querySelectorAll(".quiz-modo[data-modo]"));
  const comenzarQuiz = document.getElementById("comenzarQuiz");
  const quizMejorGeneral = document.getElementById("quizMejorGeneral");
  const quizProgreso = document.getElementById("quizProgreso");
  const quizCategoria = document.getElementById("quizCategoria");
  const quizPuntaje = document.getElementById("quizPuntaje");
  const quizBarra = document.getElementById("quizBarra");
  const quizBarraContenedor = document.getElementById("quizBarraContenedor");
  const quizPregunta = document.getElementById("quizPregunta");
  const quizOpciones = document.getElementById("quizOpciones");
  const quizFeedback = document.getElementById("quizFeedback");
  const quizFeedbackTitulo = document.getElementById("quizFeedbackTitulo");
  const quizFeedbackTexto = document.getElementById("quizFeedbackTexto");
  const siguientePregunta = document.getElementById("siguientePregunta");
  const abandonarQuiz = document.getElementById("abandonarQuiz");
  const quizResultadoPuntaje = document.getElementById("quizResultadoPuntaje");
  const quizResultadoAciertos = document.getElementById("quizResultadoAciertos");
  const quizResultadoTitulo = document.getElementById("quizResultadoTitulo");
  const quizResultadoTexto = document.getElementById("quizResultadoTexto");
  const quizResultadoMejor = document.getElementById("quizResultadoMejor");
  const quizResultadoLogros = document.getElementById("quizResultadoLogros");
  const repetirQuiz = document.getElementById("repetirQuiz");
  const cambiarModo = document.getElementById("cambiarModo");

  let modoActivo = "mixto";
  let ronda = [];
  let indice = 0;
  let aciertos = 0;
  let respondida = false;

  function mezclar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function prepararPregunta(pregunta) {
    const opciones = mezclar(
      pregunta.opciones.map((texto, posicion) => ({
        texto,
        correcta: posicion === pregunta.correcta
      }))
    );
    return { ...pregunta, opciones };
  }

  function crearRonda(modo) {
    const planetas = mezclar(PREGUNTAS_QUIZ.filter((pregunta) => pregunta.categoria === "planetas"));
    const fisica = mezclar(PREGUNTAS_QUIZ.filter((pregunta) => pregunta.categoria === "fisica"));
    let seleccion;

    if (modo === "planetas") {
      seleccion = planetas.slice(0, PREGUNTAS_POR_RONDA);
    } else if (modo === "fisica") {
      seleccion = fisica.slice(0, PREGUNTAS_POR_RONDA);
    } else {
      seleccion = [...planetas.slice(0, 5), ...fisica.slice(0, 5)];
      if (seleccion.length < PREGUNTAS_POR_RONDA) {
        const ids = new Set(seleccion.map((pregunta) => pregunta.id));
        const resto = mezclar(PREGUNTAS_QUIZ.filter((pregunta) => !ids.has(pregunta.id)));
        seleccion.push(...resto.slice(0, PREGUNTAS_POR_RONDA - seleccion.length));
      }
    }

    return mezclar(seleccion).map(prepararPregunta);
  }

  function mejorDelModo(modo) {
    const progreso = obtenerProgreso(usuario);
    const intentos = progreso.quiz.intentos.filter((intento) => intento.modo === modo);
    const mejor = intentos.reduce(
      (maximo, intento) => Math.max(maximo, Number(intento.puntaje) || 0),
      0
    );
    return { mejor, intentos: intentos.length };
  }

  function actualizarMejores() {
    for (const modo of modosValidos) {
      const { mejor, intentos } = mejorDelModo(modo);
      const etiqueta = document.querySelector(`.quiz-modo-mejor[data-mejor="${modo}"]`);
      if (etiqueta) {
        etiqueta.textContent = intentos > 0 ? `Mejor: ${mejor}% · ${intentos} ronda${intentos === 1 ? "" : "s"}` : "Mejor: —";
      }
    }

    const progreso = obtenerProgreso(usuario);
    const totalIntentos = progreso.quiz.intentos.length;
    if (quizMejorGeneral) {
      quizMejorGeneral.textContent = totalIntentos > 0
        ? `Mejor resultado general: ${progreso.quiz.mejorPuntaje}% · ${totalIntentos} ronda${totalIntentos === 1 ? "" : "s"} completada${totalIntentos === 1 ? "" : "s"}`
        : "Mejor resultado general: —";
    }
  }

  function seleccionarModo(modo) {
    if (!modosValidos.includes(modo)) return;
    modoActivo = modo;

    for (const boton of botonesModo) {
      const activo = boton.dataset.modo === modo;
      boton.classList.toggle("activo", activo);
      boton.setAttribute("aria-pressed", String(activo));
    }

    SonidoJuego?.play("select");
  }

  function mostrarInicio() {
    ronda = [];
    indice = 0;
    aciertos = 0;
    respondida = false;
    juego.hidden = true;
    resultado.hidden = true;
    inicio.hidden = false;
    actualizarMejores();
    window.requestAnimationFrame(() => comenzarQuiz?.focus());
  }

  function actualizarMarcador() {
    if (quizProgreso) quizProgreso.textContent = `PREGUNTA ${indice + 1} DE ${ronda.length}`;
    if (quizPuntaje) quizPuntaje.textContent = `${aciertos} ACIERTO${aciertos === 1 ? "" : "S"}`;
    if (quizCategoria) {
      quizCategoria.textContent = CATEGORIAS_QUIZ[ronda[indice]?.categoria]?.etiqueta.toUpperCase() || "REPASO";
    }
    if (quizBarraContenedor) {
      quizBarraContenedor.setAttribute("aria-valuemax", String(ronda.length));
      quizBarraContenedor.setAttribute("aria-valuenow", String(indice + 1));
    }
    if (quizBarra) {
      const porcentaje = ronda.length ? ((indice + 1) / ronda.length) * 100 : 0;
      quizBarra.style.width = `${porcentaje}%`;
    }
  }

  function enfocar(elemento) {
    if (!elemento) return;
    window.requestAnimationFrame(() => {
      try {
        elemento.focus({ preventScroll: true });
      } catch (_) {
        elemento.focus();
      }
    });
  }

  function renderizarPregunta() {
    const pregunta = ronda[indice];
    if (!pregunta) return;

    respondida = false;
    actualizarMarcador();
    if (quizPregunta) quizPregunta.textContent = pregunta.pregunta;
    if (quizFeedback) quizFeedback.hidden = true;
    if (siguientePregunta) {
      siguientePregunta.hidden = true;
      siguientePregunta.textContent = indice === ronda.length - 1 ? "VER RESULTADO →" : "SIGUIENTE →";
    }

    if (quizOpciones) {
      quizOpciones.replaceChildren(
        ...pregunta.opciones.map((opcion, posicion) => {
          const boton = document.createElement("button");
          boton.type = "button";
          boton.className = "quiz-opcion";
          boton.dataset.posicion = String(posicion);

          const letra = document.createElement("span");
          letra.className = "quiz-opcion-letra";
          letra.setAttribute("aria-hidden", "true");
          letra.textContent = String.fromCharCode(65 + posicion);

          const texto = document.createElement("span");
          texto.className = "quiz-opcion-texto";
          texto.textContent = opcion.texto;

          boton.append(letra, texto);
          boton.addEventListener("click", () => responder(boton, opcion));
          return boton;
        })
      );
    }

    enfocar(quizPregunta);
  }

  function responder(botonElegido, opcionElegida) {
    if (respondida) return;
    respondida = true;

    const pregunta = ronda[indice];
    const correcta = Boolean(opcionElegida.correcta);
    if (correcta) aciertos += 1;

    const botones = Array.from(quizOpciones?.querySelectorAll(".quiz-opcion") || []);
    botones.forEach((boton, posicion) => {
      const opcion = pregunta.opciones[posicion];
      boton.disabled = true;
      boton.classList.toggle("correcta", Boolean(opcion.correcta));
      boton.classList.toggle("incorrecta", boton === botonElegido && !opcion.correcta);
      if (boton === botonElegido) boton.setAttribute("aria-pressed", "true");
    });

    if (quizPuntaje) quizPuntaje.textContent = `${aciertos} ACIERTO${aciertos === 1 ? "" : "S"}`;

    const respuestaCorrecta = pregunta.opciones.find((opcion) => opcion.correcta)?.texto || "";
    if (quizFeedbackTitulo) {
      quizFeedbackTitulo.textContent = correcta
        ? "✓ ¡Correcto!"
        : `✗ La respuesta correcta era: ${respuestaCorrecta}`;
      quizFeedbackTitulo.classList.toggle("bien", correcta);
      quizFeedbackTitulo.classList.toggle("mal", !correcta);
    }
    if (quizFeedbackTexto) quizFeedbackTexto.textContent = pregunta.explicacion;
    if (quizFeedback) quizFeedback.hidden = false;
    if (siguientePregunta) siguientePregunta.hidden = false;

    SonidoJuego?.play(correcta ? "select" : "denied");
    enfocar(quizFeedback);
  }

  function siguiente() {
    if (!respondida) return;
    if (indice < ronda.length - 1) {
      indice += 1;
      renderizarPregunta();
      return;
    }
    finalizarRonda();
  }

  function finalizarRonda() {
    const total = ronda.length;
    const porcentaje = total ? Math.round((aciertos / total) * 100) : 0;
    guardarIntentoQuiz(usuario, { puntaje: porcentaje, total, modo: modoActivo });
    const { nuevos } = evaluarLogros(usuario);
    const { mejor } = mejorDelModo(modoActivo);

    if (quizResultadoPuntaje) quizResultadoPuntaje.textContent = `${porcentaje}%`;
    if (quizResultadoAciertos) {
      quizResultadoAciertos.textContent = `${aciertos} de ${total} respuestas correctas`;
    }

    let titulo = "A seguir practicando";
    let texto = "Cada ronda es una oportunidad para repasar. Volvé a las fichas y probá de nuevo.";
    if (porcentaje === 100) {
      titulo = "¡Ronda perfecta!";
      texto = "Respondiste todo bien. Podés cambiar de modo o intentar otra ronda para mantener el nivel.";
    } else if (porcentaje >= 80) {
      titulo = "¡Muy bien!";
      texto = "Tenés una base sólida. Revisá las explicaciones de las preguntas que fallaste y volvé a intentarlo.";
    } else if (porcentaje >= 60) {
      titulo = "Buen trabajo";
      texto = "Vas por buen camino. Las fichas del Universo pueden ayudarte con los datos que todavía se mezclan.";
    } else if (porcentaje >= 40) {
      titulo = "Vas por buen camino";
      texto = "Ya reconocés varias ideas. Una lectura rápida de las fichas y otra ronda pueden mejorar mucho el resultado.";
    }

    if (quizResultadoTitulo) {
      quizResultadoTitulo.textContent = titulo;
      quizResultadoTitulo.setAttribute("tabindex", "-1");
    }
    if (quizResultadoTexto) quizResultadoTexto.textContent = texto;
    if (quizResultadoMejor) {
      const modoEtiqueta = modoActivo === "mixto" ? "mixto" : CATEGORIAS_QUIZ[modoActivo].etiqueta.toLowerCase();
      quizResultadoMejor.textContent = porcentaje >= mejor
        ? `¡Nuevo mejor resultado en modo ${modoEtiqueta}: ${porcentaje}%!`
        : `Tu mejor resultado en modo ${modoEtiqueta} es ${mejor}%.`;
    }
    if (quizResultadoLogros) {
      quizResultadoLogros.hidden = nuevos.length === 0;
      if (nuevos.length) {
        quizResultadoLogros.textContent = nuevos.length === 1
          ? `🏅 Nuevo logro desbloqueado: ${nuevos[0].nombre}`
          : `🏅 Nuevos logros: ${nuevos.map((logro) => logro.nombre).join(", ")}`;
      }
    }

    juego.hidden = true;
    inicio.hidden = true;
    resultado.hidden = false;
    actualizarMejores();

    SonidoJuego?.play(porcentaje >= 60 ? "station" : "select");
    enfocar(quizResultadoTitulo);
  }

  function comenzarRonda() {
    ronda = crearRonda(modoActivo);
    if (!ronda.length) return;
    indice = 0;
    aciertos = 0;
    respondida = false;
    inicio.hidden = true;
    resultado.hidden = true;
    juego.hidden = false;
    renderizarPregunta();
    SonidoJuego?.play("station");
  }

  botonesModo.forEach((boton) => {
    boton.addEventListener("click", () => seleccionarModo(boton.dataset.modo));
  });

  comenzarQuiz?.addEventListener("click", comenzarRonda);
  siguientePregunta?.addEventListener("click", siguiente);
  abandonarQuiz?.addEventListener("click", mostrarInicio);
  repetirQuiz?.addEventListener("click", comenzarRonda);
  cambiarModo?.addEventListener("click", mostrarInicio);

  const modoUrl = new URLSearchParams(location.search).get("modo");
  if (modoUrl && modosValidos.includes(modoUrl)) seleccionarModo(modoUrl);
  actualizarMejores();
}
