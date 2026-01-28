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
    { id: 'alert_rsi',  name: '', on: true },  // RSI: зоны и экстремумы
    { id: 'alert_ema',  name: '', on: true },  // Скользящая средняя (EMA)
    { id: 'alert4',  name: '', on: false }, // Скоро (в разработке)
    { id: 'balance', name: '', on: false }, // Скоро (в разработке), legacy-id
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
  // «Все уведомления: …»
  updateAllBadge();

  listEl.innerHTML = '';

  alerts.forEach((a) => {
    // контейнер строки
    const row = document.createElement('div');
    row.className = 'item item--split';

    // ---------- ВЕРХ: name | state ----------
    const top = document.createElement('div');
    top.className = 'row-top';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = a.name || t(`alerts.items.${a.id}`) || a.id;

    const stateDiv = document.createElement('div');
    stateDiv.className = 'state';
    stateDiv.id = 'state-' + a.id;
    stateDiv.textContent = a.on ? tCommon('on') : tCommon('off');

    top.appendChild(nameDiv);
    top.appendChild(stateDiv);

    // ---------- НИЗ: gear | switch (switch справа) ----------
    const bottom = document.createElement('div');
    bottom.className = 'row-bottom';

    // шестерёнка
    const gearBtn = document.createElement('button');
    gearBtn.className = 'gear-btn';
    gearBtn.setAttribute('aria-label', t('common.settings') || 'Settings');
    gearBtn.innerHTML = `
  <svg viewBox="-1 -1 26 26" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </g>
  </svg>`;
    gearBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      if (a.id === 'alert_rsi') {
        // Настройки RSI
        window.location.href = 'setting_alerts_rsi.html';
      } else if (a.id === 'alert_ema') {
        // Новая страница настроек EMA
        window.location.href = 'setting_alerts_ma.html';
      } else {
        // Для будущих уведомлений 3–4 показываем "Скоро"
        window.Core.showToast(tCommon('coming_soon'));
      }
    });


    // тумблер
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

    bottom.appendChild(gearBtn);
    bottom.appendChild(sw);

    // сборка строки
    row.appendChild(top);
    row.appendChild(bottom);
    listEl.appendChild(row);
  });

  // ripple для интерактивных
  attachRipple('.btn, .save-btn, .gear-btn, .switch');
}

function updateOne(id){
  const a = alerts.find(x => x.id === id);
  const state = document.getElementById('state-'+id);
  if (state) state.textContent = a.on ? tCommon('on') : tCommon('off');

  // тумблер внутри нужной строки
  const idx = alerts.findIndex(x => x.id === id);
  const row = listEl.querySelectorAll('.item')[idx];
  const btn = row?.querySelector('.switch');
  if (btn) {
    btn.setAttribute('data-on', String(a.on));
    btn.setAttribute('aria-pressed', String(a.on));
    const labels = btn.querySelectorAll('.label');
    if (labels[0]) labels[0].textContent = tCommon('on_short');
    if (labels[1]) labels[1].textContent = tCommon('off_short');
  }

  // обновим заголовок при смене языка
  const nameNode = row?.querySelector('.name');
  if (nameNode && !a.name) nameNode.textContent = t(`alerts.items.${a.id}`);
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
    const order = [['alert_rsi'], ['alert_ema'], ['alert4'], ['balance']];
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
// ===== EMA settings → отправка в Telegram WebAppData =====
(function(){
  "use strict";

  const core = window.Core || {};
  const tg = core.tg;
  const safeSendData = core.safeSendData;
  const notifySavedAndMaybeClose = core.notifySavedAndMaybeClose;

  // Если по какой-то причине core не инициализировался — тихо выходим
  if (!safeSendData) return;

  // Кнопка "Сохранить EMA" в alerts.html
  const emaSaveBtn = document.getElementById('emaSaveBtn');
  if (!emaSaveBtn) return;

  emaSaveBtn.addEventListener('click', () => {
    // ⚠️ Пока отправляем тестовый стаб: все TF включены, все типы сигналов включены.
    // Важно: структура ДОЛЖНА совпадать с тем, что ждёт build_ema_patch_from_payload().
    const payload = {
      type: "save_ema",
      ema: {
        // список включённых таймфреймов (subset разрешённых значений)
        tfs: ["15m", "1h", "4h", "8h", "12h", "1d"],
        // типы сигналов: ключи строго такие, как в ema_settings.build_ema_patch_from_payload
        signals: {
          cross: true,  // пересечение быстрой и медленной EMA
          price: true,  // цена пересекает EMA (на бэке превратится в price_cross)
          slope: true   // смена наклона EMA
        }
      }
    };

    const ok = safeSendData(JSON.stringify(payload));
    if (!ok) {
      // Если Telegram не принял WebAppData (старый клиент и т.п.)
      alert("Не удалось отправить настройки EMA в Telegram. Попробуйте обновить приложение.");
      return;
    }

    // Лёгкий визуальный отклик
    try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (e) {}

    // Тот же механизм, что и для основных тумблеров
    notifySavedAndMaybeClose(
      "Новые настройки EMA отправлены боту и будут использованы при формировании сигналов.",
      { title: "BotCryptoSignal", closeOnMobile: false }
    );
  });
})();

