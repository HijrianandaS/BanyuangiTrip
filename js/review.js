/* ===================================================
   REVIEW MODULE — Rating & Review System
   =================================================== */

function renderReviewSection(umkmId) {
    const item = getUmkmById(umkmId);
    if (!item) return '';

    const reviewsHtml = item.ulasan.map(review => `
    <div class="review-card fade-in">
      <div class="review-header">
        <div>
          <span class="review-author">${review.nama}</span>
          <div class="stars" style="font-size: 0.85rem;">${renderStars(review.rating)}</div>
        </div>
        <span class="review-date">${formatDate(review.tanggal)}</span>
      </div>
      <p class="review-text">${review.teks}</p>
    </div>
  `).join('');

    return `
    <div class="review-section" style="margin-top: 32px;">
      <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
        💬 Ulasan (${item.ulasan.length})
      </h3>
      
      <!-- Add Review Form -->
      <div class="review-card" style="margin-bottom: 24px; background: var(--bg-secondary);">
        <h4 style="margin-bottom: 12px;">Tulis Ulasan</h4>
        <form id="reviewForm" onsubmit="handleReviewSubmit(event, '${umkmId}')">
          <div class="form-group">
            <label class="form-label">Nama Anda</label>
            <input type="text" class="form-input" id="reviewName" placeholder="Masukkan nama" required>
          </div>
          <div class="form-group">
            <label class="form-label">Rating</label>
            <div class="star-rating-input">
              <input type="radio" id="star5" name="rating" value="5"><label for="star5">★</label>
              <input type="radio" id="star4" name="rating" value="4"><label for="star4">★</label>
              <input type="radio" id="star3" name="rating" value="3" checked><label for="star3">★</label>
              <input type="radio" id="star2" name="rating" value="2"><label for="star2">★</label>
              <input type="radio" id="star1" name="rating" value="1"><label for="star1">★</label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Ulasan</label>
            <textarea class="form-textarea" id="reviewText" placeholder="Tulis ulasan Anda..." required style="min-height: 80px;"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Kirim Ulasan</button>
        </form>
      </div>

      <!-- Reviews List -->
      <div id="reviewsList">
        ${reviewsHtml || '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Belum ada ulasan. Jadilah yang pertama!</p>'}
      </div>
    </div>
  `;
}

function handleReviewSubmit(event, umkmId) {
    event.preventDefault();

    const nama = document.getElementById('reviewName').value.trim();
    const rating = parseInt(document.querySelector('input[name="rating"]:checked').value);
    const teks = document.getElementById('reviewText').value.trim();

    if (!nama || !teks) {
        showToast('Mohon lengkapi semua field!', 'error');
        return;
    }

    const result = addReview(umkmId, { nama, rating, teks });
    if (result) {
        showToast('Ulasan berhasil ditambahkan!', 'success');
        // Re-render detail page
        renderDetailPage(umkmId);
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
