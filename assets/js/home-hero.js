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
  const LANG_WAVE_PULSE_MS = 120;      // длительность "пульса"
  const LANG_WAVE_INTER_CYCLE_DELAY_MS = 2000; // пауза между циклами

  // -----------------------------
  //  УТИЛИТЫ
  // -----------------------------

  function $(sel) {
    return document.querySelector(sel);
  }

  function $all(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  function isMobileViewport() {
    // Простая проверка ширины вьюпорта; при желании позже можно заменить.
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(max-width: 768px)").matches
    );
  }

  
  // -----------------------------
  //  ТЕКСТЫ ГЕРОЯ ЧЕРЕЗ I18N
  // -----------------------------

  function applyHeroTexts() {
    if (!window.I18N) return;

    const taglineEls = $all(".hero_home_tagline");
    const ctaEls = $all(".hero_home_cta");

    // Новый короткий лозунг для <h2> под заголовком
    const h2El = document.getElementById("hero_home_tagline_h2");
    if (h2El) {
      const s = I18N.t("landing.slogan");
      if (s && s.indexOf("landing.slogan") !== 0) {
        h2El.textContent = s;
      }
    }

    if (taglineEls.length) {
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

      const html = lines
        .map(function (line) {
          return '<span class="hero_home_tagline-line">' + line + "</span>";
        })
        .join("<br />");

      taglineEls.forEach(function (el) {
        el.innerHTML = html;
      });
    }

    if (ctaEls.length) {
      const cta = I18N.t("landing.hero.cta");
      if (cta && cta.indexOf("landing.hero.") !== 0) {
        ctaEls.forEach(function (el) {
          el.textContent = cta;
        });
      }
    }
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

    // Делим языки на две группы "через один":
    //   цикл 0 → индексы 0,2,4,... (EN, RU, ES, ...)
    //   цикл 1 → индексы 1,3,5,... (HI, PT, UA, ...)
    const halfCount = Math.ceil(buttons.length / 2);          // половина списка
    const totalSteps = halfCount * LANG_WAVE_CYCLES;          // 2 волны × половина
    let stepIndex = 0;

    // Локальный "пульс" для одной кнопки
    function pulse(btn) {
      if (!btn) return;
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

      // Номер волны (0-я, 1-я, …)
      const cycleIndex = Math.floor(stepIndex / halfCount);
      // Порядок внутри волны (0..halfCount-1)
      const localIndex = stepIndex % halfCount;

      // Для чётного цикла берём 0,2,4,…; для нечётного — 1,3,5,…
      let btnIndex = localIndex * 2 + (cycleIndex % 2);

      // Защита на случай нечётного количества языков
      if (btnIndex >= buttons.length) {
        btnIndex = buttons.length - 1;
      }

      const btn = buttons[btnIndex];
      pulse(btn);
      stepIndex += 1;

      let delay = LANG_WAVE_STEP_MS;
      // Пауза между первой и второй волной (после каждой половины списка)
      if (stepIndex % halfCount === 0) {
        delay += LANG_WAVE_INTER_CYCLE_DELAY_MS;
      }
      setTimeout(step, delay);
    }

    // Небольшая задержка перед стартом волны
    setTimeout(step, 6000);
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

    // --- Мобильное модальное окно выбора языка ---
    // Предположение: в index.template.html уже есть:
    //   • кнопка / ссылка с id="r_lang-toggle"
    //   • модалка с id="r_lang-modal"
    //   • внутри неё overlay с классом "r_lang-overlay"
    //   • кнопка закрытия с id="r_lang-close"
    var langToggle = document.getElementById("r_lang-toggle");
    var langModal = document.getElementById("r_lang-modal");
    var langCloseBtn =
      langModal && langModal.querySelector("#r_lang-close");
    var langOverlay =
      langModal && langModal.querySelector(".r_lang-overlay");

    function openLangModal() {
      if (!langModal) return;
      langModal.classList.add("r_lang-modal--open");
      langModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("r_lang-modal-open");
    }

    function closeLangModal(withDefaultIfUnset) {
      if (!langModal) return;
      langModal.classList.remove("r_lang-modal--open");
      langModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("r_lang-modal-open");

      if (withDefaultIfUnset) {
        // ФАКТ: i18n.js уже использует localStorage ключ "okx_lang"
        var hasSavedLang = false;
        try {
          hasSavedLang = !!window.localStorage.getItem("okx_lang");
        } catch (e) {
          hasSavedLang = false; // в приватном режиме localStorage может быть недоступен
        }

        // Если языка ещё нет в "логах" — ставим EN по умолчанию
        if (
          !hasSavedLang &&
          window.I18N &&
          typeof I18N.setLang === "function"
        ) {
          I18N.setLang("en");
        }
      }
    }

    // Открытие модалки по клику на "Language"
    if (langToggle && langModal) {
      langToggle.addEventListener("click", function () {
        openLangModal();
      });
    }

    // Закрытие крестиком
    if (langCloseBtn) {
      langCloseBtn.addEventListener("click", function () {
        closeLangModal(true); // true => если язык не выбран, примем EN
      });
    }

    // Закрытие кликом по затемнению
    if (langOverlay) {
      langOverlay.addEventListener("click", function (ev) {
        if (ev.target === langOverlay) {
          closeLangModal(true);
        }
      });
    }

    // Закрытие по Esc
    window.addEventListener("keydown", function (ev) {
      if (
        ev.key === "Escape" &&
        langModal &&
        langModal.classList.contains("r_lang-modal--open")
      ) {
        closeLangModal(true);
      }
    });

    // --- Авто-показ модалки на первом визите в мобильной вёрстке ---
    (function () {
      var hasSavedLang = false;
      try {
        hasSavedLang = !!window.localStorage.getItem("okx_lang");
      } catch (e) {
        hasSavedLang = false;
      }

      // Предположение: "первый визит" = нет okx_lang в localStorage
      if (!hasSavedLang && isMobileViewport() && langModal) {
        openLangModal();
      }
    })();

    // Реакция на смену языка из любого места (включая другие части сайта)
    window.addEventListener("i18n:change", function (ev) {
      const lang = ev.detail && ev.detail.lang;
      applyHeroTexts();
      if (lang) updateLangButtons(lang);
    });

    // Запускаем одноразовую волну по интро-ряду (актуально для десктопа)
    runLangWaveOnce();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroI18N);
  } else {
    initHeroI18N();
  }
  // -----------------------------
  // --- Анимация "червячка" после появления ночной сцены ---
  // -----------------------------
  function startBorderWormDelayed() {
    const scene = document.querySelector(".scene_home_container");
    if (!scene) return;
    // ждём, пока включится ночной режим
    const observer = new MutationObserver((mutations) => {
      if (scene.classList.contains("scene_home_container--night")) {
        setTimeout(() => {
          document.body.classList.add("r-border-start");
        }, 4200); // задержка появления после подложки (4.2 сек)
        observer.disconnect();
      }
    });
    observer.observe(scene, { attributes: true, attributeFilter: ["class"] });
  }

  // Запуск при загрузке
  if (document.readyState === "complete" || document.readyState === "interactive") {
    startBorderWormDelayed();
  } else {
    window.addEventListener("DOMContentLoaded", startBorderWormDelayed);
  }

  // Можно регулировать скорость вращения без правки CSS
  document.documentElement.style.setProperty("--r-worm-speed", "9s");
  
})();
