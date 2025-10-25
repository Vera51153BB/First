/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   Что делает:
   • Рисует график OKX (Lightweight-Charts) либо встраивает TradingView виджет
   • Третья «кнопка» (VP) — просто открывает внешнюю ссылку
   • Нижняя полоса фиксирована; только три логотипа-кнопки
   • Сохраняет выбранный источник в localStorage
*/

(function () {
  // DOM
  const elTitle  = document.getElementById('title');
  const elChart  = document.getElementById('chart');
  const elDot    = document.getElementById('status-dot');
  const toTopBtn = document.getElementById('btn-to-top');

  // кнопки-логотипы
  const brandBtns = Array.from(document.querySelectorAll('button.brand'));

  // истоки (OKX — дефолт)
  const LS_SRC = 'LAST_SRC_SIMPLE';
  let source = (localStorage.getItem(LS_SRC) || 'okx').toLowerCase();
  if (!['okx','tv','vp'].includes(source)) source = 'okx';

  // помечаем активную кнопку
  setActiveBrand(source);

  // заголовок
  elTitle.textContent = 'BTC • USDT-SWAP (OKX)';

  // обработчики
  brandBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const next = btn.getAttribute('data-src');
      if (next === 'vp') {
        // просто ссылка (как просили)
        openVP();
        return;
      }
      if (next === source) return;
      source = next;
      localStorage.setItem(LS_SRC, source);
      setActiveBrand(source);
      mountBySource(source);
    });
  });

  toTopBtn.addEventListener('click', ()=>{
    try { window.scrollTo({ top:0, behavior:'smooth' }); }
    catch { window.scrollTo(0,0); }
  });

  // первое построение
  mountBySource(source);


  /* ===== helpers ===== */

  function setActiveBrand(src){
    brandBtns.forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute('data-src')===src)));
  }

  function setStatus(mode){
    elDot.classList.remove('online','degraded','offline');
    elDot.classList.add(mode); // online | degraded | offline
  }

  function clearChart(){
    // если был TradingView — просто зачистим контейнер
    elChart.innerHTML = '';
  }

  function openVP(){
    // в Telegram есть tg.openLink; в обычном браузере — window.open
    const tg = window.Telegram?.WebApp;
    const url = 'https://www.restmebel.ru/';
    try {
      if (tg && typeof tg.openLink==='function') { tg.openLink(url); return; }
    } catch {}
    window.open(url, '_blank', 'noopener');
  }

  function mountBySource(src){
    if (src === 'tv') {
      setStatus('degraded'); // виджет не WS
      mountTradingView();
    } else { // OKX
      setStatus('offline');
      mountOkx();
    }
  }

  /* ====== OKX (Lightweight-Charts + REST демо) ====== */
  function mountOkx(){
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

    fetch('https://www.okx.com/api/v5/market/candles?instId=BTC-USDT-SWAP&bar=1H&limit=500')
      .then(r=>r.json())
      .then(j=>{
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
      })
      .catch(()=>{
        setStatus('offline');
      });
  }

  /* ====== TradingView виджет ====== */
  function mountTradingView(){
    clearChart();

    function init(){
      // символ OKX perpetual (как раньше)
      const symbol = 'OKX:BTCUSDT.P';
      try{
        new TradingView.widget({
          autosize: true,
          symbol,
          interval: "60",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "ru",
          allow_symbol_change: false,
          save_image: false,
          container_id: "chart",
        });
      }catch(e){
        elChart.textContent = 'Не удалось инициализировать TradingView';
      }
    }

    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.onload = init;
      s.onerror = ()=> elChart.textContent = 'Ошибка загрузки TradingView';
      document.head.appendChild(s);
    } else {
      init();
    }
  }
})();
