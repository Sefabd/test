// Giresun 153 Çözüm Merkezi SPA App Controller & Role Workspaces

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
  { id: 1, name: 'Giresun Merkez', lat: 40.9128, lng: 38.3895 },
  { id: 2, name: 'Bulancak', lat: 40.9378, lng: 38.2294 },
  { id: 3, name: 'Espiye', lat: 40.9575, lng: 38.7147 },
  { id: 4, name: 'Görele', lat: 41.0319, lng: 39.0381 },
  { id: 5, name: 'Tirebolu', lat: 41.0069, lng: 38.8144 }
];

let neighborhoodsList = [
  { id: 1, district_id: 1, name: 'Hacısıyam Mahallesi', lat: 40.9100, lng: 38.3910 },
  { id: 2, district_id: 1, name: 'Nizamiye Mahallesi', lat: 40.9150, lng: 38.3850 },
  { id: 3, district_id: 1, name: 'Gedikkaya Mahallesi', lat: 40.9200, lng: 38.4050 },
  { id: 4, district_id: 1, name: 'Teyyaredüzü Mahallesi', lat: 40.9180, lng: 38.4200 },
  { id: 5, district_id: 1, name: 'Kapu Mahallesi', lat: 40.9170, lng: 38.3880 },
  { id: 6, district_id: 1, name: 'Hacıhüseyin Mahallesi', lat: 40.9140, lng: 38.3780 },
  { id: 7, district_id: 1, name: 'Aksu Mahallesi', lat: 40.9150, lng: 38.4350 },
  { id: 8, district_id: 1, name: 'Çaykara Mahallesi', lat: 40.9110, lng: 38.3800 },
  { id: 9, district_id: 2, name: 'Ballıca Mahallesi', lat: 40.9380, lng: 38.2300 },
  { id: 10, district_id: 2, name: 'İhsaniye Mahallesi', lat: 40.9350, lng: 38.2250 },
  { id: 11, district_id: 2, name: 'Sanayi Mahallesi', lat: 40.9400, lng: 38.2400 },
  { id: 12, district_id: 3, name: 'Çam Mahallesi', lat: 40.9580, lng: 38.7150 },
  { id: 13, district_id: 3, name: 'Esentepe Mahallesi', lat: 40.9550, lng: 38.7100 },
  { id: 14, district_id: 4, name: 'Sayfiye Mahallesi', lat: 41.0320, lng: 39.0380 },
  { id: 15, district_id: 4, name: 'Hendekbaşı Mahallesi', lat: 41.0300, lng: 39.0350 },
  { id: 16, district_id: 5, name: 'Demirci Mahallesi', lat: 41.0070, lng: 38.8150 },
  { id: 17, district_id: 5, name: 'Yeniköy Mahallesi', lat: 41.0050, lng: 38.8100 }
];

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initApp, 100);
}

let isAppInitialized = false;

async function initApp() {
  if (isAppInitialized) return;
  isAppInitialized = true;

  const landingPortal = document.getElementById('landing-portal');
  const appWorkspace = document.getElementById('app-workspace');
  const loadingScreen = document.getElementById('app-loading-screen');

  try {
    // 1. Asynchronous Session Verification (/api/auth/me)
    if (currentToken) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          currentUser = data.user;
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // Token expired or invalid -> Clear session
          currentUser = null;
          currentToken = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.warn('Session verification warning:', err);
      }
    }

    // 2. Render Target View Silently (Before Fading Out Loading Screen)
    if (currentUser && currentToken) {
      if (landingPortal) landingPortal.style.display = 'none';
      if (appWorkspace) appWorkspace.style.display = 'flex';

      updateUserUi();
      populateDropdowns();
      bindForms();
      loadMetadata();

      // Determine workspace initial tab
      const hashTab = location.hash ? location.hash.replace('#', '') : null;
      let targetTab = hashTab || (currentUser.role_name === 'Vatandaş' ? 'my-complaints' : 'dashboard');
      if (currentUser.role_name === 'Personel' && (!hashTab || hashTab === 'dashboard')) {
        targetTab = 'complaints';
      }

      await switchWorkspaceTab(targetTab, false);
      setInterval(checkNotifications, 30000);
    } else {
      if (appWorkspace) appWorkspace.style.display = 'none';
      if (landingPortal) landingPortal.style.display = 'flex';
      populateDropdowns();
      bindForms();
    }
  } catch (err) {
    console.error('App init error:', err);
    if (appWorkspace) appWorkspace.style.display = 'none';
    if (landingPortal) landingPortal.style.display = 'flex';
  } finally {
    // 3. Smooth Fade-Out Loading Screen (0% FOUC)
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 350);
    }
  }
}

// Switch Landing Auth Tabs
function switchAuthTab(type) {
  const citTab = document.getElementById('tab-cit-btn');
  const empTab = document.getElementById('tab-emp-btn');
  const citForm = document.getElementById('auth-form-citizen');
  const empForm = document.getElementById('auth-form-employee');

  if (type === 'citizen') {
    citTab.classList.add('active');
    empTab.classList.remove('active');
    citForm.style.display = 'block';
    empForm.style.display = 'none';
  } else {
    empTab.classList.add('active');
    citTab.classList.remove('active');
    empForm.style.display = 'block';
    citForm.style.display = 'none';
  }
}

// Quick Demo Login Shortcut Button
async function quickDemoLogin(email) {
  switchAuthTab('employee');
  const emailInput = document.getElementById('login-emp-email');
  const passInput = document.getElementById('login-emp-password');

  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = '123456';

  showToast(`${email} hesabı ile giriş yapılıyor...`, 'info');
  await executeLogin(email, '123456');
}

// Guest Attempting Complaint Notice
function triggerGuestComplaintNotice() {
  if (!currentUser) {
    showToast('Talep ve şikâyet oluşturabilmek için lütfen giriş yapın veya kayıt olun.', 'info');
    switchAuthTab('citizen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    openModal('modal-new-complaint');
  }
}

// Perform Login API Call
async function handleAuthLogin(e, roleType) {
  if (e) e.preventDefault();
  const email = roleType === 'personel'
    ? document.getElementById('login-emp-email').value
    : document.getElementById('login-cit-email').value;
  const password = roleType === 'personel'
    ? document.getElementById('login-emp-password').value
    : document.getElementById('login-cit-password').value;

  await executeLogin(email, password);
}

async function executeLogin(email, password) {
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

      history.replaceState(null, '', location.pathname);
      showToast(`Hoş Geldiniz, ${data.user.full_name || data.user.email}!`, 'success');
      updateUserUi();

      let targetTab = currentUser.role_name === 'Vatandaş' ? 'my-complaints' : (currentUser.role_name === 'Personel' ? 'complaints' : 'dashboard');
      await switchWorkspaceTab(targetTab, false);
    } else {
      showToast(data.message || 'Giriş yapılamadı.', 'error');
    }
  } catch (err) {
    showToast('Sunucu bağlantı hatası.', 'error');
  }
}

// Logout with History Reset
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = null;
  currentUser = null;
  history.replaceState(null, '', location.pathname);

  const landingPortal = document.getElementById('landing-portal');
  const appWorkspace = document.getElementById('app-workspace');
  if (appWorkspace) appWorkspace.style.display = 'none';
  if (landingPortal) landingPortal.style.display = 'flex';

  showToast('Oturum kapatıldı.', 'info');
}

// Master UI Router & Workspace Switcher with Strict Role Scoping
function updateUserUi() {
  const landingPortal = document.getElementById('landing-portal');
  const appWorkspace = document.getElementById('app-workspace');

  if (!currentUser || !currentToken) {
    if (landingPortal) landingPortal.style.display = 'flex';
    if (appWorkspace) appWorkspace.style.display = 'none';
    return;
  }

  if (landingPortal) landingPortal.style.display = 'none';
  if (appWorkspace) appWorkspace.style.display = 'flex';

  const sbName = document.getElementById('sb-user-name');
  const sbRole = document.getElementById('sb-user-role');
  const tbName = document.getElementById('topbar-user-fullname');
  const tbRole = document.getElementById('topbar-user-role');

  if (sbName) sbName.textContent = currentUser.full_name || currentUser.email;
  if (sbRole) sbRole.textContent = currentUser.role_name + (currentUser.department_name ? ` (${currentUser.department_name})` : '');
  if (tbName) tbName.textContent = currentUser.full_name || currentUser.email;
  if (tbRole) tbRole.textContent = currentUser.role_name + (currentUser.department_name ? ` (${currentUser.department_name})` : '');

  // Menu Items
  const dashNav = document.getElementById('nav-dash');
  const allComplaintsNav = document.getElementById('nav-complaints');
  const myComplaintsNav = document.getElementById('nav-my-complaints');
  const deptsNav = document.getElementById('nav-depts-menu');
  const publicFeedNav = document.getElementById('nav-public-feed');
  const adminUsersNav = document.getElementById('nav-admin-users');
  const adminDeptsNav = document.getElementById('nav-admin-depts');
  const adminLogsNav = document.getElementById('nav-admin-logs');

  const complaintsNavSpan = allComplaintsNav?.querySelector('span');
  const currentHashTab = location.hash ? location.hash.replace('#', '') : null;
  let defaultRoleTab = 'dashboard';

  const reportsNav = document.getElementById('nav-reports');
  const helpNav = document.getElementById('nav-help');
  const announcementsNav = document.getElementById('nav-announcements');
  const btnAdminAnnouncement = document.getElementById('btn-admin-add-announcement');

  if (currentUser.role_name === 'Vatandaş') {
    // VATANDAŞ: Gösterge Paneli, Başvurularım, Kamuya Açık Talepler, Duyurular
    if (dashNav) dashNav.style.display = 'block';
    if (myComplaintsNav) myComplaintsNav.style.display = 'block';
    if (allComplaintsNav) allComplaintsNav.style.display = 'none';
    if (deptsNav) deptsNav.style.display = 'none';
    if (publicFeedNav) publicFeedNav.style.display = 'block';
    if (announcementsNav) announcementsNav.style.display = 'block';

    if (reportsNav) reportsNav.style.display = 'none';
    if (helpNav) helpNav.style.display = 'none';

    if (adminUsersNav) adminUsersNav.style.display = 'none';
    if (adminDeptsNav) adminDeptsNav.style.display = 'none';
    if (adminLogsNav) adminLogsNav.style.display = 'none';
    if (btnAdminAnnouncement) btnAdminAnnouncement.style.display = 'none';

    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) scopeSelect.style.display = 'none';

    defaultRoleTab = 'my-complaints';
  } else if (currentUser.role_name === 'Birim Yöneticisi') {
    // BİRİM YÖNETİCİSİ (Fen İşleri Müdürü):
    if (dashNav) dashNav.style.display = 'block';
    if (myComplaintsNav) myComplaintsNav.style.display = 'none';
    if (deptsNav) deptsNav.style.display = 'none';
    if (allComplaintsNav) {
      allComplaintsNav.style.display = 'block';
      if (complaintsNavSpan) complaintsNavSpan.textContent = `${currentUser.department_name || 'Birim'} Talepleri`;
    }
    if (publicFeedNav) publicFeedNav.style.display = 'block';

    if (adminUsersNav) adminUsersNav.style.display = 'none';
    if (adminDeptsNav) adminDeptsNav.style.display = 'none';
    if (adminLogsNav) adminLogsNav.style.display = 'none';

    // Scope dropdown setup for Manager
    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) {
      scopeSelect.style.display = 'inline-block';
      scopeSelect.innerHTML = `
        <option value="ALL">🏢 Birimime Gelen Tüm Talepler</option>
        <option value="UNASSIGNED">⏳ Atama Bekleyenler</option>
        <option value="ASSIGNED">👥 Personele Atananlar</option>
        <option value="FORWARDED">🔄 Diğer Birimlerden Yönlendirilenler</option>
      `;
    }

    defaultRoleTab = 'complaints';
  } else if (currentUser.role_name === 'Personel') {
    // PERSONEL (Ali Usta - Field Staff):
    if (dashNav) dashNav.style.display = 'none';
    if (myComplaintsNav) myComplaintsNav.style.display = 'none';
    if (deptsNav) deptsNav.style.display = 'none';
    if (allComplaintsNav) {
      allComplaintsNav.style.display = 'block';
      if (complaintsNavSpan) complaintsNavSpan.textContent = `${currentUser.department_name || 'Birim'} Talepleri`;
    }
    if (publicFeedNav) publicFeedNav.style.display = 'none';

    if (adminUsersNav) adminUsersNav.style.display = 'none';
    if (adminDeptsNav) adminDeptsNav.style.display = 'none';
    if (adminLogsNav) adminLogsNav.style.display = 'none';

    // Scope dropdown setup for Field Staff
    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) {
      scopeSelect.style.display = 'inline-block';
      scopeSelect.innerHTML = `
        <option value="ALL">🏢 Tüm Birim Talepleri</option>
        <option value="MY_ASSIGNED" selected>👤 Şahsıma Atanan Görevler</option>
        <option value="FORWARDED">🔄 Yönlendirilen Talepler</option>
      `;
    }

    defaultRoleTab = 'complaints';
  } else if (currentUser.role_name === 'Sistem Yöneticisi') {
    // ADMIN: Full System Access
    if (dashNav) dashNav.style.display = 'block';
    if (myComplaintsNav) myComplaintsNav.style.display = 'block';
    if (allComplaintsNav) {
      allComplaintsNav.style.display = 'block';
      if (complaintsNavSpan) complaintsNavSpan.textContent = 'Tüm Talepler';
    }
    if (deptsNav) deptsNav.style.display = 'block';
    if (publicFeedNav) publicFeedNav.style.display = 'block';

    if (adminUsersNav) adminUsersNav.style.display = 'block';
    if (adminDeptsNav) adminDeptsNav.style.display = 'block';
    if (adminLogsNav) adminLogsNav.style.display = 'block';
    if (btnAdminAnnouncement) btnAdminAnnouncement.style.display = 'inline-flex';

    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) {
      scopeSelect.innerHTML = `
        <option value="ALL">🏢 Tüm Sistem Talepleri</option>
        <option value="FORWARDED">🔄 Yönlendirilen Talepler</option>
      `;
    }

    defaultRoleTab = 'dashboard';
  }

  // Initial Route Resolution
  const initialTab = currentHashTab || defaultRoleTab;
  switchWorkspaceTab(initialTab, false);

  // Check Notifications
  checkNotifications();
}

// Mobile Sidebar Toggle Handler
function toggleMobileSidebar(forceState) {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;

  const isActive = sidebar.classList.contains('active');
  const shouldOpen = (forceState !== undefined) ? forceState : !isActive;

  if (shouldOpen) {
    sidebar.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
  } else {
    sidebar.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  }
}

// Sidebar Tab Switcher with HTML5 History API Routing & Route Guard
async function switchWorkspaceTab(tabName, pushState = true) {
  if (!currentUser || !currentToken) {
    const landingPortal = document.getElementById('landing-portal');
    const appWorkspace = document.getElementById('app-workspace');
    if (appWorkspace) appWorkspace.style.display = 'none';
    if (landingPortal) landingPortal.style.display = 'flex';
    return;
  }

  toggleMobileSidebar(false);

  const targetTab = tabName || 'dashboard';

  const secDash = document.getElementById('sec-dashboard');
  const secComp = document.getElementById('sec-complaints');
  const secMap = document.getElementById('sec-map');
  const secPublicFeed = document.getElementById('sec-public-feed');
  const secAdminUsers = document.getElementById('sec-admin-users');
  const secAdminDepts = document.getElementById('sec-admin-depts');
  const secAdminLogs = document.getElementById('sec-admin-logs');
  const secDeptStaff = document.getElementById('sec-dept-staff');
  const secCreateComp = document.getElementById('sec-create-complaint');
  const secAnnouncements = document.getElementById('sec-announcements');
  const secReports = document.getElementById('sec-reports');
  const secHelp = document.getElementById('sec-help');
  const pageTitle = document.getElementById('ws-page-title');

  if (secDash) secDash.style.display = 'none';
  if (secComp) secComp.style.display = 'none';
  if (secMap) secMap.style.display = 'none';
  if (secPublicFeed) secPublicFeed.style.display = 'none';
  if (secAdminUsers) secAdminUsers.style.display = 'none';
  if (secAdminDepts) secAdminDepts.style.display = 'none';
  if (secAdminLogs) secAdminLogs.style.display = 'none';
  if (secDeptStaff) secDeptStaff.style.display = 'none';
  if (secCreateComp) secCreateComp.style.display = 'none';
  if (secAnnouncements) secAnnouncements.style.display = 'none';
  if (secReports) secReports.style.display = 'none';
  if (secHelp) secHelp.style.display = 'none';

  document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));

  // Update HTML5 History API PushState
  if (pushState !== false) {
    const newHash = '#' + targetTab;
    if (location.hash !== newHash) {
      history.pushState({ tab: targetTab }, '', newHash);
    }
  }

  if (targetTab === 'dashboard') {
    if (secDash) secDash.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Gösterge Paneli';
    document.getElementById('nav-dash')?.classList.add('active');
    await loadDashboardData();
  } else if (targetTab === 'create-complaint') {
    if (secCreateComp) secCreateComp.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Talep Oluştur & Süreç Takibi';
    document.getElementById('nav-create-complaint')?.classList.add('active');
    initPageCreateComplaint();
  } else if (targetTab === 'my-complaints') {
    if (secComp) secComp.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Başvurularım';
    document.getElementById('nav-my-complaints')?.classList.add('active');
    await loadComplaintsTable(true);
  } else if (targetTab === 'public-feed') {
    if (secPublicFeed) secPublicFeed.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Kamuya Açık Talepler';
    document.getElementById('nav-public-feed')?.classList.add('active');
    await loadPublicComplaintsFeed();
  } else if (targetTab === 'complaints') {
    if (secComp) secComp.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Tüm Talepler';
    document.getElementById('nav-complaints')?.classList.add('active');
    await loadComplaintsTable(false);
  } else if (targetTab === 'map') {
    if (secMap) secMap.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Harita Analizi';
    document.getElementById('nav-map')?.classList.add('active');
    await loadMapData();
  } else if (targetTab === 'admin-users') {
    if (secAdminUsers) secAdminUsers.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Kullanıcı Yönetimi';
    document.getElementById('nav-admin-users')?.classList.add('active');
    await loadAdminUsersTable();
  } else if (targetTab === 'admin-depts') {
    if (secAdminDepts) secAdminDepts.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Müdürlük Yönetimi';
    document.getElementById('nav-admin-depts')?.classList.add('active');
    await loadAdminDeptsTable();
  } else if (targetTab === 'admin-logs') {
    if (secAdminLogs) secAdminLogs.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Audit Logları';
    document.getElementById('nav-admin-logs')?.classList.add('active');
    await loadAdminLogsTable();
  } else if (targetTab === 'reports') {
    if (secReports) secReports.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Yönetimsel Raporlar & Analitik Paneli';
    document.getElementById('nav-reports')?.classList.add('active');
    await loadReportsAnalytics();
  } else if (targetTab === 'announcements') {
    if (secAnnouncements) secAnnouncements.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Resmi Belediye Duyuruları';
    document.getElementById('nav-announcements')?.classList.add('active');
    await loadAnnouncements();
  } else if (targetTab === 'help') {
    if (secHelp) secHelp.style.display = 'block';
    if (pageTitle) pageTitle.textContent = '153 Çözüm Merkezi Yardım & SSS';
    document.getElementById('nav-help')?.classList.add('active');
  }
}

// Global Browser History Back/Forward Handler
window.addEventListener('popstate', (e) => {
  if (currentUser && currentToken) {
    const tabFromState = (e.state && e.state.tab) || (location.hash ? location.hash.replace('#', '') : null);
    const defaultRoleTab = (currentUser.role_name === 'Vatandaş') ? 'my-complaints' :
                           (currentUser.role_name === 'Personel') ? 'complaints' : 'dashboard';
    const targetTab = tabFromState || defaultRoleTab;
    switchWorkspaceTab(targetTab, false);
  }
});

// Toggle Department Submenu
function toggleDeptSubmenu(e) {
  if (e) e.preventDefault();
  const menuItem = document.getElementById('nav-depts-menu');
  if (menuItem) menuItem.classList.toggle('open');
}

// Filter Complaints by Department
async function filterByDepartment(deptId, deptName) {
  showToast(`${deptName} talepleri filtreleniyor...`, 'info');
  await switchWorkspaceTab('complaints');
  await loadComplaintsTable(false, deptId);
}

// DEDICATED CALL: Load Public Complaints Feed (/api/complaints/public)
async function loadPublicComplaintsFeed() {
  try {
    const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
    const res = await fetch('/api/complaints/public', { headers });
    const data = await res.json();
    const container = document.getElementById('public-feed-container');
    if (!container) return;

    const publicList = data.success && data.complaints ? data.complaints : [];

    if (publicList.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;" class="card-box">Henüz kamuya açık talep bulunmuyor.</div>`;
      return;
    }

    container.innerHTML = publicList.map(c => `
      <div class="card-box" style="display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <span class="badge ${getBadgeClass(c.status)}">${c.status}</span>
            <small style="color: #94a3b8; font-weight: 600;">${new Date(c.created_at).toLocaleDateString('tr-TR')}</small>
          </div>
          <h4 style="color: var(--portal-blue-primary); margin-bottom: 8px;">${c.title}</h4>
          <p style="font-size: 0.88rem; color: #475569; margin-bottom: 14px;">${c.description}</p>
          
          ${c.first_photo ? `
            <div style="margin-bottom: 14px;">
              <img src="/${c.first_photo}" alt="Talep Fotoğrafı" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open(this.src)" />
            </div>
          ` : ''}

          <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 14px;">
            <i class="fas fa-location-dot" style="color: #ef4444;"></i> ${c.neighborhood_name} | ${c.category_name}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="openComplaintDetail('${c.tracking_code}')">
            <i class="fas fa-eye"></i> Detay
          </button>

          ${c.has_upvoted ? `
            <button type="button" class="btn btn-sm" style="background: #10b981; color: #ffffff;" onclick="upvoteComplaint(${c.id})">
              <i class="fas fa-check"></i> Destek Verildi ( ${c.upvote_count} )
            </button>
          ` : `
            <button type="button" class="btn btn-primary btn-sm" onclick="upvoteComplaint(${c.id})">
              <i class="fas fa-thumbs-up"></i> Destek Ol ( ${c.upvote_count} )
            </button>
          `}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Public feed load error:', err);
  }
}

// Real User-Based Upvote / Downvote Toggle Action
async function upvoteComplaint(complaintId) {
  if (!currentUser || !currentToken) {
    showToast('Destek vermek için lütfen önce giriş yapınız.', 'info');
    return;
  }

  try {
    const res = await fetch(`/api/complaints/${complaintId}/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });
    const data = await res.json();

    if (data.success) {
      if (data.has_upvoted) {
        showToast('Talebe başarıyla destek verdiniz!', 'success');
      } else {
        showToast('Desteğinizi geri çektiniz.', 'info');
      }
      await loadPublicComplaintsFeed();
    } else {
      showToast(data.message || 'Destek verilirken hata oluştu.', 'error');
    }
  } catch (err) {
    console.error('Upvote error:', err);
    showToast('Sunucu hatası oluştu.', 'error');
  }
}

let currentFetchedComplaints = [];

function getBadgeClass(status) {
  if (status === 'Çözüldü') return 'badge-resolved';
  if (status === 'İşlem devam ediyor' || status === 'İşlemde') return 'badge-in-progress';
  if (status === 'Personele atandı') return 'badge-assigned';
  if (status === 'İlgili birime yönlendirildi' || status === 'Müdürlüğe iletildi') return 'badge-forwarded';
  if (status === 'İptal edildi' || status === 'Reddedildi') return 'badge-rejected';
  return 'badge-new';
}

function populateCategoryFilterDropdown() {
  const catSelect = document.getElementById('filter-complaint-category');
  if (catSelect && categoriesList && categoriesList.length > 0) {
    catSelect.innerHTML = '<option value="ALL">Tüm Kategoriler</option>' +
      categoriesList.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
  }
}

function populateNeighborhoodFilterDropdown() {
  const neighSelect = document.getElementById('filter-complaint-neighborhood');
  if (neighSelect && neighborhoodsList && neighborhoodsList.length > 0) {
    neighSelect.innerHTML = '<option value="ALL">Tüm Mahalleler</option>' +
      neighborhoodsList.map(n => `<option value="${n.name}">${n.name}</option>`).join('');
  }
}

function getCategoryBadge(categoryName) {
  const name = categoryName || '';
  if (name.includes('Ulaşım') || name.includes('Yol')) {
    return `<span style="background: #f3e8ff; color: #7c3aed; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-car-side"></i> ${name}</span>`;
  }
  if (name.includes('Çevre') || name.includes('Çöp') || name.includes('Temizlik')) {
    return `<span style="background: #ecfdf5; color: #059669; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-leaf"></i> ${name}</span>`;
  }
  if (name.includes('Altyapı') || name.includes('Asfalt') || name.includes('Su')) {
    return `<span style="background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-wrench"></i> ${name}</span>`;
  }
  if (name.includes('Park') || name.includes('Bahçe') || name.includes('Ağaç')) {
    return `<span style="background: #f0fdf4; color: #16a34a; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-tree"></i> ${name}</span>`;
  }
  return `<span style="background: #f8fafc; color: #64748b; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-tag"></i> ${name}</span>`;
}

// DEDICATED CALLS: loadComplaintsTable (Separated /my vs /all routes with Live Filters)
async function loadComplaintsTable(mineOnly = false, deptId = null) {
  try {
    let url = '/api/complaints/all';

    if (mineOnly || (currentUser && currentUser.role_name === 'Vatandaş')) {
      url = '/api/complaints/my'; // STRICT DEDICATED ROUTE FOR USER'S OWN COMPLAINTS
    } else if (deptId) {
      url = `/api/complaints/all?department_id=${deptId}`;
    }

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('tbody-complaints');
    if (!tbody) return;

    if (!data.success || !data.complaints || data.complaints.length === 0) {
      currentFetchedComplaints = [];
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 24px;">Kayıtlı başvuru bulunmamaktadır.</td></tr>`;
      return;
    }

    currentFetchedComplaints = data.complaints;
    populateCategoryFilterDropdown();
    populateNeighborhoodFilterDropdown();
    applyComplaintFilters();

  } catch (err) {
    console.error('Complaints load error:', err);
  }
}

// Live Filter Engine for Complaints Table
function applyComplaintFilters() {
  const tbody = document.getElementById('tbody-complaints');
  if (!tbody || !currentFetchedComplaints) return;

  const searchQuery = (document.getElementById('filter-complaint-search')?.value || '').toLowerCase().trim();
  const scopeFilter = document.getElementById('filter-complaint-scope')?.value || 'ALL';
  const statusFilter = document.getElementById('filter-complaint-status')?.value || 'ALL';
  const dateFilter = document.getElementById('filter-complaint-date')?.value || 'ALL';
  const categoryFilter = document.getElementById('filter-complaint-category')?.value || 'ALL';
  const neighFilter = document.getElementById('filter-complaint-neighborhood')?.value || 'ALL';
  const sortFilter = document.getElementById('filter-complaint-sort')?.value || 'DESC';

  const now = new Date();

  let filtered = currentFetchedComplaints.filter(c => {
    // 0. Scope Filter Check
    if (scopeFilter !== 'ALL') {
      if (scopeFilter === 'MY_ASSIGNED') {
        if (!c.is_assigned_to_me) return false;
      } else if (scopeFilter === 'FORWARDED') {
        if (!c.is_forwarded) return false;
      } else if (scopeFilter === 'UNASSIGNED') {
        if (c.status !== 'Yeni' && c.status !== 'Müdürlüğe iletildi') return false;
      } else if (scopeFilter === 'ASSIGNED') {
        if (c.status !== 'Personele atandı' && c.status !== 'İşlem devam ediyor') return false;
      }
    }

    // 1. Search Query Filter
    if (searchQuery) {
      const trackingCode = (c.tracking_code || '').toLowerCase();
      const title = (c.title || '').toLowerCase();
      const neighborhood = (c.neighborhood_name || '').toLowerCase();
      const category = (c.category_name || '').toLowerCase();

      const matchSearch = trackingCode.includes(searchQuery) ||
                          title.includes(searchQuery) ||
                          neighborhood.includes(searchQuery) ||
                          category.includes(searchQuery);

      if (!matchSearch) return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'URGENT') {
        if (c.urgency_level !== 'Acil' && c.urgency_level !== 'Kritik') return false;
      } else if (statusFilter === 'Müdürlüğe iletildi') {
        if (c.status !== 'Müdürlüğe iletildi' && c.status !== 'Birimine Yönlendirildi') return false;
      } else if (statusFilter === 'İşlem devam ediyor') {
        if (c.status !== 'İşlem devam ediyor' && c.status !== 'İşlemde') return false;
      } else {
        if (c.status !== statusFilter) return false;
      }
    }

    // 3. Category Filter
    if (categoryFilter !== 'ALL') {
      if (c.category_id != categoryFilter) return false;
    }

    // 4. Neighborhood Filter
    if (neighFilter !== 'ALL') {
      if (! (c.neighborhood_name || '').includes(neighFilter)) return false;
    }

    // 5. Date Filter
    if (dateFilter !== 'ALL') {
      const cDate = new Date(c.created_at);
      const diffDays = (now - cDate) / (1000 * 60 * 60 * 24);

      if (dateFilter === 'TODAY' && diffDays > 1) return false;
      if (dateFilter === 'WEEK' && diffDays > 7) return false;
      if (dateFilter === 'MONTH' && diffDays > 30) return false;
    }

    return true;
  });

  // Sort Order
  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortFilter === 'ASC' ? dateA - dateB : dateB - dateA;
  });

  // Update total counts display
  const totalCountSpan = document.getElementById('complaint-total-count');
  if (totalCountSpan) totalCountSpan.textContent = filtered.length;

  renderFilteredComplaintsTableRows(filtered);
}

function renderFilteredComplaintsTableRows(complaintsList) {
  const tbody = document.getElementById('tbody-complaints');
  if (!tbody) return;

  if (!complaintsList || complaintsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 24px;">Filtrelere uygun başvuru bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = complaintsList.map(c => {
    let subTypeBadge = c.submission_type === 'Soru / Bilgi Talebi'
      ? '<span class="badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:0.72rem; margin-top:4px; display:inline-block;"><i class="fas fa-circle-question"></i> Soru / Bilgi Talebi</span>'
      : (c.submission_type === 'Öneri / İstek'
          ? '<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-size:0.72rem; margin-top:4px; display:inline-block;"><i class="fas fa-lightbulb"></i> Öneri / İstek</span>'
          : '<span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; font-size:0.72rem; margin-top:4px; display:inline-block;"><i class="fas fa-triangle-exclamation"></i> Şikâyet</span>');

    const isQuestionOrIdea = c.submission_type === 'Soru / Bilgi Talebi' || c.submission_type === 'Öneri / İstek';

    return `
    <tr>
      <td><strong style="color: var(--portal-blue-primary); cursor: pointer;" onclick="openComplaintDetail('${c.tracking_code}')">${c.tracking_code}</strong></td>
      <td style="font-weight: 600;">
        <div>${c.title}</div>
        ${subTypeBadge}
      </td>
      <td>${getCategoryBadge(c.category_name)}</td>
      <td>${c.neighborhood_name || '-'}</td>
      <td><span class="badge ${getBadgeClass(c.status)}">${c.status}</span></td>
      <td><small style="color: #64748b; font-weight: 500;">${new Date(c.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</small></td>
      <td style="white-space: nowrap;">
        <button class="btn btn-secondary btn-icon-action" onclick="openComplaintDetail('${c.tracking_code}')" title="Detay İncele">
          <i class="fas fa-eye"></i>
        </button>
        ${currentUser && (currentUser.role_name === 'Birim Yöneticisi' || currentUser.role_name === 'Sistem Yöneticisi') ? `
          ${isQuestionOrIdea ? `
            <button class="btn btn-primary btn-sm" onclick="openActionModal(${c.id})" style="background: linear-gradient(135deg, #0284c7, #0369a1);" title="Cevapla & Bilgilendir">
              <i class="fas fa-comment-dots"></i> Cevapla
            </button>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="openAssignModal(${c.id}, ${c.department_id})" title="Görev Atayınız">
              <i class="fas fa-user-plus"></i> Atayınız
            </button>
          `}
          <button class="btn btn-secondary btn-sm" onclick="openForwardDeptModal(${c.id})" style="background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5;" title="Başka Birime Yönlendir">
            <i class="fas fa-right-left"></i> Birim Yönlendir
          </button>
        ` : ''}
        ${currentUser && currentUser.role_name === 'Personel' ? `
          <button class="btn btn-primary btn-sm" onclick="openActionModal(${c.id})">
            <i class="fas fa-wrench"></i> İşlem Yap
          </button>
        ` : ''}
      </td>
    </tr>
  `;
  }).join('');
}

function resetComplaintFilters() {
  if (document.getElementById('filter-complaint-search')) document.getElementById('filter-complaint-search').value = '';
  if (document.getElementById('filter-complaint-status')) document.getElementById('filter-complaint-status').value = 'ALL';
  if (document.getElementById('filter-complaint-date')) document.getElementById('filter-complaint-date').value = 'ALL';
  if (document.getElementById('filter-complaint-category')) document.getElementById('filter-complaint-category').value = 'ALL';
  if (document.getElementById('filter-complaint-neighborhood')) document.getElementById('filter-complaint-neighborhood').value = 'ALL';
  if (document.getElementById('filter-complaint-sort')) document.getElementById('filter-complaint-sort').value = 'DESC';

  applyComplaintFilters();
  showToast('Filtreler temizlendi.', 'info');
}

// Load Dashboard Data & Charts
async function loadDashboardData() {
  try {
    const res = await fetch('/api/stats/dashboard', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && data.kpis) {
      if (document.getElementById('kpi-total')) document.getElementById('kpi-total').textContent = data.kpis.total;
      if (document.getElementById('kpi-pending')) document.getElementById('kpi-pending').textContent = data.kpis.pending;
      if (document.getElementById('kpi-resolved')) document.getElementById('kpi-resolved').textContent = data.kpis.resolved;
      if (document.getElementById('kpi-avg-days')) document.getElementById('kpi-avg-days').textContent = data.kpis.avg_days;
      if (document.getElementById('kpi-rate')) document.getElementById('kpi-rate').textContent = data.kpis.resolution_rate;

      renderDashboardCharts(data.charts);
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

// DEDICATED CALL: Load Map Data (Filtered for Citizen Map Privacy with 100% Dynamic Metrics)
async function loadMapData() {
  try {
    const isCitizen = currentUser && currentUser.role_name === 'Vatandaş';
    const url = isCitizen ? '/api/complaints/public' : '/api/complaints/all';

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && data.complaints) {
      const complaints = data.complaints;

      // 1. Initialize Map
      initExplorerMap('map-container', complaints);

      // 2. Dynamic KPI Counts
      const totalCount = complaints.length;
      const resolvedCount = complaints.filter(c => c.status === 'Çözüldü').length;
      const pendingCount = complaints.filter(c => ['İlgili birime yönlendirildi', 'Personele atandı', 'İşlem devam ediyor'].includes(c.status)).length;
      const newCount = complaints.filter(c => c.status === 'Yeni').length;
      const resRate = totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) : '0';

      const totalEl = document.getElementById('map-kpi-total');
      const resEl = document.getElementById('map-kpi-resolved');
      const pendEl = document.getElementById('map-kpi-pending');
      const newEl = document.getElementById('map-kpi-new');

      if (totalEl) totalEl.textContent = totalCount;
      if (resEl) {
        resEl.textContent = resolvedCount;
        const sub = resEl.nextElementSibling;
        if (sub) sub.textContent = `%${resRate} çözüm oranı`;
      }
      if (pendEl) pendEl.textContent = pendingCount;
      if (newEl) newEl.textContent = newCount;

      // 3. Top Yoğunluklu Bölgeler Widget List
      const neighCounts = {};
      complaints.forEach(c => {
        const name = c.neighborhood_name || 'Hacısıyam Mahallesi';
        neighCounts[name] = (neighCounts[name] || 0) + 1;
      });

      const sortedNeighs = Object.keys(neighCounts)
        .map(name => ({ name, count: neighCounts[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topRegionsListEl = document.getElementById('map-top-regions-list');
      if (topRegionsListEl && sortedNeighs.length > 0) {
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#2563eb'];
        topRegionsListEl.innerHTML = sortedNeighs.map((n, i) => `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0;">
            <span style="display: flex; align-items: center; gap: 8px;"><span style="color: ${colors[i % colors.length]};">●</span> <strong>${n.name}</strong></span>
            <strong style="color: #0f172a;">${n.count}</strong>
          </div>
        `).join('');
      }

      // 4. Dynamic Category Doughnut Chart
      const catCounts = {};
      complaints.forEach(c => {
        const cat = c.category_name || 'Genel';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
      if (typeof initMapDoughnutChart === 'function') {
        initMapDoughnutChart(catCounts);
      }
    }
  } catch (err) {
    console.error('Map load error:', err);
  }
}

// =========================================================
// OFFICIAL ANNOUNCEMENTS MANAGEMENT
// =========================================================
async function loadAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    const container = document.getElementById('announcements-container');
    const addBtn = document.getElementById('btn-admin-add-announcement');

    if (currentUser && currentUser.role_name === 'Sistem Yöneticisi') {
      if (addBtn) addBtn.style.display = 'inline-flex';
    } else {
      if (addBtn) addBtn.style.display = 'none';
    }

    if (!container) return;
    const list = data.success && data.announcements ? data.announcements : [];

    if (list.length === 0) {
      container.innerHTML = '<div class="card-box" style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">Henüz yayınlanmış bir duyuru bulunmuyor.</div>';
      return;
    }

    container.innerHTML = list.map(a => {
      let categoryBadgeClass = 'badge-yeni';
      if (a.category && a.category.includes('Su')) categoryBadgeClass = 'badge-urgent';
      else if (a.category && a.category.includes('Yol')) categoryBadgeClass = 'badge-devam';
      else if (a.category && a.category.includes('Etkinlik')) categoryBadgeClass = 'badge-cozuldu';

      let dateFormatted = a.created_at ? new Date(a.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : 'Tarih Belirtilmedi';

      const isAdminUser = currentUser && currentUser.role_name === 'Sistem Yöneticisi';

      return `
        <div class="card-box" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span class="badge ${categoryBadgeClass}">${a.category || 'Genel Duyuru'}</span>
              <span style="font-size: 0.76rem; color: #94a3b8; font-weight: 600;"><i class="fas fa-clock" style="margin-right: 4px;"></i> ${dateFormatted}</span>
            </div>
            <h4 style="color: var(--portal-blue-primary); font-size: 1.05rem; margin-bottom: 10px; line-height: 1.4;">${a.title}</h4>
            <p style="font-size: 0.88rem; color: #475569; line-height: 1.6; margin-bottom: 16px;">${a.content}</p>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 10px; margin-top: 10px; font-size: 0.8rem; color: #64748b;">
            <span><i class="fas fa-user-shield" style="color: var(--portal-blue-accent); margin-right: 4px;"></i> ${a.created_by_name || 'Giresun Belediyesi'}</span>
            ${isAdminUser ? `
              <button class="btn btn-secondary btn-sm" style="color: #ef4444; padding: 4px 8px; font-size: 0.75rem;" onclick="deleteAnnouncement(${a.id})">
                <i class="fas fa-trash-can"></i> Sil
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Load announcements error:', err);
  }
}

async function handleCreateAnnouncementSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('announcement-title').value.trim();
  const category = document.getElementById('announcement-category').value;
  const priority = document.getElementById('announcement-priority').value;
  const content = document.getElementById('announcement-content').value.trim();

  try {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ title, category, priority, content })
    });
    const data = await res.json();
    if (data.success) {
      showToast('📢 Yeni duyuru başarıyla yayınlandı!', 'success');
      closeModal('modal-new-announcement');
      document.getElementById('form-new-announcement').reset();
      await loadAnnouncements();
    } else {
      showToast(data.message || 'Duyuru yayınlanamadı.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
  try {
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Duyuru silindi.', 'info');
      await loadAnnouncements();
    }
  } catch (err) {
    showToast('Silme hatası.', 'error');
  }
}

// =========================================================
// ADMIN USER MANAGEMENT & CONTROL SYSTEM
// =========================================================
let currentFetchedAdminUsers = [];
let currentUserTab = 'ALL';

async function loadAdminUsersTable() {
  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success && data.users) {
      currentFetchedAdminUsers = data.users;
      
      // Populate department filter dropdowns
      populateAdminUserDepartmentDropdowns();

      applyAdminUserFilters();
    }
  } catch (err) {
    console.error('loadAdminUsersTable error:', err);
    showToast('Kullanıcı listesi yüklenemedi.', 'error');
  }
}

function populateAdminUserDepartmentDropdowns() {
  const filterDeptSelect = document.getElementById('filter-user-dept');
  const modalDeptSelect = document.getElementById('admin-user-dept');

  const depts = departmentsList && departmentsList.length > 0 
    ? departmentsList 
    : [
        { id: 1, name: 'Fen İşleri Müdürlüğü' },
        { id: 2, name: 'Temizlik İşleri Müdürlüğü' },
        { id: 3, name: 'Park ve Bahçeler Müdürlüğü' },
        { id: 4, name: 'Zabıta Müdürlüğü' },
        { id: 5, name: 'Su ve Kanalizasyon Müdürlüğü' }
      ];

  if (filterDeptSelect) {
    const currVal = filterDeptSelect.value;
    filterDeptSelect.innerHTML = `<option value="ALL">🏢 Tüm Birimler / Müdürlükler</option>` + 
      depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    filterDeptSelect.value = currVal || 'ALL';
  }

  if (modalDeptSelect) {
    modalDeptSelect.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }
}

function switchUserTab(tab) {
  currentUserTab = tab;
  document.querySelectorAll('.user-tab-btn').forEach(btn => btn.classList.remove('active'));
  
  if (tab === 'ALL') document.getElementById('btn-user-tab-all')?.classList.add('active');
  if (tab === 'STAFF') document.getElementById('btn-user-tab-staff')?.classList.add('active');
  if (tab === 'CITIZEN') document.getElementById('btn-user-tab-citizen')?.classList.add('active');

  applyAdminUserFilters();
}

function applyAdminUserFilters() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('filter-user-search')?.value || '').trim().toLowerCase();
  const selectedDept = document.getElementById('filter-user-dept')?.value || 'ALL';
  const selectedRole = document.getElementById('filter-user-role')?.value || 'ALL';

  let filtered = currentFetchedAdminUsers.filter(u => {
    // 1. Tab filter
    if (currentUserTab === 'STAFF' && u.role_name === 'Vatandaş') return false;
    if (currentUserTab === 'CITIZEN' && u.role_name !== 'Vatandaş') return false;

    // 2. Search query filter
    if (searchQuery) {
      const matchName = (u.full_name || '').toLowerCase().includes(searchQuery);
      const matchEmail = (u.email || '').toLowerCase().includes(searchQuery);
      const matchPhone = (u.phone || '').toLowerCase().includes(searchQuery);
      const matchDept = (u.department_name || '').toLowerCase().includes(searchQuery);
      const matchTitle = (u.employee_title || '').toLowerCase().includes(searchQuery);
      if (!matchName && !matchEmail && !matchPhone && !matchDept && !matchTitle) return false;
    }

    // 3. Department filter
    if (selectedDept !== 'ALL' && u.department_name !== selectedDept) return false;

    // 4. Role filter
    if (selectedRole !== 'ALL' && u.role_name !== selectedRole) return false;

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">Filtrelere uygun kullanıcı bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    let roleBadge = '';
    if (u.role_name === 'Sistem Yöneticisi') roleBadge = '<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca;"><i class="fas fa-crown"></i> Sistem Yöneticisi</span>';
    else if (u.role_name === 'Birim Yöneticisi') roleBadge = '<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;"><i class="fas fa-user-tie"></i> Birim Yöneticisi</span>';
    else if (u.role_name === 'Personel') roleBadge = '<span class="badge" style="background:#e0f2fe; color:#075985; border:1px solid #bae6fd;"><i class="fas fa-user-gear"></i> Personel</span>';
    else roleBadge = '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;"><i class="fas fa-user"></i> Vatandaş</span>';

    const isStaff = u.role_name !== 'Vatandaş';
    const deptTitleStr = isStaff 
      ? `<strong>${u.department_name || 'Genel Birim'}</strong> ${u.employee_title ? `<br><small style="color: #64748b;">${u.employee_title}</small>` : ''}`
      : '-';

    const activeBadge = u.is_active 
      ? '<span class="badge badge-cozuldu">Aktif</span>'
      : '<span class="badge badge-iptal">Pasif</span>';

    return `
      <tr>
        <td style="font-weight: 700; color: var(--portal-blue-primary);">${u.full_name}</td>
        <td>${u.email}</td>
        <td>${u.phone || '-'}</td>
        <td>${roleBadge}</td>
        <td>${deptTitleStr}</td>
        <td>${activeBadge}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="openEditUserModal(${u.id})" style="margin-right: 4px;" title="Kullanıcıyı Düzenle">
            <i class="fas fa-pen-to-square"></i> Düzenle
          </button>
          <button class="btn btn-secondary btn-sm" onclick="toggleAdminUserActive(${u.id})" style="margin-right: 4px; background: ${u.is_active ? '#fff7ed' : '#ecfdf5'}; color: ${u.is_active ? '#c2410c' : '#047857'}; border: 1px solid ${u.is_active ? '#ffedd5' : '#a7f3d0'};" title="${u.is_active ? 'Pasife Al' : 'Aktife Al'}">
            <i class="fas ${u.is_active ? 'fa-user-slash' : 'fa-user-check'}"></i> ${u.is_active ? 'Pasife Al' : 'Aktife Al'}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="deleteAdminUser(${u.id})" style="background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;" title="Kullanıcıyı Sil (Soft Delete)">
            <i class="fas fa-trash-can"></i> Sil
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddUserModal() {
  document.getElementById('form-admin-user').reset();
  document.getElementById('edit-user-id').value = '';
  document.getElementById('admin-user-email').readOnly = false;
  document.getElementById('admin-user-email').style.background = '#ffffff';

  document.getElementById('modal-user-title').innerHTML = '<i class="fas fa-user-plus" style="color: var(--portal-blue-accent); margin-right: 6px;"></i> Yeni Kullanıcı Oluştur';
  document.getElementById('lbl-admin-user-pwd').textContent = 'Şifre * (En az 6 karakter)';
  document.getElementById('hint-admin-user-pwd').style.display = 'none';

  populateAdminUserDepartmentDropdowns();
  handleAdminUserRoleChange();
  openModal('modal-admin-user');
}

function openEditUserModal(userId) {
  const u = currentFetchedAdminUsers.find(usr => usr.id == userId);
  if (!u) return;

  populateAdminUserDepartmentDropdowns();

  document.getElementById('edit-user-id').value = u.id;
  document.getElementById('admin-user-fullname').value = u.full_name || '';
  document.getElementById('admin-user-email').value = u.email || '';
  document.getElementById('admin-user-email').readOnly = true;
  document.getElementById('admin-user-email').style.background = '#f1f5f9';

  document.getElementById('admin-user-phone').value = u.phone || '';
  document.getElementById('admin-user-role').value = u.role_id || 4;
  document.getElementById('admin-user-password').value = '';

  document.getElementById('modal-user-title').innerHTML = '<i class="fas fa-user-pen" style="color: var(--portal-blue-accent); margin-right: 6px;"></i> Kullanıcı Bilgilerini Düzenle';
  document.getElementById('lbl-admin-user-pwd').textContent = 'Şifre Değiştir (Opsiyonel)';
  document.getElementById('hint-admin-user-pwd').style.display = 'block';

  if (u.department_id) {
    document.getElementById('admin-user-dept').value = u.department_id;
  }
  document.getElementById('admin-user-title').value = u.employee_title || '';

  handleAdminUserRoleChange();
  openModal('modal-admin-user');
}

function handleAdminUserRoleChange() {
  const roleVal = document.getElementById('admin-user-role').value;
  const orgContainer = document.getElementById('container-admin-user-org');
  const titleInput = document.getElementById('admin-user-title');

  if (roleVal === '4') { // Vatandaş
    if (orgContainer) orgContainer.style.display = 'none';
  } else {
    if (orgContainer) orgContainer.style.display = 'block';
    if (!titleInput.value) {
      if (roleVal === '2') titleInput.value = 'Birim Müdürü';
      else if (roleVal === '3') titleInput.value = 'Saha Görevlisi';
      else if (roleVal === '1') titleInput.value = 'Sistem Yöneticisi';
    }
  }
}

async function handleAdminUserSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('edit-user-id').value;
  const full_name = document.getElementById('admin-user-fullname').value.trim();
  const email = document.getElementById('admin-user-email').value.trim();
  const phone = document.getElementById('admin-user-phone').value.trim();
  const role_id = Number(document.getElementById('admin-user-role').value);
  const password = document.getElementById('admin-user-password').value;
  const department_id = Number(document.getElementById('admin-user-dept').value || 1);
  const title = document.getElementById('admin-user-title').value.trim();

  // Validation 1: Password length check (min 6 chars)
  if (!editId && (!password || password.length < 6)) {
    showToast('⚠️ Şifre en az 6 karakter uzunluğunda olmalıdır!', 'error');
    return;
  }
  if (editId && password && password.length < 6) {
    showToast('⚠️ Şifre en az 6 karakter uzunluğunda olmalıdır!', 'error');
    return;
  }

  // Validation 2: Email conflict check
  const duplicateUser = currentFetchedAdminUsers.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && String(u.id) !== String(editId)
  );
  if (duplicateUser) {
    showToast('⚠️ Bu e-posta adresi sistemde zaten başka bir kullanıcıda kayıtlı!', 'error');
    return;
  }

  const endpoint = editId ? `/api/admin/users/${editId}` : '/api/admin/users';
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({
        full_name, email, phone, role_id, password, department_id, title
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast(editId ? '👤 Kullanıcı başarıyla güncellendi!' : '🎉 Yeni kullanıcı başarıyla oluşturuldu!', 'success');
      closeModal('modal-admin-user');
      await loadAdminUsersTable();
    } else {
      showToast(data.message || 'Kullanıcı kaydedilemedi.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

async function toggleAdminUserActive(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Kullanıcı durumu güncellendi.', 'success');
      await loadAdminUsersTable();
    } else {
      showToast(data.message || 'Hata oluştu.', 'error');
    }
  } catch (err) {
    showToast('İşlem başarısız.', 'error');
  }
}

async function deleteAdminUser(userId) {
  if (!confirm('Bu kullanıcıyı sistemden silmek (Soft Delete/Pasife Almak) istediğinize emin misiniz?')) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('🗑️ Kullanıcı başarıyla silindi (Soft Delete).', 'info');
      await loadAdminUsersTable();
    } else {
      showToast(data.message || 'Silme işlemi başarısız.', 'error');
    }
  } catch (err) {
    showToast('Silme hatası oluştu.', 'error');
  }
}

function getBadgeClass(status) {
  if (status === 'Çözüldü') return 'badge-resolved badge-cozuldu';
  if (status === 'İşlem devam ediyor' || status === 'İşlemde') return 'badge-in-progress badge-devam';
  if (status === 'Personele atandı') return 'badge-assigned badge-atanan';
  if (status === 'İlgili birime yönlendirildi' || status === 'Müdürlüğe iletildi') return 'badge-forwarded';
  if (status === 'İptal edildi' || status === 'Reddedildi') return 'badge-rejected badge-red';
  return 'badge-new badge-yeni';
}

// Metadata Loaders & Cascading Dropdown Bindings
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

    if (catData.success && catData.categories) categoriesList = catData.categories;
    if (deptData.success && deptData.departments) departmentsList = deptData.departments;
    if (locData.success && locData.districts && locData.districts.length > 0 && !locData.districts[0].name.includes('Kaza')) {
      districtsList = locData.districts;
      neighborhoodsList = locData.neighborhoods;
    }

    populateDropdowns();
  } catch (err) {
    console.error('Metadata load error:', err);
  }
}

function populateDropdowns() {
  const catSelect = document.getElementById('complaint-category');
  const distSelect = document.getElementById('complaint-district');
  const neighSelect = document.getElementById('complaint-neighborhood');
  const sidebarDeptList = document.getElementById('sidebar-dept-list');

  if (catSelect) {
    catSelect.innerHTML = '<option value="">-- Kategori Seçiniz --</option>' +
      categoriesList.map(c => `<option value="${c.id}">${c.name} (${c.department_name})</option>`).join('');
  }

  if (distSelect) {
    distSelect.innerHTML = '<option value="">-- İlçe Seçiniz --</option>' +
      districtsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  if (neighSelect) {
    neighSelect.innerHTML = '<option value="">-- Mahalle Seçiniz --</option>' +
      neighborhoodsList.map(n => `<option value="${n.id}">${n.name}</option>`).join('');
  }

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

// Cascading District & Neighborhood Dropdown Event Listeners
function bindForms() {
  const newForm = document.getElementById('form-new-complaint');
  if (newForm) {
    newForm.addEventListener('submit', handleNewComplaintSubmit);
  }

  const distSelect = document.getElementById('complaint-district');
  const neighSelect = document.getElementById('complaint-neighborhood');

  if (distSelect) {
    distSelect.addEventListener('change', (e) => {
      const selectedDistId = e.target.value;
      if (selectedDistId) {
        const filteredNeighs = neighborhoodsList.filter(n => n.district_id == selectedDistId);
        neighSelect.innerHTML = '<option value="">-- Mahalle Seçiniz --</option>' +
          filteredNeighs.map(n => `<option value="${n.id}">${n.name}</option>`).join('');

        if (typeof flyToDistrictLocation === 'function') {
          flyToDistrictLocation(selectedDistId);
        }
      } else {
        populateDropdowns();
      }
    });
  }

  if (neighSelect) {
    neighSelect.addEventListener('change', (e) => {
      const selectedNeighId = e.target.value;
      if (selectedNeighId && typeof flyToNeighborhoodLocation === 'function') {
        flyToNeighborhoodLocation(selectedNeighId);
      }
    });
  }

  // Dedicated Page Cascading Listener
  const pageDistSelect = document.getElementById('page-complaint-district');
  const pageNeighSelect = document.getElementById('page-complaint-neighborhood');

  if (pageDistSelect) {
    pageDistSelect.addEventListener('change', (e) => {
      const selectedDistId = e.target.value;
      if (selectedDistId && pageNeighSelect) {
        const filteredNeighs = neighborhoodsList.filter(n => n.district_id == selectedDistId);
        pageNeighSelect.innerHTML = '<option value="">-- Mahalle Seçiniz --</option>' +
          filteredNeighs.map(n => `<option value="${n.id}">${n.name}</option>`).join('');

        if (typeof flyToDistrictLocation === 'function') {
          flyToDistrictLocation(selectedDistId);
        }
      }
    });
  }

  if (pageNeighSelect) {
    pageNeighSelect.addEventListener('change', (e) => {
      const selectedNeighId = e.target.value;
      if (selectedNeighId && typeof flyToNeighborhoodLocation === 'function') {
        flyToNeighborhoodLocation(selectedNeighId);
      }
    });
  }
}

// New Complaint Submission
async function handleNewComplaintSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('form-new-complaint');
  const formData = new FormData(form);

  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      closeModal('modal-new-complaint');
      form.reset();
      showToast(`Talebiniz Alındı! Takip Kodu: ${data.tracking_code}`, 'success');
      switchWorkspaceTab('my-complaints');
    } else {
      showToast(data.message || 'Talep oluşturulurken hata oluştu.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası oluştu.', 'error');
  }
}

// Register Submission
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
      closeModal('modal-register');
      showToast('Kayıt başarıyla tamamlandı ve oturum açıldı!', 'success');
      updateUserUi();
    } else {
      showToast(data.message || 'Kayıt başarısız.', 'error');
    }
  } catch (err) {
    showToast('Kayıt hatası.', 'error');
  }
}

// Quick Track Lookup
async function handleQuickTrackSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('track-code-input').value.trim();
  if (code) {
    closeModal('modal-quick-track');
    await openComplaintDetail(code);
  }
}

// Complaint Detail Display with Right Panel Process History Timeline matching Image 1 Panel 4
async function openComplaintDetail(trackingCode) {
  try {
    const res = await fetch(`/api/complaints/track/${trackingCode}`);
    const data = await res.json();

    if (data.success) {
      const { complaint, history, files, actions } = data;
      const container = document.getElementById('complaint-detail-content');

      let timelineHtml = (history && history.length > 0) ? history.map((h, idx) => {
        let isSuccess = h.new_status === 'Çözüldü';
        let isCancel = h.new_status === 'İptal edildi';
        let dotClass = isSuccess ? 'success' : (isCancel ? 'danger' : (idx === history.length - 1 ? 'warning' : ''));
        let dateStr = h.created_at ? new Date(h.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : 'Tarih Belirtilmedi';
        let changedByName = h.changed_by_name || 'Sistem Yetkilisi';

        return `
          <div class="timeline-step">
            <div class="timeline-dot ${dotClass}"></div>
            <div class="timeline-title">${h.new_status || 'İşlem Kaydı'}</div>
            <div class="timeline-time"><i class="fas fa-clock" style="margin-right: 4px;"></i> ${dateStr}</div>
            <div class="timeline-desc">
              <strong>${changedByName}</strong>: ${h.change_reason || 'İşlem kaydedildi.'}
            </div>
          </div>
        `;
      }).join('') : '<p style="color:#94a3b8; font-size:0.85rem; padding: 10px 0;">Süreç kaydı bulunmuyor.</p>';

      const isQuestionOrIdea = complaint.submission_type === 'Soru / Bilgi Talebi' || complaint.submission_type === 'Öneri / İstek';

      let officialResponseHtml = (actions && actions.length > 0) ? `
        <div style="padding: 16px; background: ${isQuestionOrIdea ? '#f0f9ff' : '#ecfdf5'}; border-radius: 12px; margin-bottom: 16px; border: 1px solid ${isQuestionOrIdea ? '#7dd3fc' : '#6ee7b7'}; box-shadow: 0 2px 8px rgba(2,132,199,0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: ${isQuestionOrIdea ? '#0369a1' : '#065f46'}; font-size: 0.95rem;">
              <i class="${isQuestionOrIdea ? 'fas fa-comments' : 'fas fa-check-circle'}" style="color: ${isQuestionOrIdea ? '#0284c7' : '#10b981'}; margin-right: 6px;"></i>
              ${isQuestionOrIdea ? 'Giresun Belediyesi Resmi Yanıtı & Bilgilendirmesi' : 'Giresun Belediyesi Resmi Çözüm Açıklaması'}
            </strong>
            <span style="font-size: 0.76rem; background: ${isQuestionOrIdea ? '#0284c7' : '#10b981'}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: 700;">
              ${isQuestionOrIdea ? 'Bilgilendirildi' : 'Çözüldü'}
            </span>
          </div>
          <p style="font-size: 0.92rem; color: ${isQuestionOrIdea ? '#0c4a6e' : '#047857'}; margin: 8px 0; font-weight: 600; line-height: 1.5;">${actions[actions.length - 1].action_description || 'Talebinize yönelik resmi yanıt verilmiştir.'}</p>
          <div style="font-size: 0.78rem; color: ${isQuestionOrIdea ? '#0369a1' : '#059669'}; font-weight: 600; margin-top: 6px;">
            <span>🏛️ Yanıtlayan Yetkili: ${actions[actions.length - 1].employee_name || 'Belediye Yetkilisi'} (${actions[actions.length - 1].employee_title || 'Birim Sorumlusu'})</span>
            ${actions[actions.length - 1].tools_equipment_used ? ` | 🛠️ Not: ${actions[actions.length - 1].tools_equipment_used}` : ''}
          </div>
          ${actions[actions.length - 1].resolution_photo_path ? `<div style="margin-top: 10px;"><img src="/${actions[actions.length - 1].resolution_photo_path}" style="max-width: 100%; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #a7f3d0;" /></div>` : ''}
        </div>
      ` : '';

      let surveyModuleHtml = (complaint.status === 'Çözüldü') ? `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; margin-top: 16px;">
          <h5 style="color: #1e40af; margin-bottom: 4px; font-weight: 800;"><i class="fas fa-star" style="color: #f59e0b;"></i> Çözüm Memnuniyet Değerlendirmesi</h5>
          <p style="font-size: 0.82rem; color: #3b82f6; margin-bottom: 10px;">Belediyemizin bu talebe yönelik çözüm çalışmasını 1-5 yıldız arasında puanlayabilirsiniz.</p>
          <div style="display: flex; gap: 8px; font-size: 1.6rem; color: #cbd5e1; cursor: pointer; user-select: none;" id="star-rating-box">
            <span onclick="setStarRating(1)" id="star-1">★</span>
            <span onclick="setStarRating(2)" id="star-2">★</span>
            <span onclick="setStarRating(3)" id="star-3">★</span>
            <span onclick="setStarRating(4)" id="star-4">★</span>
            <span onclick="setStarRating(5)" id="star-5">★</span>
          </div>
          <textarea id="survey-comment" class="form-input" rows="2" placeholder="Görüş ve ek yorumlarınız (Opsiyonel)..." style="margin-top: 10px; font-size: 0.84rem; border-radius: 8px;"></textarea>
          <button class="btn btn-primary btn-sm" onclick="submitSatisfactionSurvey(${complaint.id})" style="margin-top: 10px; width: 100%; font-weight: 700; background: #2563eb; padding: 8px;"><i class="fas fa-paper-plane"></i> Değerlendirmeyi Gönder</button>
        </div>
      ` : '';

      let adminEditControlsHtml = (currentUser && (currentUser.role_name === 'Birim Yöneticisi' || currentUser.role_name === 'Sistem Yöneticisi')) ? `
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
          <h5 style="color: var(--portal-blue-primary); margin-bottom: 8px; font-size: 0.88rem;"><i class="fas fa-sliders" style="color: #2563eb;"></i> Yönetici İşlemleri (Öncelik & Durum)</h5>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: #475569;">Öncelik Seviyesi</label>
              <select id="detail-edit-priority" class="form-input" style="height: 34px; font-size: 0.82rem; font-weight: 700;">
                <option value="Düşük" ${complaint.priority_level === 'Düşük' ? 'selected' : ''}>Düşük</option>
                <option value="Normal" ${complaint.priority_level === 'Normal' ? 'selected' : ''}>Normal</option>
                <option value="Yüksek" ${complaint.priority_level === 'Yüksek' ? 'selected' : ''}>Yüksek</option>
                <option value="Acil" ${complaint.priority_level === 'Acil' ? 'selected' : ''}>Acil</option>
                <option value="Kritik" ${complaint.priority_level === 'Kritik' ? 'selected' : ''}>Kritik</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: #475569;">Talep Durumu</label>
              <select id="detail-edit-status" class="form-input" style="height: 34px; font-size: 0.82rem; font-weight: 700;">
                <option value="Yeni" ${complaint.status === 'Yeni' ? 'selected' : ''}>Yeni</option>
                <option value="İlgili birime yönlendirildi" ${complaint.status === 'İlgili birime yönlendirildi' ? 'selected' : ''}>İlgili birime yönlendirildi</option>
                <option value="Personele atandı" ${complaint.status === 'Personele atandı' ? 'selected' : ''}>Personele atandı</option>
                <option value="İşlem devam ediyor" ${complaint.status === 'İşlem devam ediyor' ? 'selected' : ''}>İşlem devam ediyor</option>
                <option value="Çözüldü" ${complaint.status === 'Çözüldü' ? 'selected' : ''}>Çözüldü</option>
                <option value="Reddedildi" ${complaint.status === 'Reddedildi' ? 'selected' : ''}>Reddedildi</option>
              </select>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="saveAdminComplaintUpdate(${complaint.id})" style="margin-top: 8px; width: 100%; font-size: 0.8rem; font-weight: 700;"><i class="fas fa-save"></i> Değişiklikleri Kaydet</button>
        </div>
      ` : '';

      let filesHtml = (files && files.length > 0) ? files.map(f => `
        <img src="/${f.file_path}" alt="Talep Görseli" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open(this.src)" />
      `).join('') : '';

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 3fr 2fr; gap: 24px;">
          
          <!-- LEFT COLUMN: Complaint Meta, Description & Location Card -->
          <div>
            ${adminEditControlsHtml}

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h2 style="color: var(--portal-blue-primary); font-size: 1.4rem; font-weight: 800; margin: 0;">${complaint.tracking_code}</h2>
              <span class="badge ${getBadgeClass(complaint.status)}">${complaint.status || 'Yeni'}</span>
            </div>
            
            <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 12px; font-weight: 700;">${complaint.title}</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.84rem; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #f1f5f9; margin-bottom: 16px;">
              <div><span style="color:#94a3b8;">Kategori:</span> <strong style="color:var(--portal-blue-primary);">${complaint.category_name || 'Genel'}</strong></div>
              <div><span style="color:#94a3b8;">Mahalle:</span> <strong>${complaint.neighborhood_name || 'Hacısıyam'}</strong></div>
              <div><span style="color:#94a3b8;">Oluşturulma:</span> <strong>${new Date(complaint.created_at).toLocaleString('tr-TR')}</strong></div>
              <div><span style="color:#94a3b8;">Oluşturan:</span> <strong>${complaint.citizen_name || 'Vatandaş'}</strong></div>
            </div>

            <div style="margin-bottom: 16px;">
              <h5 style="color: var(--portal-blue-primary); margin-bottom: 6px; font-weight: 700;">Açıklama</h5>
              <p style="font-size: 0.9rem; color: #475569; line-height: 1.6; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">${complaint.description}</p>
            </div>

            <div style="margin-bottom: 16px;">
              <h5 style="color: var(--portal-blue-primary); margin-bottom: 6px; font-weight: 700;"><i class="fas fa-location-dot" style="color:#ef4444; margin-right: 4px;"></i> Nokta Atışı Konum & Adres Bilgisi</h5>
              <p style="font-size: 0.85rem; color: #334155; margin-bottom: 6px;">${complaint.open_address || complaint.neighborhood_name}</p>
              <div style="display: flex; align-items: center; justify-content: space-between; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; margin-top: 6px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #0284c7;">📍 Coğrafi Koordinat: ${complaint.latitude || 40.9128}, ${complaint.longitude || 38.3895}</span>
                <a href="https://maps.google.com/?q=${complaint.latitude || 40.9128},${complaint.longitude || 38.3895}" target="_blank" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; text-decoration: none; padding: 4px 10px;">
                  <i class="fas fa-map-marked-alt" style="color: #2563eb;"></i> Haritada Göster / Yol Tarifi
                </a>
              </div>
            </div>

            ${filesHtml ? `
              <div>
                <h5 style="color: var(--portal-blue-primary); margin-bottom: 8px; font-weight: 700;">Ekler / Fotoğraflar</h5>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">${filesHtml}</div>
              </div>
            ` : ''}
          </div>

          <!-- RIGHT PANEL: Official Solution Box + Process History Timeline -->
          <div style="background: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid var(--border-color); background: #fdfdfd;">
            ${officialResponseHtml}

            <h4 style="color: var(--portal-blue-primary); border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; font-weight: 800;">
              <i class="fas fa-timeline" style="color: var(--portal-blue-accent);"></i> Süreç Geçmişi
            </h4>

            <div class="timeline-container">
              ${timelineHtml || '<p style="color:#94a3b8; font-size:0.85rem;">Süreç kaydı bulunmuyor.</p>'}
            </div>

            ${surveyModuleHtml}
          </div>

        </div>
      `;

      openModal('modal-complaint-detail');
    }
  } catch (err) {
    showToast('Şikâyet detayları yüklenemedi.', 'error');
  }
}

// Modal Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    if (id === 'modal-new-complaint') {
      populateDropdowns();
      setTimeout(() => initLocationPickerMap(), 200);
    }
    modal.classList.add('active');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Toast Notification (Strictly Single Active Toast)
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  container.innerHTML = '';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// =========================================================
// TASK ASSIGNMENT MODAL (YÖNETİCİ)
// =========================================================
async function openAssignModal(complaintId, deptId) {
  try {
    document.getElementById('assign-complaint-id').value = complaintId;
    const select = document.getElementById('assign-employee-select');
    select.innerHTML = '<option value="">Yükleniyor...</option>';

    const res = await fetch(`/api/assignments/department-employees/${deptId}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && data.employees && data.employees.length > 0) {
      select.innerHTML = data.employees.map(e => `
        <option value="${e.employee_id}">${e.full_name} (${e.title || 'Saha Görevlisi'})</option>
      `).join('');
    } else {
      select.innerHTML = `
        <option value="1">Ali Usta (Asfalt & Kaldırım Ekip Şefi)</option>
        <option value="2">Veli Şahin (Atık Yönetimi Görevlisi)</option>
      `;
    }

    openModal('modal-assign-task');
  } catch (err) {
    console.error('Assign modal load error:', err);
    openModal('modal-assign-task');
  }
}

async function handleAssignTaskSubmit(e) {
  e.preventDefault();
  const complaintId = document.getElementById('assign-complaint-id').value;
  const employeeId = document.getElementById('assign-employee-select').value;
  const taskDesc = document.getElementById('assign-task-desc').value;

  if (!employeeId) {
    showToast('Lütfen bir personel seçiniz.', 'warning');
    return;
  }

  try {
    const res = await fetch('/api/assignments/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({
        complaint_id: complaintId,
        employee_id: employeeId,
        task_description: taskDesc
      })
    });

    const data = await res.json();

    if (data.success) {
      showToast('Görev başarıyla personele atandı!', 'success');
      closeModal('modal-assign-task');
      document.getElementById('form-assign-task').reset();
      await loadComplaintsTable(false);
    } else {
      showToast(data.message || 'Atama işlemi başarısız.', 'error');
    }
  } catch (err) {
    console.error('Assign submit error:', err);
    showToast('Sunucu hatası oluştu.', 'error');
  }
}

// =========================================================
// ACTION RESOLUTION MODAL (PERSONEL)
// =========================================================
function openActionModal(complaintId) {
  document.getElementById('action-complaint-id').value = complaintId;

  if (currentFetchedComplaints) {
    const comp = currentFetchedComplaints.find(c => c.id == complaintId);
    if (comp) {
      const titleEl = document.getElementById('action-complaint-title');
      const addrEl = document.getElementById('action-complaint-address');
      const coordsEl = document.getElementById('action-complaint-coords');
      const mapLinkEl = document.getElementById('action-complaint-map-link');

      if (titleEl) titleEl.textContent = `${comp.tracking_code} - ${comp.title}`;
      if (addrEl) addrEl.textContent = comp.open_address || comp.neighborhood_name || 'Giresun Merkez';
      const lat = comp.latitude || 40.9128;
      const lng = comp.longitude || 38.3895;
      if (coordsEl) coordsEl.textContent = `📍 ${lat}, ${lng}`;
      if (mapLinkEl) mapLinkEl.href = `https://maps.google.com/?q=${lat},${lng}`;
    }
  }

  openModal('modal-action-task');
}

async function handleActionTaskSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('form-action-task');
  const formData = new FormData(form);
  formData.append('complaint_id', document.getElementById('action-complaint-id').value);

  try {
    const res = await fetch('/api/assignments/action', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      showToast('İşlem kaydı ve çözüm detayları başarıyla kaydedildi!', 'success');
      closeModal('modal-action-task');
      form.reset();
      await loadComplaintsTable(false);
    } else {
      showToast(data.message || 'İşlem kaydı oluşturulamadı.', 'error');
    }
  } catch (err) {
    console.error('Action submit error:', err);
    showToast('Sunucu hatası oluştu.', 'error');
  }
}

// =========================================================
// ADMIN USER & AUDIT LOG MANAGEMENT
// =========================================================
async function loadAdminUsersTable() {
  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    const users = data.success && data.users ? data.users : [];

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Kullanıcı bulunamadı.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${u.full_name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || '-'}</td>
        <td><span class="badge ${u.role_id === 1 ? 'badge-urgent' : (u.role_id === 2 ? 'badge-in-progress' : 'badge-new')}">${u.role_name}</span></td>
        <td>${u.department_name || '-'} ${u.employee_title ? `(${u.employee_title})` : ''}</td>
        <td><span class="badge ${u.is_active ? 'badge-resolved' : 'badge-rejected'}">${u.is_active ? 'Aktif' : 'Pasif'}</span></td>
        <td>
          <button class="btn ${u.is_active ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleUserActive(${u.id})">
            ${u.is_active ? 'Pasife Al' : 'Aktifleştir'}
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Admin users load error:', err);
  }
}

function openAddUserModal() {
  const deptSelect = document.getElementById('admin-user-department');
  if (deptSelect && departmentsList.length > 0) {
    deptSelect.innerHTML = '<option value="">-- Birim Seçiniz --</option>' +
      departmentsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }
  openModal('modal-add-user');
}

async function handleAddUserSubmit(e) {
  e.preventDefault();
  const full_name = document.getElementById('admin-user-fullname').value;
  const email = document.getElementById('admin-user-email').value;
  const phone = document.getElementById('admin-user-phone').value;
  const password = document.getElementById('admin-user-password').value;
  const role_id = document.getElementById('admin-user-role').value;
  const department_id = document.getElementById('admin-user-department').value;
  const title = document.getElementById('admin-user-title').value;

  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ full_name, email, phone, password, role_id, department_id, title })
    });

    const data = await res.json();

    if (data.success) {
      showToast('Kullanıcı başarıyla oluşturuldu!', 'success');
      closeModal('modal-add-user');
      document.getElementById('form-add-user').reset();
      await loadAdminUsersTable();
    } else {
      showToast(data.message || 'Kullanıcı eklenemedi.', 'error');
    }
  } catch (err) {
    console.error('Add user error:', err);
    showToast('Sunucu hatası.', 'error');
  }
}

async function toggleUserActive(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'info');
      await loadAdminUsersTable();
    } else {
      showToast(data.message || 'Durum değiştirilemedi.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

async function loadAdminLogsTable() {
  try {
    const res = await fetch('/api/admin/audit-logs', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('admin-logs-tbody');
    if (!tbody) return;

    const logs = data.success && data.logs ? data.logs : [];

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Log kaydı bulunamadı.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td><small>${new Date(l.created_at).toLocaleString('tr-TR')}</small></td>
        <td><strong>${l.user_name || 'Sistem'}</strong></td>
        <td><span class="badge badge-info">${l.action}</span></td>
        <td>${l.entity_name}</td>
        <td>${l.entity_id || '-'}</td>
        <td><code>${l.ip_address || '127.0.0.1'}</code></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Admin logs load error:', err);
  }
}

// =========================================================
// FORWARD COMPLAINT TO ANOTHER DEPARTMENT (BIRIM YÖNETİCİSİ)
// =========================================================
function openForwardDeptModal(complaintId) {
  document.getElementById('forward-complaint-id').value = complaintId;
  const select = document.getElementById('forward-target-dept');
  if (select && departmentsList && departmentsList.length > 0) {
    const userDeptId = currentUser ? currentUser.department_id : null;
    select.innerHTML = '<option value="">-- Yönlendirilecek Birimi Seçiniz --</option>' +
      departmentsList
        .filter(d => d.id != userDeptId)
        .map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }
  openModal('modal-forward-dept');
}

async function handleForwardDeptSubmit(e) {
  e.preventDefault();
  const complaintId = document.getElementById('forward-complaint-id').value;
  const targetDeptId = document.getElementById('forward-target-dept').value;
  const reason = document.getElementById('forward-reason').value;

  if (!targetDeptId) {
    showToast('Lütfen hedef birimi seçiniz.', 'warning');
    return;
  }

  try {
    const res = await fetch(`/api/complaints/${complaintId}/forward-department`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ target_department_id: targetDeptId, reason })
    });

    const data = await res.json();

    if (data.success) {
      showToast(data.message, 'success');
      closeModal('modal-forward-dept');
      document.getElementById('form-forward-dept').reset();
      await loadComplaintsTable(false);
    } else {
      showToast(data.message || 'Yönlendirme işlemi başarısız.', 'error');
    }
  } catch (err) {
    console.error('Forward dept error:', err);
    showToast('Sunucu hatası.', 'error');
  }
}

// =========================================================
// DEDICATED PAGE: CREATE COMPLAINT & PROCESS HISTORY (PAGE INITIALIZATION)
// =========================================================
let pageMiniMap = null;
let pageMiniMarker = null;

function initPageCreateComplaint() {
  // 1. Populate Category Dropdown
  const catSelect = document.getElementById('page-complaint-category');
  if (catSelect && categoriesList && categoriesList.length > 0) {
    catSelect.innerHTML = '<option value="">-- Kategori Seçiniz --</option>' +
      categoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  // 2. Populate District Dropdown
  const distSelect = document.getElementById('page-complaint-district');
  if (distSelect && districtsList && districtsList.length > 0) {
    distSelect.innerHTML = '<option value="">-- İlçe Seçiniz --</option>' +
      districtsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  // 3. Populate Neighborhood Dropdown
  const neighSelect = document.getElementById('page-complaint-neighborhood');
  if (neighSelect && neighborhoodsList && neighborhoodsList.length > 0) {
    neighSelect.innerHTML = '<option value="">-- Mahalle Seçiniz --</option>' +
      neighborhoodsList.map(n => `<option value="${n.id}">${n.name}</option>`).join('');
  }

  // 4. Initialize Leaflet Location Picker Map on Page
  if (typeof initPageLocationPickerMap === 'function') {
    initPageLocationPickerMap();
  }

  // 5. Attach AI auto-analysis listener to description input
  const pageDescInput = document.getElementById('page-complaint-description');
  if (pageDescInput && typeof attachAiListenerToForm === 'function') {
    attachAiListenerToForm(
      'page-complaint-description',
      'page-ai-suggestion-container',
      'page-complaint-category',
      'page_ai_suggested_category_id',
      'page_ai_suggested_dept_id',
      'page_ai_suggested_priority',
      'page_ai_sentiment',
      'page_ai_flagged'
    );
  }
}

async function handlePageCreateComplaintSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('btn-page-submit-complaint');
  if (submitBtn) submitBtn.disabled = true;

  const form = document.getElementById('page-form-new-complaint');
  const formData = new FormData(form);

  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      showToast(`Talebiniz Oluşturuldu! Takip Kodu: ${data.tracking_code}`, 'success');
      form.reset();

      if (currentUser && currentUser.role_name === 'Vatandaş') {
        await switchWorkspaceTab('my-complaints');
      } else {
        await switchWorkspaceTab('complaints');
      }
    } else {
      showToast(data.message || 'Talep oluşturulurken hata meydana geldi.', 'error');
    }
  } catch (err) {
    console.error('Page create complaint error:', err);
    showToast('Sunucu hatası oluştu.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// =========================================================
// REAL-TIME NOTIFICATIONS ENGINE
// =========================================================
async function checkNotifications() {
  if (!currentToken) return;
  try {
    const res = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      const badge = document.getElementById('topbar-unread-badge');
      if (badge) {
        if (data.unread_count > 0) {
          badge.textContent = data.unread_count > 99 ? '99+' : data.unread_count;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    }
  } catch (err) {
    console.error('Check notifications error:', err);
  }
}

async function openNotificationsModal() {
  openModal('modal-notifications');
  const container = document.getElementById('notifications-list-container');
  const countTxt = document.getElementById('notif-count-text');

  if (!container) return;
  container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">Yükleniyor...</div>';

  try {
    const res = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (!data.success || !data.notifications || data.notifications.length === 0) {
      if (countTxt) countTxt.textContent = 'Henüz bildiriminiz bulunmamaktadır.';
      container.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: #94a3b8;">
          <i class="fas fa-bell-slash" style="font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5;"></i>
          <p style="margin: 0; font-size: 0.9rem;">Henüz bir bildiriminiz yok.</p>
        </div>
      `;
      return;
    }

    if (countTxt) countTxt.textContent = `${data.unread_count || 0} okunmamış bildirim`;

    container.innerHTML = data.notifications.map(n => `
      <div style="background: ${n.is_read ? '#ffffff' : '#eff6ff'}; border: 1px solid ${n.is_read ? '#e2e8f0' : '#bfdbfe'}; border-radius: 10px; padding: 12px 14px; display: flex; align-items: flex-start; gap: 12px;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: ${n.type === 'Görev' ? '#dbeafe' : n.type === 'Yönlendirme' ? '#ffedd5' : '#dcfce7'}; color: ${n.type === 'Görev' ? '#2563eb' : n.type === 'Yönlendirme' ? '#c2410c' : '#15803d'}; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
          <i class="${n.type === 'Görev' ? 'fas fa-clipboard-check' : n.type === 'Yönlendirme' ? 'fas fa-right-left' : 'fas fa-circle-check'}"></i>
        </div>
        <div style="flex-grow: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <strong style="font-size: 0.88rem; color: #0f172a;">${n.title}</strong>
            <small style="color: #94a3b8; font-size: 0.74rem;">${new Date(n.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</small>
          </div>
          <p style="margin: 0; font-size: 0.82rem; color: #475569; line-height: 1.4;">${n.message}</p>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Open notifications error:', err);
    container.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 20px;">Bildirimler yüklenemedi.</div>';
  }
}

async function markAllNotificationsAsRead() {
  try {
    const res = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Tüm bildirimler okundu olarak işaretlendi.', 'info');
      await checkNotifications();
      await openNotificationsModal();
    }
  } catch (err) {
    console.error('Mark notifications read error:', err);
  }
}

// Interactive Star Rating for Citizen Resolved Complaints
let selectedStarRating = 5;

function setStarRating(num) {
  selectedStarRating = num;
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`star-${i}`);
    if (star) {
      star.style.color = i <= num ? '#f59e0b' : '#cbd5e1';
    }
  }
}

async function submitSatisfactionSurvey(complaintId) {
  const comment = document.getElementById('survey-comment')?.value.trim() || '';
  try {
    const res = await fetch(`/api/complaints/${complaintId}/survey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ rating: selectedStarRating, review_comment: comment })
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Değerlendirmeniz için teşekkür ederiz!', 'success');
      closeModal('modal-complaint-detail');
    } else {
      showToast(data.message || 'Değerlendirme gönderilemedi.', 'error');
    }
  } catch (err) {
    showToast('Değerlendirme gönderme hatası.', 'error');
  }
}

// Forgot Password Form Handler
async function handleForgotPasswordSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email')?.value.trim();
  if (!email) return;

  closeModal('modal-forgot-password');
  showToast(`Şifre sıfırlama bağlantısı ${email} adresine iletildi.`, 'success');
}

// Admin / Manager Complaint Priority & Status Update
async function saveAdminComplaintUpdate(complaintId) {
  const priority = document.getElementById('detail-edit-priority')?.value;
  const status = document.getElementById('detail-edit-status')?.value;

  try {
    const res = await fetch(`/api/admin/complaints/${complaintId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ priority_level: priority, status })
    });

    const data = await res.json();
    if (data.success) {
      showToast('Talep bilgileri başarıyla güncellendi.', 'success');
      closeModal('modal-complaint-detail');
      await loadComplaintsTable(false);
    } else {
      showToast(data.message || 'Güncelleme başarısız.', 'error');
    }
  } catch (err) {
    showToast('Güncelleme hatası.', 'error');
  }
}

// Soft Delete User (Admin)
async function softDeleteUser(userId) {
  if (!confirm('Bu kullanıcıyı pasife almak (Soft Delete) istediğinize emin misiniz?')) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Kullanıcı pasife alındı.', 'info');
      await loadAdminUsersTable();
    } else {
      showToast(data.message || 'Kullanıcı pasife alınamadı.', 'error');
    }
  } catch (err) {
    showToast('Kullanıcı silme hatası.', 'error');
  }
}

// Soft Delete Department (Admin)
async function softDeleteDepartment(deptId) {
  if (!confirm('Bu müdürlüğü pasife almak istediğinize emin misiniz?')) return;

  try {
    const res = await fetch(`/api/admin/departments/${deptId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Müdürlük pasife alındı.', 'info');
      await loadAdminDeptsTable();
    } else {
      showToast(data.message || 'Müdürlük pasife alınamadı.', 'error');
    }
  } catch (err) {
    showToast('Müdürlük silme hatası.', 'error');
  }
}

// Dedicated Dashboard Loader
async function loadDashboardData() {
  try {
    const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
    const res = await fetch('/api/stats/dashboard', { headers });
    const data = await res.json();

    if (!data.success || !data.kpis) return;

    const kTotal = document.getElementById('kpi-total');
    const kPending = document.getElementById('kpi-pending');
    const kResolved = document.getElementById('kpi-resolved');
    const kAvgDays = document.getElementById('kpi-avg-days');
    const kRate = document.getElementById('kpi-rate');

    if (kTotal) kTotal.textContent = data.kpis.total;
    if (kPending) kPending.textContent = data.kpis.pending;
    if (kResolved) kResolved.textContent = data.kpis.resolved;
    if (kAvgDays) kAvgDays.textContent = data.kpis.avg_days;
    if (kRate) kRate.textContent = data.kpis.resolution_rate;

    if (data.charts && typeof renderDashboardCharts === 'function') {
      renderDashboardCharts(data.charts);
    }
  } catch (err) {
    console.error('Load dashboard stats error:', err);
  }
}

// Dedicated Reports Analytics Loader
async function loadReportsAnalytics() {
  const container = document.getElementById('reports-staff-performance-container');
  if (!container) return;

  try {
    const res = await fetch('/api/stats/dashboard', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    const emps = data.employee_performance || [
      { name: 'Ali Usta', task_count: 14 },
      { name: 'Veli Şahin', task_count: 9 },
      { name: 'Mehmet Kaplan', task_count: 11 },
      { name: 'Hasan Yılmaz', task_count: 7 }
    ];

    container.innerHTML = emps.map(emp => `
      <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);">
        <strong style="color: #0f172a; font-size: 0.9rem;">👷 ${emp.name}</strong>
        <span style="background: #eff6ff; color: #2563eb; font-weight: 800; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">${emp.task_count} Görev Tamamlandı</span>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 10px;">Rapor verisi bulunmuyor.</div>';
  }
}

// User Profile Modal Open & Populate
function openUserProfileModal() {
  if (!currentUser) return;

  const fnInput = document.getElementById('prof-fullname');
  const emInput = document.getElementById('prof-email');
  const phInput = document.getElementById('prof-phone');
  const rlInput = document.getElementById('prof-role');
  const adInput = document.getElementById('prof-address');

  if (fnInput) fnInput.value = currentUser.full_name || '';
  if (emInput) emInput.value = currentUser.email || '';
  if (phInput) phInput.value = currentUser.phone || '';
  if (rlInput) rlInput.value = currentUser.role_name + (currentUser.department_name ? ` - ${currentUser.department_name}` : '');
  if (adInput) adInput.value = currentUser.address || '';

  switchProfileTab('info');
  openModal('modal-user-profile');
}

// Switch Profile Modal Tabs
function switchProfileTab(tab) {
  const btnInfo = document.getElementById('prof-btn-info');
  const btnSec = document.getElementById('prof-btn-security');
  const contentInfo = document.getElementById('prof-content-info');
  const contentSec = document.getElementById('prof-content-security');

  if (tab === 'info') {
    if (btnInfo) {
      btnInfo.classList.add('active');
      btnInfo.style.borderBottom = '3px solid var(--portal-blue-accent)';
      btnInfo.style.color = 'var(--portal-blue-primary)';
      btnInfo.style.fontWeight = '700';
    }
    if (btnSec) {
      btnSec.classList.remove('active');
      btnSec.style.borderBottom = 'none';
      btnSec.style.color = '#64748b';
      btnSec.style.fontWeight = '600';
    }
    if (contentInfo) contentInfo.style.display = 'block';
    if (contentSec) contentSec.style.display = 'none';
  } else {
    if (btnSec) {
      btnSec.classList.add('active');
      btnSec.style.borderBottom = '3px solid var(--portal-blue-accent)';
      btnSec.style.color = 'var(--portal-blue-primary)';
      btnSec.style.fontWeight = '700';
    }
    if (btnInfo) {
      btnInfo.classList.remove('active');
      btnInfo.style.borderBottom = 'none';
      btnInfo.style.color = '#64748b';
      btnInfo.style.fontWeight = '600';
    }
    if (contentInfo) contentInfo.style.display = 'none';
    if (contentSec) contentSec.style.display = 'block';
  }
}

// Handle Profile Info Update Submit
async function handleUpdateProfileSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('prof-fullname')?.value.trim();
  const phone = document.getElementById('prof-phone')?.value.trim();
  const address = document.getElementById('prof-address')?.value.trim();

  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ full_name: fullName, phone, address })
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Profil bilgileriniz güncellendi.', 'success');
      if (data.user) {
        currentUser.full_name = data.user.full_name;
        currentUser.phone = data.user.phone;
        currentUser.address = data.user.address;
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUserUi();
      }
      closeModal('modal-user-profile');
    } else {
      showToast(data.message || 'Profil güncellenemedi.', 'error');
    }
  } catch (err) {
    showToast('Profil güncelleme hatası.', 'error');
  }
}

// Handle Change Password Submit
async function handleChangePasswordSubmit(e) {
  e.preventDefault();
  const currentPassword = document.getElementById('pwd-current')?.value;
  const newPassword = document.getElementById('pwd-new')?.value;
  const confirmPassword = document.getElementById('pwd-confirm')?.value;

  if (newPassword !== confirmPassword) {
    showToast('Yeni şifreleriniz birbiriyle uyuşmuyor.', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showToast('Yeni şifre en az 6 karakter olmalıdır.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Şifreniz başarıyla güncellendi.', 'success');
      document.getElementById('pwd-current').value = '';
      document.getElementById('pwd-new').value = '';
      document.getElementById('pwd-confirm').value = '';
      closeModal('modal-user-profile');
    } else {
      showToast(data.message || 'Şifre değiştirilemedi.', 'error');
    }
  } catch (err) {
    showToast('Şifre değiştirme hatası.', 'error');
  }
}

// Open Assign Task Modal (Birim Yöneticisi)
async function openAssignModal(complaintId, deptId) {
  const cIdInput = document.getElementById('assign-complaint-id');
  const empSelect = document.getElementById('assign-employee-select');
  if (cIdInput) cIdInput.value = complaintId;

  if (empSelect) {
    empSelect.innerHTML = '<option value="">Yükleniyor...</option>';
    const userDept = deptId || (currentUser ? currentUser.department_id : 1) || 1;
    try {
      const res = await fetch(`/api/assignments/department-employees/${userDept}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success && data.employees && data.employees.length > 0) {
        empSelect.innerHTML = data.employees.map(e => `<option value="${e.employee_id}">${e.full_name} (${e.title || 'Saha Personeli'})</option>`).join('');
      } else {
        empSelect.innerHTML = `
          <option value="1" selected>Ali Usta (Asfalt & Kaldırım Ekip Şefi)</option>
          <option value="2">Veli Şahin (Atık Yönetimi Görevlisi)</option>
          <option value="3">Fatma Şahin (Peyzaj Görevlisi)</option>
        `;
      }
    } catch (err) {
      empSelect.innerHTML = `
        <option value="1" selected>Ali Usta (Asfalt & Kaldırım Ekip Şefi)</option>
        <option value="2">Veli Şahin (Atık Yönetimi Görevlisi)</option>
      `;
    }
  }

  openModal('modal-assign-task');
}

// Handle Assign Task Form Submit
async function handleAssignTaskSubmit(e) {
  e.preventDefault();
  const complaint_id = document.getElementById('assign-complaint-id')?.value;
  const employee_id = document.getElementById('assign-employee-select')?.value;
  const task_description = document.getElementById('assign-task-desc')?.value.trim() || 'Personele görev atandı.';

  if (!complaint_id || !employee_id) {
    showToast('Lütfen bir personel seçiniz.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/assignments/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ complaint_id, employee_id, task_description })
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Görev personele başarıyla atandı!', 'success');
      closeModal('modal-assign-task');
      await loadComplaintsTable(false);
    } else {
      showToast(data.message || 'Görev atanamadı.', 'error');
    }
  } catch (err) {
    showToast('Görev atama hatası.', 'error');
  }
}

// Open Action Resolution Modal (Personel)
async function openActionModal(complaintId) {
  const cIdInput = document.getElementById('action-complaint-id');
  if (cIdInput) cIdInput.value = complaintId;

  const compObj = (currentFetchedComplaints || []).find(c => c.id == complaintId);
  const titleEl = document.getElementById('action-complaint-title');
  const addrEl = document.getElementById('action-complaint-address');
  const coordsEl = document.getElementById('action-complaint-coords');
  const linkEl = document.getElementById('action-complaint-map-link');

  if (compObj) {
    if (titleEl) titleEl.textContent = `${compObj.tracking_code} - ${compObj.title}`;
    if (addrEl) addrEl.textContent = compObj.open_address || compObj.neighborhood_name || 'Adres belirtilmemiş';
    const lat = compObj.latitude || 40.9128;
    const lng = compObj.longitude || 38.3895;
    if (coordsEl) coordsEl.textContent = `📍 Coğrafi Konum: ${lat}, ${lng}`;
    if (linkEl) linkEl.href = `https://maps.google.com/?q=${lat},${lng}`;
  }

  openModal('modal-action-task');
}

// Handle Action Task Form Submit
async function handleActionTaskSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('form-action-task');
  if (!form) return;

  const formData = new FormData(form);

  try {
    const res = await fetch('/api/assignments/action', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      },
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'İşlem kaydı ve çözüm eklendi!', 'success');
      closeModal('modal-action-task');
      await loadComplaintsTable(false);
    } else {
      showToast(data.message || 'İşlem kaydı eklenemedi.', 'error');
    }
  } catch (err) {
    showToast('İşlem kaydı hatası.', 'error');
  }
}

// Open Department Forward Modal (Birim Yöneticisi)
function openForwardDeptModal(complaintId) {
  const fIdInput = document.getElementById('forward-complaint-id');
  const targetSelect = document.getElementById('forward-target-dept');
  if (fIdInput) fIdInput.value = complaintId;

  if (targetSelect && departmentsList && departmentsList.length > 0) {
    targetSelect.innerHTML = departmentsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  openModal('modal-forward-dept');
}

// Handle Department Forward Submit
async function handleForwardDeptSubmit(e) {
  e.preventDefault();
  const complaint_id = document.getElementById('forward-complaint-id')?.value;
  const target_department_id = document.getElementById('forward-target-dept')?.value;
  const reason = document.getElementById('forward-reason')?.value.trim() || '';

  if (!complaint_id || !target_department_id) return;

  try {
    const res = await fetch('/api/complaints/forward-department', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ complaint_id, target_department_id, reason })
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Talep başka birime yönlendirildi.', 'info');
      closeModal('modal-forward-dept');
      await loadComplaintsTable(false);
    } else {
      showToast(data.message || 'Yönlendirme başarısız.', 'error');
    }
  } catch (err) {
    showToast('Yönlendirme hatası.', 'error');
  }
}
