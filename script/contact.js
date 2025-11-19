(function() {
  'use strict';

  var fbApp = null, fbDb = null, firebaseEnabled = false;

  window.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const statusDiv = document.getElementById('contact-status');

    if (!contactForm) return;

    fetch('data/firebase-config.json')
      .then(function(r) { 
        if (!r.ok) throw new Error('no fb config'); 
        return r.json(); 
      })
      .then(function(cfg) {
        if (!cfg || !cfg.apiKey || !cfg.projectId) {
          console.warn('Firebase config invalid');
          return;
        }
        var tries = 0;
        function initWhenReady() {
          if (window.firebase && window.firebase.initializeApp) {
            try {
              if (firebase.apps && firebase.apps.length) {
                fbApp = firebase.app();
              } else {
                fbApp = firebase.initializeApp(cfg);
              }
              fbDb = firebase.firestore();
              firebaseEnabled = true;
              console.log('Firebase connected for contact form');
            } catch (err) {
              console.error('Firebase init error:', err);
              firebaseEnabled = false;
            }
          } else {
            tries++;
            if (tries < 10) { 
              setTimeout(initWhenReady, 300); 
            } else { 
              console.error('Firebase SDK not found');
            }
          }
        }
        initWhenReady();
      })
      .catch(function(err) {
        console.warn('Firebase config not found:', err);
      });

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim().toLowerCase();
      const phone = document.getElementById('contact-phone').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (!name || !email || !subject || !message) {
        showStatus('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showStatus('รูปแบบอีเมลไม่ถูกต้อง', 'error');
        return;
      }

      if (phone && !/^[0-9]{9,10}$/.test(phone)) {
        showStatus('เบอร์โทรศัพท์ไม่ถูกต้อง', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังส่ง...';

      const contactData = {
        name: name,
        email: email,
        phone: phone || '-',
        subject: subject,
        message: message,
        created: Date.now()
      };

      if (firebaseEnabled && fbDb) {
        fbDb.collection('contacts').add(contactData)
          .then(function() {
            showStatus('ส่งข้อความเรียบร้อยแล้ว! เราจะติดต่อกลับโดยเร็วที่สุด', 'success');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'ส่งข้อความ';
            setTimeout(function() {
              hideStatus();
            }, 5000);
          })
          .catch(function(err) {
            console.error('Error saving contact:', err);
            showStatus('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'ส่งข้อความ';
          });
      } else {
        console.log('Contact form submitted (Firebase not available):', contactData);
        showStatus('ส่งข้อความเรียบร้อยแล้ว! (Firebase ไม่พร้อมใช้งาน)', 'success');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'ส่งข้อความ';
        setTimeout(function() {
          hideStatus();
        }, 5000);
      }
    });

    function showStatus(message, type) {
      if (!statusDiv) return;
      statusDiv.textContent = message;
      statusDiv.className = 'contact-status ' + type;
      statusDiv.style.display = 'block';
    }

    function hideStatus() {
      if (!statusDiv) return;
      statusDiv.style.display = 'none';
      statusDiv.className = 'contact-status';
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  });
})();
