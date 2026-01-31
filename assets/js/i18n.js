/* assets-js-i18n.js ===== I18N (словарь + событие смены языка для webapp) ===== */
(function () {
const DICTS = {
  /* ============== ENGLISH ============== */
  en: {
    common: {
      help: "Help",
      settings: "Settings",
      on: "On",
      off: "Off",
      partially: "Partially On",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "Coming soon",
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        alert_rsi:  "RSI Zones & Extremes",
        alert_ema:  "Moving average (EMA)",
        alert4:  "Coming soon",
        balance: "Coming soon",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
    },
    ema: {
      title: "EMA alert settings",
      section_timeframes: "Timeframes",
      section_signals: "Signal types",
      sig_cross: "Fast/slow EMA crossover",
      sig_price_cross: "Price crosses EMA",
      sig_slope: "EMA slope changes direction",
      save: "Save EMA settings",
      footnote: "EMA settings are saved for your account and used when generating EMA alerts.",
      saved_prefix: "New EMA settings:",
      saved_footer: "EMA settings are saved on this device.",
      summary_timeframes: "Timeframes:",
      summary_signals: "Signals:",
    },
    landing: {
      hero: {
        line1: "When should you enter a trade?",
        line2: "Where are the best long/short entry points for coin X right now?",
        line3: "Where should you place stop-loss and take-profit?",
        line4: "Which coins should you be watching today?",
        line5: "Where has the impulse started or a breakout is forming?",
        line6: "What is happening in the crypto market right now?",
        cta:   "Connect the bot",
      },
      slogan: "signals of trend-reversing coins"
    },
    news: {
      show_more_btn: "Show more",
      master_market_title: "Market Breadth",
      master_calendar_title: "Calendar",
      master_ticker_title: "Market ticker",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      very_very_weak: ["Decline has turned broad-based"],
      very_weak: [
        "Most cryptocurrencies are falling",
        "The crypto market is down across most assets",
        "The decline is affecting almost the entire crypto market",
      ],
      weak: [
        "The market looks weak: more coins are falling",
        "Sellers dominate the crypto market",
      ],
      neutral: [
        "No clear direction in the market",
        "Gainers and losers are roughly balanced",
        "The crypto market is in a balance phase",
      ],
      strong: [
        "Most cryptocurrencies are rising",
        "The rally covers a large part of the market",
        "Buyers are active in the crypto market",
      ],
      very_strong: [
        "Gains are becoming broad-based across the crypto market",
        "Most cryptocurrencies are rising strongly",
        "The market shows broad positive momentum",
      ],
    },
  },

  /* ============== HINDI ============== */
  hi: {
    common: {
      help: "मदद",
      settings: "सेटिंग्स",
      on: "चालू",
      off: "बंद",
      partially: "आंशिक रूप से चालू",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "जल्द ही",
    },
    alerts: {
      title: "अलर्ट सेटिंग्स",
      header_label: "सभी सूचनाएँ:",
      all_on_btn: "सक्रिय करें",
      all_off_btn: "निष्क्रिय करें",
      items: {
        alert_rsi: "RSI: क्षेत्र और चरम मान",
        alert_ema: "चलती औसत (EMA)",
        alert4: "जल्द ही (विकासाधीन)",
        balance: "जल्द ही (विकासाधीन)",        
      },
      save: "सेटिंग्स सहेजें",
      footnote: "स्विच इस डिवाइस पर सहेजे जाते हैं और तुरंत लागू होते हैं।",
      saved_prefix: "नई सूचना सेटिंग्स:",
      saved_footer: "सेटिंग्स इस डिवाइस पर सहेजी गई हैं।",
      summary_all_on: "सभी सूचनाएँ: चालू",
      summary_all_off: "सभी सूचनाएँ: बंद",
    },
    ema: {
      title: "EMA अलर्ट सेटिंग्स",
      section_timeframes: "टाइमफ़्रेम",
      section_signals: "सिग्नल के प्रकार",
      sig_cross: "तेज़/धीमी EMA क्रॉसओवर",
      sig_price_cross: "कीमत EMA को पार करती है",
      sig_slope: "EMA की ढलान की दिशा बदलती है",
      save: "EMA सेटिंग्स सहेजें",
      footnote: "EMA सेटिंग्स आपके खाते के लिए सहेजी जाती हैं और EMA अलर्ट बनाते समय उपयोग होती हैं।",
      saved_prefix: "नई EMA सेटिंग्स:",
      saved_footer: "EMA सेटिंग्स इस डिवाइस पर सहेजी गई हैं।",
      summary_timeframes: "टाइमफ़्रेम:",
      summary_signals: "सिग्नल:",
    },
    landing: {
      hero: {
        line1: "ट्रेड में प्रवेश कब करना है?",
        line2: "अभी कॉइन X में लॉन्ग/शॉर्ट के लिए सबसे अच्छे एंट्री पॉइंट कहाँ हैं?",
        line3: "स्टॉप-लॉस और टेक-प्रॉफिट कहाँ लगाना है?",
        line4: "आज किन कॉइनों पर नज़र रखना चाहिए?",
        line5: "इम्पल्स कहाँ शुरू हुआ है या ब्रेकआउट कहाँ बन रहा है?",
        line6: "अभी क्रिप्टो मार्केट में क्या हो रहा है?",
        cta:   "बॉट को कनेक्ट करें",
      },
      slogan: "ट्रेंड बदलने वाली कॉइनों के संकेत"
    },
    news: {
      show_more_btn: "और दिखाएँ",
      master_market_title: "बाज़ार की व्यापकता",
      master_calendar_title: "कैलेंडर",
      master_ticker_title: "मार्केट टिकर",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      very_very_weak: ["गिरावट व्यापक हो गई है"],
      very_weak: [
        "अधिकांश क्रिप्टोकरेंसी अभी गिर रही हैं",
        "क्रिप्टो बाजार अधिकांश एसेट्स में नीचे है",
        "गिरावट लगभग पूरे क्रिप्टो बाजार को प्रभावित कर रही है",
      ],
      weak: [
        "बाजार कमजोर दिख रहा है: गिरने वाले कॉइन ज्यादा हैं",
        "क्रिप्टो बाजार में बिकवाली हावी है",
      ],
      neutral: [
        "बाजार में कोई साफ़ दिशा नहीं है",
        "बढ़त और गिरावट लगभग बराबर हैं",
        "क्रिप्टो बाजार संतुलन चरण में है",
      ],
      strong: [
        "अधिकांश क्रिप्टोकरेंसी बढ़ रही हैं",
        "तेजी बाजार के बड़े हिस्से में फैली है",
        "क्रिप्टो बाजार में खरीदार सक्रिय हैं",
      ],
      very_strong: [
        "तेजी पूरे क्रिप्टो बाजार में व्यापक हो रही है",
        "क्रिप्टोकरेंसी का बड़ा हिस्सा मजबूत बढ़त में है",
        "बाजार व्यापक सकारात्मक गति दिखा रहा है",
      ],
    },
  },

  /* ============== RUSSIAN ============== */
  ru: {
    common: {
      help: "Помощь",
      settings: "Настройки",
      on: "включено",
      off: "выключено",
      partially: "частично",
      on_short: "ВКЛ",
      off_short: "ВЫК",
      coming_soon: "Скоро",
    },
    alerts: {
      title: "УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ",
      header_label: "Все уведомления:",
      all_on_btn: "включить",
      all_off_btn: "выключить",
      items: {
        alert_rsi:  "RSI: зоны и экстремумы",
        alert_ema:  "Скользящая средняя (EMA)",
        alert4:  "Скоро (в разработке)",
        balance: "Скоро (в разработке)",
      },
      save: "Сохранить настройки",
      footnote: "Переключатели сохраняются на этом устройстве и применяются мгновенно",
      saved_prefix: "Новые настройки уведомлений:",
      saved_footer: "Настройки сохранены на этом устройстве.",
      summary_all_on: "Все уведомления: ВКЛЮЧЕНЫ",
      summary_all_off: "Все уведомления: ВЫКЛЮЧЕНЫ",
    },
    ema: {
      title: "Настройки сигналов EMA",
      section_timeframes: "Таймфреймы",
      section_signals: "Типы сигналов",
      sig_cross: "Пересечение быстрой и медленной EMA",
      sig_price_cross: "Цена пересекает EMA",
      sig_slope: "Смена наклона EMA",
      save: "Сохранить настройки EMA",
      footnote: "Настройки EMA сохраняются для вашего аккаунта и используются при формировании сигналов EMA.",
      saved_prefix: "Новые настройки EMA:",
      saved_footer: "Настройки EMA сохранены на этом устройстве.",
      summary_timeframes: "Таймфреймы:",
      summary_signals: "Сигналы:",
    },
    landing: {
      hero: {
        line1: "Когда входить в сделку?",
        line2: "Где сейчас лучшие точки входа в лонг/шорт?",
        line3: "Где поставить стоп-лосс и тейк-профит?",
        line4: "Какие монеты смотреть сегодня?",
        line5: "Где начался импульс или формируется пробой?",
        line6: "Что происходит на крипторынке прямо сейчас?",
        cta:   "Подключить бота",
      },
      slogan: "сигналы монет меняющих тренд"
    },
    news: {
      show_more_btn: "Показать ещё",
      master_market_title: "Ширина рынка",
      master_calendar_title: "Календарь",
      master_ticker_title: "Рыночное табло",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      very_very_weak: ["Падение стало массовым"],
      very_weak: [
        "Большинство криптовалют сейчас снижается",
        "Крипторынок падает по большинству активов",
        "Снижение затрагивает почти весь крипторынок",
      ],
      weak: [
        "Рынок выглядит слабым: падающих монет больше",
        "На крипторынке преобладают продажи активов",
      ],
      neutral: [
        "Рынок без выраженного направления",
        "Рост и падение распределены примерно поровну",
        "Крипторынок находится в фазе баланса",
      ],
      strong: [
        "Большинство криптовалют растёт",
        "Рост охватывает значительную часть рынка",
        "На крипторынке активны покупатели",
      ],
      very_strong: [
        "Рост становится массовым по всему крипторынку",
        "Большая часть криптовалют активно растёт",
        "Рынок демонстрирует широкую позитивную динамику",
      ],
    },
  },

  /* ============== PORTUGUÊS ============== */
  pt: {
    common: {
      help: "Help",
      settings: "Settings",
      on: "On",
      off: "Off",
      partially: "Partially On",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "Em breve",
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        alert_rsi:  "RSI: zonas e extremos",
        alert_ema:  "Média móvel (EMA)",
        alert4:  "Em breve (em desenvolvimento)",
        balance: "Em breve (em desenvolvimento)",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
    },
    ema: {
      title: "Configurações de alertas EMA",
      section_timeframes: "Timeframes",
      section_signals: "Tipos de sinal",
      sig_cross: "Cruzamento EMA rápida/lenta",
      sig_price_cross: "Preço cruza a EMA",
      sig_slope: "Inclinação da EMA muda de direção",
      save: "Salvar configurações de EMA",
      footnote: "As configurações de EMA são salvas para a sua conta e usadas ao gerar alertas EMA.",
      saved_prefix: "Novas configurações de EMA:",
      saved_footer: "Configurações de EMA salvas neste dispositivo.",
      summary_timeframes: "Timeframes:",
      summary_signals: "Sinais:",
    },
    landing: {
      hero: {
        line1: "Quando entrar em uma operação?",
        line2: "Onde estão agora os melhores pontos de entrada em long/short na moeda X?",
        line3: "Onde colocar o stop-loss e o take-profit?",
        line4: "Quais moedas vale a pena observar hoje?",
        line5: "Onde começou o impulso ou está se formando um rompimento?",
        line6: "O que está acontecendo no mercado de cripto agora?",
        cta:   "Conectar o bot",
      },
      slogan: "sinais de moedas que mudam de tendência"
    },
    news: {
      show_more_btn: "Mostrar mais",
      master_market_title: "Amplitude do mercado",
      master_calendar_title: "Calendário",
      master_ticker_title: "Ticker de mercado",
    },
        /* --- Заголовки market-card --- */
    news_market_headlines: {
      very_very_weak: ["A queda se tornou generalizada"],
      very_weak: [
        "A maioria das criptomoedas está caindo",
        "O mercado cripto cai na maioria dos ativos",
        "A queda atinge quase todo o mercado cripto",
      ],
      weak: [
        "O mercado parece fraco: há mais moedas em queda",
        "As vendas predominam no mercado cripto",
      ],
      neutral: [
        "O mercado está sem direção clara",
        "Altas e baixas estão quase equilibradas",
        "O mercado cripto está em fase de equilíbrio",
      ],
      strong: [
        "A maioria das criptomoedas está subindo",
        "A alta abrange uma parte significativa do mercado",
        "Os compradores estão ativos no mercado cripto",
      ],
      very_strong: [
        "A alta se torna generalizada em todo o mercado cripto",
        "Grande parte das criptomoedas sobe com força",
        "O mercado mostra uma dinâmica positiva ampla",
      ],
    },
  },
  
  /* ============== ESPAÑOL ============== */
  es: {
    common: {
      help: "Ayuda",
      settings: "Ajustes",
      on: "Activado",
      off: "Desactivado",
      partially: "Parcialmente activado",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "Próximamente",
    },
    alerts: {
      title: "AJUSTES DE NOTIFICACIONES",
      header_label: "Todas las notificaciones:",
      all_on_btn: "Activar",
      all_off_btn: "Desactivar",
      items: {
        alert_rsi:  "RSI: Zonas y Extremos",
        alert_ema:  "Media móvil (EMA)",
        alert4:  "Próximamente (en desarrollo)",
        balance: "Próximamente (en desarrollo)",
      },
      save: "Guardar ajustes",
      footnote: "Los interruptores se guardan en este dispositivo y se aplican al instante",
      saved_prefix: "Nuevos ajustes de notificación:",
      saved_footer: "Los ajustes se guardan en este dispositivo.",
      summary_all_on: "Todas las notificaciones: ACTIVADAS",
      summary_all_off: "Todas las notificaciones: DESACTIVADAS",
    },
    ema: {
      title: "Ajustes de alertas EMA",
      section_timeframes: "Marcos temporales",
      section_signals: "Tipos de señal",
      sig_cross: "Cruce de EMA rápida/lenta",
      sig_price_cross: "El precio cruza la EMA",
      sig_slope: "La pendiente de la EMA cambia de dirección",
      save: "Guardar ajustes de EMA",
      footnote: "Los ajustes de EMA se guardan para tu cuenta y se usan al generar alertas EMA.",
      saved_prefix: "Nuevos ajustes de EMA:",
      saved_footer: "Los ajustes de EMA se guardan en este dispositivo.",
      summary_timeframes: "Marcos temporales:",
      summary_signals: "Señales:",
    },
    landing: {
      hero: {
        line1: "¿Cuándo entrar en una operación?",
        line2: "¿Dónde están ahora los mejores puntos de entrada en long/short para la moneda X?",
        line3: "¿Dónde colocar el stop-loss y el take-profit?",
        line4: "¿Qué monedas merece la pena mirar hoy?",
        line5: "¿Dónde ha empezado el impulso o se está formando un breakout?",
        line6: "¿Qué está pasando en el mercado cripto ahora mismo?",
        cta:   "Conectar el bot",
      },
      slogan: "señales de monedas que cambian de tendencia"
    },
    news: {
      show_more_btn: "Mostrar más",
      master_market_title: "Amplitud del mercado",
      master_calendar_title: "Calendario",
      master_ticker_title: "Ticker del mercado",
    },
            /* --- Заголовки market-card --- */
    news_market_headlines: {
      "very_very_weak": ["La caída se ha vuelto generalizada"],
      "very_weak": [
          "La mayoría de las criptomonedas está bajando",
          "El mercado cripto cae en la mayoría de los activos",
          "La caída afecta a casi todo el mercado cripto",
      ],
      "weak": [
          "El mercado se ve débil: hay más monedas a la baja",
          "Predominan las ventas en el mercado cripto",
      ],
      "neutral": [
          "El mercado no muestra una dirección clara",
          "Las subidas y bajadas están casi equilibradas",
          "El mercado cripto está en una fase de equilibrio",
      ],
      "strong": [
          "La mayoría de las criptomonedas sube",
          "El avance abarca una parte importante del mercado",
          "Los compradores están activos en el mercado cripto",
      ],
      "very_strong": [
          "Las subidas se vuelven generalizadas en todo el mercado cripto",
          "Gran parte de las criptomonedas sube con fuerza",
          "El mercado muestra una dinámica positiva amplia",
      ],
    },
  },

  /* ============== УКРАЇНСЬКА ============== */
  uk: {
    common: {
      help: "Help",
      settings: "Settings",
      on: "On",
      off: "Off",
      partially: "Partially On",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "Скоро",
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        alert_rsi:  "RSI: зони та екстремуми",
        alert_ema:  "Ковзна середня (EMA)",
        alert4:  "Скоро (в розробці)",
        balance: "Скоро (в розробці)",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
    },
    ema: {
      title: "Налаштування сигналів EMA",
      section_timeframes: "Таймфрейми",
      section_signals: "Типи сигналів",
      sig_cross: "Перетин швидкої та повільної EMA",
      sig_price_cross: "Ціна перетинає EMA",
      sig_slope: "Зміна нахилу EMA",
      save: "Зберегти налаштування EMA",
      footnote: "Налаштування EMA зберігаються для вашого акаунта і використовуються під час формування сигналів EMA.",
      saved_prefix: "Нові налаштування EMA:",
      saved_footer: "Налаштування EMA збережені на цьому пристрої.",
      summary_timeframes: "Таймфрейми:",
      summary_signals: "Сигнали:",
    },
    landing: {
      hero: {
        line1: "Коли заходити в угоду?",
        line2: "Де зараз найкращі точки входу в лонг/шорт по монеті X?",
        line3: "Де виставити стоп-лос і тейк-профіт?",
        line4: "Які монети варто дивитися сьогодні?",
        line5: "Де почався імпульс або формується пробій?",
        line6: "Що відбувається на крипторинку просто зараз?",
        cta:   "Підключити бота",
      },
      slogan: "сигнали монет, що змінюють тренд"
    },
    news: {
      show_more_btn: "Показати ще",
      master_market_title: "Ширина ринку",
      master_calendar_title: "Календар",
      master_ticker_title: "Ринковий тікер",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      "very_very_weak": ["Падіння стало масовим"],
      "very_weak": [
          "Більшість криптовалют зараз знижується",
          "Крипторинок падає по більшості активів",
          "Зниження зачіпає майже весь крипторинок",
      ],
      "weak": [
          "Ринок виглядає слабким: монет, що падають, більше",
          "На крипторинку переважають продажі",
      ],
      "neutral": [
          "Ринок без вираженого напрямку",
          "Зростання і падіння розподілені приблизно порівну",
          "Крипторинок перебуває у фазі балансу",
      ],
      "strong": [
          "Більшість криптовалют зростає",
          "Зростання охоплює значну частину ринку",
          "На крипторинку активні покупці",
      ],
      "very_strong": [
          "Зростання стає масовим по всьому крипторинку",
          "Більша частина криптовалют активно зростає",
          "Ринок демонструє широку позитивну динаміку",
      ],
    },
  },

  /* ============== DEUTSCH ============== */
  de: {
    common: {
      help: "Hilfe",
      settings: "Einstellungen",
      on: "Ein",
      off: "Aus",
      partially: "Teilweise an",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "Kommt bald",
    },
    alerts: {
      title: "BENACHRICHTIGUNGEN",
      header_label: "Alle Benachrichtigungen:",
      all_on_btn: "Aktivieren",
      all_off_btn: "Deaktivieren",
      items: {
        alert_rsi:  "RSI: Zonen & Extremwerte",
        alert_ema:  "Gleitender Durchschnitt (EMA)",
        alert4:  "Kommt bald (in Entwicklung)",
        balance: "Kommt bald (in Entwicklung)",
      },
      save: "Einstellungen speichern",
      footnote: "Die Schalter werden auf diesem Gerät gespeichert und sofort angewendet",
      saved_prefix: "Neue Benachrichtigungseinstellungen:",
      saved_footer: "Einstellungen werden auf diesem Gerät gespeichert.",
      summary_all_on: "Alle Benachrichtigungen: AKTIVIERT",
      summary_all_off: "Alle Benachrichtigungen: DEAKTIVIERT",
    },
    ema: {
      title: "EMA-Alarm-Einstellungen",
      section_timeframes: "Zeiteinheiten",
      section_signals: "Signaltypen",
      sig_cross: "Kreuzung der schnellen/langsamen EMA",
      sig_price_cross: "Preis kreuzt die EMA",
      sig_slope: "Steigung der EMA ändert die Richtung",
      save: "EMA-Einstellungen speichern",
      footnote: "EMA-Einstellungen werden für Ihr Konto gespeichert und bei der Erstellung von EMA-Alerts verwendet.",
      saved_prefix: "Neue EMA-Einstellungen:",
      saved_footer: "EMA-Einstellungen werden auf diesem Gerät gespeichert.",
      summary_timeframes: "Zeiteinheiten:",
      summary_signals: "Signale:",
    },
    landing: {
      hero: {
        line1: "Wann sollte man in einen Trade einsteigen?",
        line2: "Wo sind derzeit die besten Long/Short-Einstiegspunkte für Coin X?",
        line3: "Wo setzt man Stop-Loss und Take-Profit?",
        line4: "Welche Coins sollte man sich heute ansehen?",
        line5: "Wo hat der Impuls begonnen oder bildet sich ein Ausbruch?",
        line6: "Was passiert gerade am Kryptomarkt?",
        cta:   "Bot verbinden",
      },
      slogan: "Signale zu Coins, die den Trend wenden"
    },
    news: {
      show_more_btn: "Mehr anzeigen",
      master_market_title: "Marktbreite",
      master_calendar_title: "Kalender",
      master_ticker_title: "Markt-Ticker",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      "very_very_weak": ["Der Rückgang ist breit angelegt"],
      "very_weak": [
          "Die meisten Kryptowährungen fallen",
          "Der Kryptomarkt fällt bei den meisten Assets",
          "Der Rückgang erfasst fast den gesamten Kryptomarkt",
      ],
      "weak": [
          "Der Markt wirkt schwach: mehr Coins fallen",
          "Am Kryptomarkt dominieren Verkäufe",
      ],
      "neutral": [
          "Der Markt hat keine klare Richtung",
          "Gewinner und Verlierer sind etwa ausgeglichen",
          "Der Kryptomarkt befindet sich in einer Balancephase",
      ],
      "strong": [
          "Die meisten Kryptowährungen steigen",
          "Der Anstieg erfasst einen großen Teil des Marktes",
          "Am Kryptomarkt sind Käufer aktiv",
      ],
      "very_strong": [
          "Der Anstieg wird im gesamten Kryptomarkt breit angelegt",
          "Ein Großteil der Kryptowährungen steigt deutlich",
          "Der Markt zeigt eine breite positive Dynamik",
      ],
    },
  },
  
  /* ============== FRANÇAIS ============== */
  fr: {
    common: {
      help: "Aide",
      settings: "Paramètres",
      on: "Activé",
      off: "Désactivé",
      partially: "Partiellement activé",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "Bientôt disponible",
    },
    alerts: {
      title: "PARAMÈTRES DES NOTIFICATIONS",
      header_label: "Toutes les notifications :",
      all_on_btn: "Activer",
      all_off_btn: "Désactiver",
      items: {
        alert_rsi:  "RSI : Zones et Extrêmes",
        alert_ema:  "Moyenne mobile (EMA)",
        alert4:  "Bientôt disponible",
        balance: "Bientôt disponible",
      },
      save: "Enregistrer les paramètres",
      footnote: "Les interrupteurs sont enregistrés sur cet appareil et appliqués instantanément",
      saved_prefix: "Nouveaux paramètres de notification :",
      saved_footer: "Les paramètres sont enregistrés sur cet appareil.",
      summary_all_on: "Toutes les notifications : ACTIVÉES",
      summary_all_off: "Toutes les notifications : DÉSACTIVÉES",
    },
    ema: {
      title: "Paramètres des alertes EMA",
      section_timeframes: "Unités de temps",
      section_signals: "Types de signal",
      sig_cross: "Croisement EMA rapide/lente",
      sig_price_cross: "Le prix croise l’EMA",
      sig_slope: "La pente de l’EMA change de direction",
      save: "Enregistrer les paramètres EMA",
      footnote: "Les paramètres EMA sont enregistrés pour votre compte et utilisés lors de la génération des alertes EMA.",
      saved_prefix: "Nouveaux paramètres EMA :",
      saved_footer: "Les paramètres EMA sont enregistrés sur cet appareil.",
      summary_timeframes: "Unités de temps :",
      summary_signals: "Signaux :",
    },
    landing: {
      hero: {
        line1: "Quand entrer en position ?",
        line2: "Où se trouvent en ce moment les meilleurs points d'entrée long/short sur la pièce X ?",
        line3: "Où placer le stop-loss et le take-profit ?",
        line4: "Quelles pièces faut-il regarder aujourd'hui ?",
        line5: "Où l'impulsion a-t-elle commencé ou une cassure est-elle en train de se former ?",
        line6: "Que se passe-t-il en ce moment sur le marché crypto ?",
        cta:   "Connecter le bot",
      },
      slogan: "signaux des cryptos qui inversent la tendance"
    },
    news: {
      show_more_btn: "Afficher plus",
      master_market_title: "Amplitude du marché",
      master_calendar_title: "Calendrier",
      master_ticker_title: "Ticker de marché",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      "very_very_weak": ["La baisse devient généralisée"],
      "very_weak": [
          "La plupart des cryptomonnaies reculent",
          "Le marché crypto baisse sur la majorité des actifs",
          "La baisse touche presque tout le marché crypto",
      ],
      "weak": [
          "Le marché paraît faible : plus de cryptos baissent",
          "Les ventes dominent sur le marché crypto",
      ],
      "neutral": [
          "Le marché n’a pas de direction nette",
          "Hausse et baisse sont à peu près équilibrées",
          "Le marché crypto est dans une phase d’équilibre",
      ],
      "strong": [
          "La plupart des cryptomonnaies progressent",
          "La hausse concerne une part importante du marché",
          "Les acheteurs sont actifs sur le marché crypto",
      ],
      "very_strong": [
          "La hausse devient généralisée sur l’ensemble du marché crypto",
          "Une grande partie des cryptomonnaies progresse fortement",
          "Le marché affiche une dynamique positive large",
      ],
    },
  },

  /* ============== ITALIANO ============== */
  it: {
    common: {
      help: "Aiuto",
      settings: "Impostazioni",
      on: "Attivo",
      off: "Disattivo",
      partially: "Parzialmente attivo",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "Presto in arrivo",
    },
    alerts: {
      title: "IMPOSTAZIONI NOTIFICHE",
      header_label: "Tutte le notifiche:",
      all_on_btn: "Abilita",
      all_off_btn: "Disabilita",
      items: {
        alert_rsi:  "RSI: Zone ed Estremi",
        alert_ema:  "Media mobile (EMA)",
        alert4:  "Presto in arrivo",
        balance: "Presto in arrivo",
      },
      save: "Salva impostazioni",
      footnote: "Gli interruttori vengono salvati su questo dispositivo e applicati istantaneamente",
      saved_prefix: "Nuove impostazioni delle notifiche:",
      saved_footer: "Le impostazioni sono salvate su questo dispositivo.",
      summary_all_on: "Tutte le notifiche: ATTIVE",
      summary_all_off: "Tutte le notifiche: DISATTIVATE",
    },
    ema: {
      title: "Impostazioni avvisi EMA",
      section_timeframes: "Timeframe",
      section_signals: "Tipi di segnale",
      sig_cross: "Incrocio EMA veloce/lenta",
      sig_price_cross: "Il prezzo incrocia la EMA",
      sig_slope: "La pendenza della EMA cambia direzione",
      save: "Salva impostazioni EMA",
      footnote: "Le impostazioni EMA vengono salvate per il tuo account e usate per generare gli avvisi EMA.",
      saved_prefix: "Nuove impostazioni EMA:",
      saved_footer: "Impostazioni EMA salvate su questo dispositivo.",
      summary_timeframes: "Timeframe:",
      summary_signals: "Segnali:",
    },
    landing: {
      hero: {
        line1: "Quando entrare in una operazione?",
        line2: "Dove sono ora i migliori punti di ingresso long/short sulla coin X?",
        line3: "Dove mettere stop-loss e take-profit?",
        line4: "Quali coin guardare oggi?",
        line5: "Dove è iniziato l'impulso o si sta formando un breakout?",
        line6: "Cosa sta succedendo adesso sul mercato cripto?",
        cta:   "Collega il bot",
      },
      slogan: "segnali delle crypto che invertono il trend"
    },
    news: {
      show_more_btn: "Mostra altro",
      master_market_title: "Ampiezza del mercato",
      master_calendar_title: "Calendario",
      master_ticker_title: "Ticker di mercato",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      "very_very_weak": ["Il calo è diventato generalizzato"],
      "very_weak": [
          "La maggior parte delle criptovalute è in calo",
          "Il mercato crypto scende sulla maggior parte degli asset",
          "Il calo coinvolge quasi tutto il mercato crypto",
      ],
      "weak": [
          "Il mercato appare debole: più monete scendono",
          "Sul mercato crypto prevalgono le vendite",
      ],
      "neutral": [
          "Il mercato non mostra una direzione chiara",
          "Rialzi e ribassi sono più o meno bilanciati",
          "Il mercato crypto è in una fase di equilibrio",
      ],
      "strong": [
          "La maggior parte delle criptovalute sale",
          "Il rialzo coinvolge una parte significativa del mercato",
          "Sul mercato crypto gli acquirenti sono attivi",
      ],
      "very_strong": [
          "Il rialzo diventa generalizzato in tutto il mercato crypto",
          "Gran parte delle criptovalute cresce con forza",
          "Il mercato mostra una dinamica positiva ampia",
      ],
    },
  },

  /* ============== 日本語 ============== */
  ja: {
    common: {
      help: "Help",
      settings: "Settings",
      on: "On",
      off: "Off",
      partially: "Partially On",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "近日追加",
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        alert_rsi:  "RSI：ゾーンと極値",
        alert_ema:  "移動平均（EMA）",
        alert4:  "近日追加予定",
        balance: "近日追加予定",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
    },
    ema: {
      title: "EMAアラート設定",
      section_timeframes: "時間足",
      section_signals: "シグナルの種類",
      sig_cross: "高速／低速EMAのクロス",
      sig_price_cross: "価格がEMAをクロスする",
      sig_slope: "EMAの傾きが方向を変える",
      save: "EMA設定を保存",
      footnote: "EMA設定はあなたのアカウント用に保存され、EMAアラートの生成に利用されます。",
      saved_prefix: "新しいEMA設定:",
      saved_footer: "EMA設定はこのデバイスに保存されました。",
      summary_timeframes: "時間足:",
      summary_signals: "シグナル:",
    },
    landing: {
      hero: {
        line1: "いつエントリーすべきか？",
        line2: "今、銘柄Xでロング／ショートに入るベストなエントリーポイントはどこか？",
        line3: "どこにストップロスとテイクプロフィットを置くべきか？",
        line4: "今日はどのコインを見るべきか？",
        line5: "どこでインパルスが始まったか、またはブレイクアウトが形成されているか？",
        line6: "いま仮想通貨市場で何が起きているのか？",
        cta:   "ボットを接続する",
      },
      slogan: "トレンド転換するコインのシグナル"
    },
    news: {
      show_more_btn: "もっと見る",
      master_market_title: "市場の広がり",
      master_calendar_title: "カレンダー",
      master_ticker_title: "マーケット・ティッカー",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      very_very_weak: ["下落が市場全体に広がっている"],
      very_weak: [
        "多くの暗号資産が下落している",
        "暗号資産市場は大半の銘柄で下落",
        "下落がほぼ市場全体に及んでいる",
      ],
      weak: [
        "市場は弱含み：下落銘柄が優勢",
        "暗号資産市場では売りが優勢",
      ],
      neutral: [
        "市場に明確な方向感がない",
        "上昇と下落がほぼ拮抗",
        "暗号資産市場は均衡局面",
      ],
      strong: [
        "多くの暗号資産が上昇している",
        "上昇が市場の広い範囲に及んでいる",
        "暗号資産市場では買いが活発",
      ],
      very_strong: [
        "上昇が市場全体に広がっている",
        "大半の暗号資産が力強く上昇",
        "市場は幅広い上昇モメンタムを示している",
      ],
    },
  },

  /* ============== TÜRKÇE ============== */
  tr: {
    common: {
      help: "Help",
      settings: "Settings",
      on: "On",
      off: "Off",
      partially: "Partially On",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "Yakında",
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        alert_rsi:  "RSI: bölgeler ve aşırı seviyeler",
        alert_ema:  "Hareketli ortalama (EMA)",
        alert4:  "Yakında (geliştirme aşamasında)",
        balance: "Yakında (geliştirme aşamasında)",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
    },
    ema: {
      title: "EMA uyarı ayarları",
      section_timeframes: "Zaman dilimleri",
      section_signals: "Sinyal türleri",
      sig_cross: "Hızlı/yavaş EMA kesişimi",
      sig_price_cross: "Fiyat EMA'nın üzerinden geçer",
      sig_slope: "EMA eğimi yön değiştirir",
      save: "EMA ayarlarını kaydet",
      footnote: "EMA ayarları hesabınız için kaydedilir ve EMA uyarıları oluşturulurken kullanılır.",
      saved_prefix: "Yeni EMA ayarları:",
      saved_footer: "EMA ayarları bu cihazda saklandı.",
      summary_timeframes: "Zaman dilimleri:",
      summary_signals: "Sinyaller:",
    },
    landing: {
      hero: {
        line1: "İşleme ne zaman girmelisin?",
        line2: "Şu anda X coini için long/short girişinin en iyi seviyeleri nerede?",
        line3: "Stop-loss ve take-profit nereye konulmalı?",
        line4: "Bugün hangi coinlere bakmak gerekiyor?",
        line5: "İmpuls nerede başladı ya da bir kırılma nerede oluşuyor?",
        line6: "Şu anda kripto piyasasında neler oluyor?",
        cta:   "Botu bağla",
      },
      slogan: "trendi tersine çeviren coinler için sinyaller"
    },
    news: {
      show_more_btn: "Daha fazla göster",
      master_market_title: "Piyasa genişliği",
      master_calendar_title: "Takvim",
      master_ticker_title: "Piyasa bandı",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      "very_very_weak": ["Düşüş piyasaya yayıldı"],
      "very_weak": [
          "Kripto paraların çoğu düşüyor",
          "Kripto piyasası varlıkların çoğunda geriliyor",
          "Düşüş neredeyse tüm kripto piyasasını etkiliyor",
      ],
      "weak": [
          "Piyasa zayıf görünüyor: düşen coin sayısı daha fazla",
          "Kripto piyasasında satışlar baskın",
      ],
      "neutral": [
          "Piyasada belirgin bir yön yok",
          "Yükseliş ve düşüşler neredeyse dengede",
          "Kripto piyasası denge fazında",
      ],
      "strong": [
          "Kripto paraların çoğu yükseliyor",
          "Yükseliş piyasanın önemli bir kısmına yayılıyor",
          "Kripto piyasasında alıcılar aktif",
      ],
      "very_strong": [
          "Yükseliş tüm kripto piyasasına yayılıyor",
          "Kripto paraların büyük kısmı güçlü yükseliyor",
          "Piyasa geniş çaplı pozitif momentum gösteriyor",
      ],
    },
  },

  /* ============== 中文 ============== */
  zh: {
    common: {
      help: "Help",
      settings: "Settings",
      on: "On",
      off: "Off",
      partially: "Partially On",
      on_short: "ON",
      off_short: "OFF",
      coming_soon: "即将推出",
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        alert_rsi:  "RSI：区域与极值",
        alert_ema:  "移动平均线（EMA）",
        alert4:  "即将推出（开发中）",
        balance: "即将推出（开发中）",
      },
      save: "保存设置",
      footnote: "开关会保存在此设备上并立即生效",
      saved_prefix: "新的通知设置：",
      saved_footer: "设置已保存在此设备上。",
      summary_all_on: "所有通知：已开启",
      summary_all_off: "所有通知：已关闭",
    },
    ema: {
      title: "EMA 警报设置",
      section_timeframes: "时间周期",
      section_signals: "信号类型",
      sig_cross: "快/慢 EMA 金叉死叉",
      sig_price_cross: "价格穿越 EMA",
      sig_slope: "EMA 斜率改变方向",
      save: "保存 EMA 设置",
      footnote: "EMA 设置会保存在你的账号上，并在生成 EMA 警报时使用。",
      saved_prefix: "新的 EMA 设置：",
      saved_footer: "EMA 设置已保存在此设备上。",
      summary_timeframes: "时间周期：",
      summary_signals: "信号：",
    },
    landing: {
      hero: {
        line1: "什么时候应该进场交易？",
        line2: "现在在哪些位置是X币做多/做空的最佳入场点？",
        line3: "止损和止盈应该放在哪里？",
        line4: "今天应该关注哪些币？",
        line5: "哪里出现了行情冲动或正在形成突破？",
        line6: "此刻加密市场正在发生什么？",
        cta:   "连接机器人",
      },
      slogan: "趋势反转币种的信号"
    },
    news: {
      show_more_btn: "显示更多",
      master_market_title: "市场广度",
      master_calendar_title: "日历",
      master_ticker_title: "行情看板",
    },
    /* --- Заголовки market-card --- */
    news_market_headlines: {
      very_very_weak: ["下跌已扩散至全市场"],
      very_weak: [
        "大多数加密货币正在下跌",
        "加密市场大部分资产走低",
        "下跌几乎影响整个加密市场",
      ],
      weak: [
        "市场偏弱：下跌币种更多",
        "加密市场卖盘占主导",
      ],
      neutral: [
        "市场缺乏明确方向",
        "上涨与下跌大致均衡",
        "加密市场处于平衡阶段",
      ],
      strong: [
        "大多数加密货币上涨",
        "上涨覆盖市场的较大部分",
        "加密市场买盘活跃",
      ],
      very_strong: [
        "上涨正在全市场扩散",
        "大部分加密货币强势上涨",
        "市场呈现广泛的正向动能",
      ],
    },
  },

};

  function pickLang() {
    // 0) Язык из query-параметра ?lang=... — это то, что прислал бот.
    //    В Telegram WebApp query может оказаться в search или в hash,
    //    поэтому пытаемся разобрать оба варианта.
    try {
      let raw = window.location.search || window.location.hash || "";
      if (raw.startsWith("#")) {
        raw = raw.slice(1);
      }
      const params = new URLSearchParams(raw || "");
      const qLang = (params.get("lang") || "")
        .slice(0, 2)
        .toLowerCase();
      if (qLang && DICTS[qLang]) {
        return qLang;
      }
    } catch (_) {
      // если вдруг URLSearchParams не взлетел — просто игнорируем
    }

    // 1) Язык из Telegram WebApp (язык интерфейса пользователя в приложении)
    try {
      const tg = window.Telegram && window.Telegram.WebApp;
      const tgLang = (
        tg &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user &&
        tg.initDataUnsafe.user.language_code ||
        ""
      )
        .slice(0, 2)
        .toLowerCase();
      if (tgLang && DICTS[tgLang]) {
        return tgLang;
      }
    } catch (_) {
      // если Telegram.WebApp недоступен (например, открытие в обычном браузере) — просто игнорируем
    }

    // 2) Язык страницы из <html lang="..."> (для обычных статических страниц)
    const htmlLang = (document.documentElement.getAttribute("lang") || "")
      .slice(0, 2)
      .toLowerCase();
    if (htmlLang && DICTS[htmlLang]) {
      return htmlLang;
    }

    // 3) Сохранённый выбор пользователя
    try {
      const saved = localStorage.getItem("okx_lang");
      if (saved && DICTS[saved]) {
        return saved;
      }
    } catch (_) {
      // localStorage может быть недоступен в режиме инкогнито / жёстком режиме приватности
    }

    // 4) Язык браузера как запасной вариант
    const navCode = (navigator.language || "en").slice(0, 2).toLowerCase();
    return DICTS[navCode] ? navCode : "en";
  }

  function get(obj, path) {
    return path.split('.').reduce(
      (o, k) => (o && o[k] != null ? o[k] : undefined),
      obj
    );
  }

  const initialLang = pickLang();

  const I18N = {
    lang: initialLang,
    t(key) {
      return get(DICTS[this.lang], key) ?? key;
    },
    setLang(l) {
      if (!DICTS[l]) return;
      this.lang = l;
      try {
        localStorage.setItem("okx_lang", l);
      } catch (_) {
        // localStorage может быть недоступен — просто игнорируем
      }
      window.dispatchEvent(
        new CustomEvent("i18n:change", { detail: { lang: l } })
      );
    },
    _dicts: DICTS,
  };

  window.I18N = I18N;
})();

