/* -*- coding: utf-8 -*-  First/assets/js/okx_chart.js
   Делает три вещи:
   1) Рисует свечи по OKX REST /api/v5/market/candles (Lightweight-Charts).
   2) Вверху выводит СФОРМИРОВАННУЮ ссылку на страницу инструмента OKX:
      https://www.okx.com/ru/markets/swap-info/<base>-usdt-swap
   3) Показывает также прямую ссылку на текущую страницу (для отладки).
   Параметры берём из URL (?inst=BTC-USDT-SWAP&tf=1H), иначе ищем "XXX-USDT-SWAP" в тексте.
*/
(function () {
  // ---------- helpers ----------
  const qs = new URLSearchParams(location.search);

  function resolveInstId() {
    const fromQuery = (qs.get('inst') || '').trim().toUpperCase();
    if (/^[A-Z0-9]+-USDT-SWAP$/.test(fromQuery)) return fromQuery;

    // запасной вариант — вытащим из текста страницы
    const text = document.body.innerText || '';
    const m = text.match(/\b([A-Z0-9]+-USDT-SWAP)\b/);
    if (m) return m[1];

    return 'BTC-USDT-SWAP';
  }

  function resolveTF() {
    const tf = (qs.get('tf') || '1H').toUpperCase()
      .replace(/MIN|MN|MINS?/i,'M').replace(/^(\d+)h$/i, (_,n)=>`${n}H`);
    const ok = new Set(['1M','3M','5M','15M','30M','1H','4H','6H','12H','1D','1W','1MO']);
    return ok.has(tf) ? tf : '1H';
  }

  // Ссылка на сайт OKX в нужном формате
  function toOkxSiteUrl(instId, locale='ru') {
    // примеры: BTC-USDT-SWAP -> /ru/markets/swap-info/btc-usdt-swap
    const [base, quote, swap] = instId.split('-');
    return `https://www.okx.com/${locale}/markets/swap-info/${base.toLowerCase()}-${quote.toLowerCase()}-${swap.toLowerCase()}`;
  }

  function dbg(tag, obj){ try{ console.log(`[chart] ${tag}:`, obj); }catch(_){} }

  // ---------- DOM ----------
  const $container = document.getElementById('chart');
  const $err       = document.getElementById('chart-error');
  const $title     = document.getElementById('pair-title');
  const $okxLink   = document.getElementById('okx-link');
  const $selfLink  = document.getElementById('self-link');

  // ---------- inputs ----------
  const instId = resolveInstId();     // "BTC-USDT-SWAP"
  const tf     = resolveTF();         // "1H" по умолчанию

  // 1) сформированные ссылки наверху страницы
  const okxHref = toOkxSiteUrl(instId, 'ru');
  if ($okxLink){ $okxLink.href = okxHref; $okxLink.textContent = okxHref; }
  if ($selfLink){ $selfLink.href = location.href; $selfLink.textContent = location.href; }

  // 2) заголовок
  if ($title) $title.textContent = `${instId} • OKX (${tf})`;

  // лог входа
  dbg('formed page', { instId, tf, okxHref });

  function showError(msg){
    if (!$err) return;
    $err.textContent = msg || 'Ошибка';
    $err.hidden = false;
  }
  function hideError(){ if ($err) $err.hidden = true; }

  // ---------- свечи OKX ----------
  async function renderOkxCandles(instId, bar){
    hideError();

    // ВАЖНО: не называем переменную chart, чтобы не пересечься с div#chart
    const chartApi = LightweightCharts.createChart($container, {
      layout: { background: { color:'#0b0f14' }, textColor:'#e6e6e6' },
      grid:   { vertLines:{ color:'#1c232b' }, horzLines:{ color:'#1c232b' } },
      rightPriceScale: { borderColor:'#2a3542' },
      timeScale: { borderColor:'#2a3542', timeVisible:true, secondsVisible:false }
    });

    const series = chartApi.addCandlestickSeries({
      upColor:'#26a69a', downColor:'#ef5350', borderVisible:false,
      wickUpColor:'#26a69a', wickDownColor:'#ef5350'
    });

    const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(bar)}&limit=300`;
    dbg('fetch', url);

    const r = await fetch(url, {mode:'cors'});
    const j = await r.json();

    if (!j || j.code !== '0' || !Array.isArray(j.data) || j.data.length === 0){
      throw new Error(`OKX REST error: ${j ? j.msg : 'no data'}`);
    }

    const data = j.data.slice().reverse().map(row => ({
      time:  Math.floor(Number(row[0]) / 1000),
      open:  Number(row[1]),
      high:  Number(row[2]),
      low:   Number(row[3]),
      close: Number(row[4]),
    }));

    series.setData(data);
    chartApi.timeScale().fitContent();
    dbg('rendered OKX', { points: data.length, instId, bar });
  }

  // ---------- старт ----------
  (async function start(){
    try{
      await renderOkxCandles(instId, tf);
    }catch(err){
      console.error('[chart] load error', err);
      showError('Не удалось загрузить данные с OKX. Проверьте inst/tf и сеть.');
    }
  })();
})();
