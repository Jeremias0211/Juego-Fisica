document.addEventListener("DOMContentLoaded", () => {
  const jugador = localStorage.getItem("jugadorActual");
  if (localStorage.getItem("sesionActiva") !== "true" || !jugador) { location.href = "Login.html"; return; }
  const progreso = window.JuegoDB.progress(jugador);
  document.querySelectorAll(".nivel[data-nivel]").forEach(btn => {
    const level = Number(btn.dataset.nivel), unlocked = level <= progreso.nivel || progreso.completados.includes(level);
    btn.classList.toggle("desbloqueado", unlocked); btn.classList.toggle("bloqueado", !unlocked);
    const lock = btn.querySelector(".candado"); if (lock) lock.textContent = unlocked ? (progreso.completados.includes(level) ? "✅" : "🚀") : "🔒";
    btn.disabled = !unlocked;
    btn.addEventListener("click", () => { if (unlocked) location.href = `Juego.html?nivel=${level}`; });
  });
  const resumen = document.getElementById("progresoJugador");
  if (resumen) resumen.textContent = `${jugador} · ${progreso.completados.length}/6 planetas · ${progreso.puntuacion} puntos`;
  document.getElementById("volver")?.addEventListener("click", () => location.href = "Historia.html");
});
