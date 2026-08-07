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

    // allowedRoles string veya array olabilir
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (rolesArray.length > 0 && !rolesArray.includes(req.user.role_name)) {
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
