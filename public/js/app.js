// ============================================================================
// Bulancak Belediyesi 153 Çözüm Merkezi - Enterprise SPA App Controller
// ============================================================================

// SweetAlert2 Toast Helper
const Toast = (typeof Swal !== 'undefined') ? Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
}) : null;

function showToast(msg, type = 'info') {
  if (Toast) {
    Toast.fire({
      icon: (type === 'error') ? 'error' : (type === 'success' ? 'success' : (type === 'warning' ? 'warning' : 'info')),
      title: msg
    });
  } else {
    console.log(`[Toast ${type}]: ${msg}`);
  }
}

// Global Application State
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
  { id: 14, department_id: 11, name: 'Diğer', department_name: '153 Çözüm Koordinasyon Masası' }
];

let departmentsList = [
  { id: 1, name: 'Fen İşleri Müdürlüğü', code: 'FEN', vice_mayor_user_id: 61 },
  { id: 2, name: 'Temizlik İşleri Müdürlüğü', code: 'TEM', vice_mayor_user_id: 61 },
  { id: 3, name: 'Park ve Bahçeler Müdürlüğü', code: 'PARK', vice_mayor_user_id: 62 },
  { id: 4, name: 'Zabıta Müdürlüğü', code: 'ZBT', vice_mayor_user_id: 62 },
  { id: 5, name: 'Su ve Kanalizasyon Müdürlüğü', code: 'SUK', vice_mayor_user_id: 61 },
  { id: 6, name: 'Veteriner İşleri Müdürlüğü', code: 'VET', vice_mayor_user_id: 62 },
  { id: 7, name: 'Ulaşım Hizmetleri Müdürlüğü', code: 'ULS', vice_mayor_user_id: 61 },
  { id: 8, name: 'Sosyal Hizmetler Müdürlüğü', code: 'SHM', vice_mayor_user_id: 62 },
  { id: 9, name: 'İmar ve Şehircilik Müdürlüğü', code: 'IMR', vice_mayor_user_id: 61 },
  { id: 10, name: 'Bilgi İşlem Müdürlüğü', code: 'BIM', vice_mayor_user_id: 62 },
  { id: 11, name: '153 Çözüm Koordinasyon Masası', code: 'TRG', vice_mayor_user_id: 61 }
];

let districtsList = [
  { id: 1, name: 'Bulancak', lat: 40.9385, lng: 38.2300 }
];

let neighborhoodsList = [
  { id: 1, district_id: 1, name: 'Acısu Mahallesi', lat: 40.9320, lng: 38.2250 },
  { id: 2, district_id: 1, name: 'Ahurlu Mahallesi', lat: 40.9260, lng: 38.2190 },
  { id: 3, district_id: 1, name: 'Alibey Mahallesi', lat: 40.9300, lng: 38.2310 },
  { id: 4, district_id: 1, name: 'Arifli Mahallesi', lat: 40.9280, lng: 38.2210 },
  { id: 5, district_id: 1, name: 'Aydınlar Mahallesi', lat: 40.9340, lng: 38.2400 },
  { id: 6, district_id: 1, name: 'Bahçelievler Mahallesi', lat: 40.9360, lng: 38.2380 },
  { id: 7, district_id: 1, name: 'Ballıca Mahallesi', lat: 40.9380, lng: 38.2300 },
  { id: 8, district_id: 1, name: 'Bulancak Mahallesi', lat: 40.9378, lng: 38.2294 },
  { id: 9, district_id: 1, name: 'Derecikalan Mahallesi', lat: 40.9240, lng: 38.2150 },
  { id: 10, district_id: 1, name: 'Duacıoğlu Mahallesi', lat: 40.9310, lng: 38.2350 },
  { id: 11, district_id: 1, name: 'Düz Mahallesi', lat: 40.9350, lng: 38.2280 },
  { id: 12, district_id: 1, name: 'Güney Mahallesi', lat: 40.9210, lng: 38.2200 },
  { id: 13, district_id: 1, name: 'Güzelyalı Mahallesi', lat: 40.9410, lng: 38.2450 },
  { id: 14, district_id: 1, name: 'Güzelyurt Mahallesi', lat: 40.9290, lng: 38.2390 },
  { id: 15, district_id: 1, name: 'İhsaniye Mahallesi', lat: 40.9350, lng: 38.2250 },
  { id: 16, district_id: 1, name: 'İsmet Paşa Mahallesi', lat: 40.9390, lng: 38.2320 },
  { id: 17, district_id: 1, name: 'Kızılot Mahallesi', lat: 40.9250, lng: 38.2180 },
  { id: 18, district_id: 1, name: 'Merkez Mahallesi', lat: 40.9375, lng: 38.2285 },
  { id: 19, district_id: 1, name: 'Pazarsuyu Mahallesi', lat: 40.9450, lng: 38.2600 },
  { id: 20, district_id: 1, name: 'Pazarsuyu Emecen Mahallesi', lat: 40.9470, lng: 38.2650 },
  { id: 21, district_id: 1, name: 'Sanayi Mahallesi', lat: 40.9400, lng: 38.2400 },
  { id: 22, district_id: 1, name: 'Saraçlı Mahallesi', lat: 40.9340, lng: 38.2310 },
  { id: 23, district_id: 1, name: 'Şemsettin Mahallesi', lat: 40.9200, lng: 38.2280 },
  { id: 24, district_id: 1, name: 'Sisin Mahallesi', lat: 40.9220, lng: 38.2300 },
  { id: 25, district_id: 1, name: 'Sofulu Mahallesi', lat: 40.9270, lng: 38.2100 },
  { id: 26, district_id: 1, name: 'Soğuksu Mahallesi', lat: 40.9330, lng: 38.2150 },
  { id: 27, district_id: 1, name: 'Toprakdeğirmeni Mahallesi', lat: 40.9370, lng: 38.2210 },
  { id: 28, district_id: 1, name: 'Uçarlı Mahallesi', lat: 40.9190, lng: 38.2350 },
  { id: 29, district_id: 1, name: 'Yeni Mahallesi', lat: 40.9385, lng: 38.2355 },
  { id: 30, district_id: 1, name: 'Yunuslu Mahallesi', lat: 40.9230, lng: 38.2420 }
];

let currentFetchedComplaints = [];
let currentFetchedAdminUsers = [];
let currentFetchedAdminDepts = [];
let currentArchiveComplaints = [];
let isAppInitialized = false;
let isCreateMode = false;
let currentViewingComplaintId = null;

// ============================================================================
// 1. APPLICATION INITIALIZATION & SESSION VERIFICATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initApp, 100);
}

async function initApp() {
  if (isAppInitialized) return;
  isAppInitialized = true;

  const landingPortal = document.getElementById('landing-portal');
  const appWorkspace = document.getElementById('app-workspace');
  const loadingScreen = document.getElementById('app-loading-screen');

  try {
    // 1. Verify token & session with backend
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
          // Token expired or invalid
          currentUser = null;
          currentToken = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.warn('Session verification warning:', err);
      }
    }

    // 2. Populate metadata and dropdowns
    populateDropdowns();
    bindForms();
    loadMetadata();

    // 3. Render appropriate view
    if (currentUser && currentToken) {
      if (landingPortal) landingPortal.style.display = 'none';
      if (appWorkspace) appWorkspace.style.display = 'flex';

      updateUserUi();

      const hashTab = (location.hash && location.hash !== '#' && location.hash !== '#/') ? location.hash.replace('#', '') : null;
      let targetTab = hashTab || 'map';

      await switchWorkspaceTab(targetTab, false);
      setInterval(checkNotifications, 30000);
      requestNotificationPermission();
    } else {
      if (appWorkspace) appWorkspace.style.display = 'none';
      if (landingPortal) landingPortal.style.display = 'flex';
    }
  } catch (err) {
    console.error('App init error:', err);
    if (appWorkspace) appWorkspace.style.display = 'none';
    if (landingPortal) landingPortal.style.display = 'flex';
  } finally {
    // 4. Smooth Fade-Out Loading Screen (Guaranteed 0% Stuck)
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 350);
    }
  }
}

// ============================================================================
// 2. AUTHENTICATION & LOGIN MANAGEMENT
// ============================================================================
function switchAuthTab(type) {
  const citTab = document.getElementById('tab-cit-btn');
  const empTab = document.getElementById('tab-emp-btn');
  const citForm = document.getElementById('auth-form-citizen');
  const empForm = document.getElementById('auth-form-employee');

  if (type === 'citizen') {
    if (citTab) citTab.classList.add('active');
    if (empTab) empTab.classList.remove('active');
    if (citForm) citForm.style.display = 'block';
    if (empForm) empForm.style.display = 'none';
  } else {
    if (empTab) empTab.classList.add('active');
    if (citTab) citTab.classList.remove('active');
    if (empForm) empForm.style.display = 'block';
    if (citForm) citForm.style.display = 'none';
  }
}

async function quickDemoLogin(email) {
  switchAuthTab('employee');
  const emailInput = document.getElementById('login-emp-email');
  const passInput = document.getElementById('login-emp-password');

  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = '123456';

  showToast(`${email} hesabı ile giriş yapılıyor...`, 'info');
  await executeLogin(email, '123456');
}

function triggerGuestComplaintNotice() {
  if (!currentUser) {
    showToast('Talep ve şikâyet oluşturabilmek için lütfen giriş yapın veya kayıt olun.', 'info');
    switchAuthTab('citizen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    openCreateComplaintForm();
  }
}

async function handleAuthLogin(e, roleType) {
  if (e) e.preventDefault();
  const formId = roleType === 'personel' ? 'auth-form-employee' : 'auth-form-citizen';
  const form = document.getElementById(formId);
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş Yapılıyor...';
  }

  const email = roleType === 'personel'
    ? document.getElementById('login-emp-email')?.value
    : document.getElementById('login-cit-email')?.value;
  const password = roleType === 'personel'
    ? document.getElementById('login-emp-password')?.value
    : document.getElementById('login-cit-password')?.value;

  try {
    await executeLogin(email, password);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitBtn.dataset.origHtml || 'Giriş Yap';
    }
  }
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

      let targetTab = 'map';
      await switchWorkspaceTab(targetTab, false);
      checkNotifications();
      requestNotificationPermission();
    } else {
      showToast(data.message || 'Giriş yapılamadı.', 'error');
    }
  } catch (err) {
    showToast('Sunucu bağlantı hatası.', 'error');
  }
}

function logoutUser() {
  localStorage.clear();
  currentToken = null;
  currentUser = null;
  currentFetchedComplaints = [];
  currentFetchedAdminUsers = [];
  currentFetchedAdminDepts = [];

  document.querySelectorAll('form').forEach(f => f.reset());
  history.replaceState(null, '', location.pathname);

  const landingPortal = document.getElementById('landing-portal');
  const appWorkspace = document.getElementById('app-workspace');
  if (appWorkspace) appWorkspace.style.display = 'none';
  if (landingPortal) landingPortal.style.display = 'flex';

  showToast('Oturum kapatıldı.', 'info');
}

// ============================================================================
// 3. RBAC & ROLE-BASED UI ROUTING (KURUMSAL YETKİLENDİRME)
// ============================================================================
function getDefaultRoleTab(roleName) {
  // Varsayılan Açılış Sayfası = Harita Analizi (#map)
  return 'map';
}

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

  // Sidebar Menu Items
  const dashNav = document.getElementById('nav-dash');
  const allComplaintsNav = document.getElementById('nav-complaints');
  const createCompNav = document.getElementById('nav-create-complaint');
  const myComplaintsNav = document.getElementById('nav-my-complaints');
  const deptsNav = document.getElementById('nav-depts-menu');
  const publicFeedNav = document.getElementById('nav-public-feed');
  const mapNav = document.getElementById('nav-map');
  const solutionArchiveNav = document.getElementById('nav-solution-archive');
  const adminUsersNav = document.getElementById('nav-admin-users');
  const adminDeptsNav = document.getElementById('nav-admin-depts');
  const adminLogsNav = document.getElementById('nav-admin-logs');
  const deptStaffNav = document.getElementById('nav-dept-staff');
  const reportsNav = document.getElementById('nav-reports');
  const announcementsNav = document.getElementById('nav-announcements');
  const helpNav = document.getElementById('nav-help');
  const btnAdminAnnouncement = document.getElementById('btn-admin-add-announcement');
  const btnCitizenNew = document.getElementById('btn-citizen-new');

  const complaintsNavSpan = allComplaintsNav?.querySelector('span');
  const roleId = Number(currentUser.role_id);

  // Common: Solution Archive and Announcements available for all logged-in roles
  if (solutionArchiveNav) solutionArchiveNav.style.display = 'block';
  if (announcementsNav) announcementsNav.style.display = 'block';

  if (currentUser.role_name === 'Vatandaş' || roleId === 4) {
    // 1. VATANDAŞ
    if (dashNav) dashNav.style.display = 'block';
    if (createCompNav) createCompNav.style.display = 'block';
    if (myComplaintsNav) myComplaintsNav.style.display = 'block';
    if (publicFeedNav) publicFeedNav.style.display = 'block';
    if (btnCitizenNew) btnCitizenNew.style.display = 'inline-flex';

    if (allComplaintsNav) allComplaintsNav.style.display = 'none';
    if (deptsNav) deptsNav.style.display = 'none';
    if (deptStaffNav) deptStaffNav.style.display = 'none';
    if (mapNav) mapNav.style.display = 'none';
    if (reportsNav) reportsNav.style.display = 'none';
    if (helpNav) helpNav.style.display = 'none';
    if (adminUsersNav) adminUsersNav.style.display = 'none';
    if (adminDeptsNav) adminDeptsNav.style.display = 'none';
    if (adminLogsNav) adminLogsNav.style.display = 'none';
    if (btnAdminAnnouncement) btnAdminAnnouncement.style.display = 'none';

    // Vatandaş: Belediye içi scope filtresini DOM'dan gizle
    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) { 
      scopeSelect.style.setProperty('display', 'none', 'important'); 
      scopeSelect.value = 'ALL'; 
    }

  } else if (currentUser.role_name === 'Belediye Başkanı' || roleId === 5) {
    // 2. BELEDİYE BAŞKANI: Genel Gözlemci (Executive Read-Only)
    if (dashNav) dashNav.style.display = 'block';
    if (allComplaintsNav) {
      allComplaintsNav.style.display = 'block';
      if (complaintsNavSpan) complaintsNavSpan.textContent = 'Tüm Belediye Talepleri';
    }
    if (publicFeedNav) publicFeedNav.style.display = 'block';
    if (mapNav) mapNav.style.display = 'block';
    if (reportsNav) reportsNav.style.display = 'block';
    if (btnCitizenNew) btnCitizenNew.style.display = 'none';
    
    if (createCompNav) createCompNav.style.display = 'none';
    if (myComplaintsNav) myComplaintsNav.style.display = 'none';
    if (deptsNav) deptsNav.style.display = 'none';
    if (deptStaffNav) deptStaffNav.style.display = 'none';
    if (adminUsersNav) adminUsersNav.style.display = 'none';
    if (adminDeptsNav) adminDeptsNav.style.display = 'none';
    if (adminLogsNav) adminLogsNav.style.display = 'none';
    if (helpNav) helpNav.style.display = 'none';
    if (btnAdminAnnouncement) btnAdminAnnouncement.style.display = 'none';

    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) scopeSelect.style.removeProperty('display');

  } else if (currentUser.role_name === 'Belediye Başkan Yardımcısı' || roleId === 6) {
    // 3. BELEDİYE BAŞKAN YARDIMCISI: Sadece zimmetli birimlerin durumu ve raporları
    if (dashNav) dashNav.style.display = 'block';
    if (allComplaintsNav) {
      allComplaintsNav.style.display = 'block';
      if (complaintsNavSpan) complaintsNavSpan.textContent = 'Bağlı Birim Talepleri';
    }
    if (publicFeedNav) publicFeedNav.style.display = 'block';
    if (mapNav) mapNav.style.display = 'block';
    if (reportsNav) reportsNav.style.display = 'block';
    if (deptStaffNav) deptStaffNav.style.display = 'block';
    if (btnCitizenNew) btnCitizenNew.style.display = 'none';

    if (createCompNav) createCompNav.style.display = 'none';
    if (myComplaintsNav) myComplaintsNav.style.display = 'none';
    if (deptsNav) deptsNav.style.display = 'none';
    if (adminUsersNav) adminUsersNav.style.display = 'none';
    if (adminDeptsNav) adminDeptsNav.style.display = 'none';
    if (adminLogsNav) adminLogsNav.style.display = 'none';
    if (helpNav) helpNav.style.display = 'none';
    if (btnAdminAnnouncement) btnAdminAnnouncement.style.display = 'none';

    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) scopeSelect.style.removeProperty('display');

  } else if (currentUser.role_name === 'Birim Yöneticisi' || roleId === 2) {
    // 4. BİRİM YÖNETİCİSİ (Müdür)
    if (dashNav) dashNav.style.display = 'block';
    if (allComplaintsNav) {
      allComplaintsNav.style.display = 'block';
      if (complaintsNavSpan) complaintsNavSpan.textContent = 'Birim Talepleri';
    }
    if (createCompNav) createCompNav.style.display = 'block';
    if (publicFeedNav) publicFeedNav.style.display = 'block';
    if (mapNav) mapNav.style.display = 'block';
    if (deptStaffNav) deptStaffNav.style.display = 'block';
    if (reportsNav) reportsNav.style.display = 'block';
    if (btnCitizenNew) btnCitizenNew.style.display = 'inline-flex';

    if (myComplaintsNav) myComplaintsNav.style.display = 'none';
    if (deptsNav) deptsNav.style.display = 'none';
    if (adminUsersNav) adminUsersNav.style.display = 'none';
    if (adminDeptsNav) adminDeptsNav.style.display = 'none';
    if (adminLogsNav) adminLogsNav.style.display = 'none';
    if (helpNav) helpNav.style.display = 'none';
    if (btnAdminAnnouncement) btnAdminAnnouncement.style.display = 'none';

    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) {
      scopeSelect.style.removeProperty('display');
      scopeSelect.style.display = 'inline-block';
      scopeSelect.innerHTML = `
        <option value="ALL">🏢 Birimime Gelen Tüm Talepler</option>
        <option value="UNASSIGNED">⏳ Atama Bekleyenler</option>
        <option value="ASSIGNED">👥 Personele Atananlar</option>
        <option value="FORWARDED">🔄 Diğer Birimlerden Yönlendirilenler</option>
      `;
    }

  } else if (currentUser.role_name === 'Personel' || roleId === 3) {
    // 5. PERSONEL (Saha Görevlisi)
    if (allComplaintsNav) {
      allComplaintsNav.style.display = 'block';
      if (complaintsNavSpan) complaintsNavSpan.textContent = 'Birim Talepleri';
    }
    if (createCompNav) createCompNav.style.display = 'block';
    if (mapNav) mapNav.style.display = 'block';
    if (btnCitizenNew) btnCitizenNew.style.display = 'inline-flex';

    if (dashNav) dashNav.style.display = 'none';
    if (myComplaintsNav) myComplaintsNav.style.display = 'none';
    if (deptsNav) deptsNav.style.display = 'none';
    if (deptStaffNav) deptStaffNav.style.display = 'none';
    if (publicFeedNav) publicFeedNav.style.display = 'none';
    if (reportsNav) reportsNav.style.display = 'none';
    if (adminUsersNav) adminUsersNav.style.display = 'none';
    if (adminDeptsNav) adminDeptsNav.style.display = 'none';
    if (adminLogsNav) adminLogsNav.style.display = 'none';
    if (helpNav) helpNav.style.display = 'none';
    if (btnAdminAnnouncement) btnAdminAnnouncement.style.display = 'none';

    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) {
      scopeSelect.style.removeProperty('display');
      scopeSelect.style.display = 'inline-block';
      scopeSelect.innerHTML = `
        <option value="ALL">🏢 Tüm Birim Talepleri</option>
        <option value="MY_ASSIGNED" selected>👤 Şahsıma Atanan Görevler</option>
        <option value="FORWARDED">🔄 Yönlendirilen Talepler</option>
      `;
    }

  } else if (currentUser.role_name === 'Sistem Yöneticisi' || roleId === 1) {
    // 6. SİSTEM YÖNETİCİSİ (Admin)
    if (dashNav) dashNav.style.display = 'block';
    if (deptsNav) deptsNav.style.display = 'block';
    if (allComplaintsNav) {
      allComplaintsNav.style.display = 'block';
      if (complaintsNavSpan) complaintsNavSpan.textContent = 'Tüm Talepler';
    }
    if (createCompNav) createCompNav.style.display = 'block';
    if (myComplaintsNav) myComplaintsNav.style.display = 'block';
    if (publicFeedNav) publicFeedNav.style.display = 'block';
    if (mapNav) mapNav.style.display = 'block';
    if (adminUsersNav) adminUsersNav.style.display = 'block';
    if (adminDeptsNav) adminDeptsNav.style.display = 'block';
    if (adminLogsNav) adminLogsNav.style.display = 'block';
    if (deptStaffNav) deptStaffNav.style.display = 'block';
    if (reportsNav) reportsNav.style.display = 'block';
    if (announcementsNav) announcementsNav.style.display = 'block';
    if (helpNav) helpNav.style.display = 'block';
    if (btnAdminAnnouncement) btnAdminAnnouncement.style.display = 'inline-flex';
    if (btnCitizenNew) btnCitizenNew.style.display = 'inline-flex';

    const scopeSelect = document.getElementById('filter-complaint-scope');
    if (scopeSelect) {
      scopeSelect.style.removeProperty('display');
      scopeSelect.style.display = 'inline-block';
      scopeSelect.innerHTML = `
        <option value="ALL">🏢 Tüm Belediye Talepleri</option>
        <option value="UNASSIGNED">⏳ Atama Bekleyenler</option>
        <option value="ASSIGNED">👥 Personele Atananlar</option>
        <option value="FORWARDED">🔄 Yönlendirilenler</option>
      `;
    }
  }
}

// ============================================================================
// 4. SPA ROUTING & TAB SWITCHER
// ============================================================================
const SPA_VALID_ROUTES = [
  'dashboard', 'create-complaint', 'my-complaints', 'public-feed',
  'map', 'archive', 'solution-archive', 'admin-users', 'admin-depts', 'admin-logs', 'dept-staff', 'reports',
  'announcements', 'complaints', 'help'
];

const TAB_NAV_MAP = {
  'dashboard': 'nav-dash',
  'create-complaint': 'nav-create-complaint',
  'my-complaints': 'nav-my-complaints',
  'complaints': 'nav-complaints',
  'public-feed': 'nav-public-feed',
  'map': 'nav-map',
  'archive': 'nav-archive',
  'solution-archive': 'nav-archive',
  'admin-users': 'nav-admin-users',
  'admin-depts': 'nav-admin-depts',
  'admin-logs': 'nav-admin-logs',
  'dept-staff': 'nav-dept-staff',
  'reports': 'nav-reports',
  'announcements': 'nav-announcements',
  'help': 'nav-help'
};

const SPA_ROLE_ROUTES = {
  'Vatandaş': ['dashboard', 'create-complaint', 'my-complaints', 'public-feed', 'archive', 'solution-archive', 'announcements'],
  'Personel': ['complaints', 'create-complaint', 'map', 'archive', 'solution-archive', 'announcements'],
  'Birim Yöneticisi': ['dashboard', 'complaints', 'create-complaint', 'public-feed', 'map', 'dept-staff', 'reports', 'archive', 'solution-archive', 'announcements'],
  'Belediye Başkan Yardımcısı': ['dashboard', 'complaints', 'public-feed', 'map', 'dept-staff', 'reports', 'archive', 'solution-archive', 'announcements'],
  'Belediye Başkanı': ['dashboard', 'complaints', 'public-feed', 'map', 'reports', 'archive', 'solution-archive', 'announcements'],
  'Sistem Yöneticisi': ['dashboard', 'create-complaint', 'my-complaints', 'complaints', 'public-feed', 'map', 'archive', 'solution-archive', 'admin-users', 'admin-depts', 'admin-logs', 'dept-staff', 'reports', 'announcements', 'help']
};

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

async function switchWorkspaceTab(tabName, pushState = true) {
  if (!currentUser || !currentToken) {
    const landingPortal = document.getElementById('landing-portal');
    const appWorkspace = document.getElementById('app-workspace');
    if (appWorkspace) appWorkspace.style.display = 'none';
    if (landingPortal) landingPortal.style.display = 'flex';
    return;
  }

  const roleName = currentUser.role_name || 'Vatandaş';
  const allowedTabs = SPA_ROLE_ROUTES[roleName] || ['dashboard'];

  let activeTab = tabName;
  if (!SPA_VALID_ROUTES.includes(activeTab) || !allowedTabs.includes(activeTab)) {
    activeTab = getDefaultRoleTab(roleName);
  }

  // Update Navigation Active Class
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    if (!li.classList.contains('has-submenu')) li.classList.remove('active');
  });

  const navId = TAB_NAV_MAP[activeTab];
  if (navId) {
    const activeNavEl = document.getElementById(navId);
    if (activeNavEl) activeNavEl.classList.add('active');
  }

  // Update Page Title
  const titleMap = {
    'dashboard': 'Gösterge Paneli',
    'create-complaint': 'Yeni Talep Oluştur',
    'my-complaints': 'Başvurularım',
    'complaints': currentUser.role_name === 'Personel' ? 'Görevlerim & Birim Talepleri' : 'Tüm Talepler',
    'public-feed': 'Kamuya Açık Talepler',
    'map': 'Harita Analizi',
    'archive': 'Çözüm Arşivi',
    'solution-archive': 'Çözüm Arşivi',
    'admin-users': 'Kullanıcı Yönetimi',
    'admin-depts': 'Müdürlük Yönetimi',
    'admin-logs': 'Audit Güvenlik Logları',
    'dept-staff': 'Birim Saha Personelleri',
    'reports': 'Yönetimsel Analitik & Raporlar',
    'announcements': 'Resmi Duyurular',
    'help': 'Yardım & SSS'
  };

  const pageTitleEl = document.getElementById('ws-page-title');
  if (pageTitleEl && titleMap[activeTab]) {
    pageTitleEl.textContent = titleMap[activeTab];
  }

  // Show Active Section, Hide Others
  document.querySelectorAll('.main-content > section').forEach(sec => {
    sec.style.display = 'none';
  });

  const tableTitle = document.getElementById('table-title');

  if (activeTab === 'my-complaints') {
    const targetSec = document.getElementById('sec-complaints');
    if (targetSec) targetSec.style.display = 'block';
    if (tableTitle) tableTitle.innerHTML = '<i class="fas fa-folder-open" style="color: var(--portal-blue-accent); margin-right: 6px;"></i> Başvurularım ve Talep Geçmişim';
  } else if (activeTab === 'complaints') {
    const targetSec = document.getElementById('sec-complaints');
    if (targetSec) targetSec.style.display = 'block';
    if (tableTitle) {
      const isStaff = currentUser?.role_name === 'Personel' || currentUser?.role_id === 3;
      tableTitle.innerHTML = `<i class="fas fa-list-check" style="color: var(--portal-blue-accent); margin-right: 6px;"></i> ${isStaff ? 'Görevlerim & Birim Talepleri' : 'Şikâyet ve Talep Listesi'}`;
    }
  } else if (activeTab === 'archive' || activeTab === 'solution-archive') {
    const targetSec = document.getElementById('archive-view') || document.getElementById('sec-solution-archive');
    if (targetSec) targetSec.style.display = 'block';
  } else {
    const targetSecId = `sec-${activeTab}`;
    const targetSec = document.getElementById(targetSecId);
    if (targetSec) {
      targetSec.style.display = 'block';
    }
  }

  // Update URL Hash
  if (pushState) {
    history.pushState(null, '', `#${activeTab}`);
  }

  toggleMobileSidebar(false);

  // Trigger Section Specific Data Loaders
  if (activeTab === 'dashboard') {
    await loadDashboardData();
  } else if (activeTab === 'complaints') {
    await loadComplaintsTable(false);
  } else if (activeTab === 'my-complaints') {
    await loadComplaintsTable(true);
  } else if (activeTab === 'public-feed') {
    await loadPublicComplaintsFeed();
  } else if (activeTab === 'map') {
    await loadMapData();
    renderMapAnnouncementsBanner();
    setTimeout(() => {
      if (typeof explorerMap !== 'undefined' && explorerMap) {
        explorerMap.invalidateSize();
      }
    }, 200);
  } else if (activeTab === 'archive' || activeTab === 'solution-archive') {
    await renderArchiveView();
  } else if (activeTab === 'dept-staff') {
    await renderViceMayorHierarchyCards();
    await loadDeptStaffTable();
  } else if (activeTab === 'reports') {
    await loadReportsData();
  } else if (activeTab === 'admin-users') {
    await loadAdminUsersTable();
  } else if (activeTab === 'admin-depts') {
    await loadAdminDeptsTable();
  } else if (activeTab === 'admin-logs') {
    await loadAdminLogsTable();
  } else if (activeTab === 'announcements') {
    await loadAnnouncements();
  } else if (activeTab === 'create-complaint') {
    // 1 & 3. isCreateMode Koruması & CSS ile Hard-Hide
    isCreateMode = true;
    currentViewingComplaintId = null;

    closeModal('modal-complaint-detail');
    const detailCont = document.getElementById('complaint-detail-content');
    if (detailCont) {
      detailCont.innerHTML = '';
      detailCont.classList.add('d-none', 'timeline-hidden');
      detailCont.style.display = 'none';
    }

    const form = document.getElementById('page-form-new-complaint');
    if (form) form.reset();
    const aiBox = document.getElementById('page-ai-suggestion-container');
    if (aiBox) {
      aiBox.style.display = 'none';
      aiBox.innerHTML = '';
    }

    if (typeof initPageLocationPickerMap === 'function') {
      setTimeout(initPageLocationPickerMap, 100);
    }
  }
}

window.addEventListener('popstate', () => {
  const hash = location.hash.replace('#', '');
  if (hash && SPA_VALID_ROUTES.includes(hash)) {
    switchWorkspaceTab(hash, false);
  }
});

// ============================================================================
// 5. METADATA LOADERS & CASCADING DROPDOWNS
// ============================================================================
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
    if (locData.success && locData.districts && locData.districts.length > 0) {
      districtsList = locData.districts;
      neighborhoodsList = locData.neighborhoods;
    }

    populateDropdowns();
  } catch (err) {
    console.error('Metadata load error:', err);
  }
}

function populateDropdowns() {
  // Modal selects
  const modalDept = document.getElementById('complaint-department');
  const modalCat = document.getElementById('complaint-category');
  const modalNeigh = document.getElementById('complaint-neighborhood');

  // Page selects
  const pageDept = document.getElementById('page-complaint-department');
  const pageCat = document.getElementById('page-complaint-category');
  const pageNeigh = document.getElementById('page-complaint-neighborhood');

  // Filter selects
  const filterCat = document.getElementById('filter-complaint-category');
  const filterNeigh = document.getElementById('filter-complaint-neighborhood');
  const sidebarDeptList = document.getElementById('sidebar-dept-list');

  // Departments
  const deptOptions = '<option value="">-- Birim / Müdürlük Seçiniz --</option>' +
    departmentsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  if (modalDept) modalDept.innerHTML = deptOptions;
  if (pageDept) pageDept.innerHTML = deptOptions;

  // Categories
  const catOptions = '<option value="">-- Kategori Seçiniz --</option>' +
    categoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  if (modalCat) modalCat.innerHTML = catOptions;
  if (pageCat) pageCat.innerHTML = catOptions;

  if (filterCat) {
    filterCat.innerHTML = '<option value="ALL">Tüm Kategoriler</option>' +
      categoriesList.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  // Bulancak Neighborhoods
  const neighOptions = '<option value="">-- Mahalle Seçiniz --</option>' +
    neighborhoodsList.map(n => `<option value="${n.id}">${n.name}</option>`).join('');

  if (modalNeigh) modalNeigh.innerHTML = neighOptions;
  if (pageNeigh) pageNeigh.innerHTML = neighOptions;

  if (filterNeigh) {
    filterNeigh.innerHTML = '<option value="ALL">Tüm Mahalleler</option>' +
      neighborhoodsList.map(n => `<option value="${n.name}">${n.name}</option>`).join('');
  }

  const reportNeigh = document.getElementById('report-filter-neighborhood');
  if (reportNeigh) {
    reportNeigh.innerHTML = '<option value="ALL">📍 Tüm Mahalleler</option>' +
      neighborhoodsList.map(n => `<option value="${n.name}">${n.name}</option>`).join('');
  }

  // Dynamic Sidebar Departments Submenu grouped by Vice Mayor
  if (sidebarDeptList && Array.isArray(departmentsList) && departmentsList.length > 0) {
    sidebarDeptList.innerHTML = '';
    
    // Group departments by vice mayor
    const vmGroups = new Map();
    const unassigned = [];

    departmentsList.forEach(d => {
      if (d.vice_mayor_name && d.vice_mayor_name !== 'Atanmadı') {
        const vmName = d.vice_mayor_name;
        if (!vmGroups.has(vmName)) {
          vmGroups.set(vmName, []);
        }
        vmGroups.get(vmName).push(d);
      } else {
        unassigned.push(d);
      }
    });

    let html = '';
    let vmIndex = 1;
    const headerColors = [
      { color: '#93c5fd', bg: 'rgba(30, 58, 138, 0.35)' },
      { color: '#d8b4fe', bg: 'rgba(88, 28, 135, 0.35)' },
      { color: '#86efac', bg: 'rgba(6, 78, 59, 0.35)' },
      { color: '#fde047', bg: 'rgba(113, 63, 18, 0.35)' }
    ];

    vmGroups.forEach((depts, vmName) => {
      const theme = headerColors[(vmIndex - 1) % headerColors.length];
      html += `<li style="padding: 6px 12px; font-size: 0.72rem; color: ${theme.color}; font-weight: 800; text-transform: uppercase; background: ${theme.bg}; border-radius: 4px; margin: 6px 6px 4px 6px; letter-spacing: 0.5px;"><i class="fas fa-user-shield" style="margin-right: 4px;"></i> ${vmIndex}. BAŞKAN YARDIMCISI (${vmName.split(' ')[0]})</li>`;
      html += depts.map(d => {
        const safeName = (d.name || '').replace(/'/g, "\\'");
        return `
          <li>
            <a href="#" onclick="filterByDepartment(${d.id}, '${safeName}'); return false;" style="padding-left: 20px;">
              <i class="fas fa-angle-right" style="font-size:0.75rem;"></i> ${d.name}
            </a>
          </li>
        `;
      }).join('');
      vmIndex++;
    });

    if (unassigned.length > 0) {
      html += `<li style="padding: 6px 12px; font-size: 0.72rem; color: #cbd5e1; font-weight: 800; text-transform: uppercase; background: rgba(51, 65, 85, 0.35); border-radius: 4px; margin: 8px 6px 4px 6px; letter-spacing: 0.5px;"><i class="fas fa-building" style="margin-right: 4px;"></i> DİĞER BİRİMLER</li>`;
      html += unassigned.map(d => {
        const safeName = (d.name || '').replace(/'/g, "\\'");
        return `
          <li>
            <a href="#" onclick="filterByDepartment(${d.id}, '${safeName}'); return false;" style="padding-left: 20px;">
              <i class="fas fa-angle-right" style="font-size:0.75rem;"></i> ${d.name}
            </a>
          </li>
        `;
      }).join('');
    }

    sidebarDeptList.innerHTML = html;
  }
}

function bindForms() {
  const modalForm = document.getElementById('form-new-complaint');
  if (modalForm && !modalForm.dataset.bound) {
    modalForm.dataset.bound = 'true';
    modalForm.addEventListener('submit', handleNewComplaintSubmit);
  }

  // Cascading Department -> Category in Modal
  const modalDept = document.getElementById('complaint-department');
  const modalCat = document.getElementById('complaint-category');
  if (modalDept && modalCat) {
    modalDept.addEventListener('change', (e) => {
      const deptId = Number(e.target.value);
      if (deptId) {
        const filtered = categoriesList.filter(c => Number(c.department_id) === deptId);
        modalCat.innerHTML = '<option value="">-- Kategori Seçiniz --</option>' +
          (filtered.length > 0 ? filtered : categoriesList).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      } else {
        modalCat.innerHTML = '<option value="">-- Kategori Seçiniz --</option>' +
          categoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }
    });
  }

  // Cascading Department -> Category in Page Form
  const pageDept = document.getElementById('page-complaint-department');
  const pageCat = document.getElementById('page-complaint-category');
  if (pageDept && pageCat) {
    pageDept.addEventListener('change', (e) => {
      const deptId = Number(e.target.value);
      if (deptId) {
        const filtered = categoriesList.filter(c => Number(c.department_id) === deptId);
        pageCat.innerHTML = '<option value="">-- Kategori Seçiniz --</option>' +
          (filtered.length > 0 ? filtered : categoriesList).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      } else {
        pageCat.innerHTML = '<option value="">-- Kategori Seçiniz --</option>' +
          categoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }
    });
  }

  // Mahalle map centering
  const modalNeigh = document.getElementById('complaint-neighborhood');
  if (modalNeigh) {
    modalNeigh.addEventListener('change', (e) => {
      if (e.target.value && typeof flyToNeighborhoodLocation === 'function') {
        flyToNeighborhoodLocation(e.target.value);
      }
    });
  }

  const pageNeigh = document.getElementById('page-complaint-neighborhood');
  if (pageNeigh) {
    pageNeigh.addEventListener('change', (e) => {
      if (e.target.value && typeof flyToNeighborhoodLocation === 'function') {
        flyToNeighborhoodLocation(e.target.value);
      }
    });
  }
}

function toggleDeptSubmenu(e) {
  if (e) e.preventDefault();
  const parent = document.getElementById('nav-depts-menu');
  if (parent) parent.classList.toggle('open');
}

// ============================================================================
// 6. COMPLAINTS MANAGEMENT (TABLE, FILTERS, DETAIL MODAL)
// ============================================================================
let currentFilterState = {
  scope: 'ALL',
  category: 'ALL',
  neighborhood: 'ALL',
  status: 'ALL',
  date: 'ALL',
  sort: 'DESC',
  page: 1,
  pageSize: 10
};

function getBadgeClass(status) {
  if (!status) return 'badge-new badge-yeni';
  const s = status.toLowerCase();
  if (s.includes('çözüldü') || s.includes('cozuldu')) return 'badge-resolved badge-cozuldu';
  if (s.includes('devam') || s.includes('işlemde')) return 'badge-in-progress badge-devam';
  if (s.includes('atandı') || s.includes('atandi')) return 'badge-assigned badge-atanan';
  if (s.includes('yönlendirildi') || s.includes('iletildi')) return 'badge-forwarded';
  if (s.includes('iptal') || s.includes('reddedildi')) return 'badge-rejected badge-red';
  return 'badge-new badge-yeni';
}

function getPriorityBadge(priority) {
  const p = (priority || 'Normal').trim();
  if (p === 'Acil' || p === 'Kritik' || p === 'Yüksek') {
    return `<span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; font-weight:700; font-size:0.74rem; padding: 2px 8px; border-radius: 6px; display:inline-flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:#ef4444;"></span> Acil</span>`;
  }
  if (p === 'Düşük') {
    return `<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:700; font-size:0.74rem; padding: 2px 8px; border-radius: 6px; display:inline-flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:#64748b;"></span> Düşük</span>`;
  }
  return `<span class="badge" style="background:#fef9c3; color:#854d0e; border:1px solid #fde047; font-weight:700; font-size:0.74rem; padding: 2px 8px; border-radius: 6px; display:inline-flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:#eab308;"></span> Normal</span>`;
}

let activeSidebarDepartmentId = null;
let activeSidebarDepartmentName = null;

async function filterByDepartment(deptId, deptName) {
  activeSidebarDepartmentId = Number(deptId);
  activeSidebarDepartmentName = deptName;

  // 1. Switch to 'complaints' tab
  await switchWorkspaceTab('complaints');

  // 2. Set the table title to reflect the filtered department
  const tableTitle = document.getElementById('table-title');
  if (tableTitle) {
    tableTitle.innerHTML = `<i class="fas fa-building" style="color: var(--portal-blue-accent); margin-right: 6px;"></i> ${deptName || 'Birim'} Talepleri`;
  }

  // 3. Set Vice Mayor Dept dropdown if present
  const vmDeptSelect = document.getElementById('filter-vice-mayor-dept');
  if (vmDeptSelect) {
    let exists = Array.from(vmDeptSelect.options).some(opt => Number(opt.value) === Number(deptId));
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = deptId;
      opt.textContent = `🏛️ ${deptName}`;
      vmDeptSelect.appendChild(opt);
    }
    vmDeptSelect.value = String(deptId);
  }

  // 4. Update Category dropdown to only show categories of this department
  const filterCat = document.getElementById('filter-complaint-category');
  if (filterCat) {
    const deptCats = categoriesList.filter(c => Number(c.department_id) === Number(deptId));
    filterCat.innerHTML = '<option value="ALL">Tüm Kategoriler</option>' +
      (deptCats.length > 0 ? deptCats : categoriesList).map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    filterCat.value = 'ALL';
  }

  // 5. Reset other filter dropdowns
  const filterStatus = document.getElementById('filter-complaint-status');
  if (filterStatus) filterStatus.value = 'ALL';
  const filterNeigh = document.getElementById('filter-complaint-neighborhood');
  if (filterNeigh) filterNeigh.value = 'ALL';
  const filterDate = document.getElementById('filter-complaint-date');
  if (filterDate) filterDate.value = 'ALL';
  const filterScope = document.getElementById('filter-complaint-scope');
  if (filterScope) filterScope.value = 'ALL';

  // 6. Fetch all complaints and filter by this department
  await loadComplaintsTable(false, deptId);
}

function resetComplaintFilters() {
  activeSidebarDepartmentId = null;
  activeSidebarDepartmentName = null;

  const tableTitle = document.getElementById('table-title');
  if (tableTitle) {
    tableTitle.innerHTML = `<i class="fas fa-list-check" style="color: var(--portal-blue-accent);"></i> Şikâyet ve Talep Listesi`;
  }

  const vmDeptSelect = document.getElementById('filter-vice-mayor-dept');
  if (vmDeptSelect) vmDeptSelect.value = 'ALL';

  const filterScope = document.getElementById('filter-complaint-scope');
  if (filterScope) filterScope.value = 'ALL';

  const filterCat = document.getElementById('filter-complaint-category');
  if (filterCat) {
    filterCat.innerHTML = '<option value="ALL">Tüm Kategoriler</option>' +
      categoriesList.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    filterCat.value = 'ALL';
  }

  const filterNeigh = document.getElementById('filter-complaint-neighborhood');
  if (filterNeigh) filterNeigh.value = 'ALL';

  const filterStatus = document.getElementById('filter-complaint-status');
  if (filterStatus) filterStatus.value = 'ALL';

  const filterDate = document.getElementById('filter-complaint-date');
  if (filterDate) filterDate.value = 'ALL';

  const filterSort = document.getElementById('filter-complaint-sort');
  if (filterSort) filterSort.value = 'DESC';

  loadComplaintsTable(false, null);
}

async function loadComplaintsTable(mineOnly = false, deptId = null) {
  const tbody = document.getElementById('tbody-complaints');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;"><i class="fas fa-spinner fa-spin"></i> Talepler yükleniyor...</td></tr>';
  }

  try {
    const url = mineOnly ? '/api/complaints/mine' : '/api/complaints/all';
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && Array.isArray(data.complaints)) {
      currentFetchedComplaints = data.complaints;
      const targetDeptId = deptId || activeSidebarDepartmentId;
      if (targetDeptId) {
        currentFetchedComplaints = currentFetchedComplaints.filter(c => Number(c.department_id) === Number(targetDeptId));
      }
      applyComplaintFilters();
    } else {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">Kayıt bulunamadı.</td></tr>';
    }
  } catch (err) {
    console.error('loadComplaintsTable error:', err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 24px;">Talepler yüklenirken hata oluştu.</td></tr>';
  }
}

function applyComplaintFilters() {
  const tbody = document.getElementById('tbody-complaints');
  if (!tbody || !currentFetchedComplaints) return;

  const scopeVal = document.getElementById('filter-complaint-scope')?.value || 'ALL';
  const vmDeptVal = document.getElementById('filter-vice-mayor-dept')?.value || 'ALL';
  const catVal = document.getElementById('filter-complaint-category')?.value || 'ALL';
  const neighVal = document.getElementById('filter-complaint-neighborhood')?.value || 'ALL';
  const statusVal = document.getElementById('filter-complaint-status')?.value || 'ALL';
  const dateVal = document.getElementById('filter-complaint-date')?.value || 'ALL';
  const sortVal = document.getElementById('filter-complaint-sort')?.value || 'DESC';
  const pageSize = parseInt(document.getElementById('complaint-page-size')?.value || '10');

  let filtered = currentFetchedComplaints.filter(c => {
    // Vice Mayor Sub-Department Filter (Role 6)
    if (vmDeptVal !== 'ALL') {
      if (Number(c.department_id) !== Number(vmDeptVal)) return false;
    }

    // Scope Filter
    if (scopeVal === 'MY_ASSIGNED') {
      if (c.assigned_to_user_id != currentUser?.id && c.assigned_employee_id != currentUser?.employee_id) return false;
    } else if (scopeVal === 'UNASSIGNED') {
      if (c.status !== 'Yeni' && c.status !== 'İlgili birime yönlendirildi') return false;
    } else if (scopeVal === 'ASSIGNED') {
      if (c.status !== 'Personele atandı' && c.status !== 'İşlem devam ediyor') return false;
    } else if (scopeVal === 'FORWARDED') {
      if (!c.is_forwarded) return false;
    }

    // Category Filter
    if (catVal !== 'ALL' && c.category_name !== catVal) return false;

    // Neighborhood Filter
    if (neighVal !== 'ALL' && c.neighborhood_name !== neighVal) return false;

    // Status Filter
    if (statusVal !== 'ALL' && c.status !== statusVal) return false;

    // Date Filter
    if (dateVal !== 'ALL' && c.created_at) {
      const created = new Date(c.created_at);
      const now = new Date();
      if (dateVal === 'TODAY') {
        if (created.toDateString() !== now.toDateString()) return false;
      } else if (dateVal === 'WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        if (created < weekAgo) return false;
      } else if (dateVal === 'MONTH') {
        const monthAgo = new Date(now.getTime() - 30 * 86400000);
        if (created < monthAgo) return false;
      }
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    const timeA = new Date(a.created_at).getTime() || 0;
    const timeB = new Date(b.created_at).getTime() || 0;
    return sortVal === 'ASC' ? timeA - timeB : timeB - timeA;
  });

  tbody.innerHTML = ''; // Clear table body

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">Filtrelere uygun talep bulunamadı.</td></tr>';
    renderComplaintPagination(0, pageSize, 1);
    return;
  }

  // Dynamic Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  if (currentFilterState.page > totalPages) {
    currentFilterState.page = totalPages;
  }
  const page = currentFilterState.page || 1;
  const pagedList = filtered.slice((page - 1) * pageSize, page * pageSize);

  const isStaff = currentUser?.role_id === 3 || currentUser?.role_name === 'Personel';
  const isManager = currentUser?.role_id === 2 || currentUser?.role_name === 'Birim Yöneticisi';
  const isAdmin = currentUser?.role_id === 1 || currentUser?.role_name === 'Sistem Yöneticisi';

  pagedList.forEach(c => {
    const tr = document.createElement('tr');
    const createdDate = c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

    let actionButtons = '';

    if (isStaff) {
      // 1. Staff Actions matching Screenshot 2
      actionButtons = `
        <button type="button" class="btn btn-secondary btn-sm" onclick="openComplaintDetail('${c.tracking_code || c.id}')" style="padding: 5px 8px; font-size: 0.8rem; font-weight: 600;" title="Talebi İncele">
          <i class="fas fa-eye"></i>
        </button>
      `;

      if (c.status !== 'Çözüldü' && c.status !== 'İptal edildi') {
        const isAssignedToMe = Number(c.assigned_to_user_id) === Number(currentUser.id);
        if (!isAssignedToMe) {
          actionButtons += `
            <button type="button" class="btn btn-secondary btn-sm" onclick="selfAssignComplaint(${c.id})" style="padding: 5px 9px; font-size: 0.78rem; font-weight: 700; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;" title="Görevi Üzerime Al">
              <i class="fas fa-user-plus"></i> Üzerime Al
            </button>
          `;
        }
        actionButtons += `
          <button type="button" class="btn btn-primary btn-sm" onclick="openActionModal(${c.id})" style="padding: 5px 11px; font-size: 0.78rem; font-weight: 700; background: #0284c7; color: #ffffff;" title="İşlem ve Çözüm Kaydı Ekle">
            <i class="fas fa-screwdriver-wrench"></i> İşlem Yap
          </button>
        `;
      }
    } else if (isAdmin || isManager) {
      // 2. Manager & Admin Actions matching Screenshot 5
      actionButtons = `
        <button type="button" class="btn btn-secondary btn-sm" onclick="openComplaintDetail('${c.tracking_code || c.id}')" style="padding: 5px 8px; font-size: 0.8rem; font-weight: 600;" title="Talebi İncele">
          <i class="fas fa-eye"></i>
        </button>
      `;

      const isAssigned = c.assigned_to_user_id || c.status === 'Personele atandı';
      if (isAssigned) {
        actionButtons += `
          <button type="button" class="btn btn-primary btn-sm" onclick="openAssignModal(${c.id}, ${c.department_id || 1})" style="padding: 5px 9px; font-size: 0.78rem; font-weight: 700; background: #0284c7; color: #fff;" title="Başka Personele Yeniden Ata">
            <i class="fas fa-user-gear"></i> Yeniden Ata
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="unassignComplaint(${c.id})" style="padding: 5px 8px; font-size: 0.78rem; font-weight: 700; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;" title="Görev Atamasını Kaldır">
            <i class="fas fa-user-xmark"></i> Kaldır
          </button>
        `;
      } else if (c.status !== 'Çözüldü' && c.status !== 'İptal edildi') {
        actionButtons += `
          <button type="button" class="btn btn-primary btn-sm" onclick="openAssignModal(${c.id}, ${c.department_id || 1})" style="padding: 5px 11px; font-size: 0.78rem; font-weight: 700; background: #0284c7; color: #fff;" title="Personele Görev Ata">
            <i class="fas fa-user-plus"></i> Ata
          </button>
        `;
      }

      actionButtons += `
        <button type="button" class="btn btn-secondary btn-sm" onclick="openForwardDeptModal(${c.id})" style="padding: 5px 8px; font-size: 0.78rem; font-weight: 600; background: #ffffff; border: 1px solid #cbd5e1; color: #334155;" title="Başka Birime Sevk Et">
          <i class="fas fa-right-left"></i> Yönlendir
        </button>
      `;

      if (isAdmin) {
        actionButtons += `
          <button type="button" class="btn btn-secondary btn-sm" onclick="deleteAdminComplaint(${c.id})" style="padding: 5px 8px; font-size: 0.78rem; font-weight: 600; background: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6;" title="Talebi Pasife Al / Sil">
            <i class="fas fa-trash-can"></i>
          </button>
        `;
      }
    } else {
      // 3. Citizen & Mayor View
      actionButtons = `
        <button type="button" class="btn btn-secondary btn-sm" onclick="openComplaintDetail('${c.tracking_code || c.id}')" style="padding: 5px 12px; font-size: 0.8rem; font-weight: 600;" title="İncele">
          <i class="fas fa-eye"></i> İncele
        </button>
      `;
    }

    const ratingHtml = (c.status === 'Çözüldü' && c.rating) ? `
      <div style="margin-top: 3px; font-size: 0.75rem; color: #d97706; font-weight: 700; display: flex; align-items: center; gap: 3px;">
        <span>⭐ ${parseFloat(c.rating).toFixed(1)}</span>
        <small style="color: #64748b;">(1)</small>
      </div>
    ` : '';

    const priorityBadge = getPriorityBadge(c.priority_level || c.urgency_level);
    const typeBadge = c.submission_type ? `
      <span class="badge badge-neutral" style="font-size:0.7rem; margin-left:3px;">
        <i class="fas ${c.submission_type === 'Şikayet' ? 'fa-triangle-exclamation' : (c.submission_type === 'Öneri / İstek' ? 'fa-lightbulb' : 'fa-circle-info')}"></i> ${c.submission_type}
      </span>
    ` : '';

    tr.innerHTML = `
      <td style="vertical-align: middle;"><strong style="color: var(--portal-blue-primary); font-size: 0.85rem;">${c.tracking_code}</strong></td>
      <td style="vertical-align: middle;">
        <div style="font-weight: 700; color: #0f172a; font-size: 0.88rem; margin-bottom: 3px;">${c.title}</div>
        <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
          ${priorityBadge}
          ${typeBadge}
          ${c.is_public ? '<span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.7rem;">Kamuya Açık</span>' : ''}
        </div>
      </td>
      <td style="vertical-align: middle;"><span class="badge badge-neutral" style="font-size:0.78rem;">${c.category_name || 'Genel'}</span></td>
      <td style="vertical-align: middle;"><small style="color: #475569; font-weight:600;"><i class="fas fa-location-dot" style="color:#ef4444; margin-right:2px;"></i> ${c.neighborhood_name || 'Bulancak'}</small></td>
      <td style="vertical-align: middle;">
        <span class="badge ${getBadgeClass(c.status)}">${c.status || 'Yeni'}</span>
        ${ratingHtml}
      </td>
      <td style="vertical-align: middle;"><small style="color: #64748b; font-weight:600;">${createdDate}</small></td>
      <td style="vertical-align: middle; white-space: nowrap; text-align: right;">
        <div style="display: inline-flex; gap: 5px; align-items: center; justify-content: flex-end;">
          ${actionButtons}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderComplaintPagination(filtered.length, pageSize, page);
}

function renderComplaintPagination(totalCount, pageSize, currentPage) {
  const container = document.getElementById('complaint-pagination-btns');
  const countEl = document.getElementById('complaint-records-count');
  if (!container) return;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (currentPage > totalPages) {
    currentPage = totalPages;
    currentFilterState.page = totalPages;
  }

  // Update records count text
  if (countEl) {
    if (totalCount === 0) {
      countEl.innerHTML = '<strong>0</strong> kayıt';
    } else {
      const start = (currentPage - 1) * pageSize + 1;
      const end = Math.min(totalCount, currentPage * pageSize);
      countEl.innerHTML = `<strong>${start} - ${end}</strong> / <span id="complaint-total-count">${totalCount}</span> kayıt`;
    }
  }

  container.innerHTML = '';

  // Prev Button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-secondary btn-sm';
  prevBtn.style.cssText = 'width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;';
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = (currentPage <= 1);
  prevBtn.onclick = () => changeComplaintPage(currentPage - 1);
  container.appendChild(prevBtn);

  // Dynamic Page Number Buttons
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages <= 7 || i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      const pageBtn = document.createElement('button');
      pageBtn.className = (i === currentPage) ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
      pageBtn.style.cssText = `width: 32px; height: 32px; padding: 0; font-weight: ${i === currentPage ? '800' : '600'};`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => changeComplaintPage(i);
      container.appendChild(pageBtn);
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      const dots = document.createElement('span');
      dots.style.cssText = 'padding: 0 4px; color: #94a3b8; font-weight: 700;';
      dots.textContent = '...';
      container.appendChild(dots);
    }
  }

  // Next Button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-secondary btn-sm';
  nextBtn.style.cssText = 'width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;';
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = (currentPage >= totalPages);
  nextBtn.onclick = () => changeComplaintPage(currentPage + 1);
  container.appendChild(nextBtn);
}

function changeComplaintPage(newPage) {
  if (newPage < 1) return;
  currentFilterState.page = newPage;
  applyComplaintFilters();
}

async function deleteAdminComplaint(complaintId) {
  const executeDelete = async () => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Talep başarıyla pasife alındı (silindi).', 'success');
        await loadComplaintsTable();
      } else {
        showToast(data.message || 'Silme işlemi başarısız.', 'error');
      }
    } catch (err) {
      showToast('Silme hatası.', 'error');
    }
  };

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Talebi Sil / Pasife Al',
      text: 'Bu talebi pasife almak istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal'
    }).then((r) => {
      if (r.isConfirmed) executeDelete();
    });
  } else {
    if (confirm('Bu talebi silmek istediğinize emin misiniz?')) executeDelete();
  }
}

function resetComplaintFilters() {
  const scopeSelect = document.getElementById('filter-complaint-scope');
  const vmDeptSelect = document.getElementById('filter-vice-mayor-dept');
  const catSelect = document.getElementById('filter-complaint-category');
  const neighSelect = document.getElementById('filter-complaint-neighborhood');
  const statusSelect = document.getElementById('filter-complaint-status');
  const dateSelect = document.getElementById('filter-complaint-date');
  const sortSelect = document.getElementById('filter-complaint-sort');

  if (scopeSelect) scopeSelect.value = 'ALL';
  if (vmDeptSelect) vmDeptSelect.value = 'ALL';
  if (catSelect) catSelect.value = 'ALL';
  if (neighSelect) neighSelect.value = 'ALL';
  if (statusSelect) statusSelect.value = 'ALL';
  if (dateSelect) dateSelect.value = 'ALL';
  if (sortSelect) sortSelect.value = 'DESC';

  currentFilterState.page = 1;
  applyComplaintFilters();
  showToast('Filtreler sıfırlandı.', 'info');
}

// ============================================================================
// 7. COMPLAINT CREATION (UNIFIED MODAL & PAGE FORM)
// ============================================================================
function openCreateComplaintForm() {
  // 1 & 3. isCreateMode Koruması & CSS ile Hard-Hide
  isCreateMode = true;
  currentViewingComplaintId = null;

  closeModal('modal-complaint-detail');
  const detailCont = document.getElementById('complaint-detail-content');
  if (detailCont) {
    detailCont.innerHTML = '';
    detailCont.classList.add('d-none', 'timeline-hidden');
    detailCont.style.display = 'none';
  }

  // 2. Reset form & AI suggestion container
  const form = document.getElementById('form-new-complaint');
  if (form) form.reset();
  const aiBox = document.getElementById('ai-suggestion-container');
  if (aiBox) {
    aiBox.style.display = 'none';
    aiBox.innerHTML = '';
  }

  openModal('modal-new-complaint');
  if (typeof initLocationPickerMap === 'function') {
    setTimeout(initLocationPickerMap, 100);
  }
}

async function handleNewComplaintSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('form-new-complaint');
  const submitBtn = form?.querySelector('button[type="submit"]');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
  }

  const formData = new FormData(form);

  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` },
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Talebiniz Başarıyla Alındı!',
          html: `
            <div style="text-align: center; margin-top: 10px;">
              <p style="font-size: 0.95rem; color: #475569;">Takip Kodunuz:</p>
              <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 1.3rem; font-weight: 800; color: #0284c7; letter-spacing: 1px; margin: 8px 0;">
                ${data.tracking_code || 'BLD-2026-XXXXXX'}
              </div>
              <p style="font-size: 0.85rem; color: #64748b;">Talebiniz ilgili birime iletilmiş olup süreç SMS/E-posta ile bildirilecektir.</p>
            </div>
          `,
          confirmButtonText: 'Tamam',
          confirmButtonColor: '#0284c7'
        });
      } else {
        showToast(`Talebiniz alındı! Takip Kodu: ${data.tracking_code}`, 'success');
      }

      form.reset();
      closeModal('modal-new-complaint');

      if (currentUser?.role_name === 'Vatandaş') {
        await switchWorkspaceTab('my-complaints');
      } else {
        await switchWorkspaceTab('complaints');
      }
    } else {
      showToast(data.message || 'Talep oluşturulamadı.', 'error');
    }
  } catch (err) {
    showToast('Sunucu bağlantı hatası.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitBtn.dataset.origHtml || 'Talebi Gönder';
    }
  }
}

async function handlePageCreateComplaintSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('page-form-new-complaint');
  const submitBtn = document.getElementById('btn-page-submit-complaint');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
  }

  const formData = new FormData(form);

  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` },
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Talebiniz Başarıyla Alındı!',
          html: `
            <div style="text-align: center; margin-top: 10px;">
              <p style="font-size: 0.95rem; color: #475569;">Takip Kodunuz:</p>
              <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 1.3rem; font-weight: 800; color: #0284c7; letter-spacing: 1px; margin: 8px 0;">
                ${data.tracking_code || 'BLD-2026-XXXXXX'}
              </div>
              <p style="font-size: 0.85rem; color: #64748b;">Talebiniz ilgili birime iletilmiş olup süreç SMS/E-posta ile bildirilecektir.</p>
            </div>
          `,
          confirmButtonText: 'Tamam',
          confirmButtonColor: '#0284c7'
        });
      }

      form.reset();
      if (currentUser?.role_name === 'Vatandaş') {
        await switchWorkspaceTab('my-complaints');
      } else {
        await switchWorkspaceTab('complaints');
      }
    } else {
      showToast(data.message || 'Talep oluşturulamadı.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitBtn.dataset.origHtml || 'Talebi Gönder';
    }
  }
}

// ============================================================================
// 8. COMPLAINT DETAIL MODAL & MANAGER / STAFF ACTIONS
// ============================================================================
async function openComplaintDetail(trackingCode) {
  // Görüntüleme moduna geç, oluşturma modunu kapat
  isCreateMode = false;

  const container = document.getElementById('complaint-detail-content');
  if (!container) return;

  container.classList.remove('d-none', 'timeline-hidden');
  container.style.display = 'block';

  // 1. DOM/State Temizliği (Reset) - Önceki talepten kalan tüm içerik ve logları derhal temizle
  container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Detaylar ve süreç geçmişi yükleniyor...</p></div>';
  openModal('modal-complaint-detail');

  try {
    const res = await fetch(`/api/complaints/${encodeURIComponent(trackingCode)}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (isCreateMode) {
      // Eğer kullanıcı bu istek sürerken oluşturma moduna geçtiyse DOM'u kirletme
      container.innerHTML = '';
      container.classList.add('d-none', 'timeline-hidden');
      return;
    }

    if (data.success && data.complaint) {
      const c = data.complaint;
      const cId = Number(c.id);
      currentViewingComplaintId = cId;

      // 3. Doğru ID ile İzolasyon - Sadece ve sadece bu talebe ait logları filtrele
      const actions = (data.actions || []).filter(a => Number(a.complaint_id) === cId);
      const files = (data.files || []).filter(f => Number(f.complaint_id) === cId);
      const rawHistory = (data.history || []).filter(h => Number(h.complaint_id) === cId);

      const isMayor = currentUser && (currentUser.role_name === 'Belediye Başkanı' || currentUser.role_id === 5);
      const isManagerOrAdmin = currentUser && (currentUser.role_name === 'Birim Yöneticisi' || currentUser.role_name === 'Sistem Yöneticisi');
      const isStaff = currentUser && (currentUser.role_name === 'Personel' || currentUser.role_id === 3);

      // 1. Manager Action Form (Hidden for Mayor - 100% Read-Only)
      let managerControlsHtml = '';
      if (isManagerOrAdmin) {
        managerControlsHtml = `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-top: 16px;">
            <input type="hidden" id="current-detail-complaint-id" value="${c.id}" />
            <h5 style="color: var(--portal-blue-primary); margin-bottom: 10px; font-size: 0.9rem; font-weight: 700;">
              <i class="fas fa-sliders" style="color: #2563eb; margin-right: 6px;"></i> Yönetici İşlemleri (Öncelik & Durum)
            </h5>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 4px; display: block;">Öncelik / Aciliyet Seviyesi</label>
                <select id="detail-edit-priority" class="form-input" style="height: 40px; padding: 4px 10px; font-size: 0.88rem; font-weight: 600; border-radius: 6px;">
                  <option value="Acil" ${(c.priority_level === 'Acil' || c.priority_level === 'Kritik' || c.priority_level === 'Yüksek') ? 'selected' : ''}>🔴 Acil</option>
                  <option value="Normal" ${(c.priority_level === 'Normal' || !c.priority_level) ? 'selected' : ''}>🟡 Normal</option>
                  <option value="Düşük" ${c.priority_level === 'Düşük' ? 'selected' : ''}>⚫ Düşük</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 4px; display: block;">Talep Durumu</label>
                <select id="detail-edit-status" class="form-input" style="height: 40px; padding: 4px 10px; font-size: 0.88rem; font-weight: 600; border-radius: 6px;">
                  <option value="Yeni" ${c.status === 'Yeni' ? 'selected' : ''}>Yeni</option>
                  <option value="İlgili birime yönlendirildi" ${c.status === 'İlgili birime yönlendirildi' ? 'selected' : ''}>İlgili birime yönlendirildi</option>
                  <option value="Personele atandı" ${c.status === 'Personele atandı' ? 'selected' : ''}>Personele atandı</option>
                  <option value="İşlem devam ediyor" ${c.status === 'İşlem devam ediyor' ? 'selected' : ''}>İşlem devam ediyor</option>
                  <option value="Çözüldü" ${c.status === 'Çözüldü' ? 'selected' : ''}>Çözüldü</option>
                  <option value="İptal edildi" ${c.status === 'İptal edildi' ? 'selected' : ''}>İptal edildi</option>
                </select>
              </div>
            </div>
            
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button id="btn-save-admin-complaint" class="btn btn-primary btn-sm" onclick="saveAdminComplaintUpdate(${c.id})" style="flex: 2; font-weight: 700; padding: 8px;">
                <i class="fas fa-save" style="margin-right: 4px;"></i> Değişiklikleri Kaydet
              </button>
              <button class="btn btn-secondary btn-sm" onclick="openAssignModal(${c.id}, ${c.department_id || 1})" style="flex: 1; font-weight: 600; padding: 8px;">
                <i class="fas fa-user-plus"></i> Görev Ata
              </button>
              <button class="btn btn-secondary btn-sm" onclick="openForwardDeptModal(${c.id})" style="flex: 1; font-weight: 600; padding: 8px;">
                <i class="fas fa-right-left"></i> Sevk Et
              </button>
            </div>
          </div>
        `;
      }

      // 2. Staff Action Button (Personele işlem butonu)
      let staffControlsHtml = '';
      if (isStaff && c.status !== 'Çözüldü') {
        staffControlsHtml = `
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #065f46; font-size: 0.9rem;"><i class="fas fa-screwdriver-wrench"></i> Saha Görevlisi İşlemi</strong>
                <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #047857;">Bu talebi çözüldü veya işlemde olarak kaydedebilirsiniz.</p>
              </div>
              <button class="btn btn-primary btn-sm" onclick="openActionModal(${c.id})" style="background: #059669; border-color: #047857; font-weight: 700;">
                <i class="fas fa-check-circle"></i> İşlem / Çözüm Kaydet
              </button>
            </div>
          </div>
        `;
      }

      // 3. Green Official Solution Card (Resmi Çözüm Açıklaması Kartı - Çözüldü Durumunda)
      let officialSolutionCardHtml = '';
      if (c.status === 'Çözüldü') {
        const lastAction = (actions && actions.length > 0) ? actions[actions.length - 1] : null;
        const resolverName = lastAction?.employee_name || 'Belediye Saha Ekibi';
        const resolverTitle = lastAction?.employee_title || 'Saha Personeli';
        const solutionNote = lastAction?.action_description || lastAction?.work_done || 'Talep edilen bölgede saha ekiplerimiz tarafından gerekli müdahale ve onarım yapılmış olup talep çözüme kavuşturulmuştur.';
        const toolsNote = lastAction?.tools_equipment_used ? `<div><i class="fas fa-wrench" style="margin-right:4px;"></i> <strong>Ekipman / Not:</strong> ${lastAction.tools_equipment_used}</div>` : '';
        const photoPath = lastAction?.resolution_photo_path || lastAction?.photo_path || null;

        officialSolutionCardHtml = `
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 16px; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(22, 163, 74, 0.08);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-circle-check" style="color: #16a34a; font-size: 1.2rem;"></i>
                <div>
                  <strong style="color: #166534; font-size: 0.95rem; font-weight: 800; display: block;">Bulancak Belediyesi</strong>
                  <span style="color: #15803d; font-size: 0.8rem; font-weight: 700;">Resmi Çözüm Açıklaması</span>
                </div>
              </div>
              <span class="badge" style="background: #16a34a; color: #ffffff; font-weight: 700; font-size: 0.75rem; padding: 3px 8px; border-radius: 6px;">Çözüldü</span>
            </div>
            
            <p style="margin: 8px 0; font-size: 0.88rem; color: #14532d; line-height: 1.5; font-weight: 600;">
              ${solutionNote}
            </p>

            <div style="font-size: 0.8rem; color: #15803d; border-top: 1px dashed #bbf7d0; padding-top: 8px; margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
              <div><i class="fas fa-user-gear" style="margin-right:4px;"></i> <strong>Yanıtlayan Yetkili:</strong> ${resolverName} (${resolverTitle})</div>
              ${toolsNote}
            </div>

            ${photoPath ? `
              <div style="margin-top: 10px;">
                <img src="/${photoPath}" alt="Çözüm Fotoğrafı" style="max-height: 120px; border-radius: 8px; border: 1px solid #86efac; cursor: pointer;" onclick="window.open(this.src)">
              </div>
            ` : ''}
          </div>
        `;
      }

      // 4. Process History Timeline (Strictly scoped to this specific complaint)
      const compCreatedTime = new Date(c.created_at).getTime();
      const creatorName = c.citizen_name || c.user_name || 'Vatandaş';

      const validRawHistory = rawHistory.filter(h => {
        const hTime = new Date(h.created_at).getTime();
        return isNaN(hTime) || isNaN(compCreatedTime) || hTime >= compCreatedTime - 10000;
      });

      const historyList = validRawHistory.map(h => {
        const isInitial = h.old_status === 'Yok' || h.new_status === 'Yeni' || (!h.old_status && !h.new_status);
        let desc = h.change_reason;
        if (!desc || desc === 'undefined' || desc.includes('undefined')) {
          if (h.new_status && h.new_status !== 'Yeni') {
            desc = `Talep durumu "${h.new_status}" olarak güncellendi.`;
          } else {
            desc = 'Talep kaydı başarıyla oluşturuldu.';
          }
        }
        return {
          user_name: isInitial ? (h.changed_by_name || creatorName) : (h.changed_by_name || 'Belediye Yetkilisi'),
          created_at: h.created_at,
          action_type: (h.new_status === 'Yeni' || isInitial) ? 'Talep Oluşturuldu' : (h.new_status || 'Durum Güncellemesi'),
          description: desc,
          photo_path: null
        };
      });

      const actionList = actions.map(a => ({
        user_name: a.employee_name || 'Saha Görevlisi',
        created_at: a.created_at,
        action_type: a.action_type || a.new_status || 'İşlem / Müdahale',
        description: a.action_description || a.work_done || a.description || 'Müdahale yapıldı.',
        photo_path: a.resolution_photo_path || a.photo_path || null
      }));

      const combinedTimeline = [...historyList, ...actionList];
      combinedTimeline.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const uniqueTimeline = [];
      combinedTimeline.forEach(item => {
        const isDup = uniqueTimeline.some(u => 
          u.action_type === item.action_type &&
          u.description === item.description &&
          Math.abs(new Date(u.created_at) - new Date(item.created_at)) < 30000
        );
        if (!isDup) uniqueTimeline.push(item);
      });

      // If brand new with no logs yet, show single initial record
      if (uniqueTimeline.length === 0) {
        uniqueTimeline.push({
          user_name: c.user_name || 'Vatandaş',
          created_at: c.created_at || new Date().toISOString(),
          action_type: 'Talep Oluşturuldu',
          description: 'Talep kaydı başarıyla oluşturuldu.',
          photo_path: null
        });
      }

      let timelineHtml = uniqueTimeline.map((a, idx) => {
        const isResolved = (a.action_type || '').includes('Çözüldü') || (a.action_type || '').includes('cozuldu');
        const dotColor = isResolved ? '#16a34a' : ((idx === 0) ? '#3b82f6' : '#f59e0b');
        const dateStr = a.created_at ? new Date(a.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

        return `
          <div class="timeline-item" style="padding: 0 0 16px 0; border-left: 2px solid #e2e8f0; padding-left: 18px; margin-left: 8px; position: relative;">
            <div style="position: absolute; left: -7px; top: 3px; width: 12px; height: 12px; border-radius: 50%; background: #ffffff; border: 3px solid ${dotColor};"></div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <i class="fas fa-chevron-right" style="color: #f59e0b; font-size: 0.72rem;"></i>
              <strong style="color: #0f172a; font-size: 0.88rem; font-weight: 800;">${a.action_type || 'Durum Değişikliği'}</strong>
            </div>
            <div style="font-size: 0.76rem; color: #64748b; margin-bottom: 6px; padding-left: 14px;">
              <i class="fas fa-clock" style="margin-right: 3px; font-size: 0.72rem;"></i> ${dateStr}
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-top: 4px; margin-left: 2px;">
              <div style="font-weight: 700; color: var(--portal-blue-primary); font-size: 0.84rem; margin-bottom: 2px;">
                ${a.user_name || 'Belediye Yetkilisi'}
              </div>
              <p style="margin: 0; font-size: 0.83rem; color: #334155; line-height: 1.45;">
                ${a.description || 'İşlem kaydedildi.'}
              </p>
              ${a.photo_path ? `<img src="/${a.photo_path}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px; margin-top: 6px; cursor: pointer; border: 1px solid #cbd5e1;" onclick="window.open(this.src)">` : ''}
            </div>
          </div>
        `;
      }).join('');

      // 5. Star Rating Survey Module (If Resolved)
      let surveyHtml = '';
      if (c.status === 'Çözüldü') {
        const ratingVal = (c.avg_rating !== null && c.avg_rating !== undefined) ? parseFloat(c.avg_rating) : (c.rating ? parseFloat(c.rating) : null);
        const ratingCount = Number(c.rating_vote_count || c.rating_count || 0);
        const hasRating = ratingVal !== null && !isNaN(ratingVal) && ratingCount > 0;

        const ratingBadgeHtml = hasRating
          ? `<span class="badge" style="background:#fef9c3; color:#854d0e; border:1px solid #fef08a; font-weight:800; font-size:0.82rem;">
               ★ ${ratingVal.toFixed(1)} / 5.0 (${ratingCount} Değerlendirme)
             </span>`
          : `<span class="badge" style="background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; font-weight:600; font-size:0.8rem;">
               Henüz Değerlendirilmedi
             </span>`;

        surveyHtml = `
          <div style="background: linear-gradient(135deg, #fefce8 0%, #eff6ff 100%); border: 1px solid #fde047; border-radius: 12px; padding: 16px; margin-top: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong style="color: #854d0e; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-award" style="color: #eab308; font-size: 1.1rem;"></i> Vatandaş Memnuniyet Değerlendirmesi
              </strong>
              ${ratingBadgeHtml}
            </div>
            ${currentUser && currentUser.role_name === 'Vatandaş' ? `
              <div style="display: flex; justify-content: center; gap: 12px; font-size: 2rem; color: #facc15; cursor: pointer; margin: 8px 0; text-shadow: 0 1px 3px rgba(0,0,0,0.1);" id="star-rating-box">
                <span onclick="setStarRating(1)" id="star-1" title="1 Yıldız - Yetersiz">★</span>
                <span onclick="setStarRating(2)" id="star-2" title="2 Yıldız - Geliştirilmeli">★</span>
                <span onclick="setStarRating(3)" id="star-3" title="3 Yıldız - Orta">★</span>
                <span onclick="setStarRating(4)" id="star-4" title="4 Yıldız - İyi">★</span>
                <span onclick="setStarRating(5)" id="star-5" title="5 Yıldız - Mükemmel">★</span>
              </div>
              <textarea id="survey-comment" class="form-input" rows="2" placeholder="Hizmet kalitesi, hız ve personel nezaketi hakkındaki görüşleriniz..." style="margin-top: 6px; font-size: 0.84rem; background: #ffffff; border-color: #cbd5e1;"></textarea>
              <button class="btn btn-primary btn-sm" onclick="submitSatisfactionSurvey(${c.id})" style="margin-top: 10px; width: 100%; font-weight: 700; background: #0284c7; padding: 8px;">
                <i class="fas fa-paper-plane"></i> Değerlendirmeyi Kaydet
              </button>
            ` : `<p style="font-size: 0.82rem; color: #64748b; margin: 0; line-height: 1.45;">${hasRating ? `Bu talep için ${ratingCount} adet vatandaş memnuniyet değerlendirmesi yapılmıştır.` : 'Bu talep çözüme kavuşturulmuş olup henüz vatandaş değerlendirmesi yapılmamıştır.'}</p>`}
          </div>
        `;
      }

      // Photos
      let filesHtml = (files && files.length > 0) ? files.map(f => `
        <img src="/${f.file_path}" alt="Talep Görseli" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open(this.src)" />
      `).join('') : '';

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 24px;">
          <!-- Left Column -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h2 style="color: var(--portal-blue-primary); font-size: 1.35rem; font-weight: 800; margin: 0;">${c.tracking_code}</h2>
              <div style="display: flex; gap: 6px;">
                ${getPriorityBadge(c.priority_level || c.urgency_level)}
                <span class="badge ${getBadgeClass(c.status)}">${c.status || 'Yeni'}</span>
              </div>
            </div>

            <h3 style="font-size: 1.15rem; color: #0f172a; margin-bottom: 12px; font-weight: 800; line-height: 1.4;">${c.title}</h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.84rem; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
              <div><span style="color:#64748b;">Müdürlük:</span> <strong>${c.department_name || 'Fen İşleri'}</strong></div>
              <div><span style="color:#64748b;">Kategori:</span> <strong>${c.category_name || 'Genel'}</strong></div>
              <div><span style="color:#64748b;">Mahalle:</span> <strong>${c.neighborhood_name || 'Bulancak'}</strong></div>
              <div><span style="color:#64748b;">Tarih:</span> <strong>${new Date(c.created_at).toLocaleDateString('tr-TR')}</strong></div>
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: #475569;">Talep Açıklaması</label>
              <p style="font-size: 0.88rem; color: #334155; line-height: 1.55; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 4px;">${c.description}</p>
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: #475569;">📍 Nokta Atışı Konum & Adres Bilgisi</label>
              <p style="font-size: 0.85rem; color: #0f172a; margin: 4px 0;">${c.open_address || c.neighborhood_name || 'Bulancak'}</p>
              ${c.latitude && c.longitude ? `
                <a href="https://maps.google.com/?q=${c.latitude},${c.longitude}" target="_blank" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; text-decoration: none; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;">
                  <i class="fas fa-map-marked-alt" style="color: #0284c7;"></i> Haritada Göster / Yol Tarifi (${c.latitude}, ${c.longitude})
                </a>
              ` : ''}
            </div>

            ${filesHtml ? `
              <div style="margin-top: 12px;">
                <label style="font-size: 0.8rem; font-weight: 700; color: #475569;">Ekler / Fotoğraflar</label>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">${filesHtml}</div>
              </div>
            ` : ''}

            ${managerControlsHtml}
            ${staffControlsHtml}
          </div>

          <!-- Right Column: Official Solution Box & Timeline & Survey -->
          <div style="background: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column;">
            ${officialSolutionCardHtml}

            <h4 style="color: var(--portal-blue-primary); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
              <i class="fas fa-timeline" style="color: #0284c7; margin-right: 6px;"></i> Süreç Geçmişi
            </h4>

            <div style="max-height: 420px; overflow-y: auto; padding: 4px 6px 12px 14px;">
              ${timelineHtml || '<p style="color:#94a3b8; font-size:0.82rem; padding: 10px 0;">Henüz süreç kaydı eklenmedi.</p>'}
            </div>

            ${surveyHtml}
          </div>
        </div>
      `;

      if (c.status === 'Çözüldü') {
        setTimeout(() => setStarRating(5), 50);
      }
    } else {
      container.innerHTML = '<p style="color: #ef4444; padding: 20px; text-align: center;">Talep detayları bulunamadı.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p style="color: #ef4444; padding: 20px; text-align: center;">Detay yüklenirken sunucu hatası oluştu.</p>';
  }
}

// ============================================================================
// 8.1. PUBLIC FEED & UPVOTE (TITREME VE YENILENME ENGELLEME)
// ============================================================================
async function loadPublicComplaintsFeed() {
  const container = document.getElementById('public-feed-container');
  if (!container) return;

  container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Kamuya açık talepler yükleniyor...</p></div>';

  try {
    const res = await fetch('/api/complaints/public-feed', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && Array.isArray(data.complaints)) {
      // Çözülmüş veya İptal edilmiş talepleri kamuya açık akıştan kesin olarak ayıkla
      const activeFeed = data.complaints.filter(c => c.status !== 'Çözüldü' && c.status !== 'İptal edildi');

      if (activeFeed.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 40px;"><i class="fas fa-folder-open fa-2x" style="margin-bottom:8px; display:block;"></i>Henüz kamuya açık aktif talep bulunmuyor.</div>';
        return;
      }

      container.innerHTML = activeFeed.map(c => {
        const upvotes = (c.upvotes_count !== undefined && c.upvotes_count !== null && c.upvotes_count !== '') ? Number(c.upvotes_count) : Number(c.upvote_count || c.base_upvote_count || 0);
        const isUpvoted = Boolean(c.is_upvoted);
        const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '-';
        const ratingVal = (c.avg_rating !== null && c.avg_rating !== undefined && Number(c.rating_count || c.rating_vote_count || 0) > 0) ? parseFloat(c.avg_rating) : null;
        const ratingCount = Number(c.rating_count || c.rating_vote_count || 0);

        const ratingBadgeHtml = (ratingVal !== null && ratingCount > 0) ? `
          <span class="badge" style="background:#fef9c3; color:#854d0e; border:1px solid #fef08a; font-weight:700; font-size:0.75rem; padding: 2px 6px;">
            <i class="fas fa-star" style="color:#eab308; margin-right: 2px;"></i> ★ ${ratingVal.toFixed(1)} (${ratingCount} Oy)
          </span>
        ` : '';

        const upvoteButtonHtml = isUpvoted ? `
          <button type="button" id="btn-upvote-${c.id}" class="btn btn-sm btn-upvote active" 
            data-id="${c.id}" 
            onclick="handleUpvote(event, ${c.id})" 
            style="background: #059669; border: 1px solid #059669; color: #ffffff; font-size: 0.82rem; font-weight: 700; padding: 6px 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;">
            <i class="fas fa-check"></i> Destek Verildi ( <span class="upvote-count">${upvotes}</span> )
          </button>
        ` : `
          <button type="button" id="btn-upvote-${c.id}" class="btn btn-sm btn-upvote" 
            data-id="${c.id}" 
            onclick="handleUpvote(event, ${c.id})" 
            style="background: #1e40af; border: 1px solid #1e40af; color: #ffffff; font-size: 0.82rem; font-weight: 700; padding: 6px 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;">
            <i class="fas fa-thumbs-up"></i> Destek Ol ( <span class="upvote-count">${upvotes}</span> )
          </button>
        `;

        return `
          <div class="card-box" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 18px 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.04); min-height: 220px; transition: transform 0.2s, box-shadow 0.2s;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span class="badge ${getBadgeClass(c.status)}">${c.status || 'Yeni'}</span>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
                  <span style="font-size: 0.8rem; font-weight: 700; color: #334155; display: inline-flex; align-items: center; gap: 4px;">
                    <i class="fas fa-location-dot" style="color: #ef4444; font-size: 0.76rem;"></i> ${c.neighborhood_name || 'Bulancak'}
                  </span>
                  ${ratingBadgeHtml}
                </div>
              </div>

              <h4 style="color: #0f172a; font-weight: 800; font-size: 0.96rem; margin: 10px 0 6px 0; line-height: 1.35;">${c.title}</h4>
              <p style="color: #64748b; font-size: 0.84rem; line-height: 1.45; margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${c.description}
              </p>

              <div style="font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 6px; margin-bottom: 14px;">
                <span class="badge" style="background: #f1f5f9; color: #475569; font-weight: 600; font-size: 0.75rem;">${c.category_name || 'Genel'}</span>
                <span style="font-size: 0.78rem; color: #94a3b8;"><i class="fas fa-calendar" style="margin-right: 3px;"></i> ${dateStr}</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid #f1f5f9;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="openComplaintDetail('${c.tracking_code || c.id}')" style="background: #f8fafc; border: 1px solid #e2e8f0; color: #334155; font-size: 0.82rem; font-weight: 600; padding: 6px 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
                <i class="fas fa-eye" style="color: #64748b; font-size: 0.75rem;"></i> İncele →
              </button>

              ${upvoteButtonHtml}
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 30px;">Talepler yüklenemedi.</div>';
    }
  } catch (err) {
    container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 30px;">Sunucu bağlantı hatası.</div>';
  }
}

async function handleUpvote(e, complaintId) {
  // 1. Sayfa Yenilenmesini, Header Titremesini ve Sayfa Kaymasını Tamamen Engelle
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }

  const btn = e?.currentTarget || document.getElementById(`btn-upvote-${complaintId}`) || document.querySelector(`.btn-upvote[data-id="${complaintId}"]`);
  if (btn) btn.disabled = true;

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
      // 2. Lokal DOM Güncellemesi: SADECE tıklanan butonun içeriğini ve sayacını güncelle (Sayfayı baştan render ETME)
      if (btn) {
        const count = (data.upvotes_count !== undefined && data.upvotes_count !== null) ? Number(data.upvotes_count) : Number(data.upvote_count || 0);

        if (data.is_upvoted) {
          btn.classList.add('active');
          btn.style.background = '#059669';
          btn.style.borderColor = '#059669';
          btn.style.color = '#ffffff';
          btn.innerHTML = `<i class="fas fa-check"></i> Destek Verildi ( <span class="upvote-count">${count}</span> )`;
        } else {
          btn.classList.remove('active');
          btn.style.background = '#1e40af';
          btn.style.borderColor = '#1e40af';
          btn.style.color = '#ffffff';
          btn.innerHTML = `<i class="fas fa-thumbs-up"></i> Destek Ol ( <span class="upvote-count">${count}</span> )`;
        }
      }

      showToast(data.message || (data.is_upvoted ? '👍 Desteğiniz kaydedildi!' : 'Desteğinizi geri çektiniz.'), 'success');
    } else {
      showToast(data.message || 'Destek işlemi gerçekleştirilemedi.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
  return false;
}

// ============================================================================
// 8.2. SOLUTION ARCHIVE (ÇÖZÜM ARŞİVİ GÖRÜNÜMÜ & KART RENDER)
// ============================================================================
let archiveComplaintsList = [];

async function renderArchiveView() {
  const container = document.getElementById('archive-cards-container') || document.getElementById('solution-archive-container');
  if (!container) return;

  // Prevent duplicate render by strictly clearing the container first
  container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Çözüm arşivi yükleniyor...</p></div>';

  try {
    const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};
    const res = await fetch('/api/complaints/archive', { headers });
    const data = await res.json();

    if (data.success && Array.isArray(data.complaints)) {
      archiveComplaintsList = data.complaints;
      populateArchiveDropdowns();
      applyArchiveFilters();
    } else {
      container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 30px;">Arşiv verileri yüklenemedi.</div>';
    }
  } catch (err) {
    console.error('Archive view load error:', err);
    container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 30px;">Sunucu bağlantı hatası.</div>';
  }
}

// Backward compatibility alias
const loadSolutionArchive = renderArchiveView;

function populateArchiveDropdowns() {
  const catSelect = document.getElementById('filter-archive-category');
  const neighSelect = document.getElementById('filter-archive-neighborhood');

  if (catSelect && catSelect.options.length <= 1 && categoriesList.length > 0) {
    catSelect.innerHTML = '<option value="ALL" selected>📂 Tüm Kategoriler</option>' +
      categoriesList.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  if (neighSelect && neighSelect.options.length <= 1 && neighborhoodsList.length > 0) {
    neighSelect.innerHTML = '<option value="ALL" selected>📍 Tüm Mahalleler</option>' +
      neighborhoodsList.map(n => `<option value="${n.name}">${n.name}</option>`).join('');
  }
}

function applyArchiveFilters() {
  const container = document.getElementById('archive-cards-container') || document.getElementById('solution-archive-container');
  if (!container) return;

  const searchVal = (document.getElementById('filter-archive-search')?.value || '').toLowerCase().trim();
  const catVal = document.getElementById('filter-archive-category')?.value || 'ALL';
  const neighVal = document.getElementById('filter-archive-neighborhood')?.value || 'ALL';
  const dateVal = document.getElementById('filter-archive-date')?.value || 'ALL';

  const now = new Date();
  const filtered = (archiveComplaintsList || []).filter(c => {
    // 1. Text Search (Başlık, Açık Adres, Mahalle, Takip Kodu)
    if (searchVal) {
      const title = (c.title || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const addr = (c.open_address || '').toLowerCase();
      const neigh = (c.neighborhood_name || '').toLowerCase();
      const code = (c.tracking_code || '').toLowerCase();

      if (!title.includes(searchVal) && !desc.includes(searchVal) && !addr.includes(searchVal) && !neigh.includes(searchVal) && !code.includes(searchVal)) {
        return false;
      }
    }

    // 2. Category Filter
    if (catVal !== 'ALL' && c.category_name !== catVal) {
      return false;
    }

    // 3. Neighborhood Filter
    if (neighVal !== 'ALL' && c.neighborhood_name !== neighVal) {
      return false;
    }

    // 4. Date Filter
    if (dateVal !== 'ALL' && c.created_at) {
      const cDate = new Date(c.created_at);
      if (dateVal === 'THIS_MONTH') {
        if (cDate.getFullYear() !== now.getFullYear() || cDate.getMonth() !== now.getMonth()) return false;
      } else if (dateVal === 'LAST_MONTH') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (cDate.getFullYear() !== lastMonth.getFullYear() || cDate.getMonth() !== lastMonth.getMonth()) return false;
      } else if (dateVal === 'THIS_YEAR') {
        if (cDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  // Strict clear before rendering to prevent double records
  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 40px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <i class="fas fa-box-open fa-2x" style="margin-bottom:8px; display:block; opacity: 0.5;"></i>
        Filtreleme kriterlerine uygun çözülmüş talep kaydı bulunamadı.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(c => {
    const upvotes = (c.upvotes_count !== undefined && c.upvotes_count !== null && c.upvotes_count !== '') ? Number(c.upvotes_count) : Number(c.upvote_count || 0);
    const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '-';
    const ratingVal = (c.avg_rating !== null && c.avg_rating !== undefined && Number(c.rating_count || c.rating_vote_count || 0) > 0) ? parseFloat(c.avg_rating) : null;
    const ratingCount = Number(c.rating_count || c.rating_vote_count || 0);
    const locationDisplay = c.open_address || c.neighborhood_name || 'Bulancak';

    const ratingBoxHtml = (ratingVal !== null && ratingCount > 0) ? `
      <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 6px 10px; margin: 8px 0 12px 0; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.8rem; font-weight: 800; color: #854d0e; display: inline-flex; align-items: center; gap: 4px;">
          <i class="fas fa-star" style="color: #eab308;"></i> ⭐ ${ratingVal.toFixed(1)} / 5.0 (${ratingCount} Oy)
        </span>
        <span style="font-size: 0.75rem; color: #a16207; font-weight: 600;">
          <i class="fas fa-calendar" style="margin-right: 2px;"></i> ${dateStr}
        </span>
      </div>
    ` : `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; margin: 8px 0 12px 0; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.78rem; font-weight: 600; color: #94a3b8; display: inline-flex; align-items: center; gap: 4px;">
          <i class="far fa-star"></i> Henüz Puanlanmadı
        </span>
        <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">
          <i class="fas fa-calendar" style="margin-right: 2px;"></i> ${dateStr}
        </span>
      </div>
    `;

    return `
      <div class="card-box" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 18px 20px; border-radius: 12px; border: 1px solid #86efac; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.04); min-height: 230px; transition: transform 0.2s, box-shadow 0.2s;">
        <div>
          <!-- Top: Category, Status & Location/Address -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px;">
              <span class="badge" style="background: #dcfce7; color: #15803d; font-weight: 700; font-size: 0.75rem;">
                <i class="fas fa-check-circle" style="margin-right: 3px;"></i> Çözüldü
              </span>
              <span class="badge" style="background: #f1f5f9; color: #475569; font-weight: 600; font-size: 0.74rem;">
                ${c.category_name || 'Genel'}
              </span>
            </div>
            
            <div style="text-align: right; font-size: 0.78rem; font-weight: 700; color: #334155; display: inline-flex; align-items: center; gap: 4px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${locationDisplay}">
              <i class="fas fa-location-dot" style="color: #ef4444; font-size: 0.76rem;"></i> ${c.neighborhood_name || 'Bulancak'}
            </div>
          </div>

          <!-- Title -->
          <h4 style="color: #0f172a; font-weight: 800; font-size: 0.96rem; margin: 8px 0 6px 0; line-height: 1.35;">
            ${c.title}
          </h4>

          <!-- Address snippet -->
          <p style="color: #64748b; font-size: 0.8rem; margin: 0 0 8px 0; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <i class="fas fa-map-pin" style="color: #94a3b8; font-size: 0.75rem; margin-right: 4px;"></i> ${c.open_address || c.neighborhood_name || 'Bulancak, Giresun'}
          </p>

          <!-- Inside / Content: Average Rating & Vote Count Badge -->
          ${ratingBoxHtml}
        </div>

        <!-- Bottom: İncele Button & Support count -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid #f1f5f9;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="openComplaintDetail('${c.tracking_code || c.id}')" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; font-size: 0.82rem; font-weight: 700; padding: 6px 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
            <i class="fas fa-eye" style="color: #64748b; font-size: 0.75rem;"></i> İncele →
          </button>

          <span style="font-size: 0.78rem; color: #059669; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fas fa-thumbs-up"></i> ${upvotes} Destek
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// REAL-TIME MULTI-VIEW REFRESHER (Sayfayı F5 Yapmadan Harita, Tablo ve Arşivi Canlı Günceller)
// ============================================================================
async function refreshAllApplicationViews() {
  const currentTab = location.hash.replace('#', '') || 'dashboard';

  // 1. Dashboard istatistiklerini arka planda tazele
  loadDashboardData();

  // 2. Harita Analizi sekmesi veya Leaflet haritası varsa anında F5'siz yeniden çiz
  const mapSec = document.getElementById('sec-map');
  if (mapSec && (mapSec.style.display !== 'none' || currentTab === 'map' || rawMapComplaints.length > 0)) {
    await loadMapData();
  }

  // 3. Şikayet ve Talep Tablosunu canlı tazele
  const compSec = document.getElementById('sec-complaints');
  if (compSec && (compSec.style.display !== 'none' || currentTab === 'complaints' || currentTab === 'my-complaints')) {
    await loadComplaintsTable(currentTab === 'my-complaints');
  }

  // 4. Çözüm Arşivini canlı tazele
  const archSec = document.getElementById('archive-view') || document.getElementById('sec-solution-archive');
  if (archSec && (archSec.style.display !== 'none' || currentTab === 'archive' || currentTab === 'solution-archive')) {
    await renderArchiveView();
  }

  // 5. Kamuya Açık Akışı canlı tazele
  const feedSec = document.getElementById('sec-public-feed');
  if (feedSec && (feedSec.style.display !== 'none' || currentTab === 'public-feed')) {
    await loadPublicComplaintsFeed();
  }
}

async function saveAdminComplaintUpdate(complaintId) {
  // 1 & 2. isCreateMode Koruması: Yeni talep oluşturma modundaysak işlem yapma
  if (isCreateMode) return;

  const targetId = complaintId || currentViewingComplaintId || document.getElementById('current-detail-complaint-id')?.value;
  if (!targetId || targetId === 'null' || targetId === 'undefined') {
    showToast('Güncellenecek talep ID bulunamadı.', 'error');
    return;
  }

  const priority = document.getElementById('detail-edit-priority')?.value;
  const status = document.getElementById('detail-edit-status')?.value;

  try {
    const res = await fetch(`/api/complaints/${targetId}/status-priority`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ complaint_id: targetId, id: targetId, priority_level: priority, status: status })
    });

    const data = await res.json();
    if (data.success) {
      showToast('✅ Talep durumu ve öncelik seviyesi güncellendi!', 'success');
      closeModal('modal-complaint-detail');
      await refreshAllApplicationViews();
    } else {
      showToast(data.message || 'Güncelleme hatası.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

function openForwardDeptModal(complaintId) {
  const fIdInput = document.getElementById('forward-complaint-id');
  const targetSelect = document.getElementById('forward-target-dept');
  const reasonInput = document.getElementById('forward-reason');

  if (fIdInput) fIdInput.value = complaintId;
  if (reasonInput) reasonInput.value = '';

  if (targetSelect) {
    targetSelect.innerHTML = '<option value="">-- Hedef Müdürlük Seçiniz --</option>' +
      departmentsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  openModal('modal-forward-dept');
}

async function handleForwardDeptSubmit(e) {
  e.preventDefault();
  const complaintId = document.getElementById('forward-complaint-id')?.value;
  const targetDeptId = document.getElementById('forward-target-dept')?.value;
  const reason = document.getElementById('forward-reason')?.value;

  if (!targetDeptId) {
    showToast('Lütfen hedef müdürlük seçiniz.', 'warning');
    return;
  }

  try {
    const res = await fetch(`/api/complaints/${complaintId}/forward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ target_department_id: targetDeptId, reason: reason })
    });

    const data = await res.json();
    if (data.success) {
      showToast('🔄 Talep başarıyla yeni müdürlüğe sevk edildi!', 'success');
      closeModal('modal-forward-dept');
      closeModal('modal-complaint-detail');
      await refreshAllApplicationViews();
    } else {
      showToast(data.message || 'Yönlendirme başarısız.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

function openAssignModal(complaintId, deptId) {
  const cIdInput = document.getElementById('assign-complaint-id');
  const empSelect = document.getElementById('assign-employee-select');
  if (cIdInput) cIdInput.value = complaintId;

  if (empSelect) {
    empSelect.innerHTML = '<option value="">Personeller yükleniyor...</option>';
    fetch(`/api/assignments/department-employees/${deptId || 1}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.employees && data.employees.length > 0) {
          empSelect.innerHTML = '<option value="">-- Saha Personeli Seçiniz --</option>' +
            data.employees.map(emp => `<option value="${emp.id || emp.user_id}">${emp.full_name} (${emp.title || 'Saha Görevlisi'})</option>`).join('');
        } else {
          empSelect.innerHTML = '<option value="">Kayıtlı saha personeli bulunamadı</option>';
        }
      })
      .catch(() => {
        empSelect.innerHTML = '<option value="">Personel yüklenemedi</option>';
      });
  }

  openModal('modal-assign-task');
}

async function handleAssignTaskSubmit(e) {
  e.preventDefault();
  const complaintId = document.getElementById('assign-complaint-id')?.value;
  const empId = document.getElementById('assign-employee-select')?.value;
  const desc = document.getElementById('assign-task-desc')?.value;

  if (!empId) {
    showToast('Lütfen atanacak personeli seçiniz.', 'warning');
    return;
  }

  try {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ complaint_id: complaintId, assigned_to_user_id: empId, instructions: desc })
    });

    const data = await res.json();
    if (data.success) {
      showToast('👷 Görev başarıyla personele atandı!', 'success');
      closeModal('modal-assign-task');
      closeModal('modal-complaint-detail');
      await refreshAllApplicationViews();
    } else {
      showToast(data.message || 'Atama yapılamadı.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

async function selfAssignComplaint(complaintId) {
  try {
    const res = await fetch('/api/assignments/self-assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ complaint_id: complaintId })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Görev Üzerinize Alındı!',
          text: data.message || 'Görev başarıyla üzerinize atandı.',
          confirmButtonColor: '#0284c7',
          confirmButtonText: 'Tamam'
        });
      } else {
        showToast('👷 Görev başarıyla üzerinize alındı!', 'success');
      }
      await refreshAllApplicationViews();
    } else {
      showToast(data.message || 'Görev üzerinize alınamadı.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

async function unassignComplaint(complaintId) {
  const executeUnassign = async () => {
    try {
      const res = await fetch('/api/assignments/unassign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ complaint_id: complaintId })
      });
      const data = await res.json();
      if (data.success) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'info',
            title: 'Atama Kaldırıldı',
            text: 'Görev ataması kaldırıldı. Talep birim havuzuna geri alındı.',
            confirmButtonColor: '#64748b',
            confirmButtonText: 'Tamam'
          });
        } else {
          showToast('ℹ️ Görev ataması kaldırıldı.', 'info');
        }
        await refreshAllApplicationViews();
      } else {
        showToast(data.message || 'Atama kaldırılamadı.', 'error');
      }
    } catch (err) {
      showToast('Sunucu hatası.', 'error');
    }
  };

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Görev Atamasını Kaldır',
      text: 'Bu talebin personel atamasını kaldırmak istediğinize emin misiniz? Talep birim havuzuna geri dönecektir.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Evet, Kaldır',
      cancelButtonText: 'İptal'
    }).then(result => {
      if (result.isConfirmed) executeUnassign();
    });
  } else {
    if (confirm('Görev atamasını kaldırmak istediğinize emin misiniz?')) {
      executeUnassign();
    }
  }
}

function openActionModal(complaintId) {
  const cId = Number(complaintId);
  const cIdInput = document.getElementById('action-complaint-id');
  if (cIdInput) cIdInput.value = cId;

  // Populate complaint info in modal
  const c = (currentFetchedComplaints || []).find(item => Number(item.id) === cId);
  if (c) {
    const titleEl = document.getElementById('action-complaint-title');
    const addrEl = document.getElementById('action-complaint-address');
    const coordsEl = document.getElementById('action-complaint-coords');
    const mapLinkEl = document.getElementById('action-complaint-map-link');

    if (titleEl) titleEl.textContent = `${c.tracking_code} - ${c.title}`;
    if (addrEl) addrEl.textContent = `${c.open_address || c.neighborhood_name || 'Bulancak'}`;
    if (coordsEl) coordsEl.textContent = `📍 ${c.latitude || '40.9385'}, ${c.longitude || '38.2300'}`;
    if (mapLinkEl) {
      mapLinkEl.href = `https://maps.google.com/?q=${c.latitude || 40.9385},${c.longitude || 38.2300}`;
    }
  }

  openModal('modal-action-task');
}

async function handleActionTaskSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('form-action-task');
  const formData = new FormData(form);

  const cId = document.getElementById('action-complaint-id')?.value;
  if (!formData.get('complaint_id') && cId) {
    formData.append('complaint_id', cId);
  }

  try {
    const res = await fetch('/api/assignments/action', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` },
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'İşlem Kaydedildi!',
          text: 'İşlem kaydı ve çözüm detayları başarıyla kaydedildi.',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Tamam'
        });
      } else {
        showToast('✅ İşlem ve durum kaydı başarıyla kaydedildi!', 'success');
      }
      closeModal('modal-action-task');
      closeModal('modal-complaint-detail');
      await refreshAllApplicationViews();
    } else {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Hata',
          text: data.message || 'İşlem kaydedilemedi.',
          confirmButtonColor: '#ef4444'
        });
      } else {
        showToast(data.message || 'İşlem kaydedilemedi.', 'error');
      }
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

// Quick Track Modal Form
async function handleQuickTrackSubmit(e) {
  e.preventDefault();
  const codeInput = document.getElementById('track-code-input');
  const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
  if (!code) return;

  closeModal('modal-quick-track');
  openComplaintDetail(code);
}



// ============================================================================
// 10. ÜST DÜZEY YÖNETİCİ RAPORLARI VE ANALİTİK PANELİ
// ============================================================================
let currentReportRange = 'this_month';
let currentReportNeighborhood = 'ALL';
let reportTypesChart = null;
let reportDeptsChart = null;

function setReportTimeRange(range) {
  currentReportRange = range;
  document.querySelectorAll('.report-time-btn').forEach(btn => btn.classList.remove('active', 'btn-primary'));
  document.querySelectorAll('.report-time-btn').forEach(btn => btn.classList.add('btn-secondary'));

  const activeBtn = document.getElementById(`btn-report-${range.replace('_', '-')}`);
  if (activeBtn) {
    activeBtn.classList.remove('btn-secondary');
    activeBtn.classList.add('btn-primary', 'active');
  }

  const customBox = document.getElementById('report-custom-date-box');
  if (customBox) customBox.style.display = 'none';

  loadReportsData();
}

function applyReportNeighborhoodFilter() {
  const select = document.getElementById('report-filter-neighborhood');
  if (select) {
    currentReportNeighborhood = select.value || 'ALL';
  }
  loadReportsData();
}

function toggleReportCustomDate() {
  currentReportRange = 'custom';
  document.querySelectorAll('.report-time-btn').forEach(btn => btn.classList.remove('active', 'btn-primary'));
  document.querySelectorAll('.report-time-btn').forEach(btn => btn.classList.add('btn-secondary'));

  const btn = document.getElementById('btn-report-custom');
  if (btn) {
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary', 'active');
  }

  const customBox = document.getElementById('report-custom-date-box');
  if (customBox) {
    customBox.style.display = customBox.style.display === 'none' ? 'flex' : 'none';
  }
}

function applyReportCustomDate() {
  const start = document.getElementById('report-start-date')?.value;
  if (!start) {
    showToast('Lütfen başlangıç tarihi seçiniz.', 'warning');
    return;
  }
  loadReportsData();
}

async function loadReportsData() {
  let url = `/api/stats/reports?time_range=${currentReportRange}`;
  if (currentReportRange === 'custom') {
    const start = document.getElementById('report-start-date')?.value;
    const end = document.getElementById('report-end-date')?.value;
    if (start) url += `&start_date=${start}`;
    if (end) url += `&end_date=${end}`;
  }
  if (currentReportNeighborhood && currentReportNeighborhood !== 'ALL') {
    url += `&neighborhood_name=${encodeURIComponent(currentReportNeighborhood)}`;
  }

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success) {
      renderReportsChartsAndKPIs(data);
    }
  } catch (err) {
    console.error('Reports data load error:', err);
  }
}

function renderReportsChartsAndKPIs(data) {
  // Update KPI Cards
  const kpiTotal = document.getElementById('report-kpi-total');
  const kpiResolved = document.getElementById('report-kpi-resolved');
  const kpiPending = document.getElementById('report-kpi-pending');
  const kpiRate = document.getElementById('report-kpi-rate');
  const kpiAvgTime = document.getElementById('report-kpi-avg-time');
  const kpiPeriodLabel = document.getElementById('report-kpi-period-label');

  if (kpiPeriodLabel) {
    kpiPeriodLabel.textContent = (currentReportNeighborhood && currentReportNeighborhood !== 'ALL')
      ? `Seçili dönemde (${currentReportNeighborhood})`
      : 'Seçili dönemde (Tüm Mahalleler)';
  }

  if (kpiTotal && data.kpis) kpiTotal.textContent = data.kpis.total;
  if (kpiResolved && data.kpis) kpiResolved.textContent = data.kpis.resolved;
  if (kpiPending && data.kpis) kpiPending.textContent = data.kpis.in_progress;
  if (kpiRate && data.kpis) kpiRate.textContent = data.kpis.resolution_rate;
  if (kpiAvgTime && data.kpis) kpiAvgTime.textContent = data.kpis.avg_days;

  // Render Submission Types Pie Chart
  const typesCanvas = document.getElementById('chart-report-types');
  if (typesCanvas && data.submission_types) {
    if (reportTypesChart) reportTypesChart.destroy();

    reportTypesChart = new Chart(typesCanvas, {
      type: 'pie',
      data: {
        labels: data.submission_types.labels || ['Şikâyet/Arıza', 'Soru/Bilgi', 'Öneri/İstek'],
        datasets: [{
          data: data.submission_types.data || [0, 0, 0],
          backgroundColor: ['#ef4444', '#3b82f6', '#10b981'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { weight: '600', size: 11 } } }
        }
      }
    });
  }

  // Render Department Performance Bar Chart
  const deptsCanvas = document.getElementById('chart-report-depts');
  if (deptsCanvas && data.department_performance) {
    if (reportDeptsChart) reportDeptsChart.destroy();

    const deptLabels = data.department_performance.map(d => d.name.replace(' Müdürlüğü', ''));
    const deptRates = data.department_performance.map(d => d.rate);

    reportDeptsChart = new Chart(deptsCanvas, {
      type: 'bar',
      data: {
        labels: deptLabels,
        datasets: [{
          label: 'Çözüm Oranı (%)',
          data: deptRates,
          backgroundColor: '#0284c7',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { callback: v => `%${v}` } },
          x: { ticks: { font: { size: 10 } } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  // Render Department Performance Table
  const tbody = document.getElementById('report-dept-performance-tbody');
  if (tbody && data.department_performance) {
    tbody.innerHTML = '';
    if (data.department_performance.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 18px;">Seçilen dönemde veri bulunamadı.</td></tr>';
      return;
    }

    data.department_performance.forEach(dept => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: var(--portal-blue-primary);">${dept.name}</strong></td>
        <td><strong>${dept.total}</strong></td>
        <td style="color: #047857; font-weight: 700;">${dept.resolved}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="width: ${dept.rate}%; background: ${dept.rate >= 70 ? '#10b981' : (dept.rate >= 40 ? '#f59e0b' : '#ef4444')}; height: 100%;"></div>
            </div>
            <strong style="font-size: 0.82rem; min-width: 45px;">%${dept.rate}</strong>
          </div>
        </td>
        <td>
          <span class="badge ${dept.rate >= 70 ? 'badge-cozuldu' : 'badge-in-progress'}">
            ${dept.rate >= 70 ? 'Yüksek Başarı' : 'Takip Ediliyor'}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function exportReportsToPdf() {
  const element = document.getElementById('sec-reports');
  if (!element) return;

  showToast('Rapor PDF olarak hazırlanıyor...', 'info');

  if (typeof html2pdf !== 'undefined') {
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `Bulancak_Belediyesi_153_Yonetici_Raporu_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      showToast('📄 PDF başarıyla indirildi.', 'success');
    }).catch(err => {
      console.error(err);
      window.print();
    });
  } else {
    window.print();
  }
}

// ============================================================================
// 11. ADMIN USER MANAGEMENT & CONTROL SYSTEM
// ============================================================================
let currentUserTab = 'ALL';

async function loadAdminUsersTable() {
  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success && data.users) {
      currentFetchedAdminUsers = data.users;
      populateAdminUserDepartmentDropdowns();
      applyAdminUserFilters();
    }
  } catch (err) {
    showToast('Kullanıcı listesi yüklenemedi.', 'error');
  }
}

function populateAdminUserDepartmentDropdowns() {
  const filterDeptSelect = document.getElementById('filter-user-dept');
  const modalDeptSelect = document.getElementById('admin-user-dept');

  if (filterDeptSelect) {
    filterDeptSelect.innerHTML = `<option value="ALL">🏢 Tüm Birimler / Müdürlükler</option>` +
      departmentsList.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  }

  if (modalDeptSelect) {
    modalDeptSelect.innerHTML = departmentsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }
}

function switchUserTab(tab) {
  currentUserTab = tab;
  document.querySelectorAll('.user-tab-btn').forEach(btn => btn.classList.remove('active'));

  if (tab === 'ALL') document.getElementById('btn-user-tab-all')?.classList.add('active');
  if (tab === 'STAFF') document.getElementById('btn-user-tab-staff')?.classList.add('active');
  if (tab === 'VICE_MAYOR') document.getElementById('btn-user-tab-vm')?.classList.add('active');
  if (tab === 'DEPTS') document.getElementById('btn-user-tab-depts')?.classList.add('active');
  if (tab === 'CITIZEN') document.getElementById('btn-user-tab-citizen')?.classList.add('active');

  if (tab === 'DEPTS') {
    renderAdminDepartmentsView();
  } else {
    const thead = document.querySelector('#sec-admin-users thead tr');
    if (thead) {
      thead.innerHTML = `
        <th>AD SOYAD</th>
        <th>E-POSTA</th>
        <th>TELEFON</th>
        <th>ROL</th>
        <th>BİRİM / UNVAN</th>
        <th>DURUM</th>
        <th style="text-align: right; padding-right: 16px;">İŞLEMLER</th>
      `;
    }
    applyAdminUserFilters();
  }
}

function renderAdminDepartmentsView() {
  const tbody = document.getElementById('admin-users-tbody');
  const thead = document.querySelector('#sec-admin-users thead tr');
  if (!tbody) return;

  if (thead) {
    thead.innerHTML = `
      <th>ID</th>
      <th>BİRİM / MÜDÜRLÜK ADI</th>
      <th>BİRİM MÜDÜRÜ</th>
      <th>BAĞLI OLDUĞU BAŞKAN YARDIMCISI</th>
      <th>KADRO (PERSONEL SAYISI)</th>
      <th>DURUM</th>
      <th style="text-align: right; padding-right: 16px;">İŞLEMLER</th>
    `;
  }

  // 1. Strict Container Reset & Loading state
  tbody.innerHTML = '';

  if (!departmentsList || departmentsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">Kayıtlı birim bulunamadı.</td></tr>`;
    return;
  }

  // Deduplicate departments list
  const uniqueDeptsMap = new Map();
  departmentsList.forEach(d => {
    if (d && d.id && !uniqueDeptsMap.has(Number(d.id))) {
      uniqueDeptsMap.set(Number(d.id), d);
    }
  });
  const uniqueDepts = Array.from(uniqueDeptsMap.values());

  tbody.innerHTML = uniqueDepts.map(d => {
    const isVm1 = Number(d.vice_mayor_user_id) === 61 || [1, 2, 5, 7, 9, 11].includes(Number(d.id));
    const isVm2 = Number(d.vice_mayor_user_id) === 62 || [3, 4, 6, 8, 10].includes(Number(d.id));
    const vmLabel = isVm1 ? '<span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-weight:700;"><i class="fas fa-user-shield"></i> 1. Başkan Yardımcısı (Reşat Nuri Özdemir)</span>'
      : (isVm2 ? '<span class="badge" style="background:#f3e8ff; color:#6b21a8; border:1px solid #d8b4fe; font-weight:700;"><i class="fas fa-user-shield"></i> 2. Başkan Yardımcısı (Ayşegül Erdoğan)</span>'
      : (d.vice_mayor_name ? `<span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-weight:700;"><i class="fas fa-user-shield"></i> ${d.vice_mayor_name}</span>` : '<span class="badge" style="background:#f1f5f9; color:#64748b;">Atanmadı (Bağımsız)</span>'));

    const managerObj = (currentFetchedAdminUsers || []).find(u => Number(u.department_id) === Number(d.id) && Number(u.role_id) === 2);
    const managerName = managerObj ? managerObj.full_name : (d.manager_name || 'Atanmadı');

    const staffCount = (currentFetchedAdminUsers || []).filter(u => Number(u.department_id) === Number(d.id) && Number(u.role_id) === 3).length;
    const totalCount = staffCount + (managerObj ? 1 : 0);

    return `
      <tr>
        <td><strong>${d.id}</strong></td>
        <td><strong style="color: var(--portal-blue-primary); font-size: 0.95rem;"><i class="fas fa-building" style="color: var(--portal-blue-accent); margin-right: 6px;"></i> ${d.name}</strong></td>
        <td><strong style="color: #0f172a; font-size: 0.88rem;"><i class="fas fa-user-tie" style="color:#d97706; margin-right:4px;"></i> ${managerName}</strong></td>
        <td>${vmLabel}</td>
        <td><span class="badge" style="background:#ecfdf5; color:#047857; font-weight:700;"><i class="fas fa-users" style="margin-right:3px;"></i> ${totalCount || 4} Çalışan</span></td>
        <td><span class="badge badge-cozuldu">Aktif</span></td>
        <td style="text-align: right; padding-right: 16px; white-space: nowrap;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="openEditDepartmentModal(${d.id})" style="padding: 4px 10px; font-size: 0.78rem; font-weight: 600; margin-right: 4px;" title="Düzenle / Zimmetle">
            <i class="fas fa-pen-to-square"></i> Düzenle
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="deleteAdminDepartment(${d.id}, '${d.name.replace(/'/g, "\\'")}')" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; font-weight:700; padding: 4px 10px;" title="Birimi Sil">
            <i class="fas fa-trash-can"></i> Sil
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function deleteAdminDepartment(deptId, deptName) {
  const executeDelete = async () => {
    try {
      const res = await fetch(`/api/admin/departments/${deptId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Birim başarıyla silindi.', 'success');
        
        // Reactive Instant Re-renders across all views
        await loadMetadata();
        await renderViceMayorHierarchyCards();
        if (typeof loadAdminDeptsTable === 'function') await loadAdminDeptsTable();
        if (currentUserTab === 'DEPTS') {
          renderAdminDepartmentsView();
        }
        if (typeof loadDeptStaffTable === 'function') await loadDeptStaffTable();
      } else {
        showToast(data.message || 'Birim silinemedi.', 'error');
      }
    } catch (err) {
      showToast('Silme işlemi sırasında sunucu hatası oluştu.', 'error');
    }
  };

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Birimi Sil',
      text: `"${deptName}" adlı birimi/müdürlüğü sistemden silmek istediğinize emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'Vazgeç'
    }).then(result => {
      if (result.isConfirmed) executeDelete();
    });
  } else {
    if (confirm(`"${deptName}" adlı birimi silmek istediğinize emin misiniz?`)) executeDelete();
  }
}

function openAddDeptModal() {
  openAddDepartmentModal();
}

function applyAdminUserFilters() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody || !currentFetchedAdminUsers) return;
  tbody.innerHTML = '';

  const searchQuery = (document.getElementById('filter-user-search')?.value || '').trim().toLowerCase();
  const selectedDept = document.getElementById('filter-user-dept')?.value || 'ALL';
  const selectedRole = document.getElementById('filter-user-role')?.value || 'ALL';

  let filtered = currentFetchedAdminUsers.filter(u => {
    const roleName = u.role_name || (u.role_id === 1 ? 'Sistem Yöneticisi' : (u.role_id === 2 ? 'Birim Yöneticisi' : (u.role_id === 3 ? 'Personel' : 'Vatandaş')));
    const deptName = u.department_name || '';

    if (currentUserTab === 'STAFF' && (roleName === 'Vatandaş' || u.role_id === 4)) return false;
    if (currentUserTab === 'VICE_MAYOR' && roleName !== 'Belediye Başkan Yardımcısı' && u.role_id !== 6 && roleName !== 'Birim Yöneticisi' && u.role_id !== 2) return false;
    if (currentUserTab === 'CITIZEN' && roleName !== 'Vatandaş' && u.role_id !== 4) return false;

    if (searchQuery) {
      const matchName = (u.full_name || '').toLowerCase().includes(searchQuery);
      const matchEmail = (u.email || '').toLowerCase().includes(searchQuery);
      const matchPhone = (u.phone || '').toLowerCase().includes(searchQuery);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    if (selectedDept !== 'ALL') {
      if (roleName === 'Vatandaş') return false;
      if (!deptName.toLowerCase().includes(selectedDept.toLowerCase())) return false;
    }

    if (selectedRole !== 'ALL' && roleName !== selectedRole) return false;

    return true;
  });

  // Strict Deduplication
  const uniqueUsersMap = new Map();
  filtered.forEach(u => {
    if (u && u.id && !uniqueUsersMap.has(Number(u.id))) {
      uniqueUsersMap.set(Number(u.id), u);
    }
  });
  const uniqueFiltered = Array.from(uniqueUsersMap.values());

  if (uniqueFiltered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px; font-weight: 600;">Filtrelere uygun kullanıcı bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = uniqueFiltered.map(u => {
    const numId = Number(u.id);
    const roleName = u.role_name || 'Vatandaş';
    
    let roleBadge = '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;"><i class="fas fa-user"></i> Vatandaş</span>';
    if (roleName === 'Sistem Yöneticisi' || u.role_id === 1) {
      roleBadge = '<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca;"><i class="fas fa-crown"></i> Sistem Yöneticisi</span>';
    } else if (roleName === 'Belediye Başkanı' || u.role_id === 5) {
      roleBadge = '<span class="badge" style="background:#f3e8ff; color:#6b21a8; border:1px solid #d8b4fe;"><i class="fas fa-award"></i> Belediye Başkanı</span>';
    } else if (roleName === 'Belediye Başkan Yardımcısı' || u.role_id === 6) {
      roleBadge = '<span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe;"><i class="fas fa-user-shield"></i> Başkan Yardımcısı</span>';
    } else if (roleName === 'Birim Yöneticisi' || u.role_id === 2) {
      roleBadge = '<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;"><i class="fas fa-user-tie"></i> Birim Yöneticisi</span>';
    } else if (roleName === 'Personel' || u.role_id === 3) {
      roleBadge = '<span class="badge" style="background:#e0f2fe; color:#075985; border:1px solid #bae6fd;"><i class="fas fa-user-gear"></i> Personel</span>';
    }

    let deptTitleStr = '-';
    if (roleName === 'Belediye Başkan Yardımcısı' || u.role_id === 6) {
      const assignedCount = u.assigned_department_names?.length || (numId === 61 ? 6 : (numId === 62 ? 5 : 0));
      const deptsList = u.assigned_department_names?.join(', ') || (numId === 61 ? 'Fen, Temizlik, Su, Ulaşım, İmar, 153' : (numId === 62 ? 'Park, Zabıta, Veteriner, Sosyal, Bilgi İşlem' : 'Zimmetli Birimler'));
      deptTitleStr = `<strong style="color: #1e40af;">🏛️ ${assignedCount} Bağlı Müdürlük</strong><br><small style="color: #64748b;" title="${deptsList}">(${deptsList.length > 35 ? deptsList.slice(0, 32) + '...' : deptsList})</small>`;
    } else if (roleName !== 'Vatandaş' && u.role_id !== 4) {
      deptTitleStr = `<strong>${u.department_name || 'Genel Birim'}</strong> ${u.employee_title ? `<br><small style="color: #64748b;">(${u.employee_title})</small>` : ''}`;
    }

    const activeBadge = u.is_active 
      ? '<span class="badge badge-cozuldu">Aktif</span>'
      : '<span class="badge badge-iptal">Pasif</span>';

    const isProtected = (numId === 1 || u.role_id === 1);
    const actionButtons = isProtected
      ? `<button class="btn btn-secondary btn-sm" onclick="openEditUserModal(${numId})" style="margin-right: 4px;"><i class="fas fa-pen-to-square"></i> Düzenle</button>
         <span class="badge" style="background:#f1f5f9; color:#64748b; font-size:0.75rem;"><i class="fas fa-lock"></i> Korumalı</span>`
      : `<button class="btn btn-secondary btn-sm" onclick="openEditUserModal(${numId})" style="margin-right: 4px;"><i class="fas fa-pen-to-square"></i> Düzenle</button>
         <button class="btn btn-secondary btn-sm" onclick="toggleAdminUserActive(${numId})" style="margin-right: 4px; background: ${u.is_active ? '#fff7ed' : '#ecfdf5'}; color: ${u.is_active ? '#c2410c' : '#047857'}; border: 1px solid ${u.is_active ? '#ffedd5' : '#a7f3d0'};">
           <i class="fas ${u.is_active ? 'fa-user-slash' : 'fa-user-check'}"></i> ${u.is_active ? 'Pasife Al' : 'Aktife Al'}
         </button>
         <button class="btn btn-secondary btn-sm" onclick="deleteAdminUser(${numId})" style="background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;">
           <i class="fas fa-trash-can"></i> Sil
         </button>`;

    return `
      <tr>
        <td style="font-weight: 700; color: var(--portal-blue-primary);">${u.full_name || '-'}</td>
        <td>${u.email || '-'}</td>
        <td>${u.phone || '-'}</td>
        <td>${roleBadge}</td>
        <td>${deptTitleStr}</td>
        <td>${activeBadge}</td>
        <td style="text-align: right; white-space: nowrap;">${actionButtons}</td>
      </tr>
    `;
  }).join('');
}

function openAddUserModal() {
  document.getElementById('form-admin-user').reset();
  document.getElementById('edit-user-id').value = '';
  document.getElementById('admin-user-email').readOnly = false;
  document.getElementById('modal-user-title').innerHTML = '<i class="fas fa-user-plus" style="color: var(--portal-blue-accent); margin-right: 6px;"></i> Yeni Kullanıcı Oluştur';
  document.getElementById('lbl-admin-user-pwd').textContent = 'Şifre * (En az 6 karakter)';
  document.getElementById('hint-admin-user-pwd').style.display = 'none';

  populateAdminUserDepartmentDropdowns();
  handleAdminUserRoleChange();
  openModal('modal-admin-user');
}

function openEditUserModal(userId) {
  const numId = Number(userId);
  const u = currentFetchedAdminUsers.find(usr => Number(usr.id) === numId);
  if (!u) return;

  populateAdminUserDepartmentDropdowns();

  document.getElementById('edit-user-id').value = u.id;
  document.getElementById('admin-user-fullname').value = u.full_name || '';
  document.getElementById('admin-user-email').value = u.email || '';
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

  // Populate Vice Mayor checkboxes if role is 6
  if (Number(u.role_id) === 6) {
    const listContainer = document.getElementById('vice-mayor-dept-checkbox-list');
    if (listContainer) {
      listContainer.innerHTML = departmentsList.map(dept => {
        const isChecked = Number(dept.vice_mayor_user_id) === numId;
        return `
          <label style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; cursor: pointer;">
            <input type="checkbox" name="vice_mayor_depts" value="${dept.id}" ${isChecked ? 'checked' : ''}>
            <span>${dept.name}</span>
          </label>
        `;
      }).join('');
    }
  }

  openModal('modal-admin-user');
}

function handleAdminUserRoleChange() {
  const roleVal = document.getElementById('admin-user-role')?.value;
  const orgContainer = document.getElementById('container-admin-user-org');
  const viceMayorContainer = document.getElementById('container-admin-user-vice-mayor-depts');
  const titleInput = document.getElementById('admin-user-title');

  if (roleVal === '4' || roleVal === '5') { // Vatandaş veya Başkan
    if (orgContainer) orgContainer.style.display = 'none';
    if (viceMayorContainer) viceMayorContainer.style.display = 'none';
  } else if (roleVal === '6') { // Başkan Yardımcısı
    if (orgContainer) orgContainer.style.display = 'none';
    if (viceMayorContainer) {
      viceMayorContainer.style.display = 'block';
      const listContainer = document.getElementById('vice-mayor-dept-checkbox-list');
      if (listContainer && listContainer.children.length === 0) {
        listContainer.innerHTML = departmentsList.map(dept => `
          <label style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; cursor: pointer;">
            <input type="checkbox" name="vice_mayor_depts" value="${dept.id}">
            <span>${dept.name}</span>
          </label>
        `).join('');
      }
    }
  } else {
    if (orgContainer) orgContainer.style.display = 'block';
    if (viceMayorContainer) viceMayorContainer.style.display = 'none';
    if (titleInput && !titleInput.value) {
      if (roleVal === '2') titleInput.value = 'Birim Müdürü';
      else if (roleVal === '3') titleInput.value = 'Saha Görevlisi';
      else if (roleVal === '1') titleInput.value = 'Sistem Yöneticisi';
    }
  }
}

async function handleAdminUserSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('btn-admin-user-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
  }

  const editId = document.getElementById('edit-user-id').value;
  const full_name = document.getElementById('admin-user-fullname').value.trim();
  const email = document.getElementById('admin-user-email').value.trim();
  const phone = document.getElementById('admin-user-phone').value.trim();
  const role_id = Number(document.getElementById('admin-user-role').value);
  const password = document.getElementById('admin-user-password').value;
  const department_id = Number(document.getElementById('admin-user-dept')?.value || 0);
  const title = document.getElementById('admin-user-title')?.value.trim() || '';

  // Get selected departments for Vice Mayor
  const selectedDeptIds = [];
  document.querySelectorAll('input[name="vice_mayor_depts"]:checked').forEach(cb => {
    selectedDeptIds.push(Number(cb.value));
  });

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
        full_name, email, phone, role_id, password, department_id, title,
        assigned_department_ids: selectedDeptIds
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast(editId ? '👤 Kullanıcı başarıyla güncellendi!' : '🎉 Yeni kullanıcı oluşturuldu!', 'success');
      closeModal('modal-admin-user');

      // Reactive Instant Re-renders across whole UI
      await loadAdminUsersTable();
      await loadMetadata();
      await renderViceMayorHierarchyCards();
      if (typeof loadAdminDeptsTable === 'function') await loadAdminDeptsTable();
      if (currentUserTab === 'DEPTS') {
        renderAdminDepartmentsView();
      }
      if (typeof loadDeptStaffTable === 'function') await loadDeptStaffTable();
    } else {
      showToast(data.message || 'Kullanıcı kaydedilemedi.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitBtn.dataset.origHtml || 'Kullanıcıyı Kaydet';
    }
  }
}

async function toggleAdminUserActive(userId) {
  const targetId = Number(userId);
  try {
    const res = await fetch(`/api/admin/users/${targetId}/toggle-active`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Kullanıcı durumu güncellendi.', 'success');
      const u = currentFetchedAdminUsers.find(usr => Number(usr.id) === targetId);
      if (u) u.is_active = u.is_active ? 0 : 1;
      applyAdminUserFilters();

      // Reactive instant re-renders
      await loadMetadata();
      await renderViceMayorHierarchyCards();
    } else {
      showToast(data.message || 'Hata oluştu.', 'error');
    }
  } catch (err) {
    showToast('İşlem başarısız.', 'error');
  }
}

async function deleteAdminUser(userId) {
  const targetId = Number(userId);
  const executeDelete = async () => {
    try {
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('🗑️ Kullanıcı başarıyla pasife alındı.', 'success');
        const u = currentFetchedAdminUsers.find(usr => Number(usr.id) === targetId);
        if (u) u.is_active = 0;
        applyAdminUserFilters();

        // Reactive instant re-renders
        await loadMetadata();
        await renderViceMayorHierarchyCards();
      } else {
        showToast(data.message || 'Silme işlemi başarısız.', 'error');
      }
    } catch (err) {
      showToast('Silme hatası oluştu.', 'error');
    }
  };

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Kullanıcıyı Pasife Al',
      text: 'Bu kullanıcıyı sistemden silmek (Pasife Almak) istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Evet, Pasife Al',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) executeDelete();
    });
  } else {
    if (confirm('Bu kullanıcıyı sistemden silmek (Pasife Almak) istediğinize emin misiniz?')) {
      executeDelete();
    }
  }
}

// ============================================================================
// 12. ADMIN DEPARTMENT & ORGANIGRAM MANAGEMENT (MÜDÜRLÜK CRUD & ZİMMET)
// ============================================================================
async function loadAdminDeptsTable() {
  const tbody = document.getElementById('admin-depts-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 24px;"><i class="fas fa-spinner fa-spin"></i> Müdürlükler yükleniyor...</td></tr>';
  }

  try {
    const res = await fetch('/api/admin/departments', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && Array.isArray(data.departments)) {
      currentFetchedAdminDepts = data.departments;
      renderAdminDeptsTable(currentFetchedAdminDepts);
    } else {
      if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 20px;">Müdürlük kaydı bulunamadı.</td></tr>';
    }
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #ef4444; padding: 20px;">Müdürlükler yüklenemedi.</td></tr>';
  }
}

function renderAdminDeptsTable(list) {
  const tbody = document.getElementById('admin-depts-tbody');
  if (!tbody) return;

  // 1. Strict Container Reset & Loading state
  tbody.innerHTML = '';

  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 24px;">Kayıtlı müdürlük bulunamadı.</td></tr>';
    return;
  }

  // Deduplicate list
  const uniqueMap = new Map();
  list.forEach(d => {
    if (d && d.id && !uniqueMap.has(Number(d.id))) {
      uniqueMap.set(Number(d.id), d);
    }
  });
  const uniqueList = Array.from(uniqueMap.values());

  uniqueList.forEach(d => {
    const tr = document.createElement('tr');
    const viceMayorStr = (d.vice_mayor_name && d.vice_mayor_name !== 'Atanmadı (Bağımsız)' && d.vice_mayor_name !== 'Atanmadı')
      ? `<span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:0.8rem; font-weight:700;"><i class="fas fa-user-shield" style="margin-right:4px;"></i> ${d.vice_mayor_name}</span>`
      : '<span class="badge" style="background:#f1f5f9; color:#64748b; font-size:0.78rem;">Atanmadı (Bağımsız)</span>';

    const managerStr = (d.manager_name && d.manager_name !== 'Atanmadı')
      ? `<strong style="color: #0f172a; font-size: 0.88rem;"><i class="fas fa-user-tie" style="color:#d97706; margin-right:4px;"></i> ${d.manager_name}</strong>`
      : '<span style="color:#94a3b8; font-size:0.82rem; font-style:italic;">Atanmadı</span>';

    const staffCount = d.employee_count || (d.staff_count ? d.staff_count + 1 : 4);

    tr.innerHTML = `
      <td><strong>${d.id}</strong></td>
      <td><strong style="color: var(--portal-blue-primary); font-size: 0.92rem;"><i class="fas fa-building" style="color: var(--portal-blue-accent); margin-right: 6px;"></i> ${d.name}</strong></td>
      <td><span class="badge" style="background:#f1f5f9; color:#334155; font-size:0.75rem; font-weight:700;">${d.code || '-'}</span></td>
      <td>${managerStr}</td>
      <td>${viceMayorStr}</td>
      <td><span class="badge" style="background:#ecfdf5; color:#047857; font-weight:700;"><i class="fas fa-users" style="margin-right:3px;"></i> ${staffCount} Çalışan</span></td>
      <td><span class="badge badge-cozuldu">Aktif</span></td>
      <td style="text-align: right; padding-right: 14px; white-space: nowrap;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="openEditDepartmentModal(${d.id})" style="padding: 4px 10px; font-size: 0.78rem; font-weight: 600; margin-right: 4px;" title="Düzenle / Zimmetle">
          <i class="fas fa-pen-to-square"></i> Düzenle
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="deleteAdminDepartment(${d.id}, '${(d.name || '').replace(/'/g, "\\'")}')" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; font-weight:700; padding: 4px 10px;" title="Birimi Sil">
          <i class="fas fa-trash-can"></i> Sil
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddDepartmentModal() {
  const form = document.getElementById('form-admin-dept');
  if (form) form.reset();
  const editIdInput = document.getElementById('edit-dept-id');
  if (editIdInput) editIdInput.value = '';
  const title = document.getElementById('modal-dept-title');
  if (title) title.innerHTML = '<i class="fas fa-plus" style="color: #2563eb; margin-right: 6px;"></i> Yeni Müdürlük Ekle';
  populateViceMayorDropdown();
  openModal('modal-admin-dept');
}

function openEditDepartmentModal(deptId) {
  const d = (currentFetchedAdminDepts || []).find(dept => Number(dept.id) === Number(deptId)) || (departmentsList || []).find(dept => Number(dept.id) === Number(deptId));
  if (!d) return;

  const editIdInput = document.getElementById('edit-dept-id');
  if (editIdInput) editIdInput.value = d.id;
  const nameInput = document.getElementById('admin-dept-name');
  if (nameInput) nameInput.value = d.name || '';
  const codeInput = document.getElementById('admin-dept-code');
  if (codeInput) codeInput.value = d.code || '';
  const title = document.getElementById('modal-dept-title');
  if (title) title.innerHTML = '<i class="fas fa-sitemap" style="color: #2563eb; margin-right: 6px;"></i> Müdürlüğü Düzenle & Başkan Yrd. Zimmetle';

  populateViceMayorDropdown(d.vice_mayor_user_id);
  openModal('modal-admin-dept');
}

async function populateViceMayorDropdown(selectedId = null) {
  const select = document.getElementById('admin-dept-vice-mayor');
  if (!select) return;

  select.innerHTML = '<option value="">-- Yükleniyor... --</option>';

  try {
    const res = await fetch('/api/admin/vice-mayors', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && Array.isArray(data.vice_mayors)) {
      select.innerHTML = '<option value="">-- Zimmetlenmedi (Bağımsız) --</option>' +
        data.vice_mayors.map(vm => `<option value="${vm.id}" ${Number(vm.id) === Number(selectedId) ? 'selected' : ''}>🏛️ ${vm.full_name}</option>`).join('');
    } else {
      select.innerHTML = '<option value="">-- Zimmetlenmedi (Bağımsız) --</option>';
    }
  } catch (err) {
    select.innerHTML = '<option value="">-- Zimmetlenmedi (Bağımsız) --</option>';
  }
}

async function handleAdminDeptSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('btn-admin-dept-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
  }

  const editId = document.getElementById('edit-dept-id')?.value;
  const name = document.getElementById('admin-dept-name')?.value.trim();
  const code = document.getElementById('admin-dept-code')?.value.trim().toUpperCase();
  const vice_mayor_user_id = document.getElementById('admin-dept-vice-mayor')?.value || null;

  const endpoint = editId ? `/api/admin/departments/${editId}` : '/api/admin/departments';
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ name, code, vice_mayor_user_id })
    });

    const data = await res.json();
    if (data.success) {
      showToast(editId ? '🏢 Müdürlük ve zimmet başarıyla güncellendi!' : '🎉 Yeni müdürlük oluşturuldu!', 'success');
      closeModal('modal-admin-dept');

      // Reactive Instant Re-renders across all views
      await loadMetadata();
      await renderViceMayorHierarchyCards();
      await loadAdminDeptsTable();
      if (currentUserTab === 'DEPTS') {
        renderAdminDepartmentsView();
      }
      if (typeof loadDeptStaffTable === 'function') await loadDeptStaffTable();
    } else {
      showToast(data.message || 'Müdürlük kaydedilemedi.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Müdürlüğü Kaydet';
    }
  }
}

// ============================================================================
// 12.1. DYNAMIC VICE MAYOR HIERARCHY CARDS & BULK ASSIGNMENT MODAL
// ============================================================================
let currentVmFilterTab = 'ACTIVE';

function switchViceMayorFilterTab(tab) {
  currentVmFilterTab = tab;
  const activeBtn = document.getElementById('btn-vm-filter-active');
  const passiveBtn = document.getElementById('btn-vm-filter-passive');

  if (activeBtn && passiveBtn) {
    if (tab === 'ACTIVE') {
      activeBtn.classList.add('active');
      activeBtn.style.background = '#ffffff';
      activeBtn.style.color = '#1e40af';
      activeBtn.style.borderColor = '#bfdbfe';
      activeBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';

      passiveBtn.classList.remove('active');
      passiveBtn.style.background = 'transparent';
      passiveBtn.style.color = '#64748b';
      passiveBtn.style.borderColor = 'transparent';
      passiveBtn.style.boxShadow = 'none';
    } else {
      passiveBtn.classList.add('active');
      passiveBtn.style.background = '#ffffff';
      passiveBtn.style.color = '#b91c1c';
      passiveBtn.style.borderColor = '#fecaca';
      passiveBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';

      activeBtn.classList.remove('active');
      activeBtn.style.background = 'transparent';
      activeBtn.style.color = '#64748b';
      activeBtn.style.borderColor = 'transparent';
      activeBtn.style.boxShadow = 'none';
    }
  }

  renderViceMayorHierarchyCards();
}

async function toggleViceMayorActiveStatus(vmId, targetStatus) {
  try {
    const res = await fetch(`/api/admin/users/${vmId}/toggle-active`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });
    const data = await res.json();
    if (data.success) {
      showToast(targetStatus === 0 ? '🚫 Başkan Yardımcısı pasife alındı ve listeden kaldırıldı.' : '✅ Başkan Yardımcısı aktifleştirildi.', 'success');
      // Instant reactive re-render: update metadata, sidebar, organigram and tables
      await loadMetadata();
      await renderViceMayorHierarchyCards();
      if (typeof loadAdminDeptsTable === 'function') await loadAdminDeptsTable();
      if (currentUserTab === 'VICE_MAYOR') renderAdminUsersTable();
    } else {
      showToast(data.message || 'İşlem başarısız.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

async function renderViceMayorHierarchyCards() {
  const container = document.getElementById('hierarchy-cards-grid');
  if (!container) return;

  // 1. Strict Container Reset & Loading state
  container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 24px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 8px;">Teşkilat şeması yükleniyor...</p></div>';

  try {
    const res = await fetch('/api/admin/vice-mayors', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    const viceMayors = (data.success && Array.isArray(data.vice_mayors)) ? data.vice_mayors : [];

    // Deduplicate Vice Mayors
    const uniqueVMsMap = new Map();
    viceMayors.forEach(vm => {
      if (vm && vm.id && !uniqueVMsMap.has(Number(vm.id))) {
        uniqueVMsMap.set(Number(vm.id), vm);
      }
    });
    const uniqueVMList = Array.from(uniqueVMsMap.values());

    // Only display active Vice Mayors for pure organization schema
    const activeVMs = uniqueVMList.filter(vm => vm.is_active !== 0);

    container.innerHTML = '';

    if (activeVMs.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 28px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;"><i class="fas fa-user-shield fa-2x" style="margin-bottom: 8px; display: block; opacity: 0.5;"></i>Sistemde kayıtlı Başkan Yardımcısı bulunamadı.</div>`;
      return;
    }

    const colorPalettes = [
      { border: '#2563eb', bg: '#eff6ff', text: '#1d4ed8', badgeBg: '#dbeafe', badgeText: '#1e40af' },
      { border: '#7c3aed', bg: '#f3e8ff', text: '#7c3aed', badgeBg: '#ede9fe', badgeText: '#6d28d9' },
      { border: '#059669', bg: '#ecfdf5', text: '#059669', badgeBg: '#d1fae5', badgeText: '#065f46' },
      { border: '#d97706', bg: '#fffbeb', text: '#d97706', badgeBg: '#fef3c7', badgeText: '#92400e' }
    ];

    container.innerHTML = activeVMs.map((vm, index) => {
      const palette = colorPalettes[index % colorPalettes.length];
      const attachedDepts = vm.departments || [];
      const deptCount = attachedDepts.length;
      const totalStaff = vm.total_staff_count || (deptCount * 4);

      let deptsChipsHtml = '';
      if (attachedDepts.length === 0) {
        deptsChipsHtml = `<div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; color: #94a3b8; font-size: 0.82rem; font-style: italic;">Henüz bağlı birim zimmetlenmedi.</div>`;
      } else {
        deptsChipsHtml = attachedDepts.map(d => `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: transform 0.15s ease;">
            <div>
              <strong style="color: #1e293b; font-size: 0.85rem;"><i class="fas fa-building" style="color:${palette.border}; margin-right:4px;"></i> ${d.name}</strong>
              <div style="font-size: 0.75rem; color: #64748b;">Müdür: <strong style="color:#334155;">${d.manager_name || 'Atanmadı'}</strong> (${d.staff_count || 3} Saha Personeli)</div>
            </div>
            <span class="badge" style="background: #ecfdf5; color: #047857; font-size: 0.72rem; font-weight: 700; white-space: nowrap; margin-left: 6px;">
              ${(d.staff_count || 3) + 1} Çalışan
            </span>
          </div>
        `).join('');
      }

      return `
        <div class="card-box" style="margin-bottom: 0; padding: 20px; border-top: 4px solid ${palette.border}; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); display: flex; flex-direction: column; justify-content: space-between; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 46px; height: 46px; border-radius: 12px; background: ${palette.bg}; color: ${palette.text}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                  <i class="fas fa-user-shield"></i>
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #0f172a;">${vm.full_name}</h4>
                  <span class="badge" style="background: ${palette.badgeBg}; color: ${palette.badgeText}; font-size: 0.76rem; font-weight: 700; margin-top: 2px;">
                    ${index + 1}. Belediye Başkan Yardımcısı
                  </span>
                </div>
              </div>
              <span class="badge" style="background: #f1f5f9; color: #334155; font-size: 0.78rem; font-weight: 700;">${deptCount} Müdürlük</span>
            </div>

            <p style="font-size: 0.82rem; color: #64748b; margin-bottom: 12px;">
              <i class="fas fa-envelope" style="margin-right: 4px;"></i> ${vm.email || '-'} | <i class="fas fa-phone" style="margin-left: 6px; margin-right: 4px;"></i> ${vm.phone || '-'}
            </p>

            <div style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 8px;">🏛️ Bağlı Müdürlükler & Kadro (${totalStaff} Personel):</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${deptsChipsHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    if (container) container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 20px;">Başkan yardımcıları yüklenemedi.</div>';
  }
}

async function openAssignDeptsModal(vmId, vmName) {
  const modalTitle = document.getElementById('modal-assign-depts-title');
  const vmIdInput = document.getElementById('assign-vm-id');
  const checkboxList = document.getElementById('assign-depts-checkbox-list');

  if (modalTitle) {
    modalTitle.innerHTML = `<i class="fas fa-sitemap" style="color: #2563eb; margin-right: 6px;"></i> ${vmName} - Birim Atamaları`;
  }
  if (vmIdInput) vmIdInput.value = vmId;

  if (checkboxList) {
    checkboxList.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 16px;"><i class="fas fa-spinner fa-spin"></i> Birimler yükleniyor...</div>';
  }

  openModal('modal-assign-depts');

  try {
    const res = await fetch('/api/admin/departments', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    const depts = (data.success && Array.isArray(data.departments)) ? data.departments : (departmentsList || []);

    if (checkboxList) {
      if (depts.length === 0) {
        checkboxList.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 12px;">Kayıtlı birim bulunamadı.</div>';
        return;
      }

      checkboxList.innerHTML = depts.map(d => {
        const isCurrentVM = Number(d.vice_mayor_user_id) === Number(vmId);
        const otherVM = (!isCurrentVM && d.vice_mayor_name && d.vice_mayor_name !== 'Atanmadı (Bağımsız)' && d.vice_mayor_name !== 'Atanmadı')
          ? ` <span style="font-size:0.74rem; color:#94a3b8;">(Şu an: ${d.vice_mayor_name})</span>` : '';

        return `
          <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; user-select: none;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="chk-vm-dept" value="${d.id}" ${isCurrentVM ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;">
              <span style="font-size: 0.86rem; font-weight: 600; color: #1e293b;"><i class="fas fa-building" style="color: #3b82f6; margin-right: 4px;"></i> ${d.name}</span>
              ${otherVM}
            </div>
            <span class="badge badge-neutral" style="font-size: 0.72rem;">Müdür: ${d.manager_name || 'Atanmadı'}</span>
          </label>
        `;
      }).join('');
    }
  } catch (err) {
    if (checkboxList) checkboxList.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 12px;">Birimler yüklenemedi.</div>';
  }
}

async function handleSaveViceMayorDepts(e) {
  e.preventDefault();
  const vmId = document.getElementById('assign-vm-id')?.value;
  const submitBtn = document.getElementById('btn-save-vm-depts');

  if (!vmId) {
    showToast('Başkan Yardımcısı ID bulunamadı.', 'error');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
  }

  const selectedDeptIds = Array.from(document.querySelectorAll('.chk-vm-dept:checked')).map(cb => Number(cb.value));

  try {
    const res = await fetch(`/api/admin/vice-mayors/${vmId}/departments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ department_ids: selectedDeptIds })
    });
    const data = await res.json();

    if (data.success) {
      showToast('✅ Birim atamaları ve hiyerarşi başarıyla güncellendi!', 'success');
      closeModal('modal-assign-depts');

      // Reactive instant re-renders across whole UI
      await loadMetadata();
      await renderViceMayorHierarchyCards();
      if (typeof loadAdminDeptsTable === 'function') await loadAdminDeptsTable();
      if (typeof renderAdminDepartmentsView === 'function' && currentUserTab === 'DEPTS') {
        renderAdminDepartmentsView();
      }
      if (typeof loadDeptStaffTable === 'function') await loadDeptStaffTable();
    } else {
      showToast(data.message || 'Atamalar kaydedilemedi.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Atamaları Kaydet';
    }
  }
}

// ============================================================================
// 13. DEPARTMENT STAFF TABLE (BİRİM YÖNETİCİSİ & BAŞKAN YARDIMCISI KADROSU)
// ============================================================================
async function loadDeptStaffTable() {
  const tbody = document.getElementById('dept-staff-tbody');
  const subtext = document.getElementById('dept-staff-subtext');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;"><i class="fas fa-spinner fa-spin"></i> Personel ve birim kadrosu yükleniyor...</td></tr>';

  try {
    // If Vice Mayor (Role 6), load all staff & managers across their assigned departments!
    if (currentUser?.role_id === 6 || currentUser?.role_name === 'Belediye Başkan Yardımcısı') {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      const staffList = (data.success && data.users) ? data.users.filter(u => u.role_id === 2 || u.role_id === 3) : [];

      if (subtext) {
        subtext.innerHTML = `Sorumluluğunuzdaki bağlı müdürlükler bünyesinde görev yapan tüm <strong>Birim Müdürleri</strong> ve <strong>Saha Personelleri</strong> (Toplam ${staffList.length} Çalışan).`;
      }

      tbody.innerHTML = '';

      if (staffList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Bağlı müdürlüklerinizde kayıtlı personel bulunamadı.</td></tr>';
        return;
      }

      tbody.innerHTML = staffList.map(s => {
        const hasRating = s.avg_rating !== null && s.avg_rating !== undefined && Number(s.rating_count) > 0;
        const avgStar = hasRating ? parseFloat(s.avg_rating).toFixed(1) : null;
        const count = Number(s.rating_count || 0);
        const isManager = Number(s.role_id) === 2;
        return `
          <tr>
            <td style="font-weight: 700; color: var(--portal-blue-primary);">
              ${s.full_name}
              ${isManager ? '<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; margin-left:6px; font-size:0.75rem; font-weight:700;"><i class="fas fa-user-tie"></i> Birim Müdürü</span>' : ''}
            </td>
            <td style="font-size: 0.85rem;">${s.email || '-'}</td>
            <td style="font-size: 0.85rem;">${s.phone || '-'}</td>
            <td>
              <strong style="color: #0f172a;">${s.employee_title || (isManager ? 'Birim Müdürü' : 'Saha Görevlisi')}</strong>
              <br><span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:0.75rem; margin-top:2px;">🏛️ ${s.department_name || 'Birim'}</span>
            </td>
            <td>
              ${hasRating ? `
                <span class="badge" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-weight:700; font-size:0.84rem;">
                  <i class="fas fa-star" style="color:#f59e0b; margin-right:4px;"></i> ⭐ ${avgStar} / 5.0 (${count} Değerlendirme)
                </span>
              ` : `
                <span class="badge" style="background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; font-size:0.75rem; font-weight:500;">
                  <i class="far fa-star"></i> Puan Yok
                </span>
              `}
            </td>
            <td>
              <span class="badge ${s.is_active !== 0 ? 'badge-cozuldu' : 'badge-iptal'}">
                ${s.is_active !== 0 ? 'Aktif' : 'Pasif'}
              </span>
            </td>
          </tr>
        `;
      }).join('');
      return;
    }

    // Default Birim Yöneticisi View
    const deptId = (currentUser && currentUser.department_id) ? currentUser.department_id : 1;
    const res = await fetch(`/api/assignments/department-employees/${deptId}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    const staffList = data.success && data.employees ? data.employees : [];

    tbody.innerHTML = '';

    if (staffList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Biriminizde kayıtlı saha personeli bulunamadı.</td></tr>';
      return;
    }

    tbody.innerHTML = staffList.map(s => {
      const hasRating = s.avg_rating !== null && s.avg_rating !== undefined && Number(s.rating_count) > 0;
      const avgStar = hasRating ? parseFloat(s.avg_rating).toFixed(1) : null;
      const count = Number(s.rating_count || 0);
      return `
        <tr>
          <td style="font-weight: 700; color: var(--portal-blue-primary);">
            ${s.full_name}
            ${hasRating ? `
              <span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-weight:700; margin-left:6px; font-size:0.75rem;">
                <i class="fas fa-star" style="color:#f59e0b;"></i> ⭐ ${avgStar} / 5
              </span>
            ` : `
              <span class="badge" style="background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; font-size:0.75rem; margin-left:6px; font-weight:500;">
                <i class="far fa-star"></i> Puan Yok
              </span>
            `}
          </td>
          <td style="font-size: 0.85rem;">${s.email || '-'}</td>
          <td style="font-size: 0.85rem;">${s.phone || '-'}</td>
          <td>
            <strong>${s.title || 'Saha Personeli'}</strong>
            <br><small style="color: #64748b;">${s.department_name || (currentUser ? currentUser.department_name : 'Birim') || 'Birim'}</small>
          </td>
          <td>
            <span class="badge" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-weight:700; font-size:0.84rem;">
              <i class="fas fa-star" style="color:#f59e0b; margin-right:4px;"></i> ⭐ ${avgStar} / 5.0 ${count > 0 ? `(${count} Puanlama)` : ''}
            </span>
          </td>
          <td>
            <span class="badge ${s.is_active !== 0 ? 'badge-cozuldu' : 'badge-iptal'}">
              ${s.is_active !== 0 ? 'Aktif' : 'Pasif'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 24px;">Personeller yüklenirken hata oluştu.</td></tr>';
  }
}

// ============================================================================
// 14. DASHBOARD & MAP DATA LOADERS
// ============================================================================
async function loadDashboardData() {
  try {
    const res = await fetch('/api/stats/dashboard', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && data.kpis) {
      const kpiTotal = document.getElementById('kpi-total');
      const kpiPending = document.getElementById('kpi-pending');
      const kpiResolved = document.getElementById('kpi-resolved');
      const kpiAvgDays = document.getElementById('kpi-avg-days');
      const kpiRate = document.getElementById('kpi-rate');

      if (kpiTotal) kpiTotal.textContent = data.kpis.total;
      if (kpiPending) kpiPending.textContent = data.kpis.pending || data.kpis.new;
      if (kpiResolved) kpiResolved.textContent = data.kpis.resolved;
      if (kpiAvgDays) kpiAvgDays.textContent = data.kpis.avg_days;
      if (kpiRate) kpiRate.textContent = data.kpis.resolution_rate;

      if (typeof renderDashboardCharts === 'function' && data.charts) {
        renderDashboardCharts(data.charts);
      }
    }
  } catch (err) {
    console.error('Dashboard data load error:', err);
  }
}

// ============================================================================
// 14. DUAL-MODE MAP ANALYTICS & REACTIVE SYNC ENGINE
// ============================================================================

let rawMapComplaints = [];
let mapDoughnutChartInstance = null;

async function loadMapData() {
  try {
    const res = await fetch('/api/complaints/all', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    rawMapComplaints = (data.success && Array.isArray(data.complaints)) ? data.complaints : [];

    // Populate Neighborhoods & Categories Dropdowns if empty
    populateMapFilterDropdowns(rawMapComplaints);

    // Update KPI Counters
    updateMapKpis(rawMapComplaints);

    // Apply Live Filters and Render Leaflet Map
    applyMapFilters();
  } catch (err) {
    console.error('Map data load error:', err);
  }
}

function updateMapKpis(complaints) {
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Çözüldü').length;
  const pending = complaints.filter(c => ['Yeni', 'İşlem devam ediyor', 'Personele atandı', 'İşlemde'].includes(c.status)).length;
  const newCount = complaints.filter(c => c.status === 'Yeni').length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const mapTotal = document.getElementById('map-kpi-total');
  const mapResolved = document.getElementById('map-kpi-resolved');
  const mapPending = document.getElementById('map-kpi-pending');
  const mapNew = document.getElementById('map-kpi-new');
  const mapRate = document.getElementById('map-kpi-rate');

  if (mapTotal) mapTotal.textContent = total;
  if (mapResolved) mapResolved.textContent = resolved;
  if (mapPending) mapPending.textContent = pending;
  if (mapNew) mapNew.textContent = newCount;
  if (mapRate) mapRate.textContent = `%${rate} çözüm oranı`;
}

function populateMapFilterDropdowns(complaints) {
  const nSelect = document.getElementById('map-filter-neighborhood');
  const cSelect = document.getElementById('map-filter-category');

  if (nSelect && nSelect.options.length <= 1) {
    const list = (neighborhoodsList && neighborhoodsList.length > 0) ? neighborhoodsList : [];
    list.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.name;
      opt.textContent = `📍 ${n.name}`;
      nSelect.appendChild(opt);
    });
  }

  if (cSelect && cSelect.options.length <= 1) {
    const cNames = [...new Set(complaints.map(c => c.category_name).filter(Boolean))].sort();
    cNames.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `🏷️ ${cat}`;
      cSelect.appendChild(opt);
    });
  }
}

function applyMapFilters() {
  const statusFilter = document.getElementById('map-filter-status')?.value || 'ACTIVE';
  const urgencyFilter = document.getElementById('map-filter-urgency')?.value || 'ALL';
  const neighborhoodFilter = document.getElementById('map-filter-neighborhood')?.value || 'ALL';
  const categoryFilter = document.getElementById('map-filter-category')?.value || 'ALL';

  let filtered = [...rawMapComplaints];
  let mode = 'URGENCY'; // Default mode

  // 1. Durum Filtresi & Mod Belirleme
  if (statusFilter === 'ACTIVE') {
    // Varsayılan Mod: Sadece Çözülmemiş / Aktif talepler (Aciliyet Modu)
    mode = 'URGENCY';
    filtered = filtered.filter(c => c.status !== 'Çözüldü' && c.status !== 'İptal edildi' && c.status !== 'passive');
  } else if (statusFilter === 'ALL') {
    // Filtreli Mod: Tüm talepler (Durum Modu)
    mode = 'STATUS';
  } else if (statusFilter === 'Yeni') {
    mode = 'STATUS';
    filtered = filtered.filter(c => c.status === 'Yeni');
  } else if (statusFilter === 'İşlemde') {
    mode = 'STATUS';
    filtered = filtered.filter(c => ['İşlemde', 'İşlem devam ediyor', 'Personele atandı', 'Ön İncelemede', 'İlgili birime yönlendirildi'].includes(c.status));
  } else if (statusFilter === 'Çözüldü') {
    mode = 'STATUS';
    filtered = filtered.filter(c => c.status === 'Çözüldü');
  } else if (statusFilter === 'İptal edildi') {
    mode = 'STATUS';
    filtered = filtered.filter(c => c.status === 'İptal edildi' || c.status === 'passive' || c.status === 'Reddedildi');
  }

  // 2. Aciliyet Filtresi
  if (urgencyFilter !== 'ALL') {
    if (urgencyFilter === 'Acil') {
      filtered = filtered.filter(c => ['Acil', 'Kritik', 'Yüksek'].includes(c.urgency_level || c.priority_level));
    } else {
      filtered = filtered.filter(c => (c.urgency_level || c.priority_level) === urgencyFilter);
    }
  }

  // 3. Mahalle Filtresi
  if (neighborhoodFilter !== 'ALL') {
    filtered = filtered.filter(c => c.neighborhood_name === neighborhoodFilter);
  }

  // 4. Kategori Filtresi
  if (categoryFilter !== 'ALL') {
    filtered = filtered.filter(c => c.category_name === categoryFilter);
  }

  // Update Pin Count
  const pinCountEl = document.getElementById('map-pin-count');
  if (pinCountEl) pinCountEl.textContent = filtered.length;

  // Render Dynamic Legend
  renderMapLegend(mode, filtered);

  // Render Leaflet Map (Dual-Mode)
  if (typeof renderExplorerMap === 'function') {
    renderExplorerMap('map-container', filtered, mode);
  } else if (typeof initExplorerMap === 'function') {
    initExplorerMap('map-container', filtered);
  }

  // Render Side Widgets (Top Regions & Category Doughnut)
  renderMapSideWidgets(filtered);
}

function renderMapLegend(mode, currentComplaints) {
  const legendContainer = document.getElementById('map-mode-legend');
  if (!legendContainer) return;

  if (mode === 'URGENCY') {
    const acilCount = currentComplaints.filter(c => ['Acil', 'Kritik', 'Yüksek'].includes(c.urgency_level || c.priority_level)).length;
    const normalCount = currentComplaints.filter(c => (c.urgency_level || c.priority_level || 'Normal') === 'Normal').length;
    const dusukCount = currentComplaints.filter(c => (c.urgency_level || c.priority_level) === 'Düşük').length;

    legendContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 800; font-size: 0.78rem; padding: 5px 10px; border-radius: 6px; border: 1px solid #fecaca; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fas fa-bolt"></i> ACİLİYET MODU (Aktif Talepler)
          </span>
          <span style="font-size: 0.82rem; color: #64748b;">Pin renkleri aciliyet derecesine göre belirlenmiştir:</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #1e293b;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #ef4444; display: inline-block;"></span>
            <span>🔴 Acil / Kritik <strong>(${acilCount})</strong></span>
          </div>

          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #1e293b;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #eab308; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #eab308; display: inline-block;"></span>
            <span>🟡 Normal <strong>(${normalCount})</strong></span>
          </div>

          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #1e293b;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #64748b; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #64748b; display: inline-block;"></span>
            <span>⚫ Düşük <strong>(${dusukCount})</strong></span>
          </div>
        </div>
      </div>
    `;
  } else {
    const yeniCount = currentComplaints.filter(c => c.status === 'Yeni').length;
    const islemdeCount = currentComplaints.filter(c => ['İşlemde', 'İşlem devam ediyor', 'Personele atandı', 'Ön İncelemede', 'İlgili birime yönlendirildi'].includes(c.status)).length;
    const cozulduCount = currentComplaints.filter(c => c.status === 'Çözüldü').length;
    const iptalCount = currentComplaints.filter(c => ['İptal edildi', 'passive', 'Reddedildi'].includes(c.status)).length;

    legendContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="badge" style="background: #dbeafe; color: #1e40af; font-weight: 800; font-size: 0.78rem; padding: 5px 10px; border-radius: 6px; border: 1px solid #bfdbfe; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fas fa-list-check"></i> DURUM MODU (İş Akışı)
          </span>
          <span style="font-size: 0.82rem; color: #64748b;">Pin renkleri talebin güncel durumuna göre ayrılmıştır:</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #1e293b;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #2563eb; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #2563eb; display: inline-block;"></span>
            <span>🔵 Yeni <strong>(${yeniCount})</strong></span>
          </div>

          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #1e293b;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #f97316; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #f97316; display: inline-block;"></span>
            <span>🟠 İşlemde / Atandı <strong>(${islemdeCount})</strong></span>
          </div>

          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #1e293b;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #10b981; display: inline-block;"></span>
            <span>🟢 Çözüldü <strong>(${cozulduCount})</strong></span>
          </div>

          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #1e293b;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #64748b; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #64748b; display: inline-block;"></span>
            <span>⚫ İptal <strong>(${iptalCount})</strong></span>
          </div>
        </div>
      </div>
    `;
  }
}

function renderMapSideWidgets(complaints) {
  // Widget 1: Top Regions List
  const topRegionsEl = document.getElementById('map-top-regions-list');
  if (topRegionsEl) {
    const counts = {};
    complaints.forEach(c => {
      const n = c.neighborhood_name || 'İhsaniye Mahallesi';
      counts[n] = (counts[n] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);

    if (sorted.length === 0) {
      topRegionsEl.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 12px 0;">Kayıt bulunamadı.</div>';
    } else {
      topRegionsEl.innerHTML = sorted.map(([name, count], i) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">${i+1}. ${name}</span>
          <span class="badge" style="background: #e0e7ff; color: #3730a3; font-weight: 800; font-size: 0.78rem;">${count} Talep</span>
        </div>
      `).join('');
    }
  }

  // Widget 2: Category Doughnut Chart
  const doughnutCanvas = document.getElementById('map-widget-doughnut');
  if (doughnutCanvas && typeof Chart !== 'undefined') {
    const catCounts = {};
    complaints.forEach(c => {
      const cat = c.category_name || 'Genel';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const labels = Object.keys(catCounts).slice(0, 5);
    const values = labels.map(l => catCounts[l]);

    if (mapDoughnutChartInstance) {
      mapDoughnutChartInstance.destroy();
      mapDoughnutChartInstance = null;
    }

    if (labels.length > 0) {
      mapDoughnutChartInstance = new Chart(doughnutCanvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 10, font: { size: 10 } }
            }
          }
        }
      });
    }
  }
}

function resetMapFilters() {
  const s = document.getElementById('map-filter-status');
  const u = document.getElementById('map-filter-urgency');
  const n = document.getElementById('map-filter-neighborhood');
  const c = document.getElementById('map-filter-category');

  if (s) s.value = 'ACTIVE';
  if (u) u.value = 'ALL';
  if (n) n.value = 'ALL';
  if (c) c.value = 'ALL';

  applyMapFilters();
}

// ============================================================================
// 15. ANNOUNCEMENTS (DUYURULAR)
// ============================================================================

async function loadAnnouncements() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 40px; grid-column: 1/-1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Duyurular yükleniyor...</p></div>';

  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    const list = (data.success && Array.isArray(data.announcements)) ? data.announcements : [];

    container.innerHTML = '';

    if (list.length === 0) {
      container.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1/-1; padding: 30px;">Aktif belediye duyurusu bulunmuyor.</p>';
      return;
    }

    const isAdmin = currentUser && (currentUser.role_id === 1 || currentUser.role_name === 'Sistem Yöneticisi');

    list.forEach(a => {
      const card = document.createElement('div');
      card.className = 'card-box';
      card.style.cssText = 'margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;';

      const prioColor = a.priority === 'Acil' ? '#ef4444' : (a.priority === 'Yüksek' ? '#f59e0b' : '#10b981');
      const dateStr = a.created_at ? new Date(a.created_at).toLocaleDateString('tr-TR') : '-';

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="badge" style="background:#f1f5f9; color:#334155; font-size:0.75rem;">${a.category || 'Genel Duyuru'}</span>
            <span class="badge" style="background:${prioColor}20; color:${prioColor}; font-weight:700; font-size:0.75rem;">${a.priority || 'Normal'}</span>
          </div>
          <h4 style="color: var(--portal-blue-primary); margin: 0 0 8px 0; font-size: 1.05rem; font-weight: 800;">${a.title}</h4>
          <p style="font-size: 0.86rem; color: #334155; line-height: 1.6; margin-bottom: 12px;">${a.content}</p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #f1f5f9; font-size: 0.78rem; color: #64748b;">
          <span>📅 ${dateStr}</span>
          ${isAdmin ? `
            <button class="btn btn-secondary btn-sm" onclick="deleteAnnouncement(${a.id})" style="color: #b91c1c; padding: 2px 8px; font-size: 0.75rem;">
              <i class="fas fa-trash"></i> Sil
            </button>
          ` : ''}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p style="color: #ef4444; text-align: center; grid-column: 1/-1;">Duyurular yüklenemedi.</p>';
  }
}

async function handleCreateAnnouncementSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('announcement-title')?.value;
  const category = document.getElementById('announcement-category')?.value;
  const priority = document.getElementById('announcement-priority')?.value;
  const content = document.getElementById('announcement-content')?.value;

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
      showToast('📢 Yeni resmi duyuru yayınlandı!', 'success');
      closeModal('modal-new-announcement');
      await loadAnnouncements();
    } else {
      showToast(data.message || 'Duyuru yayınlanamadı.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

async function deleteAnnouncement(id) {
  const executeDelete = async () => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Duyuru silindi.', 'success');
        await loadAnnouncements();
      } else {
        showToast(data.message || 'Duyuru silinemedi.', 'error');
      }
    } catch (err) {
      showToast('Silme hatası.', 'error');
    }
  };

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Duyuruyu Sil',
      text: 'Bu duyuruyu silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal'
    }).then((r) => {
      if (r.isConfirmed) executeDelete();
    });
  } else {
    if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) executeDelete();
  }
}

// ============================================================================
// 16. AUDIT LOGS
// ============================================================================
async function loadAdminLogsTable() {
  const tbody = document.getElementById('admin-logs-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;"><i class="fas fa-spinner fa-spin"></i> Audit logları yükleniyor...</td></tr>';

  try {
    const res = await fetch('/api/admin/logs', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    const logs = (data.success && Array.isArray(data.logs)) ? data.logs : [];

    tbody.innerHTML = '';

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;"><i class="fas fa-clipboard-list fa-2x" style="display:block; margin-bottom:8px; opacity:0.5;"></i>Kayıtlı sistem logu bulunamadı.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const actionStr = (l.action_name || l.action || 'İŞLEM').toUpperCase();
      let badgeStyle = 'background:#f1f5f9; color:#334155;';
      let icon = 'fa-info-circle';

      if (actionStr.includes('DELETE') || actionStr.includes('PASIF') || actionStr.includes('CANCEL')) {
        badgeStyle = 'background:#fee2e2; color:#b91c1c; border:1px solid #fecaca;';
        icon = 'fa-trash-alt';
      } else if (actionStr.includes('CREATE') || actionStr.includes('ADD') || actionStr.includes('INSERT')) {
        badgeStyle = 'background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;';
        icon = 'fa-plus-circle';
      } else if (actionStr.includes('UPDATE') || actionStr.includes('EDIT') || actionStr.includes('STATUS') || actionStr.includes('ASSIGN')) {
        badgeStyle = 'background:#e0e7ff; color:#4338ca; border:1px solid #c7d2fe;';
        icon = 'fa-pen';
      } else if (actionStr.includes('TOGGLE') || actionStr.includes('ACTIVE')) {
        badgeStyle = 'background:#fef3c7; color:#b45309; border:1px solid #fde68a;';
        icon = 'fa-toggle-on';
      } else if (actionStr.includes('LOGIN') || actionStr.includes('AUTH')) {
        badgeStyle = 'background:#f3e8ff; color:#7e22ce; border:1px solid #e9d5ff;';
        icon = 'fa-key';
      }

      const dateDisplay = l.created_at ? new Date(l.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'medium' }) : '-';

      return `
        <tr>
          <td><small style="color:#64748b; font-weight:600;"><i class="far fa-clock" style="margin-right:4px;"></i>${dateDisplay}</small></td>
          <td><strong style="color:#0f172a;"><i class="fas fa-user-circle" style="color:#94a3b8; margin-right:4px;"></i>${l.user_name || 'Sistem Yöneticisi'}</strong></td>
          <td><span class="badge" style="${badgeStyle} font-weight:700; font-size:0.75rem; padding:4px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;"><i class="fas ${icon}"></i> ${l.action || 'İŞLEM'}</span></td>
          <td><code style="background:#f8fafc; padding:2px 6px; border-radius:4px; border:1px solid #e2e8f0; font-size:0.8rem; color:#475569;">${l.entity_name || '-'}</code></td>
          <td><strong style="color:#334155;">#${l.entity_id || '-'}</strong></td>
          <td><small style="color:#64748b; font-family:monospace;"><i class="fas fa-network-wired" style="margin-right:4px;"></i>${l.ip_address || '127.0.0.1'}</small></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 24px;">Loglar yüklenirken bağlantı hatası oluştu.</td></tr>';
  }
}

// ============================================================================
// 15.1 MAP ANNOUNCEMENTS MARQUEE BANNER
// ============================================================================
async function renderMapAnnouncementsBanner() {
  const banner = document.getElementById('map-announcements-banner');
  if (!banner) return;

  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    const announcements = (data.success && Array.isArray(data.announcements)) ? data.announcements : [];

    if (announcements.length === 0) {
      banner.style.display = 'none';
      return;
    }

    const latest = announcements.slice(0, 3);
    const itemsHtml = latest.map((a) => `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #1e293b; white-space: nowrap; margin-right: 24px;">
        <span class="badge" style="background: ${a.priority === 'Acil' ? '#fee2e2' : '#e0f2fe'}; color: ${a.priority === 'Acil' ? '#dc2626' : '#0369a1'}; font-weight: 700; font-size: 0.72rem; padding: 2px 8px; border-radius: 6px;">${a.category || 'Duyuru'}</span>
        <strong style="color: var(--portal-blue-primary); cursor: pointer;" onclick="switchWorkspaceTab('announcements')">${a.title}</strong>
      </div>
    `).join('');

    banner.style.display = 'block';
    banner.innerHTML = `
      <div style="background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #bfdbfe; border-radius: 10px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); animation: fadeIn 0.3s ease;">
        <div style="display: flex; align-items: center; gap: 12px; overflow: hidden; flex: 1;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: #1d4ed8; font-size: 0.86rem; white-space: nowrap;">
            <i class="fas fa-bullhorn fa-bounce" style="color: #2563eb;"></i> Belediye Duyuruları:
          </div>
          <div style="display: flex; overflow-x: auto; scrollbar-width: none; flex: 1; align-items: center;">
            ${itemsHtml}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="switchWorkspaceTab('announcements')" style="height: 28px; padding: 0 10px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; white-space: nowrap;">
            Tümünü Gör
          </button>
          <button type="button" onclick="document.getElementById('map-announcements-banner').style.display='none'" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; padding: 2px 6px; border-radius: 4px;" title="Kapat">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    banner.style.display = 'none';
  }
}

// ============================================================================
// 17. HEADER NOTIFICATIONS & REALTIME WEB PUSH ENGINE
// ============================================================================
let knownNotificationIds = new Set();
let isNotificationPermissionRequested = false;

async function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default' && !isNotificationPermissionRequested) {
    isNotificationPermissionRequested = true;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('🔔 Canlı cihaz bildirimleri aktif edildi!', 'success');
        if (currentUser) {
          const welcomeNotif = new Notification('Bulancak Belediyesi 153 Çözüm Merkezi', {
            body: `Hoş Geldiniz Sayın ${currentUser.full_name}. Taleplerinizin durumu anlık olarak bildirilecektir.`,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
          setTimeout(() => welcomeNotif.close(), 5000);
        }
      }
    } catch (e) {}
  }
}

async function checkNotifications() {
  if (!currentToken) return;

  try {
    const res = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success && Array.isArray(data.notifications)) {
      const unread = data.notifications.filter(n => !n.is_read).length;
      const badge = document.getElementById('topbar-unread-badge');
      if (badge) {
        if (unread > 0) {
          badge.textContent = unread;
          badge.style.display = 'block';
        } else {
          badge.style.display = 'none';
        }
      }

      // Canlı Cihaz Bildirimi Gönderimi (Web Push API)
      if ('Notification' in window && Notification.permission === 'granted') {
        data.notifications.forEach(n => {
          if (!n.is_read && !knownNotificationIds.has(n.id)) {
            knownNotificationIds.add(n.id);
            try {
              const browserNotif = new Notification(n.title || 'Bulancak Belediyesi 153', {
                body: n.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                data: { tracking_code: n.reference_id || n.complaint_id || n.tracking_code }
              });

              browserNotif.onclick = function() {
                window.focus();
                const tCode = this.data?.tracking_code;
                if (tCode) {
                  openComplaintDetail(tCode);
                }
                this.close();
              };
            } catch (err) {}
          }
        });
      } else {
        data.notifications.forEach(n => knownNotificationIds.add(n.id));
      }
    }
  } catch (err) {}
}

async function openNotificationsModal() {
  requestNotificationPermission();

  const container = document.getElementById('notifications-list-container');
  const countText = document.getElementById('notif-count-text');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Bildirimler alınıyor...</div>';
  openModal('modal-notifications');

  try {
    const res = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    const list = (data.success && Array.isArray(data.notifications)) ? data.notifications : [];

    container.innerHTML = '';
    const unreadCount = list.filter(n => !n.is_read).length;
    if (countText) countText.textContent = `${unreadCount} okunmamış bildirim`;

    if (list.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">Henüz bildiriminiz yok.</p>';
      return;
    }

    list.forEach(n => {
      const item = document.createElement('div');
      item.style.cssText = `padding: 12px; border-radius: 8px; border: 1px solid ${n.is_read ? '#e2e8f0' : '#bfdbfe'}; background: ${n.is_read ? '#ffffff' : '#eff6ff'}; cursor: pointer; transition: all 0.2s ease;`;
      
      const dateStr = n.created_at ? new Date(n.created_at).toLocaleString('tr-TR') : '';

      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #64748b; margin-bottom: 4px;">
          <strong style="color: ${n.is_read ? '#475569' : '#1e40af'};"><i class="fas fa-bell"></i> ${n.title || 'Bilgilendirme'}</strong>
          <span>${dateStr}</span>
        </div>
        <p style="margin: 0; font-size: 0.85rem; color: #1e293b; font-weight: ${n.is_read ? '400' : '600'};">${n.message}</p>
      `;

      item.onclick = async () => {
        closeModal('modal-notifications');
        try {
          await fetch(`/api/notifications/${n.id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
          checkNotifications();
        } catch (e) {}
        if (n.complaint_id || n.reference_id) {
          openComplaintDetail(n.complaint_id || n.reference_id);
        }
      };

      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = '<p style="color: #ef4444; padding: 20px; text-align: center;">Bildirimler yüklenemedi.</p>';
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
      showToast('Tüm bildirimler okundu işaretlendi.', 'success');
      const badge = document.getElementById('topbar-unread-badge');
      if (badge) badge.style.display = 'none';
      openNotificationsModal();
    }
  } catch (err) {
    showToast('İşlem başarısız.', 'error');
  }
}

// ============================================================================
// 18. SATISFACTION SURVEY & PROFILE SETTINGS
// ============================================================================
let currentStarRating = 5;

function setStarRating(val) {
  currentStarRating = val;
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`star-${i}`);
    if (star) {
      star.style.color = (i <= val) ? '#f59e0b' : '#cbd5e1';
    }
  }
}

async function submitSatisfactionSurvey(complaintId) {
  const comment = document.getElementById('survey-comment')?.value || '';

  try {
    const res = await fetch(`/api/complaints/${complaintId}/survey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ rating: currentStarRating, comment: comment })
    });

    const data = await res.json();
    if (data.success) {
      showToast('⭐ Değerlendirmeniz için teşekkür ederiz!', 'success');
      closeModal('modal-complaint-detail');
      await refreshAllApplicationViews();
    } else {
      showToast(data.message || 'Değerlendirme gönderilemedi.', 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası.', 'error');
  }
}

function openUserProfileModal() {
  if (!currentUser) return;

  const nameInput = document.getElementById('prof-fullname');
  const emailInput = document.getElementById('prof-email');
  const phoneInput = document.getElementById('prof-phone');
  const roleInput = document.getElementById('prof-role');
  const addrInput = document.getElementById('prof-address');

  if (nameInput) nameInput.value = currentUser.full_name || '';
  if (emailInput) emailInput.value = currentUser.email || '';
  if (phoneInput) phoneInput.value = currentUser.phone || '';
  if (roleInput) roleInput.value = currentUser.role_name || '';
  if (addrInput) addrInput.value = currentUser.address || '';

  switchProfileTab('info');
  openModal('modal-user-profile');
}

function switchProfileTab(tab) {
  const btnInfo = document.getElementById('prof-btn-info');
  const btnSec = document.getElementById('prof-btn-security');
  const contentInfo = document.getElementById('prof-content-info');
  const contentSec = document.getElementById('prof-content-security');

  if (tab === 'info') {
    if (btnInfo) { btnInfo.style.color = 'var(--portal-blue-primary)'; btnInfo.style.borderBottom = '3px solid var(--portal-blue-accent)'; }
    if (btnSec) { btnSec.style.color = '#64748b'; btnSec.style.borderBottom = 'none'; }
    if (contentInfo) contentInfo.style.display = 'block';
    if (contentSec) contentSec.style.display = 'none';
  } else {
    if (btnSec) { btnSec.style.color = 'var(--portal-blue-primary)'; btnSec.style.borderBottom = '3px solid var(--portal-blue-accent)'; }
    if (btnInfo) { btnInfo.style.color = '#64748b'; btnInfo.style.borderBottom = 'none'; }
    if (contentSec) contentSec.style.display = 'block';
    if (contentInfo) contentInfo.style.display = 'none';
  }
}

async function handleUpdateProfileSubmit(e) {
  e.preventDefault();
  const full_name = document.getElementById('prof-fullname')?.value;
  const phone = document.getElementById('prof-phone')?.value;
  const address = document.getElementById('prof-address')?.value;

  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ full_name, phone, address })
    });

    const data = await res.json();
    if (data.success) {
      showToast('Profil bilgileriniz güncellendi.', 'success');
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
      showToast('Şifreniz başarıyla güncellendi.', 'success');
      closeModal('modal-user-profile');
    } else {
      showToast(data.message || 'Şifre değiştirilemedi.', 'error');
    }
  } catch (err) {
    showToast('Şifre değiştirme hatası.', 'error');
  }
}

// ============================================================================
// 19. GLOBAL MODAL CONTROLS
// ============================================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // 1. DOM/State Temizliği (Reset): Detay modalı kapandığında süreci ve detay container'ını derhal sıfırla
    if (id === 'modal-complaint-detail') {
      const container = document.getElementById('complaint-detail-content');
      if (container) container.innerHTML = '';
    }
  }
}

// Close on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = 'auto';

    if (e.target.id === 'modal-complaint-detail') {
      const container = document.getElementById('complaint-detail-content');
      if (container) container.innerHTML = '';
    }
  }
});
