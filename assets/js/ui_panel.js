/* -*- coding: utf-8 -*-  First/assets/js/ui_panel.js
   Управление выезжающей панелью. Фиксированная полоса — отдельным стилем.
   • Открытие через rAF (чтобы iOS не «срезал» анимацию)
   • Закрытие по transitionend (надёжнее таймаута)
   • Состояние aria-expanded синхронизируется с кнопкой
*/
(function(){
  const panel   = document.getElementById('panel');
  const btnDock = document.getElementById('btn-panel');
  const btnClose= document.getElementById('btn-close');

  const popover = document.getElementById('status-popover');
  const btnInfo = document.getElementById('btn-status-info');
  const btnTipX = document.getElementById('btn-tip-close');

  const STICKY_KEY = 'PANEL_STICKY';

  // Помогаем GPU и iOS
  panel.style.willChange = 'transform';

  function openPanel(){
    if (!panel.hidden) {
      // если уже видим — просто убедимся, что класс есть
      panel.classList.add('open');
      btnDock.setAttribute('aria-expanded','true');
      return;
    }
    panel.hidden = false;
    // кадр на раскладку — потом открываем
    requestAnimationFrame(()=>{
      panel.classList.add('open');
      btnDock.setAttribute('aria-expanded','true');
    });
  }

  function hideIfClosed(){
    if (!panel.classList.contains('open')){
      panel.hidden = true;
    }
  }

  function closePanel(){
    panel.classList.remove('open');
    btnDock.setAttribute('aria-expanded','false');
    // скрываем после фактического завершения перехода
    const once = ()=>{ panel.removeEventListener('transitionend', once); hideIfClosed(); };
    panel.addEventListener('transitionend', once);
  }

  function togglePanel(){ (panel.classList.contains('open') ? closePanel : openPanel)(); }

  btnDock?.addEventListener('click', togglePanel);
  btnClose?.addEventListener('click', closePanel);

  // Поповер статуса (чтобы не прятался под панелью)
  function openTip(){ popover.hidden = false; btnInfo.setAttribute('aria-expanded','true'); }
  function closeTip(){ popover.hidden = true;  btnInfo.setAttribute('aria-expanded','false'); }
  btnInfo?.addEventListener('click', ()=> popover.hidden ? openTip() : closeTip());
  btnTipX?.addEventListener('click', closeTip);

  // Экспорт контроллера (если понадобится триггерить программно)
  window.__panelCtl = { openPanel, closePanel, togglePanel, STICKY_KEY };
})();
