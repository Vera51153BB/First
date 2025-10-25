/* ui_panel.js
   Логика нижней панели: статус, инфо, выезжающее меню 3x3, переключение слоёв (ОКХ/ТВ/Полки).
   ТВ (TradingView) — лениво загружается при первом нажатии на кнопку «ТВ».
*/

(() => {
	let menuOpen = false;
	let tvLoaded = false;

	function $(sel){ return document.querySelector(sel); }
	function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

	function setMenu(open){
		menuOpen = open;
		const menu = $('#slide-menu');
		const btn  = $('#btn-menu');
		if (!menu || !btn) return;

		menu.classList.toggle('open', open);
		menu.setAttribute('aria-hidden', String(!open));
		btn.setAttribute('aria-expanded', String(open));
		btn.textContent = open ? '▼' : '▲';
	}

	function toggleMenu(){ setMenu(!menuOpen); }

	function openInfo(){
		const pop = $('#info-pop');
		if (!pop) return;
		pop.classList.add('show');
		pop.setAttribute('aria-hidden','false');
	}

	function closeInfo(){
		const pop = $('#info-pop');
		if (!pop) return;
		pop.classList.remove('show');
		pop.setAttribute('aria-hidden','true');
	}

	// Статус светодиода (можно связать с реальным каналом потом)
	function setStatus(state){ // 'ok' | 'warn' | 'bad'
		const led = $('#status-led');
		const head = $('#btn-status');
		if (!led || !head) return;
		led.style.background = (state === 'ok') ? '#65d16f' : (state === 'warn') ? '#ffcc66' : '#ff6b6b';
		head.classList.remove('ok','warn','bad');
		head.classList.add(state);
	}

	// Ленивое подключение TradingView
	function ensureTradingView() {
		return new Promise((resolve) => {
			if (tvLoaded) return resolve(true);

			// Загружаем официальный lightweight скрипт
			const s = document.createElement('script');
			s.src = 'https://s3.tradingview.com/tv.js';
			s.async = true;
			s.onload = () => {
				tvLoaded = true;
				resolve(true);
			};
			// В редких CSP-случаях (Telegram webview строго) может не загрузиться — тогда показываем сообщение
			s.onerror = () => {
				console.warn('TradingView script failed to load.');
				resolve(false);
			};
			document.head.appendChild(s);
		});
	}

	function initTradingViewWidget() {
		const root = document.getElementById('tvWidgetRoot');
		if (!root) return;

		// Если TradingView не доступен — покажем fallback
		if (typeof TradingView === 'undefined' || !TradingView.widget) {
			root.innerHTML = '<div style="padding:16px;color:#93a3b8">Не удалось загрузить TradingView (вебвью или CSP). Повторите попытку или откройте в браузере.</div>';
			return;
		}

		root.innerHTML = ''; // очистим на всякий
		/* eslint-disable no-new */
		new TradingView.widget({
			container_id: 'tvWidgetRoot',
			width: '100%',
			height: '100%',
			symbol: 'BINANCE:ETHUSDT.P',   // ETH-USDT perpetual (пример; укажите нужную биржу/тикер)
			interval: '15',
			theme: 'dark',
			style: '1',
			locale: 'ru',
			enable_publishing: false,
			hide_legend: false,
			withdateranges: true,
			range: '1D',
		});
	}

	// Обработка кликов по кнопкам меню
	function onMenuClick(e){
		const btn = e.target.closest('.menu-btn');
		if (!btn) return;

		const act = btn.getAttribute('data-action');
		const key = btn.getAttribute('data-key');

		if (act === 'okx') {
			showOkxLayer();
			setMenu(false);
		}
		else if (act === 'tv') {
			ensureTradingView().then((ok) => {
				showTvLayer();
				if (ok) initTradingViewWidget();
				setMenu(false);
			});
		}
		else if (act === 'shelves') {
			showShelves();
			setMenu(false);
		}
		else if (key) {
			// Заглушки для 1..6
			console.log('Menu key pressed:', key);
			setMenu(false);
		}
	}

		function onInfoIconClick(e){
		const btn = e.target.closest('.info-icon-btn');
		if (!btn) return;

		const act = btn.getAttribute('data-action');
		if (act === 'okx') {
			showOkxLayer();
			closeInfo();
		}
		else if (act === 'tv') {
			ensureTradingView().then((ok) => {
				showTvLayer();
				if (ok) initTradingViewWidget();
				closeInfo();
			});
		}
		else if (act === 'shelves') {
			showShelves();
			closeInfo();
		}
	}

	// Инициализация
	document.addEventListener('DOMContentLoaded', () => {
		// Кнопки панели
		$('#btn-menu')?.addEventListener('click', toggleMenu);
		$('#btn-info')?.addEventListener('click', openInfo);
		$('#info-close')?.addEventListener('click', closeInfo);
		$('#slide-menu')?.addEventListener('click', onMenuClick);
				// Клики по кнопкам-иконкам в инфо-окне
		$('#info-pop')?.addEventListener('click', onInfoIconClick);


		// Клик по фоне info-pop закрывает окно
		$('#info-pop')?.addEventListener('click', (e) => {
			if (e.target.id === 'info-pop') closeInfo();
		});

		// По умолчанию показываем OKX
		showOkxLayer();
		setStatus('ok');

		// Закрываем меню «вверх свайпом» клавишей Esc
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				if (menuOpen) setMenu(false);
				closeInfo();
			}
		});

		// Если открыто внутри Telegram WebApp — можно скрыть topbar для компактности
		if (window.Telegram && window.Telegram.WebApp) {
			const tb = document.getElementById('topbar');
			if (tb) tb.style.display = 'none';
		}
	});
})();
