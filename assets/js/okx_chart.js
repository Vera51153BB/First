/* -*- coding: utf-8 -*-
 * OKX/TV/VP нижняя полоса + базовый рендер графика.
 * В этом релизе фокус на «свёрнутой полосе»:
 *  • три логотип-кнопки (OKX / TradingView / Volume Profile);
 *  • квадратные кнопки «i» и «▲»;
 *  • по умолчанию активен OKX (API/WS).
 * Прежний функционал (REST+WS, виджет TV) оставлен. VP сейчас — заглушка.
 */

(function(){
  // ───────── DOM ─────────
  const elTitle   = document.getElementById('title');
  const elChart   = document.getElementById('chart');
  const elHint    = document.getElementById('hint');

  // Нижняя полоса
  const elStatusDot  = document.getElementById('status-dot');
  const btnOKX       = document.getElementById('btn-okx');
  const btnTV        = document.getElementById('btn-tv');
  const btnVP        = document.getElementById('btn-vp');
  const btnInfo      = document.getElementById('btn-status-info');
  const btnPanel     = document.getElementById('btn-panel');

  // Поповер и панель
  const popover      = document.getElementById('status-popover');
  const tipClose     = document.getElementById('btn-tip-close');
  const panel        = document.getElementById('panel');
  const btnClose     = document.getElementById('btn-close');

  // ───────── URL / Параметры / Хранилище ─────────
  const params  = new URLSearchParams(location.search);
  const qInstId = params.get('inst') || params.get('instId'); // поддержим оба ключа
  const qTf     = (params.get('tf')||'').toLowerCase();
  let qSrc      = (params.get('src')||'').toLowerCase();       // okx|tv|vp

  const LS_SRC = 'LAST_SRC';
  // дефолт: OKX
  if (!qSrc){ qSrc = localStorage.getItem(LS_SRC) || 'okx'; }
  if (!['okx','tv','vp'].includes(qSrc)) qSrc = 'okx';

  // Инструмент
  const clean = s => (s||'').toUpperCase().replace(/[^A-Z0-9\-]/g,'').slice(0,40);
  const instId = qInstId ? clean(qInstId) : 'BTC-USDT-SWAP';
  const coin   = instId.split('-')[0] || 'BTC';

  // Таймфрейм (для OKX) — 1h по умолчанию
  const TF = (function mapTf(tf){
    if (['15m','1h','4h','8h','12h','24h','1d'].includes(tf)) return tf;
    return '1h';
  })(qTf);

  // Отрисуем заголовок
  elTitle.textContent = `${coin} • USDT-SWAP (OKX)`;

  // ───────── Помощники ─────────
  function setStatus(mode){
    elStatusDot.classList.remove('online','degraded','offline');
    elStatusDot.classList.add(mode);
  }
  function setActiveBrand(src){
    [btnOKX,btnTV,btnVP].forEach(b=>b.classList.remove('active'));
    if (src==='okx') btnOKX.classList.add('active');
    if (src==='tv')  btnTV.classList.add('active');
    if (src==='vp')  btnVP.classList.add('active');
  }
  function openPopover(){ popover.hidden = false; btnInfo.setAttribute('aria-expanded','true'); }
  function closePopover(){ popover.hidden = true;  btnInfo.setAttribute('aria-expanded','false'); }
  function togglePanel(open){
    const willOpen = (open===undefined) ? !panel.classList.contains('open') : !!open;
    panel.classList.toggle('open', willOpen);
    panel.toggleAttribute('hidden', !willOpen);
    btnPanel.setAttribute('aria-expanded', String(willOpen));
    // Кнопка в шапке панели (стрелка вниз)
    if (btnClose) btnClose.textContent = '▼';
  }

  // ───────── Навешиваем обработчики «полосы» ─────────
  btnOKX.addEventListener('click', ()=> switchSource('okx'));
  btnTV .addEventListener('click', ()=> switchSource('tv'));
  btnVP .addEventListener('click', ()=> switchSource('vp'));

  btnInfo.addEventListener('click', ()=> popover.hidden ? openPopover() : closePopover());
  tipClose.addEventListener('click', closePopover);

  btnPanel.addEventListener('click', ()=> togglePanel()); // открыть вверх
  btnClose && btnClose.addEventListener('click', ()=> togglePanel(false));

  // ───────── Стартовый источник ─────────
  setActiveBrand(qSrc);
  switchSource(qSrc, /*initial=*/true);

  // ───────── Реализация переключения источника ─────────
  let tvMounted = false;
  let lwcChart  = null;
  let wsHandle  = null;

  async function switchSource(src, initial=false){
    localStorage.setItem(LS_SRC, src);
    setActiveBrand(src);
    closePopover();      // подёжно прячем подсказку при переключениях
    destroyAll();

    if (src === 'okx'){
      setStatus('offline');
      await renderOkxChart();   // REST+WS
      return;
    }
    if (src === 'tv'){
      setStatus('degraded');    // считаем «деградированным» (виджет)
      renderTradingView();
      return;
    }
    if (src === 'vp'){
      // VP сейчас только как «кнопка в полосе». Сообщим пользователю.
      setStatus('degraded');
      elHint.innerHTML = 'Модуль <b>Volume Profile</b> появится в следующем релизе.';
      return;
    }
  }

  function destroyAll(){
    // демонтируем виджет TV, если стоял
    if (tvMounted && window.TradingView){
      try{
        // TradingView.widget не даёт простого destroy — перерисуем контейнер
        elChart.innerHTML = '';
      }catch(_){}
      tvMounted = false;
    }
    // убираем lightweight-charts
    if (lwcChart){
      try{ lwcChart.remove(); }catch(_){}
      lwcChart = null;
    }
    // закрываем WS, если есть
    if (wsHandle && wsHandle.close){
      try{ wsHandle.close(); }catch(_){}
      wsHandle = null;
    }
    elHint.textContent = '';
  }

  // ───────── OKX (REST+WS, lightweight-charts) ─────────
  async function renderOkxChart(){
    // Создаём чарт
    lwcChart = LightweightCharts.createChart(elChart, {
      layout: { background: { color:'#0b0f14' }, textColor:'#e6e6e6' },
      grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor:'#2a3542' },
      timeScale: { borderColor:'#2a3542', timeVisible: true, secondsVisible: false },
      handleScroll: true, handleScale: true,
    });
    const series = lwcChart.addCandlestickSeries({
      upColor:'#26a69a', downColor:'#ef5350', borderVisible:false, wickUpColor:'#26a69a', wickDownColor:'#ef5350',
    });

    // REST история
    try{
      const bar = tfToOkxBar(TF);
      const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(bar)}&limit=500`;
      const res = await fetch(url);
      const j = await res.json();
      const data = Array.isArray(j.data) ? j.data : [];
      const candles = data.slice().reverse().map(row => ({
        time:  Math.floor(Number(row[0]) / 1000),
        open:  Number(row[1]),
        high:  Number(row[2]),
        low:   Number(row[3]),
        close: Number(row[4]),
      }));
      series.setData(candles);
      lwcChart.timeScale().fitContent();
      setStatus('degraded'); // есть данные (REST), пока без WS
    }catch(e){
      setStatus('offline');
      elHint.innerHTML = `<span class="err">Ошибка загрузки данных OKX</span>`;
      return;
    }

    // WebSocket — обновления
    try{
      const chan = tfToWsChannel(TF);
      const ws = new WebSocket('wss://ws.okx.com/ws/v5/public');
      wsHandle = ws;
      ws.addEventListener('open', ()=>{
        setStatus('online');
        ws.send(JSON.stringify({ op:'subscribe', args:[{ channel:chan, instId }] }));
      });
      ws.addEventListener('message', ev=>{
        try{
          const m = JSON.parse(ev.data);
          if (!m || !m.data) return;
          m.data.forEach(row=>{
            const c = {
              time:  Math.floor(Number(row[0]) / 1000),
              open:  Number(row[1]), high: Number(row[2]),
              low:   Number(row[3]), close:Number(row[4]),
            };
            series.update(c);
          });
        }catch(_){}
      });
      ws.addEventListener('close', ()=> setStatus('degraded'));
      ws.addEventListener('error', ()=> setStatus('degraded'));
    }catch(_){
      // WS не критичен — остаёмся в REST-режиме
      setStatus('degraded');
    }
  }

  // ───────── TradingView виджет ─────────
  function renderTradingView(){
    function mount(){
      try{
        new TradingView.widget({
          autosize: true,
          symbol: `OKX:${coin}USDT.P`,
          interval: tfToTvInterval(TF),
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "ru",
          withdateranges: true,
          allow_symbol_change: false,
          save_image: false,
          container_id: "chart",
        });
        tvMounted = true;
      }catch(e){
        elHint.innerHTML = '<span class="err">Ошибка инициализации TradingView</span>';
      }
    }
    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = "https://s3.tradingview.com/tv.js";
      s.onload = mount;
      s.onerror= ()=> elHint.innerHTML = '<span class="err">Не удалось загрузить TradingView</span>';
      document.head.appendChild(s);
    }else{
      mount();
    }
  }

  // ───────── Мелкие маппинги ─────────
  function tfToOkxBar(tf){
    return { '15m':'15m','1h':'1H','4h':'4H','8h':'8H','12h':'12H','24h':'1D','1d':'1D' }[tf] || '1H';
  }
  function tfToWsChannel(tf){
    return { '15m':'candle15m','1h':'candle1H','4h':'candle4H','8h':'candle8H','12h':'candle12H','24h':'candle1D','1d':'candle1D' }[tf] || 'candle1H';
  }
  function tfToTvInterval(tf){
    return { '15m':'15', '1h':'60', '4h':'240','8h':'480','12h':'720','24h':'1D','1d':'1D' }[tf] || '60';
  }
})();
