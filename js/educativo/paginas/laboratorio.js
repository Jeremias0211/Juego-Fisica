/* Laboratorio de física: tres experimentos interactivos y progreso local.
   Los cálculos usan las mismas gravedades que las fichas planetarias. */

import { TODOS_LOS_CUERPOS } from "../datos/planetas.js";
import { EXPERIMENTOS } from "../datos/experimentos.js";
import { obtenerProgreso, marcarExperimentoUsado } from "../progreso.js";
import { evaluarLogros } from "../logros.js";
import { requerirSesion } from "../../portal/sesion.js";
import SonidoJuego from "../../audio/index.js";

const sesion = requerirSesion();
if (sesion) iniciar(sesion);

function iniciar(sesionActual) {
  const usuario = sesionActual.jugadorActual || "Invitado";
  const GRAVEDAD_TIERRA = 9.81;
  const GRAVEDAD_MAXIMA = 24.79;
  const VELOCIDAD_MAXIMA_NAVE = 20;

  function formatear(valor, decimales = 2) {
    return Number(valor).toLocaleString("es-AR", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    });
  }

  function cuerpoPorId(id) {
    return TODOS_LOS_CUERPOS.find((cuerpo) => cuerpo.id === id)
      || TODOS_LOS_CUERPOS.find((cuerpo) => cuerpo.id === "tierra");
  }

  function opcionesCuerpos() {
    return TODOS_LOS_CUERPOS
      .map((cuerpo) => `<option value="${cuerpo.id}">${cuerpo.nombre} · ${formatear(cuerpo.gravedadMs2)} m/s²</option>`)
      .join("");
  }

  for (const select of document.querySelectorAll(".lab-select-cuerpo")) {
    select.innerHTML = opcionesCuerpos();
    select.value = "tierra";
  }

  const progresoInicial = obtenerProgreso(usuario);
  const marcados = new Set(
    EXPERIMENTOS
      .filter((experimento) => Boolean(progresoInicial.experimentos[experimento.id]?.usado))
      .map((experimento) => experimento.id)
  );

  const progresoTexto = document.getElementById("labProgresoTexto");
  const progresoBarra = document.getElementById("labProgresoBarra");
  const progresoContenedor = document.getElementById("labProgresoBarraContenedor");
  const avisoLogro = document.getElementById("labAvisoLogro");
  const marcasHechas = Array.from(document.querySelectorAll(".lab-hecho"));
  let avisoTimer = 0;

  function actualizarProgreso() {
    const total = EXPERIMENTOS.length;
    const actual = EXPERIMENTOS.filter((experimento) => marcados.has(experimento.id)).length;

    if (progresoTexto) {
      progresoTexto.textContent = `${actual} de ${total} experimentos explorados`;
    }
    if (progresoBarra) {
      progresoBarra.style.width = `${total ? (actual / total) * 100 : 0}%`;
    }
    if (progresoContenedor) {
      progresoContenedor.setAttribute("aria-valuenow", String(actual));
    }
    for (const marca of marcasHechas) {
      marca.hidden = !marcados.has(marca.dataset.hecho);
    }
  }

  function mostrarAvisoLogro(nuevos) {
    if (!avisoLogro || !nuevos.length) return;
    avisoLogro.textContent = nuevos.length === 1
      ? `🏅 Logro desbloqueado: ${nuevos[0].nombre}`
      : `🏅 ${nuevos.length} logros desbloqueados: ${nuevos.map((logro) => logro.nombre).join(", ")}`;
    avisoLogro.hidden = false;
    avisoLogro.classList.add("visible");
    clearTimeout(avisoTimer);
    avisoTimer = window.setTimeout(() => {
      avisoLogro.hidden = true;
      avisoLogro.classList.remove("visible");
    }, 7000);
  }

  function registrarExperimento(id) {
    if (marcados.has(id)) return;
    if (!marcarExperimentoUsado(usuario, id)) return;
    marcados.add(id);
    actualizarProgreso();
    const { nuevos } = evaluarLogros(usuario);
    mostrarAvisoLogro(nuevos);
  }

  /* -----------------------------
     Experimento 1: caída libre
  ----------------------------- */

  const caidaCuerpo = document.getElementById("caidaCuerpo");
  const caidaAltura = document.getElementById("caidaAltura");
  const caidaAlturaValor = document.getElementById("caidaAlturaValor");
  const caidaAlturaPista = document.getElementById("caidaAlturaPista");
  const caidaSoltar = document.getElementById("caidaSoltar");
  const caidaPelota = document.getElementById("caidaPelota");
  const caidaPista = document.getElementById("caidaPista");
  const caidaGravedad = document.getElementById("caidaGravedad");
  const caidaTiempo = document.getElementById("caidaTiempo");
  const caidaVelocidad = document.getElementById("caidaVelocidad");
  let animacionCaida = 0;

  function actualizarCaida() {
    window.cancelAnimationFrame(animacionCaida);
    const cuerpo = cuerpoPorId(caidaCuerpo?.value);
    const altura = Number(caidaAltura?.value) || 10;
    const gravedad = cuerpo.gravedadMs2;
    const tiempo = Math.sqrt((2 * altura) / gravedad);
    const velocidad = Math.sqrt(2 * gravedad * altura);

    if (caidaPelota) caidaPelota.style.transform = "translateY(0)";
    if (caidaAlturaValor) caidaAlturaValor.textContent = `${formatear(altura, 0)} m`;
    if (caidaAlturaPista) caidaAlturaPista.textContent = `${formatear(altura, 0)} m`;
    if (caidaGravedad) caidaGravedad.textContent = `${formatear(gravedad)} m/s²`;
    if (caidaTiempo) caidaTiempo.textContent = `${formatear(tiempo)} s`;
    if (caidaVelocidad) caidaVelocidad.textContent = `${formatear(velocidad)} m/s`;
  }

  function soltarObjeto() {
    const cuerpo = cuerpoPorId(caidaCuerpo?.value);
    const altura = Number(caidaAltura?.value) || 10;
    const gravedad = cuerpo.gravedadMs2;
    const duracion = Math.sqrt((2 * altura) / gravedad);
    const altoPista = Math.max(0, (caidaPista?.clientHeight || 240) - (caidaPelota?.offsetHeight || 22) - 4);

    window.cancelAnimationFrame(animacionCaida);
    if (caidaPelota) caidaPelota.style.transform = "translateY(0)";
    registrarExperimento("caida");
    SonidoJuego?.play("select");

    const inicio = performance.now();
    const paso = (ahora) => {
      const tiempo = Math.min((ahora - inicio) / 1000, duracion);
      const avance = Math.min((0.5 * gravedad * tiempo * tiempo) / altura, 1);

      if (caidaPelota) {
        caidaPelota.style.transform = `translateY(${avance * altoPista}px)`;
      }
      if (caidaTiempo) caidaTiempo.textContent = `${formatear(tiempo)} s`;
      if (caidaVelocidad) caidaVelocidad.textContent = `${formatear(gravedad * tiempo)} m/s`;

      if (tiempo < duracion) {
        animacionCaida = window.requestAnimationFrame(paso);
      }
    };

    animacionCaida = window.requestAnimationFrame(paso);
  }

  caidaCuerpo?.addEventListener("change", actualizarCaida);
  caidaAltura?.addEventListener("input", actualizarCaida);
  caidaSoltar?.addEventListener("click", soltarObjeto);

  /* -----------------------------
     Experimento 2: masa y peso
  ----------------------------- */

  const pesoCuerpo = document.getElementById("pesoCuerpo");
  const pesoMasa = document.getElementById("pesoMasa");
  const pesoMasaValor = document.getElementById("pesoMasaValor");
  const pesoResultado = document.getElementById("pesoResultado");
  const pesoMasaLectura = document.getElementById("pesoMasaLectura");
  const pesoGravedad = document.getElementById("pesoGravedad");
  const pesoComparacion = document.getElementById("pesoComparacion");
  const pesoBarra = document.getElementById("pesoBarra");

  function actualizarPeso(registrarUso = false) {
    const cuerpo = cuerpoPorId(pesoCuerpo?.value);
    const masa = Number(pesoMasa?.value) || 60;
    const gravedad = cuerpo.gravedadMs2;
    const peso = masa * gravedad;
    const relativoTierra = gravedad / GRAVEDAD_TIERRA;

    if (pesoMasaValor) pesoMasaValor.textContent = `${formatear(masa, 0)} kg`;
    if (pesoResultado) pesoResultado.textContent = `${formatear(peso, 1)} N`;
    if (pesoMasaLectura) pesoMasaLectura.textContent = `${formatear(masa, 0)} kg`;
    if (pesoGravedad) pesoGravedad.textContent = `${formatear(gravedad)} m/s²`;
    if (pesoComparacion) {
      pesoComparacion.textContent = `${formatear(relativoTierra)} × tu peso en la Tierra`;
    }
    if (pesoBarra) {
      pesoBarra.style.width = `${Math.min((gravedad / GRAVEDAD_MAXIMA) * 100, 100)}%`;
    }
    if (registrarUso) registrarExperimento("peso");
  }

  pesoCuerpo?.addEventListener("change", () => actualizarPeso(true));
  pesoMasa?.addEventListener("input", () => actualizarPeso(true));

  /* -----------------------------
     Experimento 3: impulso
  ----------------------------- */

  const impulsoFuerza = document.getElementById("impulsoFuerza");
  const impulsoTiempo = document.getElementById("impulsoTiempo");
  const impulsoMasa = document.getElementById("impulsoMasa");
  const impulsoFuerzaValor = document.getElementById("impulsoFuerzaValor");
  const impulsoTiempoValor = document.getElementById("impulsoTiempoValor");
  const impulsoMasaValor = document.getElementById("impulsoMasaValor");
  const impulsoResultado = document.getElementById("impulsoResultado");
  const impulsoDeltaV = document.getElementById("impulsoDeltaV");
  const impulsoLanzar = document.getElementById("impulsoLanzar");
  const impulsoPista = document.getElementById("impulsoPista");
  const impulsoNave = document.getElementById("impulsoNave");
  let animacionImpulso = null;

  function datosImpulso() {
    const fuerza = Number(impulsoFuerza?.value) || 400;
    const tiempo = Number(impulsoTiempo?.value) || 0.6;
    const masa = Number(impulsoMasa?.value) || 80;
    return {
      fuerza,
      tiempo,
      masa,
      impulso: fuerza * tiempo,
      deltaV: (fuerza * tiempo) / masa
    };
  }

  function reiniciarNave() {
    if (animacionImpulso) {
      animacionImpulso.cancel();
      animacionImpulso = null;
    }
    if (impulsoNave) impulsoNave.style.transform = "translateX(0)";
  }

  function actualizarImpulso() {
    const datos = datosImpulso();

    if (impulsoFuerzaValor) impulsoFuerzaValor.textContent = `${formatear(datos.fuerza, 0)} N`;
    if (impulsoTiempoValor) impulsoTiempoValor.textContent = `${formatear(datos.tiempo, 1)} s`;
    if (impulsoMasaValor) impulsoMasaValor.textContent = `${formatear(datos.masa, 0)} kg`;
    if (impulsoResultado) impulsoResultado.textContent = `${formatear(datos.impulso, 0)} N·s`;
    if (impulsoDeltaV) impulsoDeltaV.textContent = `${formatear(datos.deltaV)} m/s`;
    reiniciarNave();
  }

  function lanzarNave() {
    const { deltaV } = datosImpulso();
    const anchoPista = impulsoPista?.clientWidth || 0;
    const anchoNave = impulsoNave?.offsetWidth || 24;
    const recorrido = Math.max(0, anchoPista - anchoNave - 10);
    const avance = recorrido * Math.min(deltaV / VELOCIDAD_MAXIMA_NAVE, 1);

    reiniciarNave();
    registrarExperimento("impulso");
    SonidoJuego?.play("station");

    if (impulsoNave?.animate) {
      animacionImpulso = impulsoNave.animate(
        [
          { transform: "translateX(0)" },
          { transform: `translateX(${avance}px)` }
        ],
        { duration: 950, easing: "linear", fill: "forwards" }
      );
    } else if (impulsoNave) {
      impulsoNave.style.transform = `translateX(${avance}px)`;
    }
  }

  for (const control of [impulsoFuerza, impulsoTiempo, impulsoMasa]) {
    control?.addEventListener("input", actualizarImpulso);
  }
  impulsoLanzar?.addEventListener("click", lanzarNave);

  actualizarCaida();
  actualizarPeso();
  actualizarImpulso();
  actualizarProgreso();
}
