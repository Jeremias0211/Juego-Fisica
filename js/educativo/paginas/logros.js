/* Página de logros: evalúa, guarda y muestra el progreso educativo local. */

import { evaluarLogros, contarLogrosDesbloqueados } from "../logros.js";
import { requerirSesion } from "../../portal/sesion.js";

const sesion = requerirSesion();
if (sesion) iniciar(sesion);

function iniciar(sesionActual) {
  const usuario = sesionActual.jugadorActual || "Invitado";
  const grid = document.getElementById("logrosGrid");
  const progresoTexto = document.getElementById("logrosProgresoTexto");
  const progresoBarra = document.getElementById("logrosBarra");
  const progresoContenedor = document.getElementById("logrosBarraContenedor");
  const aviso = document.getElementById("logrosAviso");
  const totalHero = document.getElementById("logrosTotalHero");

  function fechaCorta(iso) {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function crearTarjeta(estado) {
    const tarjeta = document.createElement("article");
    tarjeta.className = `logro ${estado.desbloqueado ? "obtenido" : "bloqueado"}`;
    tarjeta.setAttribute(
      "aria-label",
      `${estado.nombre}: ${estado.desbloqueado ? "obtenido" : "bloqueado"}`
    );

    const icono = document.createElement("span");
    icono.className = "logro-icono";
    icono.setAttribute("aria-hidden", "true");
    icono.textContent = estado.icono;

    const contenido = document.createElement("div");
    contenido.className = "logro-contenido";

    const categoria = document.createElement("p");
    categoria.className = "logro-categoria";
    categoria.textContent = `${estado.categoria.toUpperCase()} · ${estado.desbloqueado ? "OBTENIDO" : "BLOQUEADO"}`;

    const titulo = document.createElement("h2");
    titulo.textContent = estado.nombre;

    const descripcion = document.createElement("p");
    descripcion.className = "logro-descripcion";
    descripcion.textContent = estado.descripcion;

    const barra = document.createElement("div");
    barra.className = "logro-progreso";
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-label", `Progreso de ${estado.nombre}`);
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", String(estado.meta));
    barra.setAttribute("aria-valuenow", String(Math.min(estado.actual, estado.meta)));

    const relleno = document.createElement("span");
    const porcentaje = estado.meta ? Math.min((estado.actual / estado.meta) * 100, 100) : 0;
    relleno.style.width = `${porcentaje}%`;
    barra.append(relleno);

    const detalle = document.createElement("p");
    detalle.className = "logro-detalle";
    detalle.textContent = estado.texto;

    const fecha = document.createElement("p");
    fecha.className = "logro-fecha";
    if (estado.obtenidoEn) {
      fecha.textContent = `Obtenido el ${fechaCorta(estado.obtenidoEn)}`;
    } else if (estado.completado) {
      fecha.textContent = "Listo para desbloquear";
    } else {
      fecha.textContent = "Sigue explorando para desbloquearlo";
    }

    contenido.append(categoria, titulo, descripcion, barra, detalle, fecha);
    tarjeta.append(icono, contenido);
    return tarjeta;
  }

  function renderizar(estados) {
    const total = estados.length;
    const desbloqueados = contarLogrosDesbloqueados(estados);

    if (totalHero) totalHero.textContent = String(total);
    if (progresoTexto) {
      progresoTexto.textContent = `${desbloqueados} de ${total} logros desbloqueados`;
    }
    if (progresoBarra) {
      progresoBarra.style.width = `${total ? (desbloqueados / total) * 100 : 0}%`;
    }
    if (progresoContenedor) {
      progresoContenedor.setAttribute("aria-valuemax", String(total));
      progresoContenedor.setAttribute("aria-valuenow", String(desbloqueados));
    }
    if (grid) {
      grid.replaceChildren(...estados.map(crearTarjeta));
    }
  }

  const { estados, nuevos } = evaluarLogros(usuario);
  renderizar(estados);

  if (aviso && nuevos.length) {
    aviso.textContent = nuevos.length === 1
      ? `🏅 ¡Nuevo logro desbloqueado: ${nuevos[0].nombre}!`
      : `🏅 ¡${nuevos.length} logros nuevos: ${nuevos.map((logro) => logro.nombre).join(", ")}!`;
    aviso.hidden = false;
  }
}
