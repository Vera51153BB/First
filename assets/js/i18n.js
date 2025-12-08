// ===== I18N (словарь + событие смены языка) =====
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
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        balance: "Gainers / Losers",
        alert2:  "RSI Zones & Extremes",
        alert3:  "Alert 3",
        alert4:  "Alert 4",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
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
    },
    alerts: {
      title: "अलर्ट सेटिंग्स",
      header_label: "सभी सूचनाएँ:",
      all_on_btn: "सक्रिय करें",
      all_off_btn: "निष्क्रिय करें",
      items: {
        balance: "लाभ बनाम हानि",
        alert2:  "RSI: क्षेत्र और चरम)",
        alert3:  "अलर्ट 3",
        alert4:  "अलर्ट 4",
      },
      save: "सेटिंग्स सहेजें",
      footnote: "स्विच इस डिवाइस पर सहेजे जाते हैं और तुरंत लागू होते हैं।",
      saved_prefix: "नई सूचना सेटिंग्स:",
      saved_footer: "सेटिंग्स इस डिवाइस पर सहेजी गई हैं।",
      summary_all_on: "सभी सूचनाएँ: चालू",
      summary_all_off: "सभी सूचनाएँ: बंद",
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
    },
    alerts: {
      title: "УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ",
      header_label: "Все уведомления:",
      all_on_btn: "включить",
      all_off_btn: "выключить",
      items: {
        balance: "Растущие / Падающие",
        alert2:  "RSI: зоны и экстремумы",
        alert3:  "Уведомление 3",
        alert4:  "Уведомление 4",
      },
      save: "Сохранить настройки",
      footnote: "Переключатели сохраняются на этом устройстве и применяются мгновенно",
      saved_prefix: "Новые настройки уведомлений:",
      saved_footer: "Настройки сохранены на этом устройстве.",
      summary_all_on: "Все уведомления: ВКЛЮЧЕНЫ",
      summary_all_off: "Все уведомления: ВЫКЛЮЧЕНЫ",
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
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        balance: "Gainers / Losers",
        alert2:  "RSI Zones & Extremes",
        alert3:  "Alert 3",
        alert4:  "Alert 4",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
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
    },
    alerts: {
      title: "AJUSTES DE NOTIFICACIONES",
      header_label: "Todas las notificaciones:",
      all_on_btn: "Activar",
      all_off_btn: "Desactivar",
      items: {
        balance: "Ganadores / Perdedores",
        alert2:  "RSI: Zonas y Extremos",
        alert3:  "Alerta 3",
        alert4:  "Alerta 4",
      },
      save: "Guardar ajustes",
      footnote: "Los interruptores se guardan en este dispositivo y se aplican al instante",
      saved_prefix: "Nuevos ajustes de notificación:",
      saved_footer: "Los ajustes se guardan en este dispositivo.",
      summary_all_on: "Todas las notificaciones: ACTIVADAS",
      summary_all_off: "Todas las notificaciones: DESACTIVADAS",
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
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        balance: "Gainers / Losers",
        alert2:  "RSI Zones & Extremes",
        alert3:  "Alert 3",
        alert4:  "Alert 4",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
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
    },
    alerts: {
      title: "BENACHRICHTIGUNGEN",
      header_label: "Alle Benachrichtigungen:",
      all_on_btn: "Aktivieren",
      all_off_btn: "Deaktivieren",
      items: {
        balance: "Gewinner / Verlierer",
        alert2:  "RSI: Zonen & Extremwerte",
        alert3:  "Alarm 3",
        alert4:  "Alarm 4",
      },
      save: "Einstellungen speichern",
      footnote: "Die Schalter werden auf diesem Gerät gespeichert und sofort angewendet",
      saved_prefix: "Neue Benachrichtigungseinstellungen:",
      saved_footer: "Einstellungen werden auf diesem Gerät gespeichert.",
      summary_all_on: "Alle Benachrichtigungen: AKTIVIERT",
      summary_all_off: "Alle Benachrichtigungen: DEAKTIVIERT",
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
    },
    alerts: {
      title: "PARAMÈTRES DES NOTIFICATIONS",
      header_label: "Toutes les notifications :",
      all_on_btn: "Activer",
      all_off_btn: "Désactiver",
      items: {
        balance: "Gagnants / Perdants",
        alert2:  "RSI: Zones & Extrêmes",
        alert3:  "Alerte 3",
        alert4:  "Alerte 4",
      },
      save: "Enregistrer les paramètres",
      footnote: "Les interrupteurs sont enregistrés sur cet appareil et appliqués instantanément",
      saved_prefix: "Nouveaux paramètres de notification :",
      saved_footer: "Les paramètres sont enregistrés sur cet appareil.",
      summary_all_on: "Toutes les notifications : ACTIVÉES",
      summary_all_off: "Toutes les notifications : DÉSACTIVÉES",
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
    },
    alerts: {
      title: "IMPOSTAZIONI NOTIFICHE",
      header_label: "Tutte le notifiche:",
      all_on_btn: "Abilita",
      all_off_btn: "Disabilita",
      items: {
        balance: "Vincenti / Perdenti",
        alert2:  "RSI: Zone ed Estremi",
        alert3:  "Avviso 3",
        alert4:  "Avviso 4",
      },
      save: "Salva impostazioni",
      footnote: "Gli interruttori vengono salvati su questo dispositivo e applicati istantaneamente",
      saved_prefix: "Nuove impostazioni delle notifiche:",
      saved_footer: "Le impostazioni sono salvate su questo dispositivo.",
      summary_all_on: "Tutte le notifiche: ATTIVE",
      summary_all_off: "Tutte le notifiche: DISATTIVATE",
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
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        balance: "Gainers / Losers",
        alert2:  "RSI Zones & Extremes",
        alert3:  "Alert 3",
        alert4:  "Alert 4",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
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
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        balance: "Gainers / Losers",
        alert2:  "RSI Zones & Extremes",
        alert3:  "Alert 3",
        alert4:  "Alert 4",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
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
    },
    alerts: {
      title: "NOTIFICATION SETTINGS",
      header_label: "All notifications:",
      all_on_btn: "Enable",
      all_off_btn: "Disable",
      items: {
        balance: "Gainers / Losers",
        alert2:  "RSI Zones & Extremes",
        alert3:  "Alert 3",
        alert4:  "Alert 4",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
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
  },
};

  function pickLang() {
    // 1) Язык страницы из <html lang="..."> (главный источник правды для /en, /hi, /ru и т.д.)
    const htmlLang = (document.documentElement.getAttribute("lang") || "")
      .slice(0, 2)
      .toLowerCase();
    if (htmlLang && DICTS[htmlLang]) {
      return htmlLang;
    }

    // 2) Сохранённый выбор пользователя (если по какой-то причине lang в <html> не задан)
    try {
      const saved = localStorage.getItem("okx_lang");
      if (saved && DICTS[saved]) {
        return saved;
      }
    } catch (_) {
      // localStorage может быть недоступен в режиме инкогнито / жестком режиме приватности
    }

    // 3) Язык браузера как запасной вариант
    const navCode = (navigator.language || "en").slice(0, 2).toLowerCase();
    return DICTS[navCode] ? navCode : "en";
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
