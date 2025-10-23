/*
  CHANGES:
    • управление выезжающей панелью вынесено сюда
    • “липкий” режим: после смены TF/источника панель остаётся открытой
    • кнопка “Свернуть” в заголовке панели закрывает только по явному клику
*/

(function(){
  const panel   = document.getElementById('panel');
  const btnDock = document.getElementById('btn-panel');
  const btnClose= document.getElementById('btn-close');

  const popover = document.getElementById('status-popover');
  const btnInfo = document.getElementById('btn-status-info');
  const btnTipX = document.getElementById('btn-tip-close');

  const STICKY_KEY = 'PANEL_STICKY';

  function openPanel(){
    panel.hidden = false;
    panel.classList.add('open');
    btnDock.setAttribute('aria-expanded','true');
    btnDock.textContent = '▼';
  }
  function closePanel(){
    panel.classList.remove('open');
    btnDock.setAttribute('aria-expanded','false');
    btnDock.textContent = '▲';
    // даём закончить анимации, затем скрываем из потока
    setTimeout(()=>{ if(!panel.classList.contains('open')) panel.hidden = true; }, 260);
  }
  function togglePanel(){ (panel.classList.contains('open') ? closePanel : openPanel)(); }

  btnDock?.addEventListener('click', togglePanel);
  btnClose?.addEventListener('click', closePanel);

  // авто-открытие по “липкому” флагу
  try{
    if (localStorage.getItem(STICKY_KEY) === '1'){
      openPanel();
      localStorage.removeItem(STICKY_KEY);
    }
  }catch(_){}

  // поповер статуса
  function openTip(){ popover.hidden = false; btnInfo.setAttribute('aria-expanded','true'); }
  function closeTip(){ popover.hidden = true;  btnInfo.setAttribute('aria-expanded','false'); }
  btnInfo?.addEventListener('click', ()=> popover.hidden ? openTip() : closeTip());
  btnTipX?.addEventListener('click', closeTip);

  // экспорт маленького API
  window.__panelCtl = { openPanel, closePanel, togglePanel, STICKY_KEY };
})();
