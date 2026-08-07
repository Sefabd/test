# Belediye Talep ve Akıllı Şikâyet Yönetim Sistemi 🏛️🤖

Yebsoft Yazılım Stajyeri Proje Görevi (Proje 1) kapsamında geliştirilmiş; vatandaşların belediye hizmetleriyle ilgili talep ve şikâyetlerini çevrim içi iletebildiği, Yapay Zekâ (AI) destekli akıllı sınıflandırma ve önceliklendirme sunan, birim ve personel ataması ile harita/grafik tabanlı canlı takibin yapıldığı kurumsal web sistemidir.

---

## 🌟 Öne Çıkan Özellikler

- **🤖 Akıllı Şikâyet Analizi (Yapay Zekâ Modülü)**:
  - Metin içerisindeki doğal dil kalıplarına göre otomatik **kategori ve sorumlu müdürlük önerisi**.
  - **Öncelik ve aciliyet seviyesi tahmini** (Kritik, Acil, Yüksek, Normal, Düşük).
  - **Duygu analizi** ve hakaret/uygunsuz metin denetimi (Content Moderation).
  - **Mükerrer Şikâyet Tespiti (Duplicate Check)**: Aynı mahalledeki benzer açık şikâyetleri uyarma.
  - Anlaşılır otomatik **metin özetleme**.

- **📱 Vatandaş Portalı & Canlı Takip Kodu**:
  - `BLD-2026-XXXXXX` formatında benzersiz takip numarası üretimi.
  - Harita üzerinden konum seçebilme (Leaflet / OpenStreetMap).
  - Fotoğraf / Belge yükleme.
  - Çözülen talebi **1-5 yıldız ve yorum ile değerlendirebilme**.

- **👔 Birim Yöneticisi & Personel Modülü**:
  - 10 varsayılan belediye müdürlüğü (Fen İşleri, Temizlik, Park-Bahçe, Zabıta, Su-Kanalizasyon, Veteriner vb.).
  - Personele görev atama, hedef son işlem tarihi belirleme.
  - Personel çözüm kaydı oluşturma ve **çözüm fotoğrafı yükleme**.

- **🗺️ İnteraktif Harita & 📊 Chart.js Dashboard**:
  - Leaflet ile renk kodlu talep pinleri ve kümeleme/ısı haritası.
  - Chart.js ile dinamik aylık trendler, kategori dağılımı, müdürlük performansları ve mahalle yoğunluğu.

- **🛡️ Güvenlik & Mimari**:
  - 16 ilişkisel tablo ve Foreign Key bütünlüğü.
  - Bcrypt şifreleme, JWT & RBAC rol yetkilendirmeleri.
  - SQL Injection önleme (Prepared Statements) ve XSS temizleme.
  - Dosya türü ve boyut güvenlik denetimleri.
  - Audit logging (Denetim izi kaydı).

---

## 🚀 Hızlı Kurulum (Docker Compose)

Projede Docker desteği tam yapılandırılmıştır:

```bash
# 1. Depoyu klonlayın veya dizine gidin
cd belediye-talep

# 2. Docker servisini tek komutla başlatın
docker-compose up --build
```

Sistem ayağa kalktığında:
- Web Uygulaması: `http://localhost:3000`
- MySQL Veritabanı: `localhost:3306`

---

## 🔑 Test Kullanıcı Hesapları (Şifreler: 123456)

| Rol | E-posta | Şifre |
|---|---|---|
| **Sistem Yöneticisi (Admin)** | `admin@belediye.gov.tr` | `123456` |
| **Fen İşleri Müdürü** | `fenisleri.mudur@belediye.gov.tr` | `123456` |
| **Temizlik İşleri Müdürü** | `temizlik.mudur@belediye.gov.tr` | `123456` |
| **Fen İşleri Saha Personeli** | `ali.fen@belediye.gov.tr` | `123456` |
| **Temizlik Saha Personeli** | `veli.temizlik@belediye.gov.tr` | `123456` |
| **Vatandaş** | `caner@gmail.com` | `123456` |

---

## 📚 Dokümantasyonlar

- [Kurulum Rehberi](DOCS/KURULUM.md)
- [Kullanım Kılavuzu](DOCS/KULLANIM_KILAVUZU.md)
- [Test Kullanıcıları](DOCS/TEST_KULLANICILARI.md)
- [ER Diyagramı ve Veritabanı Mimarisi](DOCS/ER_DIAGRAM.md)
