/* Mensajes de estado compartidos por las secciones del panel de opciones. */

export function mostrarEstado(mensaje, tipo = "") {
  const salida = document.getElementById("estadoOpciones");
  if (!salida) return;

  salida.textContent = mensaje;
  salida.classList.remove("exito", "aviso");
  if (tipo) salida.classList.add(tipo);
}
