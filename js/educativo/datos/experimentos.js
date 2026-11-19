/* Catálogo de experimentos del laboratorio educativo.
   No contienen lógica: la página los usa para mostrar el progreso y
   el validador comprueba que todos estén integrados. */

export const EXPERIMENTOS = [
  {
    id: "caida",
    nombre: "Caída libre",
    icono: "🍎",
    categoria: "Gravedad",
    descripcion: "Elegí un cuerpo del Sistema Solar y medí cuánto tarda un objeto en caer desde una altura conocida. La resistencia del aire no se tiene en cuenta."
  },
  {
    id: "peso",
    nombre: "Masa y peso",
    icono: "⚖️",
    categoria: "Fuerza",
    descripcion: "Cambiá la masa y el lugar para comprobar que la masa se conserva, pero el peso cambia con la gravedad."
  },
  {
    id: "impulso",
    nombre: "Impulso del jetpack",
    icono: "🚀",
    categoria: "Movimiento",
    descripcion: "Aplicá una fuerza durante un tiempo y calculá el impulso y el cambio de velocidad de la nave."
  }
];

export const RANGOS_LABORATORIO = {
  altura: { minimo: 2, maximo: 20, paso: 1, inicial: 10 },
  masa: { minimo: 10, maximo: 100, paso: 1, inicial: 60 },
  fuerza: { minimo: 100, maximo: 800, paso: 10, inicial: 400 },
  tiempo: { minimo: 0.2, maximo: 1.5, paso: 0.1, inicial: 0.6 },
  masaNave: { minimo: 60, maximo: 120, paso: 5, inicial: 80 }
};
