// Файл: assets/js/chart.api.js
// Назначение:
//   Обёртка над беком для получения URL PNG и подстановки <img src=...>

(function (g) {
  "use strict";

  const BASE = (typeof window.OKX_API_BASE === "string" && window.OKX_API_BASE.trim() !== "/")
    ? window.OKX_API_BASE
    : "/"; // по умолчанию same-origin

  function qs(obj) {
    const p = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => { if (v !== undefined && v !== null) p.set(k, String(v)); });
    return p.toString();
  }

  async function fetchJson(url) {
    const r = await fetch(url, { credentials: "omit", cache: "no-cache" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  // Публичные методы
  const ChartAPI = {
    enabled() {
      // если BASE пуст/не задан — считаем выключенным
      return typeof BASE === "string" && BASE.length > 0;
    },

    /**
     * Запросить URL PNG. Сначала пытаемся JSON (/render/candle),
     * при ошибке — fallback на прямую картинку (/render/candle.png).
     */
    // RU: добавили scale (по умолчанию 2) и пробрасываем в оба запроса
    // EN: add `scale` (defaults to 2) and pass it to both requests
    async function fetchCandlePng({ inst, bar = "1h", size = "P-M", fresh = 0, scale = 2 }) {
      const params = { inst, bar: String(bar).toLowerCase(), size, fresh, scale };
    
      const url1 = `${BASE}render/candle?${qs(params)}`;
      try {
        const j = await fetchJson(url1);
        if (j && j.ok && j.url) {
          return { ok: true, url: j.url, via: "json" };
        }
      } catch (_) { /* fallthrough */ }
    
      const url2 = `${BASE}render/candle.png?${qs(params)}`;
      return { ok: true, url: url2, via: "redirect" };
    },

        /** Установить src на <img id="candle-img"> */
    setChartSrc(pngUrl) {
      const img = document.getElementById("candle-img");
      if (!img) return;
      img.src = pngUrl;
      img.alt = "Candlestick chart";
    
      // RU: не трогаем высоту, даём работать CSS (width:100%; height:auto)
      // EN: let CSS handle sizing (width:100%; height:auto)
      img.style.display = "block";
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.objectFit = "contain";
    }
  };

  g.ChartAPI = ChartAPI;
})(window);
