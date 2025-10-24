/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   Назначение:
   • Рендер графика (OKX/TV/VP — заглушка для VP) + управление полосой и панелью.
   • Поддержка фиксированной нижней полосы и «открытия вверх».
*/

(function () {
  // --------- DOM ----------
  const elChart   = document.getElementById('chart');
  const elDock    = document.getElementById('dock');
  const elDot     = document.getElementById('status-dot');
  const elLogo    = document.getElementById('dock-logo');
  const elInfo    = document.getElementById('btn-status-info');
  const elBtn     = document.getElementById('btn-panel');

  const elPanel   = document.getElementById('panel');
  const elCollapse= document.getElementById('btn-collapse');
  const elLastUpd = document.getElementById('last-upd');

  // Источники: пути к логотипам (белые, под тёмную тему)
  const LOGOS = {
    okx: './images/okx-logotype-light.png',
    tv:  './images/tradingview-logotype-light.png',
    vp:  './images/vp-logotype-light.png'
  };

  // --------- URL/LS (источник по умолчанию OKX) ----------
  const params   = new URLSearchParams(location.search);
  const srcQuery = (params.get('src')||'okx').toLowerCase();
  let source     = ['okx','tv','vp'].includes(srcQuery) ? srcQuery : 'okx';
  localStorage.setItem('LAST_SRC', source);

  // Устанавливаем изначальный логотип в полосе
  setDockSource(source);

  // --------- Панель: открыть/закрыть (стрелка ▲/▼ и aria-expanded) ----------
  const openPanel  = () => {
    elPanel.hidden = false;
    elPanel.classList.add('open');
    elBtn.setAttribute('aria-expanded','true');
  };
  const closePanel = () => {
    elPanel.classList.remove('open');
    elBtn.setAttribute('aria-expanded','false');
    // скрываем после анимации
    setTimeout(()=>{ if(!elPanel.classList.contains('open')) elPanel.hidden = true; }, 260);
  };

  elBtn.addEventListener('click', () => {
    if (elPanel.classList.contains('open')) closePanel(); else openPanel();
  });
  elCollapse.addEventListener('click', closePanel);

  // --------- Справка по индикатору (кнопка «i») ----------
  const pop = document.getElementById('status-popover');
  document.getElementById('btn-tip-close').addEventListener('click', ()=> pop.hidden = true);
  elInfo.addEventListener('click', ()=>{
    pop.hidden = !pop.hidden;
  });

  // --------- Кнопки источников внутри панели ----------
  document.querySelectorAll('#row-sources .src').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const next = btn.getAttribute('data-src');
      if (next === source) return;
      source = next;
      localStorage.setItem('LAST_SRC', source);
      setDockSource(source);
      mountChartFor(source);
    });
  });

  // --------- Кнопки интервалов (метка «последнее обновление») ----------
  document.querySelectorAll('#row-intervals .int').forEach(a=>{
    a.addEventListener('click', ()=>{
      elLastUpd.textContent = '…';
      // здесь можно дернуть реальную перезагрузку данных
    });
  });

  // --------- Рендер графика по источнику ----------
  function mountChartFor(src){
    // Сигнализируем текущий статус
    setStatus('offline','Подключаемся…');

    if (src === 'tv') {
      mountTradingView();                    // виджет TradingView
    } else if (src === 'okx') {
      mountOkx();                            // лёгкий график + OKX WS (упрощённо)
    } else {
      mountVolumeProfileStub();              // заглушка «Полки»
    }
  }

  // OKX: Lightweight-Charts + REST/WS (укорочено)
  function mountOkx(){
    clearChart();
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

    // мини-история (демо)
    fetch('https://www.okx.com/api/v5/market/candles?instId=BTC-USDT-SWAP&bar=1H&limit=200')
      .then(r=>r.json()).then(j=>{
        const data = (j.data||[]).slice().reverse().map(r=>({
          time: Math.floor(Number(r[0])/1000),
          open:Number(r[1]), high:Number(r[2]), low:Number(r[3]), close:Number(r[4])
        }));
        series.setData(data);
        api.timeScale().fitContent();
        setStatus('online','Онлайн (WS)');
        elLastUpd.textContent = 'история загружена';
      }).catch(()=> setStatus('degraded','REST недоступен'));
  }

  // TradingView виджет
  function mountTradingView(){
    clearChart();
    const SYMBOL = 'OKX:BTCUSDT.P';
    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.onload = init; s.onerror = ()=> setStatus('offline','TV недоступен');
      document.head.appendChild(s);
    } else { init(); }

    function init(){
      new TradingView.widget({
        autosize: true, symbol: SYMBOL, interval: "60", timezone:"Etc/UTC",
        theme: "dark", style:"1", locale:"ru", container_id:"chart",
        allow_symbol_change:false, save_image:false
      });
      setStatus('degraded','Источник: TradingView');
      elLastUpd.textContent = 'виджет';
    }
  }

  // VP (заглушка)
  function mountVolumeProfileStub(){
    clearChart();
    setStatus('offline','VP заглушка');
    elLastUpd.textContent = 'vp';
  }

  // Смена источника — обновляем логотип на полосе
  function setDockSource(src){
    elLogo.src = LOGOS[src] || LOGOS.okx;
    elLogo.alt = src.toUpperCase();
  }

  // Индикатор состояния
  function setStatus(mode, _text){
    elDot.classList.remove('online','degraded','offline');
    elDot.classList.add(mode);
  }

  // Очистка контейнера графика (для смены источника)
  function clearChart(){ elChart.innerHTML = '' }

  // Первый рендер
  mountChartFor(source);
})();
