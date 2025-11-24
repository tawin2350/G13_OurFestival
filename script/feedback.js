(function () {
  const API_URL = '/G13_OurFestival/api';
  
  function qs(sel, root) { return (root || document).querySelector(sel) }

  function setStatus(msg) {
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
    fetch(API_URL + '/feedback.php')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          renderAverageStar(data.average || 0);
        }
      })
      .catch(err => console.error('Error fetching average:', err));
  }

  function renderFeedbackList() {
    var listEl = qs('#feedback-list');
    var countEl = qs('#total-feedbacks');
    if (!listEl) return;

    fetch(API_URL + '/feedback.php')
      .then(r => r.json())
      .then(data => {
        if (!data.success || !data.data || data.data.length === 0) {
          listEl.innerHTML = '<p style="text-align: center; color: #999;">ยังไม่มีความคิดเห็น</p>';
          if (countEl) countEl.textContent = '0';
          return;
        }

        var html = '';
        data.data.forEach(function(feedback) {
          var stars = '';
          for (var i = 1; i <= 5; i++) {
            stars += '<span class="star' + (i <= feedback.rating ? ' selected' : '') + '">&#9733;</span>';
          }
          var date = feedback.created ? new Date(feedback.created).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : '';

          html += '<div class="feedback-item">';
          html += '<div class="feedback-item-header">';
          html += '<div class="feedback-item-name">' + (feedback.name || 'ไม่ระบุชื่อ') + '</div>';
          html += '<div class="feedback-item-stars">' + stars + '</div>';
          html += '</div>';
          html += '<div class="feedback-item-date">' + date + '</div>';
          html += '<div class="feedback-item-comment">' + (feedback.comment || '') + '</div>';
          html += '</div>';
        });

        listEl.innerHTML = html;
        if (countEl) countEl.textContent = data.count || 0;
      })
      .catch(err => {
        console.error('Error loading feedbacks:', err);
        listEl.innerHTML = '<p style="text-align: center; color: #d32f2f;">เกิดข้อผิดพลาดในการโหลดความคิดเห็น</p>';
      });
  }

  window.addEventListener('DOMContentLoaded', function() {
    fetchAverageStar();
    renderFeedbackList();
    
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
        if (msg) msg.textContent = 'กรุณากรอกข้อมูลให้ครบ'; 
        return;
      }
      
      if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        if (msg) msg.textContent = 'อีเมลไม่ถูกต้อง'; 
        return;
      }
      
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'กำลังโหลด...';
      }
      
      var data = {
        rating: parseInt(rating),
        name: name,
        email: email,
        comment: comment
      };
      
      fetch(API_URL + '/feedback.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(r => r.json())
      .then(response => {
        if (response.success) {
          if (msg) msg.textContent = '';
          setStatus('ขอบคุณสำหรับความคิดเห็น!');
          
          setTimeout(function () {
            form.reset();
            stars.forEach(s => s.classList.remove('selected'));
            ratingInput.value = '';
            setStatus('');
            
            if (btn) {
              btn.disabled = false;
              btn.textContent = 'ส่งความคิดเห็น';
            }
            
            fetchAverageStar();
            renderFeedbackList();
          }, 1500);
        } else {
          if (msg) msg.textContent = response.message || 'เกิดข้อผิดพลาด';
          setStatus('เกิดข้อผิดพลาด');
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'ส่งความคิดเห็น';
          }
        }
      })
      .catch(err => {
        console.error('Error:', err);
        if (msg) msg.textContent = 'ไม่สามารถเชื่อมต่อ API ได้';
        setStatus('เกิดข้อผิดพลาด');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'ส่งความคิดเห็น';
        }
      });
    });
  });
})();
