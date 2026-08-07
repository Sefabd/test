const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Keyword rules dictionary for categories & departments
const AI_RULES = [
  {
    category_id: 1, department_id: 1, category_name: 'Yol ve Kaldırım Sorunu', dept_name: 'Fen İşleri Müdürlüğü',
    keywords: ['kaldırım', 'taş', 'kaldırım taşı', 'yürüyüş yolu', 'tretuvar', 'bulaşık', 'parke'], priority: 'Normal'
  },
  {
    category_id: 2, department_id: 1, category_name: 'Çukur veya Asfalt Problemi', dept_name: 'Fen İşleri Müdürlüğü',
    keywords: ['çukur', 'asfalt', 'yama', 'yol bozuk', 'kasis', 'çökme', 'otoyol', 'cadde bozuk'], priority: 'Yüksek'
  },
  {
    category_id: 3, department_id: 2, category_name: 'Çöp ve Çevre Kirliliği', dept_name: 'Temizlik İşleri Müdürlüğü',
    keywords: ['çöp', 'konteyner', 'atık', 'koku', 'pislik', 'süpürme', 'temizlik', 'çöp kutusu', 'moloz', 'göl'], priority: 'Normal'
  },
  {
    category_id: 4, department_id: 3, category_name: 'Park ve Yeşil Alan Sorunu', dept_name: 'Park ve Bahçeler Müdürlüğü',
    keywords: ['park', 'ağaç', 'çim', 'oyun parkı', 'bank', 'salıncak', 'dal', 'budama', 'yeşil alan'], priority: 'Düşük'
  },
  {
    category_id: 5, department_id: 4, category_name: 'Gürültü Şikâyeti', dept_name: 'Zabıta Müdürlüğü',
    keywords: ['gürültü', 'ses', 'müzik', 'inşaat sesi', 'gece gürültüsü', 'bağırma', 'klakson'], priority: 'Acil'
  },
  {
    category_id: 6, department_id: 4, category_name: 'Ruhsatsız İşletme', dept_name: 'Zabıta Müdürlüğü',
    keywords: ['ruhsat', 'kaçak dükkan', 'kaldırım işgali', 'tezgah', 'seyyar', 'fiyat', 'zabıta'], priority: 'Normal'
  },
  {
    category_id: 7, department_id: 5, category_name: 'Su Kaçağı', dept_name: 'Su ve Kanalizasyon Müdürlüğü',
    keywords: ['su kaçağı', 'su patlağı', 'şebeke suyu', 'su fışkırıyor', 'boru patladı', 'sızıntı'], priority: 'Kritik'
  },
  {
    category_id: 8, department_id: 5, category_name: 'Kanalizasyon Problemi', dept_name: 'Su ve Kanalizasyon Müdürlüğü',
    keywords: ['rögar', 'kanalizasyon', 'lağım', 'tıkanıklık', 'su baskını', 'atık su'], priority: 'Kritik'
  },
  {
    category_id: 9, department_id: 6, category_name: 'Başıboş Hayvan', dept_name: 'Veteriner İşleri Müdürlüğü',
    keywords: ['köpek', 'kedi', 'başıboş', 'saldırgan', 'yaralı hayvan', 'kuduz', 'veteriner', 'barınak'], priority: 'Yüksek'
  },
  {
    category_id: 10, department_id: 7, category_name: 'Toplu Taşıma Sorunu', dept_name: 'Ulaşım Hizmetleri Müdürlüğü',
    keywords: ['otobüs', 'durak', 'dolmuş', 'sefer', 'şoför', 'ulaşım', 'trafik lambası', 'sinyalizasyon'], priority: 'Normal'
  },
  {
    category_id: 11, department_id: 8, category_name: 'Sosyal Yardım Talebi', dept_name: 'Sosyal Hizmetler Müdürlüğü',
    keywords: ['yardım', 'erzak', 'yakacak', 'burs', 'sosyal destek', 'fakir', 'ihtiyaç'], priority: 'Normal'
  },
  {
    category_id: 12, department_id: 9, category_name: 'İmar ve Yapı Şikâyeti', dept_name: 'İmar ve Şehircilik Müdürlüğü',
    keywords: ['kaçak yapı', 'bina', 'inşaat', 'ruhsatsız bina', 'tehlikeli duvar', 'yıkım'], priority: 'Yüksek'
  },
  {
    category_id: 13, department_id: 10, category_name: 'Sokak Lambası Arızası', dept_name: 'Bilgi İşlem Müdürlüğü',
    keywords: ['lamba', 'sokak lambası', 'ışık', 'aydınlatma', 'karanlık', 'elektrik direği'], priority: 'Normal'
  }
];

const EMERGENCY_WORDS = ['tehlike', 'kaza', 'yangın', 'patlama', 'acil', 'ölüm', 'yaralanma', 'kritik', 'kan', 'fışkırıyor'];
const BAD_WORDS = ['küfür1', 'aptal', 'salak', 'şerefsiz', 'hakaret'];

// POST /api/ai/analyze - Metin Analiz Endpoint'i
router.post('/analyze', async (req, res) => {
  const { title = '', description = '', neighborhood_id } = req.body;
  const fullText = (title + ' ' + description).toLowerCase();

  // 1. Kategori & Müdürlük Skoru
  let bestMatch = AI_RULES[0];
  let maxScore = 0;

  AI_RULES.forEach(rule => {
    let score = 0;
    rule.keywords.forEach(kw => {
      if (fullText.includes(kw)) score += 2;
    });
    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  });

  // 2. Aciliyet & Öncelik Analizi
  let urgency = bestMatch.priority;
  let hasEmergency = false;

  EMERGENCY_WORDS.forEach(word => {
    if (fullText.includes(word)) {
      hasEmergency = true;
    }
  });

  if (hasEmergency) {
    urgency = 'Kritik';
  }

  // 3. Hakaret & Küfür Denetimi (Content Moderation)
  let isFlagged = false;
  BAD_WORDS.forEach(bw => {
    if (fullText.includes(bw)) isFlagged = true;
  });

  // 4. Duygu Analizi (Sentiment)
  let sentiment = 'Nötr';
  if (hasEmergency || fullText.includes('mağdur') || fullText.includes('rezalet') || fullText.includes('berbat') || fullText.includes('şikayetçiyim')) {
    sentiment = 'Olumsuz';
  }

  // 5. Mükerrer Şikâyet Kontrolü (Duplicate Detection)
  let duplicateCount = 0;
  let similarComplaints = [];

  if (neighborhood_id && title.trim().length > 3) {
    try {
      const firstWord = title.trim().split(' ')[0];
      const [existing] = await pool.query(
        `SELECT id, tracking_code, title, status, created_at
         FROM complaints
         WHERE neighborhood_id = ? AND status NOT IN ('Çözüldü', 'Reddedildi', 'İptal edildi')
         AND (title LIKE ? OR description LIKE ?)
         LIMIT 3`,
        [neighborhood_id, `%${firstWord}%`, `%${firstWord}%`]
      );
      duplicateCount = existing.length;
      similarComplaints = existing;
    } catch (err) {
      console.error('Duplicate check error:', err);
    }
  }

  // 6. Otomatik Anlaşılır Özet Üretme (Text Summarization)
  const cleanDesc = description.trim();
  const aiSummary = cleanDesc.length > 120 ? cleanDesc.substring(0, 120) + '...' : cleanDesc;

  res.json({
    success: true,
    analysis: {
      suggested_category_id: bestMatch.category_id,
      suggested_category_name: bestMatch.category_name,
      suggested_department_id: bestMatch.department_id,
      suggested_department_name: bestMatch.dept_name,
      suggested_priority: urgency,
      sentiment: sentiment,
      is_flagged: isFlagged,
      ai_summary: aiSummary,
      duplicate_detected: duplicateCount > 0,
      duplicate_count: duplicateCount,
      similar_complaints: similarComplaints
    }
  });
});

module.exports = router;
