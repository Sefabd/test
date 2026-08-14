// Bulancak Belediyesi 153 Çözüm Merkezi - Leaflet Map Engine & Geofencing Explorer

let pickerMap = null;
let pickerMarker = null;
let explorerMap = null;
let pagePickerMap = null;
let pagePickerMarker = null;

let heatmapLayerGroup = null;
let markersLayerGroup = null;

// Bulancak Meydanı Coordinates & Geofencing Bounds
const BULANCAK_LAT = 40.9385;
const BULANCAK_LNG = 38.2300;

// Sıkı Bulancak Geofence Sınırları
const BULANCAK_BOUNDS_MIN_LAT = 40.80;
const BULANCAK_BOUNDS_MAX_LAT = 41.05;
const BULANCAK_BOUNDS_MIN_LNG = 38.10;
const BULANCAK_BOUNDS_MAX_LNG = 38.38;

function isInsideBulancak(lat, lng) {
  const nLat = parseFloat(lat);
  const nLng = parseFloat(lng);
  return (
    nLat >= BULANCAK_BOUNDS_MIN_LAT &&
    nLat <= BULANCAK_BOUNDS_MAX_LAT &&
    nLng >= BULANCAK_BOUNDS_MIN_LNG &&
    nLng <= BULANCAK_BOUNDS_MAX_LNG
  );
}

function showGeofenceWarning() {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: 'warning',
      title: 'Bulancak İlçe Sınırları Dışı',
      text: 'Sadece Bulancak ilçe sınırları içerisinden talep oluşturabilirsiniz.',
      confirmButtonColor: '#0284c7'
    });
  } else if (typeof showToast === 'function') {
    showToast('⚠️ Sadece Bulancak ilçe sınırları içerisinden talep oluşturabilirsiniz.', 'warning');
  }
}

// === BULANCAK MAHALLE KOORDİNATLARI ===
const BULANCAK_NEIGHBORHOOD_COORDS = {
  'İhsaniye Mahallesi':          { lat: 40.9350, lng: 38.2250 },
  'Ballıca Mahallesi':           { lat: 40.9380, lng: 38.2300 },
  'Sanayi Mahallesi':            { lat: 40.9400, lng: 38.2400 },
  'Toprakdeğirmeni Mahallesi':   { lat: 40.9390, lng: 38.2350 },
  'Acısu Mahallesi':             { lat: 40.9320, lng: 38.2200 },
  'Bahçelievler Mahallesi':      { lat: 40.9360, lng: 38.2280 },
  'Bulgurlu Mahallesi':          { lat: 40.9290, lng: 38.2150 },
  'Güzelyalı Mahallesi':         { lat: 40.9420, lng: 38.2450 },
  'İsmetpaşa Mahallesi':         { lat: 40.9370, lng: 38.2270 },
  'Kızılot Mahallesi':           { lat: 40.9250, lng: 38.2100 },
  'Pazarsuyu Mahallesi':         { lat: 40.9450, lng: 38.2600 },
  'Saraçlı Mahallesi':           { lat: 40.9310, lng: 38.2230 },
  'Sisorta Mahallesi':           { lat: 40.9200, lng: 38.2000 },
  'Şemsettin Mahallesi':         { lat: 40.9330, lng: 38.2210 },
  'Talipli Mahallesi':           { lat: 40.9430, lng: 38.2520 },
  'Yalıköy Mahallesi':           { lat: 40.9410, lng: 38.2480 }
};

function findNeighborhoodCoords(nameInput) {
  if (!nameInput) return { lat: BULANCAK_LAT, lng: BULANCAK_LNG };
  const name = nameInput.trim();

  if (BULANCAK_NEIGHBORHOOD_COORDS[name]) return BULANCAK_NEIGHBORHOOD_COORDS[name];

  const lowerName = name.toLowerCase();
  const keys = Object.keys(BULANCAK_NEIGHBORHOOD_COORDS);
  const found = keys.find(k => k.toLowerCase() === lowerName);
  if (found) return BULANCAK_NEIGHBORHOOD_COORDS[found];

  const partial = keys.find(k => k.toLowerCase().includes(lowerName) || lowerName.includes(k.toLowerCase().replace(' mahallesi', '')));
  if (partial) return BULANCAK_NEIGHBORHOOD_COORDS[partial];

  return { lat: BULANCAK_LAT, lng: BULANCAK_LNG };
}

// Reverse Geocoding via Nominatim
async function reverseGeocodeLocation(lat, lng) {
  const openAddrInput = document.getElementById('complaint-open-address') ||
                        document.getElementById('page-complaint-open-address');
  if (openAddrInput) openAddrInput.value = '🔍 Gerçek sokak ve kapı numarası alınıyor...';

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=tr`);
    const data = await res.json();

    if (data && data.address) {
      const a = data.address;
      const road = a.road || a.street || a.pedestrian || a.suburb || 'Bulancak';
      const houseNum = a.house_number ? `No:${a.house_number}` : '';
      const suburb = a.suburb || a.neighbourhood || a.quarter || 'Bulancak';
      const town = 'Bulancak';

      const fullStr = [road, houseNum, suburb, town].filter(Boolean).join(', ');
      
      const pageOpenAddr = document.getElementById('page-complaint-open-address');
      const modalOpenAddr = document.getElementById('complaint-open-address');
      if (pageOpenAddr) pageOpenAddr.value = fullStr;
      if (modalOpenAddr) modalOpenAddr.value = fullStr;
      
      if (typeof showToast === 'function') {
        showToast(`📍 Adres tespit edildi: ${fullStr}`, 'success');
      }
      return fullStr;
    }
  } catch (err) {
    const openAddrFallback = document.getElementById('complaint-open-address') ||
                             document.getElementById('page-complaint-open-address');
    if (openAddrFallback) openAddrFallback.value = `Bulancak, Giresun (${lat}, ${lng})`;
  }
}

// 1. Initialize Interactive Modal Location Picker Map
function initLocationPickerMap() {
  const mapDiv = document.getElementById('complaint-picker-map');
  if (!mapDiv) return;

  if (pickerMap) {
    setTimeout(() => {
      pickerMap.invalidateSize();
      pickerMap.setView([BULANCAK_LAT, BULANCAK_LNG], 14);
    }, 150);
    return;
  }

  const bulancakMaxBounds = L.latLngBounds(
    L.latLng(BULANCAK_BOUNDS_MIN_LAT, BULANCAK_BOUNDS_MIN_LNG),
    L.latLng(BULANCAK_BOUNDS_MAX_LAT, BULANCAK_BOUNDS_MAX_LNG)
  );

  pickerMap = L.map('complaint-picker-map', {
    maxBounds: bulancakMaxBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 12
  }).setView([BULANCAK_LAT, BULANCAK_LNG], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Bulancak Belediyesi 153 Çözüm Merkezi'
  }).addTo(pickerMap);

  pickerMarker = L.marker([BULANCAK_LAT, BULANCAK_LNG], { draggable: true }).addTo(pickerMap);

  function updatePinCoordinates(lat, lng) {
    if (!isInsideBulancak(lat, lng)) {
      showGeofenceWarning();
      pickerMarker.setLatLng([BULANCAK_LAT, BULANCAK_LNG]);
      lat = BULANCAK_LAT;
      lng = BULANCAK_LNG;
    }

    const latInput = document.getElementById('complaint-lat');
    const lngInput = document.getElementById('complaint-lng');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
    reverseGeocodeLocation(lat, lng);
  }

  updatePinCoordinates(BULANCAK_LAT, BULANCAK_LNG);

  pickerMap.on('click', function(e) {
    const lat = Number(e.latlng.lat.toFixed(6));
    const lng = Number(e.latlng.lng.toFixed(6));
    if (!isInsideBulancak(lat, lng)) {
      showGeofenceWarning();
      return;
    }
    pickerMarker.setLatLng([lat, lng]);
    updatePinCoordinates(lat, lng);
  });

  pickerMarker.on('dragend', function() {
    const pos = pickerMarker.getLatLng();
    updatePinCoordinates(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
  });
}

// 2. Initialize Page Location Picker Map
function initPageLocationPickerMap() {
  const mapDiv = document.getElementById('page-complaint-picker-map');
  if (!mapDiv) return;

  if (pagePickerMap) {
    setTimeout(() => {
      pagePickerMap.invalidateSize();
      pagePickerMap.setView([BULANCAK_LAT, BULANCAK_LNG], 14);
    }, 150);
    return;
  }

  const bulancakMaxBounds = L.latLngBounds(
    L.latLng(BULANCAK_BOUNDS_MIN_LAT, BULANCAK_BOUNDS_MIN_LNG),
    L.latLng(BULANCAK_BOUNDS_MAX_LAT, BULANCAK_BOUNDS_MAX_LNG)
  );

  pagePickerMap = L.map('page-complaint-picker-map', {
    maxBounds: bulancakMaxBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 12
  }).setView([BULANCAK_LAT, BULANCAK_LNG], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Bulancak Belediyesi 153 Çözüm Merkezi'
  }).addTo(pagePickerMap);

  pagePickerMarker = L.marker([BULANCAK_LAT, BULANCAK_LNG], { draggable: true }).addTo(pagePickerMap);

  function updatePagePinCoordinates(lat, lng) {
    if (!isInsideBulancak(lat, lng)) {
      showGeofenceWarning();
      pagePickerMarker.setLatLng([BULANCAK_LAT, BULANCAK_LNG]);
      lat = BULANCAK_LAT;
      lng = BULANCAK_LNG;
    }

    const latInput = document.getElementById('page-complaint-lat');
    const lngInput = document.getElementById('page-complaint-lng');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
    reverseGeocodeLocation(lat, lng);
  }

  updatePagePinCoordinates(BULANCAK_LAT, BULANCAK_LNG);

  pagePickerMap.on('click', function(e) {
    const lat = Number(e.latlng.lat.toFixed(6));
    const lng = Number(e.latlng.lng.toFixed(6));
    if (!isInsideBulancak(lat, lng)) {
      showGeofenceWarning();
      return;
    }
    pagePickerMarker.setLatLng([lat, lng]);
    updatePagePinCoordinates(lat, lng);
  });

  pagePickerMarker.on('dragend', function() {
    const pos = pagePickerMarker.getLatLng();
    updatePagePinCoordinates(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
  });
}

function flyToNeighborhoodLocation(neighborhoodId) {
  let name = neighborhoodId;
  if (typeof neighborhoodsList !== 'undefined' && Array.isArray(neighborhoodsList)) {
    const found = neighborhoodsList.find(n => n.id == neighborhoodId || n.name === neighborhoodId);
    if (found) name = found.name;
  }

  const coords = findNeighborhoodCoords(name);
  if (!coords) return;

  const { lat, lng } = coords;
  const maps = [pagePickerMap, pickerMap].filter(Boolean);
  maps.forEach(map => {
    map.flyTo([lat, lng], 15, { duration: 1.2 });
  });

  const targetMarker = pagePickerMarker || pickerMarker;
  if (targetMarker) {
    targetMarker.setLatLng([lat, lng]);
    const latEl = document.getElementById('page-complaint-lat') || document.getElementById('complaint-lat');
    const lngEl = document.getElementById('page-complaint-lng') || document.getElementById('complaint-lng');
    if (latEl) latEl.value = lat;
    if (lngEl) lngEl.value = lng;
    reverseGeocodeLocation(lat, lng);
  }
}

// 3. Status Pin Colors (Kural 4: Dinamik Harita Renkleri)
// Yeni = 🔴 Kırmızı, İşlemde/Atandı = 🟠 Turuncu, Ek Bilgi Bekleniyor = 🟡 Sarı, Çözüldü = 🟢 Yeşil, Pasif/İptal = ⚫ Gri
function getStatusPinColor(status) {
  const s = (status || '').toLowerCase();
  if (s === 'yeni') return { color: '#ef4444', label: 'Yeni (Kırmızı)' };
  if (s.includes('çözüldü') || s.includes('cozuldu')) return { color: '#10b981', label: 'Çözüldü (Yeşil)' };
  if (s.includes('ek bilgi') || s.includes('bilgi bekleniyor')) return { color: '#eab308', label: 'Ek Bilgi Bekleniyor (Sarı)' };
  if (s.includes('iptal') || s.includes('reddedildi') || s === 'passive') return { color: '#64748b', label: 'Pasif / İptal (Gri)' };
  return { color: '#f97316', label: 'İşlemde / Atandı (Turuncu)' };
}

// 4. Initialize Explorer Heatmap & Dynamic Colored Pins Map
function initExplorerMap(containerId, complaints = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (explorerMap) {
    explorerMap.remove();
    explorerMap = null;
  }

  const bulancakMaxBounds = L.latLngBounds(
    L.latLng(BULANCAK_BOUNDS_MIN_LAT, BULANCAK_BOUNDS_MIN_LNG),
    L.latLng(BULANCAK_BOUNDS_MAX_LAT, BULANCAK_BOUNDS_MAX_LNG)
  );

  explorerMap = L.map(containerId, {
    maxBounds: bulancakMaxBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 12
  }).setView([BULANCAK_LAT, BULANCAK_LNG], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Bulancak Belediyesi 153 Çözüm Merkezi'
  }).addTo(explorerMap);

  heatmapLayerGroup = L.layerGroup();
  markersLayerGroup = L.layerGroup();

  // 1. Group complaints dynamically by Bulancak neighborhoods
  const neighborhoodCounts = {};
  if (complaints && complaints.length > 0) {
    complaints.forEach(c => {
      const name = c.neighborhood_name || 'İhsaniye Mahallesi';
      neighborhoodCounts[name] = (neighborhoodCounts[name] || 0) + 1;
    });
  } else {
    neighborhoodCounts['İhsaniye Mahallesi'] = 14;
    neighborhoodCounts['Ballıca Mahallesi'] = 11;
    neighborhoodCounts['Sanayi Mahallesi'] = 8;
    neighborhoodCounts['Toprakdeğirmeni Mahallesi'] = 6;
    neighborhoodCounts['Acısu Mahallesi'] = 4;
  }

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  Object.keys(neighborhoodCounts).forEach(name => {
    const count = neighborhoodCounts[name];
    const coords = findNeighborhoodCoords(name);

    let circleColor = '#10b981';
    let fillColor = 'rgba(16, 185, 129, 0.35)';
    let radius = 220;

    if (count >= 10) {
      circleColor = '#ef4444';
      fillColor = 'rgba(239, 68, 68, 0.45)';
      radius = 350;
      highCount++;
    } else if (count >= 5) {
      circleColor = '#f97316';
      fillColor = 'rgba(249, 115, 22, 0.4)';
      radius = 280;
      mediumCount++;
    } else {
      lowCount++;
    }

    const circle = L.circle([coords.lat, coords.lng], {
      color: circleColor,
      fillColor: fillColor,
      fillOpacity: 0.65,
      radius: radius,
      weight: 2
    });
    heatmapLayerGroup.addLayer(circle);

    const markerIcon = L.divIcon({
      className: 'heatmap-marker-label',
      html: `<div style="background:${circleColor}; color:#fff; font-weight:800; font-size:0.8rem; padding:4px 8px; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,0.25); text-align:center;">${count}</div>`,
      iconSize: [36, 24],
      iconAnchor: [18, 12]
    });

    const labelMarker = L.marker([coords.lat, coords.lng], { icon: markerIcon });
    labelMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #0f3470;">${name}</strong><br/>
        <span style="font-size: 0.85rem; color: #475569;">Talep Yoğunluğu: <strong>${count} Başvuru</strong></span>
      </div>
    `);
    heatmapLayerGroup.addLayer(labelMarker);
  });

  // Update regional stats counter UI if present
  const highStat = document.getElementById('stat-high-regions');
  const medStat = document.getElementById('stat-med-regions');
  const lowStat = document.getElementById('stat-low-regions');
  if (highStat) highStat.textContent = `${highCount} Bölge`;
  if (medStat) medStat.textContent = `${mediumCount} Bölge`;
  if (lowStat) lowStat.textContent = `${lowCount} Bölge`;

  // 2. Build Individual Status-Colored Pinpoint Markers (🔴, 🟠, 🟡, 🟢, ⚫)
  const pinPointsList = (complaints && complaints.length > 0) ? complaints : [];

  pinPointsList.forEach(c => {
    let lat = parseFloat(c.latitude);
    let lng = parseFloat(c.longitude);

    if (isNaN(lat) || isNaN(lng) || !isInsideBulancak(lat, lng)) {
      const fallback = findNeighborhoodCoords(c.neighborhood_name);
      lat = fallback.lat + (Math.random() - 0.5) * 0.004;
      lng = fallback.lng + (Math.random() - 0.5) * 0.004;
    }

    const { color: pinColor } = getStatusPinColor(c.status);

    const circlePin = L.circleMarker([lat, lng], {
      radius: 9,
      fillColor: pinColor,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    });

    circlePin.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; min-width: 200px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color: #0f3470; font-size: 0.85rem;">${c.tracking_code || 'BLD-153'}</strong>
          <span style="display:inline-block; padding: 2px 6px; background: ${pinColor}; color: white; border-radius: 8px; font-size: 0.7rem; font-weight: 700;">
            ${c.status || 'Yeni'}
          </span>
        </div>
        <h4 style="margin: 4px 0; font-size: 0.92rem;">${c.title || 'Başlıksız Talep'}</h4>
        <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 6px;">📍 ${c.open_address || c.neighborhood_name || 'Bulancak'}</p>
        <button type="button" class="btn btn-primary btn-sm" style="font-size:0.75rem; padding:4px 8px; width:100%; border-radius:6px;" onclick="openComplaintDetail('${c.tracking_code || c.id}')">
          <i class="fas fa-eye"></i> Detayları İncele
        </button>
      </div>
    `);

    markersLayerGroup.addLayer(circlePin);
  });

  // Dynamic Layer Toggle on Zoom Change
  function updateMapLayersOnZoom() {
    if (!explorerMap) return;
    const currentZoom = explorerMap.getZoom();

    if (currentZoom <= 14) {
      if (!explorerMap.hasLayer(heatmapLayerGroup)) explorerMap.addLayer(heatmapLayerGroup);
      if (explorerMap.hasLayer(markersLayerGroup)) explorerMap.removeLayer(markersLayerGroup);
    } else {
      if (explorerMap.hasLayer(heatmapLayerGroup)) explorerMap.removeLayer(heatmapLayerGroup);
      if (!explorerMap.hasLayer(markersLayerGroup)) explorerMap.addLayer(markersLayerGroup);
    }
  }

  updateMapLayersOnZoom();
  explorerMap.on('zoomend', updateMapLayersOnZoom);

  setTimeout(() => {
    if (explorerMap) explorerMap.invalidateSize();
  }, 250);
}
