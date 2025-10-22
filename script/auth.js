(function () {
  function qs(sel, root) { return (root || document).querySelector(sel) }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)) }

  function setFbStatus(msg) {
    var el = document.getElementById('fb-status');
    if (el) el.textContent = msg || '';
  }

  var tabLogin = qs('#tab-login');
  var tabRegister = qs('#tab-register');
  var loginSection = qs('#login-section');
  var registerSection = qs('#register-section');
  var toRegister = qs('#to-register');
  var toLogin = qs('#to-login');

  function showLogin() {
    if (tabLogin) tabLogin.classList.add('active'); if (tabRegister) tabRegister.classList.remove('active');
    if (loginSection) loginSection.classList.remove('hidden'); if (registerSection) registerSection.classList.add('hidden');
  }
  function showRegister() {
    if (tabRegister) tabRegister.classList.add('active'); if (tabLogin) tabLogin.classList.remove('active');
    if (registerSection) registerSection.classList.remove('hidden'); if (loginSection) loginSection.classList.add('hidden');
  }
  var STORAGE_KEY = 'ourfestival_users_v1';
  var firebaseEnabled = false;
  var fbApp = null;
  var fbAuth = null;
  var fbDb = null;

  function loadUsers() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      return [];
    } catch(e) { return [] }
  }
  function saveUsers(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }

  function updateCounts() {
    var elMember = qs('#member-count');
    var elReg = qs('#registered-count');
    if (firebaseEnabled && fbDb) {
      fbDb.collection('users').get().then(function (snap) {
        var n = snap.size || 0;
        if (elMember) elMember.textContent = n;
        if (elReg) elReg.textContent = n;
      }).catch(function () {
        var users = loadUsers(); if (elMember) elMember.textContent = users.length; if (elReg) elReg.textContent = users.length;
      });
      return;
    }
    var users = loadUsers();
    if (elMember) elMember.textContent = users.length;
    if (elReg) elReg.textContent = users.length;
  }
  var regForm = qs('#register-form');
    window.addEventListener('DOMContentLoaded', function() {
      var regForm = qs('#register-form');
      if (regForm) regForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var firstname = qs('#reg-firstname').value.trim();
        var lastname = qs('#reg-lastname').value.trim();
        var nickname = qs('#reg-nickname').value.trim();
        var gender = qs('#reg-gender').value;
        var birth = qs('#reg-birth').value;
        var email = qs('#reg-email').value.trim().toLowerCase();
        var phone = qs('#reg-phone').value.trim();
        var msg = qs('#register-message');
        if (msg) msg.textContent = '';
        if (!firstname || !lastname || !nickname || !gender || !birth || !email || !phone) {
          if (msg) msg.textContent = 'กรุณากรอกข้อมูลให้ครบ'; return;
        }
        if (!/^\d{9,10}$/.test(phone)) {
          if (msg) msg.textContent = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง'; return;
        }

        if (firebaseEnabled && fbDb) {
          fbDb.collection('users').add({
            firstname: firstname,
            lastname: lastname,
            nickname: nickname,
            gender: gender,
            birth: birth,
            email: email,
            phone: phone,
            created: Date.now()
          }).then(function () {
            updateCounts();
            if (msg) msg.textContent = 'สมัครเรียบร้อยแล้ว (Firebase)';
            setTimeout(function () {
              qs('#reg-firstname').value = '';
              qs('#reg-lastname').value = '';
              qs('#reg-nickname').value = '';
              qs('#reg-gender').value = '';
              qs('#reg-birth').value = '';
              qs('#reg-email').value = '';
              qs('#reg-phone').value = '';
            }, 900);
          }).catch(function (err) {
            if (msg) msg.textContent = 'ข้อผิดพลาด Firebase: ' + (err && err.message || err);
          });
          return;
        }

        var users = loadUsers();
        if (users.find(u => u.email === email)) { if (msg) msg.textContent = 'อีเมลนี้ถูกใช้แล้ว'; return }
        users.push({
          firstname: firstname,
          lastname: lastname,
          nickname: nickname,
          gender: gender,
          birth: birth,
          email: email,
          phone: phone,
          created: Date.now()
        });
        saveUsers(users);
        updateCounts();
        if (msg) msg.textContent = 'สมัครเรียบร้อยแล้ว';
        setTimeout(function () {
          qs('#reg-firstname').value = '';
          qs('#reg-lastname').value = '';
          qs('#reg-nickname').value = '';
          qs('#reg-gender').value = '';
          qs('#reg-birth').value = '';
          qs('#reg-email').value = '';
          qs('#reg-phone').value = '';
        }, 900);
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
              console.info('Re-using existing firebase app');
            } else {
              fbApp = firebase.initializeApp(cfg);
              console.info('Initialized firebase app', fbApp && fbApp.name);
            }
            fbAuth = firebase.auth();
            fbDb = firebase.firestore();
            firebaseEnabled = true;
            try { console.debug('Firebase options:', firebase.app().options); } catch (e) {}
            fbDb.collection('users').onSnapshot(function () { updateCounts() }, function () { updateCounts() });
            setFbStatus('');
          } catch (err) {
            console.warn('fb init failed', err);
            var msgEl = qs('#register-message');
            if (msgEl) msgEl.textContent = 'ไม่สามารถเชื่อม Firebase: ' + (err && err.message || err);
            setFbStatus('ไม่สามารถเชื่อม Firebase: ' + (err && err.message || err));
            firebaseEnabled = false;
          }
        } else {
          tries++;
          if (tries < 10) { setTimeout(initWhenReady, 300); } else { console.warn('firebase SDK not available'); var msgEl = qs('#register-message'); if (msgEl) msgEl.textContent = 'ไม่พบ Firebase SDK'; setFbStatus('ไม่พบ Firebase SDK'); }
        }
      }
      initWhenReady();
    }).catch(function () {setTimeout(function(){ setFbStatus('ไม่พบไฟล์ firebase-config.json (จะใช้ localStorage แทน)') }, 50); });
  })();

  function downloadJSON() {
    var data = localStorage.getItem(STORAGE_KEY) || '[]';
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'users.json'; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  var dl = qs('#download-json'); if (dl) dl.addEventListener('click', downloadJSON);
;
