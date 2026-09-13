/**
 * Haftalık Akşam Yemeği Planı - İstemci Mantığı
 * plan.json dosyasını yükler, bugünün gününü Türkiye saatine göre belirler
 * ve sade, büyük fontlu anne dostu arayüzü çizer.
 */

// Yedek Plan (plan.json erişilemezse veya çevrimdışı açılırsa devreye girer)
const FALLBACK_PLAN = {
  title: "Haftalık Akşam Yemeği Planı",
  days: [
    {
      day: "Pazartesi",
      date: "2026-09-14",
      type: "sebze",
      typeLabel: "Sebze Günü",
      soup: "Mercimek çorbası",
      main: "Zeytinyağlı taze fasulye",
      side: "Bulgur pilavı"
    },
    {
      day: "Salı",
      date: "2026-09-15",
      type: "et_tavuk",
      typeLabel: "Tavuk Yemeği",
      soup: "Tarhana çorbası",
      main: "Tavuk sote",
      side: "Pirinç pilavı"
    },
    {
      day: "Çarşamba",
      date: "2026-09-16",
      type: "sebze",
      typeLabel: "Sebze Günü",
      soup: "Yayla çorbası",
      main: "Zeytinyağlı kabak yemeği",
      side: "Fırın patates"
    },
    {
      day: "Perşembe",
      date: "2026-09-17",
      type: "et_tavuk",
      typeLabel: "Et Yemeği",
      soup: "Ezogelin çorbası",
      main: "Fırında köfte",
      side: "Mevsim salatası"
    },
    {
      day: "Cuma",
      date: "2026-09-18",
      type: "sebze",
      typeLabel: "Sebze Günü",
      soup: "Sebze çorbası",
      main: "Barbunya pilaki",
      side: "Cacık"
    },
    {
      day: "Cumartesi",
      date: "2026-09-19",
      type: "balik",
      typeLabel: "Balık Günü",
      soup: "Tel şehriye çorbası",
      main: "Fırında çipura",
      side: "Roka salatası"
    },
    {
      day: "Pazar",
      date: "2026-09-20",
      type: "sebze",
      typeLabel: "Sebze Günü",
      soup: "Yoğurt çorbası",
      main: "Sebzeli türlü",
      side: "Erişte"
    }
  ]
};

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

/**
 * Türkiye saatine (Europe/Istanbul) göre bugünün YYYY-MM-DD tarihini döndürür.
 */
function getTodayIstanbulISO() {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch (e) {
    // Eski tarayıcı desteği
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

/**
 * ISO tarihi Türkçe formatlar (Örn: "2026-09-14" -> "14 Eylül")
 */
function formatTurkishDate(isoString) {
  if (!isoString) return '';
  const parts = isoString.split('-');
  if (parts.length !== 3) return isoString;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = TURKISH_MONTHS[monthIdx] || '';
  return `${day} ${monthName}`;
}

/**
 * Haftalık planı arayüze basar
 */
function renderPlan(plan) {
  const titleEl = document.getElementById('app-title');
  const containerEl = document.getElementById('plan-container');
  const loadingEl = document.getElementById('loading');

  if (titleEl && plan.title) {
    titleEl.textContent = plan.title;
  }

  if (!containerEl || !plan.days || !Array.isArray(plan.days)) {
    return;
  }

  const todayISO = getTodayIstanbulISO();
  containerEl.innerHTML = '';

  plan.days.forEach((dayData) => {
    const isToday = dayData.date === todayISO;
    const formattedDate = formatTurkishDate(dayData.date);

    // Kart elemanı
    const card = document.createElement('div');
    card.className = `day-card ${isToday ? 'is-today' : ''}`;
    card.id = `card-${dayData.day.toLowerCase()}`;

    // Yemek türü sınıfı
    let typeClass = 'type-sebze';
    if (dayData.type === 'et_tavuk') typeClass = 'type-et_tavuk';
    if (dayData.type === 'balik') typeClass = 'type-balik';

    const typeLabel = dayData.typeLabel || (dayData.type === 'balik' ? 'Balık Günü' : dayData.type === 'et_tavuk' ? 'Et / Tavuk' : 'Sebze Günü');

    card.innerHTML = `
      ${isToday ? `<div class="today-banner">★ Bugünün Menüsü</div>` : ''}

      <div class="day-header">
        <div class="day-title-group">
          <span class="day-name">${dayData.day}</span>
          <span class="day-date">${formattedDate}</span>
        </div>
        <span class="day-type-badge ${typeClass}">${typeLabel}</span>
      </div>

      <div class="meals-list">
        <!-- 1. Çorba -->
        <div class="meal-item">
          <div class="meal-label">
            <span class="meal-label-icon">🍲</span>
            <span>1. Çorba</span>
          </div>
          <div class="meal-value">${dayData.soup}</div>
        </div>

        <!-- 2. Ana Yemek -->
        <div class="meal-item">
          <div class="meal-label">
            <span class="meal-label-icon">🥘</span>
            <span>2. Ana Yemek</span>
          </div>
          <div class="meal-value main-dish">${dayData.main}</div>
        </div>

        <!-- 3. Yan Yemek -->
        <div class="meal-item">
          <div class="meal-label">
            <span class="meal-label-icon">🥗</span>
            <span>3. Yan Yemek</span>
          </div>
          <div class="meal-value">${dayData.side}</div>
        </div>
      </div>
    `;

    containerEl.appendChild(card);
  });

  // Yükleniyor durumunu gizle, kartları göster
  if (loadingEl) loadingEl.style.display = 'none';
  containerEl.style.display = 'grid';
}

/**
 * plan.json dosyasını asenkron yükler
 */
async function loadWeeklyPlan() {
  try {
    // Cache bust query parametresi ile her zaman taze veri al
    const res = await fetch(`plan.json?v=${Date.now()}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    renderPlan(data);
  } catch (err) {
    console.warn('plan.json yüklenemedi, yedek plan gösteriliyor:', err);
    renderPlan(FALLBACK_PLAN);
  }
}

/**
 * Yazı boyutu seçimi ve yerel hafıza
 */
function initFontSizeControls() {
  const btnNormal = document.getElementById('btn-font-normal');
  const btnLarge = document.getElementById('btn-font-large');
  const btnXLarge = document.getElementById('btn-font-xlarge');

  const setFontSize = (size) => {
    document.body.classList.remove('font-normal', 'font-large', 'font-xlarge');
    document.body.classList.add(`font-${size}`);

    [btnNormal, btnLarge, btnXLarge].forEach(b => b && b.classList.remove('active'));
    if (size === 'normal' && btnNormal) btnNormal.classList.add('active');
    if (size === 'large' && btnLarge) btnLarge.classList.add('active');
    if (size === 'xlarge' && btnXLarge) btnXLarge.classList.add('active');

    try {
      localStorage.setItem('meal_plan_font_size', size);
    } catch (e) {
      // LocalStorage kısıtı varsa sorun etme
    }
  };

  if (btnNormal) btnNormal.addEventListener('click', () => setFontSize('normal'));
  if (btnLarge) btnLarge.addEventListener('click', () => setFontSize('large'));
  if (btnXLarge) btnXLarge.addEventListener('click', () => setFontSize('xlarge'));

  // Kayıtlı boyutu geri yükle (varsayılan: large)
  try {
    const saved = localStorage.getItem('meal_plan_font_size');
    if (saved && ['normal', 'large', 'xlarge'].includes(saved)) {
      setFontSize(saved);
    }
  } catch (e) {
    // Varsayılan large kalır
  }
}

/**
 * Yazdır butonunu bağlar
 */
function initPrintControl() {
  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  initFontSizeControls();
  initPrintControl();
  loadWeeklyPlan();
});
