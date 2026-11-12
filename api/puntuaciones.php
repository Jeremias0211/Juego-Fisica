<?php
declare(strict_types=1);
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/correo.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    try {
        $filas = conexion()->query(
            'SELECT j.usuario,
                    COALESCE(SUM(CASE WHEN p.completado = 1 THEN p.puntuacion ELSE 0 END), 0) AS puntuacion,
                    COALESCE(SUM(CASE WHEN p.completado = 1 THEN 1 ELSE 0 END), 0) AS nivelesCompletados
             FROM jugadores j
             LEFT JOIN progreso_jugador p ON p.jugador_id = j.id
             GROUP BY j.id, j.usuario
             ORDER BY puntuacion DESC, nivelesCompletados DESC, j.usuario ASC'
        )->fetchAll();
        foreach ($filas as $indice => &$fila) {
            $fila['posicion'] = $indice + 1;
            $fila['puntuacion'] = (int)$fila['puntuacion'];
            $fila['nivelesCompletados'] = (int)$fila['nivelesCompletados'];
        }
        unset($fila);
        responder(200, ['ok' => true, 'jugadores' => $filas]);
    } catch (PDOException $e) {
        error_log('Error consultando puntuaciones: ' . $e->getMessage());
        responder(500, ['ok' => false, 'error' => 'No se pudo cargar la tabla de puntuaciones.']);
    }
}

exigirMetodo('POST');
$jugadorId = exigirJugadorSesion();
$datos = entradaJson();
$nivel = filter_var($datos['nivel'] ?? null, FILTER_VALIDATE_INT);
if ($nivel === false || $nivel === null || $nivel < 1 || $nivel > 6) {
    responder(422, ['ok' => false, 'error' => 'El nivel indicado no es válido.']);
}

$db = conexion();
try {
    if ($nivel > 1) {
        $anterior = $db->prepare('SELECT completado FROM progreso_jugador WHERE jugador_id = :jugador AND nivel = :nivel LIMIT 1');
        $anterior->execute(['jugador' => $jugadorId, 'nivel' => $nivel - 1]);
        if (!(bool)$anterior->fetchColumn()) responder(409, ['ok' => false, 'error' => 'Completá el planeta anterior antes de guardar este nivel.']);
    }

    $yaCompletado = false;
    if ($nivel === 6) {
        $anteriorFinal = $db->prepare('SELECT completado FROM progreso_jugador WHERE jugador_id = :jugador AND nivel = 6 LIMIT 1');
        $anteriorFinal->execute(['jugador' => $jugadorId]);
        $yaCompletado = (bool)$anteriorFinal->fetchColumn();
    }

    $guardar = $db->prepare(
        'INSERT INTO progreso_jugador (jugador_id, nivel, completado, puntuacion, completado_en)
         VALUES (:jugador, :nivel, TRUE, 100, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE
           puntuacion = GREATEST(puntuacion, 100),
           completado = TRUE,
           completado_en = COALESCE(completado_en, CURRENT_TIMESTAMP)'
    );
    $guardar->execute(['jugador' => $jugadorId, 'nivel' => $nivel]);

    $respuesta = ['ok' => true];

    // El correo de finalización se envía una sola vez, al completar el nivel 6.
    if ($nivel === 6 && !$yaCompletado) {
        $consulta = $db->prepare(
            'SELECT j.usuario, j.correo,
                    COALESCE(SUM(CASE WHEN p.completado = 1 THEN p.puntuacion ELSE 0 END), 0) AS puntuacion
             FROM jugadores j
             LEFT JOIN progreso_jugador p ON p.jugador_id = j.id
             WHERE j.id = :jugador
             GROUP BY j.id, j.usuario, j.correo
             LIMIT 1'
        );
        $consulta->execute(['jugador' => $jugadorId]);
        $jugador = $consulta->fetch();

        $respuesta['correoEnviado'] = false;
        if ($jugador && filter_var((string)$jugador['correo'], FILTER_VALIDATE_EMAIL)) {
            try {
                $resultadoCorreo = enviarCorreoJuegoCompletado(
                    (string)$jugador['usuario'],
                    (string)$jugador['correo'],
                    (int)$jugador['puntuacion']
                );
                $respuesta['correoEnviado'] = (bool)$resultadoCorreo['ok'];
                if (!$resultadoCorreo['ok']) {
                    $respuesta['avisoCorreo'] = 'El nivel se guardó, pero no se pudo enviar el correo de finalización.';
                }
            } catch (Throwable $e) {
                error_log('Error enviando correo de finalización: ' . $e->getMessage());
                $respuesta['avisoCorreo'] = 'El nivel se guardó, pero no se pudo enviar el correo de finalización.';
            }
        } else {
            $respuesta['avisoCorreo'] = 'El nivel se guardó, pero la cuenta no tiene un correo válido.';
        }
    }

    responder(200, $respuesta);
} catch (PDOException $e) {
    error_log('Error guardando progreso: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo guardar el puntaje.']);
}
