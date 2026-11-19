<?php
declare(strict_types=1);

/* Validación de correo y contraseña para el registro.
   Replica las reglas de js/portal/validacion-cuenta.js y servidor/validacion-cuenta.js.
   No se aplica al inicio de sesión: las cuentas anteriores conservan su acceso. */

const MIN_CONTRASENA_REGISTRO = 8;
const MAX_CONTRASENA_REGISTRO = 200;
const MAX_CORREO_REGISTRO = 254;

const DOMINIOS_DESECHABLES_REGISTRO = [
    '10mail.org', '10minutemail.com', '10minutemail.net', '1secmail.com', '1secmail.net',
    '1secmail.org', 'burnermail.io', 'discard.email', 'discardmail.com', 'dispostable.com',
    'dropmail.me', 'emailondeck.com', 'eyepaste.com', 'fakeinbox.com', 'getnada.com',
    'grr.la', 'guerrillamail.biz', 'guerrillamail.com', 'guerrillamail.net',
    'guerrillamail.org', 'harakirimail.com', 'inboxkitten.com', 'linshiyouxiang.net',
    'mailcatch.com', 'maildrop.cc', 'mailinator.com', 'mailinator.net', 'mailinator2.com',
    'mailnesia.com', 'mailpoof.com', 'mailsac.com', 'mintemail.com', 'moakt.com',
    'mohmal.com', 'mytemp.email', 'nada.email', 'sharklasers.com', 'sogetthis.com',
    'spam4.me', 'spamgourmet.com', 'temp-mail.org', 'tempinbox.com', 'tempmail.com',
    'tempmail.net', 'throwawaymail.com', 'tmail.ws', 'tmpmail.net', 'tmpmail.org',
    'trashmail.com', 'trashmail.net', 'yopmail.com', 'yopmail.fr', 'yopmail.net'
];

const DOMINIOS_RESERVADOS_REGISTRO = [
    'example.com', 'example.net', 'example.org', 'example.edu',
    'localhost', 'localhost.localdomain'
];

const TLD_RESERVADOS_REGISTRO = ['.test', '.example', '.invalid', '.localhost', '.local', '.onion'];

/* Claves comunes ya normalizadas: minúsculas y solo letras/números. */
const CLAVES_COMUNES_REGISTRO = [
    '12345678', '123456789', '1234567890', '11111111', '00000000', '87654321',
    'abc12345', 'abc123456', 'admin123', 'admin1234', 'asdfghjk', 'barcelona',
    'contrasena', 'contrasena1', 'contrasena123', 'espacio123', 'fisica123',
    'futbol123', 'hola1234', 'iloveyou', 'monkey123', 'nuevohogar', 'password',
    'password1', 'password12', 'password123', 'planeta123', 'qwerty123', 'qwertyui',
    'riverplate', 'superman', 'universo', 'universo123', 'welcome1', 'welcome123'
];

function normalizarComparacionRegistro(string $texto): string
{
    $texto = mb_strtolower($texto, 'UTF-8');
    $texto = strtr($texto, [
        'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
        'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u', 'ç' => 'c'
    ]);
    return (string)preg_replace('/[^a-z0-9]/', '', $texto);
}

function normalizarCorreoRegistro(string $correo): string
{
    return mb_strtolower(trim($correo), 'UTF-8');
}

/**
 * @return array{ok: bool, correo?: string, error?: string}
 */
function validarCorreoRegistro(string $correo): array
{
    $valor = normalizarCorreoRegistro($correo);

    if ($valor === '') {
        return ['ok' => false, 'error' => 'Ingresá un correo electrónico.'];
    }
    if (strlen($valor) > MAX_CORREO_REGISTRO) {
        return ['ok' => false, 'error' => 'El correo no puede superar los 254 caracteres.'];
    }

    $arroba = strrpos($valor, '@');
    if ($arroba === false || $arroba < 1 || $arroba === strlen($valor) - 1) {
        return ['ok' => false, 'error' => 'Ingresá un correo electrónico válido.'];
    }

    $local = substr($valor, 0, $arroba);
    $dominio = substr($valor, $arroba + 1);
    $patron = '~^[a-z0-9.!#$%&\'*+/=?^_`{|}\~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+\z~';

    if (
        strlen($local) > 64 ||
        str_starts_with($local, '.') ||
        str_ends_with($local, '.') ||
        str_contains($local, '..') ||
        preg_match($patron, $valor) !== 1
    ) {
        return ['ok' => false, 'error' => 'Ingresá un correo electrónico válido.'];
    }

    if (strlen($dominio) > 253 || !str_contains($dominio, '.')) {
        return ['ok' => false, 'error' => 'Ingresá un correo electrónico válido.'];
    }

    $partesDominio = explode('.', $dominio);
    $tld = (string)end($partesDominio);
    if ($tld === '' || strlen($tld) < 2) {
        return ['ok' => false, 'error' => 'Ingresá un correo electrónico válido.'];
    }

    if (in_array($dominio, DOMINIOS_DESECHABLES_REGISTRO, true)) {
        return ['ok' => false, 'error' => 'Usá un correo permanente: ese dominio es temporal.'];
    }

    if (in_array($dominio, DOMINIOS_RESERVADOS_REGISTRO, true)) {
        return ['ok' => false, 'error' => 'Ese dominio está reservado para ejemplos. Usá tu correo real.'];
    }

    foreach (TLD_RESERVADOS_REGISTRO as $sufijo) {
        if (str_ends_with($dominio, $sufijo)) {
            return ['ok' => false, 'error' => 'Ese dominio está reservado para ejemplos. Usá tu correo real.'];
        }
    }

    return ['ok' => true, 'correo' => $valor];
}

/**
 * @return array{ok: bool, error?: string}
 */
function validarContrasenaRegistro(string $clave, string $usuario = '', string $correo = ''): array
{
    $largo = mb_strlen($clave, 'UTF-8');

    if ($largo < MIN_CONTRASENA_REGISTRO || $largo > MAX_CONTRASENA_REGISTRO) {
        return [
            'ok' => false,
            'error' => 'La contraseña debe tener entre ' . MIN_CONTRASENA_REGISTRO . ' y ' . MAX_CONTRASENA_REGISTRO . ' caracteres.'
        ];
    }

    if (preg_match('/[\x00-\x1F\x7F]/', $clave) === 1) {
        return ['ok' => false, 'error' => 'La contraseña contiene caracteres no permitidos.'];
    }

    if ($clave !== trim($clave)) {
        return ['ok' => false, 'error' => 'La contraseña no puede empezar ni terminar con espacios.'];
    }

    if (preg_match('/\p{L}/u', $clave) !== 1 || preg_match('/\p{Nd}/u', $clave) !== 1) {
        return ['ok' => false, 'error' => 'La contraseña debe incluir al menos una letra y un número.'];
    }

    if (preg_match('/^(.)\1+\z/us', $clave) === 1) {
        return ['ok' => false, 'error' => 'La contraseña no puede ser un solo carácter repetido.'];
    }

    $base = normalizarComparacionRegistro($clave);
    if (in_array($base, CLAVES_COMUNES_REGISTRO, true)) {
        return ['ok' => false, 'error' => 'Esa contraseña es demasiado común. Elegí una más difícil de adivinar.'];
    }

    $baseUsuario = normalizarComparacionRegistro($usuario);
    if (strlen($baseUsuario) >= 3 && str_contains($base, $baseUsuario)) {
        return ['ok' => false, 'error' => 'La contraseña no puede contener tu nombre de usuario.'];
    }

    $correoNormalizado = normalizarCorreoRegistro($correo);
    $localCorreo = explode('@', $correoNormalizado)[0] ?? '';
    $baseCorreo = normalizarComparacionRegistro($localCorreo);
    if (strlen($baseCorreo) >= 3 && str_contains($base, $baseCorreo)) {
        return ['ok' => false, 'error' => 'La contraseña no puede contener tu correo electrónico.'];
    }

    return ['ok' => true];
}

/**
 * @return array{ok: bool, correo?: string, error?: string}
 */
function validarCuentaRegistro(string $usuario, string $correo, string $clave): array
{
    $revisionCorreo = validarCorreoRegistro($correo);
    if (!$revisionCorreo['ok']) {
        return $revisionCorreo;
    }

    $revisionClave = validarContrasenaRegistro($clave, $usuario, (string)$revisionCorreo['correo']);
    if (!$revisionClave['ok']) {
        return $revisionClave;
    }

    return ['ok' => true, 'correo' => (string)$revisionCorreo['correo']];
}
