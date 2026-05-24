<?php
/* ===================================================
   AUTH API — Login Endpoint
   POST /api/auth.php
   =================================================== */
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = getRequestMethod();

if ($method !== 'POST') {
    jsonResponse(405, ['error' => 'Method not allowed.']);
}

// Parse request body
$body = getJsonBody();
$username = isset($body['username']) ? trim($body['username']) : '';
$password = isset($body['password']) ? $body['password'] : '';

if (empty($username) || empty($password)) {
    jsonResponse(400, ['error' => 'Username dan password wajib diisi.']);
}

try {
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(401, ['error' => 'Username atau password salah.']);
    }

    // Generate JWT
    $payload = [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY,
    ];
    $token = jwtEncode($payload);

    jsonResponse(200, [
        'message' => 'Login berhasil!',
        'token' => $token,
        'user' => [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
        ],
    ]);
} catch (Exception $e) {
    jsonResponse(500, ['error' => 'Terjadi kesalahan server.']);
}
