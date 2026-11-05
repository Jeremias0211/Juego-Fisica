<?php
declare(strict_types=1);
require_once __DIR__ . '/conexion.php';
exigirMetodo('POST');
$jugadorId = exigirJugadorSesion();

try {
    $borrar = conexion()->prepare('DELETE FROM progreso_jugador WHERE jugador_id = :jugador');
    $borrar->execute(['jugador' => $jugadorId]);
    responder(200, ['ok' => true]);
} catch (PDOException $e) {
    error_log('Error reiniciando progreso: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo reiniciar el progreso de la cuenta.']);
}
