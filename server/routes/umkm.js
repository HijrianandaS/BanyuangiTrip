/* ===================================================
   UMKM ROUTES — CRUD API Endpoints
   Uses Cloudinary for image uploads in production,
   falls back to local disk storage in development.
   =================================================== */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// --- Batas Wilayah Desa Banyuanyar, Kecamatan Ampel, Boyolali ---
// Bounding box ~3km radius dari pusat desa
const BANYUANYAR_BOUNDS = {
  latMin: -7.4550,   // Batas selatan
  latMax: -7.4050,   // Batas utara
  lngMin: 110.5650,  // Batas barat
  lngMax: 110.6150,  // Batas timur
};

function isInsideBanyuanyar(lat, lng) {
  if (lat === null || lng === null || lat === undefined || lng === undefined) return true; // Koordinat opsional
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) return true; // Biarkan lolos jika bukan angka valid
  return (
    latNum >= BANYUANYAR_BOUNDS.latMin &&
    latNum <= BANYUANYAR_BOUNDS.latMax &&
    lngNum >= BANYUANYAR_BOUNDS.lngMin &&
    lngNum <= BANYUANYAR_BOUNDS.lngMax
  );
}

// --- Upload config: Cloudinary (production) or disk (local dev) ---
let upload;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  // Production: use Cloudinary
  const { cloudinary, storage } = require('../config/cloudinary');
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('📷 Upload mode: Cloudinary');
} else {
  // Local dev: use disk storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueName + ext);
    },
  });

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|gif|webp/;
      const ext = allowed.test(path.extname(file.originalname).toLowerCase());
      const mime = allowed.test(file.mimetype);
      if (ext && mime) {
        cb(null, true);
      } else {
        cb(new Error('Hanya file gambar (jpg, png, gif, webp) yang diizinkan.'));
      }
    },
  });
  console.log('📷 Upload mode: Local disk');
}

// Helper: get foto URL from uploaded file
function getFotoUrl(file) {
  if (!file) return null;
  // Cloudinary returns full URL in file.path
  if (file.path && file.path.startsWith('http')) {
    return file.path;
  }
  // Local disk: return relative path
  return '/uploads/' + file.filename;
}

// Helper: delete image (Cloudinary or local)
async function deleteImage(fotoUrl) {
  if (!fotoUrl) return;

  if (fotoUrl.startsWith('http') && fotoUrl.includes('cloudinary')) {
    // Delete from Cloudinary
    try {
      const { cloudinary } = require('../config/cloudinary');
      // Extract public_id from Cloudinary URL
      const parts = fotoUrl.split('/');
      const folderAndFile = parts.slice(-2).join('/'); // e.g. "banyuanyar-umkm/abc123"
      const publicId = folderAndFile.replace(/\.[^/.]+$/, ''); // remove extension
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Failed to delete from Cloudinary:', err.message);
    }
  } else {
    // Delete from local disk
    const filePath = path.join(__dirname, '..', fotoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// =============================================
// PUBLIC ROUTES (tanpa auth)
// =============================================

// GET /api/umkm — Ambil semua UMKM
router.get('/', async (req, res) => {
  try {
    const { kategori, search } = req.query;

    let sql = 'SELECT * FROM umkm';
    const params = [];
    const conditions = [];

    if (kategori && kategori !== 'Semua') {
      conditions.push('kategori = ?');
      params.push(kategori);
    }

    if (search) {
      conditions.push('(nama_produk LIKE ? OR deskripsi LIKE ? OR alamat LIKE ?)');
      const kw = `%${search}%`;
      params.push(kw, kw, kw);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql, params);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error('Get UMKM error:', err);
    res.status(500).json({ error: 'Gagal mengambil data UMKM.' });
  }
});

// GET /api/umkm/:id — Detail UMKM
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'UMKM tidak ditemukan.' });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('Get UMKM detail error:', err);
    res.status(500).json({ error: 'Gagal mengambil detail UMKM.' });
  }
});

// =============================================
// ADMIN ROUTES (perlu auth)
// =============================================

// POST /api/umkm — Tambah UMKM baru
router.post('/', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const { kategori, nama_produk, deskripsi, harga, alamat, kontak, keunggulan, latitude, longitude } = req.body;

    if (!kategori || !nama_produk) {
      return res.status(400).json({ error: 'Kategori dan nama produk wajib diisi.' });
    }

    // Validasi koordinat harus di wilayah Banyuanyar
    if (latitude && longitude && !isInsideBanyuanyar(latitude, longitude)) {
      return res.status(400).json({ 
        error: 'Koordinat di luar wilayah Desa Banyuanyar. Pastikan lokasi berada di sekitar Desa Banyuanyar, Kecamatan Ampel, Boyolali.' 
      });
    }

    const foto_url = getFotoUrl(req.file);

    const [result] = await pool.execute(
      `INSERT INTO umkm (kategori, nama_produk, deskripsi, harga, alamat, kontak, keunggulan, foto_url, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kategori,
        nama_produk,
        deskripsi || null,
        harga || null,
        alamat || null,
        kontak || null,
        kategori === 'INDUK' ? (keunggulan || null) : null,
        foto_url,
        latitude || null,
        longitude || null,
      ]
    );

    // Fetch the created record
    const [rows] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'UMKM berhasil ditambahkan!',
      data: rows[0],
    });
  } catch (err) {
    console.error('Create UMKM error:', err);
    res.status(500).json({ error: 'Gagal menambahkan UMKM.' });
  }
});

// PUT /api/umkm/:id — Update UMKM
router.put('/:id', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori, nama_produk, deskripsi, harga, alamat, kontak, keunggulan, latitude, longitude } = req.body;

    // Check if exists
    const [existing] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'UMKM tidak ditemukan.' });
    }

    // Validasi koordinat harus di wilayah Banyuanyar
    if (latitude && longitude && !isInsideBanyuanyar(latitude, longitude)) {
      return res.status(400).json({ 
        error: 'Koordinat di luar wilayah Desa Banyuanyar. Pastikan lokasi berada di sekitar Desa Banyuanyar, Kecamatan Ampel, Boyolali.' 
      });
    }

    // Handle foto
    let foto_url = existing[0].foto_url;
    if (req.file) {
      // Delete old image
      await deleteImage(existing[0].foto_url);
      foto_url = getFotoUrl(req.file);
    }

    await pool.execute(
      `UPDATE umkm SET 
        kategori = ?, nama_produk = ?, deskripsi = ?, harga = ?, 
        alamat = ?, kontak = ?, keunggulan = ?, foto_url = ?, 
        latitude = ?, longitude = ?
       WHERE id = ?`,
      [
        kategori || existing[0].kategori,
        nama_produk || existing[0].nama_produk,
        deskripsi !== undefined ? deskripsi : existing[0].deskripsi,
        harga !== undefined ? harga : existing[0].harga,
        alamat !== undefined ? alamat : existing[0].alamat,
        kontak !== undefined ? kontak : existing[0].kontak,
        keunggulan !== undefined ? keunggulan : existing[0].keunggulan,
        foto_url,
        latitude || existing[0].latitude,
        longitude || existing[0].longitude,
        id,
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [id]);

    res.json({
      message: 'UMKM berhasil diperbarui!',
      data: updated[0],
    });
  } catch (err) {
    console.error('Update UMKM error:', err);
    res.status(500).json({ error: 'Gagal memperbarui UMKM.' });
  }
});

// DELETE /api/umkm/:id — Hapus UMKM
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exists & get foto to delete
    const [existing] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'UMKM tidak ditemukan.' });
    }

    // Delete uploaded foto (Cloudinary or local)
    await deleteImage(existing[0].foto_url);

    await pool.execute('DELETE FROM umkm WHERE id = ?', [id]);

    res.json({ message: 'UMKM berhasil dihapus!' });
  } catch (err) {
    console.error('Delete UMKM error:', err);
    res.status(500).json({ error: 'Gagal menghapus UMKM.' });
  }
});


// File: server/routes/umkm.js
router.get('/stats/summary', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN kategori = 'MANDIRI' THEN 1 ELSE 0 END) as mandiri,
        SUM(CASE WHEN kategori = 'INDUK' THEN 1 ELSE 0 END) as induk
      FROM umkm
    `);

    res.json({
      success: true, // Tambahkan ini
      data: {        // Bungkus dalam data agar seragam dengan API lainnya
        total: parseInt(rows[0].total) || 0,
        mandiri: parseInt(rows[0].mandiri) || 0,
        induk: parseInt(rows[0].induk) || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Gagal ambil statistik' });
  }
});

module.exports = router;
