/* Conceptos de física de la biblioteca educativa.
   Son textos autónomos: no modifican las misiones ni el progreso del juego.
   Valores y leyes presentados con fines didácticos. */

export const CONCEPTOS = [
  {
    id: "gravedad",
    titulo: "Gravedad",
    icono: "🪐",
    resumen: "Toda masa atrae a otra masa. Cuanto mayores son los cuerpos y más cerca están, más intensa es la fuerza.",
    formula: "F = G · m₁ · m₂ / r²",
    aplicacion: "Mercurio, Venus, Marte y Júpiter",
    detalle: "La gravedad es la fuerza de atracción entre cuerpos con masa. En la superficie de un planeta, la aceleración de caída depende de su masa y de su radio: g = G · M / R². Por eso Júpiter, con mucha masa y un radio enorme, tiene una gravedad de 24,79 m/s², mientras que la Luna solo alcanza 1,62 m/s².",
    fuente: "NASA Solar System Exploration · Ley de gravitación universal de Newton"
  },
  {
    id: "masa-peso",
    titulo: "Masa y peso",
    icono: "⚖️",
    resumen: "La masa es la cantidad de materia y no cambia de un planeta a otro. El peso es la fuerza con que la gravedad tira de esa masa.",
    formula: "P = m · g",
    aplicacion: "Todos los niveles",
    detalle: "La masa se mide en kilogramos y es una propiedad del cuerpo. El peso se mide en newtons y depende del lugar: un astronauta de 70 kg tiene una masa de 70 kg en la Tierra y en Marte, pero pesa 687 N en la Tierra y solo 260 N en Marte. En una balanza de resorte, la lectura cambia; en una balanza de platillos, no.",
    fuente: "NASA · Fundamentos de masa, peso y gravedad"
  },
  {
    id: "inercia",
    titulo: "Inercia",
    icono: "🌙",
    resumen: "Un cuerpo conserva su estado de reposo o de movimiento si la fuerza neta que actúa sobre él es cero.",
    formula: "ΣF = 0 ⇒ v = constante",
    aplicacion: "Luna y plataformas móviles",
    detalle: "La primera ley de Newton describe la inercia: no hace falta una fuerza para mantener el movimiento, sino para cambiarlo. En la Luna, sin atmósfera que frene, un salto conserva la velocidad horizontal durante más tiempo. Por eso las plataformas móviles del nivel 3 exigen anticipar el movimiento y frenar con la habilidad E.",
    fuente: "NASA · Leyes del movimiento de Newton"
  },
  {
    id: "segunda-ley",
    titulo: "Segunda ley de Newton",
    icono: "⚛️",
    resumen: "La aceleración de un cuerpo es proporcional a la fuerza neta e inversamente proporcional a su masa.",
    formula: "F = m · a",
    aplicacion: "Venus y frenado lunar",
    detalle: "Si aplicás la misma fuerza a dos cuerpos, el de menor masa acelera más. La fuerza neta es la suma vectorial de todas las fuerzas. En el juego, el pulso gravitatorio de Venus reduce la gravedad efectiva y el freno de la Luna aplica una fuerza opuesta al movimiento para cambiar la velocidad antes de aterrizar.",
    fuente: "NASA · Segunda ley del movimiento"
  },
  {
    id: "impulso",
    titulo: "Impulso y cantidad de movimiento",
    icono: "🚀",
    resumen: "Una fuerza aplicada durante un intervalo de tiempo cambia la cantidad de movimiento de un cuerpo.",
    formula: "J = F · Δt = Δp",
    aplicacion: "Trampolines de Mercurio y jetpack de Marte",
    detalle: "El impulso explica por qué un trampolín te lanza: aplica una fuerza grande durante un tiempo breve y cambia tu velocidad. La cantidad de movimiento se calcula como p = m · v. En el jetpack, el gas expulsado hacia abajo produce un impulso hacia arriba por la tercera ley de Newton.",
    fuente: "NASA · Momento lineal e impulso"
  },
  {
    id: "trabajo-energia",
    titulo: "Trabajo y energía",
    icono: "⚡",
    resumen: "El trabajo transfiere energía cuando una fuerza desplaza un cuerpo. La energía puede almacenarse y transformarse.",
    formula: "W = F · d · cos θ",
    aplicacion: "Saturno y la baliza final",
    detalle: "La energía cinética depende de la masa y de la velocidad: Ec = ½ · m · v². La energía potencial gravitatoria cerca de la superficie es Ep = m · g · h. Al reunir las celdas de Saturno, la energía almacenada se transforma en la señal que activa el portal. El trabajo y la energía se miden en joules.",
    fuente: "NASA · Trabajo, energía y potencia"
  },
  {
    id: "orbitas",
    titulo: "Órbitas",
    icono: "🛰️",
    resumen: "Un cuerpo orbita cuando su velocidad tangencial y la gravedad se combinan para mantenerlo alrededor de otro.",
    formula: "v = √(G · M / r)",
    aplicacion: "Sistema Solar y Luna",
    detalle: "En una órbita circular, la gravedad aporta la fuerza centrípeta necesaria para cambiar la dirección de la velocidad. Si la velocidad tangencial aumenta demasiado, la órbita se alarga; si disminuye, el cuerpo cae hacia el astro central. Los planetas no necesitan un empuje constante: su inercia y la gravedad del Sol explican su recorrido.",
    fuente: "NASA · Órbitas y velocidad orbital"
  },
  {
    id: "presion",
    titulo: "Presión",
    icono: "🌡️",
    resumen: "La presión es la fuerza que se distribuye sobre una superficie. En los fluidos depende de la profundidad y la densidad.",
    formula: "P = F / A",
    aplicacion: "Venus y el traje espacial",
    detalle: "La presión atmosférica de Venus es unas 92 veces la terrestre. Por eso una nave debe soportar una fuerza enorme sobre cada metro cuadrado de su superficie. La presión también explica por qué el traje espacial mantiene una atmósfera interna: sin ella, los gases y líquidos del cuerpo no funcionarían como en la Tierra.",
    fuente: "NASA · Presión atmosférica y atmósferas planetarias"
  }
];

export function obtenerConcepto(id) {
  return CONCEPTOS.find((concepto) => concepto.id === id) || null;
}
