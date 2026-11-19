/* Banco de preguntas del cuestionario educativo.
   El orden de las opciones se mezcla al mostrarlas, así que la respuesta
   correcta no depende de su posición en este archivo. */

export const CATEGORIAS_QUIZ = {
  planetas: {
    etiqueta: "Planetas",
    descripcion: "Fichas, datos y curiosidades del Sistema Solar."
  },
  fisica: {
    etiqueta: "Física",
    descripcion: "Masa, peso, gravedad, inercia, energía y movimiento."
  }
};

export const PREGUNTAS_POR_RONDA = 10;

export const PREGUNTAS_QUIZ = [
  {
    id: "planeta-mas-cercano",
    categoria: "planetas",
    pregunta: "¿Cuál es el planeta más cercano al Sol?",
    opciones: ["Mercurio", "Venus", "Tierra", "Marte"],
    correcta: 0,
    explicacion: "Mercurio orbita a unos 57,9 millones de km del Sol y completa una vuelta en 88 días terrestres."
  },
  {
    id: "planeta-mas-caliente",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene la temperatura superficial media más alta?",
    opciones: ["Venus", "Mercurio", "Marte", "Júpiter"],
    correcta: 0,
    explicacion: "Venus alcanza unos 464 °C por su efecto invernadero, aunque Mercurio esté más cerca del Sol."
  },
  {
    id: "planeta-con-vida",
    categoria: "planetas",
    pregunta: "¿Qué planeta es el único del Sistema Solar con vida conocida?",
    opciones: ["La Tierra", "Marte", "Venus", "Europa"],
    correcta: 0,
    explicacion: "La Tierra tiene agua líquida, una atmósfera protectora y un campo magnético. No hay evidencia de vida en otros cuerpos."
  },
  {
    id: "planeta-mas-grande",
    categoria: "planetas",
    pregunta: "¿Cuál es el planeta más grande del Sistema Solar?",
    opciones: ["Júpiter", "Saturno", "Neptuno", "La Tierra"],
    correcta: 0,
    explicacion: "Júpiter tiene unos 11 diámetros terrestres y más masa que todos los demás planetas juntos."
  },
  {
    id: "anillos-mas-visibles",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene los anillos más visibles?",
    opciones: ["Saturno", "Júpiter", "Urano", "Neptuno"],
    correcta: 0,
    explicacion: "Los anillos de Saturno son amplios y brillantes. Todos los gigantes tienen anillos, pero los de Saturno son los más fáciles de observar."
  },
  {
    id: "eje-inclinado",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene su eje inclinado unos 98°, como si rodara sobre su órbita?",
    opciones: ["Urano", "Neptuno", "Saturno", "Venus"],
    correcta: 0,
    explicacion: "La inclinación extrema de Urano hace que sus estaciones duren aproximadamente 21 años cada una."
  },
  {
    id: "descubierto-con-matematica",
    categoria: "planetas",
    pregunta: "¿Qué planeta fue descubierto gracias a una predicción matemática?",
    opciones: ["Neptuno", "Urano", "Saturno", "Marte"],
    correcta: 0,
    explicacion: "Urbain Le Verrier y John Couch Adams predijeron su posición; Johann Galle lo observó en 1846."
  },
  {
    id: "luna-es-satelite",
    categoria: "planetas",
    pregunta: "¿La Luna es un planeta?",
    opciones: ["No, es un satélite natural de la Tierra", "Sí, es un planeta enano", "Sí, es un planeta rocoso", "No, es un asteroide"],
    correcta: 0,
    explicacion: "La Luna orbita la Tierra, no el Sol. Por eso se clasifica como satélite natural."
  },
  {
    id: "volcan-mas-alto",
    categoria: "planetas",
    pregunta: "¿En qué planeta está Olympus Mons, el volcán más alto conocido del Sistema Solar?",
    opciones: ["Marte", "Venus", "La Tierra", "Mercurio"],
    correcta: 0,
    explicacion: "Olympus Mons mide unos 22 km de altura, casi tres veces la altura del Everest."
  },
  {
    id: "densidad-menor-agua",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene una densidad media menor que la del agua?",
    opciones: ["Saturno", "Júpiter", "Neptuno", "Urano"],
    correcta: 0,
    explicacion: "La densidad media de Saturno es de unos 0,69 g/cm³. En un océano suficientemente grande, flotaría."
  },
  {
    id: "vientos-extremos",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene vientos de hasta unos 2.100 km/h?",
    opciones: ["Neptuno", "Júpiter", "Saturno", "Urano"],
    correcta: 0,
    explicacion: "Neptuno registra algunos de los vientos más rápidos del Sistema Solar, a pesar de recibir poca energía del Sol."
  },
  {
    id: "fobos-deimos",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene dos lunas llamadas Fobos y Deimos?",
    opciones: ["Marte", "Júpiter", "Saturno", "Neptuno"],
    correcta: 0,
    explicacion: "Fobos y Deimos son pequeñas lunas irregulares de Marte, posiblemente asteroides capturados."
  },
  {
    id: "gran-mancha-roja",
    categoria: "planetas",
    pregunta: "¿En qué planeta se encuentra la Gran Mancha Roja?",
    opciones: ["Júpiter", "Saturno", "Neptuno", "Venus"],
    correcta: 0,
    explicacion: "La Gran Mancha Roja es una tormenta gigante de Júpiter que se observa desde hace siglos."
  },
  {
    id: "planeta-mas-pequeno",
    categoria: "planetas",
    pregunta: "¿Cuál es el planeta más pequeño del Sistema Solar?",
    opciones: ["Mercurio", "Marte", "Venus", "La Tierra"],
    correcta: 0,
    explicacion: "Mercurio tiene 4.879 km de diámetro, menos que la Luna de Júpiter, Ganímedes, y que Titán, de Saturno."
  },
  {
    id: "dia-mas-largo-que-ano",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene un día sideral más largo que su año?",
    opciones: ["Venus", "Mercurio", "Marte", "Urano"],
    correcta: 0,
    explicacion: "Venus tarda 243 días terrestres en girar y 224,7 días en orbitar el Sol. Su rotación es retrógrada."
  },
  {
    id: "cantidad-planetas",
    categoria: "planetas",
    pregunta: "¿Cuántos planetas hay en el Sistema Solar?",
    opciones: ["8", "7", "9", "10"],
    correcta: 0,
    explicacion: "Son ocho: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno. Plutón es un planeta enano."
  },
  {
    id: "gravedad-mas-intensa",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene la gravedad superficial más intensa?",
    opciones: ["Júpiter", "Saturno", "Neptuno", "La Tierra"],
    correcta: 0,
    explicacion: "La gravedad de Júpiter es de 24,79 m/s² a 1 bar, unas 2,53 veces la terrestre."
  },
  {
    id: "mas-lunas",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene la mayor cantidad de lunas confirmadas?",
    opciones: ["Saturno", "Júpiter", "Urano", "Neptuno"],
    correcta: 0,
    explicacion: "Saturno superó las 270 lunas confirmadas. Júpiter tiene más de 90. Los conteos cambian con nuevos descubrimientos."
  },
  {
    id: "que-es-masa",
    categoria: "fisica",
    pregunta: "¿Qué es la masa?",
    opciones: ["La cantidad de materia de un cuerpo", "La fuerza con que la gravedad atrae un cuerpo", "El volumen de un cuerpo", "La energía de movimiento"],
    correcta: 0,
    explicacion: "La masa se mide en kilogramos y no cambia de un planeta a otro. Es distinta del peso."
  },
  {
    id: "que-es-peso",
    categoria: "fisica",
    pregunta: "¿Qué es el peso?",
    opciones: ["La fuerza con que la gravedad atrae una masa", "La cantidad de materia", "La masa por unidad de volumen", "La energía de movimiento"],
    correcta: 0,
    explicacion: "El peso es una fuerza y se mide en newtons. Depende de la gravedad del lugar donde estés."
  },
  {
    id: "unidad-fuerza",
    categoria: "fisica",
    pregunta: "¿Cuál es la unidad de fuerza en el Sistema Internacional?",
    opciones: ["Newton (N)", "Joule (J)", "Kilogramo (kg)", "Metro por segundo (m/s)"],
    correcta: 0,
    explicacion: "Un newton equivale a 1 kg·m/s². El joule mide energía y el kilogramo, masa."
  },
  {
    id: "tercera-ley-jetpack",
    categoria: "fisica",
    pregunta: "¿Qué ley explica que el jetpack impulse al astronauta hacia arriba al expulsar gas hacia abajo?",
    opciones: ["Tercera ley de Newton", "Primera ley de Newton", "Ley de Ohm", "Ley de Boyle"],
    correcta: 0,
    explicacion: "La tercera ley de Newton dice que a toda acción corresponde una reacción de igual magnitud y sentido opuesto."
  },
  {
    id: "que-es-inercia",
    categoria: "fisica",
    pregunta: "¿Qué es la inercia?",
    opciones: ["La tendencia de un cuerpo a conservar su estado de movimiento", "La fuerza que atrae los cuerpos", "La energía almacenada en un resorte", "La resistencia del aire"],
    correcta: 0,
    explicacion: "Si la fuerza neta es cero, un cuerpo en reposo sigue en reposo y uno en movimiento mantiene su velocidad."
  },
  {
    id: "caida-sin-aire",
    categoria: "fisica",
    pregunta: "Sin resistencia del aire, ¿qué ocurre con la aceleración de caída de dos cuerpos de distinta masa?",
    opciones: ["Es la misma para ambos", "Es mayor para el cuerpo más pesado", "Es mayor para el cuerpo más liviano", "Depende de la forma de los cuerpos"],
    correcta: 0,
    explicacion: "La aceleración gravitatoria es independiente de la masa. En la Luna, una pluma y un martillo caen al mismo tiempo."
  },
  {
    id: "que-es-impulso",
    categoria: "fisica",
    pregunta: "¿Qué es el impulso mecánico?",
    opciones: ["La fuerza aplicada durante un intervalo de tiempo", "La masa por la velocidad", "La energía por unidad de tiempo", "La distancia recorrida"],
    correcta: 0,
    explicacion: "El impulso cambia la cantidad de movimiento de un cuerpo y se expresa como J = F·Δt = Δp."
  },
  {
    id: "que-es-trabajo",
    categoria: "fisica",
    pregunta: "¿Qué es el trabajo mecánico?",
    opciones: ["La transferencia de energía cuando una fuerza desplaza un cuerpo", "La fuerza que ejerce la gravedad", "La velocidad de un cuerpo", "La masa por el volumen"],
    correcta: 0,
    explicacion: "El trabajo se calcula como W = F·d·cos θ y se mide en joules."
  },
  {
    id: "energia-potencial",
    categoria: "fisica",
    pregunta: "¿Qué es la energía potencial gravitatoria?",
    opciones: ["La energía asociada a la altura y a la gravedad", "La energía del movimiento", "La energía almacenada en un imán", "La energía del sonido"],
    correcta: 0,
    explicacion: "Cerca de la superficie, se calcula como E_p = m·g·h. Aumenta con la masa, la gravedad y la altura."
  },
  {
    id: "formula-gravitacion",
    categoria: "fisica",
    pregunta: "¿Qué fórmula describe la fuerza gravitatoria entre dos cuerpos?",
    opciones: ["F = G·m₁·m₂/r²", "F = m·a", "E = m·c²", "W = F·d"],
    correcta: 0,
    explicacion: "Es la ley de gravitación universal de Newton. La fuerza aumenta con las masas y disminuye con el cuadrado de la distancia."
  },
  {
    id: "distancia-gravedad",
    categoria: "fisica",
    pregunta: "Si se duplica la distancia entre dos cuerpos, ¿qué pasa con la fuerza gravitatoria?",
    opciones: ["Se reduce a la cuarta parte", "Se duplica", "Se reduce a la mitad", "No cambia"],
    correcta: 0,
    explicacion: "La fuerza depende de 1/r². Si r se duplica, el denominador se multiplica por cuatro y la fuerza se reduce a la cuarta parte."
  },
  {
    id: "que-es-densidad",
    categoria: "fisica",
    pregunta: "¿Qué es la densidad?",
    opciones: ["La masa por unidad de volumen", "La fuerza por unidad de superficie", "La energía por unidad de tiempo", "La velocidad por unidad de tiempo"],
    correcta: 0,
    explicacion: "La densidad se calcula como ρ = m/V. Por eso Saturno, con densidad media menor que el agua, flotaría en un océano gigante."
  },
  {
    id: "ano-mas-corto",
    categoria: "planetas",
    pregunta: "¿Qué planeta completa una vuelta al Sol en menos tiempo?",
    opciones: ["Mercurio", "Neptuno", "La Tierra", "Saturno"],
    correcta: 0,
    explicacion: "Mercurio tarda unos 88 días terrestres en completar su órbita. Es el año más corto del Sistema Solar."
  },
  {
    id: "ano-mas-largo",
    categoria: "planetas",
    pregunta: "¿Qué planeta tarda unos 165 años terrestres en orbitar el Sol?",
    opciones: ["Neptuno", "Urano", "Saturno", "Júpiter"],
    correcta: 0,
    explicacion: "Neptuno está muy lejos del Sol y su año dura aproximadamente 165 años terrestres. Urano tarda unos 84."
  },
  {
    id: "luna-mas-grande",
    categoria: "planetas",
    pregunta: "¿Cuál es el satélite natural más grande del Sistema Solar?",
    opciones: ["Ganímedes", "Titán", "La Luna", "Europa"],
    correcta: 0,
    explicacion: "Ganímedes, una luna de Júpiter, tiene unos 5.268 km de diámetro y es más grande que el planeta Mercurio."
  },
  {
    id: "atmosfera-marte",
    categoria: "planetas",
    pregunta: "¿Qué gas predomina en la atmósfera de Marte?",
    opciones: ["Dióxido de carbono", "Oxígeno", "Nitrógeno", "Hidrógeno"],
    correcta: 0,
    explicacion: "La atmósfera marciana es muy delgada y contiene cerca del 95% de dióxido de carbono, con algo de nitrógeno y argón."
  },
  {
    id: "campo-magnetico",
    categoria: "planetas",
    pregunta: "¿Qué planeta tiene el campo magnético más potente del Sistema Solar?",
    opciones: ["Júpiter", "La Tierra", "Saturno", "Neptuno"],
    correcta: 0,
    explicacion: "El momento magnético de Júpiter es unas 20.000 veces mayor que el de la Tierra. Su magnetosfera es enorme y compleja."
  },
  {
    id: "titan-saturno",
    categoria: "planetas",
    pregunta: "¿A qué planeta pertenece Titán, la luna con una atmósfera densa?",
    opciones: ["Saturno", "Júpiter", "Urano", "Neptuno"],
    correcta: 0,
    explicacion: "Titán orbita Saturno y tiene una atmósfera rica en nitrógeno, con lagos y mares de metano y etano líquidos."
  },
  {
    id: "unidad-energia",
    categoria: "fisica",
    pregunta: "¿Cuál es la unidad de energía en el Sistema Internacional?",
    opciones: ["Joule (J)", "Newton (N)", "Watt (W)", "Pascal (Pa)"],
    correcta: 0,
    explicacion: "El joule mide trabajo y energía. Un newton mide fuerza, el watt mide potencia y el pascal mide presión."
  },
  {
    id: "segunda-ley",
    categoria: "fisica",
    pregunta: "¿Qué relación expresa la segunda ley de Newton?",
    opciones: ["F = m · a", "F = m · v", "E = m · c²", "P = m · g"],
    correcta: 0,
    explicacion: "La fuerza neta es igual a la masa por la aceleración. Cuanto mayor es la fuerza, mayor es la aceleración para una misma masa."
  },
  {
    id: "que-es-aceleracion",
    categoria: "fisica",
    pregunta: "¿Qué es la aceleración?",
    opciones: ["El cambio de velocidad por unidad de tiempo", "La distancia recorrida por unidad de tiempo", "La fuerza aplicada a un cuerpo", "La cantidad de materia de un cuerpo"],
    correcta: 0,
    explicacion: "La aceleración mide cómo cambia la velocidad con el tiempo. Se expresa en metros por segundo al cuadrado (m/s²)."
  },
  {
    id: "que-es-presion",
    categoria: "fisica",
    pregunta: "¿Cómo se calcula la presión?",
    opciones: ["Fuerza dividida por superficie", "Masa por gravedad", "Fuerza por distancia", "Energía dividida por tiempo"],
    correcta: 0,
    explicacion: "La presión es P = F/A y se mide en pascales. Una misma fuerza produce más presión si actúa sobre un área menor."
  },
  {
    id: "peso-mitad-gravedad",
    categoria: "fisica",
    pregunta: "Si la gravedad se reduce a la mitad, ¿qué ocurre con la masa y el peso de un cuerpo?",
    opciones: ["La masa no cambia y el peso se reduce a la mitad", "La masa y el peso se reducen a la mitad", "Solo cambia la masa", "Ninguno de los dos cambia"],
    correcta: 0,
    explicacion: "La masa es una propiedad del cuerpo y se conserva. El peso es P = m · g, así que se reduce si la gravedad disminuye."
  },
  {
    id: "ingravidez-orbita",
    categoria: "fisica",
    pregunta: "¿Por qué un astronauta en órbita se siente sin peso?",
    opciones: ["Porque está en caída libre continua alrededor de la Tierra", "Porque en el espacio no existe la gravedad", "Porque la nave apaga todos los motores", "Porque su masa desaparece"],
    correcta: 0,
    explicacion: "La nave y el astronauta caen juntos alrededor de la Tierra. Esa caída libre compartida produce la sensación de ingravidez, no la ausencia de gravedad."
  }
];

export function contarPreguntasPorCategoria(categoria) {
  return PREGUNTAS_QUIZ.filter((pregunta) => pregunta.categoria === categoria).length;
}
