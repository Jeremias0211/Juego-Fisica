/* Evaluación de logros educativos.
   Se apoya en el progreso local de fichas, quiz y experimentos.
   No otorga recompensas dentro de las misiones ni toca MySQL. */

import { PLANETAS, TODOS_LOS_CUERPOS } from "./datos/planetas.js";
import { CONCEPTOS } from "./datos/conceptos.js";
import { EXPERIMENTOS } from "./datos/experimentos.js";
import { LOGROS } from "./datos/logros.js";
import { obtenerProgreso, otorgarLogro } from "./progreso.js";

const MODO_ETIQUETAS = {
  planetas: "Planetas",
  fisica: "Física",
  mixto: "Mixto"
};

function crearContexto(usuario) {
  const progreso = obtenerProgreso(usuario);
  const idsFichas = TODOS_LOS_CUERPOS.map((cuerpo) => cuerpo.id);
  const fichasVistas = idsFichas.filter((id) => Boolean(progreso.fichas[id]?.vista));
  const planetasVistos = PLANETAS.filter((planeta) => Boolean(progreso.fichas[planeta.id]?.vista)).length;
  const conceptosVistos = CONCEPTOS.filter(
    (concepto) => Boolean(progreso.conceptos[concepto.id]?.visto)
  ).length;
  const experimentosUsados = EXPERIMENTOS.filter(
    (experimento) => Boolean(progreso.experimentos[experimento.id]?.usado)
  ).length;
  const intentos = Array.isArray(progreso.quiz.intentos) ? progreso.quiz.intentos : [];
  const modosJugados = new Set(intentos.map((intento) => intento.modo));
  const modosPerfectos = new Set(
    intentos
      .filter((intento) => Number(intento.puntaje) >= 100)
      .map((intento) => intento.modo)
  );

  return {
    progreso,
    fichasVistas,
    planetasVistos,
    conceptosVistos,
    experimentosUsados,
    intentos,
    modosJugados,
    modosPerfectos,
    totalFichas: idsFichas.length,
    totalExperimentos: EXPERIMENTOS.length
  };
}

function medirObjetivo(objetivo, contexto) {
  switch (objetivo?.tipo) {
    case "fichasTotales": {
      const minimo = Math.max(1, Number(objetivo.minimo) || 1);
      const actual = Math.min(contexto.fichasVistas.length, minimo);
      return {
        actual,
        meta: minimo,
        texto: actual >= minimo
          ? "Primera ficha vista"
          : "Abrí una ficha para empezar"
      };
    }
    case "fichasPlanetas":
      return {
        actual: contexto.planetasVistos,
        meta: PLANETAS.length,
        texto: `${contexto.planetasVistos} de ${PLANETAS.length} planetas`
      };
    case "ficha": {
      const vista = Boolean(contexto.progreso.fichas[objetivo.id]?.vista);
      return {
        actual: vista ? 1 : 0,
        meta: 1,
        texto: vista ? "Ficha vista" : "Ficha pendiente"
      };
    }
    case "intentos":
      return {
        actual: Math.min(contexto.intentos.length, 1),
        meta: 1,
        texto: contexto.intentos.length > 0 ? "Ronda completada" : "Completá una ronda"
      };
    case "quizPerfecto": {
      const perfecta = contexto.modosPerfectos.size > 0;
      return {
        actual: perfecta ? 1 : 0,
        meta: 1,
        texto: perfecta ? "Ronda perfecta conseguida" : "Conseguí 100% en una ronda"
      };
    }
    case "modoPerfecto": {
      const etiqueta = MODO_ETIQUETAS[objetivo.modo] || objetivo.modo;
      const logrado = contexto.modosPerfectos.has(objetivo.modo);
      return {
        actual: logrado ? 1 : 0,
        meta: 1,
        texto: logrado ? `100% en ${etiqueta}` : `Pendiente: 100% en ${etiqueta}`
      };
    }
    case "modos": {
      const requeridos = Array.isArray(objetivo.modos) && objetivo.modos.length
        ? objetivo.modos
        : Object.keys(MODO_ETIQUETAS);
      const actual = requeridos.filter((modo) => contexto.modosJugados.has(modo)).length;
      return {
        actual,
        meta: requeridos.length,
        texto: `${actual} de ${requeridos.length} modos`
      };
    }
    case "experimentos":
      return {
        actual: contexto.experimentosUsados,
        meta: contexto.totalExperimentos,
        texto: `${contexto.experimentosUsados} de ${contexto.totalExperimentos} experimentos`
      };
    case "conceptos":
      return {
        actual: contexto.conceptosVistos,
        meta: CONCEPTOS.length,
        texto: `${contexto.conceptosVistos} de ${CONCEPTOS.length} conceptos`
      };
    case "exploracionTotal": {
      const meta = contexto.totalFichas + contexto.totalExperimentos + 1;
      const actual = contexto.fichasVistas.length
        + contexto.experimentosUsados
        + (contexto.intentos.length > 0 ? 1 : 0);
      return {
        actual,
        meta,
        texto: `${actual} de ${meta} pasos`
      };
    }
    default:
      return { actual: 0, meta: 1, texto: "Pendiente" };
  }
}

export function estadosLogros(usuario) {
  const contexto = crearContexto(usuario);

  return LOGROS.map((logro) => {
    const medida = medirObjetivo(logro.objetivo, contexto);
    const obtenidoEn = contexto.progreso.logros[logro.id]?.obtenidoEn || null;
    return {
      ...logro,
      ...medida,
      completado: medida.actual >= medida.meta,
      desbloqueado: Boolean(obtenidoEn) || medida.actual >= medida.meta,
      obtenidoEn
    };
  });
}

export function evaluarLogros(usuario) {
  const nuevos = [];

  for (const estado of estadosLogros(usuario)) {
    if (!estado.completado || estado.obtenidoEn) continue;
    if (otorgarLogro(usuario, estado.id)) nuevos.push(estado);
  }

  return { estados: estadosLogros(usuario), nuevos };
}

export function contarLogrosDesbloqueados(estados) {
  return estados.filter((estado) => estado.desbloqueado).length;
}
