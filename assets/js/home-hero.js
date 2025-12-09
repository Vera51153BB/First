//    /var/www/botcryptosignal/assets/js/home-hero.js
// Простой герой без сцен и языковых волн:
//   • заполняет слоган (landing.slogan),
//   • заполняет девиз (landing.hero.line1..line6),
//   • заполняет текст кнопки (landing.hero.cta),
//   • реагирует на смену языка через событие i18n:change.

(function () {
  "use strict";

  function $(sel) {
    return document.querySelector(sel);
  }

  // Собираем тексты героя из I18N
  function applyHeroTexts() {
    if (!window.I18N) return;

    var sloganEl = $("#hero_slogan");
    var taglineEl = $("#hero_tagline");
    var ctaEl = $("#hero_cta");

    // Слоган под BOTCRYPTOSIGNAL
    if (sloganEl) {
      var sloganKey = "landing.slogan";
      var slogan = I18N.t(sloganKey);
      if (slogan && slogan.indexOf(sloganKey) !== 0) {
        sloganEl.textContent = slogan;
      }
    }

    // Девиз (до 6 строк) — landing.hero.line1..line6
    if (taglineEl) {
      var keys = ["line1", "line2", "line3", "line4", "line5", "line6"];
      var lines = keys
        .map(function (k) {
          var fullKey = "landing.hero." + k;
          var val = I18N.t(fullKey);
          // Если вернулся сам ключ — пропускаем
          if (!val || val.indexOf("landing.hero.") === 0) return null;
          return val;
        })
        .filter(Boolean);

      taglineEl.innerHTML = lines
        .map(function (line) {
          return '<span class="hero_tagline_line">' + line + "</span>";
        })
        .join("<br />");
    }

    // Текст кнопки
    if (ctaEl) {
      var ctaKey = "landing.hero.cta";
      var cta = I18N.t(ctaKey);
      if (cta && cta.indexOf("landing.hero.") !== 0) {
        ctaEl.textContent = cta;
      }
    }
  }

  function initHero() {
    applyHeroTexts();

    // Обновляем тексты при смене языка в I18N
    window.addEventListener("i18n:change", function () {
      applyHeroTexts();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHero);
  } else {
    initHero();
  }
})();
