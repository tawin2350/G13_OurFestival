(function () {
  const API_URL = 'api';

  function qs(sel) {
    return document.querySelector(sel);
  }

  const form = qs('#register-form');
  const messageEl = qs('#form-message');
  const popup = qs('#success-popup');

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = 'form-message ' + type;
  }

  function showPopup() {
    if (popup) {
      popup.classList.add('show');
      setTimeout(() => {
        popup.classList.remove('show');
        window.location.href = 'index.html';
      }, 3000);
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const firstname = qs('#firstname').value.trim();
      const lastname = qs('#lastname').value.trim();
      const nickname = qs('#nickname').value.trim();
      const gender = qs('#gender').value;
      const birth = qs('#birth').value;
      const email = qs('#email').value.trim().toLowerCase();
      const phone = qs('#phone').value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');

      showMessage('', '');

      if (!firstname || !lastname || !nickname || !gender || !birth || !email || !phone) {
        showMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'error');
        return;
      }

      if (!/^\d{9,10}$/.test(phone)) {
        showMessage('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = 'กำลังส่งข้อมูล...';
      }

      const data = {
        firstname: firstname,
        lastname: lastname,
        nickname: nickname,
        gender: gender,
        birth: birth,
        email: email,
        phone: phone
      };

      fetch(API_URL + '/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(r => r.json())
        .then(response => {
          if (response.success) {
            localStorage.setItem('isRegistered', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', firstname + ' ' + lastname);

            form.reset();
            showMessage('', '');
            showPopup();
          } else {
            showMessage(response.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.querySelector('.btn-text').textContent = 'ลงทะเบียนเลย!';
            }
          }
        })
        .catch(err => {
          console.error('Error:', err);
          showMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'ลงทะเบียนเลย!';
          }
        });
    });
  }
})();
