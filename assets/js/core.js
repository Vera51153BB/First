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

  // Попап/тост «сохранено»
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

  // LocalStorage helpers
  function saveLocal(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }
  function loadLocal(key, def){ try{ const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; }catch{ return def; } }

  // Небольшие утилиты
  function debounce(fn, wait=250){ let t=null; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }
  const Bus = (()=>{ const m=new Map(); return { on(e,f){ if(!m.has(e)) m.set(e,new Set()); m.get(e).add(f); return()=>m.get(e).delete(f);}, emit(e,p){ m.get(e)?.forEach(f=>{try{f(p)}catch(err){console.error(err)}});} }; })();

  // ===== i18n обвязка (интеграция с window.I18N) =====
  const LANGS = [
    { code:'en', label:'English'  },
    { code:'hi', label:'हिन्दी'    },
    { code:'ru', label:'Русский'  },    
    { code:'es', label:'Español'  },
    { code:'fr', label:'Français' },
    { code:'fr', label:'Deutsch' },
    { code:'ru', label:'Italiano'  },
  ];
  function t(path){ return window.I18N?.t(path) ?? path; }
  function currentLang(){ return window.I18N?.lang || 'en'; }
  function setLang(code){ window.I18N?.setLang(code); Bus.emit('langchange', code); }

  // === Инициализация выпадающего меню языков (под разметку alerts.html) ===
  function initLangDropdown(){
    const menu  = document.getElementById('langMenu');
    const btn   = document.getElementById('langBtn');
    const list  = document.getElementById('langList');
    const label = document.getElementById('langBtnLabel');
    const help  = document.getElementById('helpBtn');

    if(!menu || !btn || !list){ return; }

    // установить текущую подпись
    const cur = LANGS.find(l=>l.code===currentLang()) || LANGS[0];
    if (label) label.textContent = cur.label;

    // открыть/закрыть меню
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e)=>{
      if (!menu.contains(e.target)) { menu.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
    });

    // выбор языка
    list.querySelectorAll('li[data-lang]').forEach(li=>{
      li.addEventListener('click', ()=>{
        const code = li.getAttribute('data-lang');
        setLang(code);
        const found = LANGS.find(l=>l.code===code) || LANGS[0];
        if (label) label.textContent = found.label;
        // отметить активный
        list.querySelectorAll('li').forEach(x=>x.classList.toggle('active', x===li));
        // закрыть
        menu.classList.remove('open'); btn.setAttribute('aria-expanded','false');
      });
    });

    // хелп: показ тоста (или замени на переход)
    help?.addEventListener('click', (e)=>{
      const r = help.getBoundingClientRect();
      help.style.setProperty('--rx', (e.clientX - r.left) + 'px');
      help.style.setProperty('--ry', (e.clientY - r.top)  + 'px');
      help.classList.remove('rippling'); void help.offsetWidth; help.classList.add('rippling');
      showToast(t('common.help'));
      try{ tg?.sendData?.(JSON.stringify({type:'help'})); }catch{}
    });

    // при смене языка «извне»
    window.addEventListener('i18n:change', (ev)=>{
      const code = ev?.detail?.lang || currentLang();
      const found = LANGS.find(l=>l.code===code) || LANGS[0];
      if (label) label.textContent = found.label;
      list.querySelectorAll('li').forEach(x=>x.classList.toggle('active', x.getAttribute('data-lang')===code));
      translateHTML();
    });
  }

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

  // Публичный API
  window.Core = {
    tg, DEBUG, PLATFORM, IS_DESKTOP,
    showToast, safeSendData, notifySavedAndMaybeClose,
    attachRipple, saveLocal, loadLocal, debounce, Bus,
    i18n: { t, setLang, currentLang, LANGS }
  };

  // Лог закрытия
  tg?.onEvent?.('web_app_close', () => { if (DEBUG) console.log('[WebApp] event: web_app_close'); });

  // Авто-инициализация
  document.addEventListener('DOMContentLoaded', ()=>{
    initLangDropdown();
    translateHTML();
    // риппл для кнопок-пилюль в топбаре
    attachRipple('#helpBtn, #langBtn');
  });
})();
