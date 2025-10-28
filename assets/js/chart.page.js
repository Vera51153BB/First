// -*- coding: utf-8 -*-
// Файл: assets/js/chart.page.js
// ------------------------------------------------------------
// Назначение:
//   • Логика экрана графиков: темы, модалки, нижняя панель, время, индикатор, выбор TF.
//   • По ТЗ: дефолт TF = '1h'; верхняя тех-полоса; центр под график; нижняя панель без прокрутки.
//   • Правила компактности: Refresh всегда видим, отступ ≥ 12px справа; при узких экранах скрываем TF в паре (<336px).
//
// Что делает (кратко):
//   • setTheme(), автоконтраст; модалки Settings/TF/Legend (Esc/фон/кнопка закрывают).
//   • Индикатор LED — статичный на панели; в Легенде точки «дышат» (prefers-reduced-motion уважается).
//   • Время: clock (UTC|local) или rel (MM:SS, если >1ч — 🕐 > 1h).
//   • Выбор TF — обновляет подпись пары и СООБЩАЕТ о выборе в БД: window.saveUserPref('tf', ...).
//
// Внешние зависимости:
//   • window.saveUserPref(key,value) — предоставляется assets/js/prefs.js (подключать ДО этого файла).
// ------------------------------------------------------------

(function(){
    // --- состояние (демо)
    const state = {
      theme: 'blue',
      tf: '1h',
      timezone: 'utc',     // 'local' | 'utc'
      tfmt: 'clock',       // 'clock' | 'rel'
      lastUpdate: Date.now(),
      pair: 'OKX · BTC-USDT-SWAP'
    };

    // --- helpers
    const $ = s => document.querySelector(s);
    const $$ = s => Array.from(document.querySelectorAll(s));
    const pad2 = n => String(n).padStart(2,'0');

    function fmtClock(ts, tz){
      const d = new Date(ts);
      if (tz==='utc') return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} UTC`;
      return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    }
    function fmtRel(ts){
      const diff = Math.max(0, Math.floor((Date.now()-ts)/1000));
      if (diff >= 3600) return '🕐 > 1h';
      const mm = Math.floor(diff/60), ss = diff%60;
      return `${pad2(mm)}:${pad2(ss)}`;
    }

    // автоконтраст для текста в зависимости от панели
    function applyAutoContrast(){
      const cs = getComputedStyle(document.documentElement);
      const bg = cs.getPropertyValue('--panel').trim() || '#000';
      const rgb = bg.startsWith('#') ? hex2rgb(bg) : parseRGB(bg);
      const L = luminance(rgb);
      const text = L > 0.5 ? '#0d1321' : '#e5e7eb';
      const muted = L > 0.5 ? '#4a5568' : '#9bb0cc';
      document.documentElement.style.setProperty('--text', text);
      document.documentElement.style.setProperty('--muted', muted);
    }
    function hex2rgb(hex){
      const h = hex.replace('#','');
      const n = h.length===3 ? h.split('').map(c=>c+c).join('') : h;
      return { r:parseInt(n.slice(0,2),16), g:parseInt(n.slice(2,4),16), b:parseInt(n.slice(4,6),16) };
    }
    function parseRGB(s){ const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i); return m?{r:+m[1],g:+m[2],b:+m[3]}:{r:0,g:0,b:0}; }
    function luminance({r,g,b}){ const a=[r,g,b].map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}); return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]; }

    // --- рендер
    function renderBars(){
      const pairEl = document.getElementById('pair');
      // разделитель перед TF вынесен в отдельный span, чтобы его тоже скрывать
      pairEl.innerHTML = `${state.pair}<span class="sep-tf"> · </span><span class="tf">${state.tf}</span>`;
      pairEl.dataset.full = pairEl.textContent.trim(); // можно оставить для тултипа/будущих ужиманий
    }
    function renderTime(){
      $('#time').textContent = (state.tfmt==='rel') ? fmtRel(state.lastUpdate) : fmtClock(state.lastUpdate, state.timezone);
    }
    function setTheme(t){
      state.theme = t;
      document.documentElement.setAttribute('data-theme', t);
      applyAutoContrast();
    }

    // --- модалки
    function show(el){ el.classList.add('show'); el.setAttribute('aria-hidden','false'); }
    function hide(el){ el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }

    const dlgSettings = $('#dlgSettings');
    const dlgTF = $('#dlgTF');
    const dlgLegend = $('#dlgLegend');

    // settings
    $('#btnSettings').addEventListener('click', ()=>show(dlgSettings));
    $('#btnCloseSettings').addEventListener('click', ()=>hide(dlgSettings));
    dlgSettings.addEventListener('click', (e)=>{ if(e.target===dlgSettings) hide(dlgSettings); });

    $('#themeGrid').addEventListener('click', (e)=>{
      const p = e.target.closest('.pill[data-theme]'); if(!p) return;
      $$('#themeGrid .pill').forEach(x=>x.classList.toggle('active', x===p));
      setTheme(p.dataset.theme);
    });

    $$('#dlgSettings [data-timezone]').forEach(p=>p.addEventListener('click', ()=>{
      $$('#dlgSettings [data-timezone]').forEach(x=>x.classList.remove('active'));
      p.classList.add('active'); state.timezone = p.dataset.timezone; renderTime();
    }));
    $$('#dlgSettings [data-tfmt]').forEach(p=>p.addEventListener('click', ()=>{
      $$('#dlgSettings [data-tfmt]').forEach(x=>x.classList.remove('active'));
      p.classList.add('active'); state.tfmt = p.dataset.tfmt; renderTime();
    }));

    // TF
    $('#btnTF').addEventListener('click', ()=>show(dlgTF));
    $('#btnCloseTF').addEventListener('click', ()=>hide(dlgTF));
    dlgTF.addEventListener('click', (e)=>{ if(e.target===dlgTF) hide(dlgTF); });
    $('#tfGrid').addEventListener('click', (e)=>{
      const p = e.target.closest('.pill[data-tf]'); if(!p) return;
      $$('#tfGrid .pill').forEach(x=>x.classList.toggle('active', x===p));
      state.tf = p.dataset.tf; renderBars(); hide(dlgTF);
    });

    // legend by indicator click
    $('#led').addEventListener('click', ()=>show(dlgLegend));
    $('#btnCloseLegend').addEventListener('click', ()=>hide(dlgLegend));
    dlgLegend.addEventListener('click', (e)=>{ if(e.target===dlgLegend) hide(dlgLegend); });

    // refresh (демо — только «обновляет время»)
    function doRefresh(){ state.lastUpdate = Date.now(); renderTime(); }
    $('#btnRefresh').addEventListener('click', doRefresh);

    // тик времени
    setInterval(renderTime, 1000);

    // старт
    setTheme('blue');     // по умолчанию — синяя
    state.lastUpdate = Date.now();
    renderBars(); renderTime();

    // ESC закрывает открытые модалки
    document.addEventListener('keydown', e=>{
      if(e.key==='Escape'){ [dlgSettings, dlgTF, dlgLegend].forEach(hide); }
    });
})();
