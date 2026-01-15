/* global Telegram */
/* Отвечает за время */
(function () {
  "use strict";

  try {
    if (window.Telegram && Telegram.WebApp && typeof Telegram.WebApp.ready === "function") {
      Telegram.WebApp.ready();
    }
  } catch (e) {}

  // Сохраняем offset так: local_time = utc_time + tz_offset_minutes
  // JS Date.getTimezoneOffset() возвращает минуты "локальное -> UTC", знак обратный.
  function getTzOffsetMinutes() {
    return -new Date().getTimezoneOffset();
  }

  function getInitData() {
    try {
      return (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData) ? Telegram.WebApp.initData : "";
    } catch (e) {
      return "";
    }
  }

  // Отправляем не чаще 1 раза в сутки и только если offset изменился
  function shouldSend(offset) {
    try {
      var key = "tz_offset_sent_v1";
      var raw = localStorage.getItem(key);
      var now = Date.now();

      if (!raw) return true;

      var obj = JSON.parse(raw);
      if (!obj) return true;

      // Если offset изменился — отправляем снова
      if (typeof obj.offset === "number" && obj.offset !== offset) return true;

      // 24 часа с момента последней успешной отправки
      if (typeof obj.ts === "number" && (now - obj.ts) > 24 * 60 * 60 * 1000) return true;

      return false;
    } catch (e) {
      return true;
    }
  }
  function markSent(offset) {
    try {
      localStorage.setItem("tz_offset_sent_v1", JSON.stringify({ ts: Date.now(), offset: offset }));
    } catch (e) {}
  }

  async function send() {
    var initData = getInitData();
    if (!initData) return;

    var offset = getTzOffsetMinutes();
    if (!shouldSend(offset)) return;

    try {
      var resp = await fetch("/api/v1/user/tz-offset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-InitData": initData
        },
        body: JSON.stringify({ tz_offset_minutes: offset })
      });

      if (resp && resp.ok) {
        markSent(offset);
      }
    } catch (e) {
      // ВАЖНО: ошибки TZ не должны ломать UI
    }
  }
  // Запуск при загрузке
  if (document.readyState === "complete" || document.readyState === "interactive") {
    send();
  } else {
    document.addEventListener("DOMContentLoaded", send);
  }
})();
