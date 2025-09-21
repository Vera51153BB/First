// ===== Alerts page (модель + рендер + отправка) =====
(function(){
  // базовые утилиты из Core
  const { tg, DEBUG, safeSendData, notifySavedAndMaybeClose, attachRipple, saveLocal, loadLocal } = window.Core;

  // ---- i18n helpers ----
  const t       = (k)=> window.I18N?.t(k) ?? k;                 // общий перевод по ключу
  const tCommon = (k)=> t('common.'+k);                         // common.*
  const tAlerts = (k)=> t('alerts.'+k);                         // alerts.*

  /* ===== модель ===== */
  const STORAGE_KEY = 'okx_alerts_v1';
  const DEFAULT_ALERTS = [
    { id: 'balance', name: '', on: true },
    { id: 'alert2',  name: '', on: true },  // alias: RSI
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
  const allStateEl = document.getElementById('allState');   // СПРАВА от «Все уведомления:»
  const saveEl     = document.getElementById('saveBtn');

  let alerts = loadState();

  function render(){
    // 1) Заголовок «Все уведомления: …» (простой текст)
    updateAllBadge();

    // 2) Список элементов
    listEl.innerHTML = '';
    alerts.forEach((a, index)=>{
      const row = document.createElement('div');
      row.className = 'item';

      // --- левая часть: название + текущий статус ---
      const left = document.createElement('div');
      const displayName = a.name || t(`alerts.items.${a.id}`) || a.id;
      left.innerHTML = `
        <div class="name">${displayName}</div>
        <div class="state" id="state-${a.id}">${a.on ? tCommon('on') : tCommon('off')}</div>
      `;
      row.appendChild(left);

      // --- тумблер (переключатель ON/OFF на карточке) ---
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

      // --- шестерёнка (кнопка настроек справа) ---
      // ВАЖНО: нужен символ <symbol id="icon-gear"> в alerts.html (см. инструкцию)
      const gearBtn = document.createElement('button');
      gearBtn.className = 'gear-btn';
      gearBtn.setAttribute('aria-label', t('common.settings') || 'Settings');
      gearBtn.innerHTML = `<svg><use href="#icon-gear"></use></svg>`;

      // переход по шестерёнке (пример: для RSI ведём на страницу настроек)
      gearBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        if (a.id === 'alert2') {
          // страница настроек RSI (путь под себя)
          window.location.href = 'setting_alerts_rsi.html';
        } else {
          // можно отправить событие в бота или показать тост
          window.Core.showToast(t('common.settings'));
        }
      });

      // --- правая часть строки: тумблер + шестерёнка ---
      const rightWrap = document.createElement('div');
      rightWrap.style.display = 'flex';
      rightWrap.style.alignItems = 'center';
      rightWrap.style.gap = '10px';
      rightWrap.appendChild(sw);
      rightWrap.appendChild(gearBtn);

      row.appendChild(rightWrap);
      listEl.appendChild(row);
    });
  }

  // Обновление одной карточки после клика/смены языка
  function updateOne(id){
    const a = alerts.find(x => x.id === id);

    // текст «включено/выключено»
    const state = document.getElementById('state-'+id);
    if (state) state.textContent = a.on ? tCommon('on') : tCommon('off');

    // тумблер (визуальное состояние + подписи ON/OFF)
    const idx = alerts.findIndex(x => x.id === id);
    const btn = listEl.querySelectorAll('.switch')[idx];
    if (btn) {
      btn.setAttribute('data-on', String(a.on));
      btn.setAttribute('aria-pressed', String(a.on));
      const labels = btn.querySelectorAll('.label');
      if (labels[0]) labels[0].textContent = tCommon('on_short');
      if (labels[1]) labels[1].textContent = tCommon('off_short');
    }

    // сам заголовок элемента (если берётся из словаря)
    const nameNode = listEl.querySelectorAll('.item .name')[idx];
    if (nameNode && !DEFAULT_ALERTS[idx].name) {
      nameNode.textContent = t(`alerts.items.${a.id}`);
    }
  }

  // ---- НОВОЕ: статус «Все уведомления: …» — просто текст, без бейджа ----
  function updateAllBadge(){
    const onCount = alerts.filter(a=>a.on).length;
    const total   = alerts.length;
    let txt = tCommon('partially');           // «частично / Partially On»
    if(onCount===0)     txt = tCommon('off'); // «выключено / Off»
    else if(onCount===total) txt = tCommon('on'); // «включено / On»
    allStateEl.textContent = txt;
  }

  /* Кнопки «все» (массовое включение/выключение) */
  document.getElementById('btnAllOn').addEventListener('click', ()=>{
    alerts.forEach(a=>a.on=true);
    saveState(alerts);
    render();
  });
  document.getElementById('btnAllOff').addEventListener('click', ()=>{
    alerts.forEach(a=>a.on=false);
    saveState(alerts);
    render();
  });

  /* СВОДКА статусов для окна/тоста */
  function buildSummary(list){
    const on = Object.fromEntries(list.map(a => [a.id, !!a.on]));
    const order = [['balance'],['alert2'],['alert3'],['alert4']];

    const values = order.map(([id]) => on[id]);
    let body;

    // поддерживаем оба варианта ключей (старые и новые)
    const ALL_ON  = t('alerts.summary_all_on')  || t('alerts.summary.all_on');
    const ALL_OFF = t('alerts.summary_all_off') || t('alerts.summary.all_off');

    if (values.every(Boolean))      body = ALL_ON;
    else if (values.every(v=>!v))   body = ALL_OFF;
    else body = order
      .map(([id]) => `${t(`alerts.items.${id}`)} — ${on[id] ? tCommon('on') : tCommon('off')}`)
      .join('\n');

    return [
      'OKXcandlebot',
      t('alerts.saved_prefix'),  // заголовок «Новые настройки…»
      '',
      body,
      '',
      t('alerts.saved_footer')   // «сохранено на этом устройстве»
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
  attachRipple('.btn, .save-btn');
})();
