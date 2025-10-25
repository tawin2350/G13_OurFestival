(function() {
  const secretCode = ['a', 'd', 'm', 'i', 'n'];
  let userInput = [];
  let timer;

  function resetCode() {
    userInput = [];
    clearTimeout(timer);
  }

  function checkCode() {
    if (userInput.length === secretCode.length) {
      const match = userInput.every((key, index) => key === secretCode[index]);
      
      if (match) {
        showSecretAnimation();
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 1500);
      }
      resetCode();
    }
  }

  function showSecretAnimation() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s;
    `;

    const message = document.createElement('div');
    message.style.cssText = `
      color: white;
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      animation: pulse 0.5s infinite;
      padding: 20px;
    `;
    message.textContent = '🔓 Admin Access Granted';

    overlay.appendChild(message);
    document.body.appendChild(overlay);
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
  }
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    if (key.length === 1 && key >= 'a' && key <= 'z') {
      userInput.push(key);
      if (userInput.length > secretCode.length) {
        userInput.shift();
      }

      clearTimeout(timer);
      timer = setTimeout(resetCode, 6000);

      checkCode();
    }
  });
  const logo = document.querySelector('.logo');
  if (logo) {
    let tapCount = 0;
    let tapTimer;

    logo.addEventListener('click', (e) => {
      e.preventDefault();
      tapCount++;
      logo.style.animation = 'none';
      setTimeout(() => {
        logo.style.animation = 'logoShake 0.3s';
      }, 10);

      if (tapCount === 5) {
        showSecretAnimation();
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 1500);
        tapCount = 0;
        clearTimeout(tapTimer);
      } else {
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 2000);
      }
    });
    const style = document.createElement('style');
    style.textContent = `
      @keyframes logoShake {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
      }
    `;
    document.head.appendChild(style);
  }
  const footer = document.querySelector('footer');
  if (footer) {
    let clickCount = 0;
    let clickTimer;

    footer.addEventListener('click', () => {
      clickCount++;
      
      if (clickCount === 3) {
        const hint = document.createElement('div');
        hint.style.cssText = `
          position: fixed;
          bottom: 100px;
          right: 30px;
          background: #333;
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          font-size: 0.9rem;
          z-index: 9999;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          animation: slideInRight 0.5s;
        `;
        hint.textContent = '💡 Hint: Type "ADMIN" or tap logo 5 times...';
        
        document.body.appendChild(hint);
        
        setTimeout(() => {
          hint.style.animation = 'slideOutRight 0.5s';
          setTimeout(() => hint.remove(), 500);
        }, 3000);

        clickCount = 0;
      }

      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 1000);
    });
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
