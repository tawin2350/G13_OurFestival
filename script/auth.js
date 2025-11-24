(function () {
  const API_URL = '/api';
  
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function setStatus(msg) {
    var el = document.getElementById('fb-status');
    var pop = document.getElementById('reg-status-popup');
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

  var tabLogin = qs('#tab-login');
  var tabRegister = qs('#tab-register');
  var loginSection = qs('#login-section');
  var registerSection = qs('#register-section');

  function showLogin() {
    if (tabLogin) tabLogin.classList.add('active'); 
    if (tabRegister) tabRegister.classList.remove('active');
    if (loginSection) loginSection.classList.remove('hidden'); 
    if (registerSection) registerSection.classList.add('hidden');
  }
  
  function showRegister() {
    if (tabRegister) tabRegister.classList.add('active'); 
    if (tabLogin) tabLogin.classList.remove('active');
    if (registerSection) registerSection.classList.remove('hidden'); 
    if (loginSection) loginSection.classList.add('hidden');
  }

  function updateCounts() {
    var elMember = qs('#member-count');
    var elReg = qs('#registered-count');
    
    fetch(API_URL + '/register.php')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          var count = data.count || 0;
          if (elMember) elMember.textContent = count;
          if (elReg) elReg.textContent = count;
        }
      })
      .catch(err => {
        console.error('Error fetching count:', err);
      });
    
    updateRegisterList();
  }
  
  function updateRegisterList() {
    var listEl = qs('#register-list');
    if (!listEl) return;
    
    listEl.innerHTML = '<div style="color:#888; font-size:0.98em; text-align:center;">กำลังโหลด...</div>';
    
    fetch(API_URL + '/register.php')
      .then(r => r.json())
      .then(data => {
        if (!data.success || !data.data || data.data.length === 0) {
          listEl.innerHTML = '<div style="color:#888; font-size:0.98em; text-align:center;">ยังไม่มีผู้สมัคร</div>';
          return;
        }
        
        var html = '<ul style="list-style:none; padding:0; margin:0;">';
        data.data.forEach(function(u, i) {
          html += '<li style="padding:7px 0; border-bottom:1px solid #eee; font-size:1.07em; display:flex; gap:0.7em; align-items:center;">';
          html += '<span style="font-weight:500;">' + (i+1) + '.</span>';
          html += '<span>' + (u.firstname || '-') + '</span>';
          html += '<span>' + (u.lastname || '-') + '</span>';
          html += '</li>';
        });
        html += '</ul>';
        listEl.innerHTML = html;
      })
      .catch(err => {
        console.error('Error loading register list:', err);
        listEl.innerHTML = '<div style="color:#d32f2f; text-align:center;">โหลดข้อมูลไม่สำเร็จ</div>';
      });
  }


  window.addEventListener('DOMContentLoaded', function() {
    var listEl = qs('#register-list');
    var toggleBtn = qs('#toggle-register-list');
    
    if (listEl) {
      listEl.style.display = 'block';
      updateRegisterList();
    }
    if (toggleBtn) {
      toggleBtn.style.display = 'none';
    }
    
    updateCounts();

    var regForm = qs('#register-form');
    if (regForm) {
      regForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        
        var firstname = qs('#reg-firstname').value.trim();
        var lastname = qs('#reg-lastname').value.trim();
        var nickname = qs('#reg-nickname').value.trim();
        var gender = qs('#reg-gender').value;
        var birth = qs('#reg-birth').value;
        var email = qs('#reg-email').value.trim().toLowerCase();
        var phone = qs('#reg-phone').value.trim();
        var msg = qs('#register-message');
        var btn = regForm.querySelector('button[type="submit"]');
        
        if (msg) msg.textContent = '';
        
        if (!firstname || !lastname || !nickname || !gender || !birth || !email || !phone) {
          if (msg) msg.textContent = 'กรุณากรอกข้อมูลให้ครบ';
          return;
        }
        
        if (!/^\d{9,10}$/.test(phone)) {
          if (msg) msg.textContent = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง';
          return;
        }
        
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'กำลังโหลด...';
        }
        
        var data = {
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
            updateCounts();
            if (msg) msg.textContent = '';
            setStatus('สมัครเรียบร้อยแล้ว');
            
            setTimeout(function () {
              qs('#reg-firstname').value = '';
              qs('#reg-lastname').value = '';
              qs('#reg-nickname').value = '';
              qs('#reg-gender').value = '';
              qs('#reg-birth').value = '';
              qs('#reg-email').value = '';
              qs('#reg-phone').value = '';
              
              if (btn) {
                btn.disabled = false;
                btn.textContent = 'สมัครสมาชิก';
              }
              setStatus('');
            }, 1500);
          } else {
            if (msg) msg.textContent = response.message || 'เกิดข้อผิดพลาด';
            setStatus('เกิดข้อผิดพลาด');
            if (btn) {
              btn.disabled = false;
              btn.textContent = 'สมัครสมาชิก';
            }
          }
        })
        .catch(err => {
          console.error('Error:', err);
          if (msg) msg.textContent = 'ไม่สามารถเชื่อมต่อ API ได้';
          setStatus('เกิดข้อผิดพลาด');
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'สมัครสมาชิก';
          }
        });
      });
    }
  });

  function downloadJSON() {
    fetch(API_URL + '/register.php')
      .then(r => r.json())
      .then(response => {
        if (response.success && response.data) {
          var dataStr = JSON.stringify(response.data, null, 2);
          var blob = new Blob([dataStr], { type: 'application/json' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'users.json';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      })
      .catch(err => {
        console.error('Error downloading JSON:', err);
        alert('ไม่สามารถดาวน์โหลดข้อมูลได้');
      });
  }

  var dl = qs('#download-json');
  if (dl) dl.addEventListener('click', downloadJSON);

})();
