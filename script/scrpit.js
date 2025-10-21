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
});
