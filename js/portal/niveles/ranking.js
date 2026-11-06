/* Ranking de jugadores registrados y sincronización de puntajes.
   En la demo estática se arma un ranking local con los jugadores de este navegador. */

import { JuegoDB } from "../../datos/index.js";
import { esEntornoEstatico } from "../entorno.js";

export function crearRanking({ jugador, modoInvitado, progreso, alAbrir }) {
  const panel = document.getElementById("panelRanking");
  const filas = document.getElementById("filasRanking");
  const estadoRanking = document.getElementById("estadoRanking");
  const actualizar = document.getElementById("actualizarRanking");

  function renderizar(jugadores, nota) {
    if (!filas || !estadoRanking) return;

    filas.replaceChildren();
    if (!jugadores.length) {
      filas.innerHTML = '<tr><td colspan="4" class="ranking-status">Todavía no hay jugadores registrados.</td></tr>';
      estadoRanking.textContent = nota || "";
      return;
    }

    jugadores.forEach((persona) => {
      const row = document.createElement("tr");
      if (String(persona.usuario).toLowerCase() === jugador.toLowerCase()) row.classList.add("mi-usuario");
      [persona.posicion, persona.usuario, `${persona.nivelesCompletados}/6`, `${persona.puntuacion} pts`].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        row.append(cell);
      });
      filas.append(row);
    });

    estadoRanking.textContent = `${jugadores.length} jugador${jugadores.length === 1 ? "" : "es"}${nota ? ` · ${nota}` : ""}`;
  }

  function cargarLocal() {
    const jugadores = (JuegoDB.read().jugadores || [])
      .filter((persona) => String(persona.usuario).toLowerCase() !== "invitado")
      .map((persona) => ({
        usuario: persona.usuario,
        nivelesCompletados: Array.isArray(persona.progreso?.completados)
          ? persona.progreso.completados.length
          : 0,
        puntuacion: Number(persona.progreso?.puntuacion) || 0,
      }))
      .sort((a, b) =>
        b.puntuacion - a.puntuacion ||
        b.nivelesCompletados - a.nivelesCompletados ||
        a.usuario.localeCompare(b.usuario)
      )
      .map((persona, indice) => ({ posicion: indice + 1, ...persona }));

    renderizar(jugadores, "ranking local");
  }

  async function sincronizarPuntajes() {
    if (modoInvitado || esEntornoEstatico()) return;
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
      if (esEntornoEstatico()) {
        cargarLocal();
        return;
      }

      await sincronizarPuntajes();
      const response = await fetch("../api/puntuaciones.php", { cache: "no-store" });
      const tipo = response.headers.get("content-type") || "";
      if (!tipo.includes("application/json")) throw new Error("Respuesta sin JSON");

      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo cargar la tabla.");
      if (!Array.isArray(result.jugadores)) throw new Error("Formato de ranking inválido");

      renderizar(result.jugadores);
    } catch (_) {
      if (esEntornoEstatico()) {
        cargarLocal();
      } else {
        filas.innerHTML = '<tr><td colspan="4" class="ranking-status">No se pudieron cargar las puntuaciones. Revisá que el servidor esté iniciado.</td></tr>';
        estadoRanking.textContent = "";
      }
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
