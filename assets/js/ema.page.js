/* global window var-www-botcryptosignal-assets-js-ema.page.js*/
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
  const saveBtn = document.getElementById("saveBtn");  // id совпадает с HTML

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
    parts.push(
      tEma("summary_timeframes") +
        " " +
        (onTfs.length ? onTfs.join(", ") : "—")
    );
    parts.push(
      tEma("summary_signals") +
        " " +
        (onSignals.length
          ? onSignals.map((id) => tEma(SIGNAL_LABEL_KEYS[id])).join(", ")
          : "—")
    );
    parts.push("");
    parts.push(tEma("saved_footer"));
    return parts.join("\n");
  }

  // Короткий многострочный текст для всплывающей подсказки:
  // Ваш выбор:
  // ТФ: 15m и 1h
  // Сигналы: пересечения, наклон
  // Настройки сохранены в вашем профиле.
  //
  // BotCryptoSignal
  function buildShortSummaryText() {
    const onTfs = TF_ORDER.filter(function (id) {
      return state.tfs[id];
    });
    const onSignals = SIGNAL_ORDER.filter(function (id) {
      return state.signals[id];
    });

    // Максимум два ТФ (как и на бэкенде)
    let tfText = "—";
    if (onTfs.length === 1) {
      tfText = onTfs[0];
    } else if (onTfs.length >= 2) {
      tfText = onTfs[0] + " и " + onTfs[1];
    }

    // Короткие имена сигналов. Сейчас жёстко по-русски, как ты и просил.
    const signalShortNames = {
      cross: "пересечения",
      price_cross: "пересечение цены",
      slope: "наклон",
    };

    const sigTextParts = onSignals.map(function (id) {
      return signalShortNames[id] || id;
    });
    const sigText = sigTextParts.length ? sigTextParts.join(", ") : "—";

    return (
      "Ваш выбор:\n" +
      "ТФ: " +
      tfText +
      "\n" +
      "Сигналы: " +
      sigText +
      "\n" +
      "Настройки сохранены в вашем профиле.\n\n" +
      "BotCryptoSignal"
    );
  }

  // Небольшой toast-оверлей снизу экрана, сам исчезает через timeoutMs мс
  // и затем вызывает onDone (например, переход на alerts.html).
  function showToast(text, timeoutMs, onDone) {
    const div = document.createElement("div");
    div.className = "ema-toast";
    div.textContent = text;

    Object.assign(div.style, {
      position: "fixed",
      left: "50%",
      bottom: "24px",
      transform: "translateX(-50%)",
      maxWidth: "90%",
      padding: "10px 14px",
      borderRadius: "10px",
      background: "rgba(0, 0, 0, 0.8)",
      color: "#fff",
      fontSize: "14px",
      zIndex: 9999,
      textAlign: "center",
      opacity: "0",
      transition: "opacity 0.3s ease",
      pointerEvents: "none",
      boxSizing: "border-box",
      whiteSpace: "pre-line", // чтобы \n отображались строками
    });

    document.body.appendChild(div);

    // Плавное появление
    requestAnimationFrame(function () {
      div.style.opacity = "1";
    });

    const visibleMs = typeof timeoutMs === "number" ? timeoutMs : 2500;

    setTimeout(function () {
      // Плавное исчезновение
      div.style.opacity = "0";
      setTimeout(function () {
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
        if (typeof onDone === "function") {
          onDone();
        }
      }, 300); // время на fade-out
    }, visibleMs);
  }

  // Переход на основную страницу настроек (alerts.html)
  function openMainAlertsPage() {
    try {
      // 1) Берём URL из data-атрибута <body data-alerts-url="...">
      // 2) Если его нет – fallback на origin + "/alerts.html"
      const base =
        (document.body &&
          document.body.dataset &&
          document.body.dataset.alertsUrl) ||
        window.location.origin + "/alerts.html";

      // Сохраняем query-параметры (?lang=..., v=..., и т.п.)
      const url = base + window.location.search;

      // Не используем tg.openLink — он уводит в системный браузер.
      // Нам нужен переход внутри текущего WebView.
      window.location.replace(url);
    } catch (e) {
      // Если что-то пошло не так – просто остаёмся на странице EMA.
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      // 1) Сохраняем локально, чтобы при провале sendData не потерять состояние
      persist();

      // 2) Готовим состояние строго под ветку save_ema в alerts.py:
      //    { type: "save_ema", ema: { tfs: [...], signals: [...] } }
      const sendState = clone(state);

      // state.tfs / state.signals внутри — dict(bool).
      // Нормализуем в списки включённых значений.
      sendState.tfs = Object.keys(state.tfs).filter(function (tf) {
        return state.tfs[tf];
      });
      sendState.signals = SIGNAL_ORDER.filter(function (id) {
        return state.signals[id];
      });

      // 3) Отправка в бота
      try {
        if (tg && tg.sendData) {
          tg.sendData(
            JSON.stringify({
              type: "save_ema",
              ema: sendState,
            })
          );
        }
      } catch (e) {
        // Игнорируем: локально уже сохранили persist()
      }

      // 4) Короткая подсказка на ~2.5 секунды с выбранными ТФ и сигналами,
      //    после чего мягко уезжаем на основную страницу alerts.html.
      const summaryText = buildShortSummaryText();
      showToast(summaryText, 2500, function () {
        openMainAlertsPage();
      });
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
