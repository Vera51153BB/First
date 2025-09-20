// ===== Alerts page (модель + рендер + отправка) =====
(function(){
  const { tg, DEBUG, safeSendData, notifySavedAndMaybeClose, attachRipple, saveLocal, loadLocal } = window.Core;

  /* ===== модель ===== */
  const STORAGE_KEY = 'okx_alerts_v1';
  const DEFAULT_ALERTS = [
    { id: 'balance', name: 'Баланс монет', on: true },
    { id: 'alert2',  name: 'Индекс RSI',   on: true },
    { id: 'alert3',  name: 'уведомление 3', on: true },
    { id: 'alert4',  name: 'уведомление 4', on: true },
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
    listEl.innerHTML = '';
    alerts.forEach(a=>{
      const row = document.createElement('div');
      row.className = 'item';

      const left = document.createElement('div');
      left.innerHTML = `
        <div class="name">${a.name}</div>
        <div class="state" id="state-${a.id}">${a.on ? 'включено' : 'выключено'}</div>
      `;
      row.appendChild(left);

      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'switch';
      sw.setAttribute('data-on', String(a.on));
      sw.setAttribute('aria-pressed', String(a.on));
      sw.innerHTML = `
        <span class="label">ВКЛ</span>
        <span class="label">ВЫК</span>
        <span class="knob"></span>
      `;

      sw.addEventListener('click', ()=>{
        a.on = !a.on;
        saveState(alerts);
        updateOne(a.id);
        updateAllBadge();
        onToggleChanged(a.id);
        try{ tg?.HapticFeedback?.selectionChanged?.(); }catch{}
      });

      row.appendChild(sw);
      listEl.appendChild(row);
    });

    updateAllBadge();
  }

  function updateOne(id){
    const a = alerts.find(x=>x.id===id);
    const state = document.getElementById('state-'+id);
    if(state) state.textContent = a.on ? 'включено' : 'выключено';
    const idx = alerts.findIndex(x=>x.id===id);
    const btn = listEl.querySelectorAll('.switch')[idx];
    if(btn){
      btn.setAttribute('data-on', String(a.on));
      btn.setAttribute('aria-pressed', String(a.on));
    }
  }

  function updateAllBadge(){
    const onCount = alerts.filter(a=>a.on).length;
    let txt = 'частично';
    if(onCount===0) txt='выключено';
    else if(onCount===alerts.length) txt='включено';
    allStateEl.textContent = txt;
  }

  /* Кнопки «все» */
  document.getElementById('btnAllOn').addEventListener('click', ()=>{ alerts.forEach(a=>a.on=true);  saveState(alerts); render(); });
  document.getElementById('btnAllOff').addEventListener('click', ()=>{ alerts.forEach(a=>a.on=false); saveState(alerts); render(); });

  /* лог на переключателях (без мгновенной отправки) */
  function onToggleChanged(alertId){
    if (DEBUG) console.log('[WebApp] toggle changed:', alertId, alerts);
  }

  /* СВОДКА статусов для окна/тоста */
  function buildSummary(list){
    const on = Object.fromEntries(list.map(a => [a.id, !!a.on]));
    const order = [
      ['balance', 'Баланс монет'],
      ['alert2',  'Индекс RSI'],
      ['alert3',  'Уведомление 3'],
      ['alert4',  'Уведомление 4'],
    ];

    const values = order.map(([id]) => on[id]);
    let body;
    if (values.every(Boolean))      body = 'Все уведомления: ВКЛЮЧЕНЫ';
    else if (values.every(v=>!v))   body = 'Все уведомления: ВЫКЛЮЧЕНЫ';
    else body = order.map(([id, title]) => `${title} — ${on[id] ? 'ВКЛЮЧЁН' : 'ВЫКЛЮЧЕН'}`).join('\n');

    return [
      'OKXcandlebot',
      'Новые настройки уведомлений:',
      '',
      body,
      '',
      'Настройки сохранены на этом устройстве.'
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

  // init
  render();
  attachRipple('.btn, .save-btn');
})();
