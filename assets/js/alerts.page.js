// ===== Alerts page (модель + рендер + отправка) =====
(function () {
  const {
    tg, DEBUG,
    safeSendData, notifySavedAndMaybeClose,
    attachRipple, saveLocal, loadLocal, i18n
  } = window.Core || {};

  // Короткие помощники для словаря
  const t       = (k) => window.I18N?.t(k) ?? k;
  const tCommon = (k) => t('common.' + k);
  const tItem   = (id) => t(`alerts.items.${id}`);

  /* ===== Модель ===== */
  const STORAGE_KEY = 'okx_alerts_v1';

  const DEFAULT_ALERTS = [
    { id: 'balance', on: true },
    { id: 'alert2',  on: true }, // RSI
    { id: 'alert3',  on: true },
    { id: 'alert4',  on: true },
  ];

  function normalizeSaved(saved) {
    if (!Array.isArray(saved)) return null;
    const out = [];
    for (const it of saved) {
      if (!it || typeof it !== 'object') return null;
      if (typeof it.id !== 'string')     return null;
      out.push({ id: it.id, on: !!it.on });
    }
    return out;
  }

  function loadState() {
    try {
      const raw = loadLocal(STORAGE_KEY, null);
      const arr = normalizeSaved(raw);
      if (!arr) throw new Error('invalid saved state');
      const map = Object.fromEntries(arr.map(a => [a.id, !!a.on]));
      return DEFAULT_ALERTS.map(d => ({ id: d.id, on: map[d.id] ?? d.on }));
    } catch (e) {
      if (DEBUG) console.warn('[alerts] fallback to defaults:', e?.message || e);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      return DEFAULT_ALERTS.slice();
    }
  }
  function saveState(arr) { saveLocal(STORAGE_KEY, arr); }

  /* ===== Узлы ===== */
  const listEl     = document.getElementById('list');
  const allStateEl = document.getElementById('allState');
  const saveEl     = document.getElementById('saveBtn');

  let alerts = loadState();

  /* ===== Рендер ===== */
  function render() {
    updateAllBadge();
    if (!listEl) return;

    listEl.innerHTML = '';

    alerts.forEach((a) => {
      const row = document.createElement('div');
      row.className = 'item';

      // Левая колонка: название + состояние
      const left = document.createElement('div');
      left.innerHTML = `
        <div class="name">${tItem(a.id)}</div>
        <div class="state" id="state-${a.id}">${a.on ? tCommon('on') : tCommon('off')}</div>
      `;
      row.appendChild(left);

      // Тумблер
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'switch';
      sw.setAttribute('data-on', String(a.on));
      sw.setAttribute('aria-pressed', String(a.on));
      sw.innerHTML = `
        <span class="label">${tCommon('on_short')}</span>
        <span class="label">${tCommon('off_short')}</span>
        <span class="knob"></span>
      `;
      sw.addEventListener('click', () => {
        a.on = !a.on;
        saveState(alerts);
        updateOne(a.id);
        updateAllBadge();
        try { tg?.HapticFeedback?.selectionChanged?.(); } catch {}
      });

      // Шестерёнка (SVG)
      const gearBtn = document.createElement('button');
      gearBtn.className = 'gear-btn';
      gearBtn.setAttribute('aria-label', tCommon('settings') || 'Settings');
      gearBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      `;
      gearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (a.id === 'alert2') {
          // настройки RSI
          window.location.href = 'setting_alerts_rsi.html';
        } else {
          window.Core?.showToast?.(tCommon('settings') || 'Settings');
        }
      });

      // Правый блок: тумблер + шестерёнка
      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.gap = '10px';
      right.appendChild(sw);
      right.appendChild(gearBtn);
      row.appendChild(right);

      listEl.appendChild(row);
    });

    // риппл на шестерёнках
    attachRipple && attachRipple('.gear-btn');
  }

  function updateOne(id) {
    const a = alerts.find(x => x.id === id);
    if (!a) return;

    const state = document.getElementById('state-' + id);
    if (state) state.textContent = a.on ? tCommon('on') : tCommon('off');

    const idx = alerts.findIndex(x => x.id === id);
    const btn = listEl?.querySelectorAll('.switch')[idx];
    if (btn) {
      btn.setAttribute('data-on', String(a.on));
      btn.setAttribute('aria-pressed', String(a.on));
      const labels = btn.querySelectorAll('.label');
      if (labels[0]) labels[0].textContent = tCommon('on_short');
      if (labels[1]) labels[1].textContent = tCommon('off_short');
    }

    const nameNode = listEl?.querySelectorAll('.item .name')[idx];
    if (nameNode) nameNode.textContent = tItem(a.id);
  }

  function updateAllBadge() {
    const onCount = alerts.filter(a => a.on).length;
    const total   = alerts.length;
    let txt = tCommon('partially');
    if (onCount === 0)        txt = tCommon('off');
    else if (onCount === total) txt = tCommon('on');
    if (allStateEl) allStateEl.textContent = txt;
  }

  /* ===== «Все вкл/выкл» ===== */
  document.getElementById('btnAllOn')?.addEventListener('click', () => {
    alerts.forEach(a => a.on = true);
    saveState(alerts);
    render();
  });
  document.getElementById('btnAllOff')?.addEventListener('click', () => {
    alerts.forEach(a => a.on = false);
    saveState(alerts);
    render();
  });

  /* ===== Сводка для попапа/тоста ===== */
  function buildSummary(list) {
    const on = Object.fromEntries(list.map(a => [a.id, !!a.on]));
    const ids = ['balance','alert2','alert3','alert4'];
    if (ids.every(id => on[id]))  return t('alerts.summary_all_on')  || t('alerts.summary.all_on');
    if (ids.every(id => !on[id])) return t('alerts.summary_all_off') || t('alerts.summary.all_off');
    return ids.map(id => `${tItem(id)} — ${on[id] ? tCommon('on') : tCommon('off')}`).join('\n');
  }

  /* ===== Кнопка «Сохранить настройки» ===== */
  saveEl?.addEventListener('click', () => {
    const payload = JSON.stringify({ type: 'save', alerts });
    const sent = safeSendData ? safeSendData(payload) : false;
    if (!sent) saveState(alerts);

    // визуальный отклик
    saveEl.classList.remove('saved'); void saveEl.offsetWidth; saveEl.classList.add('saved');
    try { tg?.HapticFeedback?.notificationOccurred?.('success'); } catch {}

    const message = [
      'OKXcandlebot',
      t('alerts.saved_prefix'),
      '',
      buildSummary(alerts),
      '',
      t('alerts.saved_footer'),
    ].join('\n');

    notifySavedAndMaybeClose && notifySavedAndMaybeClose(message, { title: 'OKXcandlebot', closeOnMobile: true });
  });

  // Перерисовка при смене языка
  window.addEventListener('i18n:change', () => { render(); });

  // init
  render();
  attachRipple && attachRipple('.btn, .save-btn');
})();
