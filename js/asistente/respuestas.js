/* Base de conocimiento del asistente: preguntas frecuentes y respuestas. */

const respuestas = [
  { coincide: /^(hola|buenas|buen dia|buenas tardes|buenas noches|que tal)$/, texto: "¡Hola, comandante! Preguntame lo que quieras sobre Nuevo Hogar: controles, misiones, física, oxígeno, vidas, habilidades, cuentas o puntuaciones." },
  { coincide: /^(que puedes hacer|que sabes hacer|que temas|ayuda|preguntas frecuentes)$/, texto: "Puedo explicar cómo jugar, los planetas y sus conceptos de física, habilidades, controles, obstáculos, oxígeno, vidas, combustible, jetpack, puntaje, registro, progreso y créditos. Escribí la pregunta con tus palabras." },
  { coincide: /controles?|teclas?|como se juega|como me muevo|mover al personaje|como salto|saltar con|espacio para saltar|a y d/, texto: "En PC: A y D mueven al astronauta; W o ESPACIO permiten saltar. E activa la habilidad del planeta y P o PAUSAR detiene la partida. En Marte, mantené J para usar el jetpack después de recogerlo." },
  { coincide: /celular|telefono|pantalla tactil|tablet|controles tactiles|como juego desde/, texto: "En celulares y tablets aparecen controles táctiles en la pantalla: flechas para moverte, SALTAR y el botón de habilidad. Tocá y mantené JETPACK mientras cruzás el cráter de Marte." },
  { coincide: /pausar|pausa|reanudar|detener la partida|se congela el juego/, texto: "Tocá PAUSAR arriba del nivel o presioná P. La pausa detiene el movimiento, los obstáculos y el consumo de oxígeno. Usá CONTINUAR JUGANDO o P para volver." },
  { coincide: /cuanta carga.*jet ?pack|carga.*jet ?pack|cuanto combustible me queda|mi combustible|combustible actual/, texto: (preguntaNormalizada) => {
    const cargaJetpack = document.getElementById("valorJetpack")?.textContent;
    const combustible = document.getElementById("valorCombustible")?.textContent;
    return /jet ?pack/.test(preguntaNormalizada) ? (cargaJetpack ? "La carga actual del jetpack es: " + cargaJetpack + "." : "El indicador de carga del jetpack aparece en el nivel de Marte.") : (combustible ? "El combustible actual de la nave es " + combustible + "." : "El combustible de la nave aparece en la pantalla de selección de niveles.");
  } },
  { coincide: /objetivo|de que trata|historia|trama|nuevo hogar|mision exodo|que tengo que hacer/, texto: "La tripulación busca un planeta habitable para la humanidad. Superá seis misiones de plataformas 2D, usando habilidades relacionadas con la física de cada mundo, y llegá al portal final de Saturno." },
  { coincide: /cuantos niveles|cuantas misiones|que planetas|lista de planetas|orden de los planetas|planetas del juego|que planeta sigue|que planeta viene|desbloquear|desbloqueo/, texto: "Hay seis misiones jugables, en este orden: Mercurio, Venus, Luna, Marte, Júpiter y Saturno. La Tierra es el punto de partida del mapa. Al completar una misión se habilita la siguiente." },
  { coincide: /tierra|sol|mapa del sistema|seleccion de nivel|mapa de niveles/, texto: "En el mapa, la Tierra es el punto de partida: al seleccionar el nivel 1 despegás hacia Mercurio. Los demás planetas del sistema solar decoran el mapa; las seis misiones jugables van de Mercurio a Saturno." },
  { coincide: /nivel 1|mision 1|planeta 1|mercurio|impulso|plataforma amarilla/, texto: "Nivel 1, Mercurio: usá E cuando estés en el suelo y cerca de una plataforma amarilla para impulsarte sobre los cráteres. La misión enseña cómo un impulso cambia el movimiento. Los tramos se acortaron para que sea más accesible." },
  { coincide: /nivel 2|mision 2|planeta 2|venus|pulso gravitatorio|gravedad baja|reducir la gravedad/, texto: "Nivel 2, Venus: presioná E durante el salto para reducir la gravedad por un momento. Así podés permanecer más tiempo en el aire y alcanzar las plataformas entre nubes." },
  { coincide: /nivel 3|mision 3|planeta 3|luna|freno inercial|inercia|frenar/, texto: "Nivel 3, la Luna: la gravedad es baja y el astronauta conserva su velocidad. Usá E para aplicar el freno inercial y soltá A o D para acomodar el aterrizaje en las plataformas móviles." },
  { coincide: /nivel 4|mision 4|planeta 4|marte|jet ?pack|mochila propulsora/, texto: "Nivel 4, Marte: recogé la mochila propulsora antes del cráter ancho. Después mantené J en PC o el botón JETPACK en pantalla para elevarte y cruzarlo; la barra muestra la carga disponible." },
  { coincide: /nivel 5|mision 5|planeta 5|jupiter|campo violeta|asistencia gravitatoria|resortera/, texto: "Nivel 5, Júpiter: la gravedad es muy alta. Acercate a un campo violeta y presioná E para activar la asistencia gravitatoria, que impulsa la trayectoria hacia delante." },
  { coincide: /nivel 6|mision 6|planeta 6|saturno|celda|celdas|energia|baliza|portal/, texto: "Nivel 6, Saturno: reuní las tres celdas de energía, acercate a la baliza y presioná E. Cuando se active, avanzá hasta el portal para terminar la misión y ver los créditos del equipo." },
  { coincide: /gravedad|m s|salto mas alto|altura del salto|fisica de los planetas/, texto: "La gravedad afecta cuánto subís y cuánto dura el salto: Mercurio 3,70; Venus 8,90; Luna 1,62; Marte 3,71; Júpiter 24,79 y Saturno 10,44 m/s². Cada nivel propone una mecánica distinta para explorar ese concepto." },
  { coincide: /habilidad|tecla e|boton de habilidad|que hago con e|acciones especiales/, texto: "Las habilidades son: impulso en Mercurio (E cerca de la plataforma amarilla), pulso de gravedad en Venus (E en el aire), freno inercial en la Luna (E), jetpack en Marte (mantener J), asistencia gravitatoria en Júpiter (E junto al campo violeta) y baliza en Saturno (E junto al portal con las 3 celdas)." },
  { coincide: /oxigeno|orbe|recargar|recarga|me queda de aire|sin aire|estacion de recarga/, texto: () => {
    const actual = document.getElementById("valorOxigeno")?.textContent;
    return "El oxígeno baja mientras avanzás. Recogé las orbes O₂ o cruzá la estación de recarga; ambas restauran oxígeno. " + (actual ? "Ahora el indicador marca " + actual + "." : "La barra de la parte superior muestra cuánto te queda.");
  } },
  { coincide: /cuantas vidas|cuantos corazones|vidas|corazones|intentos|me queda una vida/, texto: () => {
    const actual = document.getElementById("corazones")?.getAttribute("aria-label");
    return "Empezás cada nivel con tres corazones. Un láser o una caída en un cráter quita uno y te devuelve al inicio con oxígeno lleno. " + (actual ? "En esta partida te quedan " + actual + "." : "Si perdés los tres, podés reintentar sin volver a pagar el combustible de esa misión.");
  } },
  { coincide: /morir|me caigo|caer en un crater|perder una vida|perdi una vida|game over|reintentar|reiniciar el nivel/, texto: "Si tocás un láser o caés en un cráter, perdés un corazón y reaparecés al comienzo con oxígeno completo. Al perder los tres corazones, presioná REINTENTAR; no se cobra otra vez el combustible de ese nivel." },
  { coincide: /combustible|nafta|energia de la nave|gasto de la nave/, texto: "Al comenzar una misión nueva se gastan 15 puntos de combustible. Completarla devuelve 10, hasta un máximo de 100. Volver a jugar un nivel ya completado no vuelve a cobrar el gasto." },
  { coincide: /cuantos puntos tengo|mi puntaje|mi puntuacion|cuanto puntaje llevo/, texto: () => {
    const estado = document.getElementById("estado")?.textContent || "";
    const puntaje = estado.match(/([0-9]+) puntos/i)?.[1];
    return puntaje ? "Tu puntaje actual es " + puntaje + "." : "El mapa muestra tu puntaje acumulado junto al nombre de usuario.";
  } },
  { coincide: /puntaje|puntos|ranking|tabla de puntuaciones|tabla de puntaje|clasificacion/, texto: "Completar por primera vez cada nivel suma 100 puntos. En el mapa abrí PUNTUACIONES para consultar el ranking de las cuentas registradas." },
  { coincide: /registr|crear una cuenta|cuenta nueva|iniciar sesion|login|contrasena|invitado|sin cuenta|sin registrarse/, texto: "Desde la pantalla de acceso elegí REGISTRARSE para crear una cuenta. También podés entrar como invitado si esa opción está disponible; el progreso y las puntuaciones de una cuenta se asocian a su usuario." },
  { coincide: /guardar|se guarda|progreso|base de datos|mariadb|mysql|xampp/, texto: "Con una cuenta, el juego guarda el avance y las puntuaciones en la base de datos del servidor. Para probarlo en XAMPP, iniciá Apache y MySQL; usá la dirección local de tu PC y, desde otro dispositivo en el mismo Wi‑Fi, la dirección IPv4 del equipo anfitrión." },
  { coincide: /obstaculos|laser|rayo|caja|crater|plataforma|meteorito/, texto: "Esquivá los rayos láser, las cajas y los cráteres. Los láseres alternan entre encendidos y apagados: observá el haz antes de cruzar. Si caés en un cráter o tocás un rayo encendido, perdés un corazón." },
  { coincide: /pasar de nivel|siguiente nivel|terminar un nivel|completar un nivel|ganar|victoria|que pasa cuando termino|final del juego/, texto: "Al tocar la salida se guarda el nivel, se suman los puntos y aparece una ventana. Desde ahí podés avanzar directamente a la misión desbloqueada o volver al mapa; al terminar Saturno aparecen los créditos del equipo." },
  { coincide: /dificil|mas facil|facilidad|no puedo pasar|no puedo cruzar/, texto: "Se acortaron los cráteres, se separaron los objetos y se redujo el consumo de oxígeno para hacer las misiones más amables. Aprovechá las orbes, la recarga y la habilidad especial de cada planeta." },
  { coincide: /creditos|equipo|candela|jeremias|juan|maldonado|lider del proyecto|diseno grafico|frontend|backend|programacion|quien hizo el juego/, texto: "El equipo es: Candela Veltri, líder del proyecto; Maldonado Luna, diseño gráfico; Jeremías Díaz, frontend; y Juan Carballo, backend. Al completar Saturno aparecen sus créditos con una explicación del aporte de cada integrante." },
  { coincide: /no abre|no carga|pantalla en blanco|localhost|otra pc|otro dispositivo|misma red wifi|direccion ip|apache|servidor local/, texto: "Para abrirlo en la PC, iniciá Apache en XAMPP y entrá a http://localhost/Juego-Fisica/. Desde otro equipo de la misma red, usá la IPv4 de la PC anfitriona en lugar de localhost. Si no carga, verificá que ambos estén en el mismo Wi‑Fi y que Apache esté permitido en la red privada." },
  { coincide: /aprendizaje|educativo|que aprendo|que ensena|contenido de fisica|para que sirve el juego/, texto: "El aprendizaje aparece en las acciones: impulso en Mercurio, gravedad en Venus, inercia en la Luna, propulsión con jetpack en Marte, asistencia gravitatoria en Júpiter y energía almacenada en Saturno." },
];

export function responder(pregunta) {
  const normalizada = pregunta
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const respuesta = respuestas.find((item) => item.coincide.test(normalizada));
  if (!respuesta) {
    return "Puedo responder preguntas sobre Nuevo Hogar. Probá con otra forma de preguntarme por controles, niveles, física, obstáculos, oxígeno, vidas, combustible, cuentas, puntajes o créditos.";
  }
  return typeof respuesta.texto === "function" ? respuesta.texto(normalizada) : respuesta.texto;
}
