// ===== Core (общие функции для всех страниц) =====
(function () {
  const tg = window.Telegram?.WebApp ?? null;
  try { tg?.ready(); tg?.expand(); } catch {}

  const PLATFORM = tg?.platform || '';
  const IS_DESKTOP = PLATFORM === 'tdesktop' || PLATFORM === 'macos';
  const DEBUG = true;

  function showToast(msg){
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{ el.classList.remove('show'); el.remove(); }, 2600);
  }

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

  function saveLocal(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }
  function loadLocal(key, def){ try{ const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; }catch{ return def; } }

  // Публичный API
  window.Core = {
    tg, DEBUG, PLATFORM, IS_DESKTOP,
    showToast, safeSendData, notifySavedAndMaybeClose,
    attachRipple, saveLocal, loadLocal,
  };

  // диагностический лог закрытия
  tg?.onEvent?.('web_app_close', () => { if (DEBUG) console.log('[WebApp] event: web_app_close'); });
})();
