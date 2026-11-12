# Publicar Nuevo Hogar en InfinityFree

Esta guía deja el juego funcionando con **PHP + MySQL reales** en InfinityFree: las cuentas se guardan en la base del hosting, se pueden usar desde cualquier computadora o celular y el correo de bienvenida y el de misión completada se envían por un proveedor externo.

> **Importante:** InfinityFree no permite `mail()` de PHP. Por eso el proyecto usa **Brevo por HTTPS** (recomendado) o **SMTP autenticado** (por ejemplo Gmail con contraseña de aplicación). Sin configurar uno de los dos, las cuentas y el juego funcionan igual, pero los correos no se envían.

---

## 1. Qué se cambió en el proyecto

| Archivo | Cambio |
|---|---|
| `api/configuracion.php` | Lee primero las variables de entorno y después `api/config.local.php`. |
| `api/conexion.php` | Usa host, puerto, base, usuario y contraseña configurables. |
| `api/config.example.php` | Plantilla de configuración de MySQL y correo. |
| `api/correo.php` | Envío por Brevo, SMTP (PHPMailer) o modo `log`; plantillas HTML. |
| `api/registrar.php` | Guarda la cuenta y envía el correo de bienvenida sin borrar la cuenta si el correo falla. |
| `api/puntuaciones.php` | Envía el correo de misión completada una sola vez, al guardar el nivel 6 por primera vez. |
| `js/portal/login.js` y `js/portal/registro.js` | Fuera de GitHub Pages ya **no** crean cuentas locales: usan siempre el servidor. |
| `js/juego/main.js` | El guardado del nivel usa `keepalive` para no perderse al cambiar de pantalla. |
| `database/infinityfree.sql` | Esquema sin `CREATE DATABASE` ni `USE`, listo para phpMyAdmin. |
| `qr.html` | Genera y descarga un QR de la dirección donde esté publicado el juego. |
| `qr-demo.png` | QR de la demo de GitHub Pages (no es el QR final de InfinityFree). |
| `.htaccess` | Hace que en Apache se ejecute `index.php` antes que `index.html`. |
| `api/.htaccess` | Bloquea el acceso directo a archivos internos de configuración. |

La copia de seguridad previa a estos cambios está en:

```text
C:\Users\juanc\AppData\Local\Temp\opencode\Juego-Fisica-backup-infinityfree-20261106-062739
```

---

## 2. Antes de empezar: datos que necesitás

Tené a mano, desde el panel de InfinityFree:

- **Host MySQL**: algo como `sqlXXX.infinityfree.com` (no uses `localhost`).
- **Nombre completo de la base**: algo como `if0_XXXXXXXX_nuevo_hogar` o el nombre que hayas creado.
- **Usuario MySQL**: algo como `if0_XXXXXXXX`.
- **Contraseña MySQL**: la que muestra el panel. No la escribas en el chat ni en GitHub.
- **URL pública** del sitio: algo como `https://tu-cuenta.infinityfreeapp.com/`.
- Credenciales del correo (Brevo o SMTP). Tampoco las escribas en el chat.

> Si tu base importada se llama distinto de `nuevo_hogar`, usá el nombre exacto que figura en **MySQL Databases**. No hay que inventarlo.

---

## 3. Base de datos

### 3.1 Si todavía no importaste la base

1. Entrá al panel de InfinityFree → **MySQL Databases**.
2. Creá la base si no existe y anotá el host, el nombre y el usuario.
3. Entrá a **phpMyAdmin** desde el panel.
4. Seleccioná la base (no hace falta ejecutar `CREATE DATABASE`).
5. Pestaña **Importar** → elegí `database/infinityfree.sql` → **Continuar**.

El archivo crea las tablas `jugadores`, `planetas` y `progreso_jugador` y carga los seis planetas. Es seguro ejecutarlo sobre una base que ya tiene datos: usa `CREATE TABLE IF NOT EXISTS` y `ON DUPLICATE KEY UPDATE` para los planetas, así que **no borra cuentas ni progreso**.

### 3.2 Verificación rápida en phpMyAdmin

Ejecutá:

```sql
SHOW TABLES;
SHOW COLUMNS FROM jugadores LIKE 'correo';
SELECT COUNT(*) AS planetas FROM planetas;
```

Debe aparecer la tabla `jugadores`, la columna `correo` y 6 planetas.

Si la tabla `jugadores` ya existía pero no tenía `correo`, agregala sin borrar datos:

```sql
ALTER TABLE jugadores ADD COLUMN correo VARCHAR(254) NULL AFTER usuario;
```

Las cuentas viejas quedan con `correo` vacío; las nuevas lo guardan. No borres registros para “arreglarlo”.

---

## 4. Configuración privada

1. En tu computadora, hacé una copia de `api/config.example.php` y llamala `api/config.local.php`.
2. Completá los datos reales.
3. No subas `api/config.local.php` a GitHub: ya está en `.gitignore`.
4. Sí tenés que subir `api/config.local.php` al hosting, dentro de `htdocs/api/`, porque el servidor lo necesita.

Ejemplo de `api/config.local.php`:

```php
<?php
declare(strict_types=1);

return [
    'db' => [
        'host' => 'sqlXXX.infinityfree.com',
        'port' => 3306,
        'name' => 'if0_XXXXXXXX_nombre_de_la_base',
        'user' => 'if0_XXXXXXXX',
        'password' => 'LA_CONTRASEÑA_DE_MYSQL',
    ],

    'correo' => [
        'driver' => 'brevo',
        'from' => 'tu-correo-verificado@ejemplo.com',
        'fromName' => 'Nuevo Hogar',
        'brevoApiKey' => 'LA_API_KEY_DE_BREVO',
        'smtp' => [
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'encryption' => 'tls',
            'user' => 'tucorreo@gmail.com',
            'password' => 'LA_CONTRASEÑA_DE_APLICACION',
        ],
    ],

    'sitio' => [
        'url' => 'https://tu-cuenta.infinityfreeapp.com/',
    ],
];
```

### Seguridad del archivo

- El archivo se llama `config.local.php` y está ignorado por Git.
- `api/.htaccess` bloquea el acceso directo a `config.local.php`, `config.example.php`, `conexion.php`, `correo.php` y `configuracion.php`.
- No lo mandes por chat, no lo subas a GitHub y no lo pegues en capturas.
- Si usás el Administrador de archivos de InfinityFree, podés crear el archivo directamente ahí con el editor.

---

## 5. Correo: Brevo o SMTP

### Opción A — Brevo por HTTPS (recomendada)

1. Creá una cuenta en [Brevo](https://www.brevo.com/).
2. Verificá el remitente (`from`) desde **Senders & IPs** → **Senders**. Tiene que ser un correo que controles.
3. Creá una API key en **SMTP & API** → **API Keys**. Copiala en `api/config.local.php`.
4. Dejá `driver` en `brevo`, poné el correo verificado en `from` y la API key en `brevoApiKey`.
5. No hace falta configurar SMTP para esta opción.

Ventajas: funciona por HTTPS (InfinityFree lo permite), no depende de `mail()` y suele tener mejor entrega que Gmail. El plan gratuito tiene un límite diario de envíos; para un juego educativo alcanza.

### Opción B — Gmail por SMTP

1. Activá la verificación en dos pasos en la cuenta de Gmail.
2. Creá una **contraseña de aplicación** (no uses la contraseña normal).
3. En `api/config.local.php` usá:

```php
'driver' => 'smtp',
'from' => 'tucorreo@gmail.com',
'fromName' => 'Nuevo Hogar',
'smtp' => [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'encryption' => 'tls',
    'user' => 'tucorreo@gmail.com',
    'password' => 'CONTRASEÑA_DE_APLICACION',
],
```

InfinityFree permite SMTP externo por el puerto 587 con TLS. Gmail puede limitar o marcar como spam los envíos automáticos; para producción conviene Brevo.

### Modo de prueba sin enviar correos

Si dejás `driver` en `log`, el juego funciona y los correos se escriben en el log de errores de PHP, pero **no llegan a nadie**. Usalo solo para probar el registro y el login.

### Qué pasa si falla el correo

- La cuenta se crea igual.
- El registro devuelve `correoEnviado: false` y un `avisoCorreo`.
- El nivel 6 se guarda igual.
- El aviso aparece en la respuesta del servidor; revisá el log del hosting y la configuración.

No se borra la cuenta ni el progreso por un fallo de correo.

---

## 6. Subir los archivos a InfinityFree

La carpeta pública es **`htdocs`**. Subí **el contenido** del proyecto, no una carpeta de más.

### Archivos y carpetas que sí van

```text
.htaccess
index.php
html/
api/            (incluye api/config.local.php y api/.htaccess)
css/
js/
img/
vendor/         (p5, PHPMailer y qrcode)
qr.html
qr-demo.png     (opcional; el QR final conviene generarlo desde qr.html)
```

### Qué NO subir

```text
index.html      (es la portada de la demo de GitHub Pages)
database/       (el SQL se importa desde phpMyAdmin, no se sube)
servidor/       (servidor Node alternativo)
server.js
node_modules/
package.json
package-lock.json
.git/
*.sqlite
```

Tampoco subas `api/config.local.php` a GitHub. Al hosting sí va, pero por FTP/Administrador de archivos, no por el repositorio.

### Cómo subir

**Opción 1: Administrador de archivos**

1. Panel de InfinityFree → **File Manager**.
2. Abrí `htdocs`.
3. Subí los archivos y carpetas respetando la estructura.
4. Si el panel te deja subir un ZIP, podés comprimir el contenido y descomprimirlo dentro de `htdocs`.

**Opción 2: FTP**

1. Panel → **FTP Accounts**. Anotá host, usuario y contraseña.
2. Con FileZilla, conectate y subí el contenido a `htdocs`.
3. No compartas la contraseña de FTP por chat.

> El límite de InfinityFree es de 10 MB por archivo. `vendor/p5.min.js` pesa menos de 1 MB y PHPMailer también, así que no hay problema.

---

## 7. Comprobar que quedó bien

Hacé estas pruebas en este orden:

1. **Abrir el sitio**: `https://tu-cuenta.infinityfreeapp.com/` debe llevar a `html/Login.html`.
2. **API responde JSON**: abrí `https://tu-cuenta.infinityfreeapp.com/api/puntuaciones.php`; debe devolver algo como `{"ok":true,"jugadores":[]}`. Si ves HTML, un error 500 o una página de InfinityFree, el problema es PHP/rutas.
3. **Registro**: creá una cuenta con un correo real. La pantalla debe decir que la cuenta se creó y si el correo salió.
4. **Base de datos**: en phpMyAdmin, `SELECT id, usuario, correo FROM jugadores;` debe mostrar la cuenta con el correo.
5. **Correo de bienvenida**: revisá la bandeja de entrada y spam. Si no llega, mirá la configuración de Brevo/SMTP.
6. **Login desde otra PC o celular**: iniciá sesión con el mismo usuario y contraseña. Debe entrar y ver el mismo progreso.
7. **Progreso**: completá un nivel. En phpMyAdmin, `SELECT * FROM progreso_jugador;` debe mostrar la fila.
8. **Ranking**: abrí Puntuaciones; la cuenta debe aparecer con sus puntos.
9. **Nivel 6**: completalo por primera vez. Debe llegar el correo de misión completada. Si lo repetís, no debe reenviarse.
10. **Cerrar sesión**: debe volver al login y `api/progreso.php` debe responder 401 sin sesión.
11. **Configuración protegida**: abrí `https://tu-cuenta.infinityfreeapp.com/api/config.local.php`; debe dar 403/404, no mostrar el contenido.

---

## 8. QR para compartir el juego

Ya está incluido `qr.html`. Una vez publicado el sitio:

1. Abrí `https://tu-cuenta.infinityfreeapp.com/qr.html`.
2. El QR se genera automáticamente con la dirección del sitio.
3. Tocá **Descargar QR en PNG**.
4. Escanealo con la cámara del celular: debe abrir el login del juego.

También podés escribir otra dirección en el campo “¿Querés generar el QR para otra dirección?” y volver a generar.

El archivo `qr-demo.png` apunta a la demo de GitHub Pages (`https://juancarballo7.github.io/Juego-Fisica/`), no a las cuentas reales. Cuando tengas la URL de InfinityFree, generá y descargá el QR final desde `qr.html` y reemplazá el archivo si lo vas a imprimir o compartir.

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `503` / “No se pudo conectar con la base de datos” | Host, base, usuario o contraseña incorrectos | Revisá `api/config.local.php`; el host debe ser `sqlXXX.infinityfree.com`, no `localhost`. |
| `500` al registrar | Error de PHP o configuración | Mirá el log de errores del panel; revisá que `api/config.local.php` no tenga errores de sintaxis. |
| La raíz muestra la portada de GitHub Pages | `index.html` se está sirviendo antes que `index.php` | Subí `.htaccess` o borrá `index.html` del hosting (no del repositorio). |
| El registro dice “cuenta creada” pero no llega el correo | Driver en `log`, API key vacía o remitente no verificado | Configurá Brevo o SMTP y revisá spam. |
| Brevo responde 401/400 | API key o remitente incorrecto | Verificá el remitente y generá una API key nueva. |
| Gmail no envía | Contraseña normal en vez de contraseña de aplicación | Activá 2FA y creá una contraseña de aplicación. |
| “No se pudo conectar con el servidor del juego” | La API no responde JSON | Abrí `/api/puntuaciones.php` y revisá PHP, rutas y `.htaccess`. |
| La sesión no se mantiene | Cookies bloqueadas o sitio abierto por HTTP/HTTPS mezclado | Usá siempre la URL HTTPS del sitio y permití cookies. |
| `api/config.local.php` muestra el contenido | `.htaccess` no se aplicó | Verificá que subiste `api/.htaccess`; si el hosting no lo respeta, mové la configuración fuera de `htdocs` o pedí soporte. |
| El ranking no muestra cuentas nuevas | No se completó ningún nivel o la base no es la correcta | Verificá `progreso_jugador` y la base usada por `config.local.php`. |

---

## 10. Qué falta para terminar la publicación

El código ya está preparado. Para hacer la prueba real en Internet falta:

- La **URL pública** de tu sitio en InfinityFree.
- Los **datos reales de MySQL** cargados en `api/config.local.php` (no hace falta que los escribas en el chat).
- Las **credenciales de correo** cargadas en ese mismo archivo.
- Subir el contenido a `htdocs`.

Si querés que yo haga la subida y la prueba final, dejá las credenciales en un archivo local fuera de Git, por ejemplo:

```text
despliegue/credenciales.local.txt
```

Ese archivo ya está ignorado por `.gitignore`. No pegues contraseñas en el chat ni en archivos que se suban a GitHub. Avisame cuando esté creado y seguimos con la prueba de registro, login entre dispositivos, progreso, ranking y correos.

---

## 11. Checklist final

- [ ] Base creada/importada en InfinityFree.
- [ ] `api/config.local.php` con host, base, usuario y contraseña correctos.
- [ ] `sitio.url` con la URL pública.
- [ ] Correo configurado (Brevo o SMTP) y remitente verificado.
- [ ] Archivos subidos a `htdocs` (sin `index.html` de la demo, sin `database/`, sin `servidor/`).
- [ ] `api/config.local.php` subido al hosting pero fuera de GitHub.
- [ ] `/api/puntuaciones.php` devuelve JSON.
- [ ] Registro guarda en MySQL y envía correo de bienvenida.
- [ ] Login funciona desde otra PC/celular.
- [ ] Progreso y ranking coinciden entre dispositivos.
- [ ] Nivel 6 envía el correo una sola vez.
- [ ] `qr.html` genera el QR de la URL final.
- [ ] `api/config.local.php` no es accesible desde el navegador.
