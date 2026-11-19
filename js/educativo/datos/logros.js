/* Definición de los logros educativos.
   Cada objetivo se evalúa con el progreso local de fichas, quiz y laboratorio.
   No modifica el progreso del juego ni requiere MySQL. */

export const LOGROS = [
  {
    id: "primer-contacto",
    nombre: "Primer contacto",
    icono: "📖",
    categoria: "Exploración",
    descripcion: "Abrí tu primera ficha del Sistema Solar.",
    objetivo: { tipo: "fichasTotales", minimo: 1 }
  },
  {
    id: "cartografo",
    nombre: "Cartógrafo planetario",
    icono: "🪐",
    categoria: "Exploración",
    descripcion: "Consultá las fichas de los ocho planetas.",
    objetivo: { tipo: "fichasPlanetas" }
  },
  {
    id: "selenita",
    nombre: "Selenita",
    icono: "🌙",
    categoria: "Exploración",
    descripcion: "Leé la ficha de la Luna y su concepto de inercia.",
    objetivo: { tipo: "ficha", id: "luna" }
  },
  {
    id: "primer-desafio",
    nombre: "Primer desafío",
    icono: "✦",
    categoria: "Cuestionario",
    descripcion: "Completá una ronda del cuestionario espacial.",
    objetivo: { tipo: "intentos" }
  },
  {
    id: "ronda-perfecta",
    nombre: "Ronda perfecta",
    icono: "🏆",
    categoria: "Cuestionario",
    descripcion: "Respondé las 10 preguntas de una ronda sin errores.",
    objetivo: { tipo: "quizPerfecto" }
  },
  {
    id: "tres-modos",
    nombre: "Tres caminos",
    icono: "🎯",
    categoria: "Cuestionario",
    descripcion: "Jugá al menos una ronda en los modos Planetas, Física y Mixto.",
    objetivo: { tipo: "modos", modos: ["planetas", "fisica", "mixto"] }
  },
  {
    id: "fisico",
    nombre: "Físico de a bordo",
    icono: "⚛️",
    categoria: "Cuestionario",
    descripcion: "Conseguí 100% en una ronda del modo Física.",
    objetivo: { tipo: "modoPerfecto", modo: "fisica" }
  },
  {
    id: "astronomo",
    nombre: "Astrónomo de guardia",
    icono: "🔭",
    categoria: "Cuestionario",
    descripcion: "Conseguí 100% en una ronda del modo Planetas.",
    objetivo: { tipo: "modoPerfecto", modo: "planetas" }
  },
  {
    id: "cientifico",
    nombre: "Científico de laboratorio",
    icono: "🧪",
    categoria: "Laboratorio",
    descripcion: "Probá los tres experimentos de física.",
    objetivo: { tipo: "experimentos" }
  },
  {
    id: "leyes-a-bordo",
    nombre: "Leyes a bordo",
    icono: "📐",
    categoria: "Conceptos",
    descripcion: "Abrí las ocho tarjetas de conceptos de física.",
    objetivo: { tipo: "conceptos" }
  },
  {
    id: "explorador-total",
    nombre: "Explorador total",
    icono: "🚀",
    categoria: "Gran final",
    descripcion: "Completá las 9 fichas, los 3 experimentos y al menos una ronda del cuestionario.",
    objetivo: { tipo: "exploracionTotal" }
  }
];
