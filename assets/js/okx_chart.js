/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   ПРОСТО: берём ?inst=BTC-USDT-SWAP (&tf=1h|4h|...), логируем, рисуем свечи OKX (REST).
*/

(function () {
  // ---- DOM ----
  const elTitle = document.getElementById('title');
  const elChart = document.getElementById('chart');
  const elDot   = document.getElementById('status-dot');
  const elLogo  = document.getElementById('dock-logo');
  const elDbg   = document.getElementById('debug-log');

  // ---- URL ----
  const qs   = new URLSearchParams(location.search);
  const inst = String(qs.get('inst') || '').toUpperCase().trim();  // ожидаем BTC-USDT-SWAP
  const tf   = normalizeTf(qs.get('tf') || '1h');                  // дефолт 1h

  // ВАЛИДАЦИЯ inst
  const INST_RE = /^([A-Z0-9]{2,})-([A-Z0-9]{2,})-(SWAP|SPOT|FUTURES|MARGIN)$/;
  const instId = INST_RE.test(inst) ? inst : 'BTC-USDT-SWAP';

  // ЛОГИ (консоль + localStorage + опционально на экране)
  const formed = {
    formed_at: new Date().toISOString(),
    url: location.href,
    inst_from_url: inst || '(empty)',
    inst_used: instId,
    tf_used: tf,
  };
  console.info('[chart] formed page:', formed);
  try { localStorage.setItem('CHART_LAST_FORMED', JSON.stringify(formed)); } catch(_){}

  if (String(qs.get('debug')) === '1' && elDbg) {
    elDbg.style.display = 'block';
    elDbg.textContent = 'formed page (debug=1):\n' + JSON.stringify(formed, null, 2);
  }

  // Заголовок/лого/статус
  const base = instId.split('-')[0] || 'BTC';
  elTitle.textContent = `${base} • ${instId}`;
  if (elLogo) {
    elLogo.src = './images/okx-logotype-light.png';
    elLogo.alt = 'OKX';
  }
  setStatus('degraded');

  // ГРАФИК
  renderOkxCandles(instId, tf)
    .then(()=> setStatus('online'))
    .catch((err)=>{
      console.error('[chart] load error', err);
      setStatus('offline');
      showError('Не удалось загрузить свечи OKX. Проверьте inst/tf и сеть.');
    });

  // ---- helpers ----
  function normalizeTf(raw) {
    const x = String(raw || '').toLowerCase();
    return /^(15m|1h|4h|8h|12h|24h)$/.test(x) ? x : '1h';
  }
  function tfToOkxBar(tf) {
    return { '15m':'15m','1h':'1H','4h':'4H','8h':'8H','12h':'12H','24h':'1D' }[tf] || '1H';
  }
  function setStatus(mode){
    if (!elDot) return;
    elDot.classList.remove('online','degraded','offline');
    elDot.classList.add(mode);
  }

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

    const bar = tfToOkxBar(tf);
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

  function showError(text){
    const box = document.createElement('div');
    box.style.cssText = 'margin:8px 12px; color:#ff6b6b; font-size:13px;';
    box.textContent = text;
    elChart.appendChild(box);
  }
})();
