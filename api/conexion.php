<?php
declare(strict_types=1);

function responder(int $estado, array $datos): never
{
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function entradaJson(): array
{
    $datos = json_decode(file_get_contents('php://input'), true);
    if (!is_array($datos)) responder(400, ['ok' => false, 'error' => 'La solicitud no contiene datos válidos.']);
    return $datos;
}

function conexion(): PDO
{
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $nombre = getenv('DB_NAME') ?: 'nuevo_hogar';
    $usuario = getenv('DB_USER') ?: 'root';
    $clave = getenv('DB_PASSWORD') ?: '';
    try {
        return new PDO("mysql:host=$host;dbname=$nombre;charset=utf8mb4", $usuario, $clave, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        error_log('Error conectando a MySQL: ' . $e->getMessage());
        responder(503, ['ok' => false, 'error' => 'No se pudo conectar con la base de datos. Revisá MySQL y la configuración de api/conexion.php.']);
    }
}

function exigirMetodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        header('Allow: ' . $metodo);
        responder(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
}
