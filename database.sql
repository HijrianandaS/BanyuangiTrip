-- =============================================
-- DATABASE: banyuanyar_trip
-- Sistem Informasi Peta Digital UMKM Desa Banyuanyar
-- =============================================

CREATE DATABASE IF NOT EXISTS banyuanyar_trip;
USE banyuanyar_trip;

-- Tabel Users (Admin)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel UMKM (Data Peta & Produk)
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
);
