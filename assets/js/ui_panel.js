/*
  First/assets/js/ui_panel.js
  ------------------------------------------------------------
  Зачем этот файл:
    • Управляет выезжающей панелью (снизу вверх) и док-полосой.
    • «Липкий» режим: если пользователь уходит/обновляет страницу с
      открытой панелью — при следующей загрузке панель снова открыта.
    • Кнопка с треугольником НЕ меняет текст — визуал рисует CSS ::before.
    • iOS fix: открытие через rAF, закрытие по transitionend.
    • Поповер статуса (кнопка «i») — aria и закрытие по клику вне.
  ------------------------------------------------------------
*/

(function () {
  const panel     = document.getElementById('panel');
  const btnDock   = document.getElementById('btn-panel');
  const btnClose  = document.getElementById('btn-close');

  const popover   = document.getElementById('status-popover');
  const btnInfo   = document.getElementById('btn-status-info');
  const btnTipX   = document.getElementById('btn-tip-close');

  const STICKY_KEY = 'PANEL_STICKY';

  if (!panel || !btnDock) {
    // Нечего инициализировать — тихо выходим
    window.__panelCtl = { openPanel(){}, closePanel(){}, togglePanel(){}, STICKY_KEY };
    return;
  }

  // ---------- Открыть / закрыть / переключить -----------

  // iOS-friendly: включаем отображение, а класс .open добавляем на следующий кадр
  function openPanel() {
    panel.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add('open');
      btnDock.setAttribute('aria-expanded', 'true');
    });
  }

  // Закрываем: снимаем .open и ждём реального окончания transition
  function closePanel() {
    panel.classList.remove('open');
    btnDock.setAttribute('aria-expanded', 'false');

    const onEnd = (e) => {
      if (e.target !== panel) return;
      panel.hidden = true;
      panel.removeEventListener('transitionend', onEnd);
    };
    panel.addEventListener('transitionend', onEnd);
  }

  function togglePanel() {
    panel.classList.contains('open') ? closePanel() : openPanel();
  }

  // Кнопки управления
  btnDock?.addEventListener('click', togglePanel);
  btnClose?.addEventListener('click', closePanel);

  // ---------- «Липкий» режим между перезагрузками ----------

  // Если пользователь уходит со страницы с открытой панелью — запомним это.
  window.addEventListener('beforeunload', () => {
    try {
      if (panel.classList.contains('open')) {
        localStorage.setItem(STICKY_KEY, '1');
      } else {
        localStorage.removeItem(STICKY_KEY);
      }
    } catch (_) {}
  });

  // Если ранее запоминали, сразу откроем панель и очистим флаг.
  try {
    if (localStorage.getItem(STICKY_KEY) === '1') {
      openPanel();
      localStorage.removeItem(STICKY_KEY);
    }
  } catch (_) {}

  // ---------- Поповер «i» (статусы) ----------

  function openTip()  { if (!popover) return; popover.hidden = false;  btnInfo?.setAttribute('aria-expanded','true'); }
  function closeTip() { if (!popover) return; popover.hidden = true;   btnInfo?.setAttribute('aria-expanded','false'); }

  btnInfo?.addEventListener('click', (e) => {
    if (!popover) return;
    popover.hidden ? openTip() : closeTip();
    e.stopPropagation();
  });

  btnTipX?.addEventListener('click', closeTip);

  // Закрыть поповер при клике вне него
  document.addEventListener('click', (e) => {
    if (!popover || popover.hidden) return;
    const within = popover.contains(e.target) || (btnInfo && btnInfo.contains(e.target));
    if (!within) closeTip();
  });

  // ---------- Экспорт маленького API (на случай вызовов из других модулей) ----------
  window.__panelCtl = { openPanel, closePanel, togglePanel, STICKY_KEY };
})();
