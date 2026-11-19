<?php
declare(strict_types=1);
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/validacion-cuenta.php';
require_once __DIR__ . '/correo.php';
exigirMetodo('POST');
$datos = entradaJson();
$usuario = trim((string)($datos['usuario'] ?? ''));
$contrasena = (string)($datos['contrasena'] ?? '');

limitarPorIp('registro-ip', 10, 3600);

if (
    mb_strlen($usuario) < 3 ||
    mb_strlen($usuario) > 40 ||
    preg_match('/[\x00-\x1F\x7F]/', $usuario)
) {
    responder(422, ['ok' => false, 'error' => 'El usuario debe tener entre 3 y 40 caracteres.']);
}

$revision = validarCuentaRegistro($usuario, (string)($datos['correo'] ?? ''), $contrasena);
if (!$revision['ok']) {
    responder(422, ['ok' => false, 'error' => (string)$revision['error']]);
}
$correo = (string)$revision['correo'];

$db = conexion();
try {
    $stmt = $db->prepare('INSERT INTO jugadores (usuario, correo, contrasena_hash) VALUES (:usuario, :correo, :hash)');
    $stmt->execute(['usuario' => $usuario, 'correo' => $correo, 'hash' => password_hash($contrasena, PASSWORD_DEFAULT)]);

    // La cuenta ya quedó guardada: se inicia sesión sin obligar a pasar por el formulario de login.
    iniciarSesionSegura();
    session_regenerate_id(true);
    $_SESSION['jugador_id'] = (int)$db->lastInsertId();
    $_SESSION['usuario'] = $usuario;

    // El alta ya quedó guardada. Un fallo de correo no debe borrar la cuenta.
    try {
        $resultadoCorreo = enviarCorreoRegistro($usuario, $correo);
    } catch (Throwable $e) {
        error_log('Error enviando correo de bienvenida: ' . $e->getMessage());
        $resultadoCorreo = ['ok' => false, 'error' => 'No se pudo enviar el correo.'];
    }
    responder(201, [
        'ok' => true,
        'usuario' => $usuario,
        'correo' => $correo,
        'correoEnviado' => (bool)$resultadoCorreo['ok'],
        'avisoCorreo' => $resultadoCorreo['ok']
            ? null
            : 'La cuenta se creó correctamente, pero no se pudo enviar el correo de bienvenida. Revisá la configuración de correo.',
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') responder(409, ['ok' => false, 'error' => 'Ese usuario o correo ya está registrado.']);
    error_log('Error registrando jugador: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo crear la cuenta.']);
}
