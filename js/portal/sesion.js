/* Lectura y cierre de la sesión guardada en localStorage. */

const SESION_KEY = "sesionActiva";
const INVITADO_KEY = "modoInvitado";
const JUGADOR_KEY = "jugadorActual";

export function leerSesion() {
  return {
    sesionActiva: localStorage.getItem(SESION_KEY) === "true",
    modoInvitado: localStorage.getItem(INVITADO_KEY) === "true",
    jugadorActual: (localStorage.getItem(JUGADOR_KEY) || "").trim(),
  };
}

export function haySesion(sesion) {
  return Boolean(sesion && (sesion.sesionActiva || sesion.modoInvitado));
}

export function requerirSesion(destino = "Login.html") {
  const sesion = leerSesion();
  if (!haySesion(sesion)) {
    window.location.href = destino;
    return null;
  }
  return sesion;
}

export function cerrarSesionLocal() {
  localStorage.removeItem(SESION_KEY);
  localStorage.removeItem(INVITADO_KEY);
  localStorage.removeItem(JUGADOR_KEY);
}
