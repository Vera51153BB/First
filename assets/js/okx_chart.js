/* 
  OKX Chart controller (vanilla JS)
  CHANGES:
    • поддержка TF: 15m, 1h, 4h, 8h, 12h, 1d (через data-int в минутах)
    • панель НЕ закрывается при смене TF/источника (ставим PANEL_STICKY в localStorage)
    • кнопка “📊 Полки”: примитивный overlay (MVP) — прямые гистограммы объёмов по ценовым корзинам
      (легко отключается; не влияет на сам график)
*/

(function(){
  // ---------- DOM ----------
  const elTitle   = document.getElementById('title');
  const elChart   = document.getElementById('chart');
  const elShelves = document.getElementById('shelves');
  const elHint    = document.getElementById('hint');

  const elStatusDot  = document.getElementById('status-dot');
  const elStatusText = document.getElementById('status-text');

  const elSym     = document.getElementById('sym');
  const elLastUpd = document.getElementById('last-upd');
  const elOkx     = document.getElementById('okx-link');
  const elTV      = document.getElementById('tv-link');
  const elCopy    = document.getElementById('btn-copy');
  const elFav     = document.getElementById('btn-fav');

  const btnVol    = document.getElementById('btn-vol');
  const btnVol2   = document.getElementById('btn-vol2');

  // ---------- URL / prefs ----------
  const params    = new URLSearchParams(location.search);
  const qInstId   = params.get('instId');
  const qCoin     = params.get('coin');
  let   qInterval = params.get('interval');             // minutes as string
  let   qSrc      = (params.get('src')||'').toLowerCase();

  const LS_INT = 'LAST_INTERVAL';
  const LS_SRC = 'LAST_SRC';
  const STICKY_KEY = (window.__panelCtl && window.__panelCtl.STICKY_KEY) || 'PANEL_STICKY';

  if (!qInterval) { const saved = localStorage.getItem(LS_INT); if (saved) qInterval = saved; }
  if (!qSrc)      { const saved = localStorage.getItem(LS_SRC); if (saved) qSrc = saved; }
  if (!qSrc) qSrc = 'okx';

  const clean = (s)=> (s||'').toUpperCase().replace(/[^A-Z0-9\-]/g,'').slice(0,30);
  const cleanNum = (s,def)=> { const n = parseInt(String(s||''),10); return Number.isFinite(n) && n>0 ? n : def; };

  let instId, coin, quote="USDT";
  if (qInstId){
    instId = clean(qInstId);
    const p = instId.split('-');
    coin  = (p[0]||'BTC').replace(/[^A-Z0-9]/g,'');
    quote = (p[1]||'USDT').replace(/[^A-Z0-9]/g,'') || "USDT";
  } else {
    coin = (qCoin||'BTC').toUpperCase().replace(/[^A-Z0-9]/g,'');
    instId = `${coin}-USDT-SWAP`;
  }

  const intervalMin = cleanNum(qInterval, 60); // default 1h
  const okxBar = intervalToOkxBar(intervalMin);
  const wsChan = intervalToWsChannel(intervalMin);

  // подписи/ссылки
  elTitle.textContent = `${coin} • USDT-SWAP (OKX)`;
  elSym.textContent   = `${coin}-USDT-SWAP`;
  elOkx.href = `https://www.okx.com/trade-swap/${coin}-USDT-SWAP`;
  const tvSymbol = `OKX:${coin}${quote}.P`;
  elTV.href  = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;

  // ------ выбор TF (липкая панель) ------
  document.querySelectorAll('#row-intervals .int').forEach(a=>{
    const v = parseInt(a.getAttribute('data-int')||'60',10);
    if (v === intervalMin) a.classList.add('active');
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      if (v === intervalMin) return;
      try{
        localStorage.setItem(LS_INT, String(v));
        localStorage.setItem(STICKY_KEY, '1'); // NOTE: просим оставить панель открытой после reload
      }catch(_){}
      const url = new URL(location.href);
      url.searchParams.set('instId', instId);
      url.searchParams.set('interval', String(v));
      url.searchParams.set('src', qSrc);
      location.replace(url.toString());
    });
  });

  // ------ источник графика ------
  document.querySelectorAll('#row-sources .src').forEach(btn=>{
    const src = btn.getAttribute('data-src');
    if (src === qSrc) btn.classList.add('active');
    btn.addEventListener('click', ()=>{
      if (src === qSrc) return;
      try{
        localStorage.setItem(LS_SRC, src);
        localStorage.setItem(STICKY_KEY, '1'); // NOTE: тоже держим панель раскрытой
      }catch(_){}
      const url = new URL(location.href);
      url.searchParams.set('instId', instId);
      url.searchParams.set('interval', String(intervalMin));
      url.searchParams.set('src', src);
      location.replace(url.toString());
    });
  });

  // Общие действия
  initCommonActions();

  // ---------- Рендер по источнику ----------
  if (qSrc === 'tv'){
    setStatus('degraded', 'Источник: TradingView (виджет)');
    elLastUpd.textContent = "последнее обновление: недоступно (виджет)";
    renderTradingView(tvSymbol, intervalMin);
  } else {
    setStatus('offline', 'Подключаемся к OKX…');
    renderOkxChart();
  }

  // =========================================================
  // OKX режим (REST + WS)
  // =========================================================
  function renderOkxChart(){
    const chart = LightweightCharts.createChart(elChart, {
      layout: { background: { color:'#0b0f14' }, textColor:'#e6e6e6' },
      grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor:'#2a3542' },
      timeScale: { borderColor:'#2a3542', timeVisible: true, secondsVisible: false },
      handleScroll: true, handleScale: true,
    });
    const series = chart.addCandlestickSeries({
      upColor:'#26a69a', downColor:'#ef5350', borderVisible:false, wickUpColor:'#26a69a', wickDownColor:'#ef5350',
    });

    // NOTE: state для “полок”
    let shelvesOn = false;
    let lastDataForShelves = [];

    // ресайз холста полок
    function resizeShelves(){
      const rect = elChart.getBoundingClientRect();
      elShelves.width = Math.max(1, Math.floor(rect.width));
      elShelves.height= Math.max(1, Math.floor(rect.height));
      if (shelvesOn) drawShelves();
    }
    new ResizeObserver(resizeShelves).observe(elChart);

    // кнопки “Полки”
    function toggleShelves(){
      shelvesOn = !shelvesOn;
      drawShelves();
    }
    function drawShelves(){
      const ctx = elShelves.getContext('2d');
      ctx.clearRect(0,0,elShelves.width, elShelves.height);
      if (!shelvesOn || !lastDataForShelves.length) return;

      // простая гистограмма по ценовым корзинам (MVP)
      const buckets = 24; // можно подобрать
      const maxH = elShelves.height * 0.25;
      const { min, max } = lastDataForShelves.reduce((a,c)=>({
        min: Math.min(a.min, c.low),
        max: Math.max(a.max, c.high)
      }), {min:+Infinity, max:-Infinity});
      if (!isFinite(min) || !isFinite(max) || min >= max) return;

      const h = (max-min)/buckets;
      const arr = new Array(buckets).fill(0);
      lastDataForShelves.forEach(c=>{
        const price = c.close;
        let idx = Math.floor((price - min) / h);
        idx = Math.max(0, Math.min(buckets-1, idx));
        arr[idx] += (c.volume || 1); // REST свечи без vol → fallback 1
      });
      const maxVol = Math.max(...arr) || 1;

      const w = elShelves.width / buckets;
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      arr.forEach((v, i)=>{
        const bh = Math.max(2, (v / maxVol) * maxH);
        const x = i * w;
        const y = elShelves.height - bh;
        ctx.fillRect(x, y, Math.max(2, w*0.8), bh);
      });
    }
    btnVol?.addEventListener('click', toggleShelves);
    btnVol2?.addEventListener('click', toggleShelves);

    // ------- история + ws -------
    let lastServerTsMs = 0;
    let ws = null, wsAlive=false, pingTimer=0, reconnTimer=0;

    const REST_PLAN = { 15:120_000, 60:300_000, 240:900_000, 480:900_000, 720:1_200_000, 1440:1_800_000 };
    const restIntervalMs = REST_PLAN[intervalMin] || 300_000;

    bootstrap().catch(err => showErr('Не удалось инициализировать график', err));

    async function bootstrap(){
      await loadHistoryREST(instId, okxBar, series);
      chart.timeScale().fitContent();
      startClock();
      connectWS();
      startRestFallback();
      resizeShelves();
    }

    function startClock(){
      updateLastUpd();
      setInterval(updateLastUpd, 1000);
    }
    function touchTick(){ updateLastUpd(true); }
    function updateLastUpd(){
      if (!lastServerTsMs){ elLastUpd.textContent = "последнее обновление: нет данных"; return; }
      const diff = Math.max(0, Date.now() - lastServerTsMs);
      const sec = Math.floor(diff/1000);
      elLastUpd.textContent = sec < 60 ? `последнее обновление: ${sec} сек назад` :
                                         `последнее обновление: ${Math.floor(sec/60)} мин назад`;
    }

    async function loadHistoryREST(instId, bar, series){
      try{
        const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(bar)}&limit=500`;
        const res = await fetch(url, { method:'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        const arr = Array.isArray(j.data) ? j.data : [];
        const candles = arr.slice().reverse().map(toCandle);
        series.setData(candles);
        lastDataForShelves = candles.map(c=>({ close:c.close, high:c.high, low:c.low, volume:1 }));
        if (candles.length){
          lastServerTsMs = Math.max(lastServerTsMs, candles.at(-1).time*1000);
          touchTick();
        }
        elHint.textContent = "История загружена (REST). Подключаем WebSocket…";
        if (!wsAlive) setStatus('degraded', 'История загружена (REST)');
        if (shelvesOn) drawShelves();
      }catch(err){
        showErr("Ошибка загрузки исторических свечей (REST)", err);
      }
    }

    function toCandle(row){
      const ts = Number(row[0]); // ms
      return {
        time: Math.floor(ts/1000),
        open:  Number(row[1]),
        high:  Number(row[2]),
        low:   Number(row[3]),
        close: Number(row[4]),
      };
    }

    function connectWS(){
      cleanupWS();
      const url = 'wss://ws.okx.com/ws/v5/public';
      ws = new WebSocket(url);
      ws.addEventListener('open', ()=>{
        wsAlive = true;
        setStatus('online', 'Онлайн (WebSocket)');
        sendWS({"op":"subscribe","args":[{"channel": wsChan, "instId": instId}]});
        pingTimer = setInterval(()=> sendWS({"op":"ping"}), 20_000);
      });
      ws.addEventListener('message', (ev)=>{
        try{
          const m = JSON.parse(ev.data);
          if (m.event === 'subscribe' || m.op === 'pong') return;
          if (m.event === 'error') { showErr("WS error: "+(m.msg||'')); return; }
          if (m.arg && m.data && Array.isArray(m.data)){
            m.data.forEach(row=>{
              const c = toCandle(row);
              series.update(c);
              // обновляем лёгкую статистику для “полок”
              lastDataForShelves.push({ close:c.close, high:c.high, low:c.low, volume:1 });
              if (lastDataForShelves.length > 600) lastDataForShelves.shift();
              if (shelvesOn) drawShelves();

              lastServerTsMs = Math.max(lastServerTsMs, c.time*1000);
              touchTick();
            });
          }
        }catch(_){}
      });
      ws.addEventListener('close', ()=>{
        wsAlive = false;
        setStatus('degraded', 'WebSocket отключён, работаем по REST');
        scheduleReconnect();
      });
      ws.addEventListener('error', ()=>{
        wsAlive = false;
        setStatus('degraded', 'Ошибка WebSocket, попытка восстановления…');
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
    function scheduleReconnect(){ cleanupWS(); reconnTimer = setTimeout(connectWS, 5000); }
    function startRestFallback(){
      setInterval(async ()=>{ if (!wsAlive) await loadHistoryREST(instId, okxBar, series); }, restIntervalMs);
    }

    function showErr(msg, err){
      const s = (err && err.message) ? `${msg}: ${err.message}` : String(msg||'Ошибка');
      elHint.innerHTML = `<span class="err">${s}</span><br>
        Если данные недоступны, откройте инструмент на OKX:
        <a href="${elOkx.href}" target="_blank" rel="noopener">${coin}-USDT-SWAP на OKX</a>`;
      setStatus('offline', 'Нет связи с источниками');
    }
  }

  // =========================================================
  // TradingView режим
  // =========================================================
  function renderTradingView(tvSymbol, intervalMin){
    if (!window.TradingView){
      const s = document.createElement('script');
      s.src = "https://s3.tradingview.com/tv.js";
      s.onload = ()=> mountTV(tvSymbol, intervalMin);
      s.onerror= ()=> elHint.innerHTML = '<span class="err">Не удалось загрузить TradingView виджет</span>';
      document.head.appendChild(s);
    }else{
      mountTV(tvSymbol, intervalMin);
    }
    function mountTV(symbol, intervalMin){
      try{
        new TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: String(intervalMin),
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

  // =========================================================
  // Индикатор состояния + общие действия
  // =========================================================
  function setStatus(mode, text){
    elStatusDot.classList.remove('online','degraded','offline');
    elStatusDot.classList.add(mode);

    let label = '';
    if (mode === 'online')   label = '🟢 Онлайн (WS) — данные обновляются в реальном времени.';
    if (mode === 'degraded') label = '🟡 Деградирован (REST) — WebSocket временно недоступен, данные периодически подгружаются.';
    if (mode === 'offline')  label = '🔴 Оффлайн — нет связи с источниками.';

    elStatusText.textContent = text || (
      mode==='online' ? 'Онлайн (WS)' :
      mode==='degraded' ? 'Деградирован (REST)' : 'Оффлайн'
    );
    elStatusDot.title  = label;
    elStatusText.title = 'Нажмите i для справки';
  }

  function initCommonActions(){
    // Избранное (локально)
    const FAV_KEY = "fav_coins";
    function favGet(){ try{ const x = JSON.parse(localStorage.getItem(FAV_KEY)||'[]'); return Array.isArray(x)?x:[]; }catch(_){return [];} }
    function favSet(arr){ try{ localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }catch(_){ } }
    function favHas(){ return favGet().includes(coin); }
    function favToggle(){ const a = favGet(); const i = a.indexOf(coin); if (i>=0) a.splice(i,1); else a.push(coin); favSet(a); refreshFavUI(); }
    function refreshFavUI(){
      const active = favHas();
      elFav.classList.toggle('active', active);
      elFav.setAttribute('aria-pressed', String(active));
      elFav.textContent = active ? "⭐️ В избранном" : "⭐️ Добавить в избранное";
    }
    elFav?.addEventListener('click', favToggle);
    refreshFavUI();

    // Скопировать ссылку
    elCopy?.addEventListener('click', async ()=>{
      try{
        localStorage.setItem(LS_INT, String(intervalMin));
        localStorage.setItem(LS_SRC, qSrc);
        const u = new URL(location.href);
        u.searchParams.set('instId', instId);
        u.searchParams.set('interval', String(intervalMin));
        u.searchParams.set('src', qSrc);
        await navigator.clipboard.writeText(u.toString());
        elHint.textContent = "Ссылка скопирована.";
      }catch(_){
        elHint.innerHTML = '<span class="err">Не удалось скопировать ссылку.</span>';
      }
    });
  }

  // =========================================================
  // helpers
  // =========================================================
  function intervalToOkxBar(min){
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
    if (min>=1440) return '1D';
    return '1H';
  }
  function intervalToWsChannel(min){
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
    if (min>=1440) return 'candle1D';
    return 'candle1H';
  }
})();
