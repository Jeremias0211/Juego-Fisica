/* Fichas educativas de los ocho planetas y de la Luna.
   Los valores son aproximados y se presentan con fines educativos.
   Fuente principal: NASA Planetary Fact Sheet y NASA Solar System Exploration.
   En los gigantes, la temperatura y la gravedad se indican a 1 bar de presión. */

export const NOTA_GENERAL = "Valores aproximados. En los gigantes, la temperatura y la gravedad se indican a 1 bar de presión. Los conteos de satélites cambian con nuevos descubrimientos.";

export const TIPOS = {
  rocoso: "Rocoso",
  gaseoso: "Gigante gaseoso",
  helado: "Gigante helado",
  satelite: "Satélite natural"
};

export const FILTROS = [
  { id: "todos", etiqueta: "Todos" },
  { id: "rocoso", etiqueta: "Rocosos" },
  { id: "gaseoso", etiqueta: "Gigantes gaseosos" },
  { id: "helado", etiqueta: "Gigantes helados" }
];

export const PLANETAS = [
  {
    id: "mercurio",
    nombre: "Mercurio",
    orden: 1,
    tipo: "rocoso",
    tipoEtiqueta: "Rocoso",
    simbolo: "⚪",
    resumen: "El planeta más pequeño y el más cercano al Sol. Su superficie está cubierta de cráteres y casi no tiene atmósfera.",
    datos: [
      { etiqueta: "Diámetro", valor: "4.879 km (0,38 Tierras)" },
      { etiqueta: "Masa", valor: "3,30 × 10²³ kg (0,055 Tierras)" },
      { etiqueta: "Distancia al Sol", valor: "57,9 millones de km (0,39 UA)" },
      { etiqueta: "Temperatura", valor: "Media de 167 °C; extremos de -173 °C a 427 °C" },
      { etiqueta: "Día", valor: "Día sideral: 58,6 días terrestres. Día solar: 176 días terrestres." },
      { etiqueta: "Año", valor: "88 días terrestres" },
      { etiqueta: "Gravedad", valor: "3,70 m/s² (0,38 g)" },
      { etiqueta: "Atmósfera", valor: "Prácticamente inexistente; una exosfera muy tenue con trazas de oxígeno, sodio, hidrógeno, helio y potasio." },
      { etiqueta: "Satélites", valor: "Ninguno" },
      { etiqueta: "Composición", valor: "Núcleo metálico grande, manto y corteza de silicatos." }
    ],
    historia: "Se formó hace unos 4.600 millones de años a partir de material rocoso del disco protoplanetario. Su superficie conserva cráteres de impactos muy antiguos. Misiones como Mariner 10, MESSENGER y BepiColombo han estudiado o estudian Mercurio.",
    curiosidades: [
      "Un día solar en Mercurio dura 176 días terrestres, el doble que su año.",
      "Puede haber hielo de agua en cráteres polares que nunca reciben luz solar directa.",
      "No tiene lunas ni anillos."
    ],
    concepto: {
      titulo: "Gravedad e inercia",
      texto: "La gravedad de Mercurio es 3,70 m/s², unas 0,38 veces la terrestre. Si saltaras con la misma velocidad inicial, tardarías más en volver al suelo que en la Tierra. La inercia es la tendencia de un objeto a conservar su estado de movimiento."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 3.7
  },
  {
    id: "venus",
    nombre: "Venus",
    orden: 2,
    tipo: "rocoso",
    tipoEtiqueta: "Rocoso",
    simbolo: "🟠",
    resumen: "El planeta más caliente del Sistema Solar. Su atmósfera densa de dióxido de carbono y sus nubes de ácido sulfúrico atrapan el calor.",
    datos: [
      { etiqueta: "Diámetro", valor: "12.104 km (0,95 Tierras)" },
      { etiqueta: "Masa", valor: "4,87 × 10²⁴ kg (0,82 Tierras)" },
      { etiqueta: "Distancia al Sol", valor: "108,2 millones de km (0,72 UA)" },
      { etiqueta: "Temperatura", valor: "Media superficial de 464 °C" },
      { etiqueta: "Día", valor: "Día sideral: 243 días terrestres (retrógrado). Día solar: 117 días terrestres." },
      { etiqueta: "Año", valor: "224,7 días terrestres" },
      { etiqueta: "Gravedad", valor: "8,87 m/s² (0,90 g)" },
      { etiqueta: "Atmósfera", valor: "96,5% dióxido de carbono, 3,5% nitrógeno; nubes de ácido sulfúrico; presión superficial de unas 92 atmósferas." },
      { etiqueta: "Satélites", valor: "Ninguno" },
      { etiqueta: "Composición", valor: "Núcleo de hierro, manto rocoso y corteza volcánica." }
    ],
    historia: "Se formó hace unos 4.600 millones de años. Es uno de los planetas más brillantes del cielo y se conoce desde la antigüedad. Misiones como Mariner 2, las Venera, Magellan y Akatsuki lo han estudiado.",
    curiosidades: [
      "Su rotación es retrógrada: gira en sentido contrario a la mayoría de los planetas.",
      "Un día sideral dura más que un año venusino, aunque su día solar es más corto.",
      "El efecto invernadero explica su temperatura extrema, mucho mayor que la de Mercurio."
    ],
    concepto: {
      titulo: "Efecto invernadero y presión",
      texto: "La atmósfera densa de dióxido de carbono deja pasar parte de la luz solar, pero retiene el calor que emite la superficie. Eso produce un efecto invernadero muy intenso. La presión en la superficie es unas 92 veces la terrestre."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 8.87
  },
  {
    id: "tierra",
    nombre: "Tierra",
    orden: 3,
    tipo: "rocoso",
    tipoEtiqueta: "Rocoso",
    simbolo: "🌍",
    resumen: "Nuestro hogar y el único planeta conocido con vida. Tiene agua líquida en la superficie, una atmósfera protectora y un campo magnético.",
    datos: [
      { etiqueta: "Diámetro", valor: "12.742 km" },
      { etiqueta: "Masa", valor: "5,97 × 10²⁴ kg" },
      { etiqueta: "Distancia al Sol", valor: "149,6 millones de km (1 UA)" },
      { etiqueta: "Temperatura", valor: "Media de 15 °C" },
      { etiqueta: "Día", valor: "Día sideral: 23 h 56 min. Día solar: 24 h." },
      { etiqueta: "Año", valor: "365,25 días" },
      { etiqueta: "Gravedad", valor: "9,81 m/s² (1 g)" },
      { etiqueta: "Atmósfera", valor: "78% nitrógeno, 21% oxígeno y 1% otros gases; presión de 1 atmósfera." },
      { etiqueta: "Satélites", valor: "1: la Luna" },
      { etiqueta: "Composición", valor: "Núcleo de hierro y níquel, manto de silicatos y corteza. El 71% de la superficie es agua." }
    ],
    historia: "Se formó hace unos 4.600 millones de años. La Luna se habría formado tras un impacto gigante hace unos 4.500 millones de años. La vida aparece en el registro geológico hace más de 3.500 millones de años. Las primeras imágenes de la Tierra desde órbita se tomaron en la década de 1960.",
    curiosidades: [
      "La inclinación del eje terrestre, de unos 23,4°, produce las estaciones.",
      "El campo magnético protege la atmósfera del viento solar.",
      "No es una esfera perfecta: está ligeramente achatada en los polos."
    ],
    concepto: {
      titulo: "Masa y peso",
      texto: "La masa es la cantidad de materia y se mide en kilogramos. El peso es la fuerza con que la gravedad atrae esa masa y se mide en newtons. Una persona de 60 kg tiene la misma masa en todos los planetas, pero su peso cambia según la gravedad."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 9.81
  },
  {
    id: "marte",
    nombre: "Marte",
    orden: 4,
    tipo: "rocoso",
    tipoEtiqueta: "Rocoso",
    simbolo: "🔴",
    resumen: "El planeta rojo. Debe su color al óxido de hierro de su superficie y conserva evidencias de agua líquida en el pasado.",
    datos: [
      { etiqueta: "Diámetro", valor: "6.779 km (0,53 Tierras)" },
      { etiqueta: "Masa", valor: "6,42 × 10²³ kg (0,107 Tierras)" },
      { etiqueta: "Distancia al Sol", valor: "227,9 millones de km (1,52 UA)" },
      { etiqueta: "Temperatura", valor: "Media de -63 °C; extremos de -143 °C a 35 °C" },
      { etiqueta: "Día", valor: "Día sideral: 24 h 37 min" },
      { etiqueta: "Año", valor: "687 días terrestres" },
      { etiqueta: "Gravedad", valor: "3,71 m/s² (0,38 g)" },
      { etiqueta: "Atmósfera", valor: "95% dióxido de carbono, 2,8% nitrógeno y 2% argón; presión de unos 0,006 bar." },
      { etiqueta: "Satélites", valor: "2: Fobos y Deimos" },
      { etiqueta: "Composición", valor: "Corteza basáltica rica en óxido de hierro, manto y núcleo metálico." }
    ],
    historia: "Se formó hace unos 4.600 millones de años. Fue explorado por Mariner 4, las Viking, los rovers Spirit, Opportunity, Curiosity y Perseverance, y el helicóptero Ingenuity. Las evidencias geológicas indican que tuvo ríos y lagos hace miles de millones de años.",
    curiosidades: [
      "Olympus Mons es el volcán más alto conocido del Sistema Solar, con unos 22 km de altura.",
      "Valles Marineris es un sistema de cañones de unos 4.000 km de largo.",
      "Sus tormentas de polvo pueden cubrir grandes regiones e incluso todo el planeta."
    ],
    concepto: {
      titulo: "Gravedad y movimiento de proyectiles",
      texto: "Con 3,71 m/s², la gravedad marciana es unas 0,38 veces la terrestre. Un salto o un proyectil sigue una curva parabólica: la gravedad lo acelera hacia el suelo y la velocidad horizontal se mantiene, salvo por el roce con la atmósfera."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 3.71
  },
  {
    id: "jupiter",
    nombre: "Júpiter",
    orden: 5,
    tipo: "gaseoso",
    tipoEtiqueta: "Gigante gaseoso",
    simbolo: "🟤",
    resumen: "El gigante gaseoso más grande y masivo. Es más masivo que todos los demás planetas del Sistema Solar juntos.",
    datos: [
      { etiqueta: "Diámetro", valor: "139.820 km (11 Tierras)" },
      { etiqueta: "Masa", valor: "1,90 × 10²⁷ kg (317,8 Tierras)" },
      { etiqueta: "Distancia al Sol", valor: "778,5 millones de km (5,20 UA)" },
      { etiqueta: "Temperatura", valor: "Aproximadamente -110 °C a 1 bar" },
      { etiqueta: "Día", valor: "Día sideral: 9 h 56 min" },
      { etiqueta: "Año", valor: "11,86 años terrestres" },
      { etiqueta: "Gravedad", valor: "24,79 m/s² a 1 bar (2,53 g)" },
      { etiqueta: "Atmósfera", valor: "Unos 90% hidrógeno y 10% helio, con trazas de metano, amoníaco y agua. No tiene una superficie sólida definida." },
      { etiqueta: "Satélites", valor: "Más de 90 lunas conocidas; entre ellas, Ío, Europa, Ganímedes y Calisto." },
      { etiqueta: "Composición", valor: "Hidrógeno y helio; en el interior, hidrógeno metálico y un núcleo rocoso o helado según los modelos." }
    ],
    historia: "Se formó hace unos 4.600 millones de años y fue el primer planeta que vio sus lunas Galileo Galilei, en 1610. Misiones como Pioneer, Voyager, Galileo y Juno lo han estudiado en detalle.",
    curiosidades: [
      "La Gran Mancha Roja es una tormenta gigante que se observa desde hace siglos.",
      "Ganímedes es la luna más grande del Sistema Solar, incluso más grande que Mercurio.",
      "Júpiter tiene el campo magnético más intenso de todos los planetas."
    ],
    concepto: {
      titulo: "Gravedad y órbitas",
      texto: "La enorme masa de Júpiter produce una gravedad de 24,79 m/s² a 1 bar. Esa gravedad mantiene un extenso sistema de lunas y contribuye a modelar las órbitas de otros cuerpos del Sistema Solar."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 24.79,
    nota: "Gravedad y temperatura indicadas a 1 bar de presión, no en una superficie sólida."
  },
  {
    id: "saturno",
    nombre: "Saturno",
    orden: 6,
    tipo: "gaseoso",
    tipoEtiqueta: "Gigante gaseoso",
    simbolo: "🪐",
    resumen: "El señor de los anillos. Es un gigante gaseoso con una densidad media menor que la del agua y un sistema de anillos espectacular.",
    datos: [
      { etiqueta: "Diámetro", valor: "116.460 km (9,1 Tierras)" },
      { etiqueta: "Masa", valor: "5,68 × 10²⁶ kg (95,2 Tierras)" },
      { etiqueta: "Distancia al Sol", valor: "1.434 millones de km (9,58 UA)" },
      { etiqueta: "Temperatura", valor: "Aproximadamente -140 °C a 1 bar" },
      { etiqueta: "Día", valor: "Día sideral: 10 h 33 min" },
      { etiqueta: "Año", valor: "29,45 años terrestres" },
      { etiqueta: "Gravedad", valor: "10,44 m/s² a 1 bar (1,06 g)" },
      { etiqueta: "Atmósfera", valor: "Unos 96% hidrógeno y 3% helio, con trazas de metano y amoníaco. Los anillos están formados por hielo y roca." },
      { etiqueta: "Satélites", valor: "Más de 270 lunas conocidas; Titán, Encélado, Mimas, Rea y Jápeto son algunas." },
      { etiqueta: "Composición", valor: "Hidrógeno y helio, con interior de hidrógeno metálico y núcleo rocoso. Los anillos son principalmente hielo de agua." }
    ],
    historia: "Se conoce desde la antigüedad. Galileo observó sus anillos en 1610, aunque no comprendió qué eran. La misión Cassini-Huygens estudió el sistema entre 2004 y 2017 y posó a Huygens en Titán.",
    curiosidades: [
      "Su densidad media es menor que la del agua: en un océano gigante, Saturno flotaría.",
      "Titán tiene una atmósfera densa y lagos de metano y etano líquidos.",
      "Encélado expulsa vapor de agua desde su polo sur, a través de géiseres."
    ],
    concepto: {
      titulo: "Densidad y gravedad",
      texto: "La densidad es la masa por unidad de volumen. Saturno tiene una densidad media menor que la del agua, aunque su gravedad superficial es parecida a la terrestre. Eso muestra que densidad y gravedad no son lo mismo."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 10.44,
    nota: "Gravedad y temperatura indicadas a 1 bar de presión, no en una superficie sólida."
  },
  {
    id: "urano",
    nombre: "Urano",
    orden: 7,
    tipo: "helado",
    tipoEtiqueta: "Gigante helado",
    simbolo: "🔵",
    resumen: "Un gigante helado de color azul verdoso. Su eje está inclinado unos 98°, por lo que parece rodar sobre su órbita.",
    datos: [
      { etiqueta: "Diámetro", valor: "50.724 km (4 Tierras)" },
      { etiqueta: "Masa", valor: "8,68 × 10²⁵ kg (14,5 Tierras)" },
      { etiqueta: "Distancia al Sol", valor: "2.871 millones de km (19,2 UA)" },
      { etiqueta: "Temperatura", valor: "Aproximadamente -195 °C a 1 bar" },
      { etiqueta: "Día", valor: "Día sideral: 17 h 14 min (retrógrado)" },
      { etiqueta: "Año", valor: "84 años terrestres" },
      { etiqueta: "Gravedad", valor: "8,69 m/s² a 1 bar (0,89 g)" },
      { etiqueta: "Atmósfera", valor: "Unos 83% hidrógeno, 15% helio y 2% metano. El metano absorbe la luz roja y le da su color azul verdoso." },
      { etiqueta: "Satélites", valor: "Más de 25 lunas conocidas; Titania, Oberón, Miranda, Ariel y Umbriel." },
      { etiqueta: "Composición", valor: "Interior de hielos de agua, amoníaco y metano, con un núcleo rocoso. No tiene superficie sólida." }
    ],
    historia: "Fue descubierto por William Herschel en 1781. Es el primer planeta descubierto con telescopio. La nave Voyager 2 lo visitó en 1986 y sigue siendo la única misión que lo ha estudiado de cerca.",
    curiosidades: [
      "Su eje está inclinado unos 98°: parece rodar sobre su órbita.",
      "Sus estaciones duran unos 21 años cada una.",
      "Tiene anillos tenues y oscuros, descubiertos en 1977."
    ],
    concepto: {
      titulo: "Rotación y estaciones",
      texto: "La inclinación del eje de Urano es extrema. Eso hace que sus polos reciban luz solar durante largos períodos y que las estaciones duren aproximadamente 21 años. La rotación y la inclinación del eje explican los cambios estacionales."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 8.69,
    nota: "Gravedad y temperatura indicadas a 1 bar de presión, no en una superficie sólida."
  },
  {
    id: "neptuno",
    nombre: "Neptuno",
    orden: 8,
    tipo: "helado",
    tipoEtiqueta: "Gigante helado",
    simbolo: "🔷",
    resumen: "El planeta más lejano del Sol. Es un gigante helado con vientos extremos y fue descubierto gracias a una predicción matemática.",
    datos: [
      { etiqueta: "Diámetro", valor: "49.244 km (3,9 Tierras)" },
      { etiqueta: "Masa", valor: "1,02 × 10²⁶ kg (17,1 Tierras)" },
      { etiqueta: "Distancia al Sol", valor: "4.495 millones de km (30,1 UA)" },
      { etiqueta: "Temperatura", valor: "Aproximadamente -200 °C a 1 bar" },
      { etiqueta: "Día", valor: "Día sideral: 16 h 6 min" },
      { etiqueta: "Año", valor: "164,8 años terrestres" },
      { etiqueta: "Gravedad", valor: "11,15 m/s² a 1 bar (1,14 g)" },
      { etiqueta: "Atmósfera", valor: "Unos 80% hidrógeno, 19% helio y 1,5% metano, con nubes y vientos muy intensos." },
      { etiqueta: "Satélites", valor: "16 lunas conocidas; Tritón es la mayor y orbita en sentido retrógrado." },
      { etiqueta: "Composición", valor: "Interior de hielos de agua, amoníaco y metano, con un núcleo rocoso." }
    ],
    historia: "Fue predicho matemáticamente por Urbain Le Verrier y John Couch Adams, y observado por Johann Galle en 1846. La nave Voyager 2 lo visitó en 1989 y sigue siendo la única misión que lo ha estudiado de cerca.",
    curiosidades: [
      "Tiene algunos de los vientos más rápidos del Sistema Solar, de hasta unos 2.100 km/h.",
      "Tritón orbita en sentido contrario a la rotación de Neptuno y podría ser un objeto capturado.",
      "Tritón tiene géiseres de nitrógeno."
    ],
    concepto: {
      titulo: "Gravedad y dinámica atmosférica",
      texto: "Neptuno tiene una gravedad de 11,15 m/s² a 1 bar. Aunque recibe poca energía del Sol, su atmósfera presenta vientos muy intensos. Es un ejemplo de dinámica atmosférica compleja, donde la energía interna y la rotación también influyen."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 11.15,
    nota: "Gravedad y temperatura indicadas a 1 bar de presión, no en una superficie sólida."
  }
];

export const CUERPOS_ESPECIALES = [
  {
    id: "luna",
    nombre: "Luna",
    orden: null,
    tipo: "satelite",
    tipoEtiqueta: "Satélite natural",
    simbolo: "🌙",
    resumen: "El único satélite natural de la Tierra. Su superficie está marcada por cráteres y mares basálticos, y no tiene una atmósfera significativa.",
    datos: [
      { etiqueta: "Diámetro", valor: "3.474 km (0,27 Tierras)" },
      { etiqueta: "Masa", valor: "7,34 × 10²² kg (0,012 Tierras)" },
      { etiqueta: "Distancia a la Tierra", valor: "384.400 km en promedio" },
      { etiqueta: "Temperatura", valor: "De -173 °C a 127 °C; media aproximada de -20 °C" },
      { etiqueta: "Rotación", valor: "Sincrónica: 27,3 días; siempre vemos la misma cara" },
      { etiqueta: "Órbita", valor: "27,3 días alrededor de la Tierra" },
      { etiqueta: "Gravedad", valor: "1,62 m/s² (0,165 g)" },
      { etiqueta: "Atmósfera", valor: "Prácticamente inexistente; una exosfera muy tenue." },
      { etiqueta: "Composición", valor: "Corteza de anortosita y basalto, manto y núcleo parcialmente fundido." }
    ],
    historia: "Se formó hace unos 4.500 millones de años, probablemente después de un impacto gigante contra la Tierra. La misión Apollo 11 llegó en 1969 y, entre 1969 y 1972, doce personas caminaron sobre su superficie.",
    curiosidades: [
      "Siempre vemos la misma cara porque su rotación y su órbita duran lo mismo.",
      "Sus mareas afectan los océanos de la Tierra.",
      "Hay hielo de agua en cráteres polares que permanecen en sombra."
    ],
    concepto: {
      titulo: "Inercia y gravedad",
      texto: "Con 1,62 m/s², la gravedad lunar es unas 0,165 veces la terrestre. Como no hay una atmósfera significativa, no existe resistencia del aire que frene el movimiento: la inercia hace que un salto dure más y que sea más difícil detenerse."
    },
    fuente: "NASA Planetary Fact Sheet; NASA Solar System Exploration. Consulta: noviembre de 2026.",
    gravedadMs2: 1.62,
    nota: "La Luna es un satélite natural de la Tierra, no un planeta."
  }
];

export const TODOS_LOS_CUERPOS = [...PLANETAS, ...CUERPOS_ESPECIALES];

export function obtenerCuerpo(id) {
  return TODOS_LOS_CUERPOS.find((cuerpo) => cuerpo.id === id) || null;
}
