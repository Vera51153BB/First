// Файл: First/assets/js/okx_chart.js
const params = new URLSearchParams({
symbol,
interval,
hide_top_toolbar: "1",
hide_legend: "1",
hide_side_toolbar: "1",
allow_symbol_change: "0",
saveimage: "0",
theme: "dark",
style: "1",
calendar: "0",
hideideas: "1",
toolbarbg: "#0b0f1a",
studies: "",
locale: "en"
});
return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
}


function renderIframe(src){
host.innerHTML = '';
const wrap = document.createElement('div');
wrap.className = 'tv-wrap';
const iframe = document.createElement('iframe');
iframe.loading = 'lazy';
iframe.referrerPolicy = 'no-referrer-when-downgrade';
iframe.allow = 'fullscreen; clipboard-write';
iframe.src = src;
wrap.appendChild(iframe);
host.appendChild(wrap);
}


function setChart(mode){
// Скрыть VP-заглушку по умолчанию
vpSection.hidden = true;


if(mode === 'okx'){
// OKX тест: BTC/USDT SWAP
const symbol = 'OKX:BTCUSDT.P'; // ПРЕДПОЛОЖЕНИЕ: нужный тикер свопа .P / .SWAP
titleEl.textContent = 'OKX • BTC/USDT (SWAP)';
renderIframe(tvEmbedSrc(symbol, '60'));
return;
}
if(mode === 'tv'){
// TradingView тест: ETH/USDT SWAP
const symbol = 'OKX:ETHUSDT.P'; // ПРЕДПОЛОЖЕНИЕ: уточните точное обозначение
titleEl.textContent = 'TradingView • ETH/USDT (SWAP)';
renderIframe(tvEmbedSrc(symbol, '60'));
return;
}
if(mode === 'vp'){
// Заглушка Volume Profile
titleEl.textContent = 'Volume Profile (заглушка)';
host.innerHTML = '';
vpSection.hidden = false;
return;
}
}


// Экспорт в глобалку для ui_panel.js
window.__chart = { setChart };


// Инициализация по умолчанию
setChart('okx');
})();
