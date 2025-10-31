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
    async fetchCandlePng({ inst, bar = "1h", size = "P-M", fresh = 0 }) {
      // 1) JSON-вариант
      const url1 = `${BASE}render/candle?${qs({ inst, bar: String(bar).toLowerCase(), size, fresh })}`;
      try {
        const j = await fetchJson(url1);
        if (j && j.ok && j.url) {
          return { ok: true, url: j.url, via: "json" };
        }
      } catch (_) { /* fallthrough */ }

      // 2) fallback: прямая картинка с редиректом
      const url2 = `${BASE}render/candle.png?${qs({ inst, bar: String(bar).toLowerCase(), size, fresh })}`;
      return { ok: true, url: url2, via: "redirect" };
    },

    /** Установить src на <img id="candle-img"> */
    setChartSrc(pngUrl) {
      const img = document.getElementById("candle-img");
      if (!img) return;
      img.src = pngUrl;
      img.alt = "Candlestick chart";
      // гарантируем корректную вписываемость
      img.style.display = "block";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
    }
  };

  g.ChartAPI = ChartAPI;
})(window);
