/* global window */
/* Настройки сигналов EMA: таймфреймы + типы сигналов */
(function () {
  "use strict";

  const { tg, safeSendData, notifySavedAndMaybeClose, attachRipple, saveLocal, loadLocal } = window.Core || {};
  const t = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
  const tCommon = (k) => t("common." + k);
  const tEma = (k) => t("ema." + k);

  const STORAGE_KEY = "okx_ema_settings_v1";

  // ----- Модель -----
  const DEFAULT_STATE = {
    tfs: {
      "15m": true,
      "1h": true,
      "4h": true,
      "8h": false,
      "12h": false,
      "1d": true,
    },
    signals: {
      cross: true,         // пересечение быстрая/медленная
      price_cross: true,   // цена пересекает EMA
      slope: true,         // смена наклона EMA
    },
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadState() {
    const saved = loadLocal ? loadLocal(STORAGE_KEY, null) : null;
    if (!saved) return clone(DEFAULT_STATE);
    return {
      tfs: Object.assign({}, DEFAULT_STATE.tfs, saved.tfs || {}),
      signals: Object.assign({}, DEFAULT_STATE.signals, saved.signals || {}),
    };
  }

  let state = loadState();

  // ----- Рендер -----
  const tfRoot = document.getElementById("emaTfList");
  const sigRoot = document.getElementById("emaSignalList");
  const saveBtn = document.getElementById("SaveBtn");

  const TF_ORDER = ["15m", "1h", "4h", "8h", "12h", "1d"];
  const TF_LABELS = {
    "15m": "15m",
    "1h": "1h",
    "4h": "4h",
    "8h": "8h",
    "12h": "12h",
    "1d": "1d",
  };

  const SIGNAL_ORDER = ["cross", "price_cross", "slope"];
  const SIGNAL_LABEL_KEYS = {
    cross: "sig_cross",
    price_cross: "sig_price_cross",
    slope: "sig_slope",
  };

  function render() {
    renderTimeframes();
    renderSignals();
    attachRipple(".switch, .save-btn");
  }

  function makeSwitchRow(labelText, isOn, onToggle) {
    const row = document.createElement("div");
    row.className = "item item--split";

    const top = document.createElement("div");
    top.className = "row-top";

    const nameDiv = document.createElement("div");
    nameDiv.className = "name";
    nameDiv.textContent = labelText;

    const stateDiv = document.createElement("div");
    stateDiv.className = "state";
    stateDiv.textContent = isOn ? tCommon("on") : tCommon("off");

    top.appendChild(nameDiv);
    top.appendChild(stateDiv);

    const bottom = document.createElement("div");
    bottom.className = "row-bottom";

    const sw = document.createElement("button");
    sw.type = "button";
    sw.className = "switch";
    sw.setAttribute("data-on", String(isOn));
    sw.setAttribute("aria-pressed", String(isOn));
    sw.innerHTML = `
      <span class="label">${tCommon("on_short")}</span>
      <span class="label">${tCommon("off_short")}</span>
      <span class="knob"></span>
    `;

    sw.addEventListener("click", function () {
      const next = !isOn;
      isOn = next;
      onToggle(next);
      stateDiv.textContent = next ? tCommon("on") : tCommon("off");
      sw.setAttribute("data-on", String(next));
      sw.setAttribute("aria-pressed", String(next));
      const labels = sw.querySelectorAll(".label");
      if (labels[0]) labels[0].textContent = tCommon("on_short");
      if (labels[1]) labels[1].textContent = tCommon("off_short");
      try { tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged && tg.HapticFeedback.selectionChanged(); } catch (e) {}
    });

    bottom.appendChild(sw);

    row.appendChild(top);
    row.appendChild(bottom);
    return row;
  }

  function renderTimeframes() {
    if (!tfRoot) return;
    tfRoot.innerHTML = "";
    TF_ORDER.forEach(function (id) {
      const label = TF_LABELS[id] || id;
      const row = makeSwitchRow(label, !!state.tfs[id], function (val) {
        state.tfs[id] = val;
        persist();
      });
      tfRoot.appendChild(row);
    });
  }

  function renderSignals() {
    if (!sigRoot) return;
    sigRoot.innerHTML = "";
    SIGNAL_ORDER.forEach(function (id) {
      const key = SIGNAL_LABEL_KEYS[id];
      const label = tEma(key);
      const row = makeSwitchRow(label, !!state.signals[id], function (val) {
        state.signals[id] = val;
        persist();
      });
      sigRoot.appendChild(row);
    });
  }

  function persist() {
    if (saveLocal) saveLocal(STORAGE_KEY, state);
  }

  // ----- Сохранение и отправка в бота -----
  function buildSummary() {
    const onTfs = TF_ORDER.filter((id) => state.tfs[id]);
    const onSignals = SIGNAL_ORDER.filter((id) => state.signals[id]);

    const parts = [];
    parts.push(tEma("saved_prefix"));
    parts.push("");
    parts.push(tEma("summary_timeframes") + " " + (onTfs.length ? onTfs.join(", ") : "—"));
    parts.push(tEma("summary_signals") + " " + (onSignals.length ? onSignals.map((id)=>tEma(SIGNAL_LABEL_KEYS[id])).join(", ") : "—"));
    parts.push("");
    parts.push(tEma("saved_footer"));
    return parts.join("\n");
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      persist();

      const payload = {
        type: "save_ema",
        ema: {
          tfs: state.tfs,
          signals: state.signals,
        },
      };
      const sent = safeSendData ? safeSendData(JSON.stringify(payload)) : false;
      if (!sent) {
        // Уже есть локальное сохранение, так что просто продолжаем
      }

      saveBtn.classList.remove("saved");
      void saveBtn.offsetWidth;
      saveBtn.classList.add("saved");

      try { tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred && tg.HapticFeedback.notificationOccurred("success"); } catch (e) {}

      const message = buildSummary();
      notifySavedAndMaybeClose && notifySavedAndMaybeClose(message, { title: "OKXcandlebot", closeOnMobile: true });
    });
  }

  // Перерисовка при смене языка
  window.addEventListener("i18n:change", function () {
    render();
  });

  document.addEventListener("DOMContentLoaded", function () {
    render();
  });
})();
