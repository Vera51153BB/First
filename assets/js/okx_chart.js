/* Управление графиком. Мобильный UX: панель не «уезжает» при смене ТФ/источника. */
(function(){
  // ------ DOM
  const elTitle   = document.getElementById('title');
  const elChart   = document.getElementById('chart');
  const elHint    = document.getElementById('hint');

  const elStatusDot  = document.getElementById('status-dot');
  const elStatusText = document.getElementById('status-text');

  const elLastUpd = document.getElementById('last-upd');
  const elOkx     = document.getElementById('okx-link');
  const elTV      = document.getElementById('tv-link');
  const elCopy    = document.getElementById('btn-copy');
  const elFav     = document.getElementById('btn-fav');
  const elShelves = document.getElementById('btn-shelves');

  // Панель: сворачивание/разворачивание
  const elPanel      = document.getElementById('panel');
  const btnPanel     = document.getElementById('btn-panel');
  const btnCollapse  = document.getElementById('btn-collapse');
  const statusPop    = document.getElementById('status-popover');
  const btnSInfo     = document.getElementById('btn-status-info');
  const btnTipClose  = document.getElementById('btn-tip-close');

  // ------ URL / предпочтения
  const params  = new URLSearchParams(location.search);
  const qInstId = params.get('instId');
  const qCoin   = params.get('coin');

  // дефолты
  let state = {
    instId: qInstId ? sanitizeInst(qInstId) : `${sanitizeCoin(qCoin||'BTC')}-USDT-SWAP`,
    interval: toInt(params.get('interval'), 60),        // minutes; default 1h
    src: (params.get('src')||'okx').toLowerCase(),      // okx | tv
  };
  // enforced defaults per ТЗ:
  if (!state.src) state.src = 'okx';

  const coin  = state.instId.split('-')[0];
  const quote = state.instId.split('-')[1] || 'USDT';
  const tvSymbol = `OKX:${coin}${quote}.P`;

  elTitle.textContent = `${coin} • USDT-SWAP (OKX)`;
  elOkx.href = `https://www.okx.com/trade-swap/${coin}-USDT-SWAP`;
  elTV.href  = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;

  // ------ runtime объекты графика
  let lwChart = null;
  let lwSeries = null;
  let ws = null, wsAlive=false, pingTimer=0, reconnTimer=0;
  let lastServerTsMs = 0;

  // ------ helpers
  function sanitizeInst(s){ return (s||'').toUpperCase().replace(/[^A-Z0-9\-]/g,'').slice(0,40) }
  function sanitizeCoin(s){ return (s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,16) }
  function toInt(s,def){ const n = parseInt(String(s||''),10); return Number.isFinite(n)&&n>0?n:def }

  function okxBar(min){
    if (min<=1) return '1m';
    if (min===3) return '3m';
    if (min===5) return '5m';
    if (min===15) return '15m';
    if (min===30) return '30m';
    if (min===60) return '1H';
    if (min===120) return '2H';
    if (min===240) return '4H';
    if (min===480) return '8H';
    if (min===720) return '12H';
    return '1D';
  }
  function wsChan(min){
    if (min<=1) return 'candle1m';
    if (min===3) return 'candle3m';
    if (min===5) return 'candle5m';
    if (min===15) return 'candle15m';
    if (min===30) return 'candle30m';
    if (min===60) return 'candle1H';
    if (min===120) return 'candle2H';
    if (min===240) return 'candle4H';
    if (min===480) return 'candle8H';
    if (min===720) return 'candle12H';
    return 'candle1D';
  }

  // ------ UI инициализация
  markActiveInterval(state.interval);
  markActiveSource(state.src);
  wirePanelToggles();
  wireIntervals();
  wireSources();
  wireCommonActions();

  // старт с текущими настройками
  renderBySource();

  // =================== РЕНДЕР ===================
  function renderBySource(){
    destroyAll();
    if (state.src === 'tv'){
      setStatus('degraded','Источник: TradingView (виджет)');
      mountTradingView();
    }else{
      setStatus('offline','Подключаемся к OKX…');
      mountLightweight();
      bootstrapOkx();
    }
  }

  function mountLightweight(){
    lwChart = LightweightCharts.createChart(elChart, {
      layout: { background:{ color:'#0b0f14' }, textColor:'#e6e6e6' },
      grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
      crosshair:{ mode: 1 },
      rightPriceScale:{ borderColor:'#2a3542' },
      timeScale:{ borderColor:'#2a3542', timeVisible:true, secondsVisible:false },
      handleScroll:true, handleScale:true,
    });
    lwSeries = lwChart.addCandlestickSeries({
      upColor:'#26a69a', downColor:'#ef5350',
      borderVisible:false, wickUpColor:'#26a69a', wickDownColor:'#ef5350',
    });
  }

  async function bootstrapOkx(){
    lastServerTsMs = 0;
    await loadHistoryREST();
    lwChart.timeScale().fitContent();
    startClock();
    connectWS();
    startRestFallback();
  }

  async function loadHistoryREST(){
    try{
      const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(state.instId)}&bar=${encodeURIComponent(okxBar(state.interval))}&limit=500`;
      const res = await fetch(url, { method:'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const arr = Array.isArray(j.data) ? j.data : [];
      const candles = arr.slice().reverse().map(row=>{
        const ts = Number(row[0]); // ms
        return { time: Math.floor(ts/1000), open:+row[1], high:+row[2], low:+row[3], close:+row[4] };
      });
      lwSeries.setData(candles);
      if (candles.length){
        lastServerTsMs = Math.max(lastServerTsMs, candles.at(-1).time*1000);
        touchTick();
      }
      if (!wsAlive) setStatus('degraded','История загружена (REST)');
    }catch(err){
      showErr("Ошибка загрузки исторических свечей (REST)", err);
    }
  }

  function connectWS(){
    cleanupWS();
    const url = 'wss://ws.okx.com/ws/v5/public';
    ws = new WebSocket(url);
    ws.addEventListener('open', ()=>{
      wsAlive = true;
      setStatus('online','Онлайн (WebSocket)');
      sendWS({op:'subscribe', args:[{ channel: wsChan(state.interval), instId: state.instId }]});
      pingTimer = setInterval(()=> sendWS({op:'ping'}), 20_000);
    });
    ws.addEventListener('message', (ev)=>{
      try{
        const m = JSON.parse(ev.data);
        if (m.event === 'subscribe' || m.op === 'pong') return;
        if (m.event === 'error') { showErr("WS error: "+(m.msg||'')); return; }
        if (m.arg && Array.isArray(m.data)){
          m.data.forEach(row=>{
            const ts = Number(row[0]);
            lwSeries.update({ time: Math.floor(ts/1000), open:+row[1], high:+row[2], low:+row[3], close:+row[4] });
            lastServerTsMs = Math.max(lastServerTsMs, ts);
            touchTick();
          });
        }
      }catch(_){}
    });
    ws.addEventListener('close', ()=>{
      wsAlive = false;
      setStatus('degraded','WebSocket отключён, работаем по REST');
      scheduleReconnect();
    });
    ws.addEventListener('error', ()=>{
      wsAlive = false;
      setStatus('degraded','Ошибка WebSocket, восстановление…');
      try{ ws.close(); }catch(_){}
    });
  }
  function sendWS(obj){ try{ ws && ws.readyState===1 && ws.send(JSON.stringify(obj)); }catch(_){ } }
  function cleanupWS(){
    try{ pingTimer && clearInterval(pingTimer); }catch(_){}
    try{ reconnTimer && clearTimeout(reconnTimer); }catch(_){}
    try{ ws && ws.close(); }catch(_){}
    ws = null;
  }
  function scheduleReconnect(){ cleanupWS(); reconnTimer = setTimeout(connectWS, 5000) }

  function startRestFallback(){
    const REST_PLAN = { 15:120_000, 60:300_000, 240:900_000, 480:900_000, 720:1_200_000, 1440:1_800_000 };
    const restIntervalMs = REST_PLAN[state.interval] || 300_000;
    setInterval(async ()=>{ if (!wsAlive) await loadHistoryREST(); }, restIntervalMs);
  }

  function startClock(){ updateLastUpd(); setInterval(updateLastUpd, 1000) }
  function touchTick(){ updateLastUpd(true) }
  function updateLastUpd(){
    if (!lastServerTsMs){ elLastUpd.textContent = "…"; return; }
    const sec = Math.floor(Math.max(0, Date.now() - lastServerTsMs)/1000);
    elLastUpd.textContent = sec<60 ? `обн. ${sec}s` : `обн. ${Math.floor(sec/60)}m`;
  }

  function destroyAll(){
    cleanupWS();
    try{ lwChart && lwChart.remove(); }catch(_){}
    lwChart=null; lwSeries=null;
  }

  // ------ TradingView (альтернативный источник)
  function mountTradingView(){
    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = "https://s3.tradingview.com/tv.js";
      s.onload = ()=> tvMount(tvSymbol, state.interval);
      s.onerror= ()=> elHint.innerHTML = '<span class="err">Не удалось загрузить TradingView виджет</span>';
      document.head.appendChild(s);
    } else {
      tvMount(tvSymbol, state.interval);
    }
    function tvMount(symbol, intervalMin){
      try{
        new TradingView.widget({
          autosize:true, symbol, interval:String(intervalMin),
          timezone:"Etc/UTC", theme:"dark", style:"1", locale:"ru",
          withdateranges:true, allow_symbol_change:false, save_image:false,
          container_id:"chart",
        });
        elHint.textContent = "Источник графика: TradingView (виджет).";
      }catch(e){
        elHint.innerHTML = '<span class="err">Ошибка инициализации TradingView виджета</span>';
      }
    }
  }

  // =================== UI/STATUS ===================
  function setStatus(mode, text){
    elStatusDot.classList.remove('online','degraded','offline');
    elStatusDot.classList.add(mode);
    elStatusText.textContent = text || (mode==='online'?'Онлайн (WS)': mode==='degraded'?'Деградирован (REST)':'Оффлайн');
  }
  function showErr(msg, err){
    const s = (err && err.message) ? `${msg}: ${err.message}` : String(msg||'Ошибка');
    elHint.innerHTML = `<span class="err">${s}</span>`;
    setStatus('offline','Нет связи с источниками');
  }

  function markActiveInterval(v){
    document.querySelectorAll('#row-intervals .int').forEach(a=>{
      const val = toInt(a.getAttribute('data-int'), 60);
      a.classList.toggle('active', val===v);
    });
  }
  function markActiveSource(src){
    document.querySelectorAll('#row-sources .src').forEach(btn=>{
      const val = (btn.getAttribute('data-src')||'').toLowerCase();
      btn.classList.toggle('active', val===src);
    });
  }

  function wireIntervals(){
    document.querySelectorAll('#row-intervals .int').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const v = toInt(a.getAttribute('data-int'), state.interval);
        if (v === state.interval) return;
        state.interval = v;
        markActiveInterval(v);
        // обновим URL, но без перезагрузки
        const u = new URL(location.href);
        u.searchParams.set('instId', state.instId);
        u.searchParams.set('interval', String(v));
        u.searchParams.set('src', state.src);
        history.replaceState(null,'',u);
        // перерисовать источник
        renderBySource();
      });
    });
  }

  function wireSources(){
    document.querySelectorAll('#row-sources .src[data-src]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const src = (btn.getAttribute('data-src')||'okx').toLowerCase();
        if (src === state.src) return;
        state.src = src || 'okx';
        markActiveSource(state.src);
        const u = new URL(location.href);
        u.searchParams.set('instId', state.instId);
        u.searchParams.set('interval', String(state.interval));
        u.searchParams.set('src', state.src);
        history.replaceState(null,'',u);
        renderBySource();
      });
    });

    // «Полки» — заглушка открытия панели/слайда; здесь просто тост
    elShelves?.addEventListener('click', ()=>{
      elHint.textContent = "Полки по объёму: прототип (визуал появится здесь).";
      setTimeout(()=> elHint.textContent='', 2500);
    });
  }

  function wirePanelToggles(){
    const toggle = ()=>{
      const closed = elPanel.classList.toggle('closed');
      btnPanel.textContent   = closed ? '▴' : '▾';
      btnCollapse.textContent= closed ? '▴' : '▾';
      btnPanel.setAttribute('aria-expanded', String(!closed));
      btnCollapse.setAttribute('aria-expanded', String(!closed));
    };
    btnPanel.addEventListener('click', toggle);
    btnCollapse.addEventListener('click', toggle);

    btnSInfo.addEventListener('click', ()=>{
      const vis = statusPop.hasAttribute('hidden');
      if (vis) statusPop.removeAttribute('hidden'); else statusPop.setAttribute('hidden','');
      btnSInfo.setAttribute('aria-expanded', String(vis));
    });
    btnTipClose.addEventListener('click', ()=>{
      statusPop.setAttribute('hidden','');
      btnSInfo.setAttribute('aria-expanded','false');
    });
  }

  function wireCommonActions(){
    // локальное избранное: ключ fav_coins (интеграция с ботом — следующая итерация)
    const FAV_KEY = "fav_coins";
    const coinCode = coin;

    const favGet = ()=> { try{const x=JSON.parse(localStorage.getItem(FAV_KEY)||'[]'); return Array.isArray(x)?x:[] }catch(_){return []} };
    const favSet = (arr)=> { try{ localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }catch(_){} };
    const favHas = ()=> favGet().includes(coinCode);
    const favUI  = ()=>{
      const active = favHas();
      elFav.classList.toggle('active', active);
      elFav.setAttribute('aria-pressed', String(active));
      elFav.textContent = active ? "⭐️ В избранном" : "➕ В избранное";
    };
    elFav.addEventListener('click', ()=>{
      const a = favGet(); const i=a.indexOf(coinCode);
      if (i>=0) a.splice(i,1); else a.push(coinCode);
      favSet(a); favUI();
    });
    favUI();

    elCopy.addEventListener('click', async ()=>{
      try{
        const u = new URL(location.href);
        u.searchParams.set('instId', state.instId);
        u.searchParams.set('interval', String(state.interval));
        u.searchParams.set('src', state.src);
        await navigator.clipboard.writeText(u.toString());
        elHint.textContent = "Ссылка скопирована.";
        setTimeout(()=> elHint.textContent='', 1800);
      }catch(_){
        elHint.innerHTML = '<span class="err">Не удалось скопировать ссылку.</span>';
      }
    });
  }
})();
