/* Reinicio del progreso del jugador desde el panel de opciones. */

import SonidoJuego from "../../audio/index.js";
import { JuegoDB } from "../../datos/index.js";
import { leerSesion } from "../sesion.js";
import { actualizarEstadisticas } from "./estadisticas.js";
import { mostrarEstado } from "./estado.js";

export function iniciarReinicio() {
  const boton = document.getElementById("reiniciarProgreso");
  if (!boton) return;

  boton.addEventListener("click", async () => {
    const { jugadorActual, modoInvitado } = leerSesion();
    const nombre = jugadorActual || "Invitado";
    const confirmar = confirm(
      "¿Reiniciar el progreso de " + nombre + "?\n\n" +
      "Se borrarán niveles completados, puntos y combustible. Tu cuenta seguirá existiendo."
    );

    if (!confirmar) {
      SonidoJuego?.play("denied");
      return;
    }

    boton.disabled = true;

    if (!modoInvitado) {
      try {
        const respuesta = await fetch("../api/reiniciar-progreso.php", { method: "POST" });
        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok || !datos.ok) throw new Error(datos.error || "Error del servidor");
      } catch (_) {
        boton.disabled = false;
        mostrarEstado(
          "No se pudo reiniciar el progreso de la cuenta. Revisá la conexión e intentá otra vez.",
          "aviso"
        );
        SonidoJuego?.play("denied");
        return;
      }
    }

    let hecho = false;
    if (JuegoDB && typeof JuegoDB.reset === "function") {
      hecho = JuegoDB.reset(jugadorActual);
    }

    boton.disabled = false;

    if (!hecho) {
      mostrarEstado("No se pudo reiniciar el progreso guardado en este dispositivo.", "aviso");
      return;
    }

    actualizarEstadisticas();
    SonidoJuego?.play("station");
    mostrarEstado("Progreso reiniciado. Ya podés comenzar la misión desde el nivel 1.", "exito");
  });
}
