/* Informe de misión: detalle de cada planeta y botón para despegar. */

import SonidoJuego from "../../audio/index.js";

export function crearBriefing({ progreso, nombresNivel, alAbrir, alIniciarMision }) {
  const panelBriefing = document.getElementById("panelBriefing");
  const tarjetaBriefing = panelBriefing?.querySelector(".briefing-card");
  const iniciarMision = document.getElementById("iniciarMision");
  const cerrarBriefingAbajo = document.getElementById("cerrarBriefingAbajo");
  const campos = {
    kicker: document.getElementById("briefingKicker"),
    icono: document.getElementById("briefingIcono"),
    titulo: document.getElementById("briefingTitulo"),
    concepto: document.getElementById("briefingConcepto"),
    descripcion: document.getElementById("briefingDescripcion"),
    gravedad: document.getElementById("briefingGravedad"),
    objetivo: document.getElementById("briefingObjetivo"),
    estado: document.getElementById("briefingEstado"),
  };
  const mapa = document.querySelector(".mapa");
  let disparador = null;
  let seleccion = null;

  function cerrar() {
    if (!panelBriefing || panelBriefing.hidden) return;
    panelBriefing.hidden = true;
    mapa?.removeAttribute("inert");

    const anterior = disparador;
    disparador = null;
    seleccion = null;
    if (anterior && document.contains(anterior)) anterior.focus();
  }

  function abrir(btn, level, completado, desbloqueado) {
    if (!panelBriefing || !tarjetaBriefing || !iniciarMision) return;
    alAbrir?.();

    disparador = btn;
    seleccion = { level, desbloqueado };

    campos.kicker.textContent = `INFORME DE MISIÓN · ${String(level).padStart(2, "0")} / 06`;
    campos.icono.className = `briefing-icono n${level}`;
    campos.icono.textContent = btn.querySelector(".planeta")?.textContent.trim() || "🪐";
    campos.titulo.textContent = btn.dataset.planeta || `Nivel ${level}`;
    campos.concepto.textContent = btn.dataset.concepto || "";
    campos.descripcion.textContent = btn.dataset.info || "";
    campos.gravedad.textContent = btn.dataset.gravedad || "—";
    campos.objetivo.textContent = btn.dataset.objetivo || "—";
    campos.estado.classList.remove("disponible", "completada", "bloqueada");

    if (!desbloqueado) {
      const siguiente = Number(progreso.nivel);
      const nombreSiguiente = nombresNivel.get(siguiente);
      campos.estado.textContent = level === siguiente + 1 && nombreSiguiente
        ? `Misión bloqueada. Completá la misión ${siguiente} (${nombreSiguiente}) para habilitar esta ruta.`
        : "Misión bloqueada. Completá las misiones anteriores para habilitar esta ruta.";
      campos.estado.classList.add("bloqueada");
      iniciarMision.hidden = true;
      cerrarBriefingAbajo.textContent = "ENTENDIDO";
    } else {
      if (completado) {
        campos.estado.textContent = "Misión completada. Podés repetirla para practicar; los puntos ya fueron otorgados.";
        campos.estado.classList.add("completada");
        iniciarMision.textContent = "REPETIR MISIÓN";
      } else {
        campos.estado.textContent = "Misión disponible. Revisá el objetivo y despegá cuando estés listo.";
        campos.estado.classList.add("disponible");
        iniciarMision.textContent = "INICIAR MISIÓN";
      }
      iniciarMision.hidden = false;
      iniciarMision.disabled = false;
      cerrarBriefingAbajo.textContent = "VOLVER AL MAPA";
    }

    panelBriefing.hidden = false;
    mapa?.setAttribute("inert", "");
    SonidoJuego.play(desbloqueado ? "select" : "denied");
    tarjetaBriefing.focus();
  }

  function mantenerFoco(event) {
    if (!tarjetaBriefing) return;
    const focusables = Array.from(
      tarjetaBriefing.querySelectorAll("button:not([disabled]):not([hidden]), [href], [tabindex]:not([tabindex='-1'])")
    ).filter((elemento) => elemento.getClientRects().length > 0);

    if (!focusables.length) {
      event.preventDefault();
      tarjetaBriefing.focus();
      return;
    }

    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];
    const activo = document.activeElement;

    if (activo === tarjetaBriefing) {
      event.preventDefault();
      (event.shiftKey ? ultimo : primero).focus();
    } else if (event.shiftKey && activo === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && activo === ultimo) {
      event.preventDefault();
      primero.focus();
    } else if (!tarjetaBriefing.contains(activo)) {
      event.preventDefault();
      primero.focus();
    }
  }

  function manejarTecla(event) {
    if (!panelBriefing || panelBriefing.hidden) return false;
    if (event.key === "Escape") {
      event.preventDefault();
      cerrar();
      return true;
    }
    if (event.key === "Tab") {
      mantenerFoco(event);
      return true;
    }
    return false;
  }

  iniciarMision?.addEventListener("click", () => {
    if (!seleccion || !seleccion.desbloqueado) return;
    iniciarMision.disabled = true;
    iniciarMision.textContent = "DESPEGANDO…";
    SonidoJuego.play("station");
    alIniciarMision(seleccion.level);
  });

  document.getElementById("cerrarBriefing")?.addEventListener("click", cerrar);
  cerrarBriefingAbajo?.addEventListener("click", cerrar);
  panelBriefing?.addEventListener("click", (event) => {
    if (event.target === panelBriefing) cerrar();
  });

  return {
    abrir,
    cerrar,
    manejarTecla,
    estaAbierto: () => Boolean(panelBriefing && !panelBriefing.hidden),
  };
}
