<?php
/* ===================================================
   SEED SCRIPT — Create admin user + UMKM data
   Desa Banyuanyar — Sistem Informasi Peta Digital UMKM
   
   Jalankan sekali via browser: https://domain.com/seed.php
   HAPUS FILE INI SETELAH SEEDING SELESAI!
   =================================================== */

// Simple protection: only allow from browser (not bots)
if (php_sapi_name() === 'cli') {
    echo "Jalankan via browser!\n";
    exit;
}

require_once __DIR__ . '/api/config.php';

echo "<!DOCTYPE html><html><head><title>Seed Database</title>
<style>body{font-family:monospace;max-width:700px;margin:40px auto;padding:20px;background:#1a1a2e;color:#e0e0e0;}
h1{color:#4ade80;}h2{color:#60a5fa;margin-top:24px;}.ok{color:#4ade80;}.err{color:#ef4444;}.warn{color:#fbbf24;}
pre{background:#0d1117;padding:16px;border-radius:8px;overflow-x:auto;}</style></head><body>";
echo "<h1>🌱 Seed Database — Desa Banyuanyar</h1>";
echo "<p>Memulai proses seeding...</p><hr>";

try {
    $db = getDB();

    // =============================================
    // 1. CREATE TABLES (if not exist)
    // =============================================
    echo "<h2>📋 Step 1: Membuat tabel...</h2>";

    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "<p class='ok'>✅ Tabel 'users' siap.</p>";

    $db->exec("
        CREATE TABLE IF NOT EXISTS umkm (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kategori ENUM('MANDIRI', 'INDUK') NOT NULL,
            nama_produk VARCHAR(255) NOT NULL,
            deskripsi TEXT,
            harga VARCHAR(100),
            alamat VARCHAR(500),
            kontak VARCHAR(50),
            keunggulan TEXT,
            foto_url VARCHAR(500),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "<p class='ok'>✅ Tabel 'umkm' siap.</p>";

    // =============================================
    // 2. CREATE ADMIN USER
    // =============================================
    echo "<h2>👤 Step 2: Membuat admin user...</h2>";

    $stmt = $db->prepare('SELECT COUNT(*) as count FROM users');
    $stmt->execute();
    $result = $stmt->fetch();

    if ($result['count'] == 0) {
        $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);
        $stmt = $db->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        $stmt->execute(['admin', $hashedPassword, 'admin']);
        echo "<p class='ok'>✅ Admin user dibuat!</p>";
        echo "<pre>Username: admin\nPassword: admin123\n⚠️ Ganti password setelah login pertama!</pre>";
    } else {
        echo "<p class='warn'>⚠️ Admin user sudah ada, skip.</p>";
    }

    // =============================================
    // 3. SEED UMKM DATA (dari spreadsheet)
    // =============================================
    echo "<h2>🏪 Step 3: Memasukkan data UMKM...</h2>";

    // Check if UMKM data already exists
    $stmt = $db->prepare('SELECT COUNT(*) as count FROM umkm');
    $stmt->execute();
    $umkmCount = $stmt->fetch();

    if ($umkmCount['count'] > 0) {
        echo "<p class='warn'>⚠️ Data UMKM sudah ada ({$umkmCount['count']} records). Skip seeding untuk menghindari duplikat.</p>";
        echo "<p>Jika ingin re-seed, kosongkan tabel UMKM terlebih dahulu via phpMyAdmin.</p>";
    } else {

        // Data dari spreadsheet Google Sheets — Dusun Jumbleng
        $umkmData = [
            [
                'kategori' => 'MANDIRI',
                'nama_produk' => 'Toko Kelontong Bu Yayah',
                'deskripsi' => 'Toko kelontong yang berdiri sejak tahun 2008. Selain menyediakan kebutuhan sehari-hari, toko ini juga menjual bensin eceran dan berbagai kebutuhan rumah tangga lainnya serta melayani fotokopi.',
                'harga' => 'Menyesuaikan produk',
                'alamat' => 'RT 05/RW 05, Jumbleng',
                'kontak' => '-',
                'keunggulan' => 'Menyediakan kebutuhan sehari-hari',
                'latitude' => -7.486208,
                'longitude' => 110.553355,
            ],
            [
                'kategori' => 'MANDIRI',
                'nama_produk' => 'Sego Jagung dan Tempura "Nana"',
                'deskripsi' => 'Usaha rumahan yang menyediakan sego jagung, tempura, dan siomay dengan harga terjangkau. Buka pada pagi hingga siang hari dan melayani pemesanan harian.',
                'harga' => 'Rp500 - Rp3.000',
                'alamat' => 'RT 05/RW 05, Jumbleng',
                'kontak' => '08155311804 (Ayu Erna Sari)',
                'keunggulan' => 'Jajanan anak dengan harga terjangkau',
                'latitude' => -7.486375,
                'longitude' => 110.551103,
            ],
            [
                'kategori' => 'INDUK',
                'nama_produk' => 'Omah Jahe "Oveje"',
                'deskripsi' => 'Usaha yang mulai dirintis pada tahun 2013 oleh Kelompok Tani Sumber Ageng 1. Penjualan dipasarkan secara langsung ke masyarakat maupun daring ke berbagai daerah.',
                'harga' => 'Rp20.000 - Rp120.000',
                'alamat' => 'RT 05/RW 05, Jumbleng',
                'kontak' => '085642336697 (Bu Sumarni)',
                'keunggulan' => 'Produk herbal tradisional',
                'latitude' => -7.486125,
                'longitude' => 110.550938,
            ],
            [
                'kategori' => 'INDUK',
                'nama_produk' => 'Omah Kopi Barendo',
                'deskripsi' => 'Usaha Kedai Barendo mulai dirintis pada tahun 2022–2023 dan telah berjalan sekitar 3 tahun. Produksi kopi biasanya dilakukan pada bulan Agustus hingga September. Pengolahan kopi dilakukan mulai dari biji mentah, roasting dan grinding kopi, hingga siap konsumsi. Produk yang dijual antara lain kopi Barendo kemasan 1 ons seharga Rp15.000 dan kopi 1 kg yang belum diblender seharga Rp140.000.',
                'harga' => 'Rp15.000 - Rp150.000',
                'alamat' => 'RT 05/RW 05, Jumbleng',
                'kontak' => '082243671448 (Pak Widodo)',
                'keunggulan' => 'Menyediakan kopi asli yang memiliki cita rasa khas',
                'latitude' => -7.486115,
                'longitude' => 110.550644,
            ],
            [
                'kategori' => 'MANDIRI',
                'nama_produk' => 'Penjual Sayur',
                'deskripsi' => 'Menyediakan berbagai jenis sayuran segar yang diambil langsung dari Cepogo untuk memenuhi kebutuhan masyarakat sekitar.',
                'harga' => 'Menyesuaikan jenis sayur',
                'alamat' => 'RT 05/RW 05, Jumbleng',
                'kontak' => '-',
                'keunggulan' => 'Sayuran segar langsung dari Cepogo',
                'latitude' => -7.486218,
                'longitude' => 110.550846,
            ],
            [
                'kategori' => 'MANDIRI',
                'nama_produk' => 'Service Point (Bengkel)',
                'deskripsi' => 'Bengkel yang berdiri sejak tahun 2010 dan melayani berbagai servis kendaraan seperti servis mesin matic, penggantian suku cadang, engine diagnostic tuning, injector cleaner calibration, smart key, dan lain-lain.',
                'harga' => 'Mulai dari Rp10.000',
                'alamat' => 'RT 05/RW 05, Jumbleng',
                'kontak' => '085876403105 (Bapak Gatot)',
                'keunggulan' => 'Layanan servis kendaraan lengkap',
                'latitude' => -7.48635,
                'longitude' => 110.553188,
            ],
            [
                'kategori' => 'INDUK',
                'nama_produk' => 'Omah Pupuk Organik',
                'deskripsi' => 'Usaha penjualan pupuk berbahan dasar kotoran sapi dan bebek yang mulai dirintis sejak tahun 2005. Produksi dilakukan setiap bulan dan distribusi dilakukan ke berbagai daerah seperti Temanggung, Wonosobo, Magelang, dan Purwodadi.',
                'harga' => 'Rp35.000 - Rp40.000/karung',
                'alamat' => 'RT 05/RW 05, Jumbleng',
                'kontak' => '081395990071 (Pak Sulis)',
                'keunggulan' => 'Produksi rutin dan telah didistribusikan ke berbagai daerah',
                'latitude' => -7.486576,
                'longitude' => 110.553365,
            ],
            [
                'kategori' => 'MANDIRI',
                'nama_produk' => 'Bengkel Revaz Tech',
                'deskripsi' => 'Bengkel yang menyediakan berbagai layanan perawatan dan perbaikan kendaraan, seperti tambal ban, penggantian oli, tune up, bore up, overhaul, dan layanan servis lainnya.',
                'harga' => 'Mulai dari Rp10.000',
                'alamat' => 'RT 04/RW 05, Jumbleng',
                'kontak' => '085712720079 (Pak Suyadi)',
                'keunggulan' => 'Layanan servis kendaraan lengkap',
                'latitude' => -7.48635,
                'longitude' => 110.554595,
            ],
        ];

        $insertStmt = $db->prepare(
            'INSERT INTO umkm (kategori, nama_produk, deskripsi, harga, alamat, kontak, keunggulan, latitude, longitude) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $successCount = 0;
        foreach ($umkmData as $item) {
            try {
                $insertStmt->execute([
                    $item['kategori'],
                    $item['nama_produk'],
                    $item['deskripsi'],
                    $item['harga'],
                    $item['alamat'],
                    $item['kontak'],
                    $item['keunggulan'],
                    $item['latitude'],
                    $item['longitude'],
                ]);
                echo "<p class='ok'>✅ {$item['nama_produk']}</p>";
                $successCount++;
            } catch (Exception $e) {
                echo "<p class='err'>❌ {$item['nama_produk']}: {$e->getMessage()}</p>";
            }
        }

        echo "<p><strong>{$successCount} dari " . count($umkmData) . " UMKM berhasil ditambahkan.</strong></p>";
    }

    // =============================================
    // DONE
    // =============================================
    echo "<hr>";
    echo "<h2 class='ok'>🎉 Seeding selesai!</h2>";
    echo "<p class='warn'>⚠️ <strong>PENTING:</strong> Hapus file seed.php ini setelah selesai, atau uncomment baris proteksi di .htaccess!</p>";
    echo "<p><a href='index.html' style='color:#60a5fa;'>← Kembali ke Website</a> | <a href='admin/login.html' style='color:#60a5fa;'>🔐 Login Admin</a></p>";

} catch (Exception $e) {
    echo "<p class='err'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Pastikan konfigurasi database di <code>api/config.php</code> sudah benar.</p>";
}

echo "</body></html>";
