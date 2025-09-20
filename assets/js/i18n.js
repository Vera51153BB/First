export const dict = {
  en: {
    alerts_title: "Notifications control",
    on: "ON", off: "OFF",
    saved_banner_title: "OKXcandlebot",
    saved_banner_body_all_on: "All notifications: ENABLED",
    saved_banner_body_all_off: "All notifications: DISABLED",
    saved_suffix: "Settings saved on this device.",
    balance: "Balance",
    rsi: "RSI Index",
    alert3: "Alert 3",
    alert4: "Alert 4",
  },
  ru: {
    alerts_title: "Управление уведомлениями",
    on: "ВКЛ", off: "ВЫК",
    saved_banner_title: "OKXcandlebot",
    saved_banner_body_all_on: "Все уведомления: ВКЛЮЧЕНЫ",
    saved_banner_body_all_off: "Все уведомления: ВЫКЛЮЧЕНЫ",
    saved_suffix: "Настройки сохранены на этом устройстве.",
    balance: "Баланс монет",
    rsi: "Индекс RSI",
    alert3: "Уведомление 3",
    alert4: "Уведомление 4",
  },
  hi: {
    alerts_title: "सूचनाएँ",
    on: "ON", off:"OFF",
    saved_banner_title: "OKXcandlebot",
    saved_banner_body_all_on: "All notifications: ENABLED",
    saved_banner_body_all_off:"All notifications: DISABLED",
    saved_suffix: "सेटिंग्स इस डिवाइस पर सहेजी गईं।",
    balance: "बैलेंस",
    rsi: "RSI इंडेक्स",
    alert3: "अलर्ट 3",
    alert4: "अलर्ट 4",
  }
};

export function t(key, lang){
  const L = (lang || window.__LANG__ || 'ru').toLowerCase();
  return (dict[L] && dict[L][key]) || (dict.en[key]) || key;
}
