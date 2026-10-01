'use strict';
/* =====================================================================
   24/7 Live Clock — vanilla JS, no dependencies.
   Designed for OBS Browser Source -> YouTube Live, and GitHub Pages.
   ===================================================================== */

const $ = (id) => document.getElementById(id);

/* ---------------- defaults ---------------- */
const DEFAULTS = {
  tz: 'America/Chicago',
  hour12: true,
  showSeconds: true,
  showDate: true,
  showDay: true,
  tzLabel: '',
  labelPos: 'below',             // above | below  (position of timezone label vs time)
  datePos: 'below',              // above | below  (position of date line vs time)
  dateFormat: 'long',            // long = "Wednesday, September 30, 2026" | short = "09/30/2026"
  padHour: true,                 // 12h: "07" vs "7"
  theme: 'default',
  clockMode: 'digital',          // digital | analog | both
  extraZones: [],                // [{label, tz}]
  font: 'Inter',
  timeSize: 26,                  // vmin
  dateSize: 4.2,                 // vmin
  textColor: '#ffffff',
  accentColor: '#ff453a',
  bgType: 'gradient',            // solid | gradient | image | video
  bgColor: '#0a0f1e',
  bgGradient: 'midnight',
  bgImage: '',
  bgVideo: '',
  bgOverlay: 0.35,
  showLive: true,
  liveText: 'LIVE',
  showLogo: true,
  logoText: 'MY CHANNEL',
  logoImage: '',
  weather: false,
  weatherCity: 'Dallas',
  weatherLat: 32.7767,
  weatherLon: -96.797,
  tempUnit: 'F',
  countdown: false,
  countdownLabel: 'New Year',
  countdownTarget: '2027-01-01T00:00',
  smoothSeconds: true,
  autoRefreshHours: 0,
  clean: false,
};

const GRADIENTS = {
  midnight:  'linear-gradient(135deg,#0a0f1e 0%,#141b33 55%,#0a0f1e 100%)',
  ocean:     'linear-gradient(135deg,#02141f 0%,#06304a 55%,#02141f 100%)',
  sunset:    'linear-gradient(135deg,#1c0b12 0%,#4a1a10 55%,#1c0b12 100%)',
  forest:    'linear-gradient(135deg,#07130c 0%,#0e2e1a 55%,#07130c 100%)',
  purple:    'linear-gradient(135deg,#120a20 0%,#2b1445 55%,#120a20 100%)',
  charcoal:  'linear-gradient(135deg,#0c0c0e 0%,#1d1d22 55%,#0c0c0e 100%)',
};

const FONTS = ['Inter','Orbitron','Bebas Neue','Oswald','Rajdhani','Montserrat','Poppins','Roboto','JetBrains Mono','Lato','Playfair Display'];

const CITIES = [
  {name:'Dallas',        lat:32.7767,  lon:-96.797},
  {name:'Chicago',       lat:41.8781,  lon:-87.6298},
  {name:'New York',      lat:40.7128,  lon:-74.006},
  {name:'Los Angeles',   lat:34.0522,  lon:-118.2437},
  {name:'Houston',       lat:29.7604,  lon:-95.3698},
  {name:'London',        lat:51.5074,  lon:-0.1278},
  {name:'Paris',         lat:48.8566,  lon:2.3522},
  {name:'Dubai',         lat:25.2048,  lon:55.2708},
  {name:'Mumbai',        lat:19.076,   lon:72.8777},
  {name:'Singapore',     lat:1.3521,   lon:103.8198},
  {name:'Tokyo',         lat:35.6762,  lon:139.6503},
  {name:'Sydney',        lat:-33.8688, lon:151.2093},
];

const WMO = {0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',56:'Freezing drizzle',57:'Freezing drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Freezing rain',71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Light showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Snow showers',95:'Thunderstorm',96:'Storm + hail',99:'Storm + hail'};

/* ---------------- preset themes (match popular 24/7 clock stream styles) ---------------- */
const CITY_NIGHT_IMG = 'https://images.pexels.com/photos/6746792/pexels-photo-6746792.jpeg?auto=compress&cs=tinysrgb&w=1920';
const FALL_NATURE_IMG = 'https://images.pexels.com/photos/34490278/pexels-photo-34490278/free-photo-of-scenic-autumn-road-surrounded-by-vibrant-foliage.jpeg?auto=compress&cs=tinysrgb&w=1920';

const THEMES = {
  // 1 — minimal black, 12h, label above, long date below (like the reference stream style 1)
  minimal: {
    bgType: 'solid', bgColor: '#000000',
    font: 'Inter', timeSize: 17, dateSize: 3.4,
    textColor: '#ffffff', accentColor: '#ff453a',
    hour12: true, padHour: true, showSeconds: true,
    showDate: true, showDay: true, dateFormat: 'long',
    labelPos: 'above', datePos: 'below', tzLabel: 'Central Time, US',
    clockMode: 'digital', showLive: false, liveText: 'LIVE', showLogo: false,
    extraZones: [], weather: false, countdown: false, smoothSeconds: true,
  },
  // 2 — night city skyline, letterspaced label with divider, bold 12h (reference style 2)
  citynight: {
    bgType: 'image', bgImage: CITY_NIGHT_IMG, bgOverlay: 0.45,
    font: 'Inter', timeSize: 15, dateSize: 2.9,
    textColor: '#ffffff', accentColor: '#ff453a',
    hour12: true, padHour: false, showSeconds: true,
    showDate: true, showDay: true, dateFormat: 'long',
    labelPos: 'above', datePos: 'below', tzLabel: 'CENTRAL TIME, US',
    clockMode: 'digital', showLive: false, liveText: 'LIVE', showLogo: false,
    extraZones: [], weather: false, countdown: false, smoothSeconds: true,
  },
  // 3 — black, MM/DD/YYYY above, huge 24h time, zone code below (reference style 3)
  classic24: {
    bgType: 'solid', bgColor: '#000000',
    font: 'Inter', timeSize: 24, dateSize: 5,
    textColor: '#ffffff', accentColor: '#ff453a',
    hour12: false, padHour: true, showSeconds: true,
    showDate: true, showDay: true, dateFormat: 'short',
    labelPos: 'below', datePos: 'above', tzLabel: 'CST',
    clockMode: 'digital', showLive: false, liveText: 'LIVE', showLogo: false,
    extraZones: [], weather: false, countdown: false, smoothSeconds: true,
  },
  // 4 — deep blue gradient, techy font, 12h (house style)
  midnight: {
    bgType: 'gradient', bgGradient: 'ocean', bgOverlay: 0,
    font: 'Orbitron', timeSize: 20, dateSize: 3.6,
    textColor: '#eaf2ff', accentColor: '#4da3ff',
    hour12: true, padHour: true, showSeconds: true,
    showDate: true, showDay: true, dateFormat: 'long',
    labelPos: 'below', datePos: 'below', tzLabel: '',
    clockMode: 'digital', showLive: true, liveText: 'LIVE', showLogo: true, logoText: 'MY CHANNEL',
    extraZones: [], weather: false, countdown: false, smoothSeconds: true,
  },
  // 5 — autumn foliage photo background, warm cream text
  fall: {
    bgType: 'image', bgImage: FALL_NATURE_IMG, bgOverlay: 0.35,
    font: 'Inter', timeSize: 18, dateSize: 3.4,
    textColor: '#fff8ec', accentColor: '#ffb347',
    hour12: true, padHour: true, showSeconds: true,
    showDate: true, showDay: true, dateFormat: 'long',
    labelPos: 'above', datePos: 'below', tzLabel: 'Central Time, US',
    clockMode: 'digital', showLive: true, liveText: 'LIVE', showLogo: false,
    extraZones: [], weather: false, countdown: false, smoothSeconds: true,
  },
};
const THEME_NAMES = { default: 'Custom (current settings)', minimal: '1 · Minimal Black', citynight: '2 · City Night', classic24: '3 · Classic 24-Hour', midnight: '4 · Midnight Blue', fall: '5 · Fall Nature' };

/* ---------------- settings load (localStorage < URL params) ---------------- */
const PARAM_MAP = {
  tz:'tz', h12:'hour12', sec:'showSeconds', date:'showDate', day:'showDay',
  tzlabel:'tzLabel', mode:'clockMode', zones:'extraZones',
  labelpos:'labelPos', datepos:'datePos', datefmt:'dateFormat', padhour:'padHour', theme:'theme',
  font:'font', tsize:'timeSize', dsize:'dateSize', fg:'textColor', accent:'accentColor',
  bg:'bgType', bgc:'bgColor', bgg:'bgGradient', bgi:'bgImage', bgv:'bgVideo', bgo:'bgOverlay',
  live:'showLive', livetext:'liveText', logo:'showLogo', logotext:'logoText', logoimg:'logoImage',
  w:'weather', wcity:'weatherCity', wlat:'weatherLat', wlon:'weatherLon', tunit:'tempUnit',
  cd:'countdown', cdl:'countdownLabel', cdt:'countdownTarget',
  smooth:'smoothSeconds', refresh:'autoRefreshHours', clean:'clean',
};
const BOOL_KEYS = new Set(['hour12','showSeconds','showDate','showDay','showLive','showLogo','weather','countdown','smoothSeconds','clean','padHour']);
const NUM_KEYS  = new Set(['timeSize','dateSize','bgOverlay','weatherLat','weatherLon','autoRefreshHours']);

function loadSettings() {
  let s = { ...DEFAULTS };
  try {
    const saved = JSON.parse(localStorage.getItem('liveclock.v1'));
    if (saved && typeof saved === 'object') s = { ...s, ...saved };
  } catch (e) { /* corrupted storage -> defaults */ }

  const q = new URLSearchParams(location.search);
  // theme preset first, then individual params override it
  const themeName = q.get('theme');
  if (themeName && THEMES[themeName]) s = { ...s, ...THEMES[themeName], theme: themeName };
  else if (themeName) s.theme = 'default';
  for (const [p, key] of Object.entries(PARAM_MAP)) {
    if (!q.has(p) || p === 'theme') continue;
    const v = q.get(p);
    if (key === 'extraZones') {
      s.extraZones = v.split(',').map(x => {
        const i = x.indexOf('|');
        return { label: (i > -1 ? x.slice(0, i) : '').trim(), tz: (i > -1 ? x.slice(i + 1) : x).trim() };
      }).filter(z => z.tz);
    } else if (BOOL_KEYS.has(key)) {
      s[key] = /^(1|true|yes|on)$/i.test(v.trim());
    } else if (NUM_KEYS.has(key)) {
      const n = parseFloat(v); if (!Number.isNaN(n)) s[key] = n;
    } else {
      s[key] = v;
    }
  }
  return s;
}

let S = loadSettings();
let saveTimer = null;
function saveSettings() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem('liveclock.v1', JSON.stringify(S)); } catch (e) {}
  }, 250);
}

/* ---------------- self-healing: errors + watchdog ---------------- */
let failCount = 0;
function scheduleReload(reason) {
  failCount++;
  const delay = Math.min(30000, 1500 * Math.pow(2, Math.min(failCount, 4))) + Math.random() * 1000;
  console.warn('[live-clock] problem detected (' + reason + '), reloading in ' + Math.round(delay) + 'ms');
  setTimeout(() => location.reload(), delay);
}
window.addEventListener('error', (e) => scheduleReload('window.onerror: ' + (e.message || 'unknown')));
window.addEventListener('unhandledrejection', (e) => scheduleReload('unhandled rejection'));

let lastTick = Date.now();
setInterval(() => {                       // watchdog: reload if the clock stalls
  if (Date.now() - lastTick > 15000) location.reload();
}, 5000);

/* ---------------- time formatting ---------------- */
const fmtCache = {};
function getFmts(tz, hour12, padHour) {
  const key = tz + '|' + hour12 + '|' + padHour;
  if (!fmtCache[key]) {
    const hour = padHour ? '2-digit' : 'numeric';
    const mk = (tzName) => ({
      time: new Intl.DateTimeFormat('en-US', { timeZone: tzName, hour, minute: '2-digit', second: '2-digit', hour12, hourCycle: hour12 ? 'h12' : 'h23' }),
      date: new Intl.DateTimeFormat('en-US', { timeZone: tzName, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      dateShort: new Intl.DateTimeFormat('en-US', { timeZone: tzName, month: '2-digit', day: '2-digit', year: 'numeric' }),
    });
    try { fmtCache[key] = mk(tz); }
    catch (e) { fmtCache[key] = mk('UTC'); }   // bad timezone -> fall back to UTC, never crash
  }
  return fmtCache[key];
}
function partsOf(fmt, d) {
  const o = {};
  for (const p of fmt.formatToParts(d)) o[p.type] = p.value;
  return o;
}
function cityFromTz(tz) {
  const parts = String(tz).split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}

/* fractional time in a timezone (for smooth analog sweep) */
const fracFmtCache = {};
function tzFractional(date, tz) {
  if (!fracFmtCache[tz]) {
    try {
      fracFmtCache[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 3, hour12: false, hourCycle: 'h23' });
    } catch (e) {
      fracFmtCache[tz] = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 3, hour12: false, hourCycle: 'h23' });
    }
  }
  const p = partsOf(fracFmtCache[tz], date);
  return { h: (+p.hour) % 24, m: +p.minute, s: +p.second, ms: +(p.fractionalSecond || 0) };
}

/* ---------------- rendering ---------------- */
const last = {};
function setText(id, v) {
  if (last[id] !== v) { last[id] = v; $(id).textContent = v; }
}

function renderMain(now) {
  const f = getFmts(S.tz, S.hour12, S.padHour);
  const t = partsOf(f.time, now);
  setText('hh', t.hour); setText('mm', t.minute);
  $('ss').style.display = S.showSeconds ? '' : 'none';
  document.querySelector('#time .sec-colon').style.display = S.showSeconds ? '' : 'none';
  if (S.showSeconds) {
    if (last.ss !== t.second && S.smoothSeconds) {
      const el = $('ss'); el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
    }
    setText('ss', t.second);
  }
  setText('ampm', S.hour12 ? (t.dayPeriod || '') : '');

  let dateStr = '';
  if (S.dateFormat === 'short') {
    const ds = S.showDate ? f.dateShort.format(now) : '';
    const wd = S.showDay ? partsOf(f.date, now).weekday : '';
    dateStr = wd && ds ? `${wd}, ${ds}` : (wd || ds);
  } else {
    const d = partsOf(f.date, now);
    if (S.showDay && S.showDate) dateStr = `${d.weekday}  •  ${d.month} ${d.day}, ${d.year}`;
    else if (S.showDay) dateStr = d.weekday;
    else if (S.showDate) dateStr = `${d.month} ${d.day}, ${d.year}`;
  }
  $('dateLine').style.display = dateStr ? '' : 'none';
  setText('dateLine', dateStr);

  const label = S.tzLabel.trim() || cityFromTz(S.tz);
  $('tzLabel').style.display = label ? '' : 'none';
  setText('tzLabel', label);

  // vertical stacking: label / date can sit above or below the time
  $('time').style.order = 3;
  $('tzLabel').style.order = S.labelPos === 'above' ? 1 : 4;
  $('dateLine').style.order = S.datePos === 'above' ? 2 : 5;

  document.title = `${t.hour}:${t.minute}${S.showSeconds ? ':' + t.second : ''} ${S.hour12 ? (t.dayPeriod || '') : ''} — Live Clock`;
}

function renderZones(now) {
  const box = $('zones');
  if (!S.extraZones.length) { if (last.zonesHtml !== '') { last.zonesHtml = ''; box.innerHTML = ''; } return; }
  const html = S.extraZones.map((z, i) => {
    const f = getFmts(z.tz, S.hour12, S.padHour);
    const t = partsOf(f.time, now);
    const time = `${t.hour}:${t.minute}${S.showSeconds ? ':' + t.second : ''}${S.hour12 && t.dayPeriod ? ' ' + t.dayPeriod : ''}`;
    const label = (z.label || cityFromTz(z.tz)).toUpperCase();
    return `<div class="zone"><div class="z-label">${escapeHtml(label)}</div><div class="z-time">${time}</div></div>`;
  }).join('');
  if (last.zonesHtml !== html) { last.zonesHtml = html; box.innerHTML = html; }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* analog */
function buildTicks() {
  const g = $('ticks'); let html = '';
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const a = (i * 6) * Math.PI / 180;
    const r1 = major ? 168 : 178, r2 = 188;
    const x1 = 200 + r1 * Math.sin(a), y1 = 200 - r1 * Math.cos(a);
    const x2 = 200 + r2 * Math.sin(a), y2 = 200 - r2 * Math.cos(a);
    html += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="tick${major ? ' major' : ''}" stroke-width="${major ? 4 : 2}"/>`;
  }
  g.innerHTML = html;
}
function setHand(id, angleDeg) {
  $(id).setAttribute('transform', `rotate(${angleDeg.toFixed(2)} 200 200)`);
}
function drawAnalog(now) {
  const { h, m, s, ms } = tzFractional(now, S.tz);
  const sec = s + ms / 1000;
  setHand('secHand', sec * 6);
  setHand('minHand', (m + sec / 60) * 6);
  setHand('hourHand', ((h % 12) + m / 60) * 30);
  const f = getFmts(S.tz, S.hour12, S.padHour);
  const d = partsOf(f.date, now);
  setText('analogDate', `${d.weekday}, ${d.month} ${d.day}, ${d.year}`);
}

/* weather (Open-Meteo: free, no API key) */
async function updateWeather() {
  const el = $('weather');
  if (!S.weather) { el.hidden = true; return; }
  el.hidden = false;
  try {
    const unit = S.tempUnit === 'F' ? 'fahrenheit' : 'celsius';
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${S.weatherLat}&longitude=${S.weatherLon}&current=temperature_2m,weather_code&temperature_unit=${unit}&timezone=auto`);
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    const t = Math.round(j.current.temperature_2m);
    const label = WMO[j.current.weather_code] || '';
    el.textContent = `${S.weatherCity}  ${t}°${S.tempUnit}  ${label}`;
  } catch (e) {
    if (!el.textContent) el.textContent = `${S.weatherCity}  --°${S.tempUnit}`;
  }
}

/* countdown */
function renderCountdown(now) {
  const el = $('countdown');
  if (!S.countdown) { el.hidden = true; return; }
  el.hidden = false;
  const target = new Date(S.countdownTarget).getTime();
  let html;
  if (Number.isNaN(target)) {
    html = `<span class="cd-label">${escapeHtml(S.countdownLabel)}</span><span class="cd-time">--</span>`;
  } else {
    let diff = target - now.getTime();
    if (diff < 0) {
      html = `<span class="cd-label">${escapeHtml(S.countdownLabel)}</span><span class="cd-time">It's time!</span>`;
    } else {
      const dd = Math.floor(diff / 864e5); diff -= dd * 864e5;
      const hh = String(Math.floor(diff / 36e5)).padStart(2, '0'); diff -= +hh * 36e5;
      const mm = String(Math.floor(diff / 6e4)).padStart(2, '0'); diff -= +mm * 6e4;
      const ss = String(Math.floor(diff / 1e3)).padStart(2, '0');
      html = `<span class="cd-label">${escapeHtml(S.countdownLabel)}</span><span class="cd-time">${dd}d ${hh}:${mm}:${ss}</span>`;
    }
  }
  if (last.cdHtml !== html) { last.cdHtml = html; el.innerHTML = html; }
}

/* ---------------- tick loop (aligned to the second boundary) ---------------- */
function scheduleTick() {
  const now = new Date();
  lastTick = Date.now();
  renderMain(now);
  renderZones(now);
  renderCountdown(now);
  if (S.clockMode === 'analog') drawAnalog(now);
  const ms = 1000 - (Date.now() % 1000) + 8;
  setTimeout(scheduleTick, ms);
}
/* rAF only when analog needs smooth sweep */
(function analogLoop() {
  if (S.clockMode !== 'digital') drawAnalog(new Date());
  requestAnimationFrame(analogLoop);
})();

/* ---------------- apply settings to the page ---------------- */
function applyAll() {
  const root = document.documentElement.style;
  root.setProperty('--time-size', S.timeSize + 'vmin');
  root.setProperty('--date-size', S.dateSize + 'vmin');
  root.setProperty('--text-color', S.textColor);
  root.setProperty('--accent-color', S.accentColor);
  root.setProperty('--font', `'${S.font}', system-ui, sans-serif`);
  root.setProperty('--bg-base', S.bgColor);
  root.setProperty('--bg-gradient', GRADIENTS[S.bgGradient] || GRADIENTS.midnight);
  root.setProperty('--overlay', S.bgOverlay);

  document.body.style.fontFamily = `'${S.font}', system-ui, sans-serif`;
  document.body.dataset.theme = S.theme || 'default';

  // background (gradient stays behind image as a fallback if the photo fails to load)
  const grad = $('bgGradient');
  grad.style.display = S.bgType === 'video' ? 'none' : '';
  if (S.bgType === 'solid') grad.style.background = S.bgColor;
  else grad.style.background = '';
  const img = $('bgImage');
  if (S.bgType === 'image' && S.bgImage) {
    if (img.dataset.url !== S.bgImage) {
      img.dataset.url = S.bgImage;
      img.style.display = 'none';
      const probe = new Image();
      probe.onload = () => {
        if (img.dataset.url === S.bgImage) { img.style.backgroundImage = `url("${S.bgImage}")`; img.style.display = 'block'; }
      };
      probe.onerror = () => {
        if (img.dataset.url === S.bgImage) { img.style.backgroundImage = ''; img.style.display = 'none'; }
        console.warn('[live-clock] background image failed to load, using gradient fallback');
      };
      probe.src = S.bgImage;
    }
  } else { img.dataset.url = ''; img.style.display = 'none'; img.style.backgroundImage = ''; }
  const vid = $('bgVideo');
  if (S.bgType === 'video' && S.bgVideo) {
    vid.style.display = 'block';
    if (vid.dataset.src !== S.bgVideo) { vid.dataset.src = S.bgVideo; vid.src = S.bgVideo; vid.play().catch(() => {}); }
  } else { vid.style.display = 'none'; vid.removeAttribute('src'); vid.dataset.src = ''; }

  // branding
  $('liveBadge').style.display = S.showLive ? '' : 'none';
  setText('liveText', S.liveText || 'LIVE');
  const logo = $('logo');
  logo.style.display = S.showLogo ? '' : 'none';
  setText('logoText', S.logoText || '');
  const li = $('logoImg');
  if (S.logoImage) { li.hidden = false; if (li.src !== S.logoImage) li.src = S.logoImage; }
  else { li.hidden = true; li.removeAttribute('src'); }

  // clock mode
  const showDigital = S.clockMode !== 'analog';
  const showAnalog = S.clockMode !== 'digital';
  $('digitalWrap').style.display = showDigital ? '' : 'none';
  $('analogWrap').hidden = !showAnalog;

  document.body.classList.toggle('clean', !!S.clean);
  $('hint').hidden = !!S.clean;
  if (S.clean) $('settings').hidden = true;   // clean stream view: panel can never be open

  // force re-render
  last.zonesHtml = null; last.cdHtml = null;
  const now = new Date();
  renderMain(now); renderZones(now); renderCountdown(now); updateWeather();
}

/* ---------------- settings UI ---------------- */
function allTimezones() {
  try {
    if (Intl.supportedValuesOf) return Intl.supportedValuesOf('timeZone');
  } catch (e) {}
  return ['UTC','America/Chicago','America/New_York','America/Denver','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Dubai','Asia/Kolkata','Asia/Singapore','Asia/Tokyo','Australia/Sydney'];
}
function fillTzSelect(sel, current, filter) {
  const zones = allTimezones().filter(z => !filter || z.toLowerCase().includes(filter.toLowerCase()));
  sel.innerHTML = zones.map(z => `<option value="${z}"${z === current ? ' selected' : ''}>${z.replace(/_/g, ' ')}</option>`).join('')
    || `<option value="${current}">${current}</option>`;
}

function applyTheme(name) {
  S.theme = name;
  if (THEMES[name]) S = { ...S, ...THEMES[name] };
  saveSettings(); populateForm(); applyAll();
}

function populateForm() {
  $('theme').innerHTML = Object.entries(THEME_NAMES).map(([v, n]) => `<option value="${v}"${v === S.theme ? ' selected' : ''}>${n}</option>`).join('');
  fillTzSelect($('tzSelect'), S.tz);
  fillTzSelect($('zoneTz'), 'America/New_York');
  $('font').innerHTML = FONTS.map(f => `<option${f === S.font ? ' selected' : ''}>${f}</option>`).join('');
  $('setBgGradient').innerHTML = Object.keys(GRADIENTS).map(g => `<option value="${g}"${g === S.bgGradient ? ' selected' : ''}>${g[0].toUpperCase() + g.slice(1)}</option>`).join('');
  $('weatherCity').innerHTML = CITIES.map(c => `<option value="${c.name}"${c.name === S.weatherCity ? ' selected' : ''}>${c.name}</option>`).join('') + `<option value="__custom"${!CITIES.some(c => c.name === S.weatherCity) ? ' selected' : ''}>Custom…</option>`;

  $('hour12').value = S.hour12 ? '1' : '0';
  $('clockMode').value = S.clockMode;
  $('showSeconds').checked = S.showSeconds;
  $('showDate').checked = S.showDate;
  $('showDay').checked = S.showDay;
  $('tzLabelText').value = S.tzLabel;
  $('labelPos').value = S.labelPos;
  $('datePos').value = S.datePos;
  $('dateFormat').value = S.dateFormat;
  $('padHour').checked = S.padHour;
  $('smoothSeconds').checked = S.smoothSeconds;
  $('timeSize').value = S.timeSize; $('timeSizeVal').textContent = S.timeSize + 'vmin';
  $('dateSize').value = S.dateSize; $('dateSizeVal').textContent = S.dateSize + 'vmin';
  $('textColor').value = S.textColor;
  $('accentColor').value = S.accentColor;
  $('bgType').value = S.bgType;
  $('bgColor').value = S.bgColor;
  $('setBgImage').value = S.bgImage;
  $('setBgVideo').value = S.bgVideo;
  $('setBgOverlay').value = S.bgOverlay; $('bgOverlayVal').textContent = Math.round(S.bgOverlay * 100) + '%';
  $('showLive').checked = S.showLive;
  $('setLiveText').value = S.liveText;
  $('showLogo').checked = S.showLogo;
  $('setLogoText').value = S.logoText;
  $('logoImage').value = S.logoImage;
  $('setWeather').checked = S.weather;
  $('tempUnit').value = S.tempUnit;
  $('setCountdown').checked = S.countdown;
  $('countdownLabel').value = S.countdownLabel;
  $('countdownTarget').value = S.countdownTarget;
  $('autoRefreshHours').value = S.autoRefreshHours;
  renderZonesList();
}

function renderZonesList() {
  $('zonesList').innerHTML = S.extraZones.map((z, i) =>
    `<div class="zone-row"><span><b>${escapeHtml(z.label || cityFromTz(z.tz))}</b> <span style="opacity:.6">${escapeHtml(z.tz)}</span></span><button data-i="${i}" aria-label="Remove">×</button></div>`
  ).join('') || '<p class="note">No extra timezones yet.</p>';
  $('zonesList').querySelectorAll('button').forEach(b => b.onclick = () => {
    S.extraZones.splice(+b.dataset.i, 1); saveSettings(); renderZonesList(); applyAll();
  });
}

function bindForm() {
  const upd = (fn) => (...a) => { fn(...a); saveSettings(); applyAll(); };
  $('theme').onchange = (e) => applyTheme(e.target.value);
  $('tzSelect').onchange = upd(e => S.tz = e.target.value);
  $('tzSearch').oninput = (e) => fillTzSelect($('tzSelect'), S.tz, e.target.value);
  $('hour12').onchange = upd(e => S.hour12 = e.target.value === '1');
  $('clockMode').onchange = upd(e => S.clockMode = e.target.value);
  $('showSeconds').onchange = upd(e => S.showSeconds = e.target.checked);
  $('showDate').onchange = upd(e => S.showDate = e.target.checked);
  $('showDay').onchange = upd(e => S.showDay = e.target.checked);
  $('tzLabelText').oninput = upd(e => S.tzLabel = e.target.value);
  $('labelPos').onchange = upd(e => S.labelPos = e.target.value);
  $('datePos').onchange = upd(e => S.datePos = e.target.value);
  $('dateFormat').onchange = upd(e => S.dateFormat = e.target.value);
  $('padHour').onchange = upd(e => S.padHour = e.target.checked);
  $('smoothSeconds').onchange = upd(e => S.smoothSeconds = e.target.checked);
  $('timeSize').oninput = upd(e => { S.timeSize = +e.target.value; $('timeSizeVal').textContent = S.timeSize + 'vmin'; });
  $('dateSize').oninput = upd(e => { S.dateSize = +e.target.value; $('dateSizeVal').textContent = S.dateSize + 'vmin'; });
  $('textColor').oninput = upd(e => S.textColor = e.target.value);
  $('accentColor').oninput = upd(e => S.accentColor = e.target.value);
  $('bgType').onchange = upd(e => S.bgType = e.target.value);
  $('bgColor').oninput = upd(e => S.bgColor = e.target.value);
  $('setBgGradient').onchange = upd(e => S.bgGradient = e.target.value);
  $('setBgImage').oninput = upd(e => S.bgImage = e.target.value.trim());
  $('setBgVideo').oninput = upd(e => S.bgVideo = e.target.value.trim());
  $('setBgOverlay').oninput = upd(e => { S.bgOverlay = +e.target.value; $('bgOverlayVal').textContent = Math.round(S.bgOverlay * 100) + '%'; });
  $('showLive').onchange = upd(e => S.showLive = e.target.checked);
  $('setLiveText').oninput = upd(e => S.liveText = e.target.value);
  $('showLogo').onchange = upd(e => S.showLogo = e.target.checked);
  $('setLogoText').oninput = upd(e => S.logoText = e.target.value);
  $('logoImage').oninput = upd(e => S.logoImage = e.target.value.trim());
  $('setWeather').onchange = upd(e => S.weather = e.target.checked);
  $('weatherCity').onchange = upd(e => {
    const c = CITIES.find(x => x.name === e.target.value);
    if (c) { S.weatherCity = c.name; S.weatherLat = c.lat; S.weatherLon = c.lon; }
    else { const name = prompt('City name:'); if (name) S.weatherCity = name; }
  });
  $('tempUnit').onchange = upd(e => S.tempUnit = e.target.value);
  $('setCountdown').onchange = upd(e => S.countdown = e.target.checked);
  $('countdownLabel').oninput = upd(e => S.countdownLabel = e.target.value);
  $('countdownTarget').onchange = upd(e => S.countdownTarget = e.target.value);
  $('autoRefreshHours').onchange = upd(e => S.autoRefreshHours = Math.max(0, +e.target.value || 0));

  $('addZone').onclick = () => {
    const label = $('zoneLabel').value.trim();
    const tz = $('zoneTz').value;
    if (!tz || S.extraZones.some(z => z.tz === tz)) return;
    S.extraZones.push({ label, tz });
    $('zoneLabel').value = '';
    saveSettings(); renderZonesList(); applyAll();
  };

  $('copyObsUrl').onclick = async () => {
    const base = location.href.split('?')[0];
    const p = new URLSearchParams();
    if (S.theme && S.theme !== 'default') p.set('theme', S.theme);
    p.set('tz', S.tz); p.set('h12', S.hour12 ? '1' : '0'); p.set('mode', S.clockMode);
    if (!S.showSeconds) p.set('sec', '0');
    if (!S.showDate) p.set('date', '0');
    if (!S.showDay) p.set('day', '0');
    if (S.tzLabel) p.set('tzlabel', S.tzLabel);
    if (S.extraZones.length) p.set('zones', S.extraZones.map(z => `${z.label}|${z.tz}`).join(','));
    if (S.font !== 'Inter') p.set('font', S.font);
    if (S.timeSize !== 26) p.set('tsize', S.timeSize);
    if (S.dateSize !== 4.2) p.set('dsize', S.dateSize);
    if (S.textColor !== '#ffffff') p.set('fg', S.textColor);
    if (S.accentColor !== '#ff453a') p.set('accent', S.accentColor);
    if (S.bgType !== 'gradient') p.set('bg', S.bgType);
    if (S.bgColor !== '#0a0f1e') p.set('bgc', S.bgColor);
    if (S.bgGradient !== 'midnight') p.set('bgg', S.bgGradient);
    if (S.bgImage) p.set('bgi', S.bgImage);
    if (S.bgVideo) p.set('bgv', S.bgVideo);
    if (S.bgOverlay !== 0.35) p.set('bgo', S.bgOverlay);
    if (!S.showLive) p.set('live', '0');
    if (S.liveText !== 'LIVE') p.set('livetext', S.liveText);
    if (!S.showLogo) p.set('logo', '0');
    if (S.logoText !== 'MY CHANNEL') p.set('logotext', S.logoText);
    if (S.logoImage) p.set('logoimg', S.logoImage);
    if (S.weather) { p.set('w', '1'); p.set('wcity', S.weatherCity); p.set('wlat', S.weatherLat); p.set('wlon', S.weatherLon); p.set('tunit', S.tempUnit); }
    if (S.countdown) { p.set('cd', '1'); p.set('cdl', S.countdownLabel); p.set('cdt', S.countdownTarget); }
    p.set('clean', '1');
    const url = `${base}?${p.toString()}`;
    try { await navigator.clipboard.writeText(url); $('copyObsUrl').textContent = 'Copied!'; }
    catch (e) { prompt('Copy this URL for OBS:', url); $('copyObsUrl').textContent = 'Copy OBS URL'; }
    setTimeout(() => $('copyObsUrl').textContent = 'Copy OBS URL', 1800);
  };

  $('resetSettings').onclick = () => {
    if (!confirm('Reset all settings to defaults?')) return;
    S = { ...DEFAULTS };
    try { localStorage.removeItem('liveclock.v1'); } catch (e) {}
    populateForm(); applyAll();
  };

  // panel open/close
  const toggle = (show) => { $('settings').hidden = !(show ?? $('settings').hidden); };
  $('gear').onclick = () => toggle();
  $('closeSettings').onclick = () => toggle(false);
  document.addEventListener('keydown', (e) => {
    if (S.clean) return;
    if (e.target.matches('input,select,textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 's') toggle();
    else if (k === 'f') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
    else if (k === 'h') document.body.classList.toggle('hideui');
  });
}

/* ---------------- init ---------------- */
buildTicks();
populateForm();
bindForm();
applyAll();
scheduleTick();
setInterval(updateWeather, 10 * 60 * 1000);
if (S.autoRefreshHours > 0) setTimeout(() => location.reload(), S.autoRefreshHours * 3600 * 1000);
