// ===== Alerts page (модель + рендер + отправка) =====
// Примечания:
// - Этот файл предполагает, что уже загружены:
//   1) telegram-web-app.js
//   2) assets/js/i18n.js   (где window.I18N содержит словари)
//   3) assets/js/core.js   (где window.Core = { tg, i18n, ... })
//
// - Мы ждём DOMContentLoaded, чтобы элементы #list/#saveBtn уже существовали.
// - Мультиязык: все подписи берутся из словарей через Core.i18n.t().
//   Для общих фраз используем неймспейс "common", для этой страницы — "alerts".
// - На пункте "Индекс RSI" показываем кнопку-шестерёнку (переход на страницу настроек).

document.addEventListener('DOMContentLoaded', () => {
  if (!window.Core) {
    console.error('[alerts.page] Core is not loaded — check script order and core.js errors');
    return;
  }

  const {
    tg, DEBUG,
    safeSendData, notifySavedAndMaybeClose, attachRipple,
    saveLocal, loadLocal, Bus, i18n
  } = window.Core;

  // Удобные алиасы перевода
  const tCommon = (k) => i18n.t(k, 'common'); // общий неймспейс
  const tA      = (k) => i18n.t(k, 'alerts'); // неймспейс этой страницы
  const tItem   = (id) => i18n.t(`items.${id}`, 'alerts'); // название пункта по id

  /* ===== модель ===== */
  const STORAGE_KEY = 'okx_alerts_v1';

  // Примечание: name хранить не обязательно — рендерим по id через словари.
  // Но оставим для совместимости: если name есть — используем, иначе берём переведённый.
  const DEFAULT_ALERTS = [
    { id: 'balance', name: null, on: true },
    { id: 'alert2',  name: null, on: true }, // Индекс RSI
    { id: 'alert3',  name: null, on: true },
    { id: 'alert4',  name: null, on: true },
  ];

  function loadState(){
    const saved = loadLocal(STORAGE_KEY, null);
    if (!saved) return DEFAULT_ALERTS.map(x => ({...x}));
    const map = Object.fromEntries(saved.map(a => [a.id, a.on]));
    return DEFAULT_ALERTS.map(d => ({ ...d, on: map[d.id] ?? d.on }));
  }
  function saveState(arr){ saveLocal(STORAGE_KEY, arr); }

  /* ===== элементы ===== */
  const listEl     = document.getElementById('list');
  const allStateEl = document.getElementById('allState');
  const saveEl     = document.getElementById('saveBtn');
  const btnAllOn   = document.getElementById('btnAllOn');
  const btnAllOff  = document.getElementById('btnAllOff');

  if (!listEl || !allStateEl || !saveEl || !btnAllOn || !btnAllOff) {
    console.error('[alerts.page] Missing required DOM nodes (#list/#allState/#saveBtn/#btnAllOn/#btnAllOff)');
  }

  let alerts = loadState();

  /* ===== рендер ===== */
  function render(){
    // Перевод бейджа состояния «все»
    updateAllBadge();

    // Список
    listEl.innerHTML = '';
    alerts.forEach(a => {
      const row = document.createElement('div');
      row.className = 'item';

      // Левая колонка: название + подпись «включено/выключено»
      const left = document.createElement('div');
      const nameText = a.name || tItem(a.id); // если name не задан, тянем из словаря
      left.innerHTML = `
        <div class="name">${nameText}</div>
        <div class="state" id="state-${a.id}">
          ${a.on ? tCommon('on') : tCommon('off')}
        </div>
      `;
      row.appendChild(left);

      // Кнопка «шестерёнка» для RSI (переход к детальной настройке)
      // Примечание: если не нужна — можно скрыть через CSS .gear-btn{display:none;}
      if (a.id === 'alert2') {
        const gear = document.createElement('button');
        gear.type = 'button';
        gear.className = 'gear-btn';
        gear.setAttribute('aria-label', tCommon('settings'));
        // иконку можно нарисовать CSS или вставить SVG; здесь — минимальная «три полоски»
        gear.innerHTML = `<span class="gear-ico" aria-hidden="true"></span>`;
        gear.addEventListener('click', (ev) => {
          ev.stopPropagation();
          // Используем Telegram API, если доступно; иначе обычная ссылка
          const url = (window.ALERTS_RSI_URL || 'setting_alerts_rsi.html');
          try {
            if (typeof tg?.openLink === 'function') tg.openLink(url);
            else window.open(url, '_blank', 'noopener');
          } catch { window.open(url, '_blank', 'noopener'); }
        });
        row.appendChild(gear);
      }

      // Тумблер
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'switch';
      sw.setAttribute('data-on', String(a.on));
      sw.setAttribute('aria-pressed', String(a.on));
      sw.innerHTML = `
        <span class="label">${tCommon('on')}</span>
        <span class="label">${tCommon('off')}</span>
        <span class="knob"></span>
      `;

      sw.addEventListener('click', () => {
        a.on = !a.on;
        saveState(alerts);
        updateOne(a.id);
        updateAllBadge();
        onToggleChanged(a.id);
        try { tg?.HapticFeedback?.selectionChanged?.(); } catch {}
      });

      row.appendChild(sw);
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
      // также перерисуем короткие подписи ON/OFF на тумблере (если сменили язык):
      const labels = btn.querySelectorAll('.label');
      if (labels[0]) labels[0].textContent = tCommon('on');
      if (labels[1]) labels[1].textContent = tCommon('off');
    }
    // и название, если оно берётся из словаря
    const nameNode = listEl.querySelectorAll('.item .name')[idx];
    if (nameNode && !DEFAULT_ALERTS[idx].name) {
      nameNode.textContent = tItem(a.id);
    }
  }

function updateAllBadge(){
  const onCount = alerts.filter(a => a.on).length;

  // левая неизменная часть: «Все уведомления:»
  const labelEl = document.getElementById('allLabel');
  if (labelEl) labelEl.textContent = tA('header_label'); // из словаря alerts.header_label

  // правый бейдж: Включены / Выключены / Частично
  let txt = tCommon('partially');        // «частично»
  if (onCount === 0) txt = tCommon('off');
  else if (onCount === alerts.length) txt = tCommon('on');
  allStateEl.textContent = txt;
}

  /* Кнопки «все» */
  btnAllOn.addEventListener('click', () => { alerts.forEach(a => a.on = true);  saveState(alerts); render(); });
  btnAllOff.addEventListener('click', () => { alerts.forEach(a => a.on = false); saveState(alerts); render(); });

  /* лог на переключателях (без мгновенной отправки) */
  function onToggleChanged(alertId){
    if (DEBUG) console.log('[WebApp] toggle changed:', alertId, alerts);
  }

  /* СВОДКА статусов для окна/тоста (на текущем языке) */
  function buildSummary(list){
    const onMap = Object.fromEntries(list.map(a => [a.id, !!a.on]));
    const order = ['balance', 'alert2', 'alert3', 'alert4'];
    const allOn  = order.every(id => onMap[id]);
    const allOff = order.every(id => !onMap[id]);

    let body;
    if (allOn)      body = tA('summary.all_on');   // например: "Все уведомления: ВКЛЮЧЕНЫ"
    else if (allOff)body = tA('summary.all_off');  // например: "Все уведомления: ВЫКЛЮЧЕНЫ"
    else {
      body = order
        .map(id => `${tItem(id)} — ${onMap[id] ? tCommon('on_caps') : tCommon('off_caps')}`)
        .join('\n');
    }

    return [
      'OKXcandlebot',
      tA('summary.title'), // "Новые настройки уведомлений:"
      '',
      body,
      '',
      tA('summary.saved')  // "Настройки сохранены на этом устройстве."
    ].join('\n');
  }

  /* «Сохранить настройки» — отправка, вспышка, сводка */
  saveEl.addEventListener('click', () => {
    const payload = JSON.stringify({ type:'save', alerts });
    const sent = safeSendData(payload);
    if (!sent) saveState(alerts);

    // визуальный отклик
    saveEl.classList.remove('saved'); void saveEl.offsetWidth; saveEl.classList.add('saved');
    try { tg?.HapticFeedback?.notificationOccurred?.('success'); } catch {}

    const message = buildSummary(alerts);
    notifySavedAndMaybeClose(message, { title:'OKXcandlebot', closeOnMobile:true });
  });

  // Ререндер при смене языка (кнопки EN/हिन्दी/RU в topbar)
  Bus.on('langchange', () => render());

  // Старт
  render();
  attachRipple('.btn, .save-btn, .gear-btn');
});
