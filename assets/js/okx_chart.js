/* okx_chart.js
   Лёгкая отрисовка свечей на Canvas (заглушка для OKX BTC-USDT-SWAP).
   Позже сюда подключим реальное API OKX. Сделано максимально нетяжело.

   Публичные функции:
   - initOkxCanvas(canvasEl)
   - showOkxLayer(), showTvLayer(), showShelves()
   - setChartName(name)
*/

(() => {
	// ----------- Состояние -----------
	let canvas, ctx, dpi = 1;
	let currentLayer = 'okx'; // okx | tv | shelves
	let rafId = null;

	// Генерация фейковых свечей (N точек)
	function genFakeCandles(n = 120, start = 68000) {
		const out = [];
		let price = start;
		for (let i = 0; i < n; i++) {
			const drift = (Math.random() - 0.5) * 400;
			const open = price;
			const close = price + drift;
			const high = Math.max(open, close) + Math.random() * 120;
			const low  = Math.min(open, close) - Math.random() * 120;
			out.push({ o: open, h: high, l: low, c: close });
			price = close + (Math.random() - 0.5) * 100;
		}
		return out;
	}

	const data = genFakeCandles();

	// ----------- Рендер -----------
	function resizeCanvas() {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		dpi = window.devicePixelRatio || 1;
		canvas.width = Math.max(1, Math.floor(rect.width * dpi));
		canvas.height = Math.max(1, Math.floor(rect.height * dpi));
		ctx = canvas.getContext('2d');
		ctx.setTransform(dpi, 0, 0, dpi, 0, 0); // логические координаты в CSS-пикселях
	}

	function findMinMax(arr) {
		let lo = Infinity, hi = -Infinity;
		for (const k of arr) {
			if (k.l < lo) lo = k.l;
			if (k.h > hi) hi = k.h;
		}
		return [lo, hi];
	}

	function yScaleFactory(lo, hi, h, pad = 10) {
		const span = Math.max(1, hi - lo);
		return (price) => {
			const t = (price - lo) / span;
			return Math.round((h - pad) - (h - pad * 2) * t);
		};
	}

	function render() {
		if (!canvas || !ctx) return;

		const w = canvas.clientWidth;
		const h = canvas.clientHeight;

		// bg
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = '#0b0e14';
		ctx.fillRect(0, 0, w, h);

		// рамка
		ctx.strokeStyle = 'rgba(255,255,255,.08)';
		ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

		// сетка
		ctx.strokeStyle = 'rgba(255,255,255,.06)';
		ctx.lineWidth = 1;
		const rows = 5;
		for (let i = 1; i < rows; i++) {
			const y = Math.round((h / rows) * i) + 0.5;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}

		// свечи
		const [lo, hi] = findMinMax(data);
		const y = yScaleFactory(lo, hi, h, 12);

		const cw = Math.max(3, Math.floor(w / Math.max(30, data.length))); // ширина свечи
		const gap = Math.max(1, Math.floor(cw * 0.25));
		const bodyW = Math.max(1, cw - gap);

		let x = Math.max(2, w - (data.length * cw) - 6); // прижимаем к правому краю
		for (const k of data) {
			const openY = y(k.o);
			const closeY = y(k.c);
			const highY = y(k.h);
			const lowY = y(k.l);
			const up = k.c >= k.o;

			// тень
			ctx.strokeStyle = 'rgba(255,255,255,.35)';
			ctx.beginPath();
			ctx.moveTo(x + Math.floor(bodyW / 2), highY);
			ctx.lineTo(x + Math.floor(bodyW / 2), lowY);
			ctx.stroke();

			// тело
			ctx.fillStyle = up ? '#65d16f' : '#ff6b6b';
			const top = Math.min(openY, closeY);
			const bh = Math.max(1, Math.abs(openY - closeY));
			ctx.fillRect(x, top, bodyW, bh);

			x += cw;
		}

		// инфо-текст
		ctx.fillStyle = 'rgba(255,255,255,.5)';
		ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
		ctx.fillText('OKX · BTC-USDT-SWAP (demo)', 10, 18);
	}

	function loop() {
		render();
		// легкая анимация: «дышит» последняя свеча как будто тикает
		const last = data[data.length - 1];
		last.c += (Math.random() - 0.5) * 8;
		last.h = Math.max(last.h, last.c);
		last.l = Math.min(last.l, last.c);
		rafId = requestAnimationFrame(loop);
	}

	// ----------- Публичные функции -----------
	function initOkxCanvas(canvasEl) {
		canvas = canvasEl;
		resizeCanvas();
		window.addEventListener('resize', resizeCanvas, { passive:true });
		loop();
	}

	function setChartName(name) {
		const el = document.getElementById('chart-name');
		if (el) el.textContent = name;
	}

	function showLayer(which) {
		currentLayer = which;
		const $okx = document.getElementById('okxCanvas');
		const $tv  = document.getElementById('tvContainer');
		const $sh  = document.getElementById('shelvesPlaceholder');

		if (!$okx || !$tv || !$sh) return;

		$okx.hidden = which !== 'okx';
		$tv.hidden  = which !== 'tv';
		$sh.hidden  = which !== 'shelves';

		if (which === 'okx') setChartName('OKX · BTC-USDT-SWAP');
		if (which === 'tv')  setChartName('TV · ETH-USDT-SWAP');
		if (which === 'shelves') setChartName('Полки объёма · заглушка');
	}

	// Упрощённые публичные алиасы
	window.showOkxLayer = () => showLayer('okx');
	window.showTvLayer  = () => showLayer('tv');
	window.showShelves  = () => showLayer('shelves');
	window.setChartName = setChartName;

	// Инициализация при загрузке DOM
	document.addEventListener('DOMContentLoaded', () => {
		const canvasEl = document.getElementById('okxCanvas');
		if (canvasEl) initOkxCanvas(canvasEl);

		// Если открыто в Telegram WebApp — можно чуть скорректировать UI
		if (window.Telegram && window.Telegram.WebApp) {
			document.body.classList.add('tg');
			try {
				window.Telegram.WebApp.ready();
				// выставим цвет темы под тёмный фон
				window.Telegram.WebApp.setBackgroundColor('#0b0e14');
				window.Telegram.WebApp.setHeaderColor('secondary_bg_color');
			} catch(e){}
		}
	});

})();
