<?php
declare(strict_types=1);
require_once __DIR__ . '/conexion.php';
exigirMetodo('POST');
$datos = entradaJson();
$usuario = trim((string)($datos['usuario'] ?? ''));
$correo = trim((string)($datos['correo'] ?? ''));
$contrasena = (string)($datos['contrasena'] ?? '');
if (mb_strlen($usuario) < 3 || mb_strlen($usuario) > 40) responder(422, ['ok' => false, 'error' => 'El usuario debe tener entre 3 y 40 caracteres.']);
if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || strlen($correo) > 254) responder(422, ['ok' => false, 'error' => 'Ingresá un correo electrónico válido.']);
if (strlen($contrasena) < 4) responder(422, ['ok' => false, 'error' => 'La contraseña debe tener al menos 4 caracteres.']);
$db = conexion();
try {
    $stmt = $db->prepare('INSERT INTO jugadores (usuario, correo, contrasena_hash) VALUES (:usuario, :correo, :hash)');
    $stmt->execute(['usuario' => $usuario, 'correo' => $correo, 'hash' => password_hash($contrasena, PASSWORD_DEFAULT)]);
    responder(201, ['ok' => true]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') responder(409, ['ok' => false, 'error' => 'Ese usuario o correo ya está registrado.']);
    error_log('Error registrando jugador: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo crear la cuenta.']);
}
