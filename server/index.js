/* ===================================================
   EXPRESS SERVER — Entry Point
   Desa Banyuanyar — Sistem Informasi Peta Digital UMKM
   =================================================== */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const umkmRoutes = require('./routes/umkm');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static Files ---
// Serve frontend files (index.html, css/, js/, images/, admin/)
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/umkm', umkmRoutes);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Desa Banyuanyar', timestamp: new Date().toISOString() });
});

// --- Error handling for multer ---
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Ukuran file terlalu besar. Maksimal 5MB.' });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  console.error('Server error:', err);
  res.status(500).json({ error: 'Terjadi kesalahan server.' });
});

// --- Start Server ---
async function start() {
  await testConnection();

  app.listen(PORT, () => {
    console.log('');
    console.log('🌿 =============================================');
    console.log('   Desa Banyuanyar — Server Running');
    console.log('   =============================================');
    console.log(`   🌐 Frontend : http://localhost:${PORT}`);
    console.log(`   📡 API      : http://localhost:${PORT}/api`);
    console.log(`   🔐 Admin    : http://localhost:${PORT}/admin/login.html`);
    console.log('   =============================================');
    console.log('');
  });
}

start();
