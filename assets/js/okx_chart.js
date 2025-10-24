/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   Назначение:
   • Рендер графика (OKX/TV/VP-заглушка) и UX: док-полоса + смена источника.
   • НЕ управляет панелью напрямую — это делает ui_panel.js через window.__panelCtl.
*/
(function () {
  // DOM
  const elTitle = document.getElementById('title');
  const elChart = document.getElementById('chart');
  const elDot   = document.getElementById('status-dot');
  const elLogo  = document.getElementById('dock-logo');
  const elInfo  = document.getElementById('btn-status-info');
  const elOkx   = document.getElementById('okx-link');
  const elTV    = document.getElementById('tv-link');
  const elLast  = document.getElementById('last-upd');
  const elHint  = document.getElementById('hint');

  // Логотипы полосы
  const LOGOS = {
    okx: './images/okx-logotype-light.png',
    tv:  './images/tradingview-logotype-light.png',
    vp:  './images/vp-logotype-light.png',
  };

  // Параметры URL/LS (источник по умолчанию — OKX)
  const params = new URLSearchParams(location.search);
  let source = (params.get('src') || localStorage.getItem('LAST_SRC') || 'okx').toLowerCase();
  if (!['okx','tv','vp'].includes(source)) source = 'okx';
  localStorage.setItem('LAST_SRC', source);

  // Ссылки
  elOkx.href = `https://www.okx.com/trade-swap/BTC-USDT-SWAP`;
  elTV.href  = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent('OKX:BTCUSDT.P')}`;

  setDockSource(source);
  mountChartFor(source);

  // Кнопки источников в панели
  document.querySelectorAll('#row-sources .src').forEach(btn=>{
    const src = btn.getAttribute('data-src');
    if (src === source) btn.classList.add('active');
    btn.addEventListener('click', ()=>{
      if (source === src) return;
      document.querySelectorAll('#row-sources .src').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');

      source = src;
      localStorage.setItem('LAST_SRC', source);
      setDockSource(source);
      mountChartFor(source);
    });
  });

  // Индикатор — короткий помощник
  function setStatus(mode){
    elDot.classList.remove('online','degraded','offline');
    elDot.classList.add(mode);
  }

  // Логотип в полосе
  function setDockSource(src){
    elLogo.src = LOGOS[src] || LOGOS.okx;
    elLogo.alt = src.toUpperCase();
  }

  // Поповер «i»
  const pop = document.getElementById('status-popover');
  document.getElementById('btn-tip-close').addEventListener('click', ()=> pop.hidden = true);
  elInfo.addEventListener('click', ()=> { pop.hidden = !pop.hidden; });

  // Рендер по источнику
  function mountChartFor(src){
    elTitle.textContent = 'BTC • USDT-SWAP (OKX)';
    clearChart();
    if (src === 'tv')      return mountTradingView();
    if (src === 'okx')     return mountOkx();
    if (src === 'vp')      return mountVolumeProfileStub();
  }

  // OKX: Lightweight-Charts + REST мини-история
  function mountOkx(){
    try{
      const api = LightweightCharts.createChart(elChart, {
        layout: { background: { color:'#0b0f14' }, textColor:'#e6e6e6' },
        grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
        rightPriceScale: { borderColor:'#2a3542' },
        timeScale: { borderColor:'#2a3542', timeVisible:true, secondsVisible:false }
      });
      const series = api.addCandlestickSeries({
        upColor:'#26a69a', downColor:'#ef5350', borderVisible:false,
        wickUpColor:'#26a69a', wickDownColor:'#ef5350'
      });

      setStatus('degraded'); // пока REST
      fetch('https://www.okx.com/api/v5/market/candles?instId=BTC-USDT-SWAP&bar=1H&limit=200')
        .then(r=>r.json())
        .then(j=>{
          const data = (j.data||[]).slice().reverse().map(r=>({
            time: Math.floor(Number(r[0])/1000),
            open:Number(r[1]), high:Number(r[2]), low:Number(r[3]), close:Number(r[4]),
          }));
          series.setData(data);
          api.timeScale().fitContent();
          elLast.textContent = 'история загружена';
          setStatus('online'); // имитируем онлайн
        })
        .catch(()=>{
          setStatus('offline');
          elLast.textContent = 'ошибка';
          elHint.textContent = 'Не удалось загрузить данные OKX.';
        });
    }catch(e){
      setStatus('offline');
      elHint.textContent = 'Ошибка инициализации графика.';
    }
  }

  // TradingView
  function mountTradingView(){
    setStatus('degraded');
    const SYMBOL = 'OKX:BTCUSDT.P';
    const init = ()=>{
      new TradingView.widget({
        autosize:true, symbol:SYMBOL, interval:"60", timezone:"Etc/UTC",
        theme:"dark", style:"1", locale:"ru", allow_symbol_change:false,
        save_image:false, container_id:"chart"
      });
      elLast.textContent = 'виджет';
    };
    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.onload = init; s.onerror = ()=>{ setStatus('offline'); elLast.textContent='ошибка'; };
      document.head.appendChild(s);
    }else init();
  }

  // VP — заглушка
  function mountVolumeProfileStub(){
    setStatus('offline');
    elChart.innerHTML = '';
    elLast.textContent = 'vp';
    const stub = document.createElement('div');
    stub.style.cssText = 'height:100%;display:grid;place-items:center;color:#9aa4af;';
    stub.textContent = 'Volume Profile (в разработке)';
    elChart.appendChild(stub);
  }

  function clearChart(){ elChart.innerHTML = ''; }
})();
