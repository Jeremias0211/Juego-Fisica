# Documentación de Nuevo Hogar

Esta guía explica cómo está armado el proyecto, qué hace cada archivo y cómo se conectan las piezas. Está pensada para que cualquier integrante del equipo pueda ubicar rápido dónde cambiar algo sin tener que leer un archivo de 1500 líneas.

> **Idea central:** el código se separó por responsabilidades. Los datos de los planetas viven en un archivo, la física en otro, los controles en otro, el dibujo en archivos pequeños y el arranque de la pantalla en `main.js`. Los CSS se dividieron por pantalla y por tipo de contenido. Así cada archivo se puede leer de principio a fin en pocos minutos.

---

## Índice

1. [Qué es el juego](#1-qué-es-el-juego)
2. [Flujo de pantallas](#2-flujo-de-pantallas)
3. [Tecnologías](#3-tecnologías)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Arquitectura general](#5-arquitectura-general)
6. [Motor del juego: `js/juego/`](#6-motor-del-juego-jsjuego)
7. [Scripts del portal](#7-scripts-del-portal)
8. [Páginas HTML](#8-páginas-html)
9. [Hojas de estilo](#9-hojas-de-estilo)
10. [Backend PHP y MySQL](#10-backend-php-y-mysql)
11. [Base de datos](#11-base-de-datos)
12. [Servidor alternativo con Node y SQLite](#12-servidor-alternativo-con-node-y-sqlite)
13. [P5.js incluido en `vendor/`](#13-p5js-incluido-en-vendor)
14. [Datos guardados en el navegador](#14-datos-guardados-en-el-navegador)
15. [Cómo ejecutar el proyecto](#15-cómo-ejecutar-el-proyecto)
16. [Guía rápida de mantenimiento](#16-guía-rápida-de-mantenimiento)
17. [Solución de problemas](#17-solución-de-problemas)

---

## 1. Qué es el juego

**Nuevo Hogar** es un videojuego educativo de plataformas 2D. La humanidad debe abandonar la Tierra y recorrer seis misiones espaciales. Cada planeta enseña un concepto de física distinto:

| Nivel | Planeta | Concepto | Habilidad |
|---|---|---|---|
| 1 | Mercurio | Impulso | `E` sobre una plataforma amarilla |
| 2 | Venus | Gravedad | `E` reduce la gravedad durante el salto |
| 3 | Luna | Inercia | `E` aplica un freno inercial |
| 4 | Marte | Propulsión | Mantener `J` para usar el jetpack |
| 5 | Júpiter | Asistencia gravitatoria | `E` cerca de un campo violeta |
| 6 | Saturno | Energía | `E` junto al portal con tres celdas |

El jugador administra oxígeno, tres vidas por nivel, combustible de la nave y puntaje. El portal incluye cuentas, modo invitado, mapa de misiones, ranking y créditos.

---

## 2. Flujo de pantallas

```text
index.php  →  html/Login.html  →  html/Index.html  →  html/Historia.html
                    │                    │
                    │                    ├─ Opciones (modal)
                    │                    ├─ Instrucciones
                    │                    └─ Créditos
                    │
                    └─ Registro.html

Historia.html  →  Niveles.html  →  Juego.html?nivel=1..6
                        │                  │
                        ├─ Informe de      ├─ Pausa
                        │  misión          ├─ Nivel completado
                        └─ Ranking         └─ Final.html (tras Saturno)
```

- **Login / Registro:** crean la sesión y el usuario.
- **Index:** menú principal, opciones de audio y pantalla, estadísticas y reinicio de progreso.
- **Historia:** presenta la misión.
- **Niveles:** mapa del sistema solar, informes de cada planeta y ranking.
- **Juego:** canvas de p5, HUD, controles táctiles y modales de pausa/completado.
- **Final / Créditos:** cierre de la historia y créditos del equipo.

---

## 3. Tecnologías

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 |
| Estilos | CSS3 (archivos separados por pantalla) |
| Lógica del portal | JavaScript clásico |
| Motor del juego | JavaScript con módulos ES + P5.js 2.3.3 |
| Audio | Web Audio API (sonidos sintetizados, sin archivos de audio) |
| Backend oficial | PHP 8.1+ con PDO |
| Base de datos oficial | MySQL o MariaDB |
| Backend alternativo | Node.js con `node:sqlite` |
| Control de versiones | Git y GitHub |

El juego usa `vendor/p5.min.js` de forma local para que funcione en una red sin internet. No se explica línea por línea porque es una biblioteca externa minificada.

---

## 4. Estructura de carpetas

```text
Juego-Fisica/
├── index.php                     Redirige al login
├── README.md                     Guía rápida de instalación y uso
├── DOCUMENTACION.md              Este documento
├── GDD.md                        Documento de diseño del juego
├── package.json                  Dependencia de p5 para npm
├── server.js                     Servidor alternativo Node + SQLite
│
├── html/
│   ├── Login.html                Inicio de sesión
│   ├── Registro.html             Creación de cuenta
│   ├── Index.html                Menú principal y modal de opciones
│   ├── Historia.html             Introducción narrativa
│   ├── Niveles.html              Mapa, informes y ranking
│   ├── Juego.html                Pantalla del nivel 2D
│   ├── Instrucciones.html        Guía de controles y recursos
│   ├── Creditos.html             Créditos del equipo
│   └── Final.html                Cierre de la misión
│
├── js/juego/                     Motor del juego modular
│   ├── main.js                   Arranque, sesión, HUD y callbacks
│   ├── misiones.js               Datos de los seis planetas
│   ├── geometria.js              Ajuste y separación de objetos
│   ├── audio.js                  Puente hacia Sonido.js
│   └── escena/
│       ├── escena.js             Une estado, controles, física y dibujo
│       ├── estado.js             Estado de la partida
│       ├── controles.js          Teclado, táctil, habilidades y pausa
│       ├── actualizar.js         Simulación y colisiones
│       └── dibujo/
│           ├── vista.js          Canvas, DPR, zoom y coordenadas
│           ├── composicion.js    Fotograma completo y cámara
│           ├── escenario.js      Fondo, terreno y plataformas
│           ├── objetos.js        Láseres, orbes, celdas, portal
│           └── jugador.js        Dibujo del astronauta
│
├── css/
│   ├── menu/                     Menú principal
│   │   ├── base.css
│   │   ├── responsive.css
│   │   └── opciones.css
│   ├── opciones/                 Modal de opciones
│   │   ├── panel.css
│   │   ├── controles.css
│   │   └── responsive.css
│   ├── login/                    Pantalla de login
│   │   ├── base.css
│   │   ├── formulario.css
│   │   └── responsive.css
│   ├── registro/                 Pantalla de registro
│   │   ├── base.css
│   │   ├── formulario.css
│   │   └── responsive.css
│   ├── historia/                 Pantalla de historia
│   │   ├── base.css
│   │   └── responsive.css
│   ├── Niveles.css               Mapa, briefing y ranking
│   ├── Juego.css                 Nivel, HUD y overlays
│   ├── Info.css                  Estilos compartidos de información
│   ├── Final.css                 Ajustes de la pantalla final
│   └── Asistente.css             Widget de ayuda
│
├── api/                          Backend PHP
│   ├── conexion.php              Utilidades, PDO y sesión
│   ├── registrar.php             Crear cuenta
│   ├── iniciar-sesion.php        Iniciar sesión
│   ├── cerrar-sesion.php         Cerrar sesión
│   ├── progreso.php              Consultar progreso
│   ├── puntuaciones.php          Ranking y guardado de puntaje
│   └── reiniciar-progreso.php    Borrar progreso de la cuenta
│
├── database/
│   ├── nuevo_hogar.sql           Esquema MySQL y planetas iniciales
│   └── nuevo_hogar.sqlite        Base local del servidor Node (generada)
│
├── img/                          Fondos y logo
├── vendor/                       P5.js local y su licencia
│
├── Sonido.js                     Motor de audio global
├── scrips.js                     Menú principal y opciones
├── Niveles.js                    Mapa, informes y ranking
├── base-datos.js                 Progreso local en localStorage
├── Login.js                      Lógica del formulario de login
├── Registro.js                   Lógica del formulario de registro
└── Asistente.js                  Asistente de ayuda flotante
```

> Los archivos `Juego.js` y los CSS monolíticos anteriores (`Style.css`, `Opciones.css`, `Login.css`, `Registro.css`, `Historia.css`) ya no existen. Fueron reemplazados por los módulos y las carpetas de esta estructura.

---

## 5. Arquitectura general

```text
┌─────────────────────────────────────────────────────────────┐
│ Navegador                                                   │
│                                                             │
│  HTML  ──>  CSS por pantalla                                │
│    │                                                        │
│    ├── scrips.js / Niveles.js / Login.js / Registro.js      │
│    ├── base-datos.js  ──> localStorage                      │
│    ├── Sonido.js      ──> Web Audio API                     │
│    └── js/juego/main.js ──> módulos de escena y dibujo      │
│                                                             │
└───────────────┬─────────────────────────────────────────────┘
                │ fetch HTTP + JSON
                ▼
┌─────────────────────────────────────────────────────────────┐
│ api/*.php  ──> PDO  ──> MySQL / MariaDB                     │
└─────────────────────────────────────────────────────────────┘

Alternativa local:
server.js ──> node:http + node:sqlite + scrypt
```

### Por qué está dividido así

- **Datos separados de la lógica:** `misiones.js` solo describe planetas; no dibuja ni calcula.
- **Física separada de la presentación:** `actualizar.js` mueve y colisiona; la carpeta `dibujo/` solo pinta.
- **Estado centralizado:** `estado.js` guarda todo lo que cambia durante una partida.
- **Entrada separada:** `controles.js` traduce teclado y pantalla táctil a acciones.
- **Arranque delgado:** `main.js` conecta la sesión, el HUD y p5 con la escena.

Esto permite cambiar, por ejemplo, el dibujo del jugador sin tocar la física, o ajustar la gravedad de un planeta sin tocar los controles.

---

## 6. Motor del juego: `js/juego/`

El juego se carga únicamente desde `html/Juego.html`:

```html
<script src="../base-datos.js"></script>
<script src="../vendor/p5.min.js"></script>
<script type="module" src="../js/juego/main.js"></script>
```

`base-datos.js` y `p5.min.js` son scripts clásicos; el motor del juego es un módulo ES. Por eso `main.js` puede usar `import` y los demás archivos se cargan automáticamente.

### 6.1 `main.js` — arranque de la pantalla de juego

**Responsabilidad:** todo lo que rodea a la partida: sesión, nivel solicitado, progreso, HUD, botones y creación de la escena.

Bloques principales:

1. **Verificación de sesión.** Lee `jugadorActual`, `sesionActiva` y `modoInvitado`. Si no hay sesión ni invitado, redirige a `Login.html`.
2. **Sincronización con el servidor.** Si no es invitado, consulta `../api/progreso.php` y combina el avance remoto con `DB.mergeServerProgress`. Si el servidor falla, sigue con el progreso local.
3. **Selección de misión.** Toma `?nivel=` de la URL, lo limita entre 1 y 6 y obtiene el planeta de `MISIONES`.
4. **Ajuste del recorrido.** Llama a `acortarMision` con un factor por nivel y a `separarObjetosMision` para que los objetos no se superpongan.
5. **Control de acceso.** Si el nivel está bloqueado, vuelve al mapa.
6. **Carga del HUD.** Escribe planeta, título, descripción, fórmula y estado; obtiene referencias a barras, corazones, contadores y modales.
7. **Combustible.** `DB.startLevel(user, level, 15)` cobra 15% al iniciar una misión nueva. Si no hay combustible, muestra el aviso y no crea la escena.
8. **Botones de avance.** Configura “siguiente”, “avanzar”, “reintentar”, “pausar”, “habilidad” y “reanudar”.
9. **Funciones del HUD.** `updateFuelHud`, `updateHearts`, `updateJetpackHud`, `updateEnergyHud` y `updateOxygenHud` actualizan barras y textos.
10. **Final de nivel.** `completeLevel` guarda el progreso con `DB.complete`, envía el puntaje a `../api/puntuaciones.php` si hay cuenta, actualiza el HUD y abre el modal de nivel completado.
11. **Creación de p5.** `new window.p5((sketch) => crearEscena(...), sceneHost)` inicia el canvas dentro de `#contenedorEscena`.
12. **Callbacks de la escena.** Conectan los eventos del juego con el HUD:
    - `onOxygenChange`: barra de oxígeno y orbes.
    - `onMessage`: mensajes de la plataforma.
    - `onLivesChange`: corazones.
    - `onJetpackChange`: barra del jetpack.
    - `onEnergyChange`: contador de celdas.
    - `onGameOver`: muestra “REINTENTAR”, detiene música y desactiva pausa.
    - `onRestart`: restaura botones y música.
    - `onPauseChange`: muestra u oculta el overlay de pausa.
    - `onComplete`: detiene música, reproduce el sonido de victoria y llama a `completeLevel`.

> El botón de habilidad se comporta distinto en Marte: en pantallas táctiles se oculta porque ya existe el botón `JETPACK`; en escritorio mantiene presionado el jetpack con `pointerdown`.

### 6.2 `misiones.js` — datos de los planetas

**Responsabilidad:** describir los seis niveles sin lógica. Cada objeto de `MISIONES` contiene:

| Campo | Significado |
|---|---|
| `planet`, `title`, `description` | Textos de la pantalla |
| `formula`, `fact` | Explicación de física y mensaje de victoria |
| `gravity` | Gravedad del planeta en m/s² (se convierte a píxeles/s²) |
| `jumpSpeed` | Velocidad inicial del salto |
| `impulseSpeed` | Fuerza del impulso de Mercurio |
| `drain` | Oxígeno que se consume por segundo |
| `world` | Largo total del recorrido |
| `sky`, `ground`, `surface`, `rock`, `accent` | Colores del escenario |
| `gaps` | Cráteres `[inicio, fin]` |
| `blocks` | Cajas o elevaciones `[x, alto, ancho]` |
| `platforms` | Plataformas fijas `[x, ancho, alto]` |
| `movingPlatforms` | Plataformas móviles `[x, ancho, alto, oscilación, velocidad, fase]` |
| `orbs` | Orbes de oxígeno `[x, altura]` |
| `lasers` | Láseres `[x, altura, período, fase, proporción activa]` |
| `station` | Posición de la estación de recarga |
| `refill` | Oxígeno que devuelve una orbe |
| `ability` | Tipo, tecla, etiqueta y ayuda de la habilidad |
| `impulsePads` | Plataformas amarillas de Mercurio |
| `gravityPulse` | Duración, factor y recarga del pulso de Venus |
| `inertia` | Activa el movimiento con inercia lunar |
| `jetpack` | Punto de recogida, cráter obligatorio, consumo y empuje |
| `gravityWells` | Campos gravitatorios de Júpiter `[x, altura, radio, fuerza]` |
| `energyCells` | Celdas de Saturno `[x, altura]` |
| `requiredEnergy` | Celdas necesarias para activar la baliza |

Cada nivel tiene su propia combinación. Por ejemplo, Mercurio usa `impulsePads`, Venus usa `gravityPulse`, la Luna usa `inertia` y `movingPlatforms`, Marte usa `jetpack`, Júpiter usa `gravityWells` y Saturno usa `energyCells`.

### 6.3 `geometria.js` — ajuste del recorrido

**Responsabilidad:** adaptar los datos de la misión antes de jugar.

- **`acortarMision(mission, factor)`** multiplica por `factor` todas las coordenadas horizontales: `world`, `gaps`, `blocks`, `platforms`, `movingPlatforms`, `orbs`, `lasers`, `station`, `impulsePads`, `gravityWells`, la recogida del jetpack y las celdas de energía. No cambia alturas, anchos ni velocidades.
- **`separarObjetosMision(mission)`** evita que dos objetos queden encimados:
  - `libre(x, lift, forma, requiereSuelo)` comprueba límites del mundo, cráteres, cajas, plataformas, láseres y objetos ya reservados.
  - `ubicar(...)` prueba la posición original y luego desplazamientos de ±28 px hasta 672 px.
  - `reservar(...)` anota la posición final para que el siguiente objeto no la use.
  - Se aplica a estación, plataformas de impulso, jetpack, orbes y celdas.

### 6.4 `audio.js` — puente de audio

Archivo corto con dos funciones:

- **`sfx(nombre, opciones)`** llama a `window.SonidoJuego.play(...)` dentro de `try/catch`. Si el navegador bloquea el audio, el juego sigue funcionando.
- **`audioJuego()`** devuelve `window.SonidoJuego` para operaciones más complejas (música, jetpack, pausa).

Así el motor del juego no depende directamente de la implementación de `Sonido.js`.

### 6.5 `escena/escena.js` — composición de la escena

**Responsabilidad:** conectar p5 con el estado, los controles, la simulación y el dibujo.

Funciones y bloques:

- **`crearEscena(p, mission, callbacks, sceneHost)`** crea el estado (`crearEstado`), los controles (`crearControles`) y devuelve una API con `restart`.
- **`medidaEscena()`** obtiene el ancho y alto reales de `#contenedorEscena`, con respaldo en `window.innerWidth/Height`.
- **`ajustarCanvas()`** sincroniza el canvas con el contenedor:
  - Ajusta `pixelDensity` al `devicePixelRatio`.
  - Redimensiona con `p.resizeCanvas`.
  - Fuerza `width/height: 100%`, posición absoluta y `display: block`.
- **`reiniciar()`** llama a `reiniciarNivel`.
- **API expuesta en `p`:** `pauseGame`, `resumeGame`, `useAbility`, `setJetpack`, `restartLevel`. `main.js` la usa desde los botones.
- **`p.setup`**:
  - Configura densidad de píxeles.
  - Crea el canvas con `p.createCanvas`.
  - Lo asigna a `#contenedorEscena`, le pone `id="escena"` y atributos de accesibilidad.
  - Ajusta posición y overflow del contenedor.
  - Observa cambios de tamaño con `ResizeObserver` y escucha `resize`/`orientationchange`.
  - Hace dos ajustes diferidos (60 ms y 260 ms) para cuando el layout termina de asentarse.
- **`p.draw`**:
  - Ignora el fotograma si está pausado.
  - Calcula `dt` con `p.millis()`, limitado a `0.04` s para evitar saltos grandes.
  - Acumula `gameTime` y llama a `prepararVista`, `actualizarJuego` y `dibujarEscena`.
  - Captura errores de dibujo para que un fallo visual no congele la página.
- **`p.windowResized`** vuelve a ajustar el canvas.

### 6.6 `escena/estado.js` — estado de la partida

**Responsabilidad:** crear y modificar el estado completo de un nivel.

- **`crearEstado(mission)`** devuelve un objeto con:
  - Jugador: `x`, `y`, `vx`, `vy`, `width`, `height`, `grounded`.
  - Coleccionables: `orbs`, `energyCells`, `impulsePads`, `lasers`.
  - Mundo: `worldLength`, `speed`, `groundSegments`, `rects`.
  - Física: `baseGravity = 910`, `gravity = 910 * mission.gravity / 9.8`, `jumpSpeed`.
  - Recursos: `oxygen`, `collected`, `energyCollected`, `lives`, `invulnerability`.
  - Habilidades: `gravityPulseRemaining`, `abilityCooldown`, `abilityRunRemaining`, `impulseGapUsed`, `impulseGapsPassed`.
  - Jetpack: `jetpackCollected`, `jetpackFuel`, `jetpackUsedInGap`, `jetpackSonando`.
  - Progreso: `finished`, `gameOver`, `paused`, `stationUsed`, `exitActivated`.
  - Cámara y HUD: `camera`, `lastReportedOxygen`, `lastReportedJetpack`.
- **`obtenerSegmentosSuelo(mission)`** convierte los cráteres en tramos de suelo continuo.
- **`obtenerRects(mission, floorY, time)`** genera los rectángulos de colisión:
  - Cajas `block`.
  - Plataformas fijas `platform`.
  - Plataformas móviles `moving-platform`, con oscilación vertical y recorrido horizontal dentro del cráter.
- **`laserActivo(laser, time)`** calcula si el láser está encendido según período, fase y proporción.
- **`limpiarTeclas(state)`** vacía el `Set` de teclas y quita la clase `activo` de los botones táctiles.
- **`reiniciarJugador(...)`** devuelve al astronauta al inicio, restaura oxígeno, coleccionables, jetpack, habilidades y llama a los callbacks del HUD.
- **`perderVida(...)`**:
  - Ignora el daño si hay invulnerabilidad, fin de nivel o game over.
  - Elige el efecto según el mensaje (láser, caída, oxígeno, golpe).
  - Resta un corazón, reinicia al jugador y, si llega a cero, activa `gameOver`.
- **`reiniciarNivel(...)`** restaura tres vidas, limpia banderas, reinicia al jugador y avisa a `main.js`.

### 6.7 `escena/controles.js` — entrada del jugador

**Responsabilidad:** convertir teclado y pantalla táctil en acciones del juego.

- **`controlar(name, activo)`**:
  - Al soltar, elimina la tecla y la clase visual.
  - Al presionar, ignora si está pausado, terminado o sin vidas.
  - En `jetpack`, exige mochila, carga y suelo para el impulso inicial.
  - En `jump`, aplica `player.vy = -state.jumpSpeed` si está en el suelo.
- **`useAbility()`** implementa las seis habilidades:
  - **Impulso:** exige estar en el suelo y cerca de una plataforma amarilla; marca el cráter usado y lanza al jugador.
  - **Gravedad:** activa `gravityPulseRemaining` y su recarga.
  - **Freno:** pone `vx = 0` y suelta izquierda/derecha.
  - **Asistencia:** busca el campo violeta más cercano; si está dentro del radio, aplica `vy = -900` y un empuje horizontal temporal.
  - **Energía:** exige estar cerca del portal y tener las celdas necesarias; activa `exitActivated`.
- **`onKeyDown` / `onKeyUp`**:
  - Ignoran formularios y campos editables.
  - `P` pausa o reanuda.
  - `E` usa la habilidad.
  - `A/D` o flechas mueven; `W`, flecha arriba o espacio saltan; `J` usa el jetpack.
  - Evitan el scroll de la página con espacio y flechas.
- **`pauseGame()`** limpia teclas, detiene música y jetpack, llama a `p.noLoop()` y muestra el overlay.
- **`resumeGame()`** reanuda el bucle, reinicia la música y oculta el overlay.
- **`conectar()`** enlaza:
  - Botones `.controles-tactiles [data-control]` con `pointerdown`, `pointerup`, `pointercancel` y `lostpointercapture`.
  - Teclado global.
  - `blur` de la ventana para soltar todas las teclas.

### 6.8 `escena/actualizar.js` — simulación y colisiones

**Responsabilidad:** avanzar la física un fotograma. Es el archivo más “matemático” del juego.

- **`colisionaPeligro(state, floorY, time)`** comprueba si el jugador toca un láser activo. Usa un ancho de haz de 12 px y devuelve un mensaje si hay impacto.
- **`actualizarJuego(time, dt, floorY, { mission, state, callbacks })`**:
  1. **Ajuste vertical:** si cambió el alto del canvas, mueve al jugador para que no quede flotando o enterrado.
  2. **Rectángulos actuales y anteriores:** `obtenerRects` con `time` y `time - dt`.
  3. **Plataformas móviles:** si el jugador está apoyado, lo desplaza junto con la plataforma.
  4. **Temporizadores:** invulnerabilidad, pulso de gravedad, recarga y empuje de asistencia.
  5. **Oxígeno:** resta `mission.drain * dt`; si llega a cero, pierde una vida.
  6. **Movimiento horizontal:**
     - En modo normal, `vx = direction * speed`.
     - En modo inercia (Luna), acelera y frena gradualmente.
     - Limita la posición al mundo y resuelve choques laterales contra cajas.
  7. **Jetpack:** si se mantiene `J` con carga, aplica empuje, consume combustible y marca si se usó sobre el cráter obligatorio. Sincroniza el sonido continuo.
  8. **Campos gravitatorios:** atraen al jugador según distancia y fuerza.
  9. **Gravedad e integración:** aplica `gravity` o `gravity * factor` si el pulso de Venus está activo; suma `vy` y `y`.
  10. **Aterrizaje:** busca la superficie más cercana entre rectángulos y suelo; si cae, apoya al jugador y reproduce sonido según la velocidad.
  11. **Golpe de cabeza:** si sube y toca la parte inferior de una caja, se detiene.
  12. **Objetos:**
      - Jetpack: se recoge por proximidad.
      - Orbes: suman oxígeno y cuentan.
      - Celdas: suman energía.
      - Estación: recarga al 100% una vez.
  13. **Caída al cráter:** si `y > floorY + 110`, pierde una vida.
  14. **Barreras de habilidad:**
      - Mercurio: si cruza un cráter sin impulso, lo devuelve.
      - Marte: si cruza el cráter sin jetpack, lo devuelve.
      - Saturno: si no tiene celdas o no activó la baliza, lo frena antes del portal.
  15. **Salida:** al llegar al final del mundo, marca `finished` y llama a `onComplete`.
  16. **HUD de oxígeno:** actualiza solo cuando cambia el valor entero, para no redibujar el DOM en cada fotograma.

> Las colisiones son AABB (cajas alineadas a los ejes): se comparan rectángulos. Para evitar atravesar paredes o suelos a gran velocidad, se usan `previousX` y `previousY`.

### 6.9 `dibujo/vista.js` — preparación del lienzo

**Responsabilidad:** calcular el espacio visible y el zoom.

- Obtiene `p.drawingContext`, el tamaño CSS del canvas y el `devicePixelRatio`.
- Ajusta el búfer interno del canvas (`canvas.width/height`) para que no se vea borroso.
- Calcula un zoom entre `0.5` y `1.12` según el ancho y alto.
- Define `viewWidth`, `viewHeight` y `floorY = viewHeight - 30`.
- Aplica `setTransform` con DPR y zoom, limpia el canvas y devuelve todas las medidas.

### 6.10 `dibujo/composicion.js` — fotograma completo

**Responsabilidad:** ordenar el dibujo de cada fotograma.

1. Dibuja el fondo (`dibujarFondo`).
2. Calcula la cámara siguiendo al jugador: `player.x - viewWidth * 0.34`, limitada al mundo.
3. Traslada el contexto por `-camera` y dibuja terreno, objetos y jugador.
4. Hace parpadear al jugador mientras es invulnerable.
5. Dibuja el nombre del planeta y la gravedad abajo.
6. Dibuja la barra de progreso del nivel arriba a la derecha.

### 6.11 `dibujo/escenario.js` — fondo y terreno

- **`dibujarFondo`**: gradiente del cielo, 34 estrellas con parallax, montañas lejanas y niebla.
- **`dibujarTerreno`**:
  - Rellena cada segmento de suelo con `mission.ground` y una línea de `mission.surface`.
  - Dibuja rocas decorativas.
  - Dibuja plataformas fijas con brillo y borde accent.
  - Dibuja plataformas móviles con la etiqueta “INERCIA”.
  - Dibuja cajas/elevaciones con gradiente, borde y una grieta central.

### 6.12 `dibujo/objetos.js` — objetos interactivos

Dibuja, en este orden:

- **Plataformas de impulso:** amarillas, con flechas y texto “E · IMPULSO” o “USADO”.
- **Campos gravitatorios:** elipses giratorias violetas/celestes con núcleo brillante.
- **Láseres:** base metálica, haz rojo si está activo y naranja tenue si está apagado.
- **Jetpack:** mochila flotante con llamas y etiqueta “JETPACK · J”.
- **Estación de recarga:** cápsula con “RECARGA” y “O₂”.
- **Orbes:** círculos brillantes con “O₂”.
- **Celdas de energía:** rombos amarillos con “ENERGÍA”.
- **Portal de salida:** elipse con bandera; cambia de color y texto según el estado (bloqueado, activable o salida).

### 6.13 `dibujo/jugador.js` — astronauta

Dibuja:

- Mochila y llama del jetpack si se recogió y se está usando.
- Sombra en el suelo.
- Mochila, torso, casco, visor y piernas.
- Animación de piernas con `Math.sin(state.walkTime)`.
- Brazo/antena.

No calcula física: solo lee `state.player`, `state.walkTime` y `state.jetpackFuel`.

---

## 7. Scripts del portal

### 7.1 `Sonido.js` — motor de audio

**Responsabilidad:** generar música y efectos en tiempo real con Web Audio API, sin archivos de audio.

Se mantuvo como un archivo cohesivo de 559 líneas porque todos sus bloques comparten el mismo contexto de audio y dividirlo obligaría a exponer muchos estados internos. Aun así, está organizado por secciones:

- **Configuración:** `STORAGE_KEY = "nuevoHogarAudio"`, valores por defecto y `leerAjustes()`.
- **Grafo de audio:** `crearContexto()` arma `master → compresor → destination`, con buses separados para música y efectos.
- **Volumen:** `aplicarVolumen()` convierte los porcentajes en ganancias suaves.
- **Síntesis:** `programarTono()` crea osciladores con envolvente; `programarRuido()` crea ruido filtrado.
- **Efectos:** `reproducir(nombre)` contiene el “switch” de sonidos (`jump`, `land`, `orb`, `laser`, `win`, `gameover`, etc.).
- **Música:** `programarCompas()` genera colchón de cuerdas, bajo, arpegio y pulso; `programarCompases()` programa los siguientes compases; `iniciarMusica`/`detenerMusica` controlan la sesión.
- **Jetpack:** `iniciarJetpack`/`detenerJetpack` crean un bucle de ruido filtrado.
- **Ajustes:** `actualizarAjustes`, `obtenerAjustes`, `probarSonido`.
- **Autoplay:** `primerGesto()` inicia el audio en el primer clic o tecla, como exigen los navegadores.
- **Visibilidad:** suspende el contexto cuando la pestaña se oculta y lo reanuda al volver.
- **API pública:** `window.SonidoJuego = { play, preview, startMusic, stopMusic, setJetpack, getSettings, updateSettings, ensure, estado }`.

### 7.2 `scrips.js` — menú principal y opciones

**Responsabilidad:** la pantalla `Index.html`.

Bloques:

- **Sesión:** si no hay sesión ni invitado, redirige a `Login.html`.
- **Navegación:** “INICIAR LA MISIÓN” va a `Historia.html`; instrucciones, créditos y salir.
- **Audio:** enlaza sliders y switches con `SonidoJuego.getSettings()` y `updateSettings()`; `pintarAjustes()` refleja los valores guardados; “PROBAR SONIDO” reproduce una muestra.
- **Pantalla completa:** `alternarPantallaCompleta()` usa la API estándar y prefijos `webkit`/`ms`; actualiza el texto “ACTIVAR”/“SALIR”.
- **Estadísticas:** `progresoLocal()` lee `window.JuegoDB`; `actualizarEstadisticas()` pinta jugador, nivel, puntos, combustible, planetas completados y barra.
- **Reiniciar progreso:** pide confirmación, llama a `../api/reiniciar-progreso.php` si no es invitado y después a `DB.reset`. Actualiza estadísticas y avisa.
- **Modal de opciones:** `abrirOpciones()` y `cerrarModal()` controlan clase `activo`, `aria-hidden`, foco anterior y bloqueo del scroll.
- **Accesibilidad:** trampa de foco con `Tab`, cierre con `Escape` y clic en el fondo.
- **Salir:** confirma, cierra sesión en el servidor si corresponde y limpia las claves de `localStorage`.

### 7.3 `Niveles.js` — mapa, informes y ranking

**Responsabilidad:** la pantalla `Niveles.html`.

- **Sesión y sincronización:** igual que el juego, consulta `progreso.php` y combina el avance.
- **Estado de los botones:** recorre `.nivel[data-nivel]`, marca `desbloqueado`/`bloqueado`, cambia el candado por ✅/🚀/🔒 y arma el `aria-label`.
- **Informe de misión:** `abrirBriefing()` lee los `data-*` del botón (planeta, concepto, gravedad, objetivo, información) y llena el modal. Si está bloqueado, oculta “INICIAR MISIÓN”; si está completado, permite repetir.
- **Foco:** `mantenerFocoBriefing()` encierra el tabulador dentro del informe; `cerrarBriefing()` devuelve el foco al botón.
- **Inicio:** el botón lleva a `Juego.html?nivel=N`.
- **Ranking:** `sincronizarPuntajes()` reenvía los niveles completados; `cargarRanking()` consulta `puntuaciones.php`, crea las filas con `textContent` (sin inyectar HTML) y resalta al jugador actual.
- **Teclado:** `Escape` cierra briefing o ranking.

### 7.4 `base-datos.js` — progreso local

**Responsabilidad:** mantener el avance en `localStorage` bajo la clave `nuevoHogarDB`.

Expone `window.JuegoDB` con:

| Función | Qué hace |
|---|---|
| `read()` | Lee la base local; si no existe, la crea. Migra el antiguo `usuario`. |
| `write(db)` | Guarda la base completa. |
| `ensureSessionPlayer(db, name)` | Busca o crea el jugador solo si la sesión/invitado coincide. |
| `find(name)` | Devuelve el jugador. |
| `create({usuario, correo, contrasena})` | Crea una cuenta local (el registro real usa PHP). |
| `startLevel(name, level, cost)` | Cobra combustible al iniciar un nivel nuevo; no cobra si ya está completado o si es el mismo nivel activo. |
| `complete(name, level, score)` | Marca el nivel, suma 100 puntos una sola vez, devuelve 10% de combustible y actualiza el nivel. |
| `progress(name)` | Devuelve el progreso con valores por defecto. |
| `reset(name)` | Borra el progreso del jugador y deja combustible al 100%. |
| `mergeServerProgress(name, remote)` | Combina completados, nivel y puntuación del servidor con los locales. |

La base local es la fuente para el modo invitado y un respaldo cuando el servidor no responde. El servidor sigue siendo la fuente oficial para cuentas y ranking.

### 7.5 `Login.js` — inicio de sesión

- Escucha el `submit` de `#loginForm`.
- Valida usuario y contraseña no vacíos.
- Envía `POST ../api/iniciar-sesion.php` con JSON.
- Guarda `sesionActiva = "true"` y `jugadorActual`; borra `modoInvitado`.
- Redirige a `Index.html`.
- “REGISTRARSE” va a `Registro.html`.
- “JUGAR COMO INVITADO” borra la sesión, activa `modoInvitado` y guarda `Invitado`.

### 7.6 `Registro.js` — creación de cuenta

- Valida campos completos, contraseñas iguales y mínimo de 4 caracteres.
- Envía `POST ../api/registrar.php`.
- Si funciona, avisa y redirige a `Login.html`.
- “VOLVER AL LOGIN” navega a `Login.html`.

### 7.7 `Asistente.js` — ayuda flotante

**Responsabilidad:** inyectar un botón “AYUDA” y un panel de preguntas frecuentes en todas las páginas que lo cargan.

- Se autoejecuta con una IIFE y evita duplicados si `#asistenteJuego` ya existe.
- Agrega `Asistente.css` si la página no lo cargó.
- Crea el botón y el panel con sugerencias: controles, oxígeno, habilidades, niveles, vidas y puntaje.
- `responder(pregunta)` normaliza el texto (minúsculas, sin acentos, sin signos) y busca una respuesta por expresión regular.
- Algunas respuestas leen el HUD en vivo: oxígeno, corazones, jetpack, combustible y puntaje.
- Permite escribir una pregunta libre, cierra con `Escape` y devuelve el foco al botón.

---

## 8. Páginas HTML

| Archivo | Contenido principal | Scripts |
|---|---|---|
| `html/Login.html` | Logo, formulario de usuario/contraseña, botones de registro e invitado | `Login.js`, `Asistente.js` |
| `html/Registro.html` | Formulario de usuario, correo, contraseña y confirmación | `Registro.js`, `Asistente.js` |
| `html/Index.html` | Menú principal y modal de opciones completo | `base-datos.js`, `scrips.js`, `Sonido.js`, `Asistente.js` |
| `html/Historia.html` | Texto narrativo, objetivos e indicadores decorativos | `scrips.js` (solo sesión), `Sonido.js`, `Asistente.js` |
| `html/Niveles.html` | Mapa del sistema solar, seis botones, briefing y ranking | `base-datos.js`, `Niveles.js`, `Sonido.js`, `Asistente.js` |
| `html/Juego.html` | Intro, HUD, canvas, controles táctiles, pausa y nivel completado | `Sonido.js`, `base-datos.js`, `p5.min.js`, `js/juego/main.js` |
| `html/Instrucciones.html` | Tarjetas de controles, oxígeno, combustible, puntaje y mundos | `Sonido.js`, `Asistente.js` |
| `html/Creditos.html` | Equipo y tecnologías | `Sonido.js`, `Asistente.js` |
| `html/Final.html` | Cierre de la misión y accesos a créditos/mapa/menú | `Sonido.js`, `Asistente.js` |

### 8.1 `Login.html` y `Registro.html`

Son formularios accesibles: `label` implícito por placeholder, `autocomplete`, `minlength`/`maxlength` y `required`. Los estilos se cargan por partes (`base`, `formulario`, `responsive`) para que cada archivo tenga una responsabilidad.

### 8.2 `Index.html`

Además del menú, contiene el **modal de opciones** con cuatro secciones:

- **AUDIO:** volumen general, música, volumen de música, efectos y volumen de efectos.
- **PANTALLA:** únicamente “Pantalla completa” (`#pantallaCompleta`).
- **PARTIDA:** estadísticas y botón de reinicio.
- **CONTROLES:** recordatorio de teclas y enlace a la guía completa.

El modal usa `role="dialog"`, `aria-modal`, `aria-hidden` y foco inicial en el panel.

### 8.3 `Niveles.html`

Contiene:

- **Mapa decorativo:** Sol, órbitas, Mercurio/Urano/Neptuno decorativos y la ruta.
- **Seis botones `.nivel`:** cada uno lleva `data-nivel`, `data-planeta`, `data-concepto`, `data-gravedad`, `data-objetivo` y `data-info`.
- **Briefing:** modal con el informe de misión; se llena desde los `data-*`.
- **Ranking:** tabla con posición, jugador, planetas y puntos.

### 8.4 `Juego.html`

Estructura:

- **`.intro`:** ceja, título y descripción del planeta.
- **`.barra-juego`:** volver al mapa, estado, botón de habilidad y pausa.
- **`.hud-juego`:** oxígeno, combustible, vidas, orbes y celdas.
- **`#jetpackPanel`:** barra de carga del jetpack (oculta salvo en Marte).
- **`#contenedorEscena`:** aquí p5 inserta el canvas.
- **`.controles-tactiles`:** izquierda, derecha, saltar y jetpack.
- **`#formula` y `#ayudaControles`:** explicación de física y recordatorio de teclas.
- **`#estadoPlataforma`:** mensajes, reintentar y siguiente.
- **Overlays:** pausa (`#pausaOverlay`) y nivel completado (`#nivelCompletadoOverlay`).

### 8.5 `Instrucciones.html`, `Creditos.html` y `Final.html`

Comparten `Info.css` y `Asistente.css`. `Final.html` agrega `Final.css` para el título grande y los botones de cierre. `Instrucciones.html` concentra las reglas en tarjetas; `Creditos.html` explica el aporte de cada integrante y las tecnologías.

---

## 9. Hojas de estilo

Los CSS se dividieron respetando el orden de la cascada. **El orden de los `<link>` importa**: los archivos base van primero y los responsive/overrides después.

### 9.1 `css/menu/`

| Archivo | Contenido |
|---|---|
| `base.css` | Reset, fondo (`../../img/fondo.jpeg`), título, botones principales y secundarios, layout del menú. |
| `responsive.css` | Ajustes para tablets, celulares y alturas pequeñas. |
| `opciones.css` | Estilos del modal antiguo que aún sirven de base; el panel nuevo los sobrescribe. |

`Index.html` carga: `base.css`, `responsive.css`, `opciones.css`, `opciones/panel.css`, `opciones/controles.css`, `opciones/responsive.css`, `Asistente.css`.

### 9.2 `css/opciones/`

| Archivo | Contenido |
|---|---|
| `panel.css` | Overlay, panel, cabecera, columnas, secciones, estadísticas, barra de progreso, pie y botón de cierre. |
| `controles.css` | Sliders, switches, botones, lista de teclas, enlaces y estados de error/éxito. |
| `responsive.css` | Una columna en pantallas chicas, alturas y tamaños de fuente. |

### 9.3 `css/login/` y `css/registro/`

| Archivo | Contenido |
|---|---|
| `base.css` | Fondo, logo, marco, estrellas y layout general. |
| `formulario.css` | Campos, íconos, inputs, botones, separadores y enlaces. |
| `responsive.css` | Ajustes para 900 px, 600 px, 380 px y poca altura. |

Las rutas de imagen se actualizaron a `../../img/...` porque estos archivos viven en subcarpetas.

### 9.4 `css/historia/`

- `base.css`: panel narrativo, texto, objetivos, botón continuar e indicadores de oxígeno/combustible.
- `responsive.css`: adaptación a pantallas pequeñas y poca altura.

### 9.5 CSS de pantallas específicas

| Archivo | Pantalla | Contenido |
|---|---|---|
| `css/Niveles.css` | `Niveles.html` | Fondo, sistema solar, órbitas, planetas, briefing, ranking y responsive. |
| `css/Juego.css` | `Juego.html` | Layout del nivel, HUD, canvas, controles táctiles, pausa, nivel completado y responsive. |
| `css/Info.css` | Instrucciones, créditos y final | Estilos compartidos de páginas informativas. |
| `css/Final.css` | `Final.html` | Título grande, tarjeta de créditos y botones finales. |
| `css/Asistente.css` | Todas | Botón flotante, panel de chat, mensajes, sugerencias y formulario. |

---

## 10. Backend PHP y MySQL

### 10.1 `api/conexion.php`

Archivo compartido por todos los endpoints. Contiene:

- **`responder($estado, $datos)`**: devuelve JSON con el código HTTP y termina la ejecución.
- **`entradaJson()`**: lee `php://input` y valida que sea un objeto JSON.
- **`conexion()`**: crea un `PDO` con variables de entorno `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`; usa `utf8mb4`, excepciones y prepares reales.
- **`iniciarSesionSegura()`**: configura la cookie de sesión (`HttpOnly`, `SameSite=Lax`, `secure` si hay HTTPS).
- **`exigirJugadorSesion()`**: devuelve el `jugador_id` o responde 401.
- **`exigirMetodo($metodo)`**: responde 405 si el método HTTP no coincide.

### 10.2 Endpoints

| Endpoint | Método | Qué hace |
|---|---|---|
| `api/registrar.php` | POST | Valida usuario (3–40), correo y contraseña (mínimo 4); guarda `password_hash`. |
| `api/iniciar-sesion.php` | POST | Busca el usuario, verifica con `password_verify`, regenera el ID de sesión y guarda `jugador_id`/`usuario`. |
| `api/cerrar-sesion.php` | POST | Vacía `$_SESSION`, borra la cookie y destruye la sesión. |
| `api/progreso.php` | GET | Devuelve niveles completados, puntuación total y siguiente nivel. |
| `api/puntuaciones.php` | GET | Ranking: suma puntos y cuenta niveles por jugador. |
| `api/puntuaciones.php` | POST | Guarda 100 puntos para un nivel; exige que el nivel anterior esté completo. |
| `api/reiniciar-progreso.php` | POST | Borra las filas de `progreso_jugador` del jugador. |

### 10.3 Seguridad

- Contraseñas con `password_hash` / `password_verify`.
- Consultas preparadas con PDO.
- Sesión con cookie `HttpOnly` y `SameSite=Lax`.
- Validación de tipos y rangos (nivel 1–6, correo válido, largos máximos).
- El servidor no confía en el puntaje que envía el cliente: asigna 100 puntos fijos.
- El ranking solo incluye cuentas registradas; el invitado no se envía.

### 10.4 Flujo típico de una partida con cuenta

1. `Login.js` → `POST iniciar-sesion.php` → cookie de sesión.
2. `Niveles.js` → `GET progreso.php` → combina avance local y remoto.
3. `js/juego/main.js` → `DB.startLevel` cobra combustible local.
4. Al completar → `DB.complete` guarda local y `POST puntuaciones.php` guarda en MySQL.
5. `Niveles.js` → `GET puntuaciones.php` muestra el ranking actualizado.

---

## 11. Base de datos

El archivo `database/nuevo_hogar.sql` crea la base `nuevo_hogar` y tres tablas:

### `jugadores`

| Columna | Tipo | Uso |
|---|---|---|
| `id` | BIGINT UNSIGNED AI | Clave primaria |
| `usuario` | VARCHAR(40) UNIQUE | Nombre de acceso |
| `correo` | VARCHAR(254) UNIQUE | Correo |
| `contrasena_hash` | VARCHAR(255) | Hash de contraseña |
| `creado_en` | TIMESTAMP | Fecha de alta |

### `planetas`

| Columna | Tipo | Uso |
|---|---|---|
| `nivel` | TINYINT UNSIGNED PK | 1 a 6 |
| `nombre` | VARCHAR(40) | Mercurio, Venus, etc. |
| `concepto_fisica` | VARCHAR(60) | Concepto pedagógico |
| `orden` | SMALLINT UNSIGNED UNIQUE | Orden de la ruta |

Se cargan los seis planetas con `INSERT ... ON DUPLICATE KEY UPDATE`.

### `progreso_jugador`

| Columna | Tipo | Uso |
|---|---|---|
| `jugador_id` | BIGINT UNSIGNED | FK a `jugadores` |
| `nivel` | TINYINT UNSIGNED | FK a `planetas` |
| `completado` | BOOLEAN | Estado |
| `puntuacion` | SMALLINT UNSIGNED | Puntos del nivel |
| `completado_en` | TIMESTAMP | Fecha |

La clave primaria compuesta `(jugador_id, nivel)` impide duplicados. `ON DELETE CASCADE` borra el progreso si se elimina la cuenta.

---

## 12. Servidor alternativo con Node y SQLite

`server.js` permite probar el proyecto sin Apache/PHP. Usa solo módulos nativos:

- `node:http` para el servidor.
- `node:sqlite` (`DatabaseSync`) para la base `database/nuevo_hogar.sqlite`.
- `node:crypto` (`scrypt`, `randomBytes`, `timingSafeEqual`) para las contraseñas.
- `node:fs` y `node:path` para servir archivos estáticos.

### Bloques principales

1. **Configuración:** puerto `PORT` (3000 por defecto), host `0.0.0.0`, ruta de la base y tipos MIME.
2. **Esquema:** crea `jugadores` y `niveles_puntuados` si no existen.
3. **Utilidades:** `responderJson`, `leerJson` (límite de 16 KB), `crearHash`, `verificarHash`.
4. **Sesiones:** mapa en memoria `sessions`; cookie `nh_session` de 32 bytes.
5. **Autenticación:** registro e inicio de sesión con validaciones equivalentes a PHP.
6. **Puntuaciones:** GET del ranking, POST con validación de nivel anterior e `INSERT OR IGNORE`.
7. **Progreso y reinicio:** consulta y borrado de `niveles_puntuados`.
8. **Cierre de sesión:** elimina el token y expira la cookie.
9. **Servidor HTTP:** redirige `/` a `/html/Login.html`, enruta `/api/*.php` y sirve archivos estáticos con protección contra path traversal.

Se inicia con:

```powershell
npm.cmd install
npm.cmd run server
```

> Para la entrega oficial se usa PHP + MySQL. Node + SQLite es una alternativa de desarrollo y no reemplaza esa consigna.

---

## 13. P5.js incluido en `vendor/`

`vendor/p5.min.js` es la biblioteca P5.js 2.3.3 minificada. Se incluye localmente para que el juego funcione sin CDN y para cumplir con el requisito de red local.

**No se documenta línea por línea** porque es código externo generado. Lo que sí importa del proyecto es cómo se usa:

- `new window.p5((sketch) => crearEscena(...), sceneHost)` crea una instancia.
- `sketch.setup` se ejecuta una vez y crea el canvas.
- `sketch.draw` se ejecuta ~60 veces por segundo.
- `sketch.millis()` mide tiempo para calcular `dt`.
- `sketch.noLoop()` y `sketch.loop()` implementan la pausa.
- `sketch.drawingContext` es el contexto 2D donde dibujan los módulos.
- `sketch.pixelDensity()` y `resizeCanvas()` mantienen la nitidez.

La licencia de P5 está junto al archivo de la biblioteca.

---

## 14. Datos guardados en el navegador

| Clave | Contenido |
|---|---|
| `jugadorActual` | Nombre del jugador o `Invitado`. |
| `sesionActiva` | `"true"` si hay una sesión iniciada. |
| `modoInvitado` | `"true"` si se juega sin cuenta. |
| `nuevoHogarDB` | Base local con jugadores, progreso, puntos y combustible. |
| `nuevoHogarAudio` | Volumen general, música, efectos y volúmenes por bus. |

La base local **no guarda contraseñas**. Las cuentas reales viven en MySQL/SQLite y la contraseña se guarda hasheada en el servidor.

---

## 15. Cómo ejecutar el proyecto

### Opción oficial: XAMPP + PHP + MySQL

1. Copiar el proyecto en `C:\xampp\htdocs\Juego-Fisica`.
2. Iniciar **Apache** y **MySQL** desde XAMPP.
3. Abrir phpMyAdmin e importar `database/nuevo_hogar.sql`.
4. Revisar `api/conexion.php` si MySQL no usa `root` sin contraseña.
5. Abrir `http://127.0.0.1/Juego-Fisica/`.

> Usar `127.0.0.1` evita problemas de proxy o DNS con `localhost`. El proyecto debe servirse por HTTP: abrir los HTML con doble clic (`file://`) rompe los módulos ES y los `fetch`.

### Opción con el servidor integrado de PHP

```powershell
php -S 0.0.0.0:8000 -t .
```

Abrir `http://localhost:8000/`.

### Opción Node + SQLite

```powershell
npm.cmd install
npm.cmd run server
```

Abrir `http://localhost:3000/`.

### Uso desde otro dispositivo de la misma red

1. Obtener la IPv4 de la PC con `ipconfig`.
2. Abrir `http://IP-DE-LA-PC/Juego-Fisica/` o el puerto correspondiente.
3. Permitir Apache/Node en la red privada de Windows.
4. Ambos dispositivos deben estar en la misma Wi-Fi.

---

## 16. Guía rápida de mantenimiento

### Agregar o cambiar un nivel

1. Editar `js/juego/misiones.js` (datos del planeta).
2. Agregar el botón correspondiente en `html/Niveles.html` con sus `data-*`.
3. Ajustar el factor de `acortarMision` en `js/juego/main.js` si hace falta acortar el recorrido.
4. Agregar el planeta en `database/nuevo_hogar.sql` y en el servidor Node si se usa esa alternativa.
5. Revisar el ranking y el límite de 6 niveles en `progreso.php`, `puntuaciones.php` y `server.js`.

### Cambiar la física

| Qué cambiar | Dónde |
|---|---|
| Gravedad, salto, oxígeno, largo del mundo | `js/juego/misiones.js` |
| Velocidad horizontal base, gravedad en píxeles | `js/juego/escena/estado.js` |
| Colisiones, plataformas móviles, láseres | `js/juego/escena/actualizar.js` |
| Habilidades y controles | `js/juego/escena/controles.js` |
| Dibujo | `js/juego/escena/dibujo/` |

### Cambiar el aspecto visual

| Pantalla | Archivos |
|---|---|
| Menú | `css/menu/` |
| Opciones | `css/opciones/` |
| Login | `css/login/` |
| Registro | `css/registro/` |
| Historia | `css/historia/` |
| Mapa y ranking | `css/Niveles.css` |
| Juego | `css/Juego.css` |
| Instrucciones/créditos | `css/Info.css` |
| Final | `css/Info.css` + `css/Final.css` |

### Agregar un sonido

1. Agregar un `case` en `reproducir()` de `Sonido.js`.
2. Llamarlo desde el juego con `sfx("nombre")` o desde el portal con `SonidoJuego.play("nombre")`.
3. Si es un sonido continuo, crear funciones de inicio/detención como el jetpack.

### Agregar una página

1. Crear el HTML en `html/`.
2. Cargar `Sonido.js`, `Asistente.js` y los CSS necesarios.
3. Si necesita sesión, incluir `base-datos.js` y verificar `sesionActiva`/`modoInvitado`.
4. Agregar el enlace desde el menú o el mapa.

---

## 17. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| La página queda en blanco y la consola dice “Failed to load module” | Se abrió con `file://` | Servir por Apache, PHP o Node. |
| `api/progreso.php` responde 401 | No hay sesión PHP | Iniciar sesión; el modo invitado no usa esa API. |
| No carga el ranking | MySQL apagado o base no importada | Iniciar MySQL e importar `database/nuevo_hogar.sql`. |
| Error “No se pudo conectar con la base de datos” | Credenciales distintas | Ajustar `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` o `api/conexion.php`. |
| El canvas no aparece | `#contenedorEscena` no existe o p5 no cargó | Revisar `html/Juego.html` y la consola. |
| El juego no avanza | La pestaña está oculta o el navegador pausó `requestAnimationFrame` | Mantener la pestaña visible. |
| No hay sonido | El navegador exige un gesto del usuario | Hacer clic o presionar una tecla; revisar los switches de audio. |
| La pantalla completa no funciona | El navegador la bloquea | Probar con un clic directo o desde HTTPS. |
| `localhost` falla pero `127.0.0.1` funciona | Proxy/DNS local | Usar `127.0.0.1`. |
| Los módulos del juego dan 404 | Ruta incorrecta o servidor sin soporte de módulos | Verificar que `html/Juego.html` apunte a `../js/juego/main.js`. |

---

## Resumen de la reorganización

- `Juego.js` (1516 líneas) se dividió en 13 módulos pequeños bajo `js/juego/`.
- Los CSS de 600–1400 líneas se dividieron por pantalla y responsabilidad en `css/menu/`, `css/opciones/`, `css/login/`, `css/registro/` y `css/historia/`.
- Ningún módulo del motor supera las 300 líneas (el mayor es `actualizar.js`, con 287). Los archivos más grandes del portal son `Sonido.js` (559), `scrips.js` (425) y `server.js` (383); se mantuvieron cohesivos a propósito porque comparten un mismo contexto interno.
- Se conservaron los seis niveles, el audio, las opciones, las estadísticas, el reinicio de progreso, el informe de planetas, el ranking y el backend.
- En el panel de opciones, la sección **PANTALLA** conserva únicamente **Pantalla completa**.
- Se eliminaron archivos temporales de QA y la página `Opciones.html`, que estaba vacía y no se usaba.

Con esta estructura, para entender una parte del proyecto alcanza con abrir el archivo correspondiente: los datos están en `misiones.js`, la física en `actualizar.js`, los controles en `controles.js`, el dibujo en `dibujo/` y el arranque en `main.js`.
