document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.section.zone').forEach(function (zone) {
    var row = zone.querySelector('.card-row');
    var btnPrev = zone.querySelector('.carousel-prev');
    var btnNext = zone.querySelector('.carousel-next');
    if (!row || !btnPrev || !btnNext) return;

    var cards = Array.from(row.querySelectorAll('.shop-card'));
    if (!cards.length) return;

    function scrollToIndex(i) {
      var card = cards[i];
      if (!card) return;
      var target = (card.offsetLeft + card.getBoundingClientRect().width / 2) - (row.clientWidth / 2);
      row.scrollTo({ left: target, behavior: 'smooth' });
      cards.forEach(function (c) { c.classList.toggle('is-centered', c === card); });
    }

    function getCenteredIndex() {
      var center = row.scrollLeft + row.clientWidth / 2;
      var best = 0, bestDiff = Infinity;
      cards.forEach(function (c, idx) {
        var cCenter = c.offsetLeft + c.getBoundingClientRect().width / 2;
        var diff = Math.abs(cCenter - center);
        if (diff < bestDiff) { bestDiff = diff; best = idx; }
      });
      return best;
    }

    btnPrev.addEventListener('click', function () {
      var idx = getCenteredIndex();
      scrollToIndex(Math.max(0, idx - 1));
    });
    btnNext.addEventListener('click', function () {
      var idx = getCenteredIndex();
      scrollToIndex(Math.min(cards.length - 1, idx + 1));
    });

    zone.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); btnPrev.click(); }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); btnNext.click(); }
    });

    var autoplayTimer = null;
    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () {
        var idx = getCenteredIndex();
        scrollToIndex((idx + 1) % cards.length);
      }, 3000);
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

  document.querySelectorAll('.coverflow').forEach(function (cf) {
    var track = cf.querySelector('.coverflow-track');
    var cards = Array.from(cf.querySelectorAll('.cf-card'));
    var btnPrev = cf.querySelector('.cf-prev');
    var btnNext = cf.querySelector('.cf-next');
    if (!track || !cards.length) return;

    var splitVisual = cf.closest('.split-visual');
    var vt = splitVisual ? splitVisual.querySelector('.visual-text') : null;
    var vtEyebrow = vt ? vt.querySelector('.eyebrow') : null;
    var vtH = vt ? vt.querySelector('h1') : null;
    var vtSub = vt ? vt.querySelector('.sub') : null;

    var active = 0;
    var transitioning = false;
    var timer = null;
    var autoplayMs = 3500;

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

      cards[centerIdx].classList.add('is-center');
      cards[left1].classList.add('is-left1');
      cards[right1].classList.add('is-right1');
      if (n > 4) {
        cards[left2].classList.add('is-left2');
        cards[right2].classList.add('is-right2');
      }
      for (var i = 0; i < n; i++) {
        if (i !== centerIdx && i !== left1 && i !== right1 && (n <= 4 || (i !== left2 && i !== right2))) {
          cards[i].classList.add('is-hidden');
        }
      }
    }

    function updateTextFrom(card) {
      if (!vt || !card) return;
      var eb = card.getAttribute('data-eyebrow');
      var hd = card.getAttribute('data-heading') || card.getAttribute('data-title');
      var sb = card.getAttribute('data-sub');
      vt.classList.add('vt-fade');
      setTimeout(function(){
        if (vtEyebrow && eb) vtEyebrow.textContent = eb;
        if (vtH && hd) vtH.textContent = hd;
        if (vtSub && sb) vtSub.textContent = sb;
        vt.classList.remove('vt-fade');
      }, 120);
    }

    function goto(index) {
      if (transitioning) return;
      transitioning = true;
      active = mod(index, cards.length);
      applyPositions(active);
      updateTextFrom(cards[active]);
      setTimeout(function(){ transitioning = false; }, 700);
    }

    function next() { goto(active + 1); }
    function prev() { goto(active - 1); }

    function start() { stop(); timer = setInterval(next, autoplayMs); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

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
    updateTextFrom(cards[active]);
    setTimeout(start, 800);
  });
});
