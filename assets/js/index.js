// Конфиг главного тикера (_home_)
const TICKER_HOME_CONFIG = {
  // Базовые размеры исходной картинки
  //  imgWidth: 1344,
  //  imgHeight: 768,

  // Список монет для отображения.
  // ВАЖНО:
  //   • symbol — ключ сопоставления с backend /api/home/ticker;
  //   • label — подпись в UI;
  //   • priceDigits — точность цены для конкретной монеты;
  //   • внешний CoinGecko больше не используется.
  symbols: [
    { symbol: "BTC",  label: "BTC·USDT",  priceDigits: 2 },
    { symbol: "ETH",  label: "ETH·USDT",  priceDigits: 2 },
    { symbol: "SOL",  label: "SOL·USDT",  priceDigits: 4 },
    { symbol: "TON",  label: "TON·USDT",  priceDigits: 4 },
    { symbol: "XRP",  label: "XRP·USDT",  priceDigits: 4 },
    { symbol: "DOGE", label: "DOGE·USDT", priceDigits: 5 },
    { symbol: "BNB",  label: "BNB·USDT",  priceDigits: 2 },
    { symbol: "ADA",  label: "ADA·USDT",  priceDigits: 4 },
    { symbol: "LTC",  label: "LTC·USDT",  priceDigits: 4 },
    { symbol: "AVAX", label: "AVAX·USDT", priceDigits: 4 },
    { symbol: "SHIB", label: "SHIB·USDT", priceDigits: 8 },
    { symbol: "OKB",  label: "OKB·USDT",  priceDigits: 2 },
    { symbol: "UNI",  label: "UNI·USDT",  priceDigits: 2 },
    { symbol: "DOT",  label: "DOT·USDT",  priceDigits: 4 },
    { symbol: "LINK", label: "LINK·USDT", priceDigits: 4 }
  ],

  // Параметры обновления
  refreshMs: 60000, // 60 секунд

  // Округление процента.
  // ВАЖНО:
  //   • priceDigits теперь задаётся на уровне каждой монеты отдельно;
  //   • changeDigits остаётся общим для процентов.
  changeDigits: 2,

  // Backend-снимок цен.
  // ВАЖНО:
  //   • фронт больше не обращается к CoinGecko;
  //   • берём уже подготовленные данные с нашего backend.
  apiUrl: "/api/news/feed?lang=en&limit=10"
};

// --- Вспомогательные функции (_home_) ---

function parse_home_ticker_summary(summaryText) {
  const normalized = Object.create(null);

  if (typeof summaryText !== "string" || !summaryText.trim()) {
    return normalized;
  }

  const parts = summaryText.split("·");

  parts.forEach((part) => {
    const text = String(part || "").trim();
    if (!text) {
      return;
    }

    const tokens = text.split(/\s+/).filter(Boolean);
    if (tokens.length < 3) {
      return;
    }

    const symbol = String(tokens[0] || "").trim().toUpperCase();
    const changeToken = String(tokens[tokens.length - 1] || "").trim();
    const priceToken = tokens.slice(1, -1).join("");

    if (!symbol || !priceToken || !changeToken) {
      return;
    }

    const price = parseFloat(
      priceToken.replace(/\s+/g, "").replace(",", ".")
    );

    const change = parseFloat(
      changeToken.replace("%", "").replace(",", ".")
    );

    normalized[symbol] = {
      usd: isFinite(price) ? price : null,
      usd_24h_change: isFinite(change) ? change : null
    };
  });

  return normalized;
}

function fetch_home_quotes() {
  return fetch(TICKER_HOME_CONFIG.apiUrl, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      return res.json();
    })
    .then((feedItems) => {
      if (!Array.isArray(feedItems)) {
        return null;
      }

      const tickerCard = feedItems.find((item) => {
        return item && item.kind === "ticker";
      });

      if (!tickerCard) {
        return null;
      }

      const summaryText =
        typeof tickerCard.summary === "string" && tickerCard.summary.trim()
          ? tickerCard.summary
          : "";

      return parse_home_ticker_summary(summaryText);
    })
    .catch((err) => {
      console.warn("[home_ticker] fetch error:", err);
      return null;
    });
}

function format_home_number(value, digits) {
  if (typeof value !== "number" || !isFinite(value)) {
    return "– – –";
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function build_home_ticker_row(data) {
  const row = document.getElementById("ticker_home_row");
  if (!row) {
    return;
  }

  // Чистим текущий контент
  row.innerHTML = "";

  const frag = document.createDocumentFragment();

  TICKER_HOME_CONFIG.symbols.forEach((sym) => {
    const raw = data && data[sym.symbol];
    const price = raw ? raw.usd : null;
    const change = raw ? raw.usd_24h_change : null;

    const item = document.createElement("span");
    item.className = "ticker_home_item";

    const symbolEl = document.createElement("span");
    symbolEl.className = "ticker_home_symbol";
    symbolEl.textContent = sym.label;

    const priceEl = document.createElement("span");
    priceEl.className = "ticker_home_price";
    priceEl.textContent = format_home_number(
      price,
      typeof sym.priceDigits === "number"
        ? sym.priceDigits
        : 2
    );
    
    const changeEl = document.createElement("span");
    const changeNum =
      typeof change === "number" && isFinite(change) ? change : null;

    let changeClass = "ticker_home_change";
    let changeText = "– – –%";

    if (changeNum !== null) {
      const sign = changeNum >= 0 ? "+" : "";
      changeText =
        sign +
        format_home_number(
          changeNum,
          TICKER_HOME_CONFIG.changeDigits
        ) +
        "%";
      changeClass +=
        changeNum >= 0
          ? " ticker_home_change--up"
          : " ticker_home_change--down";
    } else {
      changeClass += " ticker_home_change--down";
    }

    changeEl.className = changeClass;
    changeEl.textContent = changeText;

    item.appendChild(symbolEl);
    item.appendChild(priceEl);
    item.appendChild(changeEl);

    frag.appendChild(item);
  });

  // Дублируем содержимое, чтобы анимация была бесшовной
  row.appendChild(frag.cloneNode(true));
  row.appendChild(frag);
}

function refresh_home_ticker_once() {
  fetch_home_quotes().then((data) => {
    build_home_ticker_row(data);
  });
}

function init_home_ticker() {
  refresh_home_ticker_once();
  setInterval(refresh_home_ticker_once, TICKER_HOME_CONFIG.refreshMs);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init_home_ticker);
} else {
  init_home_ticker();
}
