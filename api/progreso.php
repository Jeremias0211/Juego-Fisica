<?php
declare(strict_types=1);
require_once __DIR__ . '/conexion.php';
exigirMetodo('GET');
$jugadorId = exigirJugadorSesion();

try {
    $consulta = conexion()->prepare(
        'SELECT nivel, puntuacion
         FROM progreso_jugador
         WHERE jugador_id = :jugador AND completado = TRUE
         ORDER BY nivel ASC'
    );
    $consulta->execute(['jugador' => $jugadorId]);
    $filas = $consulta->fetchAll();
    $completados = array_map(static fn(array $fila): int => (int)$fila['nivel'], $filas);
    $puntuacion = array_sum(array_map(static fn(array $fila): int => (int)$fila['puntuacion'], $filas));
    $nivel = $completados ? min(6, max($completados) + 1) : 1;
    responder(200, [
        'ok' => true,
        'completados' => $completados,
        'puntuacion' => $puntuacion,
        'nivel' => $nivel,
    ]);
} catch (PDOException $e) {
    error_log('Error consultando progreso: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo cargar el progreso del jugador.']);
}
