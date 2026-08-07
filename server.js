const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');

const app = express();
let PORT = parseInt(process.env.PORT, 10) || 3000;

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files and uploads
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes Mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/public', require('./routes/public'));

// SPA Fallback Route
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint bulunamadı.' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Sunucu Hatası:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Sunucuda beklenmeyen bir hata oluştu.'
  });
});

// Start Server with automatic port fallback if port is busy
async function startServer() {
  await initializeDatabase();

  function listen(portToTry) {
    const server = app.listen(portToTry, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Belediye Talep Yönetim Sistemi Başlatıldı!`);
      console.log(`🌐 Web Erişimi: http://localhost:${portToTry}`);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${portToTry} meşgul, Port ${portToTry + 1} deneniyor...`);
        listen(portToTry + 1);
      } else {
        console.error('Sunucu başlatma hatası:', err);
      }
    });
  }

  listen(PORT);
}

startServer();
