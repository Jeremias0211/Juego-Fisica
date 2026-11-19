#!/usr/bin/env node
/* Valida las fichas educativas sin depender de un navegador ni de MySQL.
   Uso: node scripts/validar-educativo.mjs  (o npm run validar:educativo) */

import { readFileSync } from "node:fs";

async function cargarModulo(ruta) {
  const fuente = readFileSync(new URL(ruta, import.meta.url), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(fuente, "utf8").toString("base64")}`);
}

const moduloPlanetas = await cargarModulo("../js/educativo/datos/planetas.js");
const moduloQuiz = await cargarModulo("../js/educativo/datos/quiz.js");
const moduloConsejos = await cargarModulo("../js/educativo/datos/consejos.js");
const moduloExperimentos = await cargarModulo("../js/educativo/datos/experimentos.js");
const moduloLogros = await cargarModulo("../js/educativo/datos/logros.js");
const moduloConceptos = await cargarModulo("../js/educativo/datos/conceptos.js");

const {
  PLANETAS,
  CUERPOS_ESPECIALES,
  TODOS_LOS_CUERPOS,
  FILTROS,
  TIPOS,
  NOTA_GENERAL
} = moduloPlanetas;

const {
  PREGUNTAS_QUIZ,
  PREGUNTAS_POR_RONDA,
  CATEGORIAS_QUIZ
} = moduloQuiz;

const { CONSEJOS_MISION } = moduloConsejos;
const { EXPERIMENTOS, RANGOS_LABORATORIO } = moduloExperimentos;
const { LOGROS } = moduloLogros;
const { CONCEPTOS } = moduloConceptos;

const errores = [];
const avisos = [];

function error(mensaje) {
  errores.push(mensaje);
}

function aviso(mensaje) {
  avisos.push(mensaje);
}

function slugificar(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function esTexto(valor, minimo = 1, maximo = Infinity) {
  return typeof valor === "string" && valor.trim().length >= minimo && valor.trim().length <= maximo;
}

function buscarDato(cuerpo, etiqueta) {
  return cuerpo.datos.find((dato) => dato.etiqueta === etiqueta)?.valor || "";
}

function validarCuerpo(cuerpo, esPlaneta) {
  const nombre = cuerpo?.nombre || cuerpo?.id || "(sin nombre)";
  const prefijo = `${nombre}:`;

  if (!cuerpo || typeof cuerpo !== "object") {
    error(`${prefijo} la ficha no es un objeto válido.`);
    return;
  }

  if (!esTexto(cuerpo.id, 2, 30) || !/^[a-z0-9-]+$/.test(cuerpo.id)) {
    error(`${prefijo} id inválido.`);
  } else if (cuerpo.id !== slugificar(cuerpo.nombre)) {
    error(`${prefijo} el id "${cuerpo.id}" no coincide con el nombre "${cuerpo.nombre}".`);
  }

  if (!esTexto(cuerpo.nombre, 2, 40)) error(`${prefijo} falta el nombre.`);
  if (!esTexto(cuerpo.simbolo, 1, 8)) error(`${prefijo} falta el símbolo.`);
  if (!esTexto(cuerpo.resumen, 40, 360)) {
    error(`${prefijo} el resumen debe tener entre 40 y 360 caracteres.`);
  }

  if (!Object.hasOwn(TIPOS, cuerpo.tipo)) {
    error(`${prefijo} tipo desconocido: ${cuerpo.tipo}.`);
  } else if (esPlaneta && cuerpo.tipo === "satelite") {
    error(`${prefijo} un planeta no puede tener tipo "satelite".`);
  } else if (!esPlaneta && cuerpo.tipo !== "satelite") {
    error(`${prefijo} el cuerpo especial debe tener tipo "satelite".`);
  }

  if (cuerpo.tipoEtiqueta !== TIPOS[cuerpo.tipo]) {
    error(`${prefijo} tipoEtiqueta no coincide con el tipo.`);
  }

  if (esPlaneta) {
    if (!Number.isInteger(cuerpo.orden) || cuerpo.orden < 1 || cuerpo.orden > 8) {
      error(`${prefijo} el orden planetario debe ser un entero entre 1 y 8.`);
    }
  } else if (cuerpo.orden !== null) {
    error(`${prefijo} un cuerpo especial no debe tener orden planetario.`);
  }

  if (!Array.isArray(cuerpo.datos) || cuerpo.datos.length < 9) {
    error(`${prefijo} debe tener al menos 9 datos científicos.`);
  } else {
    const etiquetas = new Set();
    for (const dato of cuerpo.datos) {
      if (!esTexto(dato?.etiqueta, 2, 40) || !esTexto(dato?.valor, 2, 220)) {
        error(`${prefijo} hay un dato con etiqueta o valor inválido.`);
        continue;
      }
      if (etiquetas.has(dato.etiqueta)) {
        error(`${prefijo} etiqueta de dato repetida: "${dato.etiqueta}".`);
      }
      etiquetas.add(dato.etiqueta);
      if (/undefined|null|TODO|lorem/i.test(dato.valor)) {
        error(`${prefijo} el dato "${dato.etiqueta}" contiene un texto provisional.`);
      }
    }

    const obligatorios = [
      "Diámetro",
      "Masa",
      "Temperatura",
      "Gravedad",
      "Atmósfera",
      "Composición"
    ];
    if (esPlaneta) {
      obligatorios.push("Distancia al Sol", "Satélites");
    } else {
      obligatorios.push("Distancia a la Tierra");
    }
    for (const etiqueta of obligatorios) {
      if (!etiquetas.has(etiqueta)) error(`${prefijo} falta el dato "${etiqueta}".`);
    }

    const tieneDia = etiquetas.has("Día") || etiquetas.has("Rotación");
    const tienePeriodo = etiquetas.has("Año") || etiquetas.has("Órbita");
    if (!tieneDia) error(`${prefijo} falta el dato "Día" o "Rotación".`);
    if (!tienePeriodo) error(`${prefijo} falta el dato "Año" o "Órbita".`);

    const gravedad = buscarDato(cuerpo, "Gravedad").replace(/,/g, ".");
    if (!gravedad.includes(cuerpo.gravedadMs2.toFixed(2))) {
      error(`${prefijo} la gravedad del dato no coincide con gravedadMs2 (${cuerpo.gravedadMs2}).`);
    }
  }

  if (!esTexto(cuerpo.historia, 120, 1200)) {
    error(`${prefijo} la historia debe tener entre 120 y 1200 caracteres.`);
  }

  if (!Array.isArray(cuerpo.curiosidades) || cuerpo.curiosidades.length < 3) {
    error(`${prefijo} debe tener al menos 3 curiosidades.`);
  } else {
    for (const curiosidad of cuerpo.curiosidades) {
      if (!esTexto(curiosidad, 20, 300)) {
        error(`${prefijo} hay una curiosidad demasiado corta o larga.`);
      }
    }
  }

  if (!cuerpo.concepto || typeof cuerpo.concepto !== "object") {
    error(`${prefijo} falta el concepto de física.`);
  } else {
    if (!esTexto(cuerpo.concepto.titulo, 3, 80)) error(`${prefijo} falta el título del concepto.`);
    if (!esTexto(cuerpo.concepto.texto, 80, 800)) {
      error(`${prefijo} el concepto debe tener entre 80 y 800 caracteres.`);
    }
  }

  if (!esTexto(cuerpo.fuente, 20, 300)) {
    error(`${prefijo} falta la fuente.`);
  } else if (!/NASA/i.test(cuerpo.fuente)) {
    aviso(`${prefijo} la fuente no menciona NASA; revisá que sea verificable.`);
  }

  if (!Number.isFinite(cuerpo.gravedadMs2) || cuerpo.gravedadMs2 <= 0 || cuerpo.gravedadMs2 > 50) {
    error(`${prefijo} gravedadMs2 fuera de rango.`);
  }

  if (cuerpo.nota && !esTexto(cuerpo.nota, 20, 300)) {
    error(`${prefijo} la nota debe tener entre 20 y 300 caracteres.`);
  }
}

function validarQuiz() {
  if (!Array.isArray(PREGUNTAS_QUIZ) || PREGUNTAS_QUIZ.length < 20) {
    error(`El cuestionario debe tener al menos 20 preguntas; hay ${PREGUNTAS_QUIZ?.length ?? 0}.`);
    return;
  }
  if (!Number.isInteger(PREGUNTAS_POR_RONDA) || PREGUNTAS_POR_RONDA < 5 || PREGUNTAS_POR_RONDA > 20) {
    error("PREGUNTAS_POR_RONDA debe ser un entero entre 5 y 20.");
  }

  const categorias = Object.keys(CATEGORIAS_QUIZ || {});
  if (categorias.length < 2) error("El cuestionario debe tener al menos dos categorías.");
  const conteo = Object.fromEntries(categorias.map((categoria) => [categoria, 0]));
  const idsPreguntas = new Set();

  for (const pregunta of PREGUNTAS_QUIZ) {
    const prefijo = `Pregunta ${pregunta?.id || "(sin id)"}:`;

    if (!esTexto(pregunta?.id, 3, 70) || !/^[a-z0-9-]+$/.test(pregunta.id)) {
      error(`${prefijo} id inválido.`);
    } else if (idsPreguntas.has(pregunta.id)) {
      error(`${prefijo} id repetido.`);
    } else {
      idsPreguntas.add(pregunta.id);
    }

    if (!categorias.includes(pregunta?.categoria)) {
      error(`${prefijo} categoría desconocida: ${pregunta?.categoria}.`);
    } else {
      conteo[pregunta.categoria] += 1;
    }

    if (!esTexto(pregunta?.pregunta, 12, 180)) {
      error(`${prefijo} el enunciado debe tener entre 12 y 180 caracteres.`);
    }

    if (!Array.isArray(pregunta?.opciones) || pregunta.opciones.length !== 4) {
      error(`${prefijo} debe tener exactamente 4 opciones.`);
    } else {
      if (new Set(pregunta.opciones).size !== 4) error(`${prefijo} tiene opciones repetidas.`);
      for (const opcion of pregunta.opciones) {
        if (!esTexto(opcion, 1, 160)) error(`${prefijo} tiene una opción vacía o demasiado larga.`);
      }
    }

    if (!Number.isInteger(pregunta?.correcta) || pregunta.correcta < 0 || pregunta.correcta > 3) {
      error(`${prefijo} el índice de la respuesta correcta es inválido.`);
    }

    if (!esTexto(pregunta?.explicacion, 30, 500)) {
      error(`${prefijo} la explicación debe tener entre 30 y 500 caracteres.`);
    }
  }

  for (const categoria of categorias) {
    if ((conteo[categoria] || 0) < PREGUNTAS_POR_RONDA) {
      error(`La categoría "${categoria}" necesita al menos ${PREGUNTAS_POR_RONDA} preguntas; tiene ${conteo[categoria] || 0}.`);
    }
  }
}

function validarConsejos() {
  if (!CONSEJOS_MISION || typeof CONSEJOS_MISION !== "object") {
    error("No se encontraron los consejos de misión.");
    return;
  }
  const niveles = Object.keys(CONSEJOS_MISION);
  if (niveles.length !== 6) {
    error(`Se esperaban 6 consejos de misión y hay ${niveles.length}.`);
  }

  for (let nivel = 1; nivel <= 6; nivel += 1) {
    const prefijo = `Consejo nivel ${nivel}:`;
    const consejo = CONSEJOS_MISION[nivel];
    if (!consejo) {
      error(`${prefijo} falta.`);
      continue;
    }
    if (!esTexto(consejo.titulo, 5, 80)) error(`${prefijo} título inválido.`);
    if (!esTexto(consejo.texto, 100, 500)) {
      error(`${prefijo} el texto debe tener entre 100 y 500 caracteres.`);
    }
    if (!esTexto(consejo.formula, 3, 50)) error(`${prefijo} fórmula inválida.`);
  }
}

function validarConceptos() {
  if (!Array.isArray(CONCEPTOS) || CONCEPTOS.length < 8) {
    error(`Se esperaban al menos 8 conceptos de física y se encontraron ${CONCEPTOS?.length ?? 0}.`);
    return;
  }

  const idsConceptos = new Set();
  for (const concepto of CONCEPTOS) {
    const prefijo = `Concepto ${concepto?.id || "(sin id)"}:`;

    if (!esTexto(concepto?.id, 3, 40) || !/^[a-z0-9-]+$/.test(concepto.id)) {
      error(`${prefijo} id inválido.`);
    } else if (idsConceptos.has(concepto.id)) {
      error(`${prefijo} id repetido.`);
    } else {
      idsConceptos.add(concepto.id);
    }

    if (!esTexto(concepto?.titulo, 3, 60)) error(`${prefijo} título inválido.`);
    if (!esTexto(concepto?.icono, 1, 8)) error(`${prefijo} ícono inválido.`);
    if (!esTexto(concepto?.resumen, 40, 260)) error(`${prefijo} resumen inválido.`);
    if (!esTexto(concepto?.formula, 3, 80)) error(`${prefijo} fórmula inválida.`);
    if (!esTexto(concepto?.aplicacion, 5, 100)) error(`${prefijo} aplicación inválida.`);
    if (!esTexto(concepto?.detalle, 120, 700)) error(`${prefijo} detalle inválido.`);
    if (!esTexto(concepto?.fuente, 20, 200)) error(`${prefijo} fuente inválida.`);
  }

  const pagina = readFileSync(new URL("../html/Universo.html", import.meta.url), "utf8");
  if (!pagina.includes('id="gridConceptos"')) {
    error("La página de fichas no tiene la grilla de conceptos.");
  }
  if (!pagina.includes("js/educativo/paginas/universo.js")) {
    error("La página de fichas no carga su script principal.");
  }
}

function validarExperimentos() {
  if (!Array.isArray(EXPERIMENTOS) || EXPERIMENTOS.length !== 3) {
    error(`Se esperaban 3 experimentos y se encontraron ${EXPERIMENTOS?.length ?? 0}.`);
    return;
  }

  const idsExperimentos = new Set();
  for (const experimento of EXPERIMENTOS) {
    const prefijo = `Experimento ${experimento?.id || "(sin id)"}:`;
    if (!esTexto(experimento?.id, 3, 40) || !/^[a-z0-9-]+$/.test(experimento.id)) {
      error(`${prefijo} id inválido.`);
    } else if (idsExperimentos.has(experimento.id)) {
      error(`${prefijo} id repetido.`);
    } else {
      idsExperimentos.add(experimento.id);
    }
    if (!esTexto(experimento?.nombre, 5, 60)) error(`${prefijo} nombre inválido.`);
    if (!esTexto(experimento?.icono, 1, 8)) error(`${prefijo} ícono inválido.`);
    if (!esTexto(experimento?.categoria, 4, 40)) error(`${prefijo} categoría inválida.`);
    if (!esTexto(experimento?.descripcion, 40, 300)) error(`${prefijo} descripción inválida.`);
  }

  const rangosEsperados = ["altura", "masa", "fuerza", "tiempo", "masaNave"];
  for (const nombre of rangosEsperados) {
    const rango = RANGOS_LABORATORIO?.[nombre];
    if (!rango) {
      error(`Falta el rango "${nombre}" del laboratorio.`);
      continue;
    }
    if (!Number.isFinite(rango.minimo) || !Number.isFinite(rango.maximo)) {
      error(`El rango "${nombre}" necesita mínimo y máximo numéricos.`);
    } else if (rango.minimo >= rango.maximo) {
      error(`El rango "${nombre}" debe tener mínimo menor que máximo.`);
    }
    if (!Number.isFinite(rango.inicial)
      || rango.inicial < rango.minimo
      || rango.inicial > rango.maximo) {
      error(`El valor inicial del rango "${nombre}" está fuera de sus límites.`);
    }
  }

  const pagina = readFileSync(new URL("../html/Laboratorio.html", import.meta.url), "utf8");
  for (const experimento of EXPERIMENTOS) {
    if (!pagina.includes(`data-experimento="${experimento.id}"`)) {
      error(`La página del laboratorio no integra el experimento "${experimento.id}".`);
    }
  }
  if (!pagina.includes("js/educativo/paginas/laboratorio.js")) {
    error("La página del laboratorio no carga su script principal.");
  }
}

function validarLogros() {
  if (!Array.isArray(LOGROS) || LOGROS.length < 8) {
    error(`Se esperaban al menos 8 logros y se encontraron ${LOGROS?.length ?? 0}.`);
    return;
  }

  const idsLogros = new Set();
  const tiposValidos = new Set([
    "fichasTotales",
    "fichasPlanetas",
    "ficha",
    "intentos",
    "quizPerfecto",
    "modoPerfecto",
    "modos",
    "experimentos",
    "conceptos",
    "exploracionTotal"
  ]);
  const modosValidos = new Set(["planetas", "fisica", "mixto"]);

  for (const logro of LOGROS) {
    const prefijo = `Logro ${logro?.id || "(sin id)"}:`;
    if (!esTexto(logro?.id, 3, 50) || !/^[a-z0-9-]+$/.test(logro.id)) {
      error(`${prefijo} id inválido.`);
    } else if (idsLogros.has(logro.id)) {
      error(`${prefijo} id repetido.`);
    } else {
      idsLogros.add(logro.id);
    }
    if (!esTexto(logro?.nombre, 4, 60)) error(`${prefijo} nombre inválido.`);
    if (!esTexto(logro?.icono, 1, 8)) error(`${prefijo} ícono inválido.`);
    if (!esTexto(logro?.categoria, 4, 40)) error(`${prefijo} categoría inválida.`);
    if (!esTexto(logro?.descripcion, 20, 200)) error(`${prefijo} descripción inválida.`);

    if (!logro?.objetivo || !tiposValidos.has(logro.objetivo.tipo)) {
      error(`${prefijo} objetivo desconocido.`);
      continue;
    }
    if (logro.objetivo.tipo === "ficha" && !ids.has(logro.objetivo.id)) {
      error(`${prefijo} referencia una ficha inexistente: ${logro.objetivo.id}.`);
    }
    if (logro.objetivo.tipo === "modoPerfecto" && !modosValidos.has(logro.objetivo.modo)) {
      error(`${prefijo} modo perfecto inválido: ${logro.objetivo.modo}.`);
    }
    if (logro.objetivo.tipo === "modos") {
      if (!Array.isArray(logro.objetivo.modos) || !logro.objetivo.modos.length) {
        error(`${prefijo} necesita al menos un modo.`);
      } else {
        for (const modo of logro.objetivo.modos) {
          if (!modosValidos.has(modo)) error(`${prefijo} modo inválido: ${modo}.`);
        }
      }
    }
  }

  const pagina = readFileSync(new URL("../html/Logros.html", import.meta.url), "utf8");
  if (!pagina.includes('id="logrosGrid"')) {
    error("La página de logros no tiene la grilla de logros.");
  }
  if (!pagina.includes("js/educativo/paginas/logros.js")) {
    error("La página de logros no carga su script principal.");
  }
}

if (!Array.isArray(PLANETAS) || PLANETAS.length !== 8) {
  error(`Se esperaban 8 planetas y se encontraron ${PLANETAS?.length ?? 0}.`);
}
if (!Array.isArray(CUERPOS_ESPECIALES) || CUERPOS_ESPECIALES.length !== 1) {
  error(`Se esperaba 1 cuerpo especial (la Luna) y se encontraron ${CUERPOS_ESPECIALES?.length ?? 0}.`);
}
if (CUERPOS_ESPECIALES?.[0]?.id !== "luna") {
  error("La ficha especial debe ser la Luna.");
}

for (const planeta of PLANETAS || []) validarCuerpo(planeta, true);
for (const cuerpo of CUERPOS_ESPECIALES || []) validarCuerpo(cuerpo, false);

const ids = new Set();
for (const cuerpo of TODOS_LOS_CUERPOS || []) {
  if (ids.has(cuerpo.id)) error(`Id repetido: "${cuerpo.id}".`);
  ids.add(cuerpo.id);
}

const ordenes = (PLANETAS || []).map((planeta) => planeta.orden).sort((a, b) => a - b);
const ordenEsperado = Array.from({ length: 8 }, (_, indice) => indice + 1);
if (ordenes.join(",") !== ordenEsperado.join(",")) {
  error(`Los órdenes planetarios deben ser 1..8 sin repetir. Recibido: ${ordenes.join(", ")}.`);
}

if (!Array.isArray(FILTROS) || FILTROS[0]?.id !== "todos") {
  error('El primer filtro debe ser "todos".');
} else {
  const idsFiltros = FILTROS.map((filtro) => filtro.id);
  if (new Set(idsFiltros).size !== idsFiltros.length) error("Hay filtros repetidos.");
  const tiposFiltrados = new Set(idsFiltros.filter((id) => id !== "todos"));
  const tiposPresentes = new Set((PLANETAS || []).map((planeta) => planeta.tipo));
  for (const tipo of tiposPresentes) {
    if (!tiposFiltrados.has(tipo)) error(`El filtro "${tipo}" no existe.`);
  }
  for (const tipo of tiposFiltrados) {
    if (!tiposPresentes.has(tipo)) error(`El filtro "${tipo}" no tiene planetas.`);
  }
}

if (!esTexto(NOTA_GENERAL, 30, 500)) {
  error("La nota general es demasiado corta o larga.");
} else {
  if (!/1 bar/i.test(NOTA_GENERAL)) {
    aviso("La nota general no aclara que en los gigantes los valores son a 1 bar.");
  }
  if (!/satélite/i.test(NOTA_GENERAL)) {
    aviso("La nota general no advierte que los conteos de satélites cambian.");
  }
}

validarQuiz();
validarConsejos();
validarConceptos();
validarExperimentos();
validarLogros();

const totalPreguntas = PREGUNTAS_QUIZ?.length ?? 0;
const planetasQuiz = (PREGUNTAS_QUIZ || []).filter((pregunta) => pregunta.categoria === "planetas").length;
const fisicaQuiz = (PREGUNTAS_QUIZ || []).filter((pregunta) => pregunta.categoria === "fisica").length;

console.log("Validando contenido educativo...\n");
console.log(`  Planetas:      ${PLANETAS?.length ?? 0}`);
console.log(`  Cuerpos especiales: ${CUERPOS_ESPECIALES?.length ?? 0}`);
console.log(`  Fichas totales: ${TODOS_LOS_CUERPOS?.length ?? 0}`);
console.log(`  Preguntas:     ${totalPreguntas} (${planetasQuiz} de planetas, ${fisicaQuiz} de física)`);
console.log(`  Conceptos:     ${CONCEPTOS?.length ?? 0}`);
console.log(`  Consejos:      ${Object.keys(CONSEJOS_MISION || {}).length} de misión`);
console.log(`  Experimentos:  ${EXPERIMENTOS?.length ?? 0}`);
console.log(`  Logros:        ${LOGROS?.length ?? 0}`);
console.log(`  Filtros:       ${FILTROS?.length ?? 0}\n`);

if (avisos.length) {
  console.log(`Avisos (${avisos.length}):`);
  for (const mensaje of avisos) console.log(`  ! ${mensaje}`);
  console.log("");
}

if (errores.length) {
  console.error(`Errores (${errores.length}):`);
  for (const mensaje of errores) console.error(`  x ${mensaje}`);
  process.exitCode = 1;
} else {
  console.log("OK: fichas, conceptos, preguntas, consejos, experimentos y logros son coherentes y están completos.");
}
