# Nuevo Hogar · Misión espacial

Videojuego educativo de plataformas 2D sobre gravedad, impulso, inercia, propulsión y energía. El juego usa P5.js localmente, y el portal ofrece cuentas, modo invitado y tabla de puntuaciones.

## Tecnologías

- Juego: P5.js 2.3.3, incluido en `vendor/p5.min.js` para funcionar en la red local sin depender de una CDN.
- Portal: HTML, CSS y JavaScript.
- Servidor requerido para la entrega: PHP 8.1 o posterior, con PDO MySQL y mbstring habilitados.
- Base de datos requerida: MySQL o MariaDB, usando PDO.
- Git y GitHub para el versionado.
- `server.js` con SQLite queda como alternativa de desarrollo; para demostrar la consigna usá PHP y MySQL.

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

El oxígeno se consume durante cada nivel. Las orbes y estaciones lo recargan. Hay tres vidas por nivel; láseres y cráteres pueden hacer perder una. Iniciar un planeta nuevo cuesta 15% de combustible y completarlo devuelve 10%.

## Mundos y conceptos

1. **Mercurio — Impulso (3,70 m/s²):** activá con E las plataformas elásticas para cruzar cráteres largos.
2. **Venus — Gravedad (8,90 m/s²):** usá E para reducir la gravedad durante el salto y alcanzar plataformas altas.
3. **Luna — Inercia (1,62 m/s²):** la baja gravedad y el freno E exigen controlar el aterrizaje en plataformas móviles.
4. **Marte — Propulsión (3,71 m/s²):** mantené J o el botón JETPACK para cruzar un cráter obligatorio.
5. **Júpiter — Asistencia gravitatoria (24,79 m/s²):** acercate a un campo y activá E para impulsarte.
6. **Saturno — Energía (10,44 m/s²):** reuní tres celdas y activá la baliza con E junto al portal.

## Documentación del proyecto

El [GDD](GDD.md) describe objetivo pedagógico, mecánicas, pantallas, arquitectura, base de datos, roles y planificación. Antes de la presentación, completen allí los nombres reales del equipo y las fechas del cronograma; también están señalados en la pantalla de [Créditos](html/Creditos.html).
