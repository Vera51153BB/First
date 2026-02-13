/* global window var-www-botcryptosignal-assets-js-ema.page.js*/
/* Настройки сигналов EMA: таймфреймы + типы сигналов */
(function () {
  "use strict";

  const { tg, safeSendData, attachRipple, saveLocal, loadLocal } = window.Core || {};
  const t = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
  const tCommon = (k) => t("common." + k);
  const tEma = (k) => t("ema." + k);

  const STORAGE_KEY = "okx_ema_settings_v1";

  // ----- Модель -----
  const DEFAULT_STATE = {
    tfs: {
      "15m": false,
      "1h": true,
      "4h": true,
      "6h": false,
      "12h": false,
      "1d": false,
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

  const TF_ORDER = ["15m", "1h", "4h", "6h", "12h", "1d"];
  const TF_LABELS = {
    "15m": "15m",
    "1h": "1h",
    "4h": "4h",
    "6h": "6h",
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

  // Приводим state к формату, который ожидает бэкенд (dict с tfs и signals)
  function normalizeEmaStateForPayload(st) {
    return {
      tfs: Object.assign({}, (st && st.tfs) || {}),
      signals: Object.assign({}, (st && st.signals) || {}),
    };
  }

  // ----- Сохранение и отправка в бота -----
  // Текст всплывающей подсказки при сохранении EMA-настроек.
  // Использует i18n-ключи:
  //   ema.toast_prefix
  //   ema.toast_tfs_label
  //   ema.toast_signals_label
  //   ema.toast_saved
  function buildShortSummaryText() {
    const onTfs = TF_ORDER.filter((id) => !!state.tfs[id]);
    const onSignals = SIGNAL_ORDER.filter((id) => !!state.signals[id]);

    const tfsText = onTfs.length ? onTfs.join(", ") : "—";

    const signalNames = onSignals.map((id) => {
      const key = SIGNAL_LABEL_KEYS[id];
      return tEma(key);
    });
    const signalsText = signalNames.length ? signalNames.join(", ") : "—";

    const parts = [];
    parts.push(tEma("toast_prefix"));                            // "Ваш выбор:"
    parts.push(tEma("toast_tfs_label") + " " + tfsText);         // "ТФ: 15m и 1h"
    parts.push(tEma("toast_signals_label") + " " + signalsText); // "Сигналы: пересечения, наклон"
    parts.push("");                                              // пустая строка
    parts.push(tEma("toast_saved"));                             // "Настройки сохранены на вашем аккаунте."
    parts.push("");                                              // ещё одна пустая строка
    parts.push("BotCryptoSignal");
    return parts.join("\n");
  }

  // Небольшой toast-оверлей снизу экрана, сам исчезает через timeoutMs мс
  // и затем вызывает onDone (например, переход на alerts.html).
  // Имя функции отличаем от Core.showToast, чтобы не было конфликта.
  function showEmaToast(text, timeoutMs, onDone) {
    const div = document.createElement("div");
    div.className = "ema-toast";
    div.textContent = text;

    Object.assign(div.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "90%",
      padding: "10px 14px",
      borderRadius: "10px",
      background: "#ff5f5f",
      color: "#050029",
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
      // 0) Валидация: максимум 2 таймфрейма и 2 типа сигналов.
      const onTfs = TF_ORDER.filter(function (id) { return !!state.tfs[id]; });
      const onSignals = SIGNAL_ORDER.filter(function (id) { return !!state.signals[id]; });

      let errorText = "";

      if (onTfs.length > 2 && onSignals.length > 2) {
        // Обе группы превышают лимит
        errorText = tEma("validation_both_too_many");
      } else if (onTfs.length > 2) {
        // Превышен лимит по таймфреймам
        const tpl = tEma("validation_tfs_too_many");
        // Подставляем количество выбранных ТФ вместо {count}
        errorText = tpl.replace("{count}", String(onTfs.length));
      } else if (onSignals.length > 2) {
        // Превышен лимит по видам сигналов
        errorText = tEma("validation_signals_too_many");
      }

      if (errorText) {
        // Если есть ошибка — показываем тост и НЕ сохраняем / НЕ уходим со страницы.
        showEmaToast(errorText, 2600);
        return;
      }

      // 1) Всегда сразу сохраняем состояние локально,
      //    чтобы его можно было восстановить даже при сбое сети.
      persist();

      // 2) Собираем текст подсказки (локализованный).
      const summaryText = buildShortSummaryText();

      // 3) Показываем toast и после небольшой паузы
      //    возвращаем пользователя на главную страницу настроек alerts.html.
      //    Никаких запросов в бота отсюда НЕ шлём.
      showEmaToast(summaryText, 2600, function () {
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
