<?php
declare(strict_types=1);
require_once __DIR__ . '/conexion.php';
exigirMetodo('POST');
$datos = entradaJson();
$usuario = trim((string)($datos['usuario'] ?? ''));
$contrasena = (string)($datos['contrasena'] ?? '');
if ($usuario === '' || $contrasena === '') responder(422, ['ok' => false, 'error' => 'Completá usuario y contraseña.']);

if (mb_strlen($usuario) > 40 || strlen($contrasena) > 200) {
    responder(401, ['ok' => false, 'error' => 'Usuario o contraseña incorrectos.']);
}

limitarPorIp('login-ip', 30, 600);
$claveLimite = 'login-usuario:' . ipSolicitud() . ':' . mb_strtolower($usuario);
limitarIntentos($claveLimite, 10, 600);

$db = conexion();
$stmt = $db->prepare('SELECT id, usuario, contrasena_hash FROM jugadores WHERE usuario = :usuario LIMIT 1');
$stmt->execute(['usuario' => $usuario]);
$jugador = $stmt->fetch();
if (!$jugador || !password_verify($contrasena, $jugador['contrasena_hash'])) {
    responder(401, ['ok' => false, 'error' => 'Usuario o contraseña incorrectos.']);
}

limpiarIntentos($claveLimite);

if (password_needs_rehash($jugador['contrasena_hash'], PASSWORD_DEFAULT)) {
    try {
        $actualizar = $db->prepare('UPDATE jugadores SET contrasena_hash = :hash WHERE id = :id');
        $actualizar->execute([
            'hash' => password_hash($contrasena, PASSWORD_DEFAULT),
            'id' => (int)$jugador['id'],
        ]);
    } catch (PDOException $e) {
        error_log('No se pudo actualizar el hash de contraseña: ' . $e->getMessage());
    }
}

iniciarSesionSegura();
session_regenerate_id(true);
$_SESSION['jugador_id'] = (int)$jugador['id'];
$_SESSION['usuario'] = $jugador['usuario'];
responder(200, ['ok' => true, 'usuario' => $jugador['usuario']]);
