/* Acceso como invitado desde la portada estática. */

document.getElementById("jugarInvitado")?.addEventListener("click", () => {
  localStorage.removeItem("sesionActiva");
  localStorage.setItem("modoInvitado", "true");
  localStorage.setItem("jugadorActual", "Invitado");
  location.href = "html/Index.html";
});
