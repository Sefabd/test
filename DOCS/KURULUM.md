# Kurulum Rehberi ⚙️

Belediye Talep ve Akıllı Şikâyet Yönetim Sistemi iki farklı yöntemle çalıştırılabilir:

---

## 🐳 Yöntem 1: Docker Compose ile Otomatik Kurulum (Önerilen)

Sistemi Docker konteyner yapısında tek komutla çalıştırmak için:

### Ön Gereksinimler:
- Docker Desktop kurulu ve çalışır durumda olmalıdır.

### Adımlar:
1. Terminalde proje ana dizinine gelin:
   ```bash
   cd belediye-talep
   ```
2. Docker servislerini derleyin ve başlatın:
   ```bash
   docker-compose up --build
   ```
3. Tarayıcınızdan `http://localhost:3000` adresine gidin.

---

## 💻 Yöntem 2: Yerel (Local Node.js & MySQL) Kurulum

### Ön Gereksinimler:
- Node.js (v18+)
- MySQL Server (v8.0+)

### Adımlar:
1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env` dosyasını oluşturun ve veritabanı bilgilerinizi girin:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sifreniz
   DB_NAME=belediye_talep_db
   JWT_SECRET=super_secret_key_2026
   ```

3. Veritabanını seed verileri ile doldurun:
   ```bash
   npm run seed
   ```

4. Uygulamayı başlatın:
   ```bash
   npm run dev
   # veya
   npm start
   ```

5. `http://localhost:3000` adresi üzerinden erişin.
