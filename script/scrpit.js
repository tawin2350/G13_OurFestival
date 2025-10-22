document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('.section.zone').forEach(function (zone) {
		var row = zone.querySelector('.card-row');
		var btnPrev = zone.querySelector('.carousel-prev');
		var btnNext = zone.querySelector('.carousel-next');
		if (!row || !btnPrev || !btnNext) return;

		var cards = Array.from(row.querySelectorAll('.shop-card'));
		if (!cards.length) return;

		function cardWidth() {
			var card = row.querySelector('.shop-card');
			if (!card) return row.clientWidth;
			var gap = parseFloat(window.getComputedStyle(row).gap) || 0;
			return Math.round(card.getBoundingClientRect().width + gap);
		}

		function scrollToIndex(i) {
			var w = row.getBoundingClientRect().width;
			var card = cards[i];
			if (!card) return;
			var cardRect = card.getBoundingClientRect();
			var rowRect = row.getBoundingClientRect();
			var target = (card.offsetLeft + cardRect.width / 2) - (row.clientWidth / 2);
			row.scrollTo({ left: target, behavior: 'smooth' });
			cards.forEach(function (c) { c.classList.toggle('is-centered', c === card); });
		}

		function getCenteredIndex() {
			var center = row.scrollLeft + row.clientWidth / 2;
			var best = 0;
			var bestDiff = Infinity;
			cards.forEach(function (c, idx) {
				var cCenter = c.offsetLeft + c.getBoundingClientRect().width / 2;
				var diff = Math.abs(cCenter - center);
				if (diff < bestDiff) { bestDiff = diff; best = idx; }
			});
			return best;
		}

		btnPrev.addEventListener('click', function () {
			var idx = getCenteredIndex();
			var next = Math.max(0, idx - 1);
			scrollToIndex(next);
		});
		btnNext.addEventListener('click', function () {
			var idx = getCenteredIndex();
			var next = Math.min(cards.length - 1, idx + 1);
			scrollToIndex(next);
		});

		zone.addEventListener('keydown', function (ev) {
			if (ev.key === 'ArrowLeft') { ev.preventDefault(); btnPrev.click(); }
			if (ev.key === 'ArrowRight') { ev.preventDefault(); btnNext.click(); }
		});

		var autoplayInterval = 3000;
		var autoplayTimer = null;
		function startAutoplay() {
			stopAutoplay();
			autoplayTimer = setInterval(function () {
				var idx = getCenteredIndex();
				var next = (idx + 1) % cards.length;
				scrollToIndex(next);
			}, autoplayInterval);
		}
		function stopAutoplay() {
			if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
		}

		zone.addEventListener('mouseenter', stopAutoplay);
		zone.addEventListener('mouseleave', startAutoplay);
		zone.addEventListener('focusin', stopAutoplay);
		zone.addEventListener('focusout', startAutoplay);

		scrollToIndex(0);
		setTimeout(startAutoplay, 600);

		var resizeTimer = null;
		window.addEventListener('resize', function () {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function () { scrollToIndex(getCenteredIndex()); }, 150);
		});
	});

	var coverflows = document.querySelectorAll('.coverflow');
	coverflows.forEach(function (cf) {
		var track = cf.querySelector('.coverflow-track');
		var cards = Array.from(cf.querySelectorAll('.cf-card'));
		var btnPrev = cf.querySelector('.cf-prev');
		var btnNext = cf.querySelector('.cf-next');
		var splitVisual = cf.closest('.split-visual');
		var vt = splitVisual ? splitVisual.querySelector('.visual-text') : null;
		var vtEyebrow = vt ? vt.querySelector('.eyebrow') : null;
		var vtH = vt ? vt.querySelector('h1') : null;
		var vtSub = vt ? vt.querySelector('.sub') : null;
		if (!track || cards.length === 0) return;

		var active = 0;
		var transitioning = false;
		var autoplayMs = 3500;
		var timer = null;

		function classAt(idx, cls) {
			cards[idx].classList.add(cls);
		}

		function clearClasses() {
			cards.forEach(function (c) {
				c.classList.remove('is-center','is-left1','is-right1','is-left2','is-right2','is-hidden');
			});
		}

		function mod(i, n) { return (i % n + n) % n; }

		function applyPositions(centerIdx) {
			clearClasses();
			var n = cards.length;
			var left1  = mod(centerIdx - 1, n);
			var right1 = mod(centerIdx + 1, n);
			var left2  = mod(centerIdx - 2, n);
			var right2 = mod(centerIdx + 2, n);

			classAt(centerIdx, 'is-center');
			classAt(left1, 'is-left1');
			classAt(right1, 'is-right1');
			if (n > 4) { classAt(left2, 'is-left2'); classAt(right2, 'is-right2'); }

			for (var i = 0; i < n; i++) {
				if (i !== centerIdx && i !== left1 && i !== right1 && (n <= 4 || (i !== left2 && i !== right2))) {
					cards[i].classList.add('is-hidden');
				}
			}
		}

		function goto(index) {
			if (transitioning) return;
			transitioning = true;
			active = mod(index, cards.length);
			applyPositions(active);
			updateText(active);
			setTimeout(function(){ transitioning = false; }, 700);
		}

		function next() { goto(active + 1); }
		function prev() { goto(active - 1); }

		function start() {
			stop();
			timer = setInterval(next, autoplayMs);
		}
		function stop() {
			if (timer) { clearInterval(timer); timer = null; }
		}

		if (btnNext) btnNext.addEventListener('click', next);
		if (btnPrev) btnPrev.addEventListener('click', prev);
		cf.addEventListener('mouseenter', stop);
		cf.addEventListener('mouseleave', start);
		cf.addEventListener('focusin', stop);
		cf.addEventListener('focusout', start);
		track.addEventListener('keydown', function (ev) {
			if (ev.key === 'ArrowLeft') { ev.preventDefault(); prev(); }
			if (ev.key === 'ArrowRight') { ev.preventDefault(); next(); }
		});

		applyPositions(active);
		updateText(active);
		setTimeout(start, 800);
	});

	function updateText(idx) {
		var allCF = document.querySelectorAll('.coverflow');
		if (!allCF.length) return;
		allCF.forEach(function(cf){
			var splitVisual = cf.closest('.split-visual');
			var vt = splitVisual ? splitVisual.querySelector('.visual-text') : null;
			var vtEyebrow = vt ? vt.querySelector('.eyebrow') : null;
			var vtH = vt ? vt.querySelector('h1') : null;
			var vtSub = vt ? vt.querySelector('.sub') : null;
			var cards = Array.from(cf.querySelectorAll('.cf-card'));
			var activeCard = cf.querySelector('.cf-card.is-center');
			if (!vt || !activeCard) return;
			var eb = activeCard.getAttribute('data-eyebrow');
			var hd = activeCard.getAttribute('data-heading') || activeCard.getAttribute('data-title');
			var sb = activeCard.getAttribute('data-sub');
			vt.classList.add('vt-fade');
			setTimeout(function(){
				if (vtEyebrow && eb) vtEyebrow.textContent = eb;
				if (vtH && hd) vtH.textContent = hd;
				if (vtSub && sb) vtSub.textContent = sb;
				vt.classList.remove('vt-fade');
			}, 120);
		});
	}
});
