/* ==========================================================================
   ui_panel.js — ЛОГИКА UI (без тяжёлых библиотек)
   Что делает:
   • POP-уведомление (▲/▼), закрытие по клику на фон, ESC.
   • TIP-подсказка (кнопка ²), закрытие по клику на фон, ESC.
   • Текущий символ: хранится в JS (default OKX=BTC-USDT-SWAP, TV=ETH-USDT-SWAP).
   • Кнопки POP: OKX/TV/VP — переключают слои и обновляют «текущий символ».
   • Ссылки в POP:
       - 🔗 OKX → формирует официальный URL вида /ru/markets/swap-info/<ticker>-swap и открывает:
           • в WebApp: Telegram.WebApp.openLink(url)
           • в браузере: window.open(url, '_blank', 'noopener')
       - 🔗 TradingView → пока открываем tradingview.com; позже подменим на конкретный виджет-страницу проекта.
   • Тоггл «Избранное»: "➕ В избранное" ↔ "⭐️ Избранное".
   • Telegram WebApp: ready() + цвета; topbar можно скрыть при желании.
   ========================================================================== */

(() => {
  // --- Утилиты
  const $ = (sel) => document.querySelector(sel);

  // --- DOM
  const $menuBtn     = $('#btn-menu');
  const $infoBtn     = $('#btn-info');
  const $tipBtn      = $('#btn-tip');

  const $popBack     = $('#pop-backdrop');
  const $favBtn      = $('#btn-fav');
  const $linkOkx     = $('#link-okx');
  const $linkTv      = $('#link-tv');

  const $tipBack     = $('#tip-backdrop');

  const $layerOkx    = $('#layer-okx');
  const $layerTv     = $('#layer-tv');
  const $layerVp     = $('#layer-vp');
  const $chartName   = $('#chart-name');
  const $statusLed   = $('#status-led');

  let menuOpen = false;

  // --- ТЕКУЩИЙ СИМВОЛ
  // Храним в виде 'BTC-USDT-SWAP', 'ETH-USDT-SWAP', 'SOL-USDT-SWAP', ...
  let currentSymbol = 'BTC-USDT-SWAP';   // старт для слоя OKX

  // Нормализация символа в slug для OKX /markets/swap-info/<slug>
  // Принимает: 'BTC-USDT-SWAP', 'BTC-USDT', 'BTC', 'Sol', 'sol-usdt-swap', 'SOL/USDT' и т.п.
  function toOkxSwapSlug(symbol){
    if (!symbol) return 'btc-usdt-swap';
    let s = String(symbol).trim().toLowerCase();

    // убираем пробелы, слэши → дефисы
    s = s.replace(/\s+/g, '').replace(/[\/_]/g, '-');

    // убираем дубликаты дефисов
    s = s.replace(/-+/g, '-');

    // уже ок — заканчивается на -swap
    if (s.endsWith('-swap')) return s;

    // есть пара без -swap → добавим
    if (/-usdt$/.test(s)) return `${s}-swap`;

    // только монета → считаем, что USDT perp
    if (/^[a-z0-9]+$/.test(s)) return `${s}-usdt-swap`;

    // вариант 'btc-usdt-swap' на выход
    if (!s.includes('-usdt')) s = s.replace(/-swap$/, '') + '-usdt-swap';
    else s = s + '-swap';
    return s;
  }

  function buildOkxSwapUrl(symbol){
    const slug = toOkxSwapSlug(symbol);
    return `https://www.okx.com/ru/markets/swap-info/${slug}`;
  }

  function openExternal(url){
    if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.openLink === 'function'){
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener');
    }
  }

  // --- СЛОИ
  function setChartLayer(which){
    // Включаем нужный слой
    $layerOkx.hidden = which !== 'okx';
    $layerTv.hidden  = which !== 'tv';
    $layerVp.hidden  = which !== 'vp';

    // Обновляем подпись и текущий символ (по умолчанию для демо)
    if (which === 'okx'){
      currentSymbol = 'BTC-USDT-SWAP';
      $chartName.textContent = 'OKX · BTC-USDT-SWAP';
    }
    if (which === 'tv'){
      currentSymbol = 'ETH-USDT-SWAP';
      $chartName.textContent = 'TradingView · ETH-USDT-SWAP';
    }
    if (which === 'vp'){
      // Для заглушки пусть остаётся предыдущий symbol; подпись меняем:
      $chartName.textContent = 'Volume Profile · Заглушка';
    }

    // Обновим href «🔗 OKX» (чтобы по наведению показывал правильный адрес)
    if ($linkOkx){
      $linkOkx.href = buildOkxSwapUrl(currentSymbol);
    }
  }

  // --- POP
  function setMenu(open){
    menuOpen = open;
    $popBack?.classList.toggle('show', open);
    $popBack?.setAttribute('aria-hidden', String(!open));
    $menuBtn?.setAttribute('aria-expanded', String(open));
    $menuBtn.textContent = open ? '▼' : '▲';

    // При каждом открытии актуализируем ссылку OKX
    if (open && $linkOkx){
      $linkOkx.href = buildOkxSwapUrl(currentSymbol);
    }
  }
  function toggleMenu(){ setMenu(!menuOpen); }

  // --- TIP
  function openTip(){
    $tipBack?.classList.add('show');
    $tipBack?.setAttribute('aria-hidden','false');
  }
  function closeTip(){
    $tipBack?.classList.remove('show');
    $tipBack?.setAttribute('aria-hidden','true');
  }

  // --- FAV
  function favToggle(){
    const state = $favBtn.getAttribute('data-state') || 'add';
    if (state === 'add'){
      $favBtn.setAttribute('data-state','star');
      $favBtn.textContent = '⭐️ Избранное';
    } else {
      $favBtn.setAttribute('data-state','add');
      $favBtn.textContent = '➕ В избранное';
    }
  }

  // --- События POP
  function onPopClick(e){
    // 1-я строка кнопок: OKX / TradingView / Volume Profile
    const btn = e.target.closest('.pop-btn');
    if (btn){
      const act = btn.getAttribute('data-action');
      if (act === 'okx') setChartLayer('okx');
      if (act === 'tv')  setChartLayer('tv');
      if (act === 'vp')  setChartLayer('vp');
      return;
    }

    // 2-я строка: избранное
    if (e.target.id === 'btn-fav'){
      favToggle();
      return;
    }

    // Клик по фону закрывает pop
    if (e.target === $popBack){
      setMenu(false);
    }
  }

  // --- Открытие ссылок с учётом текущего символа
  function onOkxLinkClick(e){
    e.preventDefault();
    const url = buildOkxSwapUrl(currentSymbol); // пример: .../sol-usdt-swap
    openExternal(url);
  }
  function onTvLinkClick(e){
    // Пока открываем главную TradingView (или можете подставлять свою страницу проекта)
    // Позже можно построить URL под конкретный тикер/виджет.
    // Пример: https://www.tradingview.com/symbols/ETHUSDT.P/ (если есть публичная страница)
    // По умолчанию — как раньше:
    //   <a href="https://www.tradingview.com" target="_blank">
    if (!e.ctrlKey && !e.metaKey){ // если это не «открыть в новой вкладке» сочетанием
      // ничего не перехватываем — пусть работает как обычная ссылка
    }
  }

  // --- TIP backdrop
  function onTipClick(e){
    if (e.target === $tipBack){ closeTip(); }
  }

  // --- Клавиатура
  function onKey(e){
    if (e.key === 'Escape'){
      if (menuOpen) setMenu(false);
      closeTip();
    }
  }

  // --- INFO (кнопка i)
  function onInfo(){
    alert('Информация о текущем графике (демо). Здесь можно вывести подробности инструмента, таймфрейм, биржу и т.п.');
  }

  // --- Инициализация
  document.addEventListener('DOMContentLoaded', () => {
    // Telegram WebApp косметика
    if (window.Telegram && window.Telegram.WebApp){
      try{
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.setBackgroundColor('#0b0e14');
        window.Telegram.WebApp.setHeaderColor('secondary_bg_color');
      }catch(e){}
    }

    // Слушатели
    $menuBtn?.addEventListener('click', toggleMenu);
    $infoBtn?.addEventListener('click', onInfo);
    $tipBtn?.addEventListener('click', openTip);

    $popBack?.addEventListener('click', onPopClick);
    $tipBack?.addEventListener('click', onTipClick);
    document.addEventListener('keydown', onKey);

    // Ссылки
    $linkOkx?.addEventListener('click', onOkxLinkClick);
    // $linkTv — пока без перехвата, оставляем обычное поведение:
    // $linkTv?.addEventListener('click', onTvLinkClick);

    // Стартовое состояние
    setChartLayer('okx');
    $statusLed.title = 'Статус: Онлайн (демо)';
  });
})();
