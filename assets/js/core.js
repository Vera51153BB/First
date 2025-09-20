// ===== Core (общие функции для всех страниц) =====
(function () {
  // Telegram WebApp bootstrap
  const tg = window.Telegram?.WebApp ?? null;
  try { tg?.ready(); tg?.expand(); } catch {}

  const PLATFORM = tg?.platform || '';
  const IS_DESKTOP = PLATFORM === 'tdesktop' || PLATFORM === 'macos';
  const DEBUG = true;

  // Быстрый тост для Desktop/браузера
  function showToast(msg){
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{ el.classList.remove('show'); el.remove(); }, 2600);
  }

  // Безопасная отправка данных в бота (WebApp → bot)
  function safeSendData(payload){
    try {
      if (typeof tg?.sendData === 'function') {
        tg.sendData(payload);
        if (DEBUG) console.log('[WebApp] sendData →', payload);
        return true;
      }
    } catch(e){ console.error('[WebApp] sendData error:', e); }
    if (DEBUG) console.warn('[WebApp] not in Telegram (sendData unavailable)');
    return false;
  }

  // Показывает системное окно на мобилках; на Desktop — только тост (без закрытия клиента)
  function notifySavedAndMaybeClose(message, { title='OKXcandlebot', closeOnMobile=true } = {}){
    if (IS_DESKTOP) { showToast(message); return; }

    if (typeof tg?.showPopup === 'function') {
      try {
        tg.showPopup(
          { title, message, buttons: [{ id:'ok', type:'ok' }] },
          (btnId) => {
            if (btnId === 'ok' && closeOnMobile) {
              setTimeout(()=>{ try { tg.close(); } catch {} }, 120);
            }
          }
        );
        tg?.HapticFeedback?.notificationOccurred?.('success');
        return;
      } catch(e){ console.warn('showPopup failed, fallback to alert', e); }
    }

    if (typeof tg?.showAlert === 'function') {
      try {
        tg.showAlert(`${title}\n${message}`, () => {
          if (closeOnMobile) setTimeout(()=>{ try { tg.close(); } catch {} }, 120);
        });
        tg?.HapticFeedback?.notificationOccurred?.('success');
        return;
      } catch(e){ console.warn('showAlert failed, fallback to toast', e); }
    }

    showToast(message);
  }

  // Риппл-эффект + лёгкий хаптик
  function attachRipple(selector){
    document.querySelectorAll(selector).forEach(el=>{
      el.addEventListener('click', (e)=>{
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--rx', (e.clientX - rect.left) + 'px');
        el.style.setProperty('--ry', (e.clientY - rect.top)  + 'px');
        el.classList.remove('rippling'); void el.offsetWidth; el.classList.add('rippling');
        try{ tg?.HapticFeedback?.impactOccurred?.('light'); }catch{}
      });
    });
  }

  // LocalStorage helpers
  function saveLocal(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }
  function loadLocal(key, def){ try{ const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; }catch{ return def; } }

  // NEW: компактный debounce для антиспама отправок/рендеров
  function debounce(fn, wait=250){
    let t=null;
    return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
  }

  // NEW: простой EventBus для внутренних уведомлений (например, смена языка)
  const Bus = (()=> {
    const listeners = new Map(); // event -> Set<fn>
    return {
      on(evt, fn){ if(!listeners.has(evt)) listeners.set(evt, new Set()); listeners.get(evt).add(fn); return ()=>this.off(evt, fn); },
      off(evt, fn){ listeners.get(evt)?.delete(fn); },
      emit(evt, payload){ listeners.get(evt)?.forEach(fn=>{ try{ fn(payload); }catch(e){ console.error(e); } }); },
    };
  })();

  // ===== i18n (минимальный каркас) =====
  // Примечания:
  // - Словари храним в window.I18N (см. assets/js/i18n.js).
  // - Ключ хранится в localStorage под ключом OKX_LANG_KEY.
  // - Расстановка текстов по атрибутам data-i18n и data-i18n-placeholder.
  const OKX_LANG_KEY = 'okx_lang';
  const FALLBACK_ORDER = ['en','hi','ru']; // порядок по умолчанию
  const VALID_LANGS = new Set(['en','hi','ru']);

  function detectLang(){
    const saved = (localStorage.getItem(OKX_LANG_KEY)||'').trim();
    if (saved && VALID_LANGS.has(saved)) return saved;
    // По navigator.language пытаемся выбрать ru/en/hi, иначе 'en'
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.startsWith('ru')) return 'ru';
    if (nav.startsWith('hi')) return 'hi';
    return 'en';
  }

  function getLang(){ return (localStorage.getItem(OKX_LANG_KEY) || detectLang()); }

  function setLang(lang){
    if (!VALID_LANGS.has(lang)) lang = 'en';
    try{ localStorage.setItem(OKX_LANG_KEY, lang); }catch{}
    // визуально переключаем активную кнопку
    document.querySelectorAll('.lang-switch button').forEach(b=>{
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    // пробуем применить переводы на странице
    translateHTML(lang);
    Bus.emit('langchange', lang);
  }

  // NEW: функция перевода узлов по data-* атрибутам
  function t(key, ns){
    // ns — необязательный неймспейс ('alerts', 'rsi' и т.п.)
    const dict = (window.I18N || {});
    const lang = getLang();
    const path = (ns ? `${ns}.${key}` : key);
    const val = path.split('.').reduce((acc, k)=> (acc && acc[k] !== undefined) ? acc[k] : undefined, dict[lang]);
    if (val !== undefined) return String(val);
    // Фолбэк по порядку
    for (const fb of FALLBACK_ORDER){
      const fbVal = path.split('.').reduce((acc, k)=> (acc && acc[k] !== undefined) ? acc[k] : undefined, dict[fb]);
      if (fbVal !== undefined) return String(fbVal);
    }
    return key; // если ничего не нашли — возвращаем ключ
  }

  function translateHTML(lang){
    const nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach(el=>{
      const key = el.getAttribute('data-i18n') || '';
      const ns = el.getAttribute('data-i18n-ns') || '';
      if (!key) return;
      el.textContent = t(key, ns || undefined);
    });
    const phNodes = document.querySelectorAll('[data-i18n-placeholder]');
    phNodes.forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder') || '';
      const ns = el.getAttribute('data-i18n-ns') || '';
      if (!key) return;
      el.setAttribute('placeholder', t(key, ns || undefined));
    });
  }

  // NEW: инициализация языковой панели (вместо старого кода внизу файла)
  function initLangSwitch(){
    const current = getLang();
    // Пометим активную кнопку
    document.querySelectorAll('.lang-switch button').forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.lang === current);
      btn.addEventListener('click', ()=> setLang(btn.dataset.lang));
    });
    // Применим переводы при первом рендере
    translateHTML(current);
  }

  // Публичный API
  window.Core = {
    // базовые
    tg, DEBUG, PLATFORM, IS_DESKTOP,
    showToast, safeSendData, notifySavedAndMaybeClose,
    attachRipple, saveLocal, loadLocal,

    // NEW: доп. утилиты
    debounce,
    Bus,                 // простейший внутренний EventBus
    i18n: {              // i18n-утилиты
      getLang, setLang, t, translateHTML, OKX_LANG_KEY, VALID_LANGS: Array.from(VALID_LANGS)
    },
  };

  // диагностический лог закрытия
  tg?.onEvent?.('web_app_close', () => { if (DEBUG) console.log('[WebApp] event: web_app_close'); });

  // Авто-инициализация i18n-панели после загрузки DOM
  document.addEventListener('DOMContentLoaded', initLangSwitch);
})();

// ===== Управление языковой панелью (legacy-hook) =====
// Примечание: исторический блок оставлен намеренно, чтобы не ломать старые страницы,
// где уже были подключены обработчики. Теперь логика находится в Core (см. initLangSwitch).
// Этот блок не делает ничего, если Core уже повесил обработчики.
document.addEventListener('DOMContentLoaded', ()=>{
  const langBtns = document.querySelectorAll('.lang-switch button');
  if (!langBtns.length) return; // нет панели — выходим

  // Если по какой-то причине Core ещё не выставил active — выставим здесь.
  const saved = localStorage.getItem('okx_lang');
  if(saved){
    const active = document.querySelector(`.lang-switch button[data-lang="${saved}"]`);
    if(active){ langBtns.forEach(b=>b.classList.remove('active')); active.classList.add('active'); }
  }

  // Заодно добавим лёгкий fallback-лог в консоль при клике,
  // но основная логика — в Core.i18n.setLang.
  langBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      console.log('Язык выбран (fallback handler):', btn.dataset.lang);
    }, { once: true });
  });
});
// Управление языковой панелью конец
