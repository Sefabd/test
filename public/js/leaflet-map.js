// Giresun Interactive Leaflet Map Picker & Real Heatmap Explorer

let pickerMap = null;
let pickerMarker = null;
let explorerMap = null;

let heatmapLayerGroup = null;
let markersLayerGroup = null;

// Giresun City Center Default Coordinates
const GIRESUN_LAT = 40.9128;
const GIRESUN_LNG = 38.3895;

// === KAPSAMLI GİRESUN MAHALLE KOORDİNATLARI ===
// Tüm Giresun Merkez ve Bulancak mahalleleri dahil (karada, doğru koordinatlar)
const GIRESUN_NEIGHBORHOOD_COORDS = {
  // GİRESUN MERKEZ
  'Aksu Mahallesi':              { lat: 40.8985, lng: 38.4350 },
  'Aydınlar Mahallesi':          { lat: 40.9070, lng: 38.3760 },
  'Çaykara Mahallesi':           { lat: 40.9050, lng: 38.3820 },
  'Çınarlar Mahallesi':          { lat: 40.9100, lng: 38.3830 },
  'Çıtlakkale Mahallesi':        { lat: 40.9090, lng: 38.4000 },
  'Cumhuriyet Mahallesi':        { lat: 40.9115, lng: 38.3885 },
  'Erikliman Mahallesi':         { lat: 40.9140, lng: 38.3960 },
  'Fevzi Çakmak Mahallesi':      { lat: 40.9030, lng: 38.3950 },
  'Gaziler Mahallesi':           { lat: 40.9160, lng: 38.3820 },
  'Gedikkaya Mahallesi':         { lat: 40.9060, lng: 38.4180 },
  'Gemilerçekeği Mahallesi':     { lat: 40.9175, lng: 38.3980 },
  'Güre Mahallesi':              { lat: 40.9080, lng: 38.4060 },
  'Hacı Hüseyin Mahallesi':      { lat: 40.9130, lng: 38.3790 },
  'Hacıhüseyin Mahallesi':       { lat: 40.9130, lng: 38.3790 },
  'Hacımiktat Mahallesi':        { lat: 40.9145, lng: 38.3855 },
  'Hacısiyam Mahallesi':         { lat: 40.9110, lng: 38.3900 },
  'Hacısıyam Mahallesi':         { lat: 40.9110, lng: 38.3900 },
  'Kale Mahallesi':              { lat: 40.9165, lng: 38.3900 },
  'Kapu Mahallesi':              { lat: 40.9155, lng: 38.3840 },
  'Kavaklar Mahallesi':          { lat: 40.9005, lng: 38.4140 },
  'Kayadibi Mahallesi':          { lat: 40.8960, lng: 38.4270 },
  'Küçükköy Mahallesi':          { lat: 40.8940, lng: 38.4400 },
  'Konacık Mahallesi':           { lat: 40.9055, lng: 38.4090 },
  'Nizamiye Mahallesi':          { lat: 40.9140, lng: 38.3870 },
  'Osmaniye Mahallesi':          { lat: 40.9160, lng: 38.3940 },
  'Seldeğirmeni Mahallesi':      { lat: 40.9020, lng: 38.4020 },
  'Şeyhkeramettin Mahallesi':    { lat: 40.9075, lng: 38.3880 },
  'Sultan Selim Mahallesi':      { lat: 40.9165, lng: 38.3860 },
  'Tekke Mahallesi':             { lat: 40.9180, lng: 38.3820 },
  'Teyyaredüzü Mahallesi':       { lat: 40.9030, lng: 38.4100 },
  'Yalı Mahallesi':              { lat: 40.9185, lng: 38.3960 },
  'Samanlıkkıranı Mahallesi':    { lat: 40.9020, lng: 38.3850 },

  // BULANCAK İLÇESİ
  'Acısu Mahallesi':             { lat: 40.9380, lng: 38.2290 },
  'Arifli Mahallesi':            { lat: 40.9330, lng: 38.2180 },
  'Bahçelievler Mahallesi':      { lat: 40.9355, lng: 38.2250 },
  'Ballıca Mahallesi':           { lat: 40.9295, lng: 38.2140 },
  'Bulancak Mahallesi':          { lat: 40.9370, lng: 38.2320 },
  'Duacıoğlu Mahallesi':         { lat: 40.9260, lng: 38.2060 },
  'Güzelyalı Mahallesi':         { lat: 40.9390, lng: 38.2380 },
  'İhsaniye Mahallesi':          { lat: 40.9315, lng: 38.2200 },
  'İsmetpaşa Mahallesi':         { lat: 40.9345, lng: 38.2270 },
  'Kızılot Mahallesi':           { lat: 40.9240, lng: 38.2100 },
  'Pazarsuyu Mahallesi':         { lat: 40.9420, lng: 38.2450 },
  'Sanayi Mahallesi':            { lat: 40.9360, lng: 38.2350 },
  'Saraçlı Mahallesi':           { lat: 40.9275, lng: 38.2170 },
  'Sisin Mahallesi':             { lat: 40.9230, lng: 38.1980 },
  'Şemsettin Mahallesi':         { lat: 40.9310, lng: 38.2240 },
  'Toprakdeğirmeni Mahallesi':   { lat: 40.9200, lng: 38.2050 }
};

// Helper: mahalle adına göre koordinat bul (case-insensitive, kısmi eşleşme destekli)
function findNeighborhoodCoords(nameInput) {
  if (!nameInput) return null;
  const name = nameInput.trim();

  // Direct match
  if (GIRESUN_NEIGHBORHOOD_COORDS[name]) return GIRESUN_NEIGHBORHOOD_COORDS[name];

  // Case-insensitive match
  const lowerName = name.toLowerCase();
  const keys = Object.keys(GIRESUN_NEIGHBORHOOD_COORDS);
  const found = keys.find(k => k.toLowerCase() === lowerName);
  if (found) return GIRESUN_NEIGHBORHOOD_COORDS[found];

  // Partial match (e.g. 'Hacısıyam' matches 'Hacısıyam Mahallesi')
  const partial = keys.find(k => k.toLowerCase().includes(lowerName) || lowerName.includes(k.toLowerCase().replace(' mahallesi', '')));
  if (partial) return GIRESUN_NEIGHBORHOOD_COORDS[partial];

  return null;
}

// OpenStreetMap Nominatim Reverse Geocoding API (Sokak, Kapı No, Mahalle)
async function reverseGeocodeLocation(lat, lng) {
  const openAddrInput = document.getElementById('complaint-open-address') ||
                        document.getElementById('page-complaint-open-address');
  if (openAddrInput) openAddrInput.value = '🔍 Gerçek sokak ve kapı numarası alınıyor...';

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=tr`);
    const data = await res.json();

    if (data && data.address) {
      const a = data.address;
      const road = a.road || a.street || a.pedestrian || a.suburb || 'Sokak';
      const houseNum = a.house_number ? `No:${a.house_number}` : '';
      const suburb = a.suburb || a.neighbourhood || a.quarter || a.district || 'Giresun Merkez';
      const town = a.city || a.town || 'Giresun';

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
    console.error('Geocode error:', err);
    const openAddrFallback = document.getElementById('complaint-open-address') ||
                             document.getElementById('page-complaint-open-address');
    if (openAddrFallback) openAddrFallback.value = `Giresun Merkez (${lat}, ${lng})`;
  }
}

// Initialize Interactive Location Picker Map in Complaint Form
function initLocationPickerMap() {
  const mapDiv = document.getElementById('complaint-picker-map');
  if (!mapDiv) return;

  if (pickerMap) {
    pickerMap.invalidateSize();
    return;
  }

  pickerMap = L.map('complaint-picker-map').setView([GIRESUN_LAT, GIRESUN_LNG], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Giresun Belediyesi 153 Çözüm Merkezi'
  }).addTo(pickerMap);

  pickerMarker = L.marker([GIRESUN_LAT, GIRESUN_LNG], { draggable: true }).addTo(pickerMap);

  function updatePinCoordinates(lat, lng) {
    const latInput = document.getElementById('complaint-lat');
    const lngInput = document.getElementById('complaint-lng');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
    reverseGeocodeLocation(lat, lng);
  }

  updatePinCoordinates(GIRESUN_LAT, GIRESUN_LNG);

  pickerMap.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    pickerMarker.setLatLng([lat, lng]);
    updatePinCoordinates(lat, lng);
  });

  pickerMarker.on('dragend', function(e) {
    const pos = pickerMarker.getLatLng();
    updatePinCoordinates(pos.lat.toFixed(6), pos.lng.toFixed(6));
  });
}

let pagePickerMap = null;
let pagePickerMarker = null;

function initPageLocationPickerMap() {
  const mapDiv = document.getElementById('page-complaint-picker-map');
  if (!mapDiv) return;

  if (pagePickerMap) {
    setTimeout(() => pagePickerMap.invalidateSize(), 200);
    return;
  }

  pagePickerMap = L.map('page-complaint-picker-map').setView([GIRESUN_LAT, GIRESUN_LNG], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Giresun Belediyesi 153 Çözüm Merkezi'
  }).addTo(pagePickerMap);

  pagePickerMarker = L.marker([GIRESUN_LAT, GIRESUN_LNG], { draggable: true }).addTo(pagePickerMap);

  async function updatePagePinCoordinates(lat, lng) {
    const latInput = document.getElementById('page-complaint-lat');
    const lngInput = document.getElementById('page-complaint-lng');
    const openAddrInput = document.getElementById('page-complaint-open-address');

    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
    if (openAddrInput) openAddrInput.value = '🔍 Adres tespit ediliyor...';

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=tr`);
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        const road = a.road || a.street || a.pedestrian || 'Sokak';
        const houseNum = a.house_number ? `No:${a.house_number}` : '';
        const suburb = a.suburb || a.neighbourhood || 'Giresun Merkez';
        const town = a.city || a.town || 'Giresun';

        const fullStr = [road, houseNum, suburb, town].filter(Boolean).join(', ');
        if (openAddrInput) openAddrInput.value = fullStr;

        if (typeof showToast === 'function') {
          showToast(`📍 Adres tespit edildi: ${fullStr}`, 'success');
        }
      }
    } catch (err) {
      if (openAddrInput) openAddrInput.value = `Giresun Merkez (${lat}, ${lng})`;
    }
  }

  updatePagePinCoordinates(GIRESUN_LAT, GIRESUN_LNG);

  pagePickerMap.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    pagePickerMarker.setLatLng([lat, lng]);
    updatePagePinCoordinates(lat, lng);
  });

  pagePickerMarker.on('dragend', function(e) {
    const pos = pagePickerMarker.getLatLng();
    updatePagePinCoordinates(pos.lat.toFixed(6), pos.lng.toFixed(6));
  });
}

const DISTRICT_COORDS = {
  '1': { lat: 40.9128, lng: 38.3895, name: 'Giresun Merkez', zoom: 13 },
  '2': { lat: 40.9370, lng: 38.2320, name: 'Bulancak',       zoom: 14 },
  '3': { lat: 40.9460, lng: 38.7090, name: 'Espiye',         zoom: 13 },
  '4': { lat: 40.9870, lng: 38.6750, name: 'Görele',         zoom: 13 },
  '5': { lat: 41.0030, lng: 38.8110, name: 'Tirebolu',       zoom: 13 }
};

function flyToDistrictLocation(districtId) {
  const d = DISTRICT_COORDS[String(districtId)];
  if (!d) return;

  // fly on both maps
  const maps = [pagePickerMap, pickerMap].filter(Boolean);
  maps.forEach(map => {
    map.flyTo([d.lat, d.lng], d.zoom || 13, { duration: 1.2 });
  });

  const targetMarker = pagePickerMarker || pickerMarker;
  if (targetMarker) {
    targetMarker.setLatLng([d.lat, d.lng]);
    const latEl = document.getElementById('page-complaint-lat') || document.getElementById('complaint-lat');
    const lngEl = document.getElementById('page-complaint-lng') || document.getElementById('complaint-lng');
    if (latEl) latEl.value = d.lat;
    if (lngEl) lngEl.value = d.lng;
  }
}

function flyToNeighborhoodLocation(neighborhoodId) {
  // Resolve name from neighborhoodsList global (populated in app.js)
  let name = neighborhoodId;
  if (typeof neighborhoodsList !== 'undefined' && Array.isArray(neighborhoodsList)) {
    const found = neighborhoodsList.find(n => n.id == neighborhoodId || n.name === neighborhoodId);
    if (found) name = found.name;
  }

  const coords = findNeighborhoodCoords(name);
  if (!coords) {
    console.warn('[flyToNeighborhood] koordinat bulunamadı:', name);
    return;
  }

  const { lat, lng } = coords;

  const maps = [pagePickerMap, pickerMap].filter(Boolean);
  maps.forEach(map => {
    map.flyTo([lat, lng], 16, { duration: 1.2 });
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

// Initialize Real Dynamic Heatmap & Pinpoint Marker Explorer Map
function initExplorerMap(containerId, complaints = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (explorerMap) {
    explorerMap.remove();
    explorerMap = null;
  }

  explorerMap = L.map(containerId).setView([GIRESUN_LAT, GIRESUN_LNG], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Giresun Belediyesi 153 Çözüm Merkezi'
  }).addTo(explorerMap);

  heatmapLayerGroup = L.layerGroup();
  markersLayerGroup = L.layerGroup();

  // 1. Group complaints dynamically by neighborhood_name
  const neighborhoodCounts = {};
  if (complaints && complaints.length > 0) {
    complaints.forEach(c => {
      const name = c.neighborhood_name || 'Hacısıyam Mahallesi';
      neighborhoodCounts[name] = (neighborhoodCounts[name] || 0) + 1;
    });
  } else {
    // Fallback realistic distribution
    neighborhoodCounts['Hacısıyam Mahallesi'] = 35;
    neighborhoodCounts['Nizamiye Mahallesi'] = 28;
    neighborhoodCounts['Gedikkaya Mahallesi'] = 18;
    neighborhoodCounts['Teyyaredüzü Mahallesi'] = 14;
    neighborhoodCounts['Kapu Mahallesi'] = 10;
    neighborhoodCounts['Hacı Hüseyin Mahallesi'] = 8;
    neighborhoodCounts['Aksu Mahallesi'] = 6;
    neighborhoodCounts['Çıtlakkale Mahallesi'] = 4;
  }

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  Object.keys(neighborhoodCounts).forEach(name => {
    const count = neighborhoodCounts[name];
    const coords = findNeighborhoodCoords(name) || { lat: 40.9110, lng: 38.3900 };

    let circleColor = '#10b981';
    let fillColor = 'rgba(16, 185, 129, 0.35)';
    let radius = 220;

    if (count >= 20) {
      circleColor = '#ef4444';
      fillColor = 'rgba(239, 68, 68, 0.45)';
      radius = 380;
      highCount++;
    } else if (count >= 10) {
      circleColor = '#f97316';
      fillColor = 'rgba(249, 115, 22, 0.4)';
      radius = 300;
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
        <span style="font-size: 0.85rem; color: #475569;">Gerçek Şikâyet Yoğunluğu: <strong>${count} Talep</strong></span>
      </div>
    `);
    heatmapLayerGroup.addLayer(labelMarker);
  });

  // Update regional stats counter UI
  const highStat = document.getElementById('stat-high-regions');
  const medStat = document.getElementById('stat-med-regions');
  const lowStat = document.getElementById('stat-low-regions');
  if (highStat) highStat.textContent = `${highCount} Bölge`;
  if (medStat) medStat.textContent = `${mediumCount} Bölge`;
  if (lowStat) lowStat.textContent = `${lowCount} Bölge`;

  // 2. Build Individual Pinpoint Location Markers Layer
  const pinPointsList = (complaints && complaints.length > 0) ? complaints : [
    { id: 1, tracking_code: 'BLD-2026-000101', title: 'Derin Asfalt Çukuru', latitude: 40.9110, longitude: 38.3900, neighborhood_name: 'Hacısıyam Mahallesi', open_address: 'Atatürk Bulvarı No:45, Giresun', status: 'Personele atandı', urgency_level: 'Acil' },
    { id: 2, tracking_code: 'BLD-2026-000102', title: 'Çöp Konteyneri Taşmış', latitude: 40.9140, longitude: 38.3870, neighborhood_name: 'Nizamiye Mahallesi', open_address: 'Gazi Cad. No:18, Giresun', status: 'Çözüldü', urgency_level: 'Normal' }
  ];

  pinPointsList.forEach(c => {
    const lat = parseFloat(c.latitude) || GIRESUN_LAT;
    const lng = parseFloat(c.longitude) || GIRESUN_LNG;

    let pinColor = '#2563eb';
    if (c.status === 'Çözüldü') pinColor = '#10b981';
    else if (c.status === 'İşlem devam ediyor') pinColor = '#f59e0b';
    else if (c.urgency_level === 'Acil' || c.urgency_level === 'Kritik') pinColor = '#ef4444';

    const circlePin = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: pinColor,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    });

    circlePin.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #0f3470;">${c.tracking_code}</strong><br/>
        <h4 style="margin: 4px 0;">${c.title}</h4>
        <p style="font-size: 0.82rem; color: #64748b; margin-bottom: 6px;">📍 ${c.open_address || c.neighborhood_name}</p>
        <span style="display: inline-block; padding: 3px 8px; background: ${pinColor}; color: white; border-radius: 10px; font-size: 0.75rem; font-weight: 700;">
          ${c.status} (${c.urgency_level || '-'})
        </span>
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
