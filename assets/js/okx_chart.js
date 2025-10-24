/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   Управление графиком + нижняя полоса.
   Минимальные зависимости: Lightweight Charts, опционально TradingView.
*/
(function(){
  // ---- DOM ----
  const elTitle   = document.getElementById('title');
  const elChart   = document.getElementById('chart');
  const elHint    = document.getElementById('hint');

  // полоса
  const elDockLogo   = document.getElementById('dock-logo');
  const elDot        = document.getElementById('status-dot');
  const btn          = document.getElementById('btn-panel'); 
  const btnInfo      = document.getElementById('btn-status-info');
  const btnPanel     = document.getElementById('btn-panel');
  const popover      = document.getElementById('status-popover');
  const btnTipClose  = document.getElementById('btn-tip-close');

  // панель
  const panel        = document.getElementById('panel');
  const btnClose     = document.getElementById('btn-collapse');
  const elLastUpd    = document.getElementById('last-upd');
  const rowIntervals = document.getElementById('row-intervals');
  const rowSources   = document.getElementById('row-sources');
  const elOkxLink    = document.getElementById('okx-link');
  const elTvLink     = document.getElementById('tv-link');
  const elFav        = document.getElementById('btn-fav');
  const btnCopy      = document.getElementById('btn-copy');
  btn?.addEventListener('click', () => {
  const isOpen = panel.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(isOpen));
});

  // ---- параметры/предпочтения ----
  const params  = new URLSearchParams(location.search);
  let qInstId   = params.get('instId');
  let qInterval = params.get('interval');
  let qSrc      = (params.get('src')||'').toLowerCase(); // okx|tv|vp

  const LS_INT = 'LAST_INTERVAL';
  const LS_SRC = 'LAST_SRC';

  // дефолты
  if (!qInterval){ qInterval = localStorage.getItem(LS_INT) || '60'; }           // 1h
  if (!qSrc){      qSrc      = localStorage.getItem(LS_SRC) || 'okx'; }          // OKX (требование)
  qInterval = String(parseInt(qInterval,10)||60);

  // инструмент
  const clean = s => (s||'').toUpperCase().replace(/[^A-Z0-9\-]/g,'').slice(0,30);
  let instId, coin='BTC', quote='USDT';
  if (qInstId){
    instId = clean(qInstId);
    const p = instId.split('-'); coin = p[0]||'BTC'; quote = p[1]||'USDT';
  } else {
    instId = `${coin}-USDT-SWAP`;
  }

  // ссылки
  elTitle.textContent = `${coin} • USDT-SWAP (OKX)`;
  elOkxLink.href = `https://www.okx.com/trade-swap/${coin}-USDT-SWAP`;
  const tvSymbol = `OKX:${coin}${quote}.P`;
  elTvLink.href  = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;

  // ---- полоса: логотип по источнику ----
  const LOGOS = {
    okx: './images/okx-logotype-light.png',
    tv:  './images/tradingview-logotype-light.png',
    vp:  './images/vp-logotype-light.png'
  };
  function setDockLogo(src){
    const key = (src||'okx');
    elDockLogo.src = LOGOS[key] || LOGOS.okx;
    elDockLogo.alt = key === 'tv' ? 'TradingView' : (key === 'vp' ? 'Volume Profile' : 'OKX');
  }
  setDockLogo(qSrc); // первичная установка — показываем ровно один логотип

  // ---- панель: открыть/закрыть (кнопка ▲/▼ и «Свернуть») ----
  function openPanel(){
    panel.hidden = false;
    panel.classList.add('open');
    btnPanel.setAttribute('aria-expanded','true');
    btnPanel.textContent = '▼'; // при открытой панели показываем стрелку вниз
  }
  function closePanel(){
    panel.classList.remove('open');
    btnPanel.setAttribute('aria-expanded','false');
    btnPanel.textContent = '▲'; // свернуто — стрелка вверх
    // ждем анимацию и скрываем из потока
    setTimeout(()=>{ if(!panel.classList.contains('open')) panel.hidden = true; }, 260);
  }
  btnPanel.addEventListener('click', () => {
    (panel.classList.contains('open') ? closePanel : openPanel)();
  });
  btnClose.addEventListener('click', closePanel);

  // ---- поповер по 'i' ----
  btnInfo.addEventListener('click', ()=>{
    const on = popover.hasAttribute('hidden') ? false : true;
    if (on){ popover.setAttribute('hidden',''); btnInfo.setAttribute('aria-expanded','false'); }
    else   { popover.removeAttribute('hidden'); btnInfo.setAttribute('aria-expanded','true'); }
  });
  btnTipClose.addEventListener('click', ()=>{
    popover.setAttribute('hidden',''); btnInfo.setAttribute('aria-expanded','false');
  });

  // ---- таймфреймы ----
  rowIntervals.querySelectorAll('.int').forEach(a=>{
    const v = String(parseInt(a.dataset.int||'60',10));
    if (v === qInterval) a.classList.add('active');
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      if (v === qInterval) return;
      qInterval = v;
      localStorage.setItem(LS_INT, qInterval);
      // лёгкая перезагрузка с сохранением src/inst
      const url = new URL(location.href);
      url.searchParams.set('instId', instId);
      url.searchParams.set('interval', qInterval);
      url.searchParams.set('src', qSrc);
      location.replace(url.toString());
    });
  });

  // ---- источники (кнопки в панели) ----
  rowSources.querySelectorAll('.src').forEach(btn=>{
    const src = (btn.getAttribute('data-src')||'').toLowerCase();
    if (src === qSrc) btn.classList.add('active');
    btn.addEventListener('click', ()=>{
      if (src === qSrc) return;
      qSrc = src;
      localStorage.setItem(LS_SRC, qSrc);
      setDockLogo(qSrc);       // обновляем ОДИН логотип на полосе
      // перерендер источника без смены URL (чтобы полоса оставалась)
      mountBySource(qSrc);
      // визуал активной
      rowSources.querySelectorAll('.src').forEach(b=>b.classList.toggle('active', b===btn));
    });
  });

  // ---- избранное (синхронизация только локальная; текст меняем на ⭐/➕) ----
  const FAV_KEY = "fav_coins";
  const favGet = () => { try{const x = JSON.parse(localStorage.getItem(FAV_KEY)||'[]'); return Array.isArray(x)?x:[];}catch(_){return [];} }
  const favSet = a => { try{localStorage.setItem(FAV_KEY, JSON.stringify(a));}catch(_){ } }
  const favHas = () => favGet().includes(coin);
  function refreshFavUI(){
    const active = favHas();
    elFav.classList.toggle('active', active);
    elFav.setAttribute('aria-pressed', String(active));
    elFav.textContent = active ? "⭐️ В избранном" : "➕ В избранное";
  }
  elFav.addEventListener('click', ()=>{
    const a = favGet(); const i = a.indexOf(coin);
    if (i>=0) a.splice(i,1); else a.push(coin);
    favSet(a); refreshFavUI();
  });
  refreshFavUI();

  // ---- копирование ссылки ----
  btnCopy.addEventListener('click', async ()=>{
    try{
      const u = new URL(location.href);
      u.searchParams.set('instId', instId);
      u.searchParams.set('interval', qInterval);
      u.searchParams.set('src', qSrc);
      await navigator.clipboard.writeText(u.toString());
      elHint.textContent = "Ссылка скопирована.";
    }catch(_){ elHint.innerHTML = '<span class="err">Не удалось скопировать ссылку.</span>'; }
  });

  // ---- статус + «последнее обновление» ----
  let lastServerTsMs = 0;
  const setStatus = (mode, labelText) => {
    elDot.classList.remove('online','degraded','offline');
    elDot.classList.add(mode); // online|degraded|offline
    // подпись в поповере статична; краткий вспомогательный текст — в подсказке у логотипа:
    elDockLogo.title = labelText || '';
  };
  function setLastUpdTick(tsMs){
    lastServerTsMs = Math.max(lastServerTsMs, tsMs|0);
    if (!elLastUpd) return;
    const tick = ()=>{
      if (!lastServerTsMs){ elLastUpd.textContent = "последнее обновление: нет данных"; return; }
      const diff = Math.max(0, Date.now()-lastServerTsMs);
      const s = Math.floor(diff/1000);
      elLastUpd.textContent = s<60 ? `последнее обновление: ${s} сек назад` : `последнее обновление: ${Math.floor(s/60)} мин назад`;
    };
    tick(); setInterval(tick, 1000);
  }

  // ---- маппинг интервалов ----
  const intervalToOkxBar = (min)=>{
    const m = Number(min||60);
    if (m===15) return '15m';
    if (m===60) return '1H';
    if (m===240) return '4H';
    if (m===480) return '8H';
    if (m===720) return '12H';
    return '1D';
  };
  const intervalToWsChannel = (min)=>{
    const m = Number(min||60);
    if (m===15) return 'candle15m';
    if (m===60) return 'candle1H';
    if (m===240) return 'candle4H';
    if (m===480) return 'candle8H';
    if (m===720) return 'candle12H';
    return 'candle1D';
  };

  // ---- рендер по источникам ----
  let chart, series, ws, wsAlive=false, pingTimer=0, reconnTimer=0;
  function destroyChart(){
    try{ ws && ws.close(); }catch(_){}
    ws=null; wsAlive=false;
    try{ pingTimer&&clearInterval(pingTimer); reconnTimer&&clearTimeout(reconnTimer);}catch(_){}
    try{ chart && chart.remove(); }catch(_){}
    chart = series = null;
  }

  function mountOKX(){
    destroyChart();
    setStatus('offline','Подключаемся к OKX…');

    chart = LightweightCharts.createChart(elChart, {
      layout: { background: { color:'#0b0f14' }, textColor:'#e6e6e6' },
      grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor:'#2a3542' },
      timeScale: { borderColor:'#2a3542', timeVisible: true, secondsVisible: false },
      handleScroll: true, handleScale: true,
    });
    series = chart.addCandlestickSeries({
      upColor:'#26a69a', downColor:'#ef5350', borderVisible:false, wickUpColor:'#26a69a', wickDownColor:'#ef5350',
    });

    const okxBar = intervalToOkxBar(qInterval);
    const wsChan = intervalToWsChannel(qInterval);

    (async function loadHistory(){
      try{
        const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(okxBar)}&limit=500`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        const arr = Array.isArray(j.data) ? j.data : [];
        const toCandle = row => ({ time: Math.floor(Number(row[0])/1000), open:+row[1], high:+row[2], low:+row[3], close:+row[4] });
        const candles = arr.slice().reverse().map(toCandle);
        series.setData(candles);
        if (candles.length){ setLastUpdTick(candles[candles.length-1].time*1000); }
        chart.timeScale().fitContent();
        if (!wsAlive) setStatus('degraded','История загружена (REST)');
      }catch(e){
        setStatus('offline','Нет связи с источниками');
        elHint.innerHTML = `<span class="err">Ошибка REST OKX: ${e?.message||e}</span>`;
      }
    })();

    // WebSocket live
    (function connectWS(){
      const url = 'wss://ws.okx.com/ws/v5/public';
      try{ ws && ws.close(); }catch(_){}
      ws = new WebSocket(url);
      ws.addEventListener('open', ()=>{
        wsAlive = true;
        setStatus('online','Онлайн (WebSocket)');
        ws.send(JSON.stringify({op:'subscribe', args:[{channel: wsChan, instId}]}));
        pingTimer = setInterval(()=>{ try{ ws.send(JSON.stringify({op:'ping'})); }catch(_){ } }, 20_000);
      });
      ws.addEventListener('message', ev=>{
        try{
          const m = JSON.parse(ev.data);
          if (m.event==='subscribe' || m.op==='pong') return;
          if (m.arg && Array.isArray(m.data)){
            m.data.forEach(row=>{
              const c = { time: Math.floor(Number(row[0])/1000), open:+row[1], high:+row[2], low:+row[3], close:+row[4] };
              series.update(c);
              setLastUpdTick(c.time*1000);
            });
          }
        }catch(_){}
      });
      ws.addEventListener('close', ()=>{ wsAlive=false; setStatus('degraded','WebSocket отключён, работаем по REST'); reconnTimer=setTimeout(connectWS,5000); });
      ws.addEventListener('error', ()=>{ wsAlive=false; try{ws.close();}catch(_){} });
    })();
  }

  function mountTV(){
    destroyChart();
    setStatus('degraded','Источник: TradingView (виджет)');
    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = "https://s3.tradingview.com/tv.js";
      s.onload = () => mount();
      s.onerror= () => elHint.innerHTML = '<span class="err">Не удалось загрузить TradingView виджет</span>';
      document.head.appendChild(s);
    } else mount();

    function mount(){
      try{
        new TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: String(qInterval),
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "ru",
          withdateranges: true,
          allow_symbol_change: false,
          save_image: false,
          container_id: "chart",
        });
        elHint.textContent = "Источник графика: TradingView (виджет).";
      }catch(e){
        elHint.innerHTML = '<span class="err">Ошибка инициализации TradingView виджета</span>';
      }
    }
  }

  function mountVP(){
    destroyChart();
    setStatus('degraded','Volume Profile (демо-заглушка)');
    // Место для будущего рендера «полок»; пока просто затемняем фон и подпись.
    elHint.textContent = "Volume Profile: прототип (график будет добавлен позже).";
  }

  function mountBySource(src){
    if (src==='tv') return mountTV();
    if (src==='vp') return mountVP();
    return mountOKX(); // по умолчанию OKX
  }

  // старт
  mountBySource(qSrc);
})();
