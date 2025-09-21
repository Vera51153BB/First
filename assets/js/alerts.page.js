// ===== Alerts page (модель + рендер + отправка) =====
(function(){
  const { tg, DEBUG, safeSendData, notifySavedAndMaybeClose, attachRipple, saveLocal, loadLocal, i18n } = window.Core;
  const t = (k)=> window.I18N?.t(k) ?? k;
  const tCommon = (k)=> t('common.'+k);
  const tAlerts = (k)=> t('alerts.'+k);

  /* ===== модель ===== */
  const STORAGE_KEY = 'okx_alerts_v1';
  const DEFAULT_ALERTS = [
    { id: 'balance', name: '', on: true },
    { id: 'alert2',  name: '', on: true },  // alias RSI
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
  const listEl = document.getElementById('list');
  const allStateEl = document.getElementById('allState');
  const saveEl = document.getElementById('saveBtn');
  let alerts = loadState();

  function render(){
    // заголовок «Все уведомления: …» (просто текст)
    updateAllBadge();

    listEl.innerHTML = '';
    alerts.forEach((a, index)=>{
      const row = document.createElement('div');
      row.className = 'item';

      const left = document.createElement('div');
      const displayName = a.name || t(`alerts.items.${a.id}`) || a.id;
      left.innerHTML = `
        <div class="name">${displayName}</div>
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
      sw.addEventListener('click', ()=>{
        a.on = !a.on;
        saveState(alerts);
        updateOne(a.id);
        updateAllBadge();
        try{ tg?.HapticFeedback?.selectionChanged?.(); }catch{}
      });

      // (опционально) место под шестерёнку справа
      const gear = document.createElement('div');
      gear.className = 'icon-gear'; gear.title = t('common.settings');
      gear.textContent = '≡'; // можно вставить ваш SVG

      const rightWrap = document.createElement('div');
      rightWrap.appendChild(sw);
      rightWrap.style.display='flex'; rightWrap.style.alignItems='center'; rightWrap.style.gap='10px';

      row.appendChild(rightWrap);
      listEl.appendChild(row);
    });
  }

  function updateOne(id){
    const a = alerts.find(x => x.id === id);
    const state = document.getElementById('state-'+id);
    if (state) state.textContent = a.on ? tCommon('on') : tCommon('off');
    const idx = alerts.findIndex(x => x.id === id);
    const btn = listEl.querySelectorAll('.switch')[idx];
    if (btn) {
      btn.setAttribute('data-on', String(a.on));
      btn.setAttribute('aria-pressed', String(a.on));
      const labels = btn.querySelectorAll('.label');
      if (labels[0]) labels[0].textContent = tCommon('on_short');
      if (labels[1]) labels[1].textContent = tCommon('off_short');
    }
    const nameNode = listEl.querySelectorAll('.item .name')[idx];
    if (nameNode && !DEFAULT_ALERTS[idx].name) nameNode.textContent = t(`alerts.items.${a.id}`);
  }

  function updateAllBadge(){
    const onCount = alerts.filter(a=>a.on).length;
    const total = alerts.length;
    let txt = tCommon('partially');
    if(onCount===0) txt = tCommon('off');
    else if(onCount===total) txt = tCommon('on');
    allStateEl.textContent = txt; // просто текст, без бэйджа
  }

  /* Кнопки «все» */
  document.getElementById('btnAllOn').addEventListener('click', ()=>{ alerts.forEach(a=>a.on=true);  saveState(alerts); render(); });
  document.getElementById('btnAllOff').addEventListener('click', ()=>{ alerts.forEach(a=>a.on=false); saveState(alerts); render(); });

  /* СВОДКА статусов для окна/тоста */
  function buildSummary(list){
    const on = Object.fromEntries(list.map(a => [a.id, !!a.on]));
    const order = [['balance'],['alert2'],['alert3'],['alert4']];
    const values = order.map(([id]) => on[id]);
    let body;
    if (values.every(Boolean))      body = t('alerts.summary_all_on') || t('alerts.summary.all_on');
    else if (values.every(v=>!v))   body = t('alerts.summary_all_off') || t('alerts.summary.all_off');
    else body = order.map(([id]) => `${t(`alerts.items.${id}`)} — ${on[id] ? tCommon('on') : tCommon('off')}`).join('\n');

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

    saveEl.classList.remove('saved'); void saveEl.offsetWidth; saveEl.classList.add('saved');
    try{ tg?.HapticFeedback?.notificationOccurred?.('success'); }catch{}

    const message = buildSummary(alerts);
    notifySavedAndMaybeClose(message, { title:'OKXcandlebot', closeOnMobile:true });
  });

  // Перерисовка при смене языка
  window.addEventListener('i18n:change', ()=>{ render(); });

  // init
  render();
  attachRipple('.btn, .save-btn');
})();
