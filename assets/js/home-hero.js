//    var/www/botcryptosignal/assets/js/home-hero.js
// Скрипт для героя на главной:
//   • локализация через window.I18N (landing.hero.*),
//   • два ряда языков (интро + компактный),
//   • волна по языкам на первом экране,
//   • переключение стадий A → B и кроссфейд фоновой сцены.
(function () {
  "use strict";

  // -----------------------------
  //  НАСТРОЙКИ
  // -----------------------------

  // Порядок и подписи языков
  const LANGS = [
    { code: "en", label: "EN" },
    { code: "hi", label: "HI" },
    { code: "ru", label: "RU" },
    { code: "pt", label: "PT" },
    { code: "es", label: "ES" },
    { code: "uk", label: "UA" },
    { code: "de", label: "DE" },
    { code: "fr", label: "FR" },
    { code: "it", label: "IT" },
    { code: "ja", label: "JA" },
    { code: "tr", label: "TR" },
    { code: "zh", label: "CN" },
  ];

  // Класс, который включает ночной фон
  const SCENE_NIGHT_CLASS = "scene_home_container--night";

  // Параметры волны
  const LANG_WAVE_CYCLES = 2;          // сколько полных проходов
  const LANG_WAVE_STEP_MS = 520;       // шаг между соседними кнопками
  const LANG_WAVE_PULSE_MS = 180;      // длительность "пульса"
  const LANG_WAVE_INTER_CYCLE_DELAY_MS = 420; // пауза между циклами

  // -----------------------------
  //  УТИЛИТЫ
  // -----------------------------

  function $(sel) {
    return document.querySelector(sel);
  }

  function $all(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  // -----------------------------
  //  ТЕКСТЫ ГЕРОЯ ЧЕРЕЗ I18N
  // -----------------------------

  function applyHeroTexts() {
    if (!window.I18N) return;

    const taglineEl = $(".hero_home_tagline");
    const ctaEl = $(".hero_home_cta");

    if (taglineEl) {
      const keys = ["line1", "line2", "line3", "line4", "line5", "line6"];
      const lines = keys
        .map(function (k) {
          const fullKey = "landing.hero." + k;
          const val = I18N.t(fullKey);
          // если вернулся сам ключ — пропускаем
          if (!val || val.indexOf("landing.hero.") === 0) return null;
          return val;
        })
        .filter(Boolean);

      taglineEl.innerHTML = lines
        .map(function (line) {
          return '<span class="hero_home_tagline-line">' + line + "</span>";
        })
        .join("<br />");
    }

    if (ctaEl) {
      const cta = I18N.t("landing.hero.cta");
      if (cta && cta.indexOf("landing.hero.") !== 0) {
        ctaEl.textContent = cta;
      }
    }
  }

  function updateLangButtons(active) {
    $all(".hero_lang_btn").forEach(function (btn) {
      btn.classList.toggle(
        "hero_lang_btn--active",
        btn.dataset.lang === active
      );
    });
  }

  // -----------------------------
  //  ПЕРЕКЛЮЧЕНИЕ СТАДИИ A → B
  // -----------------------------

  function switchToStageB(hero, sceneContainer) {
    if (!hero) return;
    if (hero.classList.contains("hero_home--stageB")) return;

    hero.classList.remove("hero_home--stageA");
    hero.classList.add("hero_home--stageB");

    // включаем ночной фон (CSS-кроссфейд по SCENE_NIGHT_CLASS)
    if (sceneContainer) {
      sceneContainer.classList.add(SCENE_NIGHT_CLASS);
    }
  
    // На ночной сцене языковые ряды скрыты полностью
    const introRow = $(".hero_lang_row--intro");
    if (introRow) {
      introRow.setAttribute("aria-hidden", "true");
    }
    const compactRow = $(".hero_lang_row--compact");
    if (compactRow) {
      compactRow.setAttribute("aria-hidden", "true");
    }

    // лёгкий "вдох" заголовка
    const title = $(".hero_home_title");
    if (title) {
      title.classList.add("hero_home_title--breathe");
      setTimeout(function () {
        title.classList.remove("hero_home_title--breathe");
      }, 600);
    }
  }

  // -----------------------------
  //  ВОЛНА ПО ЯЗЫКАМ (ИНТРО)
  // -----------------------------

  function runLangWaveOnce() {
    const introRow = $(".hero_lang_row--intro");
    if (!introRow) return;

    const buttons = introRow.querySelectorAll(".hero_lang_btn");
    if (!buttons.length) return;

    const hint = introRow.querySelector(".hero_lang_hint");
    const totalSteps = buttons.length * LANG_WAVE_CYCLES;

    let stepIndex = 0;

    function pulse(btn) {
      btn.classList.add("hero_lang_btn--pulse");
      setTimeout(function () {
        btn.classList.remove("hero_lang_btn--pulse");
      }, LANG_WAVE_PULSE_MS);
    }

    function step() {
      if (stepIndex >= totalSteps) {
        // волна завершена — показываем "?"
        if (hint) hint.classList.remove("hero_lang_hint--hidden");
        return;
      }

      const btn = buttons[stepIndex % buttons.length];
      pulse(btn);
      stepIndex += 1;

      let delay = LANG_WAVE_STEP_MS;
      if (stepIndex % buttons.length === 0) {
        // пауза между циклами
        delay += LANG_WAVE_INTER_CYCLE_DELAY_MS;
      }
      setTimeout(step, delay);
    }

    // небольшая задержка перед стартом волны
    setTimeout(step, 4800);
  }

  // -----------------------------
  //  ИНИЦИАЛИЗАЦИЯ
  // -----------------------------

  function initHeroI18N() {
    if (!window.I18N) return;

    const hero = $(".hero_home");
    const sceneContainer = $(".scene_home_container");
    if (!hero || !sceneContainer) {
      // даже если героя нет, тексты всё равно применим (на всякий случай)
      applyHeroTexts();
      return;
    }

    // Стадия A по умолчанию: интро-ряд виден, компактный скрыт
    hero.classList.add("hero_home--stageA");
    const compactRow = $(".hero_lang_row--compact");
    if (compactRow) compactRow.setAttribute("aria-hidden", "true");

    const current = I18N.lang || "en";

    // Строим кнопки в обоих switcher'ах (интро + компактный)
    $all(".hero_lang_switcher").forEach(function (bar) {
      bar.innerHTML = "";

      LANGS.forEach(function (item) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hero_lang_btn";
        btn.dataset.lang = item.code;
        btn.innerHTML =
          '<span class="hero_lang_btn-label">' + item.label + "</span>";

        if (item.code === current) {
          btn.classList.add("hero_lang_btn--active");
        }

        btn.addEventListener("click", function () {
          const lang = item.code;
          if (I18N.lang !== lang) {
            I18N.setLang(lang); // обновим глобальный язык
          }
          // первый же клик переводит сцену в стадию B
          switchToStageB(hero, sceneContainer);
        });

        bar.appendChild(btn);
      });
    });

    // начальное применение текстов
    applyHeroTexts();
    updateLangButtons(I18N.lang);

    // Реакция на смену языка из любого места (включая другие части сайта)
    window.addEventListener("i18n:change", function (ev) {
      const lang = ev.detail && ev.detail.lang;
      applyHeroTexts();
      if (lang) updateLangButtons(lang);
    });

    // Запускаем одноразовую волну по интро-ряду
    runLangWaveOnce();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroI18N);
  } else {
    initHeroI18N();
  }
})();
