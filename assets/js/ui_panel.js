// Файл: First/assets/js/ui_panel.js
// фиксация высоты на iOS/Android (без прокрутки).


(function(){
const tabs = Array.from(document.querySelectorAll('#footerbar .tab'));
const notifyBtn = document.getElementById('btn-notify');
const infoBtn = document.getElementById('btn-info');
const pop = document.getElementById('notify-pop');


// Кнопки первой строки поповера
const btnsPop = Array.from(pop.querySelectorAll('[data-pop]'));


// 1) Переключение вкладок снизу
tabs.forEach(b => b.addEventListener('click', () => {
const tab = b.dataset.tab;
tabs.forEach(x => x.classList.toggle('is-active', x === b));
window.__chart?.setChart(tab);
}));


// 2) Кнопка «уведомление» (треугольник) — открыть dialog
notifyBtn.addEventListener('click', () => {
try{ pop.showModal(); }catch{ /* старые браузеры */ }
});


// 3) Кнопки первой строки в поповере — дублируют вкладки
btnsPop.forEach(b => b.addEventListener('click', (e) => {
const tab = b.dataset.pop;
// Закрыть поповер и переключить вкладку
setTimeout(() => {
if(pop.open) pop.close();
const t = tabs.find(x => x.dataset.tab === tab);
if(t){ t.click(); }
}, 0);
}));


// 4) Кнопка «i» — краткая подсказка
infoBtn.addEventListener('click', () => {
const msg = [
'• OKX — тестовый своп BTC/USDT (через TradingView embed)\n',
'• TradingView — тестовый своп ETH/USDT\n',
'• Volume Profile — временная заглушка (ссылка).\n',
'\nОсновной кейс — открытие внутри Telegram Web App, но страница одинаково работает и в браузере на десктопе/мобиле.'
].join('');
try{ pop.showModal(); }catch{}
// Небольшой трюк: подсветить первую строку
});


// 5) Вписывание по высоте без прокрутки (в т.ч. iOS Safari)
function applyVhFix(){
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh * 100}px`);
}
window.addEventListener('resize', applyVhFix);
window.addEventListener('orientationchange', applyVhFix);
applyVhFix();


// 6) Интеграция Telegram Web App (если открыто внутри ТГ)
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if(tg){
try{
tg.expand(); // Разворачиваем на всю высоту
tg.disableVerticalSwipes && tg.disableVerticalSwipes(); // iOS визуальные ухищрения
// Подхватываем тему ТГ (опционально можно применить цвета)
document.documentElement.style.setProperty('--bg', tg.themeParams?.bg_color || '#0b0f1a');
}catch(e){ /* no-op */ }
}
})();
