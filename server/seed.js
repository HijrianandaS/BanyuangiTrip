/* ===================================================
   SEED SCRIPT — Create default admin user
   Run: node server/seed.js
   =================================================== */
const bcrypt = require('bcrypt');
const { pool, testConnection } = require('./config/database');
require('dotenv').config();

async function seed() {
  await testConnection();

  console.log('🌱 Seeding database...\n');

  // 1. Create admin user
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.execute(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password = ?`,
      ['admin', hashedPassword, 'admin', hashedPassword]
    );
    console.log('✅ Admin user created:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   (Ganti password setelah login pertama!)\n');
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  }

  // 2. Seed sample UMKM data
  const sampleData = [
    {
      kategori: 'MANDIRI',
      nama_produk: 'Keripik Pisang Gandasuli',
      deskripsi: 'Keripik pisang renyah dari pisang raja nangka pilihan. Digoreng dengan minyak berkualitas dan diberi bumbu spesial.',
      harga: 'Rp 15.000 - Rp 25.000',
      alamat: 'Dukuh Gandasuli, Desa Banyuanyar',
      kontak: '081234567890',
      keunggulan: null,
      latitude: -7.4300,
      longitude: 110.5900,
    },
    {
      kategori: 'MANDIRI',
      nama_produk: 'Emping Jagung Bu Siti',
      deskripsi: 'Emping jagung renyah buatan rumahan. Cocok untuk camilan sehari-hari maupun oleh-oleh.',
      harga: 'Rp 10.000 - Rp 20.000',
      alamat: 'RT 03 RW 02, Desa Banyuanyar',
      kontak: '082345678901',
      keunggulan: null,
      latitude: -7.4310,
      longitude: 110.5920,
    },
    {
      kategori: 'INDUK',
      nama_produk: 'Kampung Jahe Banyuanyar',
      deskripsi: 'Kampung Jahe Desa Banyuanyar menyediakan berbagai olahan jahe seperti jahe bubuk, wedang jahe, dan permen jahe.',
      harga: 'Rp 20.000 - Rp 50.000',
      alamat: 'Gedung Kampus Kopi Banyuanyar',
      kontak: '083456789012',
      keunggulan: 'Produk jahe organik dari petani lokal, diproses secara higienis dengan standar PIRT.',
      latitude: -7.4290,
      longitude: 110.5880,
    },
    {
      kategori: 'INDUK',
      nama_produk: 'Kampung Budaya Banyuanyar',
      deskripsi: 'Kampung Budaya menampilkan kelompok seni dan budaya Manunggal Laras dengan berbagai kesenian tradisional.',
      harga: 'Gratis - Rp 100.000',
      alamat: 'Gedung Kampus Kopi Banyuanyar',
      kontak: '084567890123',
      keunggulan: 'Pengalaman wisata budaya autentik dengan pertunjukan seni tradisional oleh seniman lokal.',
      latitude: -7.4285,
      longitude: 110.5870,
    },
    {
      kategori: 'MANDIRI',
      nama_produk: 'Kopi Robusta Lereng Merapi',
      deskripsi: 'Kopi robusta pilihan dari perkebunan di lereng Gunung Merapi, area Kecamatan Ampel.',
      harga: 'Rp 30.000 - Rp 60.000',
      alamat: 'RT 01 RW 01, Desa Banyuanyar',
      kontak: '085678901234',
      keunggulan: null,
      latitude: -7.4320,
      longitude: 110.5910,
    },
    {
      kategori: 'MANDIRI',
      nama_produk: 'Anyaman Bambu Pak Joko',
      deskripsi: 'Produk anyaman bambu handmade, tersedia berbagai bentuk seperti keranjang, tampah, dan besek.',
      harga: 'Rp 25.000 - Rp 75.000',
      alamat: 'Dukuh Karanglo, Desa Banyuanyar',
      kontak: '086789012345',
      keunggulan: null,
      latitude: -7.4335,
      longitude: 110.5895,
    },
  ];

  for (const item of sampleData) {
    try {
      await pool.execute(
        `INSERT INTO umkm (kategori, nama_produk, deskripsi, harga, alamat, kontak, keunggulan, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.kategori, item.nama_produk, item.deskripsi, item.harga, item.alamat, item.kontak, item.keunggulan, item.latitude, item.longitude]
      );
      console.log(`✅ UMKM: ${item.nama_produk}`);
    } catch (err) {
      console.error(`❌ Error inserting ${item.nama_produk}:`, err.message);
    }
  }

  console.log('\n🎉 Seeding selesai!');
  process.exit(0);
}

seed();
