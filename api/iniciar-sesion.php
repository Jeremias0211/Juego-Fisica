<?php
declare(strict_types=1);
require_once __DIR__ . '/conexion.php';
exigirMetodo('POST');
$datos = entradaJson();
$usuario = trim((string)($datos['usuario'] ?? ''));
$contrasena = (string)($datos['contrasena'] ?? '');
if ($usuario === '' || $contrasena === '') responder(422, ['ok' => false, 'error' => 'Completá usuario y contraseña.']);
$stmt = conexion()->prepare('SELECT usuario, contrasena_hash FROM jugadores WHERE usuario = :usuario LIMIT 1');
$stmt->execute(['usuario' => $usuario]);
$jugador = $stmt->fetch();
if (!$jugador || !password_verify($contrasena, $jugador['contrasena_hash'])) responder(401, ['ok' => false, 'error' => 'Usuario o contraseña incorrectos.']);
responder(200, ['ok' => true, 'usuario' => $jugador['usuario']]);
