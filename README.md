# 🍲 Haftalık Akşam Yemeği Planı (Anne Dostu & GitHub Pages)

Annelerin cep telefonundan tek dokunuşla rahatça açıp okuyabileceği; büyük fontlu, sade, her hafta kendi kendine güncellenen ve **Pazar günleri Türkiye saatiyle 17:00'de Telegram bildirimi gönderen** web uygulaması.

Bu proje **Firebase gerektirmez**. Tamamen ücretsiz ve sunucusuz olarak **GitHub Pages + GitHub Actions + Telegram Bot API** ile çalışır.

---

## 🌟 Proje Özellikleri

- **Anne Dostu Arayüz:** Yüksek kontrastlı, göz yormayan, sade ve büyük fontlar. Tek tıkla yazı boyutu değiştirme (Normal, Büyük, Çok Büyük).
- **Yemek Kuralları:**
  - **Domates çorbası kesinlikle menüde yer almaz.**
  - **Cumartesi günü ana yemek mutlaka balıktır** (fırında çipura, levrek, somon vb.).
  - **Pazartesi, Çarşamba, Cuma, Pazar:** Etsiz, kıymasız ve et/tavuk susuz zeytinyağlı sebze ve tencere yemekleri.
  - **Salı ve Perşembe:** Kolay et veya tavuk yemekleri.
  - **Pilav, makarna, erişte ve bulgur** yalnızca yan yemektir; her gün verilmez, ardışık tekrarlanmaz.
  - Şehriye çorbası + erişte/şehriyeli pilav, patatesli yemek + patates püresi, yoğurtlu çorba + cacık gibi gereksiz çakışmalar engellenir.
- **Yazıcı (A4) Uyumluluğu:** "Yazdır" butonuna basıldığında butonlar otomatik gizlenir ve menü tek bir A4 sayfasına sığacak şekilde çıkar.
- **Otomatik Zamanlayıcı:** GitHub Actions her Pazar 14:00 UTC (Türkiye Saati ile 17:00) çalışarak yeni haftanın `plan.json` dosyasını oluşturur, repoya commit eder ve Telegram'a linki gönderir.

---

## 📁 Dosya Yapısı

```text
├── index.html                           # Anne dostu tek sayfalık HTML arayüzü
├── style.css                            # Yüksek kontrastlı, mobil ve tek sayfa A4 baskı stilleri
├── app.js                               # plan.json yükleyici, bugünün gününü vurgulama ve kontroller
├── plan.json                            # 7 günlük güncel akşam yemeği menü verisi
├── scripts/
│   └── generate-plan.js                 # Kurallara tam uyumlu menü üretici ve bildirim scripti
├── .github/
│   └── workflows/
│       └── update-weekly-plan.yml       # Her Pazar 17:00 TSİ çalışan GitHub Actions iş akışı
└── README.md                            # Adım adım kurulum ve kullanım kılavuzu
```

---

## 🚀 Adım Adım Kurulum Rehberi

### 1. GitHub Reposu Nasıl Oluşturulur?

1. [github.com](https://github.com) adresine gidin ve hesabınıza giriş yapın.
2. Sağ üst köşedeki **`+`** simgesine tıklayıp **"New repository"** seçeneğini seçin.
3. Repoya bir isim verin (Örneğin: `aksam-yemegi-plani`).
4. Repoyu **Public** (Herkese Açık) olarak belirleyin (Ücretsiz GitHub Pages için repository Public olmalıdır).
5. **"Create repository"** butonuna tıklayın.
6. Bu projedeki tüm dosyaları (`index.html`, `style.css`, `app.js`, `plan.json`, `scripts/`, `.github/` vb.) ana dizinde olacak şekilde yeni reponuza yükleyin:
   ```bash
   git init
   git add .
   git commit -m "İlk sürüm: Haftalık akşam yemeği planı"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/aksam-yemegi-plani.git
   git push -u origin main
   ```

---

### 2. GitHub Pages Nasıl Açılır?

1. GitHub'da oluşturduğunuz reponun sayfasına gidin.
2. Üst menüdeki **Settings** (Ayarlar) sekmesine tıklayın.
3. Sol taraftaki menüden **Pages** seçeneğine tıklayın.
4. **"Build and deployment"** başlığı altındaki **Source** kısmında:
   - **Deploy from a branch** seçili olsun.
   - **Branch** olarak `main` ve klasör olarak `/(root)` seçin.
5. **Save** butonuna tıklayın.
6. 1-2 dakika sonra sayfanın en üstünde yayınlanan adres görünecektir:
   ```
   https://KULLANICI_ADINIZ.github.io/aksam-yemegi-plani/
   ```
   *Tebrikler! Web siteniz artık canlıda ve telefondan açılabilir.*

---

### 3. Telegram Bot Nasıl Oluşturulur?

1. Telefonunuzda veya bilgisayarınızda **Telegram** uygulamasını açın.
2. Arama kutusuna `@BotFather` yazın ve mavi onay rozetli resmi **BotFather** hesabını açın.
3. **Başlat** (`/start`) butonuna basın.
4. Mesaj olarak `/newbot` yazıp gönderin.
5. Bot için görünen bir isim girin (Örn: `Annemin Yemek Menusu`).
6. Bot için sonu `bot` ile biten benzersiz bir kullanıcı adı belirleyin (Örn: `annemin_yemek_plani_bot`).

---

### 4. TELEGRAM_BOT_TOKEN Nasıl Alınır?

Bot başarıyla oluşturulduğunda BotFather size tebrik mesajı ile birlikte uzun bir API token verecektir.
Mesaj şuna benzer:
```
Use this token to access the HTTP API:
7123456789:AAFlkjhsdf89sdfh_kjsdf98sdf-kjhsdf
```
Bu değer sizin `TELEGRAM_BOT_TOKEN` değerinizdir. Bunu bir yere kopyalayın ve kimseyle paylaşmayın.

---

### 5. TELEGRAM_CHAT_ID Nasıl Bulunur?

Botun size veya annenize bildirim atabilmesi için Telegram Sohbet Kimliğinizi (Chat ID) öğrenmeniz gerekir:

1. Az önce oluşturduğunuz botun linkine tıklayarak bota gidin (veya Telegram aramasında bot kullanıcı adınızı bulun).
2. Bot penceresinde **Başlat** (`/start`) butonuna basın veya bota bir mesaj (örn: `merhaba`) yazın *(Bota ilk mesajı atmak zorunludur)*.
3. Şimdi Telegram arama kutusuna `@userinfobot` veya `@getmyid_bot` yazın ve açıp **Başlat**'a basın.
4. Bot size anında `Id: 123456789` şeklinde rakamlardan oluşan kimliğinizi gönderecektir.
5. Buradaki rakamlar (örn: `123456789`) sizin `TELEGRAM_CHAT_ID` değerinizdir.

*(İpucu: Eğer bir aile grubu kurup botu gruba eklerseniz, bildirim tüm aileye gidecektir).*

---

### 6. Bu Değerler GitHub Secrets'a Nasıl Eklenir?

Bot token'ınızın repoda açıkça görünmemesi ve güvenli kalması için bu bilgileri GitHub Secrets'a kaydediyoruz:

1. GitHub'da reponuzun sayfasına gidin.
2. **Settings** (Ayarlar) > Sol menüden **Secrets and variables** > **Actions** seçeneğine tıklayın.
3. Yeşil **"New repository secret"** butonuna tıklayın:
   - **Name:** `TELEGRAM_BOT_TOKEN`
   - **Secret:** BotFather'dan aldığınız token'ı yapıştırın.
   - **Add secret** butonuna basın.
4. Tekrar **"New repository secret"** butonuna tıklayın:
   - **Name:** `TELEGRAM_CHAT_ID`
   - **Secret:** Az önce öğrendiğiniz sayısal Chat ID'nizi yapıştırın (örn: `123456789`).
   - **Add secret** butonuna basın.

---

### 7. GitHub Actions Workflow Nasıl Çalışır?

`.github/workflows/update-weekly-plan.yml` dosyası içerisinde şu cron tanımlıdır:

```yaml
on:
  schedule:
    # Her Pazar UTC 14:00 = Türkiye Saati (TSİ) 17:00
    - cron: '0 14 * * 0'
```

- Türkiye `UTC+3` saat diliminde olduğu için UTC saat 14:00, tam olarak **Türkiye saati ile 17:00**'ye denk gelir.
- Her Pazar 17:00 olduğunda GitHub sunucuları otomatik uyanır:
  1. Depoyu klonlar.
  2. `node scripts/generate-plan.js` komutunu çalıştırır.
  3. Yeni haftanın Pazartesi-Pazar menüsünü kurallara göre üretip `plan.json` dosyasına yazar.
  4. Değişikliği otomatik commit edip GitHub Pages'e pushlar.
  5. Telegram botu üzerinden kayıtlı Chat ID'ye şu mesajı gönderir:
     > `Haftalık akşam yemeği planı hazır: https://KULLANICI_ADINIZ.github.io/aksam-yemegi-plani/`

---

### 8. Manuel Test Nasıl Yapılır?

Pazar gününü beklemeden sistemin çalıştığını ve Telegram mesajının geldiğini hemen test edebilirsiniz:

1. GitHub reponuzda üstteki **Actions** sekmesine tıklayın.
2. Sol taraftaki menüden **"Haftalık Akşam Yemeği Planını Güncelle"** iş akışına tıklayın.
3. Sağ tarafta görünen **"Run workflow"** açılır menüsüne tıklayın ve yeşil **"Run workflow"** butonuna basın.
4. Yaklaşık 30-45 saniye içinde iş akışı yeşil onay işareti (`✓`) ile tamamlanacaktır.
5. Telegram uygulamanızı kontrol edin; yeni menü bildirimi mesaj kutunuza düşmüş olacaktır!

---

### 9. Uygulama Linki Anneyle Nasıl Paylaşılır?

1. **WhatsApp veya SMS ile Gönderin:**
   - GitHub Pages linkinizi annenize mesaj atın:
     `https://KULLANICI_ADINIZ.github.io/aksam-yemegi-plani/`
2. **Annenizin Telefonunda "Ana Ekrana Ekle" Yapın (Tavsiye Edilen):**
   - **iPhone (Safari):**
     1. Linki Safari'de açın.
     2. Alt bardaki **Paylaş** (kare içinde yukarı ok) butonuna dokunun.
     3. Aşağı kaydırıp **"Ana Ekrana Ekle"** seçeneğine dokunun.
     4. Sağ üstteki **"Ekle"** butonuna basın.
   - **Android (Chrome):**
     1. Linki Chrome'da açın.
     2. Sağ üstteki üç nokta menüsüne dokunun.
     3. **"Ana ekrana ekle"** veya **"Uygulamayı yükle"** seçeneğine dokunun.
3. **Sonuç:**
   - Annenizin telefonunun ana ekranına tıpkı normal bir mobil uygulama gibi bir simge yerleşir.
   - Anne her gün tek dokunuşla akşam ne pişireceğini büyük, okunaklı yazılarla görür.
   - İsterse üstteki **"Yazdır"** butonuyla mutfak panosu veya buzdolabı kapağı için tek sayfa A4 kağıda çıktısını alabilir.
