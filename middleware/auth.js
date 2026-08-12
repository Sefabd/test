const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'belediye_talep_super_secret_jwt_key_2026';

// JWT Token Doğrulama
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Erişim engellendi, oturum tokenı bulunamadı.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
    }
    req.user = user;
    next();
  });
}

// Rol Kontrolü Middleware (RBAC)
function checkRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yetkilendirme hatası.' });
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    const userRoleName = req.user.role_name;
    const userRoleId = Number(req.user.role_id);

    const isAllowed = rolesArray.some(role => {
      if (typeof role === 'number') return role === userRoleId;
      if (typeof role === 'string') {
        if (role === userRoleName) return true;
        if (role === 'Sistem Yöneticisi' && (userRoleId === 1 || userRoleName === 'Admin')) return true;
        if (role === 'Birim Yöneticisi' && (userRoleId === 2 || userRoleName === 'Müdür')) return true;
        if (role === 'Personel' && (userRoleId === 3 || userRoleName === 'Saha Personeli')) return true;
        if (role === 'Vatandaş' && (userRoleId === 4 || userRoleName === 'Citizen')) return true;
      }
      return false;
    });

    if (rolesArray.length > 0 && !isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Bu işlem için yetkiniz bulunmamaktadır. Gerekli Rol: ${rolesArray.join(' veya ')}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  checkRole,
  JWT_SECRET
};
