# GDD — Nuevo Hogar: Misión espacial

> Documento de diseño del videojuego. Completar los nombres del equipo, roles y fechas antes de la entrega final.

## 1. Datos del proyecto

- **Nombre:** Nuevo Hogar: Misión espacial.
- **Integrantes:** [completar con nombres reales].
- **Género:** plataformas y aventura educativa 2D.
- **Público destinatario:** estudiantes de nivel secundario que estén trabajando conceptos introductorios de física.
- **Plataformas:** navegador de PC, tablet y celular dentro de una misma red Wi-Fi.

## 2. Objetivo pedagógico

El juego busca que el jugador relacione fuerzas y energía con cambios observables en el movimiento. Practica impulso, gravedad, inercia, aceleración, propulsión y conservación/uso de energía al elegir cuándo saltar, frenar, recoger recursos y activar mecanismos. El aprendizaje aparece en la respuesta del personaje y del entorno; no hay cuestionarios.

### Fundamentación

Cada planeta introduce una interacción con causa y efecto: una plataforma impulsa al astronauta; la gravedad planetaria cambia su caída; la inercia conserva la velocidad; el jetpack aplica empuje; un campo gravitatorio curva su trayectoria; y una salida requiere energía acumulada. El jugador puede observar el resultado de sus acciones y ajustar su estrategia en el siguiente intento. El oxígeno, el combustible y las vidas suman planificación de recursos.

## 3. Historia y contexto

En el año 2142, la Tierra se volvió inhabitable. La tripulación de la Operación Éxodo viaja por seis destinos para encontrar un nuevo hogar. Debe conservar oxígeno, combustible y vidas mientras supera obstáculos y utiliza las propiedades físicas de cada escenario.

## 4. Mecánicas principales

- Desplazamiento lateral, salto, colisiones, plataformas y caída por cráteres.
- Aceleración vertical ajustada según la gravedad de cada planeta.
- Tecla E y botón contextual para activar el impulso de Mercurio, el pulso gravitatorio de Venus, el freno inercial lunar, la asistencia gravitatoria de Júpiter y la baliza de Saturno.
- Cráteres de Mercurio más anchos que un salto normal; las plataformas elásticas deben activarse con E.
- Baja gravedad lunar, conservación de velocidad y plataformas móviles que requieren un frenado manual con E.
- Jetpack de uso limitado y cráter obligatorio en Marte.
- Asistencia de los campos gravitatorios de Júpiter activada con E.
- Recolección de tres celdas y activación manual de la baliza en Saturno.
- Oxígeno decreciente con orbes y estaciones de recarga.
- Tres vidas por nivel; rayos láser y caídas hacen perder una vida.
- Un nivel nuevo consume 15% de combustible; completarlo devuelve 10%, hasta 100%.
- Cada planeta completado por primera vez suma 100 puntos a la tabla de cuentas registradas.

## 5. Controles

- **A / D:** moverse a izquierda y derecha.
- **W / espacio:** saltar.
- **E / botón de habilidad:** activar la acción especial del planeta.
- **J / botón JETPACK mantenido:** activar el jetpack en Marte.
- **Táctil:** botones en pantalla para izquierda, derecha, salto y habilidades.

## 6. Puntuación y progreso

Cada uno de los seis niveles da 100 puntos al completarse por primera vez. Repetirlo no vuelve a sumar puntos. Completar un nivel desbloquea el siguiente. Las cuentas registradas guardan el puntaje en el servidor y aparecen en la tabla. El invitado puede jugar, pero su progreso queda local en el dispositivo y no forma parte del ranking.

## 7. Victoria y derrota

- **Victoria de nivel:** llegar al portal. En Saturno, primero reuní las tres celdas y activá la baliza con E junto al portal.
- **Victoria final:** completar Saturno y llegar al hogar nuevo.
- **Derrota temporal:** perder los tres corazones del nivel. Se puede reintentar desde el inicio del nivel.
- **Riesgo de recursos:** si el oxígeno llega a cero, el traje devuelve al astronauta al inicio y se pierde una vida.

## 8. Personajes, enemigos y objetos

- **Personaje:** astronauta de la Operación Éxodo; puede caminar, saltar y, con el equipo adecuado, usar el jetpack.
- **Peligros:** rayos láser intermitentes, bloques y cráteres.
- **Objetos:** orbes O₂, estaciones de recarga, plataformas de impulso, plataformas móviles, jetpack y celdas de energía.
- **Meta:** portal de salida y baliza de cada planeta.

## 9. Escenarios y niveles

| Nivel | Escenario | Gravedad aproximada | Desafío y concepto físico |
|---|---|---|
| 1 | Mercurio | 3,70 m/s² | Activar las plataformas con E aplica impulso para cruzar cráteres largos. |
| 2 | Venus | 8,90 m/s² | El pulso E reduce la gravedad brevemente para alcanzar plataformas elevadas. |
| 3 | Luna | 1,62 m/s² | La baja gravedad alarga los saltos; el freno E ayuda a controlar la inercia en plataformas móviles. |
| 4 | Marte | 3,71 m/s² | Fuerza y propulsión: el jetpack aplica empuje para cruzar un cráter largo. |
| 5 | Júpiter | 24,79 m/s² | La asistencia E junto a un campo gravitatorio permite cruzar los cortes. |
| 6 | Saturno | 10,44 m/s² | Reunir tres celdas y activar la baliza con E abre la salida final. |

## 10. Bocetos / wireframes

### Menú principal

```text
+----------------------------------+
|       NUEVO HOGAR                |
|       MISIÓN ESPACIAL            |
|                                  |
|          [INICIAR]               |
|       [INSTRUCCIONES]            |
|          [OPCIONES]              |
|          [CRÉDITOS]              |
+----------------------------------+
```

### Nivel 2D

```text
+------------------------------------------------+
| OXÍGENO █████     COMBUSTIBLE ███    ♥ ♥ ♥     |
|                                                |
|  astronauta   orbe O₂    rayo láser     portal  |
|  [suelo] ____plataforma___ ____cráter________  |
|                                                |
| A/D · W/ESPACIO · J       [◀] [▶] [SALTAR]    |
+------------------------------------------------+
```

### Mapa y ranking

```text
+----------------------------------+
| SISTEMA SOLAR · SOL EN EL CENTRO |
| Tierra · NIVEL 1 → Impulso en Mercurio |
| Venus · Luna · Marte · Júpiter · Saturno |
| [🏆 PUNTUACIONES]                |
+----------------------------------+
```

## 11. Arquitectura del software

```text
Navegador (HTML/CSS/JavaScript + P5.js)
             │ solicitudes HTTP/JSON
             ▼
         PHP (api/)
             │ PDO
             ▼
       MySQL / MariaDB
```

P5.js crea el canvas y ejecuta el ciclo `setup/draw`. El portal administra navegación, instrucciones, cuentas y visualización del ranking. PHP mantiene la sesión, valida el nivel enviado y guarda la puntuación. Node.js con SQLite se conserva como alternativa local de desarrollo, no como backend de la presentación oficial.

## 12. Tecnologías

- P5.js 2.3.3 local (`vendor/p5.min.js`).
- HTML5, CSS3 y JavaScript.
- PHP 8.1 o posterior y PDO MySQL.
- MySQL/MariaDB (`database/nuevo_hogar.sql`).
- Git y GitHub.

## 13. Modelo de base de datos

- **jugadores** (`id`, `usuario`, `correo`, `contrasena_hash`, `creado_en`): cuenta del jugador; la contraseña se almacena con hash.
- **planetas** (`nivel`, `nombre`, `concepto_fisica`, `orden`): catálogo y orden de las misiones.
- **progreso_jugador** (`jugador_id`, `nivel`, `completado`, `puntuacion`, `completado_en`): una fila por jugador y planeta; la clave compuesta impide sumar dos veces el mismo nivel.
- Relaciones: `progreso_jugador.jugador_id → jugadores.id` y `progreso_jugador.nivel → planetas.nivel`.

## 14. Cronograma y distribución de tareas

| Etapa | Entrega | Fecha / semana | Responsable | Estado |
|---|---|---|---|---|
| 1 | Idea, trama y objetivo pedagógico | [completar] | [completar] | [completar] |
| 2 | GDD y bocetos | [completar] | [completar] | [completar] |
| 3 | Prototipo jugable 2D y mecánicas | [completar] | [completar] | [completar] |
| 4 | Portal, navegación y accesibilidad LAN | [completar] | [completar] | [completar] |
| 5 | API PHP, MySQL y ranking | [completar] | [completar] | [completar] |
| 6 | Pruebas, correcciones y presentación | [completar] | [completar] | [completar] |

### Roles

- Coordinación: [nombre].
- Diseño gráfico e interfaz: [nombre].
- Programación del juego: [nombre].
- Portal web y accesibilidad: [nombre].
- Base de datos y API: [nombre].
- GitHub y documentación: [nombre].

## 15. Mejoras futuras

- Sincronizar el combustible y otros recursos de la partida entre dispositivos.
- Agregar niveles de dificultad y más desafíos de mecánica orbital.
- Ampliar accesibilidad con remapeo de teclas, contraste configurable y opciones de movimiento reducido.
- Agregar sonidos y una animación explicativa después de cada desafío.
