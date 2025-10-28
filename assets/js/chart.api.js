// -*- coding: utf-8 -*-
// Файл: assets/js/chart.api.js
// Назначение:
//   • Тонкий клиент для вызова /render/candle и подмены <img id="chart"> в центре.
// Что делает:
//   • fetchCandlePng({inst, bar, size, fresh}) → {ok, url}
//   • setChartSrc(url) — подменяет картинку.
// Примечания:
//   • Адрес API возьмём из window.OKX_API_BASE (задайте в HTML), иначе — относительный "/".
(function(){
  const API_BASE = (typeof window.OKX_API_BASE === "string" ? window.OKX_API_BASE.trim() : "");
  const API_ENABLED = API_BASE.length > 0; // пусто → на стенде API отключаем

  function enabled(){ return API_ENABLED; }

    // Если API выключен (стенд/gh-pages) — не ходим в сеть, возвращаем «нет URL».
  async function fetchCandlePng(params){
    if (!API_ENABLED){
      console.info("[ChartAPI] API disabled: set window.OKX_API_BASE to enable backend");
      return { ok:false, url:null };
    }
  
  async function fetchCandlePng(params){
  // если API_BASE пуст — резолвим относительно ТЕКУЩЕГО URL (чтобы работало под /First/)
  const baseHref = API_BASE ? API_BASE : window.location.href;
  const u = new URL(`${API_BASE}/render/candle`, baseHref);

    u.searchParams.set("inst", params.inst);
    u.searchParams.set("bar",  params.bar || "1h");
    u.searchParams.set("size", params.size || "P-M");
    if (params.fresh) u.searchParams.set("fresh", String(params.fresh));

    const r = await fetch(u.toString(), { method: "GET" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json(); // { ok, url }
  }

  function setChartSrc(url){
    // В центре страницы должен быть <img id="chart"> (см. правку chart.html)
    const img = document.getElementById("chart");
    if (!img) return;
    img.src = url;
    img.alt = "Candlestick chart";
  }

    window.ChartAPI = { enabled, fetchCandlePng, setChartSrc };
})();
