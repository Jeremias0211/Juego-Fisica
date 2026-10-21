# Nuevo Hogar · Misión espacial

Juego educativo en español: la tripulación abandona una Tierra inhabitable y supera seis desafíos de física antes de encontrar un nuevo hogar.

## Cómo jugar

1. En PowerShell, iniciá el servidor con `npm.cmd run server`, abrí `http://localhost:3000/` y creá una cuenta.
2. Iniciá sesión, elegí **Iniciar la misión** y continuá hasta el mapa.
3. Resolvé cada pregunta para desbloquear el planeta siguiente. El progreso y los puntos quedan guardados por jugador.

No abras los HTML directamente con doble clic; usá un servidor web para que funcionen las cuentas.

## Datos y persistencia

Las cuentas se guardan con contraseñas protegidas mediante hash; el progreso del juego todavía se conserva en el navegador (`localStorage`).

### Inicio rápido con Node y SQLite

1. Usá Node.js 22.5 o posterior y ejecutá `npm.cmd run server` desde la carpeta del proyecto en Windows.
2. Abrí `http://localhost:3000/` y elegí **Registrarse**.

El servidor crea automáticamente `database/nuevo_hogar.sqlite` al iniciarse y guarda allí las cuentas. No hace falta instalar paquetes ni importar una base de datos.

### Alternativa con PHP y MySQL en XAMPP

1. Copiá la carpeta del proyecto dentro de `C:\xampp\htdocs`.
2. Iniciá **Apache** y **MySQL** desde el panel de XAMPP.
3. Abrí `http://localhost/phpmyadmin`, importá `database/nuevo_hogar.sql` y ejecutá el script.
4. En `api/conexion.php`, los valores iniciales son los habituales de XAMPP (`root` sin contraseña, base `nuevo_hogar`). Si configuraste credenciales distintas, definí `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` en el entorno de Apache.
5. Abrí `http://localhost/Juego-Fisica-main/html/Login.html` (ajustá `Juego-Fisica-main` si renombraste la carpeta) y elegí **Registrarse**.

Node usa SQLite y XAMPP usa MySQL; cada opción guarda las cuentas en su propia base. Usá el mismo servidor para registrarte e iniciar sesión.

## Los seis desafíos

1. Mercurio — impulso.
2. Venus — gravedad y peso.
3. Tierra — inercia.
4. Marte — movimiento de proyectiles.
5. Júpiter — gravedad y órbitas.
6. Saturno — transformación de energía.

Los destinos 7 y 8 quedan como extras cerrados; la historia principal concluye después de seis planetas.

## Iniciar el juego

Las pantallas del juego y el registro funcionan con `npm.cmd run server` en PowerShell, en `http://localhost:3000/`. También podés usar Apache/XAMPP si preferís conectar la versión PHP a MySQL.

