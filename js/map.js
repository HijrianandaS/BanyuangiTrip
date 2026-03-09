/* ===================================================
   MAP MODULE — Leaflet.js Map Integration
   =================================================== */

// Default center: Banyuwangi, East Java
const MAP_CENTER = [-8.2192, 114.3691];
const MAP_ZOOM = 13;

let map = null;
let markers = [];

function initMap(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const center = options.center || MAP_CENTER;
    const zoom = options.zoom || MAP_ZOOM;

    map = L.map(containerId, {
        scrollWheelZoom: options.scrollWheel !== false,
        zoomControl: true,
    }).setView(center, zoom);

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    // Load UMKM markers
    loadUmkmMarkers();

    // Fix map display issues in hidden containers
    setTimeout(() => {
        map.invalidateSize();
    }, 300);

    return map;
}

function loadUmkmMarkers() {
    if (!map) return;

    // Clear existing markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const items = getUmkmList();

    items.forEach(item => {
        if (!item.lat || !item.lng) return;

        // Custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
        background: #2E7D32;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      "><span style="transform: rotate(45deg); font-size: 16px;">📍</span></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
        });

        const marker = L.marker([item.lat, item.lng], { icon })
            .addTo(map)
            .bindPopup(createPopupContent(item), {
                maxWidth: 280,
                className: 'custom-popup'
            });

        markers.push(marker);
    });

    // Fit bounds if markers exist
    if (markers.length > 1) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function createPopupContent(item) {
    return `
    <div style="font-family: 'Inter', sans-serif; min-width: 220px;">
      <img src="${item.gambar}" alt="${item.nama}" 
        onerror="this.src='images/umkm-default.png'"
        style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
      <h3 style="font-size: 1rem; margin-bottom: 4px; color: #1A1A2E;">${item.nama}</h3>
      <p style="color: #2E7D32; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">
        ${formatPrice(item.harga)}
      </p>
      <p style="font-size: 0.8rem; color: #718096; margin-bottom: 8px;">
        ${item.jenisProduk} · ★ ${item.rating}
      </p>
      <a href="umkm-detail.html?id=${item.id}" 
        style="display: inline-block; padding: 6px 16px; background: #2E7D32; color: white; 
        border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-decoration: none;">
        Lihat Detail →
      </a>
    </div>
  `;
}

// Custom popup styles
const popupStyles = document.createElement('style');
popupStyles.textContent = `
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    padding: 0;
  }
  .custom-popup .leaflet-popup-content {
    margin: 12px;
  }
  .custom-popup .leaflet-popup-tip {
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  }
  .custom-marker {
    background: transparent !important;
    border: none !important;
  }
`;
document.head.appendChild(popupStyles);
