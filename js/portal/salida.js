/* Cierre de sesión desde el menú principal. */

import { cerrarSesionLocal, leerSesion } from "./sesion.js";

export function iniciarSalida() {
  const salir = document.getElementById("salir");
  if (!salir) return;

  salir.addEventListener("click", () => {
    const { sesionActiva, modoInvitado } = leerSesion();
    const confirmar = confirm(
      modoInvitado ? "¿Querés salir del modo invitado?" : "¿Querés cerrar la sesión?"
    );
    if (!confirmar) return;

    if (sesionActiva) {
      fetch("../api/cerrar-sesion.php", { method: "POST" }).catch(() => {});
    }

    cerrarSesionLocal();
    window.location.href = "Login.html";
  });
}
