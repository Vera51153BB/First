// ===== Core (общие функции для всех страниц) =====
(function () {
  // Telegram WebApp bootstrap
  const tg = window.Telegram?.WebApp ?? null;
  try { tg?.ready(); tg?.expand(); } catch {}

  const PLATFORM = tg?.platform || '';
  const IS_DESKTOP = PLATFORM === 'tdesktop' || PLATFORM === 'macos';
  const DEBUG = true;

  // -------------------- Вспомогалки UI --------------------

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
          (btnId) => { if (btnId === 'ok' && closeOnMobile) setTimeout(()=>{ try { tg.close(); } catch {} }, 120); }
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

  // -------------------- Хранилище/утилиты --------------------

  // LocalStorage helpers
  function saveLocal(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }
  function loadLocal(key, def){ try{ const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; }catch{ return def; } }

  // NEW: компактный debounce (антиспам отправок/рендеров)
  function debounce(fn, wait=250){
    let t=null; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); };
  }

  // NEW: простой EventBus (например, для смены языка)
  const Bus = (()=> {
    const m = new Map();
    return {
      on(evt, fn){ if(!m.has(evt)) m.set(evt, new Set()); m.get(evt).add(fn); return ()=>m.get(evt).delete(fn); },
      emit(evt, p){ m.get(evt)?.forEach(f=>{ try{ f(p); }catch(e){ console.error(e); } }); },
    };
  })();

  // -------------------- i18n-обвязка --------------------
  // Примечания:
  // - Нативные словари и pickLang живут в assets/js/i18n.js и кладут объект window.I18N.
  // - Здесь даём тонкую обёртку + инициализируем новое выпадающее меню языков в правом верхнем углу.

  const OKX_LANGS = [
    { code:'en', label:'English'  },
    { code:'hi', label:'हिन्दी'    },
    { code:'es', label:'Español'  },
    { code:'fr', label:'Français' },
    { code:'ru', label:'Русский'  },
  ];

  function currentLang(){ return window.I18N?.lang || 'en'; }
  function setLang(code){
    if (!OKX_LANGS.some(l=>l.code===code)) code = 'en';
    window.I18N?.setLang(code);
    Bus.emit('langchange', code);
  }
  function t(path){ return window.I18N?.t(path) ?? path; }

  // Применение переводов по data-i18n / data-i18n-placeholder
  function translateHTML(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n'); if(!key) return;
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder'); if(!key) return;
      el.setAttribute('placeholder', t(key));
    });
  }

  // === NEW: dropdown языков (EN, HI, ES, FR, RU) + Help рядом ===
  // Ожидаемая разметка в HTML (см. alerts.html топбар):
  //  <button id="helpBtn" class="pill pill-outline with-icon">...</button>
  //  <div id="langMenu" class="lang-menu">
  //    <button id="langBtn" class="pill pill-outline with-icon"><span id="langBtnLabel">English</span></button>
  //    <ul id="langList" class="lang-list"><li data-lang="en">...</li> ...</ul>
  //  </div>
  function initTopbarLangAndHelp(){
    const btn   = document.getElementById('langBtn');
    const list  = document.getElementById('langList');
    const menu  = document.getElementById('langMenu');
    const label = document.getElementById('langBtnLabel');
    const help  = document.getElementById('helpBtn');

    if (!btn || !list || !menu) return; // на странице нет меню — выходим

    // начальная подпись
    const now = currentLang();
    if (label) {
      const cur = OKX_LANGS.find(l=>l.code===now);
      label.textContent = cur ? cur.label : 'English';
    }

    // открыть/закрыть
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

    // выбор языка
    list.querySelectorAll('li[data-lang]').forEach(li=>{
      li.addEventListener('click', ()=>{
        const L = li.getAttribute('data-lang');
        setLang(L);
        const found = OKX_LANGS.find(x=>x.code===L);
        if (label && found) label.textContent = found.label;
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      });
    });

    // клик вне меню — закрыть
    document.addEventListener('click', (e)=>{
      if (!menu.contains(e.target)) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    });

    // Help — тост/попап (можно заменить на переход)
    if (help) {
      help.addEventListener('click', (e)=>{
        try{
          const r = help.getBoundingClientRect();
          help.style.setProperty('--rx', (e.clientX - r.left) + 'px');
          help.style.setProperty('--ry', (e.clientY - r.top)  + 'px');
          help.classList.remove('rippling'); void help.offsetWidth; help.classList.add('rippling');
          tg?.HapticFeedback?.impactOccurred?.('light');
        }catch{}
        // отправим событие боту; если вне TG — покажем тост
        const sent = safeSendData(JSON.stringify({ type:'help' }));
        if (!sent) showToast(t('common.help') || 'Help');
      });
    }

    // при смене языка извне — обновим label и перерисуем тексты
    window.addEventListener('i18n:change', (ev)=>{
      const code = ev?.detail?.lang || currentLang();
      const lang = OKX_LANGS.find(l=>l.code===code) || OKX_LANGS[0];
      if (label) label.textContent = lang.label;
      translateHTML();
    });
  }

  // -------------------- Публичный API --------------------
  window.Core = {
    tg, DEBUG, PLATFORM, IS_DESKTOP,
    showToast, safeSendData, notifySavedAndMaybeClose,
    attachRipple, saveLocal, loadLocal, debounce, Bus,
    i18n: { t, setLang, currentLang, OKX_LANGS },
    translateHTML,                 // иногда удобно дернуть вручную
  };

  // диагностический лог закрытия
  tg?.onEvent?.('web_app_close', () => { if (DEBUG) console.log('[WebApp] event: web_app_close'); });

  // -------------------- Авто-инициализация --------------------
  document.addEventListener('DOMContentLoaded', ()=>{
    // применим переводы к data-i18n
    translateHTML();
    // инициализируем правый верхний «Help + языки»
    initTopbarLangAndHelp();
    // риппл на маленьких пилюлях
    attachRipple('.pill');
  });
})();
