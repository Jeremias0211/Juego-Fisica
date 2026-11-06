# Nuevo Hogar · Misión espacial

Videojuego educativo de plataformas 2D sobre gravedad, impulso, inercia, propulsión y energía. El juego usa P5.js localmente, y el portal ofrece cuentas, modo invitado y tabla de puntuaciones.

## Tecnologías

- Juego: P5.js 2.3.3, incluido en `vendor/p5.min.js` para funcionar en la red local sin depender de una CDN.
- Portal: HTML, CSS y JavaScript.
- Servidor requerido para la entrega: PHP 8.1 o posterior, con PDO MySQL y mbstring habilitados.
- Base de datos requerida: MySQL o MariaDB, usando PDO.
- Git y GitHub para el versionado.
- `server.js` con SQLite queda como alternativa de desarrollo; para demostrar la consigna usá PHP y MySQL.

## Demo en línea (GitHub Pages)

- URL: **https://juancarballo7.github.io/Juego-Fisica/**
- Es una versión estática para mostrar el juego sin instalar XAMPP. Se entra con **Jugar como invitado** o con una **cuenta local**.
- Las cuentas creadas en esta demo y el ranking local se guardan en el navegador (`localStorage`). No hay cuentas compartidas ni ranking global porque GitHub Pages no ejecuta PHP.
- La demo se publica desde el fork `JuanCarballo7/Juego-Fisica`. El repositorio original es `Jeremias0211/Juego-Fisica`; la cuenta que publica tiene permiso de escritura pero no de administración allí, por eso no puede activar Pages en el original.
- Para la entrega con backend real, usá PHP/MySQL (siguiente sección) o el servidor Node alternativo.
- La portada `index.html` permite que la raíz del sitio funcione en GitHub Pages. Cuando se ejecuta con Apache/PHP, `index.php` sigue siendo la entrada y redirige al inicio de sesión.

## Ejecutar con PHP y MySQL

1. Copiá el proyecto dentro de `C:\xampp\htdocs\Juego-Fisica`.
2. Iniciá Apache y el módulo **MySQL** del panel XAMPP. XAMPP distribuye MariaDB como reemplazo compatible de MySQL; no hace falta instalar los dos por separado.
3. Abrí phpMyAdmin e importá `database/nuevo_hogar.sql`.
4. Revisá las credenciales en `api/conexion.php` si tu MySQL no usa los valores por defecto de XAMPP.
5. Abrí `http://localhost/Juego-Fisica/`. `index.php` te lleva a la pantalla de acceso.

También se puede ejecutar con el servidor integrado de PHP, desde la carpeta del proyecto:

```powershell
php -S 0.0.0.0:8000 -t .
```

Abrí `http://localhost:8000/`. PHP debe tener habilitada la extensión PDO MySQL.

### Usarlo desde otros dispositivos de la misma red Wi-Fi

En la computadora que ejecuta el servidor, consultá su dirección IPv4 de Wi-Fi con `ipconfig`. Desde la tablet o el celular abrí `http://DIRECCION-IP:8000/` (o el puerto configurado en Apache). Si Windows pregunta, permití el acceso del servidor en la red privada. Todos los dispositivos deben estar conectados a la misma red.

## Alternativa local con Node y SQLite

```powershell
npm.cmd install
npm.cmd run server
```

Node muestra las direcciones locales de acceso al iniciarse y crea `database/nuevo_hogar.sqlite`. Si el puerto 3000 ya está ocupado porque quedó otro servidor abierto, detenelo con `Ctrl+C` en esa terminal. También podés elegir otro puerto con `$env:PORT=3001; npm.cmd run server` y abrir `http://localhost:3001/`. Esta alternativa conserva registro, inicio de sesión y ranking, pero no reemplaza PHP/MySQL para la entrega obligatoria.

## Cuenta, invitado y puntuaciones

- Una cuenta registra el puntaje y los niveles completados en MySQL/SQLite; el mapa recupera ese avance al iniciar sesión desde otro dispositivo.
- El modo invitado puede jugar sin registrarse; su avance queda solamente en el navegador donde juega y no aparece en el ranking.
- Cada planeta completado por primera vez suma 100 puntos.
- El servidor valida la sesión y el orden de niveles antes de guardar una puntuación. El combustible de la nave se conserva localmente en el dispositivo.

## Cómo jugar

1. Registrate o elegí **Jugar como invitado**.
2. Abrí **Instrucciones** para conocer recursos, controles y mecánicas.
3. Despegá desde la Tierra, completá las seis misiones y encontrá un nuevo hogar.

### Controles

- **A / D**: moverse.
- **W / espacio**: saltar.
- **E** o el botón de habilidad: activar la mecánica especial de Mercurio, Venus, Luna, Júpiter y Saturno.
- En Marte, mantené **J** o el botón **JETPACK** para usar el jetpack. En pantallas táctiles aparecen botones para moverse, saltar y activar las habilidades.
- Al alcanzar la salida aparece un mensaje para avanzar directamente a la misión desbloqueada o regresar al mapa. Al completar Saturno se muestran los créditos del equipo.

El oxígeno se consume durante cada nivel. Las orbes y estaciones lo recargan. Hay tres vidas por nivel; láseres y cráteres pueden hacer perder una. Iniciar un planeta nuevo cuesta 15% de combustible y completarlo devuelve 10%.

## Mundos y conceptos

1. **Mercurio — Impulso (3,70 m/s²):** activá con E las plataformas elásticas para cruzar cráteres largos.
2. **Venus — Gravedad (8,90 m/s²):** usá E para reducir la gravedad durante el salto y alcanzar plataformas altas.
3. **Luna — Inercia (1,62 m/s²):** la baja gravedad y el freno E exigen controlar el aterrizaje en plataformas móviles.
4. **Marte — Propulsión (3,71 m/s²):** mantené J o el botón JETPACK para cruzar un cráter obligatorio.
5. **Júpiter — Asistencia gravitatoria (24,79 m/s²):** acercate a un campo y activá E para impulsarte.
6. **Saturno — Energía (10,44 m/s²):** reuní tres celdas y activá la baliza con E junto al portal.

## Estructura modular

El código está separado por responsabilidades para que ningún archivo concentre toda la lógica:

```text
js/juego/
├── main.js          Arranque, sesión, HUD y callbacks
├── misiones.js      Datos de los seis planetas
├── geometria.js     Ajuste y separación de objetos
├── audio.js         Puente hacia Sonido.js
└── escena/
    ├── escena.js    Unión de estado, controles, física y dibujo
    ├── estado.js    Estado de la partida
    ├── controles.js Teclado, táctil, habilidades y pausa
    ├── actualizar.js Simulación y colisiones
    └── dibujo/      Vista, composición, escenario, objetos y jugador
```

Los CSS también se dividieron por pantalla:

- `css/menu/`: menú principal.
- `css/opciones/`: modal de opciones.
- `css/login/` y `css/registro/`: acceso y alta de cuenta.
- `css/historia/`: introducción narrativa.
- `css/Niveles.css`, `css/Juego.css`, `css/Info.css` y `css/Final.css`: pantallas específicas.

`html/Juego.html` carga el motor como módulo ES:

```html
<script type="module" src="../js/juego/main.js"></script>
```

Para modificar la física de un planeta se edita `js/juego/misiones.js`; para las colisiones, `js/juego/escena/actualizar.js`; para el dibujo, `js/juego/escena/dibujo/`. El detalle de cada archivo, función y bloque está en la documentación completa.

## Documentación del proyecto

- [DOCUMENTACION.md](DOCUMENTACION.md): explicación en español de la arquitectura, cada archivo, cada módulo del juego, CSS, backend PHP/MySQL, base de datos, servidor Node alternativo y guía de mantenimiento.
- [GDD.md](GDD.md): objetivo pedagógico, mecánicas, pantallas, arquitectura, base de datos, roles y planificación. El cronograma conserva campos de fecha y avance para que el equipo los actualice.
- Los créditos y aportes se muestran en [Créditos](html/Creditos.html) y al completar la misión final.
