<?php
declare(strict_types=1);

require_once __DIR__ . '/configuracion.php';

/**
 * Correo del proyecto.
 *
 * InfinityFree no permite la función mail() de PHP. Por eso se usa un
 * proveedor externo por HTTPS (Brevo) o SMTP autenticado (por ejemplo Gmail).
 * Las credenciales se leen de api/config.local.php y nunca se escriben acá.
 */

function correoRemitente(): string
{
    return trim((string)configuracion('correo.from', 'MAIL_FROM', ''));
}

function correoNombreRemitente(): string
{
    return trim((string)configuracion('correo.fromName', 'MAIL_FROM_NAME', 'Nuevo Hogar'));
}

function urlSitio(): string
{
    $configurada = trim((string)configuracion('sitio.url', 'SITE_URL', ''));
    if ($configurada !== '') {
        return rtrim($configurada, '/') . '/';
    }

    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $protocolo = $https ? 'https' : 'http';
    $host = (string)($_SERVER['HTTP_HOST'] ?? 'localhost');
    $script = (string)($_SERVER['SCRIPT_NAME'] ?? '/api/correo.php');
    $base = str_replace('\\', '/', dirname(dirname($script)));
    if ($base === '/' || $base === '.' || $base === '\\') {
        $base = '';
    }

    return $protocolo . '://' . $host . $base . '/';
}

function escaparHtml(string $texto): string
{
    return htmlspecialchars($texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function plantillaCorreo(string $titulo, string $contenido): string
{
    $tituloSeguro = escaparHtml($titulo);
    $sitioSeguro = escaparHtml(urlSitio());

    return '<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>' . $tituloSeguro . '</title>
</head>
<body style="margin:0;padding:0;background:#040814;color:#eaf6ff;font-family:Segoe UI,Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
    <div style="border:1px solid rgba(94,231,255,0.35);border-radius:18px;background:#081a31;padding:28px;">
      <p style="margin:0 0 18px;color:#5ee7ff;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Nuevo Hogar · Misión espacial</p>
      ' . $contenido . '
      <hr style="border:0;border-top:1px solid rgba(157,184,207,0.2);margin:28px 0 16px;">
      <p style="margin:0;color:#9db8cf;font-size:12px;line-height:1.6;">
        Este correo se envió automáticamente desde <a href="' . $sitioSeguro . '" style="color:#5ee7ff;">' . $sitioSeguro . '</a>.
        Si no reconocés esta cuenta, podés ignorar el mensaje.
      </p>
    </div>
  </div>
</body>
</html>';
}

/**
 * Envía un correo HTML y devuelve ['ok' => bool, 'error' => string].
 * Nunca lanza excepciones hacia el endpoint: un fallo de correo no debe
 * impedir que el usuario se registre o que se guarde su progreso.
 */
function enviarCorreo(string $destinatario, string $asunto, string $html, string $texto = ''): array
{
    $destinatario = trim($destinatario);
    if (!filter_var($destinatario, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'El correo del destinatario no es válido.'];
    }

    $driver = strtolower(trim((string)configuracion('correo.driver', 'MAIL_DRIVER', 'log')));
    try {
        if ($driver === 'brevo') {
            return enviarCorreoConBrevo($destinatario, $asunto, $html, $texto);
        }
        if ($driver === 'smtp') {
            return enviarCorreoConSmtp($destinatario, $asunto, $html, $texto);
        }
        if ($driver === 'log') {
            error_log('Correo en modo log para ' . $destinatario . ': ' . $asunto);
            return ['ok' => false, 'error' => 'El envío de correos está en modo log.'];
        }

        error_log('Driver de correo desconocido: ' . $driver);
        return ['ok' => false, 'error' => 'El envío de correos no está configurado.'];
    } catch (Throwable $e) {
        error_log('Error enviando correo: ' . $e->getMessage());
        return ['ok' => false, 'error' => 'No se pudo enviar el correo.'];
    }
}

function enviarCorreoConBrevo(string $destinatario, string $asunto, string $html, string $texto): array
{
    $apiKey = trim((string)configuracion('correo.brevoApiKey', 'BREVO_API_KEY', ''));
    $remitente = correoRemitente();

    if ($apiKey === '' || !filter_var($remitente, FILTER_VALIDATE_EMAIL)) {
        error_log('Brevo no configurado: falta brevoApiKey o correo.from.');
        return ['ok' => false, 'error' => 'El envío de correos no está configurado.'];
    }
    if (!function_exists('curl_init')) {
        error_log('Brevo no disponible: la extensión cURL de PHP no está activa.');
        return ['ok' => false, 'error' => 'El hosting no tiene cURL habilitado.'];
    }

    $cuerpo = [
        'sender' => [
            'name' => correoNombreRemitente(),
            'email' => $remitente,
        ],
        'to' => [
            ['email' => $destinatario],
        ],
        'subject' => $asunto,
        'htmlContent' => $html,
        'textContent' => $texto !== '' ? $texto : trim(strip_tags(str_replace(['<br>', '</p>'], "\n", $html))),
    ];

    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'accept: application/json',
            'api-key: ' . $apiKey,
            'content-type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($cuerpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 15,
    ]);

    $respuesta = curl_exec($ch);
    $codigo = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $errorCurl = curl_error($ch);
    curl_close($ch);

    if ($respuesta === false) {
        error_log('Error de conexión con Brevo: ' . $errorCurl);
        return ['ok' => false, 'error' => 'No se pudo conectar con el servicio de correo.'];
    }
    if ($codigo < 200 || $codigo >= 300) {
        error_log('Brevo respondió HTTP ' . $codigo . ': ' . mb_substr((string)$respuesta, 0, 500));
        return ['ok' => false, 'error' => 'El servicio de correo rechazó el mensaje.'];
    }

    return ['ok' => true, 'error' => ''];
}

function enviarCorreoConSmtp(string $destinatario, string $asunto, string $html, string $texto): array
{
    $base = __DIR__ . '/../vendor/PHPMailer/src/';
    if (!is_file($base . 'PHPMailer.php') || !is_file($base . 'SMTP.php') || !is_file($base . 'Exception.php')) {
        error_log('PHPMailer no está instalado en vendor/PHPMailer/src.');
        return ['ok' => false, 'error' => 'El envío por SMTP no está instalado.'];
    }

    require_once $base . 'Exception.php';
    require_once $base . 'PHPMailer.php';
    require_once $base . 'SMTP.php';

    $host = trim((string)configuracion('correo.smtp.host', 'MAIL_HOST', ''));
    $puerto = (int)configuracion('correo.smtp.port', 'MAIL_PORT', 587);
    $cifrado = strtolower(trim((string)configuracion('correo.smtp.encryption', 'MAIL_ENCRYPTION', 'tls')));
    $usuario = trim((string)configuracion('correo.smtp.user', 'MAIL_USER', ''));
    $clave = (string)configuracion('correo.smtp.password', 'MAIL_PASSWORD', '');
    $remitente = correoRemitente();

    if ($host === '' || $usuario === '' || $clave === '' || !filter_var($remitente, FILTER_VALIDATE_EMAIL)) {
        error_log('SMTP no configurado: faltan host, usuario, contraseña o correo.from.');
        return ['ok' => false, 'error' => 'El envío de correos no está configurado.'];
    }

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $host;
    $mail->SMTPAuth = true;
    $mail->Username = $usuario;
    $mail->Password = $clave;
    $mail->Port = $puerto;
    $mail->CharSet = 'UTF-8';
    $mail->Timeout = 15;
    $mail->SMTPDebug = 0;

    if ($cifrado === 'ssl' || $cifrado === 'smtps') {
        $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    } else {
        $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    }

    $mail->setFrom($remitente, correoNombreRemitente());
    $mail->addAddress($destinatario);
    $mail->isHTML(true);
    $mail->Subject = $asunto;
    $mail->Body = $html;
    $mail->AltBody = $texto !== '' ? $texto : trim(strip_tags($html));

    $mail->send();
    return ['ok' => true, 'error' => ''];
}

function enviarCorreoRegistro(string $usuario, string $correo): array
{
    $enlace = urlSitio() . 'html/Login.html';
    $contenido = '
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#eaf6ff;">¡Bienvenido/a, ' . escaparHtml($usuario) . '!</h1>
      <p style="margin:0 0 14px;color:#c8ddf0;line-height:1.7;">Tu cuenta en <strong>Nuevo Hogar: Misión espacial</strong> quedó creada correctamente.</p>
      <p style="margin:0 0 14px;color:#c8ddf0;line-height:1.7;">Correo registrado: <strong>' . escaparHtml($correo) . '</strong></p>
      <p style="margin:24px 0;text-align:center;">
        <a href="' . escaparHtml($enlace) . '" style="display:inline-block;padding:13px 22px;border-radius:10px;background:#5ee7ff;color:#04111f;font-weight:700;text-decoration:none;">Iniciar sesión</a>
      </p>
      <p style="margin:0;color:#9db8cf;font-size:13px;line-height:1.7;">Desde cualquier computadora o celular podés iniciar sesión con este usuario y contraseña. Tu progreso y tu ranking quedan guardados en el servidor.</p>';
    $texto = "Bienvenido/a, $usuario.\n\nTu cuenta en Nuevo Hogar quedó creada.\nCorreo registrado: $correo\n\nIniciá sesión en: $enlace";

    return enviarCorreo($correo, 'Bienvenido/a a Nuevo Hogar', plantillaCorreo('Cuenta creada', $contenido), $texto);
}

function enviarCorreoJuegoCompletado(string $usuario, string $correo, int $puntuacion): array
{
    $enlace = urlSitio() . 'html/Final.html';
    $contenido = '
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#eaf6ff;">¡Misión completada, ' . escaparHtml($usuario) . '!</h1>
      <p style="margin:0 0 14px;color:#c8ddf0;line-height:1.7;">Completaste los seis planetas de <strong>Nuevo Hogar</strong> y encontraste un nuevo hogar para la humanidad.</p>
      <p style="margin:0 0 14px;color:#c8ddf0;line-height:1.7;">Puntaje total: <strong style="color:#ffb347;font-size:20px;">' . $puntuacion . ' puntos</strong></p>
      <p style="margin:24px 0;text-align:center;">
        <a href="' . escaparHtml($enlace) . '" style="display:inline-block;padding:13px 22px;border-radius:10px;background:#5ee7ff;color:#04111f;font-weight:700;text-decoration:none;">Ver el final</a>
      </p>
      <p style="margin:0;color:#9db8cf;font-size:13px;line-height:1.7;">Gracias por jugar. Tu progreso y tu puntaje quedaron guardados en el servidor.</p>';
    $texto = "¡Felicitaciones, $usuario!\n\nCompletaste los seis planetas de Nuevo Hogar.\nPuntaje total: $puntuacion puntos\n\nVer el final: $enlace";

    return enviarCorreo($correo, '¡Completaste Nuevo Hogar!', plantillaCorreo('Misión completada', $contenido), $texto);
}
