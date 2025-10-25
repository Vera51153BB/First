/* ==========================================================================
   ui_panel.js — ЛОГИКА UI (без тяжёлых библиотек)
   Что делает:
   • Гарантирует «без прокрутки» за счёт чистого CSS (JS не нужен).
   • Управляет открытием/закрытием POP-уведомления (▲/▼), закрытие по клику на фон.
   • Управляет подсказкой TIP («Что значит индикатор состояния?») — открытие по кнопке ², закрытие по клику на фон и ESC.
   • Кнопка «i» — сейчас просто показывает базовую информацию (alert), можно заменить на ваш контент/модалку.
   • В POP: кнопки OKX/TV/VP — переключают активный слой (демо). Ссылки открываются в новой вкладке (target=_blank).
   • Тоггл «Избранное»: меняет подпись «➕ В избранное» <-> «⭐️ Избранное».
   • Под Telegram WebApp — бережно настраивает цвета и может спрятать topbar.
   ========================================================================== */

(() => {
  // --- Кэш DOM-элементов
  const $ = (sel) => document.querySelector(sel);
  const $app         = $('#app');
  const $menuBtn     = $('#btn-menu');
  const $infoBtn     = $('#btn-info');
  const $tipBtn      = $('#btn-tip');

  const $popBack     = $('#pop-backdrop');
  const $popCard     = $('.pop-card');
  const $favBtn      = $('#btn-fav');

  const $tipBack     = $('#tip-backdrop');
  const $tipCard     = $('.tip-card');

  const $layerOkx    = $('#layer-okx');
  const $layerTv     = $('#layer-tv');
  const $layerVp     = $('#layer-vp');
  const $chartName   = $('#chart-name');
  const $statusLed   = $('#status-led');

  let menuOpen = false;

  // --- Вспомогательные
  function setChartLayer(which){
    // Переключаем видимую заглушку-слой
    $layerOkx.hidden = which !== 'okx';
    $layerTv.hidden  = which !== 'tv';
    $layerVp.hidden  = which !== 'vp';

    // Обновляем подпись в панели
    if (which === 'okx') $chartName.textContent = 'OKX · BTC-USDT-SWAP';
    if (which === 'tv')  $chartName.textContent = 'TradingView · ETH-USDT-SWAP';
    if (which === 'vp')  $chartName.textContent = 'Volume Profile · Заглушка';
  }

  function setMenu(open){
    // Открыть/закрыть pop-уведомление, синхронизируем стрелку ▲/▼
    menuOpen = open;
    $popBack?.classList.toggle('show', open);
    $popBack?.setAttribute('aria-hidden', String(!open));
    $menuBtn?.setAttribute('aria-expanded', String(open));
    $menuBtn.textContent = open ? '▼' : '▲';
  }

  function toggleMenu(){ setMenu(!menuOpen); }

  function openTip(){
    $tipBack?.classList.add('show');
    $tipBack?.setAttribute('aria-hidden','false');
  }
  function closeTip(){
    $tipBack?.classList.remove('show');
    $tipBack?.setAttribute('aria-hidden','true');
  }

  function favToggle(){
    // Переключатель «Избранное»
    const state = $favBtn.getAttribute('data-state') || 'add';
    if (state === 'add'){
      $favBtn.setAttribute('data-state','star');
      $favBtn.textContent = '⭐️ Избранное';
    } else {
      $favBtn.setAttribute('data-state','add');
      $favBtn.textContent = '➕ В избранное';
    }
  }

  // --- Обработчики событий
  function onPopClick(e){
    // 1-я строка кнопок
    const btn = e.target.closest('.pop-btn');
    if (btn){
      const act = btn.getAttribute('data-action');
      if (act === 'okx') setChartLayer('okx');
      if (act === 'tv')  setChartLayer('tv');
      if (act === 'vp')  setChartLayer('vp');
      return;
    }

    // 2-я строка — fav
    if (e.target.id === 'btn-fav'){
      favToggle();
      return;
    }

    // Клик по фону вне карточки — закрыть
    if (e.target === $popBack){
      setMenu(false);
    }
  }

  function onTipClick(e){
    // Клик по фону — закрыть
    if (e.target === $tipBack){
      closeTip();
    }
  }

  function onKey(e){
    if (e.key === 'Escape'){
      if (menuOpen) setMenu(false);
      closeTip();
    }
  }

  function onInfo(){
    // Стилистически «i» — как у стрелки. Пока простая справка:
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
        // Хотите — спрячем topbar внутри бота:
        // $('#topbar').style.display = 'none';
      }catch(e){}
    }

    // Слушатели
    $menuBtn?.addEventListener('click', toggleMenu);
    $infoBtn?.addEventListener('click', onInfo);
    $tipBtn?.addEventListener('click', openTip);

    $popBack?.addEventListener('click', onPopClick);
    $tipBack?.addEventListener('click', onTipClick);
    document.addEventListener('keydown', onKey);

    // Старт: OKX, статус зелёный (декоративный)
    setChartLayer('okx');
    $statusLed.title = 'Статус: Онлайн (демо)';
  });
})();
