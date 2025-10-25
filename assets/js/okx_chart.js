/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   • Фиксированная полоса: индикатор + i + OKX/TV/VP + «вверх»
   • Поп-ап (alert) поверх сайта: TF-кнопки, ссылки, мини-справка
   • Источник (okx|tv) и интервал (минуты) сохраняем в localStorage
*/

(function () {
  // ===== DOM =====
  const elTitle   = document.getElementById('title');
  const elChart   = document.getElementById('chart');
  const elDot     = document.getElementById('status-dot');
  const btnInfo   = document.getElementById('btn-status-info');
  const toTopBtn  = document.getElementById('btn-to-top');
  const brandBtns = Array.from(document.querySelectorAll('button.brand'));

  // поп-ап
  const alertRoot   = document.getElementById('alert');
  const alertClose  = document.getElementById('alert-close');
  const alertBack   = alertRoot?.querySelector('.alert-backdrop');
  const lastUpdEl   = document.getElementById('last-upd');
  const okxLink     = document.getElementById('okx-link');
  const tvLink      = document.getElementById('tv-link');
  const copyBtn     = document.getElementById('btn-copy');
  const tfButtons   = Array.from(document.querySelectorAll('.js-int'));

  // ===== state (LS) =====
  const LS_SRC = 'LAST_SRC_SIMPLE';
  const LS_INT = 'LAST_INT_SIMPLE';

  let source   = (localStorage.getItem(LS_SRC) || 'okx').toLowerCase();
  if (!['okx','tv','vp'].includes(source)) source = 'okx';

  let interval = parseInt(localStorage.getItem(LS_INT) || '60', 10);
  if (![15,60,240,1440].includes(interval)) interval = 60;

  // текущий инструмент (минимально)
  const instId = 'BTC-USDT-SWAP';
  const base   = 'BTC';
  const quote  = 'USDT';
  elTitle.textContent = `${base} • ${quote}-SWAP (${source.toUpperCase()})`;

  // init UI
  setActiveBrand(source);
  mountBySource(source, interval);
  updateLinks();

  // ===== handlers =====
  brandBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const next = btn.getAttribute('data-src');
      if (next === 'vp') {
        openVP();
        return;
      }
      if (next === source) return;
      source = next;
      localStorage.setItem(LS_SRC, source);
      setActiveBrand(source);
      elTitle.textContent = `${base} • ${quote}-SWAP (${source.toUpperCase()})`;
      mountBySource(source, interval);
      updateLinks();
    });
  });

  toTopBtn.addEventListener('click', ()=>{
    try { window.scrollTo({ top:0, behavior:'smooth' }); } catch { window.scrollTo(0,0); }
  });

  // поп-ап: открыть / закрыть
  btnInfo.addEventListener('click', openAlert);
  alertClose.addEventListener('click', closeAlert);
  alertBack.addEventListener('click', (e)=>{ if (e.target.dataset.close) closeAlert(); });

  // кнопки TF внутри поп-апа
  tfButtons.forEach(b=>{
    b.addEventListener('click', ()=>{
      const v = parseInt(b.dataset.min||'60',10);
      if (![15,60,240,1440].includes(v)) return;
      interval = v;
      localStorage.setItem(LS_INT, String(interval));
      lastUpdEl.textContent = '…';
      mountBySource(source, interval);      // перестраиваем график под новый TF
      updateLinks();
    });
  });

  // копирование share-ссылки
  copyBtn.addEventListener('click', async ()=>{
    try{
      const u = buildShareUrl();
      await navigator.clipboard.writeText(u);
      lastUpdEl.textContent = 'ссылка скопирована';
    }catch{
      lastUpdEl.textContent = 'не удалось скопировать';
    }
  });

  // ===== helpers =====
  function openAlert(){
    document.body.classList.add('modal-open');
    alertRoot.hidden = false;
  }
  function closeAlert(){
    alertRoot.hidden = true;
    document.body.classList.remove('modal-open');
  }

  function setActiveBrand(src){
    brandBtns.forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute('data-src')===src)));
  }

  function setStatus(mode){
    elDot.classList.remove('online','degraded','offline');
    elDot.classList.add(mode); // online | degraded | offline
  }

  function clearChart(){ elChart.innerHTML = '' }

  function mapIntervalToOkxBar(min){
    if (min===15) return '15m';
    if (min===60) return '1H';
    if (min===240) return '4H';
    if (min===1440) return '1D';
    return '1H';
  }
  function mapIntervalToTv(min){
    // TradingView ждёт строку с минутами
    return String(min);
  }

  function buildShareUrl(){
    const url = new URL(location.href);
    url.searchParams.set('src', source);
    url.searchParams.set('instId', instId);
    url.searchParams.set('interval', String(interval));
    return url.toString();
  }
  function updateLinks(){
    // ссылки внутри поп-апа
    okxLink.href = `https://www.okx.com/trade-swap/${base}-${quote}-SWAP`;
    const tvSymbol = `OKX:${base}${quote}.P`;
    tvLink.href = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}&interval=${mapIntervalToTv(interval)}`;
  }

  function openVP(){
    const tg = window.Telegram?.WebApp;
    const url = 'https://www.restmebel.ru/';
    try{
      if (tg && typeof tg.openLink==='function'){ tg.openLink(url); return; }
    }catch{}
    window.open(url, '_blank', 'noopener');
  }

  // ===== mount by source =====
  function mountBySource(src, min){
    if (src === 'tv') {
      setStatus('degraded');        // виджет без WS считаем «деградирован»
      mountTradingView(min);
    } else {
      setStatus('offline');
      mountOkx(min);
    }
  }

  // ===== OKX (Lightweight-Charts) =====
  function mountOkx(min){
    clearChart();

    const chart = LightweightCharts.createChart(elChart, {
      layout: { background: { color:'#0b0f14' }, textColor:'#e6e6e6' },
      grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
      rightPriceScale: { borderColor:'#2a3542' },
      timeScale: { borderColor:'#2a3542', timeVisible:true, secondsVisible:false },
      handleScroll:true, handleScale:true,
    });
    const series = chart.addCandlestickSeries({
      upColor:'#26a69a', downColor:'#ef5350', borderVisible:false,
      wickUpColor:'#26a69a', wickDownColor:'#ef5350',
    });

    const bar = mapIntervalToOkxBar(min);
    const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(bar)}&limit=500`;

    fetch(url).then(r=>r.json()).then(j=>{
      const rows = (j.data||[]).slice().reverse().map(r => ({
        time:  Math.floor(Number(r[0])/1000),
        open:  Number(r[1]),
        high:  Number(r[2]),
        low:   Number(r[3]),
        close: Number(r[4]),
      }));
      series.setData(rows);
      chart.timeScale().fitContent();
      setStatus('online');
      lastUpdEl.textContent = 'история загружена';
    }).catch(()=>{
      setStatus('offline');
      lastUpdEl.textContent = 'ошибка сети';
    });
  }

  // ===== TradingView виджет =====
  function mountTradingView(min){
    clearChart();

    function init(){
      const symbol = `OKX:${base}${quote}.P`;
      try{
        new TradingView.widget({
          autosize: true,
          symbol,
          interval: mapIntervalToTv(min),
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "ru",
          allow_symbol_change: false,
          save_image: false,
          container_id: "chart",
        });
        lastUpdEl.textContent = 'виджет';
      }catch(e){
        elChart.textContent = 'Не удалось инициализировать TradingView';
        lastUpdEl.textContent = 'ошибка';
      }
    }

    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.onload = init;
      s.onerror = ()=> { elChart.textContent = 'Ошибка загрузки TradingView'; lastUpdEl.textContent='ошибка'; };
      document.head.appendChild(s);
    } else {
      init();
    }
  }
})();
