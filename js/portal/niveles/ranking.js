/* Ranking de jugadores registrados y sincronización de puntajes. */

export function crearRanking({ jugador, modoInvitado, progreso, alAbrir }) {
  const panel = document.getElementById("panelRanking");
  const filas = document.getElementById("filasRanking");
  const estadoRanking = document.getElementById("estadoRanking");
  const actualizar = document.getElementById("actualizarRanking");

  async function sincronizarPuntajes() {
    if (modoInvitado) return;
    for (const nivel of [...progreso.completados].sort((a, b) => a - b)) {
      try {
        const response = await fetch("../api/puntuaciones.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nivel }),
        });
        if (!response.ok) break;
      } catch (_) {
        break;
      }
    }
  }

  async function cargar() {
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

  function cerrar() {
    if (panel) panel.hidden = true;
  }

  function abrir() {
    alAbrir?.();
    if (!panel) return;
    panel.hidden = false;
    cargar();
  }

  document.getElementById("cerrarRanking")?.addEventListener("click", cerrar);
  panel?.addEventListener("click", (event) => {
    if (event.target === panel) cerrar();
  });
  actualizar?.addEventListener("click", cargar);

  return {
    abrir,
    cerrar,
    estaAbierto: () => Boolean(panel && !panel.hidden),
  };
}
