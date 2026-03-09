# 🌿 Banyuangi Trip

Portal wisata dan UMKM desa Banyuwangi — menampilkan keindahan alam, budaya, dan produk lokal berkualitas.

![Hero](images/hero-bg.png)

## ✨ Fitur

- **Peta Interaktif** — Leaflet.js map dengan marker lokasi UMKM
- **UMKM CRUD** — Tambah, lihat, edit, dan hapus data UMKM
- **Rating & Ulasan** — Sistem review untuk setiap produk UMKM
- **Pencarian & Filter** — Cari produk berdasarkan nama atau kategori
- **Responsive Design** — Tampilan optimal di desktop, tablet, dan mobile

## 🚀 Cara Menjalankan

### Prasyarat

- [Node.js](https://nodejs.org/) (versi 14 atau lebih baru) — untuk menjalankan local server
- Browser modern (Chrome, Firefox, Edge)

### Langkah-langkah

1. **Clone repository**

   ```bash
   git clone https://github.com/USERNAME/BanyuangiTrip.git
   cd BanyuangiTrip
   ```

2. **Jalankan local server**

   Menggunakan `http-server` (tidak perlu install, langsung pakai `npx`):

   ```bash
   npx -y http-server . -p 8080 -c-1
   ```

3. **Buka di browser**

   Buka alamat berikut di browser:

   ```
   http://localhost:8080
   ```

   Selesai! 🎉

### Alternatif Tanpa Node.js

Jika tidak ingin menginstall Node.js, bisa menggunakan cara lain:

**Opsi A — VS Code Live Server:**
1. Install extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) di VS Code
2. Klik kanan file `index.html` → **Open with Live Server**

**Opsi B — Python:**
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**Opsi C — Buka langsung:**
- Double-click file `index.html` di file explorer
- ⚠️ Fitur peta mungkin tidak berfungsi karena CORS policy

## 📁 Struktur Project

```
BanyuangiTrip/
├── index.html          # Halaman utama (landing page)
├── umkm.html           # Daftar semua UMKM
├── umkm-detail.html    # Detail produk UMKM
├── umkm-form.html      # Form tambah/edit UMKM
├── peta.html           # Peta interaktif full page
├── css/
│   ├── style.css       # Design system & global styles
│   └── responsive.css  # Media queries responsive
├── js/
│   ├── app.js          # Navbar, animasi, toast notification
│   ├── umkm.js         # CRUD operations & localStorage
│   ├── map.js          # Leaflet.js map integration
│   └── review.js       # Sistem rating & ulasan
└── images/
    ├── hero-bg.png     # Background hero section
    └── umkm-default.png # Placeholder gambar UMKM
```

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| HTML/CSS/JS | Core frontend |
| [Leaflet.js](https://leafletjs.com/) | Peta interaktif (via CDN) |
| [Inter Font](https://fonts.google.com/specimen/Inter) | Typography (via Google Fonts) |
| localStorage | Penyimpanan data UMKM |

## 📝 Catatan

- Data UMKM disimpan di **localStorage** browser, artinya data hanya ada di browser masing-masing pengguna
- Saat pertama kali dibuka, aplikasi akan memuat **6 data UMKM contoh** secara otomatis
- Tidak memerlukan database atau backend

## 📄 Lisensi

MIT License
