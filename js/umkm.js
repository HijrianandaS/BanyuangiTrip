/* ===================================================
   UMKM DATA MODULE — CRUD Operations with localStorage
   =================================================== */

const STORAGE_KEY = 'banyuangi_umkm';

// --- Seed Data ---
const SEED_DATA = [
  {
    id: '1',
    nama: 'Kopi Robusta Banyuwangi',
    harga: 45000,
    deskripsi: 'Kopi robusta premium dari perkebunan di lereng Gunung Ijen, Banyuwangi. Diproses secara alami menghasilkan cita rasa kopi yang khas dengan aroma yang kuat dan rasa yang full body.',
    gambar: 'images/umkm-default.png',
    jenisProduk: 'Minuman',
    keunggulan: 'Biji kopi pilihan dari ketinggian 800mdpl, diproses secara natural dengan pengeringan matahari selama 14 hari.',
    rating: 4.8,
    ulasan: [
      { nama: 'Budi Santoso', rating: 5, teks: 'Kopi terbaik yang pernah saya coba! Aroma dan rasanya luar biasa.', tanggal: '2025-12-01' },
      { nama: 'Siti Rahayu', rating: 5, teks: 'Sangat recommended, rasanya smooth dan tidak terlalu pahit.', tanggal: '2025-11-15' },
      { nama: 'Ahmad Rizki', rating: 4, teks: 'Enak, tapi harganya agak mahal. Overall worth it.', tanggal: '2025-10-20' }
    ],
    lat: -8.2192,
    lng: 114.3691
  },
  {
    id: '2',
    nama: 'Batik Gajah Oling',
    harga: 250000,
    deskripsi: 'Batik khas Banyuwangi dengan motif Gajah Oling yang sudah diakui sebagai warisan budaya. Dibuat dengan teknik tulis tangan menggunakan bahan kain katun berkualitas tinggi.',
    gambar: 'images/umkm-default.png',
    jenisProduk: 'Kerajinan',
    keunggulan: 'Batik tulis tangan asli dengan pewarna alami. Setiap kain memiliki keunikan tersendiri karena dibuat manual.',
    rating: 4.9,
    ulasan: [
      { nama: 'Diana Kusuma', rating: 5, teks: 'Motifnya sangat cantik dan unik, khas Banyuwangi!', tanggal: '2025-11-28' },
      { nama: 'Rudi Hartono', rating: 5, teks: 'Kualitas kainnya premium, nyaman dipakai.', tanggal: '2025-11-10' }
    ],
    lat: -8.2200,
    lng: 114.3520
  },
  {
    id: '3',
    nama: 'Keripik Pisang Gandasuli',
    harga: 25000,
    deskripsi: 'Keripik pisang renyah dari pisang raja nangka pilihan. Digoreng dengan minyak berkualitas dan diberi bumbu spesial yang membuat keripik ini sangat gurih dan renyah.',
    gambar: 'images/umkm-default.png',
    jenisProduk: 'Makanan',
    keunggulan: 'Tanpa bahan pengawet, menggunakan pisang segar lokal. Tersedia varian rasa original, manis, dan pedas.',
    rating: 4.5,
    ulasan: [
      { nama: 'Lina Marlina', rating: 5, teks: 'Renyah banget! Cocok buat oleh-oleh.', tanggal: '2025-12-05' },
      { nama: 'Hendra Wijaya', rating: 4, teks: 'Enak, keripiknya tipis dan crispy. Suka yang rasa pedas!', tanggal: '2025-11-20' }
    ],
    lat: -8.2300,
    lng: 114.3700
  },
  {
    id: '4',
    nama: 'Madu Hutan Banyuwangi',
    harga: 85000,
    deskripsi: 'Madu murni dari hutan lindung Banyuwangi. Dipanen secara alami oleh petani madu lokal dengan metode yang ramah lingkungan dan menjaga kelestarian lebah hutan.',
    gambar: 'images/umkm-default.png',
    jenisProduk: 'Minuman',
    keunggulan: '100% madu murni tanpa campuran gula. Kaya akan antioksidan dan enzim alami untuk kesehatan.',
    rating: 4.7,
    ulasan: [
      { nama: 'Wahyu Pratama', rating: 5, teks: 'Madu asli dan rasanya enak. Beda dengan madu supermarket.', tanggal: '2025-11-25' },
      { nama: 'Rina Susanti', rating: 4, teks: 'Kualitas bagus, packaging rapi. Cocok untuk hadiah.', tanggal: '2025-10-30' }
    ],
    lat: -8.1950,
    lng: 114.3800
  },
  {
    id: '5',
    nama: 'Dodol Osing Tradisional',
    harga: 30000,
    deskripsi: 'Dodol tradisional suku Osing Banyuwangi, dibuat dari tepung ketan, gula kelapa, dan santan. Dimasak selama 8 jam dengan api kecil menghasilkan tekstur yang legit dan kenyal.',
    gambar: 'images/umkm-default.png',
    jenisProduk: 'Makanan',
    keunggulan: 'Resep turun-temurun suku Osing, dimasak secara tradisional selama 8 jam non-stop.',
    rating: 4.6,
    ulasan: [
      { nama: 'Agus Purnomo', rating: 5, teks: 'Dodol terenak! Teksturnya pas, tidak terlalu keras.', tanggal: '2025-12-02' },
      { nama: 'Maria Theresia', rating: 4, teks: 'Rasanya otentik, khas banget. Beli 3 bungkus langsung!', tanggal: '2025-11-18' }
    ],
    lat: -8.2100,
    lng: 114.3600
  },
  {
    id: '6',
    nama: 'Anyaman Bambu Banyuwangi',
    harga: 75000,
    deskripsi: 'Produk anyaman bambu handmade dari pengrajin lokal. Tersedia dalam berbagai bentuk seperti tas, keranjang, dan hiasan dinding dengan motif khas Banyuwangi.',
    gambar: 'images/umkm-default.png',
    jenisProduk: 'Kerajinan',
    keunggulan: 'Dibuat 100% tangan oleh pengrajin berpengalaman. Material bambu berkualitas, tahan lama dan ramah lingkungan.',
    rating: 4.4,
    ulasan: [
      { nama: 'Dewi Anggraeni', rating: 5, teks: 'Kerajinannya bagus dan rapi. Cocok buat dekorasi rumah.', tanggal: '2025-11-30' },
      { nama: 'Joko Susilo', rating: 4, teks: 'Kualitas anyamannya rapat dan kuat. Mantap!', tanggal: '2025-10-25' }
    ],
    lat: -8.2350,
    lng: 114.3550
  }
];

// --- Initialize Data ---
function initUmkmData() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
  }
}

// --- CRUD Functions ---
function getUmkmList() {
  initUmkmData();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function getUmkmById(id) {
  const list = getUmkmList();
  return list.find(item => item.id === id) || null;
}

function createUmkm(data) {
  const list = getUmkmList();
  const newItem = {
    ...data,
    id: Date.now().toString(),
    rating: 0,
    ulasan: []
  };
  list.push(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return newItem;
}

function updateUmkm(id, data) {
  const list = getUmkmList();
  const index = list.findIndex(item => item.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list[index];
}

function deleteUmkm(id) {
  let list = getUmkmList();
  list = list.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return true;
}

function addReview(umkmId, review) {
  const list = getUmkmList();
  const item = list.find(i => i.id === umkmId);
  if (!item) return null;

  const newReview = {
    ...review,
    tanggal: new Date().toISOString().split('T')[0]
  };
  item.ulasan.push(newReview);

  // Recalculate average rating
  const totalRating = item.ulasan.reduce((sum, r) => sum + r.rating, 0);
  item.rating = Math.round((totalRating / item.ulasan.length) * 10) / 10;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return item;
}

// --- Render Helpers ---
function formatPrice(price) {
  return 'Rp ' + price.toLocaleString('id-ID');
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function renderUmkmCard(item) {
  return `
    <div class="card umkm-card fade-in" data-id="${item.id}">
      <div class="card-img-wrapper">
        <img src="${item.gambar}" alt="${item.nama}" class="card-img" onerror="this.src='images/umkm-default.png'">
      </div>
      <div class="card-body">
        <span class="umkm-badge">${item.jenisProduk}</span>
        <h3 class="card-title">${item.nama}</h3>
        <p class="umkm-price">${formatPrice(item.harga)}</p>
        <p class="card-text">${item.deskripsi}</p>
        <div class="card-meta">
          <div class="umkm-rating">
            <span class="stars">${renderStars(item.rating)}</span>
            <span class="rating-value">${item.rating}</span>
            <span class="rating-count">(${item.ulasan.length} ulasan)</span>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <a href="umkm-detail.html?id=${item.id}" class="card-link">Lihat Detail →</a>
      </div>
    </div>
  `;
}

function renderUmkmCards(containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let items = getUmkmList();
  if (limit) items = items.slice(0, limit);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="icon">📦</div>
        <h3>Belum Ada UMKM</h3>
        <p>Data UMKM belum tersedia. Tambahkan UMKM baru!</p>
        <a href="umkm-form.html" class="btn btn-primary" style="margin-top: 16px;">+ Tambah UMKM</a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(renderUmkmCard).join('');
}

// --- Search & Filter ---
function filterUmkm(keyword, jenis) {
  let items = getUmkmList();

  if (keyword) {
    const kw = keyword.toLowerCase();
    items = items.filter(i =>
      i.nama.toLowerCase().includes(kw) ||
      i.deskripsi.toLowerCase().includes(kw) ||
      i.jenisProduk.toLowerCase().includes(kw)
    );
  }

  if (jenis && jenis !== 'Semua') {
    items = items.filter(i => i.jenisProduk === jenis);
  }

  return items;
}

function getJenisProdukList() {
  const items = getUmkmList();
  const jenis = [...new Set(items.map(i => i.jenisProduk))];
  return ['Semua', ...jenis];
}
