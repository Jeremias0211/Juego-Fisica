<?php
declare(strict_types=1);

/**
 * Carga la configuración privada del proyecto.
 *
 * Prioridad:
 * 1. Variables de entorno (si el hosting las permite).
 * 2. api/config.local.php (archivo privado, ignorado por Git).
 * 3. Valores por defecto para XAMPP.
 *
 * api/config.local.php debe devolver un array como el de config.example.php.
 */
function cargarConfiguracion(): array
{
    static $config = null;

    if (is_array($config)) {
        return $config;
    }

    $ruta = __DIR__ . '/config.local.php';
    if (is_file($ruta)) {
        $datos = require $ruta;
        if (is_array($datos)) {
            return $config = $datos;
        }
    }

    return $config = [];
}

/**
 * Lee un valor de configuración con notación de puntos.
 * Ejemplo: configuracion('db.host', 'DB_HOST', '127.0.0.1').
 */
function configuracion(string $clave, ?string $variableEntorno = null, mixed $defecto = null): mixed
{
    if ($variableEntorno !== null) {
        $valor = getenv($variableEntorno);
        if ($valor !== false && $valor !== '') {
            return $valor;
        }
    }

    $actual = cargarConfiguracion();
    foreach (explode('.', $clave) as $parte) {
        if (!is_array($actual) || !array_key_exists($parte, $actual)) {
            return $defecto;
        }
        $actual = $actual[$parte];
    }

    return ($actual === '' || $actual === null) ? $defecto : $actual;
}
