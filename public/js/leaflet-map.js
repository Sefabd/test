// Bulancak Belediyesi 153 Çözüm Merkezi - Leaflet Map Engine & Dual-Mode Analytics Explorer

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

// === 30 RESMİ BULANCAK MAHALLESİ KOORDİNATLARI (TALEP OLUŞTUR İLE %100 BİREBİR) ===
const BULANCAK_NEIGHBORHOOD_COORDS = {
  'Acısu Mahallesi':             { lat: 40.9320, lng: 38.2250 },
  'Ahurlu Mahallesi':            { lat: 40.9260, lng: 38.2190 },
  'Alibey Mahallesi':            { lat: 40.9300, lng: 38.2310 },
  'Arifli Mahallesi':            { lat: 40.9280, lng: 38.2210 },
  'Aydınlar Mahallesi':          { lat: 40.9340, lng: 38.2400 },
  'Bahçelievler Mahallesi':      { lat: 40.9360, lng: 38.2380 },
  'Ballıca Mahallesi':           { lat: 40.9380, lng: 38.2300 },
  'Bulancak Mahallesi':          { lat: 40.9378, lng: 38.2294 },
  'Derecikalan Mahallesi':       { lat: 40.9240, lng: 38.2150 },
  'Duacıoğlu Mahallesi':         { lat: 40.9310, lng: 38.2350 },
  'Düz Mahallesi':               { lat: 40.9350, lng: 38.2280 },
  'Güney Mahallesi':             { lat: 40.9210, lng: 38.2200 },
  'Güzelyalı Mahallesi':         { lat: 40.9410, lng: 38.2450 },
  'Güzelyurt Mahallesi':         { lat: 40.9290, lng: 38.2390 },
  'İhsaniye Mahallesi':          { lat: 40.9350, lng: 38.2250 },
  'İsmet Paşa Mahallesi':        { lat: 40.9390, lng: 38.2320 },
  'İsmetpaşa Mahallesi':         { lat: 40.9390, lng: 38.2320 },
  'Kızılot Mahallesi':           { lat: 40.9250, lng: 38.2180 },
  'Merkez Mahallesi':            { lat: 40.9375, lng: 38.2285 },
  'Pazarsuyu Mahallesi':         { lat: 40.9450, lng: 38.2600 },
  'Pazarsuyu Emecen Mahallesi':  { lat: 40.9470, lng: 38.2650 },
  'Sanayi Mahallesi':            { lat: 40.9400, lng: 38.2400 },
  'Saraçlı Mahallesi':           { lat: 40.9340, lng: 38.2310 },
  'Şemsettin Mahallesi':         { lat: 40.9200, lng: 38.2280 },
  'Sisin Mahallesi':             { lat: 40.9220, lng: 38.2300 },
  'Sofulu Mahallesi':            { lat: 40.9270, lng: 38.2100 },
  'Soğuksu Mahallesi':           { lat: 40.9330, lng: 38.2150 },
  'Toprakdeğirmeni Mahallesi':   { lat: 40.9370, lng: 38.2210 },
  'Uçarlı Mahallesi':            { lat: 40.9190, lng: 38.2350 },
  'Yeni Mahallesi':              { lat: 40.9385, lng: 38.2355 },
  'Yunuslu Mahallesi':           { lat: 40.9230, lng: 38.2420 }
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

// 3. HTML5 Geolocation & Bulancak Geofencing Handler
function getUserCurrentLocation(isPage = false) {
  if (!navigator.geolocation) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'warning',
        title: 'Konum Desteklenmiyor',
        text: 'Tarayıcınız veya cihazınız coğrafi konum servisini desteklemiyor. Lütfen haritadan manuel seçim yapınız.',
        confirmButtonColor: '#0284c7'
      });
    } else if (typeof showToast === 'function') {
      showToast('⚠️ Tarayıcınız konum servisini desteklemiyor.', 'warning');
    }
    return;
  }

  if (typeof showToast === 'function') {
    showToast('📍 Cihaz konumu alınıyor, lütfen bekleyiniz...', 'info');
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = Number(position.coords.latitude.toFixed(6));
      const lng = Number(position.coords.longitude.toFixed(6));

      if (!isInsideBulancak(lat, lng)) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'warning',
            title: 'Bulancak Sınırları Dışında',
            text: 'Mevcut konumunuz Bulancak ilçe sınırları dışında veya izin verilmedi. Lütfen haritadan manuel bir nokta seçin.',
            confirmButtonColor: '#0284c7'
          });
        } else if (typeof showToast === 'function') {
          showToast('⚠️ Mevcut konumunuz Bulancak ilçe sınırları dışında. Lütfen manuel seçim yapın.', 'warning');
        }
        return;
      }

      // Update appropriate map & marker
      if (isPage) {
        if (pagePickerMarker) pagePickerMarker.setLatLng([lat, lng]);
        if (pagePickerMap) {
          pagePickerMap.setView([lat, lng], 16);
          pagePickerMap.invalidateSize();
        }
        const latInput = document.getElementById('page-complaint-lat');
        const lngInput = document.getElementById('page-complaint-lng');
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
      } else {
        if (pickerMarker) pickerMarker.setLatLng([lat, lng]);
        if (pickerMap) {
          pickerMap.setView([lat, lng], 16);
          pickerMap.invalidateSize();
        }
        const latInput = document.getElementById('complaint-lat');
        const lngInput = document.getElementById('complaint-lng');
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
      }

      // Reverse geocode address
      reverseGeocodeLocation(lat, lng);

      // Auto-match nearest Bulancak neighborhood
      matchNearestBulancakNeighborhood(lat, lng, isPage);

      if (typeof showToast === 'function') {
        showToast('📍 Mevcut konumunuz Bulancak içerisinde başarıyla tespit edildi!', 'success');
      }
    },
    (error) => {
      console.warn('Geolocation error:', error);
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'warning',
          title: 'Konum İzni Alınamadı',
          text: 'Mevcut konumunuz Bulancak ilçe sınırları dışında veya izin verilmedi. Lütfen haritadan manuel bir nokta seçin.',
          confirmButtonColor: '#0284c7'
        });
      } else if (typeof showToast === 'function') {
        showToast('⚠️ Konum alınamadı. Lütfen haritadan manuel bir nokta seçin.', 'warning');
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

function matchNearestBulancakNeighborhood(lat, lng, isPage = false) {
  let closestNeigh = null;
  let minDist = Infinity;

  for (const [name, coords] of Object.entries(BULANCAK_NEIGHBORHOOD_COORDS)) {
    const dist = Math.hypot(coords.lat - lat, coords.lng - lng);
    if (dist < minDist) {
      minDist = dist;
      closestNeigh = name;
    }
  }

  if (closestNeigh && typeof neighborhoodsList !== 'undefined' && Array.isArray(neighborhoodsList)) {
    const found = neighborhoodsList.find(n => n.name.toLowerCase() === closestNeigh.toLowerCase() || closestNeigh.toLowerCase().includes(n.name.toLowerCase()));
    if (found) {
      const select = document.getElementById(isPage ? 'page-complaint-neighborhood' : 'complaint-neighborhood');
      if (select) select.value = found.id;
    }
  }
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

// ============================================================================
// 3. DUAL-MODE PIN COLOR MAPPING ENGINE
// ============================================================================

/**
 * 1. MOD: ACİLİYET MODU (Varsayılan Açılış - Sadece Aktif Talepler)
 * Acil / Kritik = 🔴 Kırmızı (#ef4444)
 * Normal = 🟡 Sarı (#eab308)
 * Düşük = ⚫ Gri (#64748b)
 */
function getUrgencyPinColor(urgency) {
  const u = (urgency || '').toLowerCase().trim();
  if (u === 'acil' || u === 'kritik' || u === 'yüksek' || u === 'yuksek') {
    return { color: '#ef4444', label: 'Acil / Kritik', badgeBg: '#fee2e2', textColor: '#b91c1c' };
  }
  if (u === 'düşük' || u === 'dusuk') {
    return { color: '#64748b', label: 'Düşük', badgeBg: '#f1f5f9', textColor: '#475569' };
  }
  return { color: '#eab308', label: 'Normal', badgeBg: '#fef9c3', textColor: '#854d0e' };
}

/**
 * 2. MOD: DURUM MODU (Filtre Seçildiğinde)
 * Yeni (Hiç dokunulmamış) = 🔵 Mavi (#2563eb)
 * İşlemde / Atandı / Ön İnceleme = 🟠 Turuncu (#f97316)
 * Çözüldü = 🟢 Yeşil (#10b981)
 * İptal / Reddedildi = ⚫ Gri (#64748b)
 */
function getStatusPinColor(status) {
  const s = (status || '').toLowerCase().trim();
  if (s === 'yeni') {
    return { color: '#2563eb', label: 'Yeni', badgeBg: '#dbeafe', textColor: '#1e40af' };
  }
  if (s.includes('çözüldü') || s.includes('cozuldu')) {
    return { color: '#10b981', label: 'Çözüldü', badgeBg: '#dcfce7', textColor: '#15803d' };
  }
  if (s.includes('iptal') || s.includes('reddedildi') || s === 'passive') {
    return { color: '#64748b', label: 'İptal Edildi', badgeBg: '#f1f5f9', textColor: '#475569' };
  }
  return { color: '#f97316', label: 'İşlemde / Atandı', badgeBg: '#ffedd5', textColor: '#c2410c' };
}

// ============================================================================
// 4. DUAL-MODE EXPLORER MAP RENDERER (STALE-FREE & REACTIVE)
// ============================================================================

/**
 * Haritayı en güncel veri ve seçilen moda göre çizer / katmanları günceller.
 * @param {string} containerId - Harita DOM ID ('map-container')
 * @param {Array} complaints - Güncel talep listesi
 * @param {string} mode - 'URGENCY' (Varsayılan) veya 'STATUS' (Filtreli)
 */
function renderExplorerMap(containerId, complaints = [], mode = 'URGENCY') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const bulancakMaxBounds = L.latLngBounds(
    L.latLng(BULANCAK_BOUNDS_MIN_LAT, BULANCAK_BOUNDS_MIN_LNG),
    L.latLng(BULANCAK_BOUNDS_MAX_LAT, BULANCAK_BOUNDS_MAX_LNG)
  );

  // 1. Leaflet Instance Yönetimi (Yeniden oluşturma hatasını engeller, Layer bazlı günceller)
  if (!explorerMap) {
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
    markersLayerGroup = L.layerGroup().addTo(explorerMap);
  } else {
    // Stale layerları anında temizle
    if (markersLayerGroup) markersLayerGroup.clearLayers();
    if (heatmapLayerGroup) heatmapLayerGroup.clearLayers();
  }

  // 2. Mahalle bazlı yoğunluk çemberleri hesaplama
  const neighborhoodCounts = {};
  if (complaints && complaints.length > 0) {
    complaints.forEach(c => {
      const name = c.neighborhood_name || 'İhsaniye Mahallesi';
      neighborhoodCounts[name] = (neighborhoodCounts[name] || 0) + 1;
    });
  }

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  Object.keys(neighborhoodCounts).forEach(name => {
    const count = neighborhoodCounts[name];
    const coords = findNeighborhoodCoords(name);

    let circleColor = '#10b981';
    let fillColor = 'rgba(16, 185, 129, 0.25)';
    let radius = 200;

    if (count >= 8) {
      circleColor = '#ef4444';
      fillColor = 'rgba(239, 68, 68, 0.35)';
      radius = 320;
      highCount++;
    } else if (count >= 4) {
      circleColor = '#f97316';
      fillColor = 'rgba(249, 115, 22, 0.3)';
      radius = 250;
      mediumCount++;
    } else {
      lowCount++;
    }

    const circle = L.circle([coords.lat, coords.lng], {
      color: circleColor,
      fillColor: fillColor,
      fillOpacity: 0.5,
      radius: radius,
      weight: 1.5
    });
    heatmapLayerGroup.addLayer(circle);

    const markerIcon = L.divIcon({
      className: 'heatmap-marker-label',
      html: `<div style="background:${circleColor}; color:#fff; font-weight:800; font-size:0.75rem; padding:3px 7px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.25); text-align:center;">${count}</div>`,
      iconSize: [32, 22],
      iconAnchor: [16, 11]
    });

    const labelMarker = L.marker([coords.lat, coords.lng], { icon: markerIcon });
    labelMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #0f3470; font-size: 0.9rem;">${name}</strong><br/>
        <span style="font-size: 0.82rem; color: #475569;">Talep Yoğunluğu: <strong>${count} Başvuru</strong></span>
      </div>
    `);
    heatmapLayerGroup.addLayer(labelMarker);
  });

  // Bölgesel sayaçları güncelle
  const highStat = document.getElementById('stat-high-regions');
  const medStat = document.getElementById('stat-med-regions');
  const lowStat = document.getElementById('stat-low-regions');
  if (highStat) highStat.textContent = `${highCount} Bölge`;
  if (medStat) medStat.textContent = `${mediumCount} Bölge`;
  if (lowStat) lowStat.textContent = `${lowCount} Bölge`;

  // 3. Tekil Pin Markerlarını Çizme (Dual-Mode Renklendirme)
  const pinPointsList = (complaints && Array.isArray(complaints)) ? complaints : [];

  pinPointsList.forEach(c => {
    let lat = parseFloat(c.latitude);
    let lng = parseFloat(c.longitude);

    if (isNaN(lat) || isNaN(lng) || !isInsideBulancak(lat, lng)) {
      const fallback = findNeighborhoodCoords(c.neighborhood_name);
      lat = fallback.lat + (Math.random() - 0.5) * 0.003;
      lng = fallback.lng + (Math.random() - 0.5) * 0.003;
    }

    // Seçilen moda göre pin rengi belirle
    let pinColor = '#2563eb';
    let pinModeLabel = '';

    if (mode === 'URGENCY') {
      const uInfo = getUrgencyPinColor(c.urgency_level || c.priority_level);
      pinColor = uInfo.color;
      pinModeLabel = uInfo.label;
    } else {
      const sInfo = getStatusPinColor(c.status);
      pinColor = sInfo.color;
      pinModeLabel = sInfo.label;
    }

    // Durum ve aciliyet rozet renkleri (sistem ile %100 uyumlu)
    const statusInfo = getStatusPinColor(c.status);
    const urgencyInfo = getUrgencyPinColor(c.urgency_level || c.priority_level);
    const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '-';

    const circlePin = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: pinColor,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    });

    circlePin.bindPopup(`
      <div style="font-family: sans-serif; padding: 6px 4px; min-width: 220px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="color: #0f3470; font-size: 0.82rem;">${c.tracking_code || 'BLD-153'}</strong>
          <span style="display:inline-block; padding: 2px 7px; background: ${statusInfo.badgeBg}; color: ${statusInfo.textColor}; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
            ${c.status || 'Yeni'}
          </span>
        </div>

        <h4 style="margin: 4px 0 6px 0; font-size: 0.92rem; color: #0f172a; line-height: 1.35;">${c.title || 'Başlıksız Talep'}</h4>
        
        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
          <span style="display:inline-block; padding: 2px 6px; background: ${urgencyInfo.badgeBg}; color: ${urgencyInfo.textColor}; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">
            ⚡ ${c.urgency_level || 'Normal'}
          </span>
          <span style="display:inline-block; padding: 2px 6px; background: #f1f5f9; color: #475569; border-radius: 6px; font-size: 0.7rem; font-weight: 600;">
            🏛️ ${c.category_name || 'Genel'}
          </span>
        </div>

        <p style="font-size: 0.78rem; color: #64748b; margin: 0 0 10px 0;">
          <i class="fas fa-location-dot" style="color: #ef4444; margin-right: 3px;"></i> ${c.open_address || c.neighborhood_name || 'Bulancak'}
        </p>

        <button type="button" class="btn btn-primary btn-sm" style="font-size:0.75rem; font-weight:700; padding:6px 10px; width:100%; border-radius:6px; cursor:pointer;" onclick="openComplaintDetail('${c.tracking_code || c.id}')">
          <i class="fas fa-eye"></i> Detayları İncele →
        </button>
      </div>
    `);

    markersLayerGroup.addLayer(circlePin);
  });

  // Haritayı düzgün çizmesi için invalidateSize tetikle
  setTimeout(() => {
    if (explorerMap) {
      explorerMap.invalidateSize();
    }
  }, 150);
}

// Geriye dönük uyumluluk için alias
function initExplorerMap(containerId, complaints = []) {
  renderExplorerMap(containerId, complaints, 'URGENCY');
}
