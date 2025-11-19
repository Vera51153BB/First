// Конфиг главного тикера (_home_)
const TICKER_HOME_CONFIG = {
  // Базовые размеры исходной картинки
  imgWidth: 1344,
  imgHeight: 768,

  // Список монет с CoinGecko для отображения (можно менять)
  symbols: [
    { id: "bitcoin", label: "BTC·USDT" },
    { id: "ethereum", label: "ETH·USDT" },
    { id: "solana", label: "SOL·USDT" },
    { id: "toncoin", label: "TON·USDT" },    
    { id: "ripple", label: "XRP·USDT" },
    { id: "dogecoin", label: "DOGE·USDT" },
    { id: "binancecoin", label: "BNB·USDT" },
    { id: "cardano", label: "ADA·USDT" },
    { id: "litecoin", label: "LTC·USDT" },
    { id: "starcoin", label: "STRC·USDT" },
    { id: "shiba-inu", label: "SHIB·USDT" },
    { id: "okb", label: "OKB·USDT" }
  ],

  // Параметры обновления
  refreshMs: 60000, // 60 секунд
  // Округление цены и процента
  priceDigits: 2,
  changeDigits: 2,

  // URL CoinGecko: берём simple/price (можно заменить на свой backend)
  apiUrl:
    "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&include_24hr_change=true"
};

// --- Вспомогательные функции (_home_) ---

function fetch_home_quotes() {
  const ids = TICKER_HOME_CONFIG.symbols
    .map((s) => encodeURIComponent(s.id))
    .join(",");
  const url = TICKER_HOME_CONFIG.apiUrl + "&ids=" + ids;

  return fetch(url, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      return res.json();
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
    const raw = data && data[sym.id];
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
      TICKER_HOME_CONFIG.priceDigits
    );

    const changeEl = document.createElement("span");
    const changeNum =
      typeof change === "number" && isFinite(change) ? change : null;

    let changeClass = "ticker_home_change";
    let changeText = "0.00%";

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
      changeClass += " ticker_home_change--up";
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
