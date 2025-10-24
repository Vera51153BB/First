/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   Назначение:
   • Рендер графика (OKX/TV/VP — заглушка для VP) + управление полосой и панелью.
   • Поддержка фиксированной нижней полосы и «открытия вверх».
*/

(function () {
  // --------- DOM ----------
  const elChart    = document.getElementById('chart');
  const elDock     = document.getElementById('dock');
  const elDot      = document.getElementById('status-dot');
  const elLogo     = document.getElementById('dock-logo');
  const elInfo     = document.getElementById('btn-status-info');
  const elBtn      = document.getElementById('btn-panel');

  const elPanel    = document.getElementById('panel');
  const elCollapse = document.getElementById('btn-collapse');
  const elLastUpd  = document.getElementById('last-upd');

  // Источники: пути к логотипам (белые, под тёмную тему)
  const LOGOS = {
    okx: './images/okx-logotype-light.png',
    tv:  './images/tradingview-logotype-light.png',
    vp:  './images/vp-logotype-light.png'
  };

  // --------- URL/LS (источник по умолчанию OKX) ----------
  const params   = new URLSearchParams(location.search);
  const srcQuery = (params.get('src') || localStorage.getItem('LAST_SRC') || 'okx').toLowerCase(); // NEW: учитываем LS
  let source     = ['okx','tv','vp'].includes(srcQuery) ? srcQuery : 'okx';
  localStorage.setItem('LAST_SRC', source);

  // Устанавливаем изначальный логотип в полосе
  setDockSource(source);

  // --------- Панель: открыть/закрыть (стрелка ▲/▼ и aria-expanded) ----------
  // NEW: открываем через rAF, чтобы iOS гарантированно «дотягивал» transform: translateY(0)
  const openPanel = () => {
    if (!elPanel) return;
    elPanel.hidden = false;
    // следующий кадр — добавить класс анимации
    requestAnimationFrame(() => {
      elPanel.classList.add('open');
      elBtn && elBtn.setAttribute('aria-expanded','true');
    });
  };

  // CHANGED: закрытие — ждём реального окончания transition по panel
  const closePanel = () => {
    if (!elPanel) return;
    elPanel.classList.remove('open');
    elBtn && elBtn.setAttribute('aria-expanded','false');
    const onEnd = (ev) => {
      if (ev.target !== elPanel) return;
      elPanel.hidden = true;
      elPanel.removeEventListener('transitionend', onEnd);
    };
    elPanel.addEventListener('transitionend', onEnd);
  };

  // Подписки на кнопки панели
  elBtn && elBtn.addEventListener('click', () => {
    if (!elPanel) return;
    elPanel.classList.contains('open') ? closePanel() : openPanel();
  });
  elCollapse && elCollapse.addEventListener('click', closePanel);

  // --------- Справка по индикатору (кнопка «i») ----------
  const pop = document.getElementById('status-popover');
  const btnTipClose = document.getElementById('btn-tip-close');
  btnTipClose && btnTipClose.addEventListener('click', () => { if (pop) pop.hidden = true; });
  elInfo && elInfo.addEventListener('click', (e) => {
    if (!pop) return;
    pop.hidden = !pop.hidden;
    e.stopPropagation();
  });
  // NEW: клик вне поповера — закрыть
  document.addEventListener('click', (e) => {
    if (!pop || pop.hidden) return;
    const within = pop.contains(e.target) || (elInfo && elInfo.contains(e.target));
    if (!within) pop.hidden = true;
  });

  // --------- Кнопки источников внутри панели ----------
  // CHANGED: при смене источника закрываем поповер и перерисовываем график
  document.querySelectorAll('#row-sources .src').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-src');
      if (!next || next === source) return;
      source = next;
      localStorage.setItem('LAST_SRC', source);
      setDockSource(source);
      if (pop) pop.hidden = true;         // закрыть подсказку «i», чтобы не «залипала»
      mountChartFor(source);
    });
  });

  // --------- Кнопки интервалов (метка «последнее обновление») ----------
  document.querySelectorAll('#row-intervals .int').forEach(a => {
    a.addEventListener('click', () => {
      if (elLastUpd) elLastUpd.textContent = '…';
      // здесь можно дернуть реальную перезагрузку данных
    });
  });

  // --------- Рендер графика по источнику ----------
  function mountChartFor(src){
    // Сигнализируем текущий статус
    setStatus('offline','Подключаемся…');
    clearChart(); // NEW: гарантированно очищаем контейнер перед монтированием любого источника

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
        elLastUpd && (elLastUpd.textContent = 'история загружена');
      }).catch(()=>{
        setStatus('degraded','REST недоступен');
        elLastUpd && (elLastUpd.textContent = 'ошибка REST');
      });

    // NEW: на ресайз подгоняем таймскейл (убирает «артефакты» после смены ориентации)
    let resizeTO=0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(()=> api.timeScale().fitContent(), 180);
    }, { passive:true });
  }

  // TradingView виджет
  function mountTradingView(){
    const SYMBOL = 'OKX:BTCUSDT.P';
    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.onload = init; s.onerror = () => { setStatus('offline','TV недоступен'); elLastUpd && (elLastUpd.textContent = 'ошибка ТВ'); };
      document.head.appendChild(s);
    } else { init(); }

    function init(){
      // CHANGED: перед монтированием контейнер уже очищен — виджет не «накладывается»
      new TradingView.widget({
        autosize: true, symbol: SYMBOL, interval: "60", timezone:"Etc/UTC",
        theme: "dark", style:"1", locale:"ru", container_id:"chart",
        allow_symbol_change:false, save_image:false
      });
      setStatus('degraded','Источник: TradingView');
      elLastUpd && (elLastUpd.textContent = 'виджет');
    }
  }

  // VP (заглушка)
  function mountVolumeProfileStub(){
    setStatus('offline','VP заглушка');
    elLastUpd && (elLastUpd.textContent = 'vp');
    // здесь в будущем подключим реальную отрисовку профиля объёмов
  }

  // Смена источника — обновляем логотип на полосе
  function setDockSource(src){
    if (!elLogo) return;
    elLogo.src = LOGOS[src] || LOGOS.okx;
    elLogo.alt = (src || 'okx').toUpperCase();
  }

  // Индикатор состояния
  function setStatus(mode /* 'online'|'degraded'|'offline' */){
    if (!elDot) return;
    elDot.classList.remove('online','degraded','offline');
    elDot.classList.add(mode);
  }

  // Очистка контейнера графика (для смены источника)
  function clearChart(){
    if (!elChart) return;
    // CLEANUP: полностью выносим всё содержимое контейнера
    while (elChart.firstChild) elChart.removeChild(elChart.firstChild);
  }

  // Первый рендер
  mountChartFor(source);
})();
