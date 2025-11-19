(function () {
  function qs(sel, root) { return (root || document).querySelector(sel) }
  var fbApp = null, fbDb = null, firebaseEnabled = false;

  function setFbStatus(msg) {
    var el = document.getElementById('fb-status');
    var pop = document.getElementById('fb-status-popup');
    if (el) el.textContent = msg || '';
    if (pop) {
      if (msg) {
        pop.textContent = msg;
        pop.style.display = 'block';
        setTimeout(function(){ pop.style.display = 'none'; }, 1800);
      } else {
        pop.style.display = 'none';
      }
    }
  }

  
  function renderAverageStar(avg) {
    var avgEl = qs('#star-average');
    if (!avgEl) return;
    avgEl.innerHTML = '';
    var full = Math.floor(avg);
    var half = avg - full >= 0.5 ? 1 : 0;
    for (var i = 0; i < full; i++) avgEl.innerHTML += '<span class="star selected">&#9733;</span>';
    if (half) avgEl.innerHTML += '<span class="star selected" style="color:#ffd600;opacity:0.5">&#9733;</span>';
    for (var i = full + half; i < 5; i++) avgEl.innerHTML += '<span class="star">&#9733;</span>';
    avgEl.innerHTML += ' <span style="font-size:0.95em;color:#222;">(' + avg.toFixed(2) + ')</span>';
  }

  function fetchAverageStar() {
    if (firebaseEnabled && fbDb) {
      fbDb.collection('feedbacks').get().then(function (snap) {
        var sum = 0, count = 0;
        snap.forEach(doc => {
          var r = doc.data().rating;
          if (typeof r === 'number') { sum += r; count++; }
        });
        var avg = count ? sum / count : 0;
        renderAverageStar(avg);
      });
    }
  }

  function renderFeedbackList() {
    if (!firebaseEnabled || !fbDb) return;
    var listEl = qs('#feedback-list');
    var countEl = qs('#total-feedbacks');
    if (!listEl) return;

    fbDb.collection('feedbacks').orderBy('created', 'desc').get().then(function (snap) {
      if (snap.empty) {
        listEl.innerHTML = '<p style="text-align: center; color: #999;">ยังไม่มีความคิดเห็น</p>';
        if (countEl) countEl.textContent = '0';
        return;
      }

      var html = '';
      var count = 0;
      snap.forEach(function(doc) {
        var data = doc.data();
        count++;
        var stars = '';
        for (var i = 1; i <= 5; i++) {
          stars += '<span class="star' + (i <= data.rating ? ' selected' : '') + '">&#9733;</span>';
        }
        var date = data.created ? new Date(data.created).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : '';

        html += '<div class="feedback-item">';
        html += '<div class="feedback-item-header">';
        html += '<div class="feedback-item-name">' + (data.name || 'ไม่ระบุชื่อ') + '</div>';
        html += '<div class="feedback-item-stars">' + stars + '</div>';
        html += '</div>';
        html += '<div class="feedback-item-date">' + date + '</div>';
        html += '<div class="feedback-item-comment">' + (data.comment || '') + '</div>';
        html += '</div>';
      });

      listEl.innerHTML = html;
      if (countEl) countEl.textContent = count;
    }).catch(function(err) {
      listEl.innerHTML = '<p style="text-align: center; color: #d32f2f;">เกิดข้อผิดพลาดในการโหลดความคิดเห็น</p>';
    });
  }

  window.addEventListener('DOMContentLoaded', function() {
    
    var stars = Array.from(document.querySelectorAll('.star-rating .star'));
    var ratingInput = qs('#fb-rating');
    var currentRating = 0;
    stars.forEach(function(star, idx) {
      star.addEventListener('mouseenter', function() {
        stars.forEach((s, i) => s.classList.toggle('hovered', i <= idx));
      });
      star.addEventListener('mouseleave', function() {
        stars.forEach((s, i) => s.classList.remove('hovered'));
      });
      star.addEventListener('click', function() {
        currentRating = idx + 1;
        ratingInput.value = currentRating;
        stars.forEach((s, i) => s.classList.toggle('selected', i < currentRating));
      });
    });

    
    var form = qs('#feedback-form');
    if (form) form.addEventListener('submit', function(ev) {
      ev.preventDefault();
      var rating = ratingInput.value;
      var name = qs('#fb-name').value.trim();
      var email = qs('#fb-email').value.trim().toLowerCase();
      var comment = qs('#fb-comment').value.trim();
      var msg = qs('#feedback-message');
      var btn = form.querySelector('button[type="submit"]');
      if (msg) msg.textContent = '';
      if (!rating || !name || !email || !comment) {
        if (msg) msg.textContent = 'กรุณากรอกข้อมูลให้ครบ'; return;
      }
      if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        if (msg) msg.textContent = 'อีเมลไม่ถูกต้อง'; return;
      }
      
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'กำลังโหลด...';
      }
      if (firebaseEnabled && fbDb) {
        fbDb.collection('feedbacks').add({
          rating: parseInt(rating),
          name: name,
          email: email,
          comment: comment,
          created: Date.now()
        }).then(function () {
          if (msg) msg.textContent = '';
          setFbStatus('ขอบคุณสำหรับความคิดเห็น!');
          setTimeout(function () {
            form.reset();
            stars.forEach(s => s.classList.remove('selected'));
            ratingInput.value = '';
            setFbStatus('');
            if (btn) {
              btn.disabled = false;
              btn.textContent = 'ส่งความคิดเห็น';
            }
            fetchAverageStar();
            renderFeedbackList();
          }, 1500);
        }).catch(function (err) {
          if (msg) msg.textContent = 'ข้อผิดพลาด Firebase: ' + (err && err.message || err);
          setFbStatus('เกิดข้อผิดพลาด');
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'ส่งความคิดเห็น';
          }
        });
        return;
      }
      if (msg) msg.textContent = 'ไม่สามารถเชื่อมต่อ Firebase';
      setFbStatus('เกิดข้อผิดพลาด');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'ส่งความคิดเห็น';
      }
    });
  });

    fetch('data/firebase-config.json').then(function (r) { if (!r.ok) throw new Error('no fb config'); return r.json() }).then(function (cfg) {
    if (!cfg || !cfg.apiKey || !cfg.projectId) { setFbStatus('ไฟล์ config ของ Firebase ไม่ถูกต้อง'); return }
    var tries = 0;
    function initWhenReady() {
      setFbStatus('กำลังเชื่อมต่อ Firebase...');
      if (window.firebase && window.firebase.initializeApp) {
        try {
          if (firebase.apps && firebase.apps.length) {
            fbApp = firebase.app();
          } else {
            fbApp = firebase.initializeApp(cfg);
          }
          fbDb = firebase.firestore();
          firebaseEnabled = true;
          setFbStatus('');
          fetchAverageStar();
          renderFeedbackList();
        } catch (err) {
          setFbStatus('ไม่สามารถเชื่อม Firebase: ' + (err && err.message || err));
          firebaseEnabled = false;
        }
      } else {
        tries++;
        if (tries < 10) { setTimeout(initWhenReady, 300); } else { setFbStatus('ไม่พบ Firebase SDK'); }
      }
    }
    initWhenReady();
  }).catch(function () {setTimeout(function(){ setFbStatus('ไม่พบไฟล์ firebase-config.json') }, 50); });
})();