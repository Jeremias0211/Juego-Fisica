/* Consejos de física para el informe de misión.
   Son textos breves y autónomos: no modifican las misiones ni sus reglas. */

export const CONSEJOS_MISION = {
  1: {
    titulo: "Impulso y cantidad de movimiento",
    texto: "Las plataformas amarillas aplican una fuerza durante un instante: eso es un impulso. El impulso cambia tu cantidad de movimiento y te lanza horizontalmente. Mientras estás en el aire, la gravedad de Mercurio (3,70 m/s²) te acelera hacia el suelo, pero tu velocidad horizontal se conserva si no hay rozamiento.",
    formula: "J = F · Δt = Δp"
  },
  2: {
    titulo: "Gravedad y salto",
    texto: "La gravedad acelera los cuerpos hacia el suelo. Al activar E reducís temporalmente la gravedad efectiva: el salto dura más y podés alcanzar plataformas altas. En Venus, la gravedad real es 8,87 m/s².",
    formula: "v = v₀ + g · t"
  },
  3: {
    titulo: "Inercia y frenado",
    texto: "La inercia es la tendencia a conservar el movimiento. En la Luna casi no hay atmósfera y la gravedad es 1,62 m/s², así que un salto dura mucho. El freno con E aplica una fuerza que cambia tu velocidad antes de aterrizar.",
    formula: "F = m · a"
  },
  4: {
    titulo: "Propulsión y tercera ley",
    texto: "El jetpack expulsa gas hacia abajo; por la tercera ley de Newton, el gas empuja la mochila hacia arriba. Esa fuerza te permite cruzar el cráter marciano, donde la gravedad es 3,71 m/s².",
    formula: "F = Δp / Δt"
  },
  5: {
    titulo: "Asistencia gravitatoria",
    texto: "La fuerza gravitatoria entre dos cuerpos disminuye con el cuadrado de la distancia. En la misión, los campos violetas representan una asistencia gravitatoria: te aportan energía cinética para compensar la enorme gravedad de Júpiter (24,79 m/s²).",
    formula: "F = G · m₁ · m₂ / r²"
  },
  6: {
    titulo: "Energía y trabajo",
    texto: "Reunir tres celdas y activar la baliza es un proceso de transferencia de energía. El trabajo mecánico ocurre cuando una fuerza desplaza un cuerpo; la energía almacenada en las celdas se transforma en la señal del portal.",
    formula: "W = F · d · cos θ"
  }
};

export function obtenerConsejoMision(nivel) {
  return CONSEJOS_MISION[Number(nivel)] || null;
}
