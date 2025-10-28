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
  const API_BASE = window.OKX_API_BASE || "";

  async function fetchCandlePng(params){
    const u = new URL(API_BASE + "/render/candle", location.origin);
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

  window.ChartAPI = { fetchCandlePng, setChartSrc };
})();
