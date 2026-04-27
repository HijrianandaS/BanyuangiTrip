/* ===================================================
   UMKM ROUTES — CRUD API Endpoints
   =================================================== */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// --- Multer config for image upload ---
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

const upload = multer({
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

    // Build foto_url from uploaded file
    let foto_url = null;
    if (req.file) {
      foto_url = '/uploads/' + req.file.filename;
    }

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

    // Handle foto
    let foto_url = existing[0].foto_url;
    if (req.file) {
      // Delete old file if exists
      if (existing[0].foto_url) {
        const oldPath = path.join(__dirname, '..', existing[0].foto_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      foto_url = '/uploads/' + req.file.filename;
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

    // Delete uploaded foto
    if (existing[0].foto_url) {
      const fotoPath = path.join(__dirname, '..', existing[0].foto_url);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    await pool.execute('DELETE FROM umkm WHERE id = ?', [id]);

    res.json({ message: 'UMKM berhasil dihapus!' });
  } catch (err) {
    console.error('Delete UMKM error:', err);
    res.status(500).json({ error: 'Gagal menghapus UMKM.' });
  }
});

// GET /api/stats — Dashboard statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM umkm');
    const [mandiri] = await pool.execute("SELECT COUNT(*) as count FROM umkm WHERE kategori = 'MANDIRI'");
    const [induk] = await pool.execute("SELECT COUNT(*) as count FROM umkm WHERE kategori = 'INDUK'");

    res.json({
      total_umkm: total[0].count,
      total_mandiri: mandiri[0].count,
      total_induk: induk[0].count,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Gagal mengambil statistik.' });
  }
});

module.exports = router;
