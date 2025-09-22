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
        balance: "Balance",
        alert2:  "RSI Index",
        alert3:  "Alert 3",
        alert4:  "Alert 4",
      },
      save: "Save settings",
      footnote: "Switches are saved on this device and applied instantly",
      saved_prefix: "New notification settings:",
      saved_footer: "Settings are saved on this device.",
      summary_all_on: "All notifications: ON",
      summary_all_off: "All notifications: OFF",
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
        balance: "बैलेंस",
        alert2:  "RSI सूचकांक",
        alert3:  "अलर्ट 3",
        alert4:  "अलर्ट 4",
      },
      save: "सेटिंग्स सहेजें",
      footnote: "स्विच इस डिवाइस पर सहेजे जाते हैं और तुरंत लागू होते हैं।",
      saved_prefix: "नई सूचना सेटिंग्स:",
      saved_footer: "सेटिंग्स इस डिवाइस पर सहेजी गई हैं।",
      summary_all_on: "सभी सूचनाएँ: चालू",
      summary_all_off: "सभी सूचनाएँ: बंद",
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
        balance: "Баланс монет",
        alert2:  "Индекс RSI",
        alert3:  "Уведомление 3",
        alert4:  "Уведомление 4",
      },
      save: "Сохранить настройки",
      footnote: "Переключатели сохраняются на этом устройстве и применяются мгновенно",
      saved_prefix: "Новые настройки уведомлений:",
      saved_footer: "Настройки сохранены на этом устройстве.",
      summary_all_on: "Все уведомления: ВКЛЮЧЕНЫ",
      summary_all_off: "Все уведомления: ВЫКЛЮЧЕНЫ",
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
        balance: "Saldo",
        alert2:  "Índice RSI",
        alert3:  "Alerta 3",
        alert4:  "Alerta 4",
      },
      save: "Guardar ajustes",
      footnote: "Los interruptores se guardan en este dispositivo y se aplican al instante",
      saved_prefix: "Nuevos ajustes de notificación:",
      saved_footer: "Los ajustes se guardan en este dispositivo.",
      summary_all_on: "Todas las notificaciones: ACTIVADAS",
      summary_all_off: "Todas las notificaciones: DESACTIVADAS",
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
        balance: "Solde",
        alert2:  "Indice RSI",
        alert3:  "Alerte 3",
        alert4:  "Alerte 4",
      },
      save: "Enregistrer les paramètres",
      footnote: "Les interrupteurs sont enregistrés sur cet appareil et appliqués instantanément",
      saved_prefix: "Nouveaux paramètres de notification :",
      saved_footer: "Les paramètres sont enregistrés sur cet appareil.",
      summary_all_on: "Toutes les notifications : ACTIVÉES",
      summary_all_off: "Toutes les notifications : DÉSACTIVÉES",
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
        balance: "Kontostand",
        alert2:  "RSI-Index",
        alert3:  "Alarm 3",
        alert4:  "Alarm 4",
      },
      save: "Einstellungen speichern",
      footnote: "Die Schalter werden auf diesem Gerät gespeichert und sofort angewendet",
      saved_prefix: "Neue Benachrichtigungseinstellungen:",
      saved_footer: "Einstellungen werden auf diesem Gerät gespeichert.",
      summary_all_on: "Alle Benachrichtigungen: AKTIVIERT",
      summary_all_off: "Alle Benachrichtigungen: DEAKTIVIERT",
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
        balance: "Saldo",
        alert2:  "Indice RSI",
        alert3:  "Avviso 3",
        alert4:  "Avviso 4",
      },
      save: "Salva impostazioni",
      footnote: "Gli interruttori vengono salvati su questo dispositivo e applicati istantaneamente",
      saved_prefix: "Nuove impostazioni delle notifiche:",
      saved_footer: "Le impostazioni sono salvate su questo dispositivo.",
      summary_all_on: "Tutte le notifiche: ATTIVE",
      summary_all_off: "Tutte le notifiche: DISATTIVATE",
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
