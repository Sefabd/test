let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentToken = localStorage.getItem('token') || null;

let categoriesList = [
  { id: 1, department_id: 1, name: 'Yol ve Kaldırım Sorunu', department_name: 'Fen İşleri Müdürlüğü' },
  { id: 2, department_id: 1, name: 'Çukur veya Asfalt Problemi', department_name: 'Fen İşleri Müdürlüğü' },
  { id: 3, department_id: 2, name: 'Çöp ve Çevre Kirliliği', department_name: 'Temizlik İşleri Müdürlüğü' },
  { id: 4, department_id: 3, name: 'Park ve Yeşil Alan Sorunu', department_name: 'Park ve Bahçeler Müdürlüğü' },
  { id: 5, department_id: 4, name: 'Gürültü Şikâyeti', department_name: 'Zabıta Müdürlüğü' },
  { id: 6, department_id: 4, name: 'Ruhsatsız İşletme', department_name: 'Zabıta Müdürlüğü' },
  { id: 7, department_id: 5, name: 'Su Kaçağı', department_name: 'Su ve Kanalizasyon Müdürlüğü' },
  { id: 8, department_id: 5, name: 'Kanalizasyon Problemi', department_name: 'Su ve Kanalizasyon Müdürlüğü' },
  { id: 9, department_id: 6, name: 'Başıboş Hayvan', department_name: 'Veteriner İşleri Müdürlüğü' },
  { id: 10, department_id: 7, name: 'Toplu Taşıma Sorunu', department_name: 'Ulaşım Hizmetleri Müdürlüğü' },
  { id: 11, department_id: 8, name: 'Sosyal Yardım Talebi', department_name: 'Sosyal Hizmetler Müdürlüğü' },
  { id: 12, department_id: 9, name: 'İmar ve Yapı Şikâyeti', department_name: 'İmar ve Şehircilik Müdürlüğü' },
  { id: 13, department_id: 10, name: 'Sokak Lambası Arızası', department_name: 'Bilgi İşlem Müdürlüğü' },
  { id: 14, department_id: 1, name: 'Diğer', department_name: 'Fen İşleri Müdürlüğü' }
];

let departmentsList = [
  { id: 1, name: 'Fen İşleri Müdürlüğü', code: 'FEN' },
  { id: 2, name: 'Temizlik İşleri Müdürlüğü', code: 'TEM' },
  { id: 3, name: 'Park ve Bahçeler Müdürlüğü', code: 'PARK' },
  { id: 4, name: 'Zabıta Müdürlüğü', code: 'ZBT' },
  { id: 5, name: 'Su ve Kanalizasyon Müdürlüğü', code: 'SUK' },
  { id: 6, name: 'Veteriner İşleri Müdürlüğü', code: 'VET' },
  { id: 7, name: 'Ulaşım Hizmetleri Müdürlüğü', code: 'ULS' },
  { id: 8, name: 'Sosyal Hizmetler Müdürlüğü', code: 'SHM' },
  { id: 9, name: 'İmar ve Şehircilik Müdürlüğü', code: 'IMR' },
  { id: 10, name: 'Bilgi İşlem Müdürlüğü', code: 'BIM' }
];

let districtsList = [
  { id: 1, name: 'Merkez Kaza' },
  { id: 2, name: 'Kuzey İlçesi' }
];

let neighborhoodsList = [
  { id: 1, district_id: 1, name: 'Atatürk Mahallesi' },
  { id: 2, district_id: 1, name: 'Cumhuriyet Mahallesi' },
  { id: 3, district_id: 1, name: 'Fatih Mahallesi' },
  { id: 4, district_id: 1, name: 'Mimar Sinan Mahallesi' },
  { id: 5, district_id: 2, name: 'Gazi Mahallesi' },
  { id: 6, district_id: 2, name: 'Hürriyet Mahallesi' }
];

let currentComplaintsList = [];

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initApp, 100);
}

async function initApp() {
  updateUserUi();
  populateDropdowns();
  bindGlobalEvents();
  navigateTo('dashboard');
  await loadMetadata();
}

// User state UI updates
function updateUserUi() {
  const userNameEl = document.getElementById('user-display-name');
  const userRoleEl = document.getElementById('user-display-role');
  const loginBtn = document.getElementById('btn-open-login');
  const logoutBtn = document.getElementById('btn-logout');
  const navMyComplaints = document.getElementById('nav-my-complaints');
  const navAdminUsers = document.getElementById('nav-admin-users');
  const navAdminDepts = document.getElementById('nav-admin-depts');
  const navAdminLogs = document.getElementById('nav-admin-logs');

  if (currentUser && currentToken) {
    if (userNameEl) userNameEl.textContent = currentUser.full_name;
    if (userRoleEl) userRoleEl.textContent = currentUser.role_name + (currentUser.department_name ? ` (${currentUser.department_name})` : '');
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'flex';

    // Role specific sidebar items
    if (navMyComplaints) navMyComplaints.style.display = currentUser.role_name === 'Vatandaş' ? 'block' : 'none';
    if (navAdminUsers) navAdminUsers.style.display = currentUser.role_name === 'Sistem Yöneticisi' ? 'block' : 'none';
    if (navAdminDepts) navAdminDepts.style.display = currentUser.role_name === 'Sistem Yöneticisi' ? 'block' : 'none';
    if (navAdminLogs) navAdminLogs.style.display = currentUser.role_name === 'Sistem Yöneticisi' ? 'block' : 'none';
  } else {
    if (userNameEl) userNameEl.textContent = 'Ziyaretçi Vatandaş';
    if (userRoleEl) userRoleEl.textContent = 'Giriş Yapılmadı';
    if (loginBtn) loginBtn.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (navMyComplaints) navMyComplaints.style.display = 'none';
    if (navAdminUsers) navAdminUsers.style.display = 'none';
    if (navAdminDepts) navAdminDepts.style.display = 'none';
    if (navAdminLogs) navAdminLogs.style.display = 'none';
  }
}

// Load metadata dropdowns (categories, departments, districts, neighborhoods)
async function loadMetadata() {
  try {
    const [catRes, deptRes, locRes] = await Promise.all([
      fetch('/api/public/categories'),
      fetch('/api/public/departments'),
      fetch('/api/public/locations')
    ]);

    const catData = await catRes.json();
    const deptData = await deptRes.json();
    const locData = await locRes.json();

    if (catData.success) categoriesList = catData.categories;
    if (deptData.success) departmentsList = deptData.departments;
    if (locData.success) {
      districtsList = locData.districts;
      neighborhoodsList = locData.neighborhoods;
    }

    populateDropdowns();
  } catch (err) {
    console.error('Metadata yükleme hatası:', err);
  }
}

function populateDropdowns() {
  const catSelect = document.getElementById('complaint-category');
  const filterCatSelect = document.getElementById('filter-category');
  const distSelect = document.getElementById('complaint-district');
  const neighSelect = document.getElementById('complaint-neighborhood');
  const sidebarDeptList = document.getElementById('sidebar-dept-list');

  if (catSelect) {
    catSelect.innerHTML = '<option value="">-- Kategori Seçiniz --</option>' +
      categoriesList.map(c => `<option value="${c.id}">${c.name} (${c.department_name})</option>`).join('');
  }

  if (filterCatSelect) {
    filterCatSelect.innerHTML = '<option value="">Tüm Kategoriler</option>' +
      categoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  if (distSelect) {
    distSelect.innerHTML = '<option value="">-- İlçe Seçiniz --</option>' +
      districtsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  if (neighSelect) {
    neighSelect.innerHTML = '<option value="">-- Mahalle Seçiniz --</option>' +
      neighborhoodsList.map(n => `<option value="${n.id}">${n.name}</option>`).join('');
  }

  // Populate Sidebar Departments Submenu
  if (sidebarDeptList && departmentsList.length > 0) {
    sidebarDeptList.innerHTML = departmentsList.map(d => `
      <li>
        <a href="#" onclick="filterByDepartment(${d.id}, '${d.name}'); event.preventDefault();">
          <i class="fas fa-angle-right" style="font-size:0.75rem;"></i> ${d.name}
        </a>
      </li>
    `).join('');
  }
}

// Toggle Submenu Accordion
function toggleDeptSubmenu(e) {
  if (e) e.preventDefault();
  const menuItem = document.getElementById('nav-depts-menu');
  if (menuItem) {
    menuItem.classList.toggle('open');
  }
}

// Filter Complaints by Department from Sidebar Submenu
async function filterByDepartment(deptId, deptName) {
  showToast(`${deptName} talepleri filtreleniyor...`, 'info');
  await navigateTo('complaints');

  try {
    const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
    const res = await fetch(`/api/complaints?department_id=${deptId}`, { headers });
    const data = await res.json();
    if (data.success) {
      currentComplaintsList = data.complaints;
      renderComplaintsTable(data.complaints);
    }
  } catch (err) {
    console.error('Birim filtreleme hatası:', err);
  }
}

// Event Bindings
function bindGlobalEvents() {
  // Navigation menu clicks
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
      link.parentElement.classList.add('active');
      navigateTo(targetView);
    });
  });

  // New Complaint Form Submit
  const newForm = document.getElementById('form-new-complaint');
  if (newForm) {
    newForm.addEventListener('submit', handleNewComplaintSubmit);
  }

  // Login Form Submit
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  // Register Form Submit
  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  // Quick Tracking Form Submit
  const trackForm = document.getElementById('form-quick-track');
  if (trackForm) {
    trackForm.addEventListener('submit', handleQuickTrackSubmit);
  }
}

// SPA Navigation Router
async function navigateTo(viewName) {
  const views = ['view-dashboard', 'view-complaints', 'view-map', 'view-admin-users', 'view-admin-departments', 'view-admin-logs'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (viewName === 'dashboard') {
    document.getElementById('view-dashboard').style.display = 'block';
    await loadDashboardData();
  } else if (viewName === 'complaints' || viewName === 'my-complaints') {
    document.getElementById('view-complaints').style.display = 'block';
    await loadComplaintsList(viewName === 'my-complaints');
  } else if (viewName === 'map') {
    document.getElementById('view-map').style.display = 'block';
    await loadMapData();
  } else if (viewName === 'admin-users') {
    document.getElementById('view-admin-users').style.display = 'block';
    await loadAdminUsers();
  } else if (viewName === 'admin-departments') {
    document.getElementById('view-admin-departments').style.display = 'block';
    await loadAdminDepartments();
  } else if (viewName === 'admin-logs') {
    document.getElementById('view-admin-logs').style.display = 'block';
    await loadAdminLogs();
  }
}

// 1. Dashboard Loading
async function loadDashboardData() {
  try {
    const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
    const res = await fetch('/api/stats/dashboard', { headers });
    const data = await res.json();

    if (data.success) {
      document.getElementById('kpi-total').textContent = data.kpis.total;
      document.getElementById('kpi-today').textContent = data.kpis.today;
      document.getElementById('kpi-pending').textContent = data.kpis.pending;
      document.getElementById('kpi-resolved').textContent = data.kpis.resolved;
      document.getElementById('kpi-urgent').textContent = data.kpis.urgent;
      document.getElementById('kpi-rating').textContent = data.kpis.avg_rating + ' / 5.0';

      renderDashboardCharts(data.charts);
    }
  } catch (err) {
    console.error('Dashboard veri hatası:', err);
  }
}

// 2. Complaints List Loading
async function loadComplaintsList(isMine = false) {
  try {
    const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
    const url = `/api/complaints${isMine ? '?mine_only=true' : ''}`;
    const res = await fetch(url, { headers });
    const data = await res.json();

    if (data.success) {
      currentComplaintsList = data.complaints;
      renderComplaintsTable(data.complaints);
    }
  } catch (err) {
    console.error('Şikâyet listesi yükleme hatası:', err);
  }
}

function renderComplaintsTable(complaints) {
  const tbody = document.getElementById('tbody-complaints');
  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 30px;">Kayıtlı talep bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = complaints.map(c => {
    let badgeClass = 'badge-yeni';
    if (c.status === 'Personele atandı') badgeClass = 'badge-atanan';
    else if (c.status === 'İşlem devam ediyor') badgeClass = 'badge-devam';
    else if (c.status === 'Çözüldü') badgeClass = 'badge-cozuldu';
    else if (c.status === 'Reddedildi') badgeClass = 'badge-red';

    return `
      <tr>
        <td><strong style="color: #0284c7;">${c.tracking_code}</strong></td>
        <td>${c.title}</td>
        <td>${c.category_name}</td>
        <td>${c.neighborhood_name}</td>
        <td><span class="badge ${badgeClass}">${c.status}</span></td>
        <td>${new Date(c.created_at).toLocaleDateString('tr-TR')}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="openComplaintDetail('${c.tracking_code}')">
            <i class="fas fa-eye"></i> Detay
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// 3. Map Data Loading
async function loadMapData() {
  try {
    const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
    const res = await fetch('/api/complaints', { headers });
    const data = await res.json();

    if (data.success) {
      initExplorerMap('map-container', data.complaints);
    }
  } catch (err) {
    console.error('Harita veri hatası:', err);
  }
}

// Complaint Detail Modal Handler
async function openComplaintDetail(trackingCode) {
  try {
    const res = await fetch(`/api/complaints/track/${trackingCode}`);
    const data = await res.json();

    if (data.success) {
      const { complaint, history, files, actions, survey } = data;
      const modalBody = document.getElementById('complaint-detail-content');

      let historyHtml = history.map(h => `
        <div style="padding: 8px; border-left: 3px solid #0284c7; margin-bottom: 8px; background: #f8fafc;">
          <strong>${h.new_status}</strong> - ${new Date(h.created_at).toLocaleString('tr-TR')}<br/>
          <small style="color: #64748b;">Değiştiren: ${h.changed_by_name} | Not: ${h.change_reason || '-'}</small>
        </div>
      `).join('');

      let actionsHtml = actions.map(a => `
        <div style="padding: 10px; background: #ecfdf5; border-radius: 8px; margin-bottom: 8px;">
          <strong>İşlem Yapan: ${a.employee_name} (${a.employee_title})</strong><br/>
          <span>${a.action_description}</span><br/>
          <small style="color: #047857;">Yapılan Çalışma: ${a.work_done || '-'} | Kullanılan Ekipman: ${a.tools_equipment_used || '-'}</small>
          ${a.resolution_photo_path ? `<div style="margin-top: 8px;"><a href="/${a.resolution_photo_path}" target="_blank"><img src="/${a.resolution_photo_path}" style="max-width: 200px; border-radius: 8px;" /></a></div>` : ''}
        </div>
      `).join('');

      modalBody.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="color: #1e3a8a;">Takip Kodu: ${complaint.tracking_code}</h3>
          <span class="badge badge-yeni">${complaint.status}</span>
        </div>
        <h4>${complaint.title}</h4>
        <p style="color: #475569; margin: 10px 0;">${complaint.description}</p>
        
        <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 10px; font-size: 0.9rem; margin-bottom: 16px;">
          <div><strong>Kategori:</strong> ${complaint.category_name}</div>
          <div><strong>Müdürlük:</strong> ${complaint.department_name}</div>
          <div><strong>Mahalle:</strong> ${complaint.neighborhood_name}</div>
          <div><strong>Öncelik:</strong> ${complaint.priority_level}</div>
        </div>

        <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;" />
        
        <h5 style="margin-bottom: 10px;">Durum Geçmişi</h5>
        ${historyHtml || '<p style="color:#94a3b8;">Geçmiş kaydı bulunmuyor.</p>'}

        <h5 style="margin: 16px 0 10px 0;">Saha İşlem ve Çözüm Notları</h5>
        ${actionsHtml || '<p style="color:#94a3b8;">Henüz işlem yapılmadı.</p>'}

        ${survey ? `
          <div style="margin-top: 16px; padding: 12px; background: #fffbeb; border-radius: 8px;">
            <strong style="color: #b45309;">Vatandaş Değerlendirmesi: ${'⭐'.repeat(survey.rating)} (${survey.rating}/5)</strong>
            <p style="font-size: 0.85rem; color: #78350f; margin-top: 4px;">"${survey.review_comment || ''}"</p>
          </div>
        ` : ''}
      `;

      openModal('modal-complaint-detail');
    }
  } catch (err) {
    showToast('Şikâyet detayları yüklenemedi.', 'error');
  }
}

// Modal Toggle Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    populateDropdowns();
    modal.classList.add('active');
    if (id === 'modal-new-complaint') {
      setTimeout(() => initLocationPickerMap(), 200);
    }
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Auth Submit Handlers
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUserUi();
      closeModal('modal-login');
      showToast('Başarıyla giriş yapıldı!', 'success');
      navigateTo('dashboard');
    } else {
      showToast(data.message || 'Giriş başarısız.', 'error');
    }
  } catch (err) {
    showToast('Giriş yapılırken hata oluştu.', 'error');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const full_name = document.getElementById('reg-fullname').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const phone = document.getElementById('reg-phone').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, phone })
    });
    const data = await res.json();

    if (data.success) {
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUserUi();
      closeModal('modal-register');
      showToast('Kayıt başarıyla oluşturuldu ve giriş yapıldı!', 'success');
      navigateTo('dashboard');
    } else {
      showToast(data.message || 'Kayıt başarısız.', 'error');
    }
  } catch (err) {
    showToast('Kayıt hatası.', 'error');
  }
}

// New Complaint Submit Handler
async function handleNewComplaintSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('form-new-complaint');
  const formData = new FormData(form);

  try {
    const headers = {};
    if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;

    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: headers,
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      closeModal('modal-new-complaint');
      form.reset();
      showToast(`Talebiniz Alındı! Takip Kodu: ${data.tracking_code}`, 'success');
      navigateTo('complaints');
    } else {
      showToast(data.message || 'Talep oluşturulurken hata oluştu.', 'error');
    }
  } catch (err) {
    showToast('Sunucu bağlantı hatası.', 'error');
  }
}

// Quick Track Handler
async function handleQuickTrackSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('track-code-input').value;
  if (code) {
    closeModal('modal-quick-track');
    await openComplaintDetail(code.trim());
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = null;
  currentUser = null;
  updateUserUi();
  showToast('Çıkış yapıldı.', 'info');
  navigateTo('dashboard');
}

// Toast Manager
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
