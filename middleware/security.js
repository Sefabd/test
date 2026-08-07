const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');

// Upload directory ensure
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'bld-' + uniqueSuffix + ext);
  }
});

// File security filter (MIME & Extension)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya türü. Sadece JPG, PNG, WEBP, PDF, DOC kabul edilir.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// XSS Sanitization helper
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Audit Log Helper
async function createAuditLog(userId, action, entityName, entityId, oldValue, newValue, ipAddress) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_name, entity_id, old_value, new_value, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        action,
        entityName,
        entityId || null,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress || '127.0.0.1'
      ]
    );
  } catch (err) {
    console.error('Audit Log kayıt hatası:', err.message);
  }
}

module.exports = {
  upload,
  sanitizeInput,
  createAuditLog
};
