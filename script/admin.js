const ADMIN_PASSWORD = '1212312121zaza';

let fbApp = null;
let fbDb = null;
let firebaseEnabled = false;
let currentDeleteId = null;
let currentDeleteType = null;
let allUsers = [];
let allFeedback = [];
fetch('data/firebase-config.json')
  .then(r => r.json())
  .then(cfg => {
    console.log('Firebase config loaded');
    let tries = 0;
    
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
          console.log('✅ Firebase connected successfully');
          if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            showAdminPanel();
          }
        } catch (err) {
          console.error('❌ Firebase error:', err);
          firebaseEnabled = false;
        }
      } else {
        tries++;
        if (tries < 20) {
          setTimeout(initWhenReady, 300);
        } else {
          console.error('❌ Firebase SDK not loaded');
        }
      }
    }
    initWhenReady();
  })
  .catch(err => {
    console.error('❌ Config error:', err);
    alert('ไม่สามารถโหลดการตั้งค่า Firebase ได้');
  });
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.getElementById('admin-password').value;
  const errorEl = document.getElementById('login-error');

  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    showAdminPanel();
  } else {
    errorEl.textContent = '❌ รหัสผ่านไม่ถูกต้อง';
    document.getElementById('admin-password').value = '';
  }
});
document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('adminLoggedIn');
  location.reload();
});
function showAdminPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  loadData();
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
  });
});
function loadData() {
  console.log('loadData called, firebaseEnabled:', firebaseEnabled);
  
  if (!firebaseEnabled || !fbDb) {
    console.log('Waiting for Firebase...');
    setTimeout(loadData, 500);
    return;
  }
  
  console.log('Starting to load data...');
  loadUsers();
  loadFeedback();
}


function loadUsers() {
  console.log('Loading users...');
  fbDb.collection('users').get()
    .then(snapshot => {
      allUsers = [];
      console.log('Users found:', snapshot.size);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('User data:', data);
        allUsers.push({ id: doc.id, ...data });
      });
      allUsers.sort((a, b) => (b.created || 0) - (a.created || 0));
      
      updateStats();
      displayUsers(allUsers);
    })
    .catch(err => {
      console.error('Error loading users:', err);
      document.getElementById('users-tbody').innerHTML = 
        '<tr><td colspan="6" class="no-data">ไม่สามารถโหลดข้อมูลได้: ' + err.message + '</td></tr>';
    });
}

function displayUsers(users) {
  const tbody = document.getElementById('users-tbody');
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">📭 ยังไม่มีผู้ลงทะเบียน<br><small>ข้อมูลจะแสดงที่นี่เมื่อมีคนลงทะเบียนผ่านหน้า register.html</small></td></tr>';
    return;
  }

  tbody.innerHTML = users.map((user, index) => {
    const fullName = (user.firstname && user.lastname) 
      ? `${user.firstname} ${user.lastname}` 
      : (user.name || '-');
    
    return `
    <tr>
      <td>${index + 1}</td>
      <td>${fullName}</td>
      <td>${user.email || '-'}</td>
      <td>${user.phone || '-'}</td>
      <td>${user.created ? new Date(user.created).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="editUser('${user.id}')">✏️ แก้ไข</button>
          <button class="btn-delete" onclick="deleteUser('${user.id}', '${fullName.replace(/'/g, "\\'")}')">🗑️ ลบ</button>
        </div>
      </td>
    </tr>
    `;
  }).join('');
}

document.getElementById('search-users').addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = allUsers.filter(user => {
    const fullName = (user.firstname && user.lastname) 
      ? `${user.firstname} ${user.lastname}` 
      : (user.name || '');
    
    return fullName.toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.phone || '').toLowerCase().includes(search);
  });
  displayUsers(filtered);
});
window.editUser = function(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('edit-id').value = userId;
  document.getElementById('edit-firstname').value = user.firstname || '';
  document.getElementById('edit-lastname').value = user.lastname || '';
  document.getElementById('edit-email').value = user.email || '';
  document.getElementById('edit-phone').value = user.phone || '';

  document.getElementById('edit-modal').classList.add('show');
};
document.getElementById('edit-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const userId = document.getElementById('edit-id').value;
  const data = {
    firstname: document.getElementById('edit-firstname').value,
    lastname: document.getElementById('edit-lastname').value,
    email: document.getElementById('edit-email').value,
    phone: document.getElementById('edit-phone').value
  };

  fbDb.collection('users').doc(userId).update(data)
    .then(() => {
      alert('✅ บันทึกข้อมูลเรียบร้อย');
      closeModal('edit-modal');
      loadUsers();
    })
    .catch(err => {
      alert('❌ เกิดข้อผิดพลาด: ' + err.message);
    });
});

window.deleteUser = function(userId, userName) {
  currentDeleteId = userId;
  currentDeleteType = 'user';
  document.getElementById('delete-info').textContent = `ชื่อ: ${userName}`;
  document.getElementById('delete-modal').classList.add('show');
};
document.getElementById('confirm-delete').addEventListener('click', () => {
  if (!currentDeleteId) return;

  const collection = currentDeleteType === 'user' ? 'users' : 'feedbacks';
  
  fbDb.collection(collection).doc(currentDeleteId).delete()
    .then(() => {
      alert('✅ ลบข้อมูลเรียบร้อย');
      closeModal('delete-modal');
      currentDeleteId = null;
      currentDeleteType = null;
      
      if (collection === 'users') {
        loadUsers();
      } else {
        loadFeedback();
      }
    })
    .catch(err => {
      alert('❌ เกิดข้อผิดพลาด: ' + err.message);
    });
});

function loadFeedback() {
  console.log('Loading feedback...');
  
  fbDb.collection('feedbacks').get()
    .then(snapshot => {
      allFeedback = [];
      console.log('Feedback found:', snapshot.size);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('Feedback data:', data);
        allFeedback.push({ id: doc.id, ...data });
      });
      allFeedback.sort((a, b) => (b.created || 0) - (a.created || 0));
      
      updateStats();
      displayFeedback(allFeedback);
    })
    .catch(err => {
      console.error('Error loading feedback:', err);
      document.getElementById('feedback-container').innerHTML = 
        '<div class="no-data">ไม่สามารถโหลดข้อมูลได้: ' + err.message + '</div>';
    });
}
function displayFeedback(feedback) {
  const container = document.getElementById('feedback-container');
  
  if (feedback.length === 0) {
    container.innerHTML = '<div class="no-data">📭 ยังไม่มี Feedback<br><small>ข้อมูลจะแสดงที่นี่เมื่อมีคนส่ง Feedback ผ่านหน้า feedback.html</small></div>';
    return;
  }

  container.innerHTML = feedback.map(fb => {
    const stars = '⭐'.repeat(fb.rating || 0);
    const date = fb.created ? new Date(fb.created).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '-';
    
    const displayName = (fb.firstname && fb.lastname) 
      ? `${fb.firstname} ${fb.lastname}` 
      : (fb.name || 'ไม่ระบุชื่อ');

    return `
      <div class="feedback-card">
        <div class="feedback-header">
          <span class="feedback-user">${displayName}</span>
          <span class="feedback-rating">${stars}</span>
        </div>
        <div class="feedback-date">📅 ${date}</div>
        <div class="feedback-comment">${fb.comment || '-'}</div>
        <div class="feedback-actions">
          <button class="btn-delete" onclick="deleteFeedback('${fb.id}', '${displayName.replace(/'/g, "\\'")}')">🗑️ ลบ</button>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('filter-rating').addEventListener('change', (e) => {
  const rating = e.target.value;
  
  if (rating === 'all') {
    displayFeedback(allFeedback);
  } else {
    const filtered = allFeedback.filter(fb => fb.rating === parseInt(rating));
    displayFeedback(filtered);
  }
});

window.deleteFeedback = function(feedbackId, userName) {
  currentDeleteId = feedbackId;
  currentDeleteType = 'feedback';
  document.getElementById('delete-info').textContent = `Feedback จาก: ${userName}`;
  document.getElementById('delete-modal').classList.add('show');
};

function updateStats() {
  document.getElementById('total-users').textContent = allUsers.length;
  document.getElementById('total-feedback').textContent = allFeedback.length;
  
  if (allFeedback.length > 0) {
    const sum = allFeedback.reduce((acc, fb) => acc + (fb.rating || 0), 0);
    const avg = sum / allFeedback.length;
    document.getElementById('avg-rating').textContent = avg.toFixed(1);
  } else {
    document.getElementById('avg-rating').textContent = '0.0';
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}
document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) modal.classList.remove('show');
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
});
