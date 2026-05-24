<?php
/* ===================================================
   UMKM API — CRUD Endpoints
   Menggantikan server/routes/umkm.js (Node.js)
   =================================================== */
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = getRequestMethod();
$id = getParam('id');
$action = getParam('action');

try {
    $db = getDB();

    // =============================================
    // ROUTING
    // =============================================
    
    if ($method === 'GET') {
        if ($action === 'stats') {
            handleStats($db);
        } elseif ($id) {
            handleGetById($db, $id);
        } else {
            handleGetAll($db);
        }
    } elseif ($method === 'POST') {
        $user = requireAuth();
        handleCreate($db);
    } elseif ($method === 'PUT') {
        $user = requireAuth();
        if (!$id) jsonResponse(400, ['error' => 'ID UMKM wajib disertakan.']);
        handleUpdate($db, $id);
    } elseif ($method === 'DELETE') {
        $user = requireAuth();
        if (!$id) jsonResponse(400, ['error' => 'ID UMKM wajib disertakan.']);
        handleDelete($db, $id);
    } else {
        jsonResponse(405, ['error' => 'Method not allowed.']);
    }

} catch (Exception $e) {
    jsonResponse(500, ['error' => 'Terjadi kesalahan server.']);
}

// =============================================
// HANDLER FUNCTIONS
// =============================================

// GET /api/umkm.php — List semua UMKM
function handleGetAll($db) {
    $kategori = getParam('kategori');
    $search = getParam('search');

    $sql = 'SELECT * FROM umkm';
    $params = [];
    $conditions = [];

    if ($kategori && $kategori !== 'Semua') {
        $conditions[] = 'kategori = ?';
        $params[] = $kategori;
    }

    if ($search) {
        $conditions[] = '(nama_produk LIKE ? OR deskripsi LIKE ? OR alamat LIKE ?)';
        $kw = '%' . $search . '%';
        $params[] = $kw;
        $params[] = $kw;
        $params[] = $kw;
    }

    if (count($conditions) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= ' ORDER BY created_at DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // Cast numeric fields
    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['latitude'] = $row['latitude'] !== null ? (float)$row['latitude'] : null;
        $row['longitude'] = $row['longitude'] !== null ? (float)$row['longitude'] : null;
    }

    jsonResponse(200, ['data' => $rows, 'total' => count($rows)]);
}

// GET /api/umkm.php?id=X — Detail UMKM
function handleGetById($db, $id) {
    $stmt = $db->prepare('SELECT * FROM umkm WHERE id = ?');
    $stmt->execute([(int)$id]);
    $row = $stmt->fetch();

    if (!$row) {
        jsonResponse(404, ['error' => 'UMKM tidak ditemukan.']);
    }

    $row['id'] = (int)$row['id'];
    $row['latitude'] = $row['latitude'] !== null ? (float)$row['latitude'] : null;
    $row['longitude'] = $row['longitude'] !== null ? (float)$row['longitude'] : null;

    jsonResponse(200, ['data' => $row]);
}

// GET /api/umkm.php?action=stats — Statistik
function handleStats($db) {
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN kategori = 'MANDIRI' THEN 1 ELSE 0 END) as mandiri,
            SUM(CASE WHEN kategori = 'INDUK' THEN 1 ELSE 0 END) as induk
        FROM umkm
    ");
    $row = $stmt->fetch();

    jsonResponse(200, [
        'success' => true,
        'data' => [
            'total' => (int)($row['total'] ?? 0),
            'mandiri' => (int)($row['mandiri'] ?? 0),
            'induk' => (int)($row['induk'] ?? 0),
        ],
    ]);
}

// POST /api/umkm.php — Tambah UMKM baru
function handleCreate($db) {
    $kategori = isset($_POST['kategori']) ? trim($_POST['kategori']) : '';
    $nama_produk = isset($_POST['nama_produk']) ? trim($_POST['nama_produk']) : '';
    $deskripsi = isset($_POST['deskripsi']) ? trim($_POST['deskripsi']) : null;
    $harga = isset($_POST['harga']) ? trim($_POST['harga']) : null;
    $alamat = isset($_POST['alamat']) ? trim($_POST['alamat']) : null;
    $kontak = isset($_POST['kontak']) ? trim($_POST['kontak']) : null;
    $keunggulan = isset($_POST['keunggulan']) ? trim($_POST['keunggulan']) : null;
    $latitude = isset($_POST['latitude']) && $_POST['latitude'] !== '' ? $_POST['latitude'] : null;
    $longitude = isset($_POST['longitude']) && $_POST['longitude'] !== '' ? $_POST['longitude'] : null;

    if (empty($kategori) || empty($nama_produk)) {
        jsonResponse(400, ['error' => 'Kategori dan nama produk wajib diisi.']);
    }

    // Validate coordinates
    if ($latitude && $longitude && !isInsideBanyuanyar($latitude, $longitude)) {
        jsonResponse(400, [
            'error' => 'Koordinat di luar wilayah Desa Banyuanyar. Pastikan lokasi berada di sekitar Desa Banyuanyar, Kecamatan Ampel, Boyolali.'
        ]);
    }

    // Handle file upload
    $foto_url = handleFileUpload('foto');

    // Only save keunggulan for INDUK category
    if ($kategori !== 'INDUK') {
        $keunggulan = null;
    }

    $stmt = $db->prepare(
        'INSERT INTO umkm (kategori, nama_produk, deskripsi, harga, alamat, kontak, keunggulan, foto_url, latitude, longitude) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $kategori, $nama_produk, $deskripsi, $harga, $alamat, $kontak,
        $keunggulan, $foto_url, $latitude, $longitude
    ]);

    $newId = $db->lastInsertId();

    // Fetch the created record
    $stmt2 = $db->prepare('SELECT * FROM umkm WHERE id = ?');
    $stmt2->execute([$newId]);
    $created = $stmt2->fetch();
    $created['id'] = (int)$created['id'];
    $created['latitude'] = $created['latitude'] !== null ? (float)$created['latitude'] : null;
    $created['longitude'] = $created['longitude'] !== null ? (float)$created['longitude'] : null;

    jsonResponse(201, [
        'message' => 'UMKM berhasil ditambahkan!',
        'data' => $created,
    ]);
}

// PUT /api/umkm.php?id=X — Update UMKM
function handleUpdate($db, $id) {
    // Check if exists
    $stmt = $db->prepare('SELECT * FROM umkm WHERE id = ?');
    $stmt->execute([(int)$id]);
    $existing = $stmt->fetch();

    if (!$existing) {
        jsonResponse(404, ['error' => 'UMKM tidak ditemukan.']);
    }

    // For PUT with form data, read from $_POST
    $kategori = isset($_POST['kategori']) ? trim($_POST['kategori']) : $existing['kategori'];
    $nama_produk = isset($_POST['nama_produk']) ? trim($_POST['nama_produk']) : $existing['nama_produk'];
    $deskripsi = isset($_POST['deskripsi']) ? trim($_POST['deskripsi']) : $existing['deskripsi'];
    $harga = isset($_POST['harga']) ? trim($_POST['harga']) : $existing['harga'];
    $alamat = isset($_POST['alamat']) ? trim($_POST['alamat']) : $existing['alamat'];
    $kontak = isset($_POST['kontak']) ? trim($_POST['kontak']) : $existing['kontak'];
    $keunggulan = isset($_POST['keunggulan']) ? trim($_POST['keunggulan']) : $existing['keunggulan'];
    $latitude = isset($_POST['latitude']) && $_POST['latitude'] !== '' ? $_POST['latitude'] : $existing['latitude'];
    $longitude = isset($_POST['longitude']) && $_POST['longitude'] !== '' ? $_POST['longitude'] : $existing['longitude'];

    // Validate coordinates
    if ($latitude && $longitude && !isInsideBanyuanyar($latitude, $longitude)) {
        jsonResponse(400, [
            'error' => 'Koordinat di luar wilayah Desa Banyuanyar. Pastikan lokasi berada di sekitar Desa Banyuanyar, Kecamatan Ampel, Boyolali.'
        ]);
    }

    // Handle foto upload
    $foto_url = $existing['foto_url'];
    $newFoto = handleFileUpload('foto');
    if ($newFoto) {
        // Delete old file
        deleteUploadedFile($existing['foto_url']);
        $foto_url = $newFoto;
    }

    $stmt2 = $db->prepare(
        'UPDATE umkm SET 
            kategori = ?, nama_produk = ?, deskripsi = ?, harga = ?, 
            alamat = ?, kontak = ?, keunggulan = ?, foto_url = ?, 
            latitude = ?, longitude = ?
         WHERE id = ?'
    );
    $stmt2->execute([
        $kategori, $nama_produk, $deskripsi, $harga, $alamat, $kontak,
        $keunggulan, $foto_url, $latitude, $longitude, (int)$id
    ]);

    // Fetch updated record
    $stmt3 = $db->prepare('SELECT * FROM umkm WHERE id = ?');
    $stmt3->execute([(int)$id]);
    $updated = $stmt3->fetch();
    $updated['id'] = (int)$updated['id'];
    $updated['latitude'] = $updated['latitude'] !== null ? (float)$updated['latitude'] : null;
    $updated['longitude'] = $updated['longitude'] !== null ? (float)$updated['longitude'] : null;

    jsonResponse(200, [
        'message' => 'UMKM berhasil diperbarui!',
        'data' => $updated,
    ]);
}

// DELETE /api/umkm.php?id=X — Hapus UMKM
function handleDelete($db, $id) {
    // Check if exists
    $stmt = $db->prepare('SELECT * FROM umkm WHERE id = ?');
    $stmt->execute([(int)$id]);
    $existing = $stmt->fetch();

    if (!$existing) {
        jsonResponse(404, ['error' => 'UMKM tidak ditemukan.']);
    }

    // Delete uploaded photo
    deleteUploadedFile($existing['foto_url']);

    // Delete record
    $stmt2 = $db->prepare('DELETE FROM umkm WHERE id = ?');
    $stmt2->execute([(int)$id]);

    jsonResponse(200, ['message' => 'UMKM berhasil dihapus!']);
}
