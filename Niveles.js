document.addEventListener("DOMContentLoaded", () => {
  const jugador = localStorage.getItem("jugadorActual");
  if (localStorage.getItem("sesionActiva") !== "true" || !jugador) { location.href = "Login.html"; return; }

  const progreso = window.JuegoDB.progress(jugador);
  document.querySelectorAll(".nivel[data-nivel]").forEach((btn) => {
    const level = Number(btn.dataset.nivel);
    const unlocked = level <= progreso.nivel || progreso.completados.includes(level);
    btn.classList.toggle("desbloqueado", unlocked);
    btn.classList.toggle("bloqueado", !unlocked);
    const lock = btn.querySelector(".candado");
    if (lock) lock.textContent = unlocked ? (progreso.completados.includes(level) ? "✅" : "🚀") : "🔒";
    btn.disabled = !unlocked;
    btn.addEventListener("click", () => { if (unlocked) location.href = `Juego.html?nivel=${level}`; });
  });

  const resumen = document.getElementById("progresoJugador");
  if (resumen) resumen.textContent = `${jugador} · ${progreso.completados.length}/6 planetas · ${progreso.puntuacion} puntos · ⛽ ${Math.floor(progreso.combustible ?? 100)}%`;
  document.getElementById("volver")?.addEventListener("click", () => location.href = "Historia.html");

  const panel = document.getElementById("panelRanking");
  const filas = document.getElementById("filasRanking");
  const estado = document.getElementById("estadoRanking");
  const actualizar = document.getElementById("actualizarRanking");
  const sincronizarPuntajes = Promise.all(progreso.completados.map((nivel) =>
    fetch("../api/puntuaciones/nivel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: jugador, nivel }),
    }).catch(() => null)
  ));

  async function cargarRanking() {
    actualizar.disabled = true;
    estado.textContent = "Actualizando…";
    filas.innerHTML = '<tr><td colspan="4" class="ranking-status">Cargando puntuaciones…</td></tr>';
    try {
      await sincronizarPuntajes;
      const response = await fetch("../api/puntuaciones", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo cargar la tabla.");
      filas.replaceChildren();
      if (!result.jugadores.length) {
        filas.innerHTML = '<tr><td colspan="4" class="ranking-status">Todavía no hay jugadores registrados.</td></tr>';
        estado.textContent = "";
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
      estado.textContent = `${result.jugadores.length} jugador${result.jugadores.length === 1 ? "" : "es"}`;
    } catch (error) {
      filas.innerHTML = '<tr><td colspan="4" class="ranking-status">No se pudieron cargar las puntuaciones. Revisá que el servidor esté iniciado.</td></tr>';
      estado.textContent = "";
    } finally {
      actualizar.disabled = false;
    }
  }

  document.getElementById("abrirRanking")?.addEventListener("click", () => {
    panel.hidden = false;
    cargarRanking();
  });
  document.getElementById("cerrarRanking")?.addEventListener("click", () => { panel.hidden = true; });
  panel?.addEventListener("click", (event) => { if (event.target === panel) panel.hidden = true; });
  actualizar?.addEventListener("click", cargarRanking);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && panel && !panel.hidden) panel.hidden = true; });
});
