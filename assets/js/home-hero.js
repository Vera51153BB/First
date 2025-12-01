//    var/www/botcryptosignal/assets/js/home-hero.js
// Скрипт для героя на главной: локализация + переключатель языков
(function () {
  const LANGS = ["en", "hi", "ru", "es", "fr", "de", "it"];

  function applyHeroTexts() {
    if (!window.I18N) return;

    const taglineEl = document.querySelector(".hero_home_tagline");
    const ctaEl = document.querySelector(".hero_home_cta");

    if (taglineEl) {
      const l1 = I18N.t("landing.hero.line1");
      const l2 = I18N.t("landing.hero.line2");
      const l3 = I18N.t("landing.hero.line3");
      const l4 = I18N.t("landing.hero.line4");

      taglineEl.innerHTML = [
        l1,
        l2,
        l3,
        l4
      ]
        .filter(Boolean)
        .map(function (line) {
          return '<span class="hero_home_tagline-line">' + line + "</span>";
        })
        .join("<br />");
    }

    if (ctaEl) {
      const cta = I18N.t("landing.hero.cta");
      if (cta) ctaEl.textContent = cta;
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

    LANGS.forEach(function (code) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero_lang_btn";
      btn.dataset.lang = code;
      btn.textContent = code.toUpperCase();

      if (code === current) {
        btn.classList.add("hero_lang_btn--active");
      }

      btn.addEventListener("click", function () {
        if (I18N.lang === code) return;
        I18N.setLang(code);
      });

      bar.appendChild(btn);
    });

    // Начальное применение текстов с учётом auto-detect в i18n.js
    applyHeroTexts();
    updateLangButtons(I18N.lang);

    // Реакция на смену языка из любого места (если пригодится)
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
