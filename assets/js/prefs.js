// -*- coding: utf-8 -*-
// Файл: assets/js/prefs.js
// ------------------------------------------------------------
// Назначение:
//   • Сохранение пользовательских настроек (prefs) из веб-экрана.
//   • Зарегистрированные пользователи: через API (FastAPI) в users.settings_json.
//   • Незарегистрированные/оффлайн: localStorage → фон. синхронизация позже.
//
// Что делает:
//   • window.saveUserPref(key, value) — дебаунс 800 мс, POST /api/v1/user/prefs.
//   • Передаёт подпись Telegram WebApp через заголовок X-Telegram-InitData.
//   • Безопасно молчит при оффлайне (не ломает UX).
//
// Безопасность:
//   • Бэкенд обязан валидировать X-Telegram-InitData по BOT_TOKEN (см. utils/telegram_webapp_auth.py).
// ------------------------------------------------------------

(function(){
  function debounce(fn, wait){
    let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), wait); };
  }

  // Конфигурация API; при необходимости поменяйте префикс.
  const API_BASE = '/api/v1';
  const INIT_DATA = (window.Telegram && window.Telegram.WebApp) ? (window.Telegram.WebApp.initData || '') : '';

  function saveLocalPref(key, value){
    try{
      const k = 'okx_prefs';
      const cur = JSON.parse(localStorage.getItem(k) || '{}');
      cur[key] = value; cur.updated_at = Date.now();
      localStorage.setItem(k, JSON.stringify(cur));
    }catch(_){}
  }

  async function postUserPref(key, value){
    const url = `${API_BASE}/user/prefs`;
    const body = JSON.stringify({ key, value });
    const headers = { 'Content-Type': 'application/json' };
    if (INIT_DATA) headers['X-Telegram-InitData'] = INIT_DATA;

    const r = await fetch(url, { method:'POST', headers, body });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json(); // { settings_json, saved_at }
  }

  const _saveUserPrefDebounced = debounce(async (key, value)=>{
    // 1) Пишем локально мгновенно (на случай оффлайна)
    saveLocalPref(key, value);

    // 2) Пытаемся сохранить на сервере (если в WebApp/есть API)
    try{
      await postUserPref(key, value);
    }catch(err){
      // Не шумим (UX): оставим локально, синхронизируем позже.
      console.debug('[prefs] local-only fallback:', err?.message || err);
    }
  }, 800);

  // Глобально, чтобы любой модуль/страница мог вызывать
  window.saveUserPref = function(key, value){
    _saveUserPrefDebounced(key, value);
  };
})();
