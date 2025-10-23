/* OKX график + док-строка + полки по объёму (минимальная визуализация) */
(function(){
  // ---------- DOM ----------
  const elTitle = document.getElementById('title');
  const elWrap  = document.getElementById('chart-wrap');
  const elChart = document.getElementById('chart');
  const elShelv = document.getElementById('shelves');
  const elHint  = document.getElementById('hint');

  // Док-строка
  const elStatusDot  = document.getElementById('status-dot');
  const elStatusText = document.getElementById('status-text');

  // Панель / ссылки
  const elSym     = document.getElementById('sym');
  const elLastUpd = document.getElementById('last-upd');
  const elOkx     = document.getElementById('okx-link');
  const elTV      = document.getElementById('tv-link');
  const elCopy    = document.getElementById('btn-copy');
  const elFav     = document.getElementById('btn-fav');

  // Полки по объёму — кнопки
  const btnVol  = document.getElementById('btn-vol');
  const btnVol2 = document.getElementById('btn-vol2');

  // ---------- URL / prefs ----------
  const params  = new URLSearchParams(location.search);
  const qInstId = params.get('instId') || params.get('inst') || null;
  const qCoin   = params.get('coin');
  let   qInt    = params.get('interval') || params.get('tf'); // минуты (строка)
  let   qSrc    = (params.get('src')||'').toLowerCase(); // okx|tv

  const LS_INT = 'LAST_INTERVAL';
  const LS_SRC = 'LAST_SRC';

  if (!qInt){ const s = localStorage.getItem(LS_INT); if (s) qInt = s; }
  if (!qSrc){ const s = localStorage.getItem(LS_SRC); if (s) qSrc = s; }
  if (!qSrc) qSrc = 'okx';

  const clean = (s)=> (s||'').toUpperCase().replace(/[^A-Z0-9\-]/g,'').slice(0,40);
  const cleanNum = (s,def)=> { const n = parseInt(String(s||''),10); return Number.isFinite(n)&&n>0 ? n : def; };

  let instId, coin, quote="USDT";
  if (qInstId){
    instId = clean(qInstId);
    const p = instId.split('-'); coin = (p[0]||'BTC').replace(/[^A-Z0-9]/g,'');
    quote = (p[1]||'USDT').replace(/[^A-Z0-9]/g,'') || "USDT";
  } else {
    coin = (qCoin||'BTC').toUpperCase().replace(/[^A-Z0-9]/g,'');
    instId = `${coin}-USDT-SWAP`;
  }

  const intervalMin = cleanNum(qInt, 60);
  const okxBar = tfToOkxBar(intervalMin);
  const wsChan = tfToWsChan(intervalMin);

  // Заголовок/ссылки
  elTitle.textContent = `${coin} • USDT-SWAP (OKX)`;
  elSym.textContent   = `${coin}-USDT-SWAP`;
  elOkx.href = `https://www.okx.com/trade-swap/${coin}-USDT-SWAP`;
  const tvSymbol = `OKX:${coin}${quote}.P`;
  elTV.href  = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;

  // Выбор TF
  document.querySelectorAll('#row-intervals .int').forEach(a=>{
    const v = parseInt(a.getAttribute('data-int')||'60',10);
    if (v === intervalMin) a.classList.add('active');
    a.addEventListener('click', (e)=>{
      e.preventDefault(); if (v === intervalMin) return;
      localStorage.setItem(LS_INT, String(v));
      const url = new URL(location.href);
      url.searchParams.set('instId', instId);
      url.searchParams.set('interval', String(v));
      url.searchParams.set('src', qSrc);
      location.replace(url.toString());
    });
  });

  // Источник
  document.querySelectorAll('#row-sources .src').forEach(btn=>{
    const src = btn.getAttribute('data-src');
    if (src === qSrc) btn.classList.add('active');
    btn.addEventListener('click', ()=>{
      if (src === qSrc) return;
      localStorage.setItem(LS_SRC, src);
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
  // OKX режим (REST + WS) + полки
  // =========================================================
  function renderOkxChart(){
    const chart = LightweightCharts.createChart(elChart, {
      layout: { background: { color:'#0b0f14' }, textColor:'#e6e6e6' },
      grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor:'#2a3542' },
      timeScale: { borderColor:'#2a3542', timeVisible: true, secondsVisible: false },
      handleScroll: true, handleScale: true,
    });
    const series = chart.addCandlestickSeries({
      upColor:'#26a69a', downColor:'#ef5350', borderVisible:false, wickUpColor:'#26a69a', wickDownColor:'#ef5350',
    });

    // ресайз: аккуратно тянем график и полки
    const ro = new ResizeObserver(() => {
      sizeShelvesCanvas();
      drawShelves();            // перерисовать полки
      // подгон масштаба не насилуем: пользователь мог приблизить
    });
    ro.observe(elWrap);

    let lastServerTsMs = 0;
    let ws=null, wsAlive=false, pingTimer=0, reconnTimer=0;

    // План REST-подтяжки, если WS недоступен
    const REST_PLAN = { 15:120_000, 60:300_000, 240:900_000, 480:1_200_000, 720:1_500_000, 1440:1_800_000 };
    const restIntervalMs = REST_PLAN[intervalMin] || 300_000;

    // Данные для «полок»
    let candles = [];     // [{time,open,high,low,close}]
    let shelvesOn = false;

    // кнопки «Полки»
    function toggleShelves(){
      shelvesOn = !shelvesOn;
      drawShelves();
      const msg = shelvesOn ? "Полки включены" : "Полки выключены";
      elHint.textContent = msg + " (MVP)";
      (btnVol || {}).classList?.toggle('active', shelvesOn);
      (btnVol2|| {}).classList?.toggle('active', shelvesOn);
    }
    btnVol  && btnVol .addEventListener('click', toggleShelves);
    btnVol2 && btnVol2.addEventListener('click', toggleShelves);

    sizeShelvesCanvas();   // первичная инициализация

    bootstrap().catch(err => showErr('Не удалось инициализировать график', err));

    async function bootstrap(){
      await loadHistoryREST(instId, okxBar, series);
      chart.timeScale().fitContent();
      startClock();
      connectWS();
      startRestFallback();
    }

    function startClock(){
      updateLastUpd();
      setInterval(updateLastUpd, 1000);
    }
    function touchTick(){ updateLastUpd(true); }
    function updateLastUpd(){
      if (!lastServerTsMs){
        elLastUpd.textContent = "последнее обновление: нет данных"; return;
      }
      const sec = Math.floor(Math.max(0, Date.now() - lastServerTsMs)/1000);
      elLastUpd.textContent = sec < 60
        ? `последнее обновление: ${sec} сек назад`
        : `последнее обновление: ${Math.floor(sec/60)} мин назад`;
    }

    async function loadHistoryREST(instId, bar, series){
      try{
        const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(bar)}&limit=500`;
        const res = await fetch(url, { method:'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        const arr = Array.isArray(j.data) ? j.data : [];
        candles = arr.slice().reverse().map(toCandle);
        series.setData(candles);
        if (candles.length){
          lastServerTsMs = Math.max(lastServerTsMs, candles[candles.length-1].time*1000);
          touchTick();
        }
        drawShelves(); // пересчёт полок
        elHint.textContent = "История загружена (REST). Подключаем WebSocket…";
        if (!wsAlive) setStatus('degraded', 'История загружена (REST)');
      }catch(err){ showErr("Ошибка загрузки исторических свечей (REST)", err); }
    }

    function toCandle(row){
      const ts = Number(row[0]); // ms
      return { time: Math.floor(ts/1000), open:+row[1], high:+row[2], low:+row[3], close:+row[4] };
    }

    function connectWS(){
      cleanupWS();
      const url = 'wss://ws.okx.com/ws/v5/public';
      ws = new WebSocket(url);
      ws.addEventListener('open', ()=>{
        wsAlive = true;
        setStatus('online', 'Онлайн (WebSocket)');
        sendWS({op:"subscribe", args:[{channel: wsChan, instId}]});
        pingTimer = setInterval(()=> sendWS({op:"ping"}), 20_000);
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
              // обновляем локальный массив (замена последней свечи или пуш)
              if (candles.length && candles[candles.length-1].time === c.time){
                candles[candles.length-1] = c;
              } else {
                candles.push(c);
                if (candles.length > 600) candles.shift();
              }
              lastServerTsMs = Math.max(lastServerTsMs, c.time*1000);
            });
            drawShelves();
            touchTick();
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
    function sendWS(o){ try{ ws && ws.readyState===1 && ws.send(JSON.stringify(o)); }catch(_){ } }
    function cleanupWS(){
      try{ pingTimer && clearInterval(pingTimer); }catch(_){}
      try{ reconnTimer && clearTimeout(reconnTimer); }catch(_){}
      try{ ws && ws.close(); }catch(_){}
      ws = null;
    }
    function scheduleReconnect(){ cleanupWS(); reconnTimer = setTimeout(connectWS, 5000); }
    function startRestFallback(){
      setInterval(async ()=>{
        if (!wsAlive) await loadHistoryREST(instId, okxBar, series);
      }, restIntervalMs);
    }

    function showErr(msg, err){
      const s = (err && err.message) ? `${msg}: ${err.message}` : String(msg||'Ошибка');
      elHint.innerHTML = `<span class="err">${s}</span>`;
      setStatus('offline', 'Нет связи с источниками');
    }

    // -------------- Полки по объёму (MVP) ----------------
    function sizeShelvesCanvas(){
      const r = elWrap.getBoundingClientRect();
      elShelv.width  = Math.max(1, Math.floor(r.width));
      elShelv.height = Math.max(1, Math.floor(r.height));
    }

    function drawShelves(){
      const ctx = elShelv.getContext('2d');
      ctx.clearRect(0,0,elShelv.width, elShelv.height);
      if (!candles.length || !btnsActive()) return;

      // вычисляем диапазон цены
      let lo=+Infinity, hi=-Infinity, maxVol=0;
      for (const c of candles){ lo=Math.min(lo,c.low); hi=Math.max(hi,c.high); }

      // бины по цене (24 горизонтальные полки)
      const BINS = 24;
      const bins = new Array(BINS).fill(0);

      // очень простой объём: близкий к "объём на цене закрытия"
      // (замена на реальный volume-by-price возможна позже)
      for (const c of candles){
        const idx = Math.min(BINS-1, Math.max(0, Math.floor((c.close - lo) / (hi - lo + 1e-9) * BINS)));
        const vol = Math.max(1, Math.abs(c.close - c.open)); // суррогат «объёма»
        bins[idx] += vol;
        if (bins[idx] > maxVol) maxVol = bins[idx];
      }
      if (maxVol <= 0) return;

      // рисуем правые горизонтальные бары (ширина до 30% области)
      const w = elShelv.width, h = elShelv.height;
      const barMaxW = Math.round(w * 0.28);
      const cellH = h / BINS;

      ctx.save();
      ctx.globalAlpha = 0.28;
      for (let i=0;i<BINS;i++){
        const ratio = bins[i] / maxVol;
        const bw = Math.max(2, Math.round(ratio * barMaxW));
        const y  = Math.round(h - (i+1)*cellH);
        const x0 = w - bw - 6;     // прижимаем к правому краю с отступом
        // цвет в зависимости от преобладания бычьих/медвежьих свечей в бине (упрощённо)
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.fillRect(x0, y+2, bw, Math.max(2, Math.round(cellH-4)));
      }
      ctx.restore();
    }

    function btnsActive(){ return (btnVol?.classList?.contains('active') || btnVol2?.classList?.contains('active')); }
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
    }else{ mountTV(tvSymbol, intervalMin); }

    function mountTV(symbol, intervalMin){
      try{
        new TradingView.widget({
          autosize: true, symbol, interval: String(intervalMin),
          timezone: "Etc/UTC", theme: "dark", style: "1", locale: "ru",
          withdateranges: true, allow_symbol_change: false, save_image: false,
          container_id: "chart",
        });
        elHint.textContent = "Источник графика: TradingView (виджет).";
      }catch(e){
        elHint.innerHTML = '<span class="err">Ошибка инициализации TradingView виджета</span>';
      }
    }
  }

  // =========================================================
  // Индикатор состояния + общее
  // =========================================================
  function setStatus(mode, text){
    elStatusDot.classList.remove('online','degraded','offline');
    elStatusDot.classList.add(mode);

    let label = '';
    if (mode==='online')   label='🟢 Онлайн (WS) — данные обновляются в реальном времени.';
    if (mode==='degraded') label='🟡 Деградирован (REST) — периодические обновления.';
    if (mode==='offline')  label='🔴 Оффлайн — нет связи с источниками.';

    elStatusText.textContent = text || (mode==='online'?'Онлайн (WS)':mode==='degraded'?'Деградирован (REST)':'Оффлайн');
    elStatusDot.title  = label;
    elStatusText.title = 'Нажмите i для справки';
  }

  function initCommonActions(){
    // избранное (локально)
    const FAV_KEY="fav_coins";
    function favGet(){ try{ const x=JSON.parse(localStorage.getItem(FAV_KEY)||'[]'); return Array.isArray(x)?x:[]; }catch(_){return [];} }
    function favSet(a){ try{ localStorage.setItem(FAV_KEY, JSON.stringify(a)); }catch(_){ } }
    const coin = (document.getElementById('sym').textContent||'BTC').split('-')[0];
    function favHas(){ return favGet().includes(coin); }
    function favToggle(){ const a=favGet(); const i=a.indexOf(coin); if(i>=0)a.splice(i,1);else a.push(coin); favSet(a); refreshFavUI(); }
    function refreshFavUI(){
      const active = favHas();
      elFav.classList.toggle('active', active);
      elFav.setAttribute('aria-pressed', String(active));
      elFav.textContent = active ? "⭐️ В избранном" : "⭐️ Добавить в избранное";
    }
    elFav.addEventListener('click', favToggle);
    refreshFavUI();

    // копия ссылки
    elCopy.addEventListener('click', async ()=>{
      try{
        localStorage.setItem(LS_INT, String(tfFromPage()));
        localStorage.setItem(LS_SRC, (new URL(location.href)).searchParams.get('src')||'okx');
        const u = new URL(location.href);
        await navigator.clipboard.writeText(u.toString());
        elHint.textContent = "Ссылка скопирована.";
      }catch(_){ elHint.innerHTML = '<span class="err">Не удалось скопировать ссылку.</span>'; }
    });
  }

  function tfFromPage(){
    const act = document.querySelector('#row-intervals .int.active');
    return act ? parseInt(act.getAttribute('data-int')||'60',10) : 60;
  }

  // маппинги TF
  function tfToOkxBar(min){
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
  function tfToWsChan(min){
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
