<?php
/* ===================================================
   CONFIG — Database, CORS, JWT, Helpers
   Desa Banyuanyar — Sistem Informasi Peta Digital UMKM
   PHP 7.4+ Compatible
   =================================================== */

// Prevent direct access display
if (basename($_SERVER['PHP_SELF']) === 'config.php') {
    http_response_code(403);
    exit('Access denied.');
}

// ========================
// DATABASE CONFIGURATION
// ========================
define('DB_HOST', 'localhost');
define('DB_NAME', 'banyuanyar_trip');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// ========================
// JWT CONFIGURATION
// ========================
define('JWT_SECRET', '1190a20a9609da9fae0b8febfaecfcbaa7c0b3835eb130d03dd1b8ef8aef6e94');
define('JWT_EXPIRY', 86400); // 24 hours in seconds

// ========================
// UPLOAD CONFIGURATION
// ========================
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', '/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// ========================
// BANYUANYAR COORDINATE BOUNDS
// ========================
define('LAT_MIN', -7.5000);
define('LAT_MAX', -7.4050);
define('LNG_MIN', 110.5400);
define('LNG_MAX', 110.6150);

// ========================
// DATABASE CONNECTION (PDO)
// ========================
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            jsonResponse(500, ['error' => 'Database connection failed.']);
            exit;
        }
    }
    return $pdo;
}

// ========================
// CORS & HEADERS
// ========================
function setCorsHeaders() {
    // Allow from any origin (adjust for production)
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');

    // Handle preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// ========================
// JSON RESPONSE HELPER
// ========================
function jsonResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ========================
// REQUEST HELPERS
// ========================
function getRequestMethod() {
    $method = $_SERVER['REQUEST_METHOD'];
    // Support method override via _method field (for shared hosting that blocks PUT/DELETE)
    if ($method === 'POST' && isset($_POST['_method'])) {
        $override = strtoupper($_POST['_method']);
        if (in_array($override, ['PUT', 'DELETE'])) {
            return $override;
        }
    }
    return $method;
}

function getJsonBody() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return $data ?: [];
}

function getParam($key, $default = null) {
    return isset($_GET[$key]) ? $_GET[$key] : $default;
}

// ========================
// JWT FUNCTIONS (Native PHP, no external library)
// ========================
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwtEncode($payload) {
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    
    $headerEncoded = base64UrlEncode(json_encode($header));
    $payloadEncoded = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    $signatureEncoded = base64UrlEncode($signature);
    
    return "$headerEncoded.$payloadEncoded.$signatureEncoded";
}

function jwtDecode($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
    
    // Verify signature
    $signature = base64UrlDecode($signatureEncoded);
    $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    
    if (!hash_equals($expectedSignature, $signature)) {
        return null; // Invalid signature
    }
    
    $payload = json_decode(base64UrlDecode($payloadEncoded), true);
    if (!$payload) return null;
    
    // Check expiry
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null; // Token expired
    }
    
    return $payload;
}

// ========================
// AUTH MIDDLEWARE
// ========================
function requireAuth() {
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    
    // Some shared hosting strips Authorization header, check alternatives
    if (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    if (empty($authHeader) || !preg_match('/^Bearer\s+(\S+)$/', $authHeader, $matches)) {
        jsonResponse(401, ['error' => 'Akses ditolak. Token tidak ditemukan.']);
    }
    
    $token = $matches[1];
    $decoded = jwtDecode($token);
    
    if (!$decoded) {
        jsonResponse(401, ['error' => 'Token tidak valid atau sudah expired.']);
    }
    
    return $decoded;
}

// ========================
// COORDINATE VALIDATION
// ========================
function isInsideBanyuanyar($lat, $lng) {
    if ($lat === null || $lng === null || $lat === '' || $lng === '') return true;
    $latNum = floatval($lat);
    $lngNum = floatval($lng);
    if ($latNum == 0 && $lngNum == 0) return true;
    return (
        $latNum >= LAT_MIN && $latNum <= LAT_MAX &&
        $lngNum >= LNG_MIN && $lngNum <= LNG_MAX
    );
}

// ========================
// FILE UPLOAD HELPER
// ========================
function handleFileUpload($fieldName = 'foto') {
    if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    
    $file = $_FILES[$fieldName];
    
    // Check errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(400, ['error' => 'Error saat upload file.']);
    }
    
    // Check size
    if ($file['size'] > MAX_FILE_SIZE) {
        jsonResponse(400, ['error' => 'Ukuran file terlalu besar. Maksimal 5MB.']);
    }
    
    // Check extension
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ALLOWED_EXTENSIONS)) {
        jsonResponse(400, ['error' => 'Hanya file gambar (jpg, png, gif, webp) yang diizinkan.']);
    }
    
    // Create upload directory if not exists
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    
    // Generate unique filename
    $newName = time() . '-' . mt_rand(100000000, 999999999) . '.' . $ext;
    $destination = UPLOAD_DIR . $newName;
    
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        jsonResponse(500, ['error' => 'Gagal menyimpan file.']);
    }
    
    return UPLOAD_URL . $newName;
}

function deleteUploadedFile($fotoUrl) {
    if (empty($fotoUrl) || strpos($fotoUrl, 'http') === 0) return;
    
    $filePath = __DIR__ . '/..' . $fotoUrl;
    if (file_exists($filePath)) {
        unlink($filePath);
    }
}
