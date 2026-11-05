document.addEventListener("DOMContentLoaded", async () => {
  const jugador = localStorage.getItem("jugadorActual");
  const modoInvitado = localStorage.getItem("modoInvitado") === "true";
  if ((localStorage.getItem("sesionActiva") !== "true" && !modoInvitado) || !jugador) { location.href = "Login.html"; return; }

  if (!modoInvitado) {
    try {
      const response = await fetch("../api/progreso.php", { cache: "no-store" });
      const serverProgress = await response.json();
      if (response.ok && serverProgress.ok) window.JuegoDB.mergeServerProgress(jugador, serverProgress);
    } catch (_) { /* Permite seguir con el progreso local si el servidor no responde. */ }
  }

  const progreso = window.JuegoDB.progress(jugador);
  const botonesNivel = Array.from(document.querySelectorAll(".nivel[data-nivel]"));
  const nombresNivel = new Map(botonesNivel.map((btn) => [Number(btn.dataset.nivel), btn.dataset.planeta || `Nivel ${btn.dataset.nivel}`]));

  const panelBriefing = document.getElementById("panelBriefing");
  const tarjetaBriefing = panelBriefing?.querySelector(".briefing-card");
  const iniciarMision = document.getElementById("iniciarMision");
  const cerrarBriefingAbajo = document.getElementById("cerrarBriefingAbajo");
  const camposBriefing = {
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
  const panelRanking = document.getElementById("panelRanking");
  const filas = document.getElementById("filasRanking");
  const estadoRanking = document.getElementById("estadoRanking");
  const actualizar = document.getElementById("actualizarRanking");
  let disparadorBriefing = null;
  let seleccionActual = null;

  function cerrarBriefing() {
    if (!panelBriefing || panelBriefing.hidden) return;
    panelBriefing.hidden = true;
    mapa?.removeAttribute("inert");
    const anterior = disparadorBriefing;
    disparadorBriefing = null;
    seleccionActual = null;
    if (anterior && document.contains(anterior)) anterior.focus();
  }

  function abrirBriefing(btn, level, completado, desbloqueado) {
    if (!panelBriefing || !tarjetaBriefing || !iniciarMision) return;
    if (panelRanking && !panelRanking.hidden) panelRanking.hidden = true;
    disparadorBriefing = btn;
    seleccionActual = { level, desbloqueado };

    camposBriefing.kicker.textContent = `INFORME DE MISIÓN · ${String(level).padStart(2, "0")} / 06`;
    camposBriefing.icono.className = `briefing-icono n${level}`;
    camposBriefing.icono.textContent = btn.querySelector(".planeta")?.textContent.trim() || "🪐";
    camposBriefing.titulo.textContent = btn.dataset.planeta || `Nivel ${level}`;
    camposBriefing.concepto.textContent = btn.dataset.concepto || "";
    camposBriefing.descripcion.textContent = btn.dataset.info || "";
    camposBriefing.gravedad.textContent = btn.dataset.gravedad || "—";
    camposBriefing.objetivo.textContent = btn.dataset.objetivo || "—";
    camposBriefing.estado.classList.remove("disponible", "completada", "bloqueada");

    if (!desbloqueado) {
      const siguiente = Number(progreso.nivel);
      const nombreSiguiente = nombresNivel.get(siguiente);
      camposBriefing.estado.textContent = level === siguiente + 1 && nombreSiguiente
        ? `Misión bloqueada. Completá la misión ${siguiente} (${nombreSiguiente}) para habilitar esta ruta.`
        : "Misión bloqueada. Completá las misiones anteriores para habilitar esta ruta.";
      camposBriefing.estado.classList.add("bloqueada");
      iniciarMision.hidden = true;
      cerrarBriefingAbajo.textContent = "ENTENDIDO";
    } else {
      if (completado) {
        camposBriefing.estado.textContent = "Misión completada. Podés repetirla para practicar; los puntos ya fueron otorgados.";
        camposBriefing.estado.classList.add("completada");
        iniciarMision.textContent = "REPETIR MISIÓN";
      } else {
        camposBriefing.estado.textContent = "Misión disponible. Revisá el objetivo y despegá cuando estés listo.";
        camposBriefing.estado.classList.add("disponible");
        iniciarMision.textContent = "INICIAR MISIÓN";
      }
      iniciarMision.hidden = false;
      iniciarMision.disabled = false;
      cerrarBriefingAbajo.textContent = "VOLVER AL MAPA";
    }

    panelBriefing.hidden = false;
    mapa?.setAttribute("inert", "");
    window.SonidoJuego?.play(desbloqueado ? "select" : "denied");
    tarjetaBriefing.focus();
  }

  botonesNivel.forEach((btn) => {
    const level = Number(btn.dataset.nivel);
    const completado = progreso.completados.includes(level);
    const unlocked = level <= progreso.nivel || completado;
    btn.classList.toggle("desbloqueado", unlocked);
    btn.classList.toggle("bloqueado", !unlocked);
    btn.disabled = false;
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-controls", "panelBriefing");
    const lock = btn.querySelector(".candado");
    if (lock) lock.textContent = unlocked ? (completado ? "✅" : "🚀") : "🔒";
    const estado = !unlocked ? "Bloqueada" : completado ? "Completada" : "Disponible";
    btn.setAttribute("aria-label", `${btn.dataset.planeta || `Nivel ${level}`}, misión ${level}: ${(btn.dataset.concepto || "").toLowerCase()}. ${estado}. Abrir informe de misión.`);
    btn.addEventListener("click", () => abrirBriefing(btn, level, completado, unlocked));
  });

  document.getElementById("cerrarBriefing")?.addEventListener("click", cerrarBriefing);
  cerrarBriefingAbajo?.addEventListener("click", cerrarBriefing);
  panelBriefing?.addEventListener("click", (event) => {
    if (event.target === panelBriefing) cerrarBriefing();
  });

  iniciarMision?.addEventListener("click", () => {
    if (!seleccionActual || !seleccionActual.desbloqueado) return;
    iniciarMision.disabled = true;
    iniciarMision.textContent = "DESPEGANDO…";
    window.SonidoJuego?.play("station");
    location.href = `Juego.html?nivel=${seleccionActual.level}`;
  });

  function mantenerFocoBriefing(event) {
    if (!tarjetaBriefing) return;
    const focusables = Array.from(tarjetaBriefing.querySelectorAll("button:not([disabled]):not([hidden]), [href], [tabindex]:not([tabindex='-1'])"))
      .filter((elemento) => elemento.getClientRects().length > 0);
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

  const resumen = document.getElementById("progresoJugador");
  if (resumen) resumen.textContent = `${jugador} · ${progreso.completados.length}/6 misiones · ${progreso.puntuacion} puntos · ⛽ ${Math.floor(progreso.combustible ?? 100)}%`;
  document.getElementById("volver")?.addEventListener("click", () => location.href = "Historia.html");

  const sincronizarPuntajes = async () => {
    if (modoInvitado) return;
    for (const nivel of [...progreso.completados].sort((a, b) => a - b)) {
      try {
        const response = await fetch("../api/puntuaciones.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nivel }),
        });
        if (!response.ok) break;
      } catch (_) { break; }
    }
  };

  async function cargarRanking() {
    if (!actualizar || !estadoRanking || !filas) return;
    actualizar.disabled = true;
    estadoRanking.textContent = "Actualizando…";
    filas.innerHTML = '<tr><td colspan="4" class="ranking-status">Cargando puntuaciones…</td></tr>';
    try {
      await sincronizarPuntajes();
      const response = await fetch("../api/puntuaciones.php", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo cargar la tabla.");
      filas.replaceChildren();
      if (!result.jugadores.length) {
        filas.innerHTML = '<tr><td colspan="4" class="ranking-status">Todavía no hay jugadores registrados.</td></tr>';
        estadoRanking.textContent = "";
        return;
      }
      result.jugadores.forEach((persona) => {
        const row = document.createElement("tr");
        if (String(persona.usuario).toLowerCase() === jugador.toLowerCase()) row.classList.add("mi-usuario");
        [persona.posicion, persona.usuario, `${persona.nivelesCompletados}/6`, `${persona.puntuacion} pts`].forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = String(value);
          row.append(cell);
        });
        filas.append(row);
      });
      estadoRanking.textContent = `${result.jugadores.length} jugador${result.jugadores.length === 1 ? "" : "es"}`;
    } catch (_) {
      filas.innerHTML = '<tr><td colspan="4" class="ranking-status">No se pudieron cargar las puntuaciones. Revisá que el servidor esté iniciado.</td></tr>';
      estadoRanking.textContent = "";
    } finally {
      actualizar.disabled = false;
    }
  }

  document.getElementById("abrirRanking")?.addEventListener("click", () => {
    cerrarBriefing();
    panelRanking.hidden = false;
    cargarRanking();
  });
  document.getElementById("cerrarRanking")?.addEventListener("click", () => { panelRanking.hidden = true; });
  panelRanking?.addEventListener("click", (event) => { if (event.target === panelRanking) panelRanking.hidden = true; });
  actualizar?.addEventListener("click", cargarRanking);

  document.addEventListener("keydown", (event) => {
    if (panelBriefing && !panelBriefing.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        cerrarBriefing();
        return;
      }
      if (event.key === "Tab") {
        mantenerFocoBriefing(event);
        return;
      }
    }
    if (event.key === "Escape" && panelRanking && !panelRanking.hidden) panelRanking.hidden = true;
  });
});
