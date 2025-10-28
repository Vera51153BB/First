// -*- coding: utf-8 -*-
// Файл: assets/js/chart.api.js
// Назначение:
//   • Тонкий клиент для вызова /render/candle и подмены <img id="chart"> в центре.
// Что делает:
//   • fetchCandlePng({inst, bar, size, fresh}) → {ok, url}
//   • setChartSrc(url) — подменяет картинку.
//   • enabled() — можно ли дергать API (OKX_API_BASE задан).
// Примечания:
//   • Адрес API берём из window.OKX_API_BASE (укажите в HTML). Если пусто — API не дергаем.
;(function(){
  const API_BASE = (window.OKX_API_BASE || "").trim();

  function enabled(){
    // Если базовый адрес API пуст — работаем в «демо-режиме» без сетевых запросов
    return API_BASE.length > 0;
  }

  async function fetchCandlePng(params){
    // Защита: не дергать API, если он не настроен (GitHub Pages → 404)
    if (!enabled()) {
      return { ok: false, url: "" };
    }

    const u = new URL(API_BASE.replace(/\/+$/,'') + "/render/candle", API_BASE.startsWith("http") ? undefined : location.origin);
    u.searchParams.set("inst", params.inst);
    u.searchParams.set("bar",  params.bar  || "1h");
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

  // Экспортируем минимальный API в глобал с безопасной проверкой
  window.ChartAPI = { enabled, fetchCandlePng, setChartSrc };
})(); // IIFE корректно закрыт
