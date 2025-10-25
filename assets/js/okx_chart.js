/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   ЗАДАЧА:
   1) Берём всё, что пришло от кнопки/URL (inst|instId|btn, tf|interval, src)
   2) Нормализуем → формируем instId/TF/SRC
   3) Логируем (console + localStorage; опционально на экран при ?debug=1)
   4) Рисуем график по OKX REST (без WS, чтобы упростить и стабилизировать)
*/

(function () {
  // ---------- DOM ----------
  const elTitle = document.getElementById('title');
  const elChart = document.getElementById('chart');
  const elDot   = document.getElementById('status-dot');
  const elLogo  = document.getElementById('dock-logo');
  const elDbg   = document.getElementById('debug-log');

  // ---------- УТИЛИТЫ ----------
  const qs = new URLSearchParams(location.search);

  function cleanEmojiAndSpaces(s) {
    return String(s || '')
      .replace(/[⭐️✨➕✅✳️•·\u200B-\u200D]+/g, '') // убрать декор/ZW*
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // "BTC-USDT-SWAP", "BTC-USDT", "BTC/USDT", "BTC", "⭐️ BTC" → "BTC-USDT-SWAP"
  function normalizeInst(raw) {
    const s = cleanEmojiAndSpaces(raw).toUpperCase();

    // Полный instId?
    let m = s.match(/^([A-Z0-9]{2,})[- ]?([A-Z0-9]{2,})[- ]?(SWAP|SPOT|FUTURES|MARGIN)$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    // Форматы пары
    m = s.match(/^([A-Z0-9]{2,})[-/ ]([A-Z0-9]{2,})$/);
    if (m) return `${m[1]}-${m[2]}-SWAP`;

    // Только тикер
    m = s.match(/^([A-Z0-9]{2,})$/);
    if (m) return `${m[1]}-USDT-SWAP`;

    return '';
  }

  // "15m|1h|4h|8h|12h|24h" или число минут
  function normalizeTf(raw) {
    const x = String(raw || '').trim();
    if (/^(15m|1h|4h|8h|12h|24h)$/i.test(x)) return x.toLowerCase();
    const n = parseInt(x, 10);
    if (!isNaN(n)) {
      if (n >= 1440) return '24h';
      if (n >= 720)  return '12h';
      if (n >= 480)  return '8h';
      if (n >= 240)  return '4h';
      if (n >= 60)   return '1h';
      if (n >= 15)   return '15m';
    }
    return '1h';
  }

  function normalizeSrc(raw) {
    const s = String(raw || '').toLowerCase();
    return (s === 'okx' || s === 'tv' || s === 'vp') ? s : 'okx';
  }

  function tfToOkxBar(tf) {
    return {
      '15m':'15m', '1h':'1H', '4h':'4H', '8h':'8H', '12h':'12H', '24h':'1D'
    }[tf] || '1H';
  }

  // ---------- ЧТЕНИЕ ВХОДОВ ----------
  let instId =
    normalizeInst(qs.get('inst'))   ||
    normalizeInst(qs.get('instId')) ||
    normalizeInst(qs.get('btn'));         // ← текст кнопки (самый «простопередаваемый»)

  let tf  = normalizeTf(qs.get('tf') || qs.get('interval'));
  let src = normalizeSrc(qs.get('src'));

  if (!instId) instId = 'BTC-USDT-SWAP';
  if (!tf)     tf     = '1h';
  if (!src)    src    = 'okx';

  // ---------- ЛОГИ / ДЕБУГ ----------
  const formed = {
    formed_at: new Date().toISOString(),
    url: location.href,
    from: (qs.get('inst') || qs.get('instId')) ? 'query'
         : qs.get('btn') ? 'button-text'
         : 'defaults',
    btn_raw: qs.get('btn') || '',
    instId, tf, src
  };

  console.info('[chart] formed page:', formed);
  try { localStorage.setItem('CHART_LAST_FORMED', JSON.stringify(formed)); } catch(_){}

  if (String(qs.get('debug')) === '1' && elDbg) {
    elDbg.style.display = 'block';
    elDbg.textContent =
      'formed page (debug=1):\n' +
      JSON.stringify(formed, null, 2);
  }

  // ---------- ВНЕШНИЙ ВИД / ЗАГОЛОВОК ----------
  const base = instId.split('-')[0] || 'BTC';
  elTitle.textContent = `${base} • ${instId}`;
  elLogo.src = src === 'tv'
    ? './images/tradingview-logotype-light.png'
    : src === 'vp'
      ? './images/vp-logotype-light.png'
      : './images/okx-logotype-light.png';
  elLogo.alt = src.toUpperCase();

  setStatus('degraded', 'Загрузка…');

  // ---------- ГРАФИК (OKX REST) ----------
  // По заявлению: «просто подключаем OKX API график». Делаем на Lightweight-Charts.
  // (TV/VP игнорируем в MVP: если src != okx — всё равно покажем свечи с OKX.)
  renderOkxCandles(instId, tf)
    .then(()=> setStatus('online', 'OKX REST'))
    .catch((err)=>{
      console.error('[chart] load error', err);
      setStatus('offline', 'Нет данных');
      showError('Не удалось загрузить данные с OKX. Проверьте inst/tf и сеть.');
    });

  // ---------- ФУНКЦИИ РЕНДЕРА ----------
  async function renderOkxCandles(instId, tf){
    const chart = LightweightCharts.createChart(elChart, {
      layout: { background: { color:'#0b0f14' }, textColor:'#e6e6e6' },
      grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
      rightPriceScale: { borderColor:'#2a3542' },
      timeScale: { borderColor:'#2a3542', timeVisible:true, secondsVisible:false },
      handleScroll: true, handleScale: true,
    });
    const series = chart.addCandlestickSeries({
      upColor:'#26a69a', downColor:'#ef5350', borderVisible:false,
      wickUpColor:'#26a69a', wickDownColor:'#ef5350'
    });

    const bar = tfToOkxBar(tf);               // OKX формат
    const limit = Math.min(500, Math.max(100, parseInt(qs.get('limit') || '300', 10) || 300));
    const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(bar)}&limit=${limit}`;

    const res = await fetch(url, { method:'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    if (!j || !Array.isArray(j.data)) throw new Error('Malformed OKX response');

    const candles = j.data.slice().reverse().map(row => ({
      time:  Math.floor(Number(row[0]) / 1000), // ts(ms)→s
      open:  Number(row[1]),
      high:  Number(row[2]),
      low:   Number(row[3]),
      close: Number(row[4]),
    }));

    if (!candles.length) throw new Error('Empty data');
    series.setData(candles);
    chart.timeScale().fitContent();
  }

  function setStatus(mode, _text){
    elDot.classList.remove('online','degraded','offline');
    elDot.classList.add(mode);
  }

  function showError(text){
    const box = document.createElement('div');
    box.style.cssText = 'margin:8px 12px; color:#ff6b6b; font-size:13px;';
    box.textContent = text;
    elChart.appendChild(box);
  }

  // Экспорт для быстрой ручной проверки в DevTools
  window.__formed = formed;
})();
