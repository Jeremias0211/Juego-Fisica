<?php
declare(strict_types=1);

/* Evita que un error de PHP muestre rutas, credenciales o detalles internos. */
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

/* Estos archivos son internos: solo deben incluirse desde un endpoint. */
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath((string)$_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/configuracion.php';

const LIMITE_CUERPO_JSON = 16384;

function cabecerasSeguridadApi(): void
{
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Cross-Origin-Resource-Policy: same-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()');
}

cabecerasSeguridadApi();

register_shutdown_function(static function (): void {
    $error = error_get_last();
    if (!is_array($error)) return;
    if (!in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) return;

    error_log('Error fatal en la API: ' . $error['message']);
    if (!headers_sent()) {
        http_response_code(500);
        cabecerasSeguridadApi();
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'Ocurrió un error en el servidor.'], JSON_UNESCAPED_UNICODE);
    }
});

set_exception_handler(static function (Throwable $e): void {
    error_log('Excepción no controlada en la API: ' . $e->getMessage());
    if (!headers_sent()) {
        responder(500, ['ok' => false, 'error' => 'Ocurrió un error en el servidor.']);
    }
});

function responder(int $estado, array $datos): never
{
    http_response_code($estado);
    cabecerasSeguridadApi();
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ipSolicitud(): string
{
    return (string)($_SERVER['REMOTE_ADDR'] ?? 'desconocida');
}

/**
 * Solo acepta peticiones del mismo sitio. Si el navegador no manda Origin,
 * se usa Sec-Fetch-Site como respaldo. SameSite=Lax es la segunda barrera.
 */
function exigirOrigenPermitido(): void
{
    $metodo = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if ($metodo === 'GET' || $metodo === 'HEAD' || $metodo === 'OPTIONS') return;

    $origen = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    $host = strtolower(trim((string)($_SERVER['HTTP_HOST'] ?? '')));

    if ($origen !== '') {
        $partes = parse_url($origen);
        if (!is_array($partes) || !isset($partes['scheme'], $partes['host'])) {
            responder(403, ['ok' => false, 'error' => 'La solicitud no proviene de este sitio.']);
        }

        $esquema = strtolower((string)$partes['scheme']);
        if ($esquema !== 'http' && $esquema !== 'https') {
            responder(403, ['ok' => false, 'error' => 'La solicitud no proviene de este sitio.']);
        }

        $hostOrigen = strtolower((string)$partes['host']);
        $puerto = isset($partes['port']) ? (int)$partes['port'] : null;
        if ($puerto !== null && $puerto !== 80 && $puerto !== 443) {
            $hostOrigen .= ':' . $puerto;
        }

        $hostActual = (string)preg_replace('/:(?:80|443)$/', '', $host);
        if ($hostActual === '' || !hash_equals($hostActual, $hostOrigen)) {
            responder(403, ['ok' => false, 'error' => 'La solicitud no proviene de este sitio.']);
        }
        return;
    }

    $sitio = strtolower(trim((string)($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')));
    if ($sitio !== '' && $sitio !== 'same-origin' && $sitio !== 'none') {
        responder(403, ['ok' => false, 'error' => 'La solicitud no proviene de este sitio.']);
    }
}

function entradaJson(): array
{
    exigirOrigenPermitido();

    $tipo = strtolower(trim(explode(';', (string)($_SERVER['CONTENT_TYPE'] ?? ''))[0]));
    if ($tipo !== 'application/json') {
        responder(415, ['ok' => false, 'error' => 'La solicitud debe enviarse como JSON.']);
    }

    $codificacion = strtolower(trim((string)($_SERVER['HTTP_CONTENT_ENCODING'] ?? 'identity')));
    if ($codificacion !== '' && $codificacion !== 'identity') {
        responder(415, ['ok' => false, 'error' => 'La codificación de la solicitud no es compatible.']);
    }

    $declarado = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($declarado > LIMITE_CUERPO_JSON) {
        responder(413, ['ok' => false, 'error' => 'La solicitud es demasiado grande.']);
    }

    $crudo = file_get_contents('php://input', false, null, 0, LIMITE_CUERPO_JSON + 1);
    if ($crudo === false || strlen($crudo) > LIMITE_CUERPO_JSON) {
        responder(413, ['ok' => false, 'error' => 'La solicitud es demasiado grande.']);
    }

    $datos = json_decode($crudo, true);
    if (!is_array($datos)) {
        responder(400, ['ok' => false, 'error' => 'La solicitud no contiene datos válidos.']);
    }
    return $datos;
}

function directorioLimites(): ?string
{
    static $resuelto = false;
    static $directorio = null;

    if ($resuelto) return $directorio;
    $resuelto = true;

    $base = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'nuevo-hogar-limites';
    if (!is_dir($base)) {
        @mkdir($base, 0700, true);
    }
    if (!is_dir($base) || !is_writable($base)) return $directorio = null;

    return $directorio = $base;
}

function archivoLimite(string $clave): ?string
{
    $directorio = directorioLimites();
    if ($directorio === null) return null;

    $archivo = $directorio . DIRECTORY_SEPARATOR . hash('sha256', $clave) . '.json';

    if (mt_rand(1, 200) === 1) {
        foreach ((array)glob($directorio . DIRECTORY_SEPARATOR . '*.json') as $viejo) {
            $modificado = @filemtime($viejo);
            if ($modificado !== false && $modificado < time() - 86400) {
                @unlink($viejo);
            }
        }
    }

    return $archivo;
}

function limitarIntentos(string $clave, int $maximo, int $ventanaSegundos): void
{
    $archivo = archivoLimite($clave);
    if ($archivo === null) return;

    $ahora = time();
    $excedido = false;
    $restante = 0;

    $manejador = @fopen($archivo, 'c+');
    if ($manejador === false) return;

    if (@flock($manejador, LOCK_EX)) {
        $contenido = stream_get_contents($manejador);
        $datos = json_decode((string)$contenido, true);

        if (
            !is_array($datos) ||
            !isset($datos['inicio'], $datos['cuenta']) ||
            $ahora - (int)$datos['inicio'] >= $ventanaSegundos
        ) {
            $datos = ['inicio' => $ahora, 'cuenta' => 0];
        }

        $datos['cuenta'] = (int)$datos['cuenta'] + 1;
        $excedido = $datos['cuenta'] > $maximo;
        $restante = max(0, $ventanaSegundos - ($ahora - (int)$datos['inicio']));

        rewind($manejador);
        ftruncate($manejador, 0);
        fwrite($manejador, json_encode($datos));
        fflush($manejador);
        flock($manejador, LOCK_UN);
    }

    fclose($manejador);

    if ($excedido) {
        header('Retry-After: ' . $restante);
        responder(429, ['ok' => false, 'error' => 'Demasiados intentos. Esperá unos minutos y volvé a probar.']);
    }
}

function limpiarIntentos(string $clave): void
{
    $archivo = archivoLimite($clave);
    if ($archivo !== null && is_file($archivo)) {
        @unlink($archivo);
    }
}

function limitarPorIp(string $accion, int $maximo, int $ventanaSegundos): void
{
    limitarIntentos($accion . ':' . ipSolicitud(), $maximo, $ventanaSegundos);
}

function conexion(): PDO
{
    $host = (string)configuracion('db.host', 'DB_HOST', '127.0.0.1');
    $puerto = (int)configuracion('db.port', 'DB_PORT', 3306);
    $nombre = (string)configuracion('db.name', 'DB_NAME', 'nuevo_hogar');
    $usuario = (string)configuracion('db.user', 'DB_USER', 'root');
    $clave = (string)configuracion('db.password', 'DB_PASSWORD', '');

    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $puerto, $nombre);

    try {
        return new PDO($dsn, $usuario, $clave, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 8,
        ]);
    } catch (PDOException $e) {
        error_log('Error conectando a MySQL: ' . $e->getMessage());
        responder(503, ['ok' => false, 'error' => 'No se pudo conectar con la base de datos. Revisá la configuración del hosting.']);
    }
}

function iniciarSesionSegura(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;

    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.sid_length', '48');
    ini_set('session.sid_bits_per_character', '6');
    ini_set('session.gc_maxlifetime', '43200');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function exigirJugadorSesion(): int
{
    iniciarSesionSegura();
    $jugadorId = (int)($_SESSION['jugador_id'] ?? 0);
    if ($jugadorId < 1) responder(401, ['ok' => false, 'error' => 'Iniciá sesión para guardar tu progreso.']);
    return $jugadorId;
}

function exigirMetodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        header('Allow: ' . $metodo);
        responder(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
}
