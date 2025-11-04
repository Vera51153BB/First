// Файл: assets/js/chart.api.js
// Назначение:
//   Обёртка над беком для получения URL PNG и подстановки <img src=...>

(function (g) {
  "use strict";

  const BASE = (typeof window.OKX_API_BASE === "string" && window.OKX_API_BASE.trim() !== "/")
    ? window.OKX_API_BASE
    : "/"; // по умолчанию same-origin
  const __chartRoot = document.getElementById('chartRoot') || null;

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
     * Container-aware запрос URL PNG.
     * Никаких size/scale — только фактические размеры контейнера + DPR.
     */
    async fetchCandlePng({ inst, bar = "1h", cw, ch, dpr, round = 64, fresh = 0, font_scale = 2 }) {
      const _bar  = String(bar).toLowerCase();
      const _cw   = Math.max(0, Math.round(+cw || 0));
      const _ch   = Math.max(0, Math.round(+ch || 0));
      const _dpr  = Math.max(1, Math.min(3, +dpr || (window.devicePixelRatio || 1)));
      const _rnd  = Math.max(1, Math.round(+round || 64));
      const query = { inst, bar: _bar, cw: _cw, ch: _ch, dpr: _dpr, round: _rnd, fresh, font_scale };

      // 1) JSON-вариант
      const url1 = `${BASE}render/candle?${qs(query)}`;
      try {
        const j = await fetchJson(url1);
        if (j && j.ok && j.url) {
          return { ok: true, url: j.url, via: "json" };
        }
      } catch (_) { /* fallthrough */ }

      // 2) fallback: прямая картинка
      const url2 = `${BASE}render/candle.png?${qs(query)}`;
      return { ok: true, url: url2, via: "redirect" };
    },

    /** Установить src на <img id="candle-img"> */
    // REPLACE: function setChartSrc(...) { ... }
    setChartSrc(pngUrl) {
      const img = document.getElementById("candle-img");
      if (!img) return;
      img.src = pngUrl;
      img.alt = "Candlestick chart";
    
      // ВАЖНО: картинка всегда во всю высоту центра, ширина — авто (чтобы не срезались цены)
      img.style.display   = "block";
      img.style.height    = "100%";
      img.style.width     = "auto";
      img.style.objectFit = "contain";
      img.style.removeProperty?.("max-height");
    }
  };

  g.ChartAPI = ChartAPI;
})(window);
