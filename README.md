# 🌿 Desa Banyuanyar

Sistem Informasi Peta Digital UMKM Desa Banyuanyar, Kecamatan Ampel, Kabupaten Boyolali.

Website ini menampilkan peta interaktif lokasi UMKM serta panel admin untuk mengelola data UMKM desa.

## ✨ Fitur

- **Peta Interaktif (GIS)** — Leaflet.js map dengan marker lokasi UMKM dan popup info
- **Katalog UMKM** — Daftar UMKM dengan kategori Mandiri & Induk
- **Detail UMKM** — Halaman detail lengkap setiap UMKM
- **Panel Admin** — Login, dashboard statistik, dan CRUD data UMKM
- **Upload Gambar** — Upload foto produk via admin panel
- **Pencarian & Filter** — Cari produk berdasarkan nama atau kategori
- **Responsive Design** — Tampilan optimal di desktop, tablet, dan mobile

## 🚀 Cara Menjalankan

### Prasyarat

- [Node.js](https://nodejs.org/) versi 14+
- [XAMPP](https://www.apachefriends.org/) (MySQL)
- Browser modern (Chrome, Firefox, Edge)

### Langkah-langkah

1. **Clone repository**

   ```bash
   git clone https://github.com/USERNAME/BanyuangiTrip.git
   cd BanyuangiTrip
   ```

2. **Buat database MySQL**

   - Buka **phpMyAdmin** (`http://localhost/phpmyadmin`)
   - Buat database baru: `banyuanyar_trip`
   - Import file `database.sql` atau jalankan query berikut:

   ```sql
   CREATE DATABASE IF NOT EXISTS banyuanyar_trip;
   USE banyuanyar_trip;

   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(50) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       role VARCHAR(20) DEFAULT 'admin',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE umkm (
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
   );
   ```

3. **Konfigurasi environment**

   Buat file `.env` di root project (atau edit yang sudah ada):

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=banyuanyar_trip
   JWT_SECRET=ganti_dengan_string_acak_yang_panjang
   JWT_EXPIRES_IN=24h
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Seed data awal** (admin user + 6 sample UMKM)

   ```bash
   node server/seed.js
   ```

   Ini akan membuat akun admin default:
   - **Username:** `admin`
   - **Password:** `admin123`

6. **Jalankan server**

   ```bash
   npm start
   ```

7. **Buka di browser**

   | Halaman | URL |
   |---------|-----|
   | 🌐 Website | http://localhost:3000 |
   | 📋 Daftar UMKM | http://localhost:3000/umkm.html |
   | 📍 Peta | http://localhost:3000/peta.html |
   | 🔐 Admin Login | http://localhost:3000/admin/login.html |

## 📁 Struktur Project

```
BanyuangiTrip/
├── index.html                 # Halaman utama (landing page)
├── umkm.html                  # Daftar semua UMKM
├── umkm-detail.html           # Detail produk UMKM
├── peta.html                  # Peta interaktif full page
├── database.sql               # SQL schema
├── package.json               # Dependencies Node.js
├── .env                       # Config (DB, JWT) — jangan commit!
│
├── admin/                     # Panel Admin
│   ├── login.html             # Halaman login
│   ├── dashboard.html         # Dashboard statistik + tabel
│   └── manage-umkm.html       # Form tambah/edit UMKM
│
├── server/                    # Backend (Express.js)
│   ├── index.js               # Entry point server
│   ├── seed.js                # Seed data awal
│   ├── config/
│   │   └── database.js        # Koneksi MySQL pool
│   ├── routes/
│   │   ├── auth.js            # API login (JWT)
│   │   └── umkm.js            # API CRUD UMKM
│   ├── middleware/
│   │   └── auth.js            # JWT auth middleware
│   └── uploads/               # Folder gambar upload
│
├── css/
│   ├── style.css              # Design system & global styles
│   └── responsive.css         # Media queries responsive
│
├── js/
│   ├── api.js                 # API client helper (fetch)
│   └── app.js                 # Navbar, animasi, toast
│
└── images/
    ├── hero-bg.png            # Background hero section
    └── umkm-default.png       # Placeholder gambar UMKM
```

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| HTML / CSS / JS | Frontend |
| [Express.js](https://expressjs.com/) | Backend web framework |
| [MySQL](https://www.mysql.com/) (via XAMPP) | Database relasional |
| [Leaflet.js](https://leafletjs.com/) | Peta interaktif (CDN) |
| [JWT](https://jwt.io/) | Autentikasi admin |
| [Multer](https://github.com/expressjs/multer) | Upload gambar |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Hash password |
| [Inter Font](https://fonts.google.com/specimen/Inter) | Typography (Google Fonts) |

## 📡 API Endpoints

### Public (tanpa login)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `GET` | `/api/umkm` | Ambil semua UMKM (query: `?kategori=MANDIRI&search=kopi`) |
| `GET` | `/api/umkm/:id` | Detail UMKM per ID |
| `GET` | `/api/umkm/stats/summary` | Statistik (total, mandiri, induk) |

### Admin (perlu Bearer token)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `POST` | `/api/auth/login` | Login admin → dapat JWT token |
| `GET` | `/api/auth/me` | Info user yang sedang login |
| `POST` | `/api/umkm` | Tambah UMKM baru (multipart/form-data) |
| `PUT` | `/api/umkm/:id` | Edit UMKM |
| `DELETE` | `/api/umkm/:id` | Hapus UMKM |

## 📝 Catatan

- Data UMKM disimpan di **database MySQL**, bisa diakses dari mana saja selama server jalan
- File `.env` berisi kredensial — **jangan di-commit ke GitHub** (sudah ada di `.gitignore`)
- Default admin: `admin` / `admin123` — segera ganti setelah deploy
- Gambar yang diupload disimpan di folder `server/uploads/`

## 📄 Lisensi

MIT License
