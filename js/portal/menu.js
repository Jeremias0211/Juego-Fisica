/* Entrada del menú principal y de la pantalla de historia.
   Reúne sesión, navegación, opciones de audio, pantalla, estadísticas y salida. */

import { iniciarAudioOpciones } from "./opciones/audio.js";
import { iniciarModal } from "./opciones/modal.js";
import { iniciarPantallaCompleta } from "./opciones/pantalla-completa.js";
import { iniciarReinicio } from "./opciones/reinicio.js";
import { iniciarNavegacion } from "./navegacion.js";
import { iniciarSalida } from "./salida.js";
import { requerirSesion } from "./sesion.js";

function iniciarMenu() {
  const sesion = requerirSesion();
  if (!sesion) return;

  iniciarNavegacion();
  iniciarAudioOpciones();
  iniciarPantallaCompleta();
  iniciarReinicio();
  iniciarModal();
  iniciarSalida();
}

iniciarMenu();
