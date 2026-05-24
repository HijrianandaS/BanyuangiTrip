<?php
/* ===================================================
   HEALTH CHECK
   GET /api/health.php
   =================================================== */
require_once __DIR__ . '/config.php';
setCorsHeaders();

jsonResponse(200, [
    'status' => 'ok',
    'app' => 'Desa Banyuanyar (PHP)',
    'timestamp' => date('c'),
    'php_version' => PHP_VERSION,
]);
