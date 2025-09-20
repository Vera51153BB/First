// ===== Alerts page (модель + рендер + отправка) =====
(function(){
  const {
    tg, DEBUG, safeSendData, notifySavedAndMaybeClose,
    attachRipple, saveLocal, loadLocal, i18n
  } = window.Core;
  const { t, getLang } = i18n || { t:(k)=>k, getLang:()=> 'en' };

  // NEW: маршруты для кнопок «шестерёнка» и «помощь»
  // Примечание: если поменяешь пути/имена файлов — просто правь тут.
  const SETTINGS_RSI_URL = 'setting_alerts_rsi.html';
  const HELP_ALERTS_URL  = 'help_alerts.html';

  /* ===== модель ===== */
  const STORAGE_KEY = 'okx_alerts_v1';
  // Примечание: name в DEFAULT_ALERTS — запасной текст.
  // В рендере мы покажем i18n-текст, если словарь подключён.
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

  /* ===== вспомогательное i18n-имя пункта ===== */
  // NEW: тянем заголовки из словаря, если он есть; иначе — из fallback name
  function titleFor(a){
    switch (a.id) {
      case 'balance': return t('alerts.items.balance') || a.name;
      case 'alert2':  return t('alerts.items.rsi')     || a.name;
      case 'alert3':  return t('alerts.items.item3')   || a.name;
      case 'alert4':  return t('alerts.items.item4')   || a.name;
      default:        return a.name || a.id;
    }
  }

  /* ===== рендер ===== */
  const listEl    = document.getElementById('list');
  const allStateEl= document.getElementById('allState');
  const saveEl    = document.getElementById('saveBtn');

  // NEW: верхняя панель (может отсутствовать на старой верстке — проверяем наличие)
  const settingsBtn = document.getElementById('settingsBtn'); // «шестерёнка»
  const helpBtn     = document.getElementById('helpBtn');     // «помощь»

  let alerts = loadState();

  function render(){
    listEl.innerHTML = '';
    alerts.forEach(a=>{
      const row = document.createElement('div');
      row.className = 'item';

      const left = document.createElement('div');
      left.innerHTML = `
        <div class="name">${titleFor(a)}</div>
        <div class="state" id="state-${a.id}">${a.on ? t('common.on') || 'включено' : (t('common.off') || 'выключено')}</div>
      `;
      row.appendChild(left);

      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'switch';
      sw.setAttribute('data-on', String(a.on));
      sw.setAttribute('aria-pressed', String(a.on));
      sw.innerHTML = `
        <span class="label">${t('common.on_short') || 'ВКЛ'}</span>
        <span class="label">${t('common.off_short') || 'ВЫК'}</span>
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
    if(state) state.textContent = a.on ? (t('common.on') || 'включено') : (t('common.off') || 'выключено');
    const idx = alerts.findIndex(x=>x.id===id);
    const btn = listEl.querySelectorAll('.switch')[idx];
    if(btn){
      btn.setAttribute('data-on', String(a.on));
      btn.setAttribute('aria-pressed', String(a.on));
    }
  }

  function updateAllBadge(){
    const onCount = alerts.filter(a=>a.on).length;
    let txt = t('common.partial') || 'частично';
    if(onCount===0) txt = t('common.off') || 'выключено';
    else if(onCount===alerts.length) txt = t('common.on') || 'включено';
    allStateEl.textContent = txt;
  }

  /* Кнопки «все» */
  document.getElementById('btnAllOn').addEventListener('click', ()=>{
    alerts.forEach(a=>a.on=true);  saveState(alerts); render();
  });
  document.getElementById('btnAllOff').addEventListener('click', ()=>{
    alerts.forEach(a=>a.on=false); saveState(alerts); render();
  });

  /* лог на переключателях (без мгновенной отправки) */
  function onToggleChanged(alertId){
    if (DEBUG) console.log('[WebApp] toggle changed:', alertId, alerts);
  }

  /* СВОДКА статусов для окна/тоста */
  function buildSummary(list){
    const on = Object.fromEntries(list.map(a => [a.id, !!a.on]));
    const order = [
      ['balance', titleFor({id:'balance'})],
      ['alert2',  titleFor({id:'alert2'})],
      ['alert3',  titleFor({id:'alert3'})],
      ['alert4',  titleFor({id:'alert4'})],
    ];
    const yes = t('common.enabled')  || 'ВКЛЮЧЁН';
    const no  = t('common.disabled') || 'ВЫКЛЮЧЕН';

    const values = order.map(([id]) => on[id]);
    let body;
    if (values.every(Boolean))      body = t('alerts.all_on')  || 'Все уведомления: ВКЛЮЧЕНЫ';
    else if (values.every(v=>!v))   body = t('alerts.all_off') || 'Все уведомления: ВЫКЛЮЧЕНЫ';
    else body = order.map(([id, title]) => `${title} — ${on[id] ? yes : no}`).join('\n');

    const header = (t('common.bot_name') || 'OKXcandlebot');
    const sub    = (t('alerts.new_settings') || 'Новые настройки уведомлений:');
    const saved  = (t('alerts.saved_on_device') || 'Настройки сохранены на этом устройстве.');

    return [ header, sub, '', body, '', saved ].join('\n');
  }

  /* «Сохранить настройки» — отправка, вспышка, сводка */
  saveEl.addEventListener('click', ()=>{
    const payload = JSON.stringify({ type:'save', alerts, lang: getLang() });
    const sent = safeSendData(payload);
    if (!sent) saveState(alerts);

    // визуальный отклик
    saveEl.classList.remove('saved'); void saveEl.offsetWidth; saveEl.classList.add('saved');
    try{ tg?.HapticFeedback?.notificationOccurred?.('success'); }catch{}

    const message = buildSummary(alerts);
    notifySavedAndMaybeClose(message, { title:(t('common.bot_name') || 'OKXcandlebot'), closeOnMobile:true });
  });

  // NEW: обработчики верхних кнопок (если присутствуют в верстке)
  if (settingsBtn){
    settingsBtn.addEventListener('click', ()=>{
      const lang = encodeURIComponent(getLang());
      const url  = `${SETTINGS_RSI_URL}?lang=${lang}`;
      // Если подключишь Core.open — можно будет вызвать tg.openLink для внешних URL.
      // Пока просто внутри WebApp открываем страницу (SPA-like переход).
      location.href = url;
    });
  }
  if (helpBtn){
    helpBtn.addEventListener('click', ()=>{
      const lang = encodeURIComponent(getLang());
      const url  = `${HELP_ALERTS_URL}?lang=${lang}`;
      location.href = url;
    });
  }

  // NEW: при смене языка (из Core) — перерендерить подписи
  window.Core?.Bus?.on?.('langchange', ()=>{
    render(); // перерисует названия и статусы
  });

  // init
  render();
  attachRipple('.btn, .save-btn');
})();
