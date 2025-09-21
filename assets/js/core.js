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

  // NEW: компактный debounce
  function debounce(fn, wait=250){ let t=null; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }

  // NEW: EventBus (напр., смена языка)
  const Bus = (()=> {
    const m = new Map();
    return {
      on(evt, fn){ if(!m.has(evt)) m.set(evt, new Set()); m.get(evt).add(fn); return ()=>m.get(evt).delete(fn); },
      emit(evt, p){ m.get(evt)?.forEach(f=>{ try{ f(p); }catch(e){ console.error(e); } }); },
    };
  })();

  // ===== i18n обвязка (интеграция с window.I18N из assets/js/i18n.js) =====
  const OKX_LANGS = [
    { code:'en', label:'English'  },
    { code:'hi', label:'हिन्दी'    },
    { code:'es', label:'Español'  },
    { code:'fr', label:'Français' },
    { code:'ru', label:'Русский'  },
  ];

  function currentLang(){ return window.I18N?.lang || 'en'; }
  function setLang(code){ window.I18N?.setLang(code); Bus.emit('langchange', code); }
  function t(path){ return window.I18N?.t(path) ?? path; }

  // Инициализация выпадающего меню языков
  function initLangDropdown(){
    const toggle = document.getElementById('langToggle');
    const dd     = document.getElementById('langDropdown');
    const curr   = document.getElementById('langCurrent');
    if(!toggle || !dd || !curr) return;

    // наполнение
    dd.innerHTML = '';
    const now = currentLang();
    curr.textContent = OKX_LANGS.find(l=>l.code===now)?.label || 'English';

    OKX_LANGS.forEach(l=>{
      const btn = document.createElement('button');
      btn.className = 'lang-item' + (l.code===now ? ' active' : '');
      btn.setAttribute('role','menuitem');
      btn.dataset.lang = l.code;
      btn.innerHTML = `<span class="dot"></span><span class="label">${l.label}</span>`;
      btn.addEventListener('click', ()=>{
        setLang(l.code);
        curr.textContent = l.label;
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        // отметим активный
        dd.querySelectorAll('.lang-item').forEach(x=>x.classList.toggle('active', x.dataset.lang===l.code));
      });
      dd.appendChild(btn);
    });

    // открытие/закрытие
    toggle.addEventListener('click', ()=>{
      const open = dd.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e)=>{
      if (!dd.contains(e.target) && !toggle.contains(e.target)) {
        dd.classList.remove('open'); toggle.setAttribute('aria-expanded','false');
      }
    });

    // при смене языка извне
    window.addEventListener('i18n:change', (ev)=>{
      const code = ev?.detail?.lang || currentLang();
      const lang = OKX_LANGS.find(l=>l.code===code) || OKX_LANGS[0];
      curr.textContent = lang.label;
      dd.querySelectorAll('.lang-item').forEach(x=>x.classList.toggle('active', x.dataset.lang===code));
      // перерисуем тексты с data-i18n
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
    i18n: { t, setLang, currentLang, OKX_LANGS },
  };

  // Лог закрытия
  tg?.onEvent?.('web_app_close', () => { if (DEBUG) console.log('[WebApp] event: web_app_close'); });

  // Авто-инициализация
  document.addEventListener('DOMContentLoaded', ()=>{
    initLangDropdown();
    translateHTML();

// Language dropdown (Help рядом)
document.addEventListener('DOMContentLoaded', () => {
  const dd = document.getElementById('langDropdown');
  if(!dd) return;

  const trigger = dd.querySelector('.lang-trigger');
  const menu = dd.querySelector('.lang-menu');
  const current = document.getElementById('langCurrent');

  // Показ/скрытие
  trigger?.addEventListener('click', (e)=>{
    e.stopPropagation();
    dd.classList.toggle('open');
    trigger.setAttribute('aria-expanded', dd.classList.contains('open'));
  });
  document.addEventListener('click', (e)=>{
    if(!dd.contains(e.target)){ dd.classList.remove('open'); trigger?.setAttribute('aria-expanded','false'); }
  });

  // Выбор языка
  menu?.querySelectorAll('button[data-lang]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const lang = btn.dataset.lang;
      window.Core.i18n.setLang(lang);
      current.textContent = (
        lang === 'en' ? 'English' :
        lang === 'hi' ? 'हिन्दी' :
        lang === 'es' ? 'Español' :
        lang === 'fr' ? 'Français' :
        'Русский'
      );
      dd.classList.remove('open');
      trigger?.setAttribute('aria-expanded','false');
    });
  });

  // Подписка на смену языка — держим заголовок триггера в актуальном состоянии
  window.addEventListener('i18n:change', (ev)=>{
    const l = ev.detail?.lang || window.Core.i18n.getLang();
    current.textContent = (
      l === 'en' ? 'English' :
      l === 'hi' ? 'हिन्दी' :
      l === 'es' ? 'Español' :
      l === 'fr' ? 'Français' :
      'Русский'
    );
  });

  // Help — просто событие/тост (можешь открыть /help-страницу)
  document.getElementById('helpBtn')?.addEventListener('click', ()=>{
    window.Core.showToast(window.I18N?.t('common.help') || 'Help');
  });
});
    
    // Кнопка "Помощь" — пока просто отправим событие в бота
    const help = document.getElementById('helpBtn');
    help?.addEventListener('click', ()=>{
      const sent = safeSendData(JSON.stringify({ type:'help' }));
      if (!sent) showToast(t('common.help'));
    });
  });
})();

