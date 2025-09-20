// ===== I18N (очень лёгкий словарик + события смены языка) =====
(function () {
  const DICTS = {
    en: {
      common: {
        help: "Help",
        on: "ON",
        off: "OFF",
        on_short: "ON",
        off_short: "OFF",
        enabled: "enabled",
        all: "all",
      },
      alerts: {
        title: "NOTIFICATION SETTINGS",
        all_status: { on: "on", off: "off", partial: "partial" },
        items: {
          balance: "Balance monitor",
          rsi: "RSI index",
          item3: "Alert 3",
          item4: "Alert 4",
        },
        save: "Save settings",
        saved_title: "OKXcandlebot",
        saved_prefix: "New notification settings:",
        saved_footer: "Settings are saved on this device.",
        summary_all_on: "All notifications: ENABLED",
        summary_all_off: "All notifications: DISABLED",
      }
    },
    ru: {
      common: {
        help: "Помощь",
        on: "ВКЛ",
        off: "ВЫК",
        on_short: "ВКЛ",
        off_short: "ВЫК",
        enabled: "включено",
        all: "все",
      },
      alerts: {
        title: "УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ",
        all_status: { on: "включено", off: "выключено", partial: "частично" },
        items: {
          balance: "Баланс монет",
          rsi: "Индекс RSI",
          item3: "уведомление 3",
          item4: "уведомление 4",
        },
        save: "Сохранить настройки",
        saved_title: "OKXcandlebot",
        saved_prefix: "Новые настройки уведомлений:",
        saved_footer: "Настройки сохранены на этом устройстве.",
        summary_all_on: "Все уведомления: ВКЛЮЧЕНЫ",
        summary_all_off: "Все уведомления: ВЫКЛЮЧЕНЫ",
      }
    },
    hi: {
      common: {
        help: "मदद",
        on: "ON",
        off: "OFF",
        on_short: "ON",
        off_short: "OFF",
        enabled: "सक्रिय",
        all: "सभी",
      },
      alerts: {
        title: "अलर्ट सेटिंग्स",
        all_status: { on: "सक्रिय", off: "निष्क्रिय", partial: "आंशिक" },
        items: {
          balance: "बैलेंस मॉनिटर",
          rsi: "RSI इंडेक्स",
          item3: "अलर्ट 3",
          item4: "अलर्ट 4",
        },
        save: "सेटिंग्स सहेजें",
        saved_title: "OKXcandlebot",
        saved_prefix: "नई अलर्ट सेटिंग्स:",
        saved_footer: "सेटिंग्स इस डिवाइस पर सहेजी गई हैं।",
        summary_all_on: "सभी अलर्ट: सक्रिय",
        summary_all_off: "सभी अलर्ट: निष्क्रिय",
      }
    }
  };

  function pickLang() {
    const saved = localStorage.getItem('okx_lang');
    if (saved && DICTS[saved]) return saved;
    const code = (window.Core?.tg?.initDataUnsafe?.user?.language_code || 'en').slice(0,2);
    return DICTS[code] ? code : 'en';
  }

  function get(obj, path) {
    return path.split('.').reduce((o,k)=> (o && o[k] != null ? o[k] : undefined), obj);
  }

  const I18N = {
    lang: pickLang(),
    t(key) { return get(DICTS[this.lang], key) ?? key; },
    setLang(l) {
      if (!DICTS[l]) return;
      this.lang = l;
      try { localStorage.setItem('okx_lang', l); } catch {}
      window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang:l } }));
    },
    _dicts: DICTS,
  };

  window.I18N = I18N;
})();
