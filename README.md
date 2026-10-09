# Nuevo Hogar · Misión espacial

Juego educativo en español: la tripulación abandona una Tierra inhabitable y supera seis desafíos de física antes de encontrar un nuevo hogar.

## Cómo jugar

1. Abrí `html/Registro.html` desde el servidor web y creá una cuenta.
2. Iniciá sesión, elegí **Iniciar la misión** y continuá hasta el mapa.
3. Resolvé cada pregunta para desbloquear el planeta siguiente. El progreso y los puntos quedan guardados por jugador.

Si abrís los archivos directamente y el navegador limita el almacenamiento, serví la carpeta desde XAMPP/Apache y entrá a `/Juego-Fisica-main/html/Registro.html`.

## Datos y persistencia

El registro y el inicio de sesión usan PHP y MySQL. Las contraseñas se guardan con hash seguro; no se guardan en texto plano. El progreso del juego todavía se conserva en el navegador (`localStorage`).

### Configurar PHP y MySQL con XAMPP

1. Copiá la carpeta del proyecto dentro de `C:\xampp\htdocs`.
2. Iniciá **Apache** y **MySQL** desde el panel de XAMPP.
3. Abrí `http://localhost/phpmyadmin`, importá `database/nuevo_hogar.sql` y ejecutá el script.
4. En `api/conexion.php`, los valores iniciales son los habituales de XAMPP (`root` sin contraseña, base `nuevo_hogar`). Si configuraste credenciales distintas, definí `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` en el entorno de Apache.
5. Abrí `http://localhost/Juego-Fisica-main/html/Login.html` (ajustá `Juego-Fisica-main` si renombraste la carpeta) y elegí **Registrarse**.

No abras los HTML con doble clic ni uses `npm run server` para registrar/iniciar sesión: esos métodos no ejecutan PHP. Si PHP o MySQL no están disponibles, el formulario ahora muestra un mensaje con el problema en vez de dejar la pantalla sin respuesta.

## Los seis desafíos

1. Mercurio — impulso.
2. Venus — gravedad y peso.
3. Tierra — inercia.
4. Marte — movimiento de proyectiles.
5. Júpiter — gravedad y órbitas.
6. Saturno — transformación de energía.

Los destinos 7 y 8 quedan como extras cerrados; la historia principal concluye después de seis planetas.

## Iniciar el juego

Para las pantallas de juego estáticas también se puede usar el servidor Node: ejecutá `npm.cmd run server` y abrí `http://localhost:3000/`. El servidor Node no ejecuta los endpoints PHP; para crear cuentas e iniciar sesión usá Apache/XAMPP según los pasos anteriores.

