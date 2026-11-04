(() => {
  if (document.getElementById("asistenteJuego")) return;

  if (!document.querySelector('link[href$="Asistente.css"]')) {
    const estilos = document.createElement("link");
    estilos.rel = "stylesheet";
    estilos.href = "../css/Asistente.css";
    document.head.append(estilos);
  }

  const launcher = document.createElement("button");
  launcher.className = "asistente-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Abrir asistente del juego");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "asistenteJuego");
  launcher.innerHTML = '<span aria-hidden="true">✦</span><span class="asistente-launcher-texto">AYUDA</span>';

  const panel = document.createElement("section");
  panel.className = "asistente-panel";
  panel.id = "asistenteJuego";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Asistente del juego");
  panel.hidden = true;
  panel.innerHTML = `
    <header class="asistente-cabecera">
      <div class="asistente-avatar" aria-hidden="true">✦</div>
      <div class="asistente-identidad"><strong>Asistente de misión</strong><span><i></i> Ayuda del juego</span></div>
      <button class="asistente-cerrar" type="button" aria-label="Cerrar asistente">×</button>
    </header>
    <div class="asistente-mensajes" role="log" aria-live="polite" aria-relevant="additions text"></div>
    <div class="asistente-sugerencias" aria-label="Preguntas frecuentes">
      <button type="button" data-pregunta="¿Cuáles son los controles?">Controles</button>
      <button type="button" data-pregunta="¿Cómo recupero oxígeno?">Oxígeno</button>
      <button type="button" data-pregunta="¿Cómo funciona el puntaje del juego?">Puntaje</button>
    </div>
    <form class="asistente-formulario">
      <label class="solo-lector" for="asistenteEntrada">Escribí una pregunta sobre el juego</label>
      <input id="asistenteEntrada" name="pregunta" maxlength="240" autocomplete="off" placeholder="Preguntá sobre el juego…" required>
      <button type="submit" aria-label="Enviar pregunta">➤</button>
    </form>
    <p class="asistente-aviso">Solo responde consultas sobre Nuevo Hogar.</p>`;

  document.body.append(launcher, panel);

  const mensajes = panel.querySelector(".asistente-mensajes");
  const formulario = panel.querySelector(".asistente-formulario");
  const entrada = panel.querySelector("#asistenteEntrada");
  const closeButton = panel.querySelector(".asistente-cerrar");

  function agregarMensaje(texto, tipo) {
    const burbuja = document.createElement("p");
    burbuja.className = `asistente-mensaje ${tipo}`;
    burbuja.textContent = texto;
    mensajes.append(burbuja);
    mensajes.scrollTop = mensajes.scrollHeight;
    return burbuja;
  }

  const respuestas = [
    {
      coincide: /controles? del juego|cuales son los controles|controles de (?:nuevo hogar|esta mision)|que teclas uso (?:para moverme|para saltar|para el jetpack|en el juego)|que teclas tengo que usar (?:en el juego|para moverme|para saltar)|con que teclas (?:me muevo|salto|uso el jetpack)|como (?:me )?muevo (?:en el juego|al personaje|en el nivel)|como (?:se )?salto en (?:el juego|el nivel)|saltar en el juego|tecla.*saltar.*(?:juego|nivel)|espacio.*saltar|saltar.{0,20}espacio|a ?\/ ?d|como se juega (?:nuevo hogar|este juego|la mision)/,
      texto: "En los niveles 2D, usá A y D para moverte y W o ESPACIO para saltar. Presioná E o el botón de habilidad para la acción especial de cada misión. En Marte, recogé el jetpack y mantené J o el botón JETPACK. P o PAUSAR detiene o reanuda la partida.",
    },
    {
      coincide: /habilidad.{0,24}(?:nivel|planeta|juego|mercurio|venus|luna|jupiter|saturno)|tecla e|boton de habilidad|que hago con e|como (?:uso|activo|utilizo).{0,24}(?:habilidad|impulso|freno|baliza|gravedad)|impulso.{0,24}mercurio|freno.{0,24}luna|pulso.{0,24}gravitatorio|asistencia gravitatoria/,
      texto: "Cada destino tiene una acción: en Mercurio usá E sobre la plataforma amarilla; en Venus, E reduce la gravedad durante el salto; en la Luna, E frena tu movimiento; en Júpiter, E junto a un campo violeta te impulsa; en Marte mantené J tras recoger el jetpack; y en Saturno reuní 3 celdas y activá la baliza con E.",
    },
    {
      coincide: /\bjet ?pack\b|mochila propulsora|impulsarme en marte/,
      texto: "El jetpack está en el nivel 4, en Marte. Recogelo antes del cráter grande y mantené J o el botón JETPACK para cruzarlo; la carga se gasta mientras lo usás.",
    },
    {
      coincide: /como (?:recupero|recargar|cargo).{0,24}oxigeno|oxigeno.{0,24}(?:orbe|recarga|nivel|juego|mision)|orbes? o2|estacion.{0,18}recarga/,
      texto: "El oxígeno disminuye mientras avanzás. Tocá las orbes O₂ o pasá por la estación de recarga para recuperar oxígeno.",
    },
    {
      coincide: /cuantas vidas (?:tengo|me quedan|hay en el nivel)|cuantos corazones (?:tengo|me quedan|hay)|tres corazones|3 corazones|vidas?.{0,18}nivel|corazones.{0,18}nivel|perder las vidas|cuantas veces puedo intentar/,
      texto: "Tenés 3 corazones por nivel. Los láseres y caer en un cráter te hacen perder una vida. Al perder las 3, podés reintentar el nivel.",
    },
    {
      coincide: /combustible.{0,22}(?:nave|nivel|juego|mision)|nave.{0,18}combustible|gasto.{0,18}combustible/,
      texto: "Iniciar un nivel nuevo consume 15% de combustible. Al completar un nivel recuperás 10%, hasta un máximo de 100%. Repetir un nivel ya completado no vuelve a cobrarlo.",
    },
    {
      coincide: /^como funciona el puntaje[?!. ]*$|como funciona el puntaje (?:del juego|en el juego)|puntajes? del juego|puntuacion del juego|puntos?.{0,20}(?:nivel|planeta|juego)|ranking.{0,20}(?:jugadores|juego)|tabla.{0,20}(?:puntuacion|puntaje|puntos)/,
      texto: "Cada planeta completado por primera vez suma 100 puntos. Abrí 🏆 PUNTUACIONES en el mapa para ver la tabla de usuarios registrados.",
    },
    {
      coincide: /gravedad.{0,24}(?:mercurio|venus|luna|tierra|marte|jupiter|saturno|personaje|salto|nivel|juego)|(?:mercurio|venus|luna|tierra|marte|jupiter|saturno).{0,20}gravedad/,
      texto: "La gravedad cambia la altura y el tiempo del salto: Mercurio 3,70; Venus 8,90; Luna 1,62; Marte 3,71; Júpiter 24,79 y Saturno 10,44 m/s². En la Luna los saltos duran más y con E frenás la inercia.",
    },
    {
      coincide: /energia|celdas? de energia|activar la salida|puerta de saturno/,
      texto: "En Saturno recogé las 3 celdas, acercate al portal y presioná E o ACTIVAR BALIZA. Después avanzá hasta la salida.",
    },
    {
      coincide: /cuantos niveles (?:tiene el juego|tiene la mision|hay en el juego|hay en el mapa)|que planetas (?:hay|visito) (?:en el juego|en la mision)|lista de planetas|orden de los planetas|que planeta (?:sigue|viene) despues|despues de (?:mercurio|venus|tierra|marte|jupiter|saturno) que planeta|desbloque.{0,18}(?:nivel|planeta)|pasar.{0,16}nivel|paso al nivel|terminar.{0,18}mision|como (?:completo|termino|paso|gano) (?:el )?(?:nivel|juego|mision)|objetivo.{0,18}(?:juego|nivel|mision)|llegar al portal|final del juego|planetas del juego|planetas de la mision/,
      texto: "La misión tiene 6 destinos: Mercurio, Venus, Luna, Marte, Júpiter y Saturno. Partís desde la Tierra; al elegir el nivel 1 despegás hacia la misión de impulso en Mercurio. Completá cada misión para desbloquear la siguiente.",
    },
    {
      coincide: /rayos? laser|obstaculos?.{0,18}(?:nivel|juego)|crater.{0,18}(?:nivel|juego)|caer.{0,18}(?:nivel|crater|juego)/,
      texto: "Esquivá los rayos láser y los cráteres. Usá E o el botón de habilidad del nivel: impulso en Mercurio, pulso gravitatorio en Venus, freno inercial en la Luna y asistencia gravitatoria en Júpiter. En Marte, mantené el jetpack; en Saturno, reuní la energía y activá la baliza.",
    },
    {
      coincide: /como (?:me )?registro|registrarme en el juego|crear (?:una )?cuenta|^como iniciar sesion[?!. ]*$|iniciar sesion en el juego|cuenta del juego|contrasena de mi cuenta/,
      texto: "Podés crear una cuenta desde Registrarse en la pantalla de acceso. El puntaje de los niveles completados queda asociado al usuario.",
    },
    {
      coincide: /que puedes hacer|que sabes (?:hacer|del juego)|temas|^hola[!,. ]*$|^buenas[!,. ]*$|^ayuda[!,. ]*$/,
      texto: "¡Hola! Puedo ayudarte con controles, planetas, oxígeno, vidas, combustible, jetpack, energía, obstáculos, cuentas y puntuaciones del juego.",
    },
  ];

  function responder(pregunta) {
    const normalizada = pregunta.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const respuesta = respuestas.find((item) => item.coincide.test(normalizada));
    return respuesta?.texto || "Solo puedo ayudar con el juego Nuevo Hogar. Preguntame sobre controles, niveles, oxígeno, vidas, combustible, jetpack, energía o puntuaciones.";
  }

  function mostrarPanel(abrir) {
    panel.hidden = !abrir;
    launcher.setAttribute("aria-expanded", String(abrir));
    if (abrir) entrada.focus();
  }

  launcher.addEventListener("click", () => {
    const abrir = panel.hidden;
    mostrarPanel(abrir);
    if (abrir && !mensajes.childElementCount) {
      agregarMensaje("¡Hola! Soy tu asistente de misión. ¿En qué te ayudo con el juego?", "bot");
    }
  });
  closeButton.addEventListener("click", () => { mostrarPanel(false); launcher.focus(); });
  panel.querySelectorAll("[data-pregunta]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const pregunta = boton.dataset.pregunta;
      agregarMensaje(pregunta, "usuario");
      agregarMensaje(responder(pregunta), "bot");
    });
  });
  formulario.addEventListener("submit", (event) => {
    event.preventDefault();
    const pregunta = entrada.value.trim();
    if (!pregunta) return;
    agregarMensaje(pregunta, "usuario");
    agregarMensaje(responder(pregunta), "bot");
    entrada.value = "";
    entrada.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      mostrarPanel(false);
      launcher.focus();
    }
  });
})();
