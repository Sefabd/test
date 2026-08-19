# 🏛️ Bulancak Belediyesi 153 Çözüm Merkezi

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-GIS_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Bulancak Belediyesi 153 Çözüm Merkezi**, vatandaşların belediye hizmetleriyle ilgili talep, şikâyet ve önerilerini yapay zekâ (AI) ve interaktif harita desteğiyle 7/24 iletebildiği; belediye yönetimi ve saha ekiplerinin ise kurumsal hiyerarşiye uygun olarak süreçleri anlık yönettiği yeni nesil akıllı belediyecilik platformudur.

---

## 🌟 Öne Çıkan Özellikler

### 🤖 1. Yapay Zekâ (AI) Akıllı Talep Analiz Motoru
- **Otomatik Başlık ve Alan Doldurma**: Vatandaş şikâyet açıklamasını yazdığında AI arka planda metni analiz ederek uygun **Başlık, Sorumlu Müdürlük, Kategori ve Aciliyet Seviyesini** forma otomatik doldurur.
- **Duygu ve Moderasyon Analizi**: Metinlerdeki hakaret veya uygunsuz içerikleri tespit eder.

### 🗺️ 2. Harita Analizi & Konumsal Dağılım (Leaflet GIS)
- **Dual-Mode Renklendirme Mantığı**:
  - *Varsayılan Mod*: Çözülmemiş / aktif talepleri aciliyet derecesine göre renklendirir (🔴 Acil, 🟡 Normal, ⚫ Düşük).
  - *Durum Modu*: Tüm talepleri aşamalarına göre renklendirir (🔵 Yeni, 🟠 İşlemde / Atandı, 🟢 Çözüldü / Arşiv).
- **📍 HTML5 Geolocation & Geofencing**:
  - *"Mevcut Konumumu Kullan"* butonu ile cihazın enlem/boylamını otomatik alır.
  - Sıkı Geofencing denetimi ile Bulancak ilçe sınırları dışındaki koordinatları uyararak manuel seçime yönlendirir.
  - Reverse Geocoding ile sokak ve kapı numarası seviyesinde açık adresi ve en yakın mahalleyi otomatik seçer.

### 🔔 3. Canlı Cihaz Bildirimleri (Web Push API) & Belediye Duyuru Bandı
- **Web Notification API**: Talep durumu *"Personele Atandı"* veya *"Çözüldü"* yapıldığında vatandaşa anlık cihaz bildirimi fırlatılır. Bildirime tıklandığında doğrudan ilgili talebin detay penceresi açılır.
- **Duyuru Bandı (Marquee Banner)**: Harita Analizi ekranının üstünde belediye tarafından yayınlanan önemli ve acil duyurular kayan bant şeklinde yer alır.

### 🏛️ 4. Kurumsal Hiyerarşi ve Rol Tabanlı Yetkilendirme (RBAC)
- **Roller**: Sistem Yöneticisi, Belediye Başkanı, Belediye Başkan Yardımcıları (1. & 2. Bölge), Birim Müdürleri, Saha Personelleri ve Vatandaşlar.
- **Dinamik Sevk ve Görev Atama**: Yanlış birime açılan talepler ilgili müdürlüğe gerekçesiyle sevk edilir; müdürler kendi saha ekiplerine iş emri ve talimat atayabilir.
- **Saha Çözüm Raporu**: Personeller çözüm açıklaması, kullanılan ekipman bilgisi ve **fotoğraf kanıtı** ile talebi çözüme kavuşturur.

### ⭐ 5. Vatandaş Memnuniyet Anketi & Çözüm Arşivi
- Çözülen talepler için vatandaşlar 1-5 yıldız ve yazılı yorum bırakabilir.
- Puanlar yalnızca gerçek vatandaş oyları ile hesaplanır ve şeffaf Çözüm Arşivinde yayınlanır.

---

## 🛠️ Kullanılan Teknolojiler

- **Backend**: Node.js, Express.js, MySQL (mysql2), JSON State Engine (Otomatik Fallback), JWT, Bcrypt, Multer, Cors.
- **Frontend**: Vanilla Modern JavaScript (SPA Mimarisi), Leaflet.js, OpenStreetMap, Chart.js, SweetAlert2, FontAwesome 6, Modern CSS Design Tokens.
- **DevOps**: Docker, Docker Compose, Nginx Ready.
.
---

## 🚀 Kurulum ve Çalıştırma

### Yöntem 1: Docker Compose ile Hızlı Kurulum (Önerilen)

Projeyi Docker ortamında tek komutla ayağa kaldırabilirsiniz:

```bash
# 1. Projeyi klonlayın
git clone <repository_url>
cd belediye-talep

# 2. Docker container'larını başlatın
docker-compose up --build
```

- **Web Arayüzü**: `http://localhost:3000`
- **MySQL Veritabanı Portu**: `localhost:3306`

---

### Yöntem 2: Manuel Yerel Kurulum (Node.js & MySQL)

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Ortam değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını kendi veritabanı şifrenize göre düzenleyin

# 3. Veritabanını içe aktarın (MySQL)
mysql -u root -p belediye_talep_db < database.sql

# 4. Sunucuyu başlatın
npm start
# Geliştirme modu için: npm run dev
```

---

## 🔑 Varsayılan Demo Giriş Hesapları

Tüm test hesaplarının şifresi: `123456`

| Rol | Kullanıcı Adı | E-posta | Şifre |
|---|---|---|---|
| 👑 **Sistem Yöneticisi (Admin)** | Ahmet Yılmaz | `admin@belediye.gov.tr` | `123456` |
| 🏛️ **Belediye Başkanı** | Recep Yakar | `baskan@belediye.gov.tr` | `123456` |
| 🎖️ **Başkan Yardımcısı (Teknik)** | Emre Yılmaz | `byrd.teknik@belediye.gov.tr` | `123456` |
| 🎖️ **Başkan Yardımcısı (İdari)** | Selim Kaya | `byrd.idari@belediye.gov.tr` | `123456` |
| 📋 **Fen İşleri Müdürü** | Mehmet Demir | `fenisleri.mudur@belediye.gov.tr` | `123456` |
| 📋 **Temizlik İşleri Müdürü** | Ayşe Yılmaz | `temizlik.mudur@belediye.gov.tr` | `123456` |
| 👷 **Fen İşleri Saha Ekibi** | Ali Usta | `ali.fen@belediye.gov.tr` | `123456` |
| 👷 **Temizlik Saha Ekibi** | Veli Çelik | `veli.temizlik@belediye.gov.tr` | `123456` |
| 👤 **Vatandaş** | Caner Özkan | `caner@gmail.com` | `123456` |
| 👤 **Vatandaş** | Sefa Bodur | `sefa@gmail.com` | `123456` |

---

## 📂 Proje Dizin Yapısı

```text
├── config/             # Veritabanı bağlantı havuzu ve senkronizasyon motoru
├── data/               # Fiziksel JSON veritabanı yedeği (db.json)
├── database/           # Veritabanı şeması ve başlangıç scriptleri
├── database.sql        # Tam MySQL DDL & DML SQL Dump dosyası
├── middleware/         # JWT Kimlik doğrulama, Rol kontrolü ve Güvenlik katmanı
├── public/             # SPA Frontend dosyaları (HTML, CSS, JS, Harita motoru)
├── routes/             # REST API uç noktaları (Talepler, Atamalar, Kullanıcılar, AI vb.)
├── .env.example        # Örnek ortam değişkenleri şablonu
├── .gitignore          # Git tarafından yoksayılacak dosyalar
├── docker-compose.yml  # Docker Compose orkestrasyon konfigürasyonu
├── Dockerfile          # Uygulama Docker imaj tanımı
├── package.json        # Proje bağımlılıkları ve npm scriptleri
├── server.js           # Express API sunucu giriş noktası
└── README.md           # Proje dokümantasyonu
```

---

