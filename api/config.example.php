<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli' && basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

/**
 * Plantilla de configuración privada.
 *
 * 1. Copiá este archivo como api/config.local.php.
 * 2. Completá los datos reales de InfinityFree y del correo.
 * 3. No subas api/config.local.php a GitHub: ya está en .gitignore.
 *
 * En XAMPP podés dejar los valores por defecto de la sección "db".
 * En InfinityFree el host NO es "localhost": usá el que muestra el panel
 * en MySQL Databases, por ejemplo sql123.infinityfree.com.
 */
return [
    'db' => [
        'host' => '127.0.0.1',                       // InfinityFree: sqlXXX.infinityfree.com
        'port' => 3306,
        'name' => 'nuevo_hogar',                     // InfinityFree: if0_XXXXXXXX_nombre
        'user' => 'root',                            // InfinityFree: if0_XXXXXXXX
        'password' => '',                            // Contraseña de MySQL (no la compartas en el chat)
    ],

    'correo' => [
        // Opciones: "brevo" (API HTTPS, recomendado), "smtp" (PHPMailer) o "log".
        // InfinityFree no permite mail() de PHP; por eso usamos un servicio externo.
        'driver' => 'brevo',
        'from' => 'tucorreo@ejemplo.com',            // Remitente verificado en Brevo o cuenta de Gmail
        'fromName' => 'Nuevo Hogar',

        // Si driver = brevo:
        'brevoApiKey' => '',

        // Si driver = smtp (por ejemplo Gmail con contraseña de aplicación):
        'smtp' => [
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'encryption' => 'tls',                   // tls o ssl
            'user' => 'tucorreo@gmail.com',
            'password' => '',                        // Contraseña de aplicación, no la del correo normal
        ],
    ],

    'sitio' => [
        // Dirección pública del juego. Se usa en los enlaces de los correos.
        'url' => 'https://tu-cuenta.infinityfreeapp.com/',
    ],
];
