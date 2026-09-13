/**
 * Haftalık Akşam Yemeği Planı Üretici Scripti
 * Türkiye Saati (Europe/Istanbul) kurallarına göre her Pazar saat 17:00'de
 * GitHub Actions tarafından tetiklenir veya yerel olarak 'node scripts/generate-plan.js' ile çalıştırılır.
 * 
 * Bağımlılık gerektirmez (Standart Node.js fs, path, https modülleri kullanır).
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------
// 1. YEMEK HAVUZLARI
// -------------------------------------------------------------
// KURAL: Domates çorbası KESİNLİKLE kullanılmaz.
export const SOUPS = [
  { name: 'Mercimek çorbası', hasLegume: true },
  { name: 'Yayla çorbası', hasYogurt: true },
  { name: 'Ezogelin çorbası', hasLegume: true },
  { name: 'Tarhana çorbası' },
  { name: 'Tel şehriye çorbası', hasShehriye: true },
  { name: 'Sebze çorbası' },
  { name: 'Yoğurt çorbası', hasYogurt: true },
  { name: 'Düğün çorbası', rare: true }
];

// KURAL: Sebze günlerinde kıyma, et, tavuk, et suyu veya tavuk suyu KULLANILMAZ.
export const VEGGIE_MAINS = [
  { name: 'Zeytinyağlı taze fasulye' },
  { name: 'Kabak yemeği' },
  { name: 'Pırasa yemeği' },
  { name: 'Sebzeli türlü' },
  { name: 'Ispanak yemeği' },
  { name: 'Karnabahar yemeği' },
  { name: 'Nohutlu sebze yemeği', hasLegume: true },
  { name: 'Zeytinyağlı barbunya pilaki', hasLegume: true },
  { name: 'Bezelye yemeği', hasPotato: true },
  { name: 'Patlıcan yemeği' }
];

// Salı ve Perşembe: Kolay et veya tavuk yemekleri
export const MEAT_MAINS = [
  { name: 'Tavuk sote', isChicken: true },
  { name: 'Fırında tavuk', isChicken: true, hasPotato: true },
  { name: 'Tavuk haşlama', isChicken: true },
  { name: 'Fırında köfte', isChicken: false },
  { name: 'İzmir köfte', isChicken: false, hasPotato: true },
  { name: 'Etli nohut', isChicken: false, hasLegume: true },
  { name: 'Etli kuru fasulye', isChicken: false, hasLegume: true },
  { name: 'Tas kebabı', isChicken: false, hasPotato: true },
  { name: 'Sebzeli tavuk', isChicken: true }
];

// KURAL: Cumartesi günü mutlaka balık (kolay, mevsime uygun, fırında veya ızgara)
export const FISH_MAINS = [
  { name: 'Fırında çipura' },
  { name: 'Izgara balık' },
  { name: 'Buğulama levrek' },
  { name: 'Fırında somon' },
  { name: 'Fırında levrek' }
];

// KURAL: Pilav, makarna, erişte ve bulgur SADECE yan yemek olarak kullanılır.
export const SIDES = [
  { name: 'Bulgur pilavı', isCarb: true },
  { name: 'Pirinç pilavı', isCarb: true },
  { name: 'Erişte', isCarb: true, hasShehriye: true },
  { name: 'Makarna', isCarb: true },
  { name: 'Cacık', hasYogurt: true },
  { name: 'Mevsim salatası' },
  { name: 'Roka salatası' },
  { name: 'Havuç tarator', hasYogurt: true },
  { name: 'Kase yoğurt', hasYogurt: true },
  { name: 'Patates püresi', hasPotato: true },
  { name: 'Fırın sebze' },
  { name: 'Haşlanmış sebze' }
];

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// -------------------------------------------------------------
// 2. YARDIMCI TARİH FONKSİYONLARI (Europe/Istanbul)
// -------------------------------------------------------------
export function getIstanbulDate() {
  const now = new Date();
  const istanbulString = now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' });
  return new Date(istanbulString);
}

export function formatDateISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getNextMonday(currentDate) {
  const dayOfWeek = currentDate.getDay(); // 0: Pazar, 1: Pazartesi ...
  let diffToMonday = 1;
  if (dayOfWeek === 0) {
    // Pazar günü -> Yarın Pazartesi (+1 gün)
    diffToMonday = 1;
  } else if (dayOfWeek === 1) {
    // Bugün zaten Pazartesi ise bu haftanın Pazartesi günü
    diffToMonday = 0;
  } else {
    // Hafta ortasında çalıştırılırsa gelecek Pazartesiye geç
    diffToMonday = 8 - dayOfWeek;
  }

  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMonday);
  return monday;
}

export function formatWeekTitle(startISO, endISO) {
  const [sy, sm, sd] = startISO.split('-').map(Number);
  const [ey, em, ed] = endISO.split('-').map(Number);

  const startMonthName = TURKISH_MONTHS[sm - 1];
  const endMonthName = TURKISH_MONTHS[em - 1];

  if (sm === em) {
    return `${sd} - ${ed} ${endMonthName} Haftası Akşam Yemeği Planı`;
  }
  return `${sd} ${startMonthName} - ${ed} ${endMonthName} Haftası Akşam Yemeği Planı`;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// -------------------------------------------------------------
// 3. PLAN ÜRETME ALGORİTMASI (Kurallara Tam Uyumlu)
// -------------------------------------------------------------
export function generateNewWeeklyPlan(previousPlan = null) {
  const nowIst = getIstanbulDate();
  const nextMonday = getNextMonday(nowIst);

  const sunday = new Date(nextMonday);
  sunday.setDate(nextMonday.getDate() + 6);

  const weekStart = formatDateISO(nextMonday);
  const weekEnd = formatDateISO(sunday);

  // Önceki haftanın yemeklerini hafızaya alalım (birebir tekrarı engellemek için)
  const prevMains = new Set();
  const prevSoups = new Set();
  if (previousPlan && Array.isArray(previousPlan.days)) {
    previousPlan.days.forEach(d => {
      if (d.main) prevMains.add(d.main);
      if (d.soup) prevSoups.add(d.soup);
    });
  }

  // 1. ÇORBA SEÇİMİ: 7 gün için 7 farklı çorba (domates çorbası yok)
  // Önceki hafta çıkmayan çorbalara öncelik ver
  let candidateSoups = shuffle(SOUPS.filter(s => !s.rare || Math.random() > 0.6));
  candidateSoups.sort((a, b) => {
    const aUsed = prevSoups.has(a.name) ? 1 : 0;
    const bUsed = prevSoups.has(b.name) ? 1 : 0;
    return aUsed - bUsed;
  });
  const weekSoups = candidateSoups.slice(0, 7);

  // 2. SEBZE YEMEKLERİ: 4 adet (Pazartesi, Çarşamba, Cuma, Pazar)
  let candidateVegs = shuffle(VEGGIE_MAINS);
  candidateVegs.sort((a, b) => (prevMains.has(a.name) ? 1 : 0) - (prevMains.has(b.name) ? 1 : 0));
  const chosenVegs = candidateVegs.slice(0, 4);

  // 3. ET / TAVUK YEMEKLERİ: 2 adet (Salı ve Perşembe) - Biri tavuk, biri et
  const chickens = shuffle(MEAT_MAINS.filter(m => m.isChicken));
  const meats = shuffle(MEAT_MAINS.filter(m => !m.isChicken));
  chickens.sort((a, b) => (prevMains.has(a.name) ? 1 : 0) - (prevMains.has(b.name) ? 1 : 0));
  meats.sort((a, b) => (prevMains.has(a.name) ? 1 : 0) - (prevMains.has(b.name) ? 1 : 0));

  const chosenChicken = chickens[0];
  const chosenMeat = meats[0];
  const meatPair = Math.random() > 0.5 ? [chosenChicken, chosenMeat] : [chosenMeat, chosenChicken];

  // 4. BALIK: Cumartesi günü
  let candidateFish = shuffle(FISH_MAINS);
  candidateFish.sort((a, b) => (prevMains.has(a.name) ? 1 : 0) - (prevMains.has(b.name) ? 1 : 0));
  const chosenFish = candidateFish[0];

  const daysTemplate = [
    { day: 'Pazartesi', type: 'sebze', typeLabel: 'Sebze Günü', main: chosenVegs[0] },
    { day: 'Salı', type: 'et_tavuk', typeLabel: 'Et/Tavuk Günü', main: meatPair[0] },
    { day: 'Çarşamba', type: 'sebze', typeLabel: 'Sebze Günü', main: chosenVegs[1] },
    { day: 'Perşembe', type: 'et_tavuk', typeLabel: 'Et/Tavuk Günü', main: meatPair[1] },
    { day: 'Cuma', type: 'sebze', typeLabel: 'Sebze Günü', main: chosenVegs[2] },
    { day: 'Cumartesi', type: 'balik', typeLabel: 'Balık Günü', main: chosenFish },
    { day: 'Pazar', type: 'sebze', typeLabel: 'Sebze Günü', main: chosenVegs[3] },
  ];

  const days = [];
  let carbCount = 0;
  let prevWasCarb = false;
  const usedSides = [];

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(nextMonday);
    curDate.setDate(nextMonday.getDate() + i);

    const tpl = daysTemplate[i];
    const soup = weekSoups[i];
    const main = tpl.main;

    // Yan yemek seçimi (Pilav/makarna kuralları ve çakışma kontrolleri)
    const shuffledSides = shuffle(SIDES);
    let chosenSide = shuffledSides[0];

    for (const side of shuffledSides) {
      // ÇAKIŞMA 1: Patatesli ana yemek + patates püresi olamaz
      if (main.hasPotato && side.hasPotato) continue;

      // ÇAKIŞMA 2: Şehriye çorbası + şehriyeli pilav/erişte olamaz
      if (soup.hasShehriye && side.hasShehriye) continue;

      // ÇAKIŞMA 3: Yoğurtlu çorba + cacık/yoğurt olamaz
      if (soup.hasYogurt && side.hasYogurt) continue;

      // ÇAKIŞMA 4: Balık yanında pilav/makarna yerine salata tercih edilir
      if (tpl.type === 'balik' && side.isCarb) continue;

      // KURAL: Pilav/makarna sıklığı (üst üste olmasın, haftada en fazla 3 kez)
      if (side.isCarb) {
        if (prevWasCarb) continue;
        if (carbCount >= 3) continue;
      }

      // KURAL: Yan yemek hafta içinde 2 defadan fazla tekrar etmesin
      const timesUsed = usedSides.filter(s => s === side.name).length;
      if (timesUsed >= 2) continue;

      chosenSide = side;
      break;
    }

    if (chosenSide.isCarb) {
      carbCount++;
      prevWasCarb = true;
    } else {
      prevWasCarb = false;
    }
    usedSides.push(chosenSide.name);

    days.push({
      day: tpl.day,
      date: formatDateISO(curDate),
      type: tpl.type,
      typeLabel: tpl.typeLabel,
      soup: soup.name,
      main: main.name,
      side: chosenSide.name,
    });
  }

  const nowIsoString = new Date().toISOString();

  return {
    weekStart,
    weekEnd,
    title: formatWeekTitle(weekStart, weekEnd),
    updatedAt: nowIsoString,
    timezone: 'Europe/Istanbul',
    days,
  };
}

// -------------------------------------------------------------
// 4. TELEGRAM BİLDİRİMİ GÖNDERME FONKSİYONU
// -------------------------------------------------------------
export function sendTelegramMessage(botToken, chatId, messageText) {
  return new Promise((resolve) => {
    if (!botToken || !chatId) {
      console.log('ℹ️ Telegram bot token veya chat ID bulunamadı, bildirim atlanıyor.');
      return resolve(null);
    }

    const payload = JSON.stringify({
      chat_id: chatId,
      text: messageText,
      disable_web_page_preview: false,
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.ok) {
            console.log('✅ Telegram bildirimi başarıyla gönderildi!');
            resolve(parsed);
          } else {
            console.error('❌ Telegram API hatası:', parsed.description);
            resolve(parsed);
          }
        } catch (e) {
          console.error('❌ Telegram yanıtı ayrıştırılamadı:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Telegram isteği başarısız:', err.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

// -------------------------------------------------------------
// 5. ANA ÇALIŞTIRMA AKIŞI
// -------------------------------------------------------------
async function main() {
  console.log('🚀 Haftalık akşam yemeği planı oluşturuluyor...');

  const rootDir = path.resolve(__dirname, '..');
  const planJsonPath = path.join(rootDir, 'plan.json');
  const publicPlanJsonPath = path.join(rootDir, 'public', 'plan.json');

  let existingPlan = null;
  try {
    if (fs.existsSync(planJsonPath)) {
      const raw = fs.readFileSync(planJsonPath, 'utf-8');
      existingPlan = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('⚠️ Mevcut plan.json okunamadı, sıfırdan üretiliyor.');
  }

  const newPlan = generateNewWeeklyPlan(existingPlan);

  // plan.json dosyasına yaz
  fs.writeFileSync(planJsonPath, JSON.stringify(newPlan, null, 2) + '\n', 'utf-8');
  console.log(`✅ plan.json başarıyla güncellendi: ${newPlan.title}`);

  // public/plan.json varsa onu da eşitle
  try {
    const publicDir = path.join(rootDir, 'public');
    if (fs.existsSync(publicDir)) {
      fs.writeFileSync(publicPlanJsonPath, JSON.stringify(newPlan, null, 2) + '\n', 'utf-8');
    }
  } catch (e) {
    // public klasörü yoksa sorun değil
  }

  // Telegram Bildirimi Kontrolü
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const pagesUrl = process.env.GITHUB_PAGES_URL || 'https://tryst-issues.github.io/aksam-yemegi-plani/';

  if (botToken && chatId) {
    const message = `Haftalık akşam yemeği planı hazır: ${pagesUrl}`;
    await sendTelegramMessage(botToken, chatId, message);
  }
}

// Doğrudan çalıştırıldığında main() fonksiyonunu çağır
if (process.argv[1] === __filename) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
