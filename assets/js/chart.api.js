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
    // RU: добавили scale (по умолчанию 2) и font_scale (по умолчанию 2)
    // EN: add `scale` (default 2) and `font_scale` (default 2)
    async fetchCandlePng({ inst, bar = "1h", size = "P-M", fresh = 0, scale = 2, font_scale = 2 }) {
      const _bar = String(bar).toLowerCase();
  
      // 1) JSON-вариант
      const url1 = `${BASE}render/candle?${qs({ inst, bar: _bar, size, fresh, scale, font_scale })}`;
      try {
        const j = await fetchJson(url1);
        if (j && j.ok && j.url) {
          return { ok: true, url: j.url, via: "json" };
        }
      } catch (_) { /* fallthrough */ }
  
      // 2) fallback: прямая картинка
      const url2 = `${BASE}render/candle.png?${qs({ inst, bar: _bar, size, fresh, scale, font_scale })}`;
      return { ok: true, url: url2, via: "redirect" };
    },

    /** Установить src на <img id="candle-img"> */
    setChartSrc(pngUrl) {
      const img = document.getElementById("candle-img");
      if (!img) return;
      img.src = pngUrl;
      img.alt = "Candlestick chart";
      img.style.display   = "block";
      img.style.width     = "100%";
      img.style.height    = "auto";
      img.style.objectFit = "contain";
      img.style.removeProperty?.("max-height");
    }
  };

  g.ChartAPI = ChartAPI;
})(window);
