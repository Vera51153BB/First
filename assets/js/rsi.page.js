// File: assets/js/rsi.page.js
// Purpose: Settings page for RSI reversal alerts.
// Depends on: assets/js/i18n.js, assets/js/core.js

(function () {
  const Core = window.Core || {};
  const { tg, notifySavedAndMaybeClose, attachRipple, saveLocal, loadLocal, i18n } = Core;
  const t = i18n && i18n.t ? i18n.t : (key) => key;
  const translateHTML = i18n && i18n.translateHTML ? i18n.translateHTML : null;

  const STORAGE_KEY = "okx_rsi_settings_v1";

  const GROUPS = ["cross", "extrema"];
  const TF_ORDER = ["15m", "1h", "4h", "6h", "12h", "1d"];

  // Default parameters per TF (эвристика: базовые рабочие настройки, дальше можно подкрутить)
  const DEFAULTS = {
    cross: {
      "15m": { on: false, strategy: "both", rsi_len: 14, zones: "30/70", cross50: "none" },
      "1h":  { on: true,  strategy: "both", rsi_len: 14, zones: "30/70", cross50: "none" },
      "4h":  { on: true,  strategy: "both", rsi_len: 14, zones: "30/70", cross50: "none" },
      "6h":  { on: false, strategy: "both", rsi_len: 14, zones: "30/70", cross50: "none" },
      "12h": { on: false, strategy: "both", rsi_len: 14, zones: "30/70", cross50: "none" },
      "1d":  { on: false, strategy: "both", rsi_len: 14, zones: "30/70", cross50: "none" },
    },
    extrema: {
      "15m": { on: false, strategy: "both", rsi_len: 14, window: 8, in_delta: 1.0, zones: "30/70", confirm: 1 },
      "1h":  { on: true,  strategy: "both", rsi_len: 14, window: 6, in_delta: 0.8, zones: "30/70", confirm: 1 },
      "4h":  { on: true,  strategy: "both", rsi_len: 14, window: 5, in_delta: 0.7, zones: "30/70", confirm: 1 },
      "6h":  { on: false, strategy: "both", rsi_len: 14, window: 5, in_delta: 0.6, zones: "30/70", confirm: 1 },
      "12h": { on: false, strategy: "both", rsi_len: 14, window: 4, in_delta: 0.5, zones: "30/70", confirm: 1 },
      "1d":  { on: false, strategy: "both", rsi_len: 14, window: 3, in_delta: 0.5, zones: "30/70", confirm: 1 },
    },
  };

  function applyDefaults() {
    GROUPS.forEach(function (group) {
      TF_ORDER.forEach(function (tf) {
        const card = document.querySelector('.tf-card[data-group="' + group + '"][data-tf="' + tf + '"]');
        if (!card) return;
        const def = DEFAULTS[group] && DEFAULTS[group][tf];
        if (!def) return;
        applyToCard(card, def);
      });
    });
  }

  function applyToCard(card, rec) {
    if (!card || !rec) return;

    const sw = card.querySelector(".switch");
    if (sw) {
      const on = !!rec.on;
      sw.setAttribute("data-on", String(on));
      sw.setAttribute("aria-pressed", String(on));
    }

    card.querySelectorAll("select").forEach(function (sel) {
      const key = sel.dataset.key;
      if (!key) return;
      if (!(key in rec)) return;
      sel.value = String(rec[key]);
    });
  }

  function restore(saved) {
    if (!saved || typeof saved !== "object") return;

    GROUPS.forEach(function (group) {
      const g = saved[group];
      if (!g || typeof g !== "object") return;

      Object.keys(g).forEach(function (tf) {
        const card = document.querySelector('.tf-card[data-group="' + group + '"][data-tf="' + tf + '"]');
        if (!card) return;
        applyToCard(card, g[tf]);
      });
    });
  }

  function snapshot() {
    const out = { cross: {}, extrema: {} };

    document.querySelectorAll(".tf-card").forEach(function (card) {
      const group = card.getAttribute("data-group");
      const tf = card.getAttribute("data-tf");
      if (!group || !tf) return;

      const rec = {};
      const sw = card.querySelector(".switch");
      rec.on = !!(sw && sw.getAttribute("data-on") === "true");

      card.querySelectorAll("select").forEach(function (sel) {
        const key = sel.dataset.key;
        if (!key) return;
        let v = sel.value;

        if (key === "rsi_len" || key === "window" || key === "confirm") {
          v = Number(v);
        } else if (key === "in_delta") {
          v = Number(v);
        }

        rec[key] = v;
      });

      if (!out[group]) out[group] = {};
      out[group][tf] = rec;
    });

    return out;
  }

  function updateSwitchLabels() {
    document.querySelectorAll(".switch").forEach(function (sw) {
      const on = sw.getAttribute("data-on") === "true";
      const labels = sw.querySelectorAll(".label");
      if (labels.length !== 2) return;

      labels[0].textContent = t("rsi.on");
      labels[1].textContent = t("rsi.off");

      labels[0].style.opacity = on ? "1" : "0.65";
      labels[1].style.opacity = on ? "0.65" : "1";
    });
  }

  function applyI18nStatic() {
    if (translateHTML) {
      translateHTML();
    }
    updateSwitchLabels();
  }

  document.addEventListener("click", function (e) {
    const sw = e.target.closest(".switch");
    if (!sw) return;

    const on = sw.getAttribute("data-on") === "true";
    sw.setAttribute("data-on", String(!on));
    sw.setAttribute("aria-pressed", String(!on));
    updateSwitchLabels();
  });

  // Время показа всплывающего окна RSI (toast), мс
  const RSI_TOAST_VISIBLE_MS = 11000;

  // Toast для страницы RSI — визуально такой же, как у EMA.
  function showRsiToast(text, timeoutMs, onDone) {
    const div = document.createElement("div");
    div.className = "ema-toast";

    const content = document.createElement("div");
    content.innerHTML = text || "";
    div.appendChild(content);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "✖";
    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "8px",
      right: "10px",
      background: "transparent",
      border: "none",
      color: "#ff5f5f",
      fontSize: "16px",
      cursor: "pointer",
      padding: "0",
    });
    div.appendChild(closeBtn);

    Object.assign(div.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "480px",
      width: "calc(100% - 32px)",
      padding: "16px 20px",
      borderRadius: "24px",
      background: "#181722",
      color: "#ffffff",
      fontSize: "14px",
      lineHeight: "1.4",
      zIndex: 9999,
      textAlign: "center",
      opacity: "0",
      transition: "opacity 0.3s ease",
      pointerEvents: "auto",
      boxSizing: "border-box",
      whiteSpace: "pre-line",     // \n → перенос строки
    });

    document.body.appendChild(div);

    // плавное появление
    requestAnimationFrame(function () {
      div.style.opacity = "1";
    });

    const visibleMs =
      typeof timeoutMs === "number" ? timeoutMs : RSI_TOAST_VISIBLE_MS;

    let closed = false;
    let hideTimer = null;

    function closeToast(needOnDone) {
      if (closed) return;
      closed = true;

      if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }

      div.style.opacity = "0";
      setTimeout(function () {
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
        if (needOnDone && typeof onDone === "function") {
          onDone();
        }
      }, 300); // время fade-out
    }

    // клик по крестику → закрыть и уйти на alerts.html
    closeBtn.addEventListener("click", function (evt) {
      evt.stopPropagation();
      closeToast(true);
    });

    // авто-закрытие по таймауту
    hideTimer = setTimeout(function () {
      closeToast(true);
    }, visibleMs);
  }

  // Переход на основную страницу управления уведомлениями (alerts.html)
  function openMainAlertsPage() {
    try {
      // 1) если есть <body data-alerts-url="..."> — берём оттуда
      // 2) иначе origin + "/alerts.html"
      const base =
        (document.body &&
          document.body.dataset &&
          document.body.dataset.alertsUrl) ||
        window.location.origin + "/alerts.html";

      // сохраняем query (?lang=... и т.п.) и добавляем якорь на кнопку "Применить настройки"
      const url = base + window.location.search + "#saveBtn";

      // заменяем текущую страницу внутри WebView
      window.location.replace(url);
    } catch (e) {
      // в случае ошибки остаёмся на RSI-странице
    }
  }

  // Короткая сводка по текущим настройкам RSI (на русском для тоста)
  function buildRsiSummaryText(state) {
    const lines = [];

    lines.push("Для применения настроек нажмите кнопку");
    lines.push("♦ Применить настройки ♦");
    lines.push("в меню: Управление уведомлениями");
    lines.push("");
    lines.push("Новые настройки RSI:");

    const tfOrder = TF_ORDER.slice();
    const groupTitles = {
      cross: "Пересечение зон (cross)",
      extrema: "Экстремумы (extrema)",
    };

    ["cross", "extrema"].forEach(function (group) {
      const g = state[group];
      if (!g || typeof g !== "object") return;

      const enabledTfs = tfOrder.filter(function (tf) {
        return g[tf] && g[tf].on;
      });

      if (!enabledTfs.length) {
        lines.push("");
        lines.push(groupTitles[group] + ": выключено");
        return;
      }

      lines.push("");
      lines.push(groupTitles[group] + ":");

      enabledTfs.forEach(function (tf) {
        const rec = g[tf];
        if (!rec) return;

        if (group === "cross") {
          lines.push(
            " • " +
              tf +
              ": период " +
              (rec.rsi_len ?? "-") +
              ", зоны " +
              (rec.zones ?? "-") +
              ", пересечение 50: " +
              (rec.cross50 ?? "нет")
          );
        } else {
          lines.push(
            " • " +
              tf +
              ": период " +
              (rec.rsi_len ?? "-") +
              ", окно " +
              (rec.window ?? "-") +
              ", дельта " +
              (rec.in_delta ?? "-") +
              ", зоны " +
              (rec.zones ?? "-") +
              ", подтверждение " +
              (rec.confirm ?? "-")
          );
        }
      });
    });

    lines.push("");
    lines.push("BotCryptoSignal");

    return lines.join("\n");
  }

  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      const state = snapshot();
      if (saveLocal) {
        saveLocal(STORAGE_KEY, state);
      }

      const summaryText = buildRsiSummaryText(state);
      showRsiToast(summaryText, RSI_TOAST_VISIBLE_MS, function () {
        openMainAlertsPage();
      });
    });
  }

  // Init
  
  const saved = loadLocal ? loadLocal(STORAGE_KEY, null) : null;
  if (saved) {
    restore(saved);
  } else {
    applyDefaults();
  }

  if (attachRipple) {
    attachRipple(".switch, .save-btn");
  }

  applyI18nStatic();
  window.addEventListener("i18n:change", applyI18nStatic);
})();

