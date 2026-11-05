/* Botones principales del menú: comenzar, instrucciones y créditos. */

function irA(id, destino) {
  document.getElementById(id)?.addEventListener("click", () => {
    window.location.href = destino;
  });
}

export function iniciarNavegacion() {
  irA("comenzar", "Historia.html");
  irA("instrucciones", "Instrucciones.html");
  irA("creditos", "Creditos.html");
}
