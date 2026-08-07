// Leaflet & OpenStreetMap Interactive Map Manager

let explorerMap = null;
let pickerMap = null;
let pickerMarker = null;
let mapMarkers = [];

// Initialize Explorer Map
function initExplorerMap(containerId = 'map-container', complaints = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (explorerMap) {
    explorerMap.remove();
    explorerMap = null;
  }

  // Default Center (Turkey Center / Ankara coordinate)
  const defaultLat = 39.92077;
  const defaultLng = 32.85411;

  explorerMap = L.map(containerId).setView([defaultLat, defaultLng], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap Katkıda Bulunanlar',
    maxZoom: 19
  }).addTo(explorerMap);

  renderComplaintMarkers(complaints);
}

// Render Markers on Explorer Map
function renderComplaintMarkers(complaints = []) {
  if (!explorerMap) return;

  // Clear existing markers
  mapMarkers.forEach(m => explorerMap.removeLayer(m));
  mapMarkers = [];

  const statusColors = {
    'Yeni': '#3b82f6',
    'İlgili birime yönlendirildi': '#8b5cf6',
    'Personele atandı': '#6366f1',
    'İşlem devam ediyor': '#f59e0b',
    'Çözüldü': '#10b981',
    'Reddedildi': '#ef4444',
    'Acil': '#dc2626'
  };

  const bounds = [];

  complaints.forEach(c => {
    if (!c.latitude || !c.longitude) return;

    const color = statusColors[c.status] || '#3b82f6';

    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([parseFloat(c.latitude), parseFloat(c.longitude)], { icon: customIcon })
      .addTo(explorerMap)
      .bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 4px;">
          <strong style="color: #1e3a8a; font-size: 0.95rem;">${c.title}</strong><br/>
          <small style="color: #64748b;">Takip Kodu: <strong>${c.tracking_code}</strong></small><br/>
          <div style="margin-top: 6px;">
            <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">${c.category_name}</span>
            <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${c.status}</span>
          </div>
          <p style="margin-top: 6px; font-size: 0.8rem; color: #475569;">${c.open_address || c.neighborhood_name}</p>
        </div>
      `);

    mapMarkers.push(marker);
    bounds.push([parseFloat(c.latitude), parseFloat(c.longitude)]);
  });

  if (bounds.length > 0) {
    explorerMap.fitBounds(bounds, { padding: [40, 40] });
  }
}

// Initialize Interactive Location Picker Map in New Complaint Modal
function initLocationPickerMap(containerId = 'complaint-picker-map') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (pickerMap) {
    pickerMap.remove();
    pickerMap = null;
  }

  const defaultLat = 39.92077;
  const defaultLng = 32.85411;

  pickerMap = L.map(containerId).setView([defaultLat, defaultLng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(pickerMap);

  pickerMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(pickerMap);

  const updateCoordinates = (lat, lng) => {
    const latInput = document.getElementById('complaint-lat');
    const lngInput = document.getElementById('complaint-lng');
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);
  };

  pickerMarker.on('dragend', function (e) {
    const pos = pickerMarker.getLatLng();
    updateCoordinates(pos.lat, pos.lng);
  });

  pickerMap.on('click', function (e) {
    pickerMarker.setLatLng(e.latlng);
    updateCoordinates(e.latlng.lat, e.latlng.lng);
  });

  updateCoordinates(defaultLat, defaultLng);
}
