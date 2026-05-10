/* ===================================================
   MAIN APP — Navbar, Animations, Stats Counter
   =================================================== */

// js/app.js
document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    initScrollAnimations();
    
    // Pastikan elemen statistik ada di halaman ini
    const statEl = document.getElementById('stat-total');
    
    if (statEl) {
        // 1. Ambil data dari database sampai SELESAI
        await loadDynamicStats(); 
        
        // 2. BARU jalankan animasi angka setelah targetnya berubah dari 0 ke angka asli
        initStatsCounter(); 
    }
});

// --- Fetch Dynamic Stats dari API ---
async function loadDynamicStats() {
    try {
        const response = await apiGetStats();
        console.log("Cek Response:", response); // Untuk debugging

        // Sesuaikan dengan isi console kamu yang muncul di gambar
        if (response) {
            document.getElementById('stat-total').setAttribute('data-target', response.total_umkm || 0);
            document.getElementById('stat-mandiri').setAttribute('data-target', response.total_mandiri || 0);
            document.getElementById('stat-induk').setAttribute('data-target', response.total_induk || 0);
            
            // Jalankan animasi
            initStatsCounter();
        }
    } catch (error) {
        console.error('Gagal memuat statistik:', error);
    }
}

// --- Navbar Scroll Effect ---
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!navbar) return;

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Check on load
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    }

    // Mobile toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // Active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// --- Scroll Animations ---
function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// --- Stats Counter Animation ---
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target); // Animasi hanya berjalan 1 kali
            }
        });
    }, { threshold: 0.5 }); // Mulai animasi saat elemen 50% terlihat di layar

    statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('id-ID') + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Pastikan angka akhir tepat dengan target
            el.textContent = target.toLocaleString('id-ID') + suffix; 
        }
    }

    requestAnimationFrame(update);
}

// --- Toast Notification ---
function showToast(message, type = 'success') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast ${type}`;

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- Delete Confirmation Modal ---
function showDeleteModal(umkmId, umkmName) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
    <div class="modal">
      <h3>⚠️ Konfirmasi Hapus</h3>
      <p>Apakah Anda yakin ingin menghapus <strong>${umkmName}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancelDelete">Batal</button>
        <button class="btn btn-danger" id="confirmDelete">Hapus</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    document.getElementById('cancelDelete').addEventListener('click', () => {
        overlay.remove();
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        deleteUmkm(umkmId); // Asumsi fungsi ini ada di script halaman spesifik
        overlay.remove();
        showToast('UMKM berhasil dihapus!', 'success');
        
        // Refresh the page or list
        if (window.location.pathname.includes('umkm-detail')) {
            window.location.href = 'umkm.html';
        } else {
            if(typeof renderUmkmCards === 'function') {
                renderUmkmCards('umkm-container');
                initScrollAnimations();
            } else {
                window.location.reload();
            }
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}