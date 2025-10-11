/* -*- coding: utf-8 -*-
 * Файл: First/assets/js/ui_panel.js
 * ------------------------------------------------------------
 * Назначение:
 *   Логика UI без инлайн-скриптов:
 *   • Инициализация Telegram WebApp (expand, closing confirmation)
 *   • Управление док-панелью (кнопка ▲) и выезжающей панелью настроек
 *   • Поповер подсказок статуса (кнопка i, hover/tap, Esc/клик-вне)
 * Примечания:
 * [v1] Весь JS вынесен из chart.html, чтобы CSP не требовал 'unsafe-inline'.
 */

// Безопасная инициализация Telegram WebApp (если доступен)
(function initTelegramWebApp(){
  try {
    const tg = window.Telegram?.WebApp;
    tg?.expand();
    tg?.enableClosingConfirmation();
  } catch (_) {}
})();

// Док-панель и выезжающая панель
(function dockAndPanel(){
  const btn   = document.getElementById('btn-panel');
  const panel = document.getElementById('panel');
  const close = document.getElementById('btn-close');

  if (!btn || !panel || !close) return; // защита от отсутствия DOM

  function openPanel(){
    panel.hidden = false;
    requestAnimationFrame(()=> panel.classList.add('open'));
    btn.setAttribute('aria-expanded', 'true');
  }
  function closePanel(){
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(()=>{ panel.hidden = true; }, 250);
  }

  btn.addEventListener('click', ()=>{
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? closePanel() : openPanel();
  });
  close.addEventListener('click', closePanel);

  // Свайп вниз для закрытия (мобильный UX)
  let startY=0;
  panel.addEventListener('touchstart', (e)=>{ startY = e.touches[0].clientY; }, {passive:true});
  panel.addEventListener('touchmove', (e)=>{
    const dy = e.touches[0].clientY - startY;
    if (dy>60) closePanel();
  }, {passive:true});
})();

// Поповер с подсказками статуса (i)
(function statusPopover(){
  const btnInfo  = document.getElementById('btn-status-info');
  const popover  = document.getElementById('status-popover');
  const tipClose = document.getElementById('btn-tip-close');
  const statusDot  = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  if (!btnInfo || !popover || !tipClose) return;

  function openTip(){
    popover.hidden = false;
    btnInfo.setAttribute('aria-expanded','true');
  }
  function closeTip(){
    popover.hidden = true;
    btnInfo.setAttribute('aria-expanded','false');
  }

  btnInfo.addEventListener('click', ()=>{
    const expanded = btnInfo.getAttribute('aria-expanded')==='true';
    expanded ? closeTip() : openTip();
  });

  // Закрытие по клику вне карточки
  document.addEventListener('click', (e)=>{
    if (popover.hidden) return;
    const card = popover.querySelector('.tip-card');
    if (!card.contains(e.target) && e.target !== btnInfo) closeTip();
  });

  // Закрытие по Esc (десктоп)
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeTip();
  });

  // Hover-подсказка для десктопа (ненавязчиво, с задержкой)
  const enter = () => { popover._hoverTimer = setTimeout(openTip, 350); };
  const leave = () => { clearTimeout(popover._hoverTimer); popover._hoverTimer = null; };
  [statusDot, statusText].forEach(el=>{
    if (!el) return;
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
  });
})();
