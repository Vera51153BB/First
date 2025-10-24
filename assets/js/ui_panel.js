/* ЗАМЕНИ файл целиком этим небольшим контроллером */
(function(){
  const panel   = document.getElementById('panel');
  const btnDock = document.getElementById('btn-panel');
  const btnClose= document.getElementById('btn-close');

  panel.style.willChange = 'transform';  // для iOS более плавно

  function openPanel(){
    if (!panel.hidden) {
      panel.classList.add('open');
      btnDock.setAttribute('aria-expanded','true');
      return;
    }
    panel.hidden = false;
    requestAnimationFrame(()=>{          // даём разметке примениться
      panel.classList.add('open');
      btnDock.setAttribute('aria-expanded','true');
    });
  }
  function closePanel(){
    panel.classList.remove('open');
    btnDock.setAttribute('aria-expanded','false');
    const onEnd = ()=>{                   // прячем только после анимации
      panel.removeEventListener('transitionend', onEnd);
      if (!panel.classList.contains('open')) panel.hidden = true;
    };
    panel.addEventListener('transitionend', onEnd);
  }
  function toggle(){ panel.classList.contains('open') ? closePanel() : openPanel(); }

  btnDock?.addEventListener('click', toggle);
  btnClose?.addEventListener('click', closePanel);

  // экспорт (если вдруг нужно дернуть из других модулей)
  window.__panelCtl = { openPanel, closePanel, toggle };
})();
