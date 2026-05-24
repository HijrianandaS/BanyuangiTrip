/* ===================================================
   API CLIENT — Helper untuk fetch ke backend PHP API
   Desa Banyuanyar — Shared Hosting Version
   =================================================== */

// Base URL: auto-detect subfolder
// Production (root domain): API_BASE = "/api"
// XAMPP lokal (/banyuanyar/): API_BASE = "/banyuanyar/api"
const API_BASE = (() => {
  // Cari <base> tag atau deteksi dari path halaman saat ini
  const path = window.location.pathname;
  // Cari folder project dari URL (misal /banyuanyar/index.html → /banyuanyar)
  // Ini bekerja karena semua halaman ada di root project
  const htmlFile = path.match(/\/[^\/]*\.html$/);
  const basePath = htmlFile ? path.substring(0, path.lastIndexOf('/')) : path.replace(/\/$/, '');
  // Jika kita di subfolder admin (misal /banyuanyar/admin/), naik 1 level
  const adminMatch = basePath.match(/^(.*)\/admin$/);
  const projectBase = adminMatch ? adminMatch[1] : basePath;
  return projectBase + '/api';
})();

// --- Generic fetch wrapper ---
async function apiFetch(endpoint, options = {}) {
  const url = API_BASE + endpoint;

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  const headers = options.headers || {};
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Terjadi kesalahan.');
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// --- UMKM API Functions ---
async function apiGetUmkmList(kategori, search) {
  const params = new URLSearchParams();
  if (kategori && kategori !== 'Semua') params.append('kategori', kategori);
  if (search) params.append('search', search);
  const qs = params.toString() ? '?' + params.toString() : '';
  return apiFetch('/umkm' + qs);
}

async function apiGetUmkmById(id) {
  return apiFetch('/umkm/' + id);
}

async function apiCreateUmkm(formData) {
  return apiFetch('/umkm', {
    method: 'POST',
    body: formData,
  });
}

async function apiUpdateUmkm(id, formData) {
  // Shared hosting may not support PUT natively
  // Use POST with _method=PUT override
  formData.append('_method', 'PUT');
  return apiFetch('/umkm/' + id, {
    method: 'POST',
    body: formData,
  });
}

async function apiDeleteUmkm(id) {
  return apiFetch('/umkm/' + id, {
    method: 'DELETE',
  });
}

async function apiGetStats() {
  return apiFetch('/umkm/stats/summary');
}

// --- Auth API Functions ---
async function apiLogin(username, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }
  return data;
}

function apiLogout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  // Redirect ke login page (relative to current page)
  const path = window.location.pathname;
  const adminMatch = path.match(/^(.*)\/admin\//);
  if (adminMatch) {
    window.location.href = adminMatch[0] + 'login.html';
  } else {
    window.location.href = 'admin/login.html';
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('auth_token');
}

function getCurrentUser() {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
}

// --- Helper ---
function getImageUrl(foto_url) {
  if (!foto_url) return 'images/umkm-default.png';
  if (foto_url.startsWith('http')) return foto_url;
  return foto_url;
}
