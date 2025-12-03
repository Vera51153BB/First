//    var/www/botcryptosignal/assets/js/home-hero.js
// Скрипт для героя на главной: локализация + переключатель языков
(function () {
  // Порядок и отображаемые подписи
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

  function applyHeroTexts() {
    if (!window.I18N) return;

    const taglineEl = document.querySelector(".hero_home_tagline");
    const ctaEl = document.querySelector(".hero_home_cta");

    // собираем до шести строк, пропуская отсутствующие (когда t() вернул ключ)
    if (taglineEl) {
      const keys = ["line1", "line2", "line3", "line4", "line5", "line6"];
      const lines = keys
        .map(function (k) {
          const fullKey = "landing.hero." + k;
          const val = I18N.t(fullKey);
          if (!val || val.indexOf("landing.hero.") === 0) {
            return null;
          }
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
    document
      .querySelectorAll(".hero_lang_btn")
      .forEach(function (btn) {
        btn.classList.toggle(
          "hero_lang_btn--active",
          btn.dataset.lang === active
        );
      });
  }

  function initHeroI18N() {
    if (!window.I18N) return;

    const bar = document.querySelector(".hero_lang_switcher");
    if (!bar) {
      applyHeroTexts();
      return;
    }

    bar.innerHTML = "";
    const current = I18N.lang || "en";

    LANGS.forEach(function (item) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero_lang_btn";
      btn.dataset.lang = item.code;
      btn.textContent = item.label;

      if (item.code === current) {
        btn.classList.add("hero_lang_btn--active");
      }

      btn.addEventListener("click", function () {
        if (I18N.lang === item.code) return;
        I18N.setLang(item.code);
      });

      bar.appendChild(btn);
    });

    // Начальное применение текстов
    applyHeroTexts();
    updateLangButtons(I18N.lang);

    // Реакция на смену языка из любого места
    window.addEventListener("i18n:change", function (ev) {
      const lang = ev.detail && ev.detail.lang;
      applyHeroTexts();
      if (lang) updateLangButtons(lang);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroI18N);
  } else {
    initHeroI18N();
  }
})();
