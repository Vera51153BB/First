// ===== Alerts page (модель + рендер + отправка) =====
(function(){
  const { tg, DEBUG, safeSendData, notifySavedAndMaybeClose, attachRipple, saveLocal, loadLocal } = window.Core;
  const t = (k)=> window.I18N?.t(k) ?? k;
  const tCommon  = (k)=> t('common.'+k);
  const tAlerts  = (k)=> t('alerts.'+k);
  const tItem    = (id)=> t(`alerts.items.${id}`);

  /* ===== модель ===== */
  const STORAGE_KEY = 'okx_alerts_v1';
  const DEFAULT_ALERTS = [
    { id: 'balance', name: '', on: true },
    { id: 'alert2',  name: '', on: true },  // RSI
    { id: 'alert3',  name: '', on: true },
    { id: 'alert4',  name: '', on: true },
  ];

  function loadState(){
    const saved = loadLocal(STORAGE_KEY, null);
    if (!saved) return DEFAULT_ALERTS.slice();
    const map = Object.fromEntries(saved.map(a=>[a.id, a.on]));
    return DEFAULT_ALERTS.map(d => ({...d, on: map[d.id] ?? d.on}));
  }
  function saveState(arr){ saveLocal(STORAGE_KEY, arr); }

  /* ===== рендер ===== */
  const listEl     = document.getElementById('list');
  const allStateEl = document.getElementById('allState');
  const saveEl     = document.getElementById('saveBtn');
  let alerts = loadState();

 function render(){
  // «Все уведомления: …» (простой текст)
  updateAllBadge();

  listEl.innerHTML = '';

  alerts.forEach((a) => {
    const row = document.createElement('div');
    row.className = 'item';

    // ---------- 1) Верхняя строка: название + статус ----------
    const head = document.createElement('div');
    head.className = 'item-head';
    head.innerHTML = `
      <div class="name">${a.name || tItem(a.id) || a.id}</div>
      <div class="state" id="state-${a.id}">${a.on ? tCommon('on') : tCommon('off')}</div>
    `;

    // ---------- 2) Нижняя строка: тумблер + шестерёнка ----------
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
      try{ tg?.HapticFeedback?.selectionChanged?.(); }catch{}
    });

    // Шестерёнка
    const gearBtn = document.createElement('button');
    gearBtn.className = 'gear-btn';
    gearBtn.setAttribute('aria-label', t('common.settings') || 'Settings');
    gearBtn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    `;
    gearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (a.id === 'alert2') {
        window.location.href = 'setting_alerts_rsi.html';
      } else {
        window.Core.showToast(t('common.settings'));
      }
    });

    const controls = document.createElement('div');
    controls.className = 'item-controls';
    controls.appendChild(sw);
    controls.appendChild(gearBtn);

    // Сборка
    row.appendChild(head);
    row.appendChild(controls);
    listEl.appendChild(row);
  });

  // ripple для интерактивных кнопок
  attachRipple('.btn, .save-btn, .gear-btn');
}

  function updateOne(id){
    const a = alerts.find(x => x.id === id);

    // state-текст
    const state = document.getElementById('state-'+id);
    if (state) state.textContent = a.on ? tCommon('on') : tCommon('off');

    // тумблер
    const idx = alerts.findIndex(x => x.id === id);
    const btn = listEl.querySelectorAll('.switch')[idx];
    if (btn) {
      btn.setAttribute('data-on', String(a.on));
      btn.setAttribute('aria-pressed', String(a.on));
      // подписи ON/OFF (на случай смены языка)
      const labels = btn.querySelectorAll('.label');
      if (labels[0]) labels[0].textContent = tCommon('on_short');
      if (labels[1]) labels[1].textContent = tCommon('off_short');
    }

    // имя (если берём из словаря)
    const nameNode = listEl.querySelectorAll('.item .name')[idx];
    if (nameNode && !DEFAULT_ALERTS[idx].name) nameNode.textContent = tItem(a.id);
  }

  function updateAllBadge(){
    const onCount = alerts.filter(a=>a.on).length;
    const total = alerts.length;
    let txt = tCommon('partially');
    if(onCount===0)      txt = tCommon('off');
    else if(onCount===total) txt = tCommon('on');
    allStateEl.textContent = txt; // просто текст
  }

  /* Кнопки «все» */
  document.getElementById('btnAllOn').addEventListener('click', ()=>{
    alerts.forEach(a=>a.on=true); saveState(alerts); render();
  });
  document.getElementById('btnAllOff').addEventListener('click', ()=>{
    alerts.forEach(a=>a.on=false); saveState(alerts); render();
  });

  /* СВОДКА статусов для окна/тоста */
  function buildSummary(list){
    const on = Object.fromEntries(list.map(a => [a.id, !!a.on]));
    const order = [['balance'],['alert2'],['alert3'],['alert4']];
    const values = order.map(([id]) => on[id]);
    let body;
    if (values.every(Boolean))      body = t('alerts.summary_all_on')  || t('alerts.summary.all_on');
    else if (values.every(v=>!v))   body = t('alerts.summary_all_off') || t('alerts.summary.all_off');
    else body = order.map(([id]) => `${tItem(id)} — ${on[id] ? tCommon('on') : tCommon('off')}`).join('\n');

    return [
      'OKXcandlebot',
      t('alerts.saved_prefix'),
      '',
      body,
      '',
      t('alerts.saved_footer')
    ].join('\n');
  }

  /* «Сохранить настройки» — отправка, вспышка, сводка */
  saveEl.addEventListener('click', ()=>{
    const payload = JSON.stringify({ type:'save', alerts });
    const sent = safeSendData(payload);
    if (!sent) saveState(alerts);

    // визуальный отклик
    saveEl.classList.remove('saved'); void saveEl.offsetWidth; saveEl.classList.add('saved');
    try{ tg?.HapticFeedback?.notificationOccurred?.('success'); }catch{}

    const message = buildSummary(alerts);
    notifySavedAndMaybeClose(message, { title:'OKXcandlebot', closeOnMobile:true });
  });

  // Перерисовка при смене языка
  window.addEventListener('i18n:change', ()=>{ render(); });

  // init
  render();
})();
