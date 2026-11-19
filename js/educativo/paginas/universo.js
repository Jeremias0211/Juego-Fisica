/* Biblioteca «Explorando el Universo»: fichas, filtros y modal accesible. */

import {
  PLANETAS,
  CUERPOS_ESPECIALES,
  FILTROS,
  NOTA_GENERAL,
  obtenerCuerpo
} from "../datos/planetas.js";
import { obtenerProgreso, marcarFichaVista, marcarConceptoVisto } from "../progreso.js";
import { CONCEPTOS } from "../datos/conceptos.js";
import { evaluarLogros } from "../logros.js";
import { requerirSesion } from "../../portal/sesion.js";
import SonidoJuego from "../../audio/index.js";

const sesion = requerirSesion();
if (sesion) iniciar(sesion);

function iniciar(sesionActual) {
  const usuario = sesionActual.jugadorActual || "Invitado";
  const idsPlanetas = PLANETAS.map((planeta) => planeta.id);
  const gridPlanetas = document.getElementById("gridPlanetas");
  const gridEspeciales = document.getElementById("gridEspeciales");
  const gridConceptos = document.getElementById("gridConceptos");
  const progresoConceptos = document.getElementById("progresoConceptos");
  const overlay = document.getElementById("fichaOverlay");
  const modal = overlay?.querySelector(".edu-modal");
  const progresoTexto = document.getElementById("progresoTexto");
  const progresoBarra = document.getElementById("progresoBarra");
  const progresoBarraContenedor = document.getElementById("progresoBarraContenedor");
  const notaGeneral = document.getElementById("notaGeneral");
  const fichaOrb = document.getElementById("fichaOrb");
  const fichaKicker = document.getElementById("fichaKicker");
  const fichaTitulo = document.getElementById("fichaTitulo");
  const fichaResumen = document.getElementById("fichaResumen");
  const fichaDatos = document.getElementById("fichaDatos");
  const fichaNota = document.getElementById("fichaNota");
  const fichaHistoria = document.getElementById("fichaHistoria");
  const fichaCuriosidades = document.getElementById("fichaCuriosidades");
  const fichaConceptoTitulo = document.getElementById("fichaConceptoTitulo");
  const fichaConceptoTexto = document.getElementById("fichaConceptoTexto");
  const fichaFuente = document.getElementById("fichaFuente");
  const fichaEstado = document.getElementById("fichaEstado");
  const avisoLogro = document.getElementById("fichaAvisoLogro");

  let filtroActivo = "todos";
  let disparador = null;
  let avisoTimer = 0;

  function mostrarAvisoLogro(nuevos) {
    if (!avisoLogro || !nuevos.length) return;
    avisoLogro.textContent = nuevos.length === 1
      ? `🏅 Logro desbloqueado: ${nuevos[0].nombre}`
      : `🏅 ${nuevos.length} logros desbloqueados: ${nuevos.map((logro) => logro.nombre).join(", ")}`;
    avisoLogro.hidden = false;
    clearTimeout(avisoTimer);
    avisoTimer = window.setTimeout(() => {
      avisoLogro.hidden = true;
    }, 7000);
  }

  if (notaGeneral) notaGeneral.textContent = NOTA_GENERAL;

  function valorDato(cuerpo, etiqueta) {
    return cuerpo.datos.find((dato) => dato.etiqueta === etiqueta)?.valor || "—";
  }

  function crearOrb(cuerpo) {
    const orb = document.createElement("div");
    orb.className = `edu-orb edu-orb-${cuerpo.id}`;
    orb.setAttribute("aria-hidden", "true");
    const simbolo = document.createElement("span");
    simbolo.textContent = cuerpo.simbolo;
    orb.appendChild(simbolo);
    if (cuerpo.id === "saturno") {
      const anillo = document.createElement("i");
      anillo.className = "edu-anillo";
      orb.appendChild(anillo);
    }
    return orb;
  }

  function crearTarjeta(cuerpo, esEspecial = false) {
    const tarjeta = document.createElement("article");
    tarjeta.className = `edu-card${esEspecial ? " edu-card-especial" : ""}`;
    tarjeta.dataset.tipo = cuerpo.tipo;
    tarjeta.dataset.id = cuerpo.id;
    tarjeta.setAttribute("aria-labelledby", `titulo-${cuerpo.id}`);

    const cabecera = document.createElement("div");
    cabecera.className = "edu-card-top";

    const orden = document.createElement("span");
    orden.className = "edu-orden";
    orden.textContent = cuerpo.orden ? String(cuerpo.orden).padStart(2, "0") : "★";

    const tipo = document.createElement("span");
    tipo.className = "edu-tipo";
    tipo.textContent = cuerpo.tipoEtiqueta.toUpperCase();

    const vista = document.createElement("span");
    vista.className = "edu-card-vista";
    vista.textContent = "✓ VISTA";
    vista.hidden = true;

    cabecera.append(orden, tipo, vista);

    const orb = crearOrb(cuerpo);

    const titulo = document.createElement("h2");
    titulo.id = `titulo-${cuerpo.id}`;
    titulo.textContent = cuerpo.nombre;

    const resumen = document.createElement("p");
    resumen.className = "edu-card-resumen";
    resumen.textContent = cuerpo.resumen;

    const datos = document.createElement("dl");
    datos.className = "edu-card-datos";

    const datoGravedad = document.createElement("div");
    const dtGravedad = document.createElement("dt");
    dtGravedad.textContent = "Gravedad";
    const ddGravedad = document.createElement("dd");
    ddGravedad.textContent = valorDato(cuerpo, "Gravedad");
    datoGravedad.append(dtGravedad, ddGravedad);

    const datoTiempo = document.createElement("div");
    const dtTiempo = document.createElement("dt");
    dtTiempo.textContent = cuerpo.id === "luna" ? "Órbita" : "Año";
    const ddTiempo = document.createElement("dd");
    ddTiempo.textContent = valorDato(cuerpo, cuerpo.id === "luna" ? "Órbita" : "Año");
    datoTiempo.append(dtTiempo, ddTiempo);

    datos.append(datoGravedad, datoTiempo);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "edu-card-boton";
    boton.dataset.ficha = cuerpo.id;
    boton.setAttribute("aria-label", `Abrir ficha de ${cuerpo.nombre}`);
    boton.innerHTML = 'ABRIR FICHA <span aria-hidden="true">→</span>';
    boton.addEventListener("click", () => abrirFicha(cuerpo.id, boton));

    tarjeta.append(cabecera, orb, titulo, resumen, datos, boton);
    return tarjeta;
  }

  function crearConcepto(concepto) {
    const tarjeta = document.createElement("details");
    tarjeta.className = "edu-concepto-card";
    tarjeta.dataset.concepto = concepto.id;

    const resumen = document.createElement("summary");
    resumen.className = "edu-concepto-resumen";

    const icono = document.createElement("span");
    icono.className = "edu-concepto-icono";
    icono.setAttribute("aria-hidden", "true");
    icono.textContent = concepto.icono;

    const identidad = document.createElement("span");
    identidad.className = "edu-concepto-identidad";
    const titulo = document.createElement("strong");
    titulo.textContent = concepto.titulo;
    const aplicacion = document.createElement("small");
    aplicacion.textContent = concepto.aplicacion;
    identidad.append(titulo, aplicacion);

    const flecha = document.createElement("span");
    flecha.className = "edu-concepto-flecha";
    flecha.setAttribute("aria-hidden", "true");
    flecha.textContent = "＋";

    resumen.append(icono, identidad, flecha);

    const cuerpo = document.createElement("div");
    cuerpo.className = "edu-concepto-cuerpo";

    const texto = document.createElement("p");
    texto.textContent = concepto.resumen;

    const detalle = document.createElement("p");
    detalle.textContent = concepto.detalle;

    const formula = document.createElement("code");
    formula.className = "edu-concepto-formula";
    formula.textContent = concepto.formula;

    const fuente = document.createElement("p");
    fuente.className = "edu-concepto-fuente";
    fuente.textContent = concepto.fuente;

    cuerpo.append(texto, formula, detalle, fuente);
    tarjeta.append(resumen, cuerpo);

    tarjeta.addEventListener("toggle", () => {
      if (!tarjeta.open) return;
      marcarConceptoVisto(usuario, concepto.id);
      const { nuevos } = evaluarLogros(usuario);
      mostrarAvisoLogro(nuevos);
      actualizarProgreso();
      SonidoJuego?.play("select");
    });

    return tarjeta;
  }

  function renderizar() {
    if (gridPlanetas) {
      gridPlanetas.replaceChildren(...PLANETAS.map((planeta) => crearTarjeta(planeta)));
    }
    if (gridEspeciales) {
      gridEspeciales.replaceChildren(...CUERPOS_ESPECIALES.map((cuerpo) => crearTarjeta(cuerpo, true)));
    }
    if (gridConceptos) {
      gridConceptos.replaceChildren(...CONCEPTOS.map((concepto) => crearConcepto(concepto)));
    }
  }

  function actualizarProgreso() {
    const progreso = obtenerProgreso(usuario);
    const vistas = idsPlanetas.filter((id) => Boolean(progreso.fichas[id]?.vista)).length;
    const porcentaje = (vistas / idsPlanetas.length) * 100;

    if (progresoTexto) {
      progresoTexto.textContent = vistas === idsPlanetas.length
        ? "¡Completaste las 8 fichas planetarias!"
        : `${vistas} de ${idsPlanetas.length} fichas vistas`;
    }
    if (progresoBarra) progresoBarra.style.width = `${porcentaje}%`;
    if (progresoBarraContenedor) {
      progresoBarraContenedor.setAttribute("aria-valuenow", String(vistas));
      progresoBarraContenedor.setAttribute("aria-valuetext", `${vistas} de ${idsPlanetas.length} fichas vistas`);
    }

    document.querySelectorAll(".edu-card[data-id]").forEach((tarjeta) => {
      const id = tarjeta.dataset.id;
      const marca = tarjeta.querySelector(".edu-card-vista");
      const vista = Boolean(progreso.fichas[id]?.vista);
      if (marca) marca.hidden = !vista;
      tarjeta.classList.toggle("vista", vista);
    });

    if (progresoConceptos) {
      const conceptosVistos = CONCEPTOS.filter(
        (concepto) => Boolean(progreso.conceptos[concepto.id]?.visto)
      ).length;
      progresoConceptos.textContent = conceptosVistos === CONCEPTOS.length
        ? "¡Completaste los 8 conceptos!"
        : `${conceptosVistos} de ${CONCEPTOS.length} conceptos abiertos`;
    }
  }

  function filtrar() {
    document.querySelectorAll(".edu-card[data-id]").forEach((tarjeta) => {
      if (tarjeta.classList.contains("edu-card-especial")) return;
      const visible = filtroActivo === "todos" || tarjeta.dataset.tipo === filtroActivo;
      tarjeta.hidden = !visible;
    });
  }

  function conectarFiltros() {
    const botones = document.querySelectorAll(".edu-filtro[data-filtro]");
    botones.forEach((boton) => {
      boton.addEventListener("click", () => {
        filtroActivo = boton.dataset.filtro || "todos";
        botones.forEach((otro) => {
          const activo = otro === boton;
          otro.classList.toggle("activo", activo);
          otro.setAttribute("aria-pressed", String(activo));
        });
        filtrar();
        SonidoJuego?.play("select");
      });
    });
  }

  function crearDato(etiqueta, valor) {
    const grupo = document.createElement("div");
    grupo.className = "edu-dato";
    const dt = document.createElement("dt");
    dt.textContent = etiqueta;
    const dd = document.createElement("dd");
    dd.textContent = valor;
    grupo.append(dt, dd);
    return grupo;
  }

  function abrirFicha(id, origen = null) {
    const cuerpo = obtenerCuerpo(id);
    if (!cuerpo || !overlay || !modal) return;

    disparador = origen;

    if (fichaOrb) {
      fichaOrb.replaceChildren();
      fichaOrb.className = `edu-orb edu-orb-${cuerpo.id}`;
      const simbolo = document.createElement("span");
      simbolo.textContent = cuerpo.simbolo;
      fichaOrb.appendChild(simbolo);
      if (cuerpo.id === "saturno") {
        const anillo = document.createElement("i");
        anillo.className = "edu-anillo";
        fichaOrb.appendChild(anillo);
      }
    }

    if (fichaKicker) {
      fichaKicker.textContent = cuerpo.tipo === "satelite"
        ? `SATÉLITE NATURAL · ${cuerpo.tipoEtiqueta.toUpperCase()}`
        : `PLANETA ${String(cuerpo.orden).padStart(2, "0")} · ${cuerpo.tipoEtiqueta.toUpperCase()}`;
    }
    if (fichaTitulo) fichaTitulo.textContent = cuerpo.nombre;
    if (fichaResumen) fichaResumen.textContent = cuerpo.resumen;

    if (fichaDatos) {
      fichaDatos.replaceChildren(...cuerpo.datos.map((dato) => crearDato(dato.etiqueta, dato.valor)));
    }
    if (fichaNota) {
      fichaNota.hidden = !cuerpo.nota;
      fichaNota.textContent = cuerpo.nota || "";
    }
    if (fichaHistoria) fichaHistoria.textContent = cuerpo.historia;
    if (fichaCuriosidades) {
      fichaCuriosidades.replaceChildren(...cuerpo.curiosidades.map((curiosidad) => {
        const item = document.createElement("li");
        item.textContent = curiosidad;
        return item;
      }));
    }
    if (fichaConceptoTitulo) fichaConceptoTitulo.textContent = cuerpo.concepto.titulo;
    if (fichaConceptoTexto) fichaConceptoTexto.textContent = cuerpo.concepto.texto;
    if (fichaFuente) fichaFuente.textContent = cuerpo.fuente;
    if (fichaEstado) {
      fichaEstado.textContent = "✓ FICHA VISTA";
      fichaEstado.hidden = false;
    }

    marcarFichaVista(usuario, cuerpo.id);
    const { nuevos } = evaluarLogros(usuario);
    mostrarAvisoLogro(nuevos);
    actualizarProgreso();

    overlay.hidden = false;
    document.body.classList.add("edu-modal-abierto");
    try {
      history.replaceState(null, "", `?ficha=${encodeURIComponent(cuerpo.id)}`);
    } catch (_) {
      /* La URL puede no ser modificable en algunos entornos locales. */
    }

    SonidoJuego?.play("select");
    window.requestAnimationFrame(() => modal.focus());
  }

  function cerrarFicha() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("edu-modal-abierto");

    try {
      history.replaceState(null, "", location.pathname);
    } catch (_) {
      /* Ignorar si el navegador bloquea el cambio de URL. */
    }

    const anterior = disparador;
    disparador = null;
    if (anterior && document.contains(anterior)) {
      anterior.focus();
    } else {
      document.querySelector(".edu-card-boton")?.focus();
    }
  }

  function mantenerFoco(event) {
    if (!modal) return;
    const focusables = Array.from(
      modal.querySelectorAll("button:not([disabled]):not([hidden]), [href], [tabindex]:not([tabindex='-1'])")
    ).filter((elemento) => elemento.getClientRects().length > 0);

    if (!focusables.length) {
      event.preventDefault();
      modal.focus();
      return;
    }

    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];
    const activo = document.activeElement;

    if (activo === modal) {
      event.preventDefault();
      (event.shiftKey ? ultimo : primero).focus();
    } else if (event.shiftKey && activo === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && activo === ultimo) {
      event.preventDefault();
      primero.focus();
    } else if (!modal.contains(activo)) {
      event.preventDefault();
      primero.focus();
    }
  }

  function conectarModal() {
    document.getElementById("cerrarFicha")?.addEventListener("click", cerrarFicha);
    document.getElementById("cerrarFichaAbajo")?.addEventListener("click", cerrarFicha);

    overlay?.addEventListener("click", (event) => {
      if (event.target === overlay) cerrarFicha();
    });

    document.addEventListener("keydown", (event) => {
      if (!overlay || overlay.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        cerrarFicha();
        return;
      }
      if (event.key === "Tab") mantenerFoco(event);
    });
  }

  function abrirDesdeUrl() {
    const params = new URLSearchParams(location.search);
    const id = params.get("ficha");
    if (!id) return;
    const cuerpo = obtenerCuerpo(id);
    if (!cuerpo) return;
    const boton = document.querySelector(`.edu-card[data-id="${id}"] .edu-card-boton`);
    abrirFicha(id, boton || null);
  }

  renderizar();
  conectarFiltros();
  conectarModal();
  actualizarProgreso();
  abrirDesdeUrl();
}
