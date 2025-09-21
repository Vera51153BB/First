// ===== I18N (лёгкий словарик + событие смены языка) =====
// Примечания:
// - Совместим с прежним API: window.I18N.t(path), I18N.setLang(l).
// - Добавлены новые ключи под требования UI (header_label, partially, on_caps/off_caps).
// - Старые ключи не удалялись, чтобы не ломать уже подключённые страницы.
//
// Как пользоваться:
//   I18N.t('alerts.title')
//   I18N.setLang('ru')  // эмитит window event 'i18n:change' с detail.lang
//
(function () {
  /** Вспомогалка: безопасный доступ по "a.b.c" */
  function get(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
  }

  /** Основные словари (en/ru/hi).  */
  const DICTS = {
    en: {
      common: {
        help: "Help",
        settings: "Settings",

        // универсальные статусы
        on: "On",
        off: "Off",
        partially: "Partially On",

        // короткие подписи на тумблере
        on_short: "ON",
        off_short: "OFF",

        // «капс»-формы для сводок
        on_caps: "ON",
        off_caps: "OFF",

        // совместимость со старым кодом
        enabled: "enabled",
        all: "all",
      },

      alerts: {
        // Заголовок страницы
        title: "NOTIFICATION SETTINGS",

        // Новый хедер «Все уведомления: …»
        header_label: "All notifications:",

        // Совместимость: старый блок статусов
        all_status: { on: "on", off: "off", partial: "partial" },

        // Список элементов (id-ключи совпадают с payload)
        items: {
          balance: "Balance",
          // alias ниже синхронизируется на rsi/alert2, см. mergeAliases()
          rsi: "RSI Index",
          alert2: "RSI Index",
          item3: "Alert 3",
          alert3: "Alert 3",
          item4: "Alert 4",
          alert4: "Alert 4",
        },

        // Кнопка
        save: "Save settings",

        // Сообщение сохранения (popup/toast)
        saved_title: "OKXcandlebot",
        saved_prefix: "New notification settings:",
        saved_footer: "Settings are saved on this device.",
        // Совместимость (старые сводки)
        summary_all_on: "All notifications: ON",
        summary_all_off: "All notifications: OFF",
      }
    },

    ru: {
      common: {
        help: "Помощь",
        settings: "Настройки",

        on: "включено",
        off: "выключено",
        partially: "частично",

        on_short: "ВКЛ",
        off_short: "ВЫК",

        on_caps: "ВКЛЮЧЕНЫ",
        off_caps: "ВЫКЛЮЧЕНЫ",

        // совместимость
        enabled: "включено",
        all: "все",
      },

      alerts: {
        title: "УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ",
        header_label: "Все уведомления:",

        all_status: { on: "включено", off: "выключено", partial: "частично" },

        items: {
          balance: "Баланс монет",
          rsi: "Индекс RSI",
          alert2: "Индекс RSI", // алиас id
          item3: "Уведомление 3",
          alert3: "Уведомление 3",
          item4: "Уведомление 4",
          alert4: "Уведомление 4",
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
        settings: "सेटिंग्स",

        on: "चालू",
        off: "बंद",
        partially: "आंशिक रूप से चालू",

        on_short: "ON",
        off_short: "OFF",

        on_caps: "चालू",
        off_caps: "बंद",

        // совместимость
        enabled: "सक्रिय",
        all: "सभी",
      },

      alerts: {
        title: "अलर्ट सेटिंग्स",
        header_label: "सभी सूचनाएँ:",

        all_status: { on: "सक्रिय", off: "निष्क्रिय", partial: "आंशिक" },

        items: {
          balance: "बैलेंस अलर्ट",
          rsi: "RSI सूचकांक",
          alert2: "RSI सूचकांक", // алиас id
          item3: "अलर्ट 3",
          alert3: "अलर्ट 3",
          item4: "अलर्ट 4",
          alert4: "अलर्ट 4",
        },

        save: "सेटिंग्स सहेजें",

        saved_title: "OKXcandlebot",
        saved_prefix: "नई सूचना सेटिंग्स:",
        saved_footer: "सेटिंग्स इस डिवाइस पर सहेजी गई हैं।",

        summary_all_on: "सभी सूचनाएँ: चालू",
        summary_all_off: "सभी सूचनाएँ: बंद",
      }
    }
  };

  // --- служебное: унифицируем алиасы элементов (rsi/alert2, item3/alert3 ...) ---
  function mergeAliases() {
    for (const lang of Object.keys(DICTS)) {
      const items = DICTS[lang]?.alerts?.items || {};
      // если есть rsi, но нет alert2 — продублируем, и наоборот
      if (items.rsi && !items.alert2) items.alert2 = items.rsi;
      if (items.alert2 && !items.rsi) items.rsi = items.alert2;

      if (items.item3 && !items.alert3) items.alert3 = items.item3;
      if (items.alert3 && !items.item3) items.item3 = items.alert3;

      if (items.item4 && !items.alert4) items.alert4 = items.item4;
      if (items.alert4 && !items.item4) items.item4 = items.alert4;
    }
  }
  mergeAliases();

  // --- выбор языка: сперва сохраняемый, затем из Telegram user.language_code, затем 'en'
  function pickLang() {
    const saved = localStorage.getItem('okx_lang');
    if (saved && DICTS[saved]) return saved;

    const tgCode = (window.Core?.tg?.initDataUnsafe?.user?.language_code || "").slice(0, 2);
    if (DICTS[tgCode]) return tgCode;

    const nav = (navigator.language || navigator.userLanguage || 'en').slice(0, 2);
    return DICTS[nav] ? nav : 'en';
  }

  const I18N = {
    lang: pickLang(),

    /** Получить строку по "alerts.items.balance" */
    t(key) { return get(DICTS[this.lang], key) ?? key; },

    /** Сменить язык (эмитим событие для подписчиков Core/страниц) */
    setLang(l) {
      if (!DICTS[l]) return;
      this.lang = l;
      try { localStorage.setItem('okx_lang', l); } catch {}
      window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: l } }));
    },

    /** Доступ к словарям (на случай отладки) */
    _dicts: DICTS,
  };

  window.I18N = I18N;
})();
