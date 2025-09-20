// ===== Alerts page (модель + рендер + отправка) =====
(function(){
  const { tg, DEBUG, safeSendData, notifySavedAndMaybeClose, attachRipple, saveLocal, loadLocal } = window.Core;
  const T = (k)=> window.I18N?.t(k) ?? k;

  /* ===== модель ===== */
  const STORAGE_KEY = 'okx_alerts_v1';
  const DEFAULT_ALERTS = [
    { id: 'balance', name_key: 'alerts.items.balance', on: true },
    { id: 'alert2',  name_key: 'alerts.items.rsi',     on: true, has_settings: true },
    { id: 'alert3',  name_key: 'alerts.items.item3',   on: true },
    { id: 'alert4',  name_key: 'alerts.items.item4',   on: true },
  ];

  function loadState(){
    const saved = loadLocal(STORAGE_KEY, null);
    if (!saved) return DEFAULT_ALERTS.map(x=>({...x}));
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
    // Заголовки/кнопки "все" тоже можно локализовать, если они размечены data-i18n, но список — руками:
    listEl.innerHTML = '';
    alerts.forEach(a=>{
      const row = document.createElement('div');
      row.className = 'item';

      // левая часть: имя + состояние + (опц.) кнопка-настройка
      const left = document.createElement('div');
      left.className = 'left';

      const textWrap = document.createElement('div');
      textWrap.innerHTML = `
        <div class="name">${T(a.name_key)}</div>
        <div class="state" id="state-${a.id}">${T('common.enabled')}</div>
      `;
      left.appendChild(textWrap);

      if (a.has_settings) {
        const gear = document.createElement('button');
        gear.type = 'button';
        gear.className = 'gear-btn';
        gear.setAttribute('aria-label', 'settings');
        // простая иконка (inline svg = меньше запросов)
        gear.innerHTML = `
          <svg class="feather-settings" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>`;
        gear.addEventListener('click', ()=>{
          // ведём на страницу параметров RSI (i18n язык сохраняем)
          const lang = window.I18N?.lang || 'en';
          window.location.href = `setting_alerts_rsi.html?lang=${encodeURIComponent(lang)}`;
        });
        left.appendChild(gear);
      }

      row.appendChild(left);

      // правый переключатель
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'switch';
      sw.setAttribute('data-on', String(a.on));
      sw.setAttribute('aria-pressed', String(a.on));
      sw.innerHTML = `
        <span class="label">${T('common.on_short')}</span>
        <span class="label">${T('common.off_short')}</span>
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

    updateAllTexts();
    updateAllBadge();
  }

  // локализация динамических «enabled/включено» и т.п.
  function updateAllTexts(){
    alerts.forEach(a=>{
      const st = document.getElementById('state-'+a.id);
      if (st) st.textContent = a.on ? T('common.enabled') : T('alerts.all_status.off');
    });
    // подпись бейджа
    updateAllBadge();
  }

  function updateOne(id){
    const a = alerts.find(x=>x.id===id);
    const state = document.getElementById('state-'+id);
    if(state) state.textContent = a.on ? T('common.enabled') : T('alerts.all_status.off');
    const idx = alerts.findIndex(x=>x.id===id);
    const btn = listEl.querySelectorAll('.switch')[idx];
    if(btn){
      btn.setAttribute('data-on', String(a.on));
      btn.setAttribute('aria-pressed', String(a.on));
      // обновим надписи ON/OFF на всякий случай — вдруг язык сменили
      const labels = btn.querySelectorAll('.label');
      if (labels[0]) labels[0].textContent = T('common.on_short');
      if (labels[1]) labels[1].textContent = T('common.off_short');
    }
  }

  function updateAllBadge(){
    const onCount = alerts.filter(a=>a.on).length;
    const txt = onCount===0 ? T('alerts.all_status.off')
               : onCount===alerts.length ? T('alerts.all_status.on')
               : T('alerts.all_status.partial');
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
      ['balance', T('alerts.items.balance')],
      ['alert2',  T('alerts.items.rsi')],
      ['alert3',  T('alerts.items.item3')],
      ['alert4',  T('alerts.items.item4')],
    ];
    const values = order.map(([id]) => on[id]);
    let body;
    if (values.every(Boolean))      body = T('alerts.summary_all_on');
    else if (values.every(v=>!v))   body = T('alerts.summary_all_off');
    else body = order.map(([id, title]) => `${title} — ${on[id] ? T('common.on') : T('common.off')}`).join('\n');

    return [
      T('alerts.saved_title'),
      T('alerts.saved_prefix'),
      '',
      body,
      '',
      T('alerts.saved_footer')
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
    notifySavedAndMaybeClose(message, { title:T('alerts.saved_title'), closeOnMobile:true });
  });

  // реагируем на смену языка
  window.addEventListener('i18n:change', ()=> render());

  // init
  render();
  attachRipple('.btn, .save-btn');
})();

  render();
  attachRipple('.btn, .save-btn');
})();
