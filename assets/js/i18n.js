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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – Find Crypto Entry & Exit Points",
      seo_desc_home: "BotCryptoSignal is a multi-exchange crypto trading assistant that helps you see when to enter a trade, where to place stop-loss and take-profit, which coins to watch today and where impulses and breakouts are forming on the market. Not financial advice.",
      og_title_home: "BotCryptoSignal – Smart Assistant for Crypto Traders",
      og_desc_home: "Smart assistant for crypto traders: shows when to enter a trade, which coins to focus on today, where to place stop-loss and take-profit, and where impulses or breakouts are forming on the market. Not financial advice.",
      tw_title_home: "BotCryptoSignal – Crypto Assistant for Entry & Exit Points",
      tw_desc_home: "Crypto trading assistant that highlights entry and exit points, stop-loss and take-profit zones and coins worth watching today, so you see what is happening on the market right now.",
      og_image_alt_home: "BotCryptoSignal – crypto trading assistant that helps you choose which coins to analyse today and when to enter or exit a trade.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – क्रिप्टो एंट्री और एग्ज़िट पॉइंट्स खोजें",
      seo_desc_home: "BotCryptoSignal एक मल्टी-एक्सचेंज क्रिप्टो ट्रेडिंग असिस्टेंट है, जो दिखाता है कि ट्रेड में कब प्रवेश करना है, स्टॉप-लॉस और टेक-प्रॉफिट कहाँ लगाना है, आज किन कॉइनों पर नज़र रखनी है और बाज़ार में कहाँ इम्पल्स या ब्रेकआउट बन रहा है। यह वित्तीय सलाह नहीं है।",
      og_title_home: "BotCryptoSignal – क्रिप्टो ट्रेडर्स के लिए स्मार्ट असिस्टेंट",
      og_desc_home: "क्रिप्टो ट्रेडर्स के लिए स्मार्ट असिस्टेंट: दिखाता है कि ट्रेड में कब प्रवेश करना है, आज किन कॉइनों पर फोकस करना है, स्टॉप-लॉस और टेक-प्रॉफिट कहाँ रखना है और बाज़ार में कहाँ इम्पल्स या ब्रेकआउट बन रहा है। यह वित्तीय सलाह नहीं है।",
      tw_title_home: "BotCryptoSignal – एंट्री और एग्ज़िट पॉइंट्स के लिए क्रिप्टो असिस्टेंट",
      tw_desc_home: "क्रिप्टो ट्रेडिंग असिस्टेंट, जो एंट्री और एग्ज़िट पॉइंट्स, स्टॉप-लॉस और टेक-प्रॉफिट ज़ोन और वे कॉइन हाइलाइट करता है, जिन पर आज ध्यान देना चाहिए, ताकि आप देख सकें कि अभी बाज़ार में क्या हो रहा है।",
      og_image_alt_home: "BotCryptoSignal – क्रिप्टो ट्रेडिंग असिस्टेंट, जो मदद करता है चुनने में कि आज किन कॉइनों का विश्लेषण करना है और ट्रेड में कब प्रवेश या निकास करना है।",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal — поиск точек входа и выхода по криптовалютам",
      seo_desc_home: "BotCryptoSignal — мультибиржевой ассистент криптотрейдера, который подсказывает, когда входить в сделку, где ставить стоп-лосс и тейк-профит, какие монеты смотреть сегодня и где на рынке начинаются импульсы или формируется пробой. Не является финансовой рекомендацией.",
      og_title_home: "BotCryptoSignal — умный ассистент для криптотрейдеров",
      og_desc_home: "Умный ассистент для криптотрейдеров: помогает понять, когда входить в сделку, какие монеты выбрать сегодня, где ставить стоп-лосс и тейк-профит и где на рынке начинаются импульсы или формируется пробой. Не является финансовым советом.",
      tw_title_home: "BotCryptoSignal — ассистент по точкам входа и выхода",
      tw_desc_home: "Криптоассистент, который подсвечивает точки входа и выхода, зоны стоп-лосса и тейк-профита и монеты, на которые стоит смотреть сегодня, чтобы понимать, что происходит на рынке прямо сейчас.",
      og_image_alt_home: "BotCryptoSignal — ассистент криптотрейдера, который помогает выбрать, какие монеты анализировать сегодня и когда входить или выходить из сделки.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – Encuentra puntos de entrada y salida en cripto",
      seo_desc_home: "BotCryptoSignal es un asistente de trading de criptomonedas multi-exchange que te ayuda a ver cuándo entrar en una operación, dónde colocar el stop-loss y el take-profit, qué monedas vigilar hoy y dónde se están formando impulsos y breakouts en el mercado. No es asesoramiento financiero.",
      og_title_home: "BotCryptoSignal – Asistente inteligente para traders de cripto",
      og_desc_home: "Asistente inteligente para traders de criptomonedas: te muestra cuándo entrar en una operación, en qué monedas centrarte hoy, dónde colocar el stop-loss y el take-profit y dónde se están formando impulsos o breakouts en el mercado. No es asesoramiento financiero.",
      tw_title_home: "BotCryptoSignal – Asistente cripto para puntos de entrada y salida",
      tw_desc_home: "Asistente de trading cripto que resalta puntos de entrada y salida, zonas de stop-loss y take-profit y las monedas que merece la pena vigilar hoy, para que veas qué está pasando ahora en el mercado.",
      og_image_alt_home: "BotCryptoSignal – asistente de trading cripto que te ayuda a elegir qué monedas analizar hoy y cuándo entrar o salir de una operación.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – Trouver des points d’entrée et de sortie en crypto",
      seo_desc_home: "BotCryptoSignal est un assistant de trading crypto multi-plateformes qui vous aide à voir quand entrer en position, où placer le stop-loss et le take-profit, quelles pièces surveiller aujourd’hui et où des impulsions ou des cassures sont en train de se former sur le marché. Ceci n’est pas un conseil financier.",
      og_title_home: "BotCryptoSignal – Assistant intelligent pour les traders crypto",
      og_desc_home: "Assistant intelligent pour les traders crypto : montre quand entrer en position, sur quelles pièces se concentrer aujourd’hui, où placer le stop-loss et le take-profit et où des impulsions ou des cassures se forment sur le marché. Ceci n’est pas un conseil financier.",
      tw_title_home: "BotCryptoSignal – Assistant crypto pour les points d’entrée et de sortie",
      tw_desc_home: "Assistant de trading crypto qui met en évidence les points d’entrée et de sortie, les zones de stop-loss et de take-profit et les pièces à surveiller aujourd’hui, afin que vous compreniez ce qui se passe sur le marché en ce moment.",
      og_image_alt_home: "BotCryptoSignal – assistant de trading crypto qui vous aide à choisir quelles pièces analyser aujourd’hui et quand entrer ou sortir d’une position.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – Krypto-Einstiegs- und Ausstiegspunkte finden",
      seo_desc_home: "BotCryptoSignal ist ein börsenübergreifender Krypto-Trading-Assistent, der dir hilft zu sehen, wann du in einen Trade einsteigen solltest, wo du Stop-Loss und Take-Profit platzierst, welche Coins du heute beobachten solltest und wo sich Impulse und Ausbrüche am Markt bilden. Keine Finanzberatung.",
      og_title_home: "BotCryptoSignal – Intelligenter Assistent für Krypto-Trader",
      og_desc_home: "Intelligenter Assistent für Krypto-Trader: zeigt dir, wann du in einen Trade einsteigen solltest, auf welche Coins du dich heute konzentrieren solltest, wo du Stop-Loss und Take-Profit setzt und wo sich Impulse oder Ausbrüche am Markt bilden. Keine Finanzberatung.",
      tw_title_home: "BotCryptoSignal – Krypto-Assistent für Ein- und Ausstiegspunkte",
      tw_desc_home: "Krypto-Trading-Assistent, der Ein- und Ausstiegspunkte, Stop-Loss- und Take-Profit-Zonen sowie Coins hervorhebt, die du heute im Blick haben solltest, damit du siehst, was am Markt gerade passiert.",
      og_image_alt_home: "BotCryptoSignal – Krypto-Trading-Assistent, der dir hilft auszuwählen, welche Coins du heute analysieren solltest und wann du in einen Trade ein- oder aussteigen solltest.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – Trova punti di entrata e uscita in crypto",
      seo_desc_home: "BotCryptoSignal è un assistente di trading crypto multi-exchange che ti aiuta a capire quando entrare in un’operazione, dove posizionare stop-loss e take-profit, quali coin guardare oggi e dove si stanno formando impulsi e breakout sul mercato. Non è una consulenza finanziaria.",
      og_title_home: "BotCryptoSignal – Assistente intelligente per trader crypto",
      og_desc_home: "Assistente intelligente per trader crypto: mostra quando entrare in un trade, su quali coin concentrarsi oggi, dove mettere stop-loss e take-profit e dove sul mercato si stanno formando impulsi o breakout. Non è una consulenza finanziaria.",
      tw_title_home: "BotCryptoSignal – Assistente crypto per punti di entrata e uscita",
      tw_desc_home: "Assistente di trading crypto che evidenzia punti di entrata e uscita, zone di stop-loss e take-profit e le coin da monitorare oggi, così puoi vedere cosa sta succedendo sul mercato in questo momento.",
      og_image_alt_home: "BotCryptoSignal – assistente di trading crypto che ti aiuta a scegliere quali coin analizzare oggi e quando entrare o uscire da un’operazione.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – Encontre pontos de entrada e saída em cripto",
      seo_desc_home: "BotCryptoSignal é um assistente de trading de criptomoedas multi-exchange que ajuda você a ver quando entrar em uma operação, onde colocar o stop-loss e o take-profit, quais moedas observar hoje e onde estão se formando impulsos e rompimentos no mercado. Não é recomendação financeira.",
      og_title_home: "BotCryptoSignal – Assistente inteligente para traders de cripto",
      og_desc_home: "Assistente inteligente para traders de cripto: mostra quando entrar em uma operação, em quais moedas focar hoje, onde colocar o stop-loss e o take-profit e onde impulsos ou rompimentos estão se formando no mercado. Não é recomendação financeira.",
      tw_title_home: "BotCryptoSignal – Assistente cripto para pontos de entrada e saída",
      tw_desc_home: "Assistente de trading cripto que destaca pontos de entrada e saída, zonas de stop-loss e take-profit e as moedas que vale a pena observar hoje, para que você veja o que está acontecendo no mercado agora.",
      og_image_alt_home: "BotCryptoSignal – assistente de trading cripto que ajuda você a escolher quais moedas analisar hoje e quando entrar ou sair de uma operação.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal — пошук точок входу й виходу по криптовалютах",
      seo_desc_home: "BotCryptoSignal — мультибіржовий асистент криптотрейдера, який підказує, коли заходити в угоду, де ставити стоп-лос і тейк-профіт, які монети дивитися сьогодні і де на ринку починаються імпульси або формується пробій. Не є фінансовою рекомендацією.",
      og_title_home: "BotCryptoSignal — розумний асистент для криптотрейдерів",
      og_desc_home: "Розумний асистент для криптотрейдерів: допомагає зрозуміти, коли заходити в угоду, які монети обрати сьогодні, де ставити стоп-лос і тейк-профіт і де на ринку починаються імпульси або формується пробій. Не є фінансовою порадою.",
      tw_title_home: "BotCryptoSignal — асистент по точках входу й виходу",
      tw_desc_home: "Криптоасистент, який підсвічує точки входу й виходу, зони стоп-лосу і тейк-профіту та монети, на які варто дивитися сьогодні, щоб розуміти, що відбувається на ринку просто зараз.",
      og_image_alt_home: "BotCryptoSignal — асистент криптотрейдера, який допомагає обрати, які монети аналізувати сьогодні і коли входити чи виходити з угоди.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – クリプトのエントリー＆イグジットポイントを見つける",
      seo_desc_home: "BotCryptoSignal は複数取引所に対応した暗号資産トレーディングアシスタントで、いつエントリーすべきか、どこにストップロスとテイクプロフィットを置くべきか、今日どのコインに注目するか、市場でどこにインパルスやブレイクアウトが生じているかを見える化します。投資助言ではありません。",
      og_title_home: "BotCryptoSignal – クリプトトレーダーのためのスマートアシスタント",
      og_desc_home: "クリプトトレーダーのためのスマートアシスタント。エントリータイミング、今日フォーカスすべきコイン、ストップロスとテイクプロフィットの位置、市場でインパルスやブレイクアウトが起きているポイントを示します。投資助言ではありません。",
      tw_title_home: "BotCryptoSignal – エントリー＆イグジットのためのクリプトアシスタント",
      tw_desc_home: "エントリー／イグジットポイント、ストップロスとテイクプロフィットのゾーン、そして今日チェックすべきコインをハイライトし、いま暗号資産市場で何が起きているかを見やすくするトレーディングアシスタントです。",
      og_image_alt_home: "BotCryptoSignal は、今日どのコインを分析し、いつトレードにエントリーまたはイグジットするべきかを判断する手助けをするクリプトトレーディングアシスタントです。",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – Kriptoda giriş ve çıkış noktalarını bulun",
      seo_desc_home: "BotCryptoSignal, çoklu borsa desteğine sahip bir kripto alım-satım asistanıdır; işleme ne zaman gireceğini, stop-loss ve take-profit’i nereye koyacağını, bugün hangi coin’lere bakman gerektiğini ve piyasada nerede impuls veya kırılma oluştuğunu görmene yardımcı olur. Finansal tavsiye değildir.",
      og_title_home: "BotCryptoSignal – Kripto trader’ları için akıllı asistan",
      og_desc_home: "Kripto trader’ları için akıllı asistan: işleme ne zaman gireceğini, bugün hangi coin’lere odaklanacağını, stop-loss ve take-profit’i nereye yerleştireceğini ve piyasada nerede impuls veya kırılma oluştuğunu gösterir. Finansal tavsiye değildir.",
      tw_title_home: "BotCryptoSignal – Giriş ve çıkış noktaları için kripto asistanı",
      tw_desc_home: "Giriş ve çıkış noktalarını, stop-loss ve take-profit bölgelerini ve bugün takip edilmeye değer coin’leri öne çıkaran kripto alım-satım asistanı; böylece piyasada şu anda neler olduğunu daha net görebilirsin.",
      og_image_alt_home: "BotCryptoSignal – bugün hangi coin’leri analiz edeceğini ve bir işleme ne zaman girip çıkacağını seçmene yardımcı olan kripto alım-satım asistanı.",
    }
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
    },
    meta: {
      seo_title_home: "BotCryptoSignal – 寻找加密交易的进场与出场点",
      seo_desc_home: "BotCryptoSignal 是一个支持多交易所的加密交易助手，帮助你看清何时进场交易、在哪里设置止损和止盈、今天应该关注哪些币种，以及市场上哪里正在形成行情冲动或突破。本信息不构成投资建议。",
      og_title_home: "BotCryptoSignal – 面向加密交易者的智能助手",
      og_desc_home: "面向加密交易者的智能助手：提示何时进场，今天应重点关注哪些币种，在哪里放置止损和止盈，以及市场上哪里正在形成行情冲动或突破。本信息不构成投资建议。",
      tw_title_home: "BotCryptoSignal – 帮你寻找进出场点的加密助手",
      tw_desc_home: "加密交易助手，高亮进场与出场点、止损和止盈区域，以及今天值得关注的币种，帮助你看清此刻加密市场正在发生什么。",
      og_image_alt_home: "BotCryptoSignal 是一款加密交易助手，帮助你选择今天要分析的币种，以及何时进入或退出一笔交易。",
    }
  },
};


  function pickLang() {
    const saved = localStorage.getItem('okx_lang');
    if (saved && DICTS[saved]) return saved;
    const code = (window.Core?.tg?.initDataUnsafe?.user?.language_code || navigator.language || 'en').slice(0,2).toLowerCase();
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
