const ADMIN_PASSWORD = '1212312121zaza';
const API_URL = 'api';

let currentDeleteId = null;
let currentDeleteType = null;
let allUsers = [];
let allFeedback = [];
let allContacts = [];

if (sessionStorage.getItem('adminLoggedIn') === 'true') {
  showAdminPanel();
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const password = document.getElementById('admin-password').value;
  const errorMsg = document.getElementById('login-error');
  
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    showAdminPanel();
  } else {
    errorMsg.textContent = '❌ รหัสผ่านไม่ถูกต้อง';
    errorMsg.style.display = 'block';
    setTimeout(() => {
      errorMsg.style.display = 'none';
    }, 3000);
  }
});

function showAdminPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  loadData();
}

function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  location.reload();
}

function loadData() {
  console.log('Loading data from PHP API...');
  loadUsers();
  loadFeedback();
  loadContacts();
}

function loadUsers() {
  console.log('Loading users...');
  fetch(API_URL + '/register.php')
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        allUsers = data.data || [];
        console.log('Users loaded:', allUsers.length);
        updateStats();
        displayUsers(allUsers);
      } else {
        throw new Error(data.message || 'Failed to load users');
      }
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
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">📭 ยังไม่มีผู้ลงทะเบียน</td></tr>';
    return;
  }

  tbody.innerHTML = users.map((user, index) => {
    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || '-';
    
    return `
    <tr>
      <td>${index + 1}</td>
      <td>${fullName}</td>
      <td>${user.email || '-'}</td>
      <td>${user.phone || '-'}</td>
      <td>${user.created || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-delete" onclick="confirmDelete('${user.id}', 'user', '${fullName.replace(/'/g, "\\'")}')">🗑️ ลบ</button>
        </div>
      </td>
    </tr>
    `;
  }).join('');
}

document.getElementById('search-users').addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = allUsers.filter(user => {
    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.toLowerCase();
    return fullName.includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.phone || '').toLowerCase().includes(search);
  });
  displayUsers(filtered);
});

function loadFeedback() {
  console.log('Loading feedback...');
  fetch(API_URL + '/feedback.php')
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        allFeedback = data.data || [];
        console.log('Feedback loaded:', allFeedback.length);
        updateStats();
        displayFeedback(allFeedback);
      } else {
        throw new Error(data.message || 'Failed to load feedback');
      }
    })
    .catch(err => {
      console.error('Error loading feedback:', err);
      document.getElementById('feedback-tbody').innerHTML = 
        '<tr><td colspan="5" class="no-data">ไม่สามารถโหลดข้อมูลได้</td></tr>';
    });
}

function displayFeedback(feedbacks) {
  const container = document.getElementById('feedback-container');
  
  if (feedbacks.length === 0) {
    container.innerHTML = '<div class="no-data">📭 ยังไม่มีความคิดเห็น</div>';
    return;
  }

  container.innerHTML = feedbacks.map((fb) => {
    const stars = '⭐'.repeat(fb.rating || 0);
    const date = fb.created ? new Date(fb.created).toLocaleDateString('th-TH') : '-';
    
    return `
    <div class="feedback-card">
      <div class="feedback-header">
        <strong>${fb.name || '-'}</strong>
        <span class="date">${date}</span>
      </div>
      <div class="rating">${stars} (${fb.rating || 0}/5)</div>
      <p class="comment">${fb.comment || '-'}</p>
      <button class="btn-delete" onclick="confirmDelete('${fb.id}', 'feedback', '${(fb.name || 'ผู้ใช้').replace(/'/g, "\\'")}')">🗑️ ลบ</button>
    </div>
    `;
  }).join('');
}

document.getElementById('search-feedback').addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = allFeedback.filter(fb => 
    (fb.name || '').toLowerCase().includes(search) ||
    (fb.comment || '').toLowerCase().includes(search)
  );
  displayFeedback(filtered);
});

document.getElementById('filter-rating').addEventListener('change', (e) => {
  const rating = e.target.value;
  if (rating === 'all') {
    displayFeedback(allFeedback);
  } else {
    const filtered = allFeedback.filter(fb => fb.rating === parseInt(rating));
    displayFeedback(filtered);
  }
});

function loadContacts() {
  console.log('Loading contacts...');
  fetch(API_URL + '/contact.php')
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        allContacts = data.data || [];
        console.log('Contacts loaded:', allContacts.length);
        updateStats();
        displayContacts(allContacts);
      } else {
        throw new Error(data.message || 'Failed to load contacts');
      }
    })
    .catch(err => {
      console.error('Error loading contacts:', err);
      document.getElementById('contacts-tbody').innerHTML = 
        '<tr><td colspan="6" class="no-data">ไม่สามารถโหลดข้อมูลได้</td></tr>';
    });
}

function displayContacts(contacts) {
  const container = document.getElementById('contacts-container');
  
  if (contacts.length === 0) {
    container.innerHTML = '<div class="no-data">📭 ยังไม่มีข้อความติดต่อ</div>';
    return;
  }

  container.innerHTML = contacts.map((contact) => {
    const date = contact.created ? new Date(contact.created).toLocaleDateString('th-TH') : '-';
    
    return `
    <div class="contact-card">
      <div class="contact-header">
        <strong>${contact.name || '-'}</strong>
        <span class="email">${contact.email || '-'}</span>
      </div>
      <div class="subject"><strong>หัวข้อ:</strong> ${contact.subject || '-'}</div>
      <p class="message">${contact.message || '-'}</p>
      <div class="contact-footer">
        <span class="date">${date}</span>
        <button class="btn-delete" onclick="confirmDelete('${contact.id}', 'contact', '${(contact.name || 'ผู้ใช้').replace(/'/g, "\\'")}')">🗑️ ลบ</button>
      </div>
    </div>
    `;
  }).join('');
}

document.getElementById('search-contacts').addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = allContacts.filter(c => 
    (c.name || '').toLowerCase().includes(search) ||
    (c.email || '').toLowerCase().includes(search) ||
    (c.subject || '').toLowerCase().includes(search)
  );
  displayContacts(filtered);
});

function updateStats() {
  document.getElementById('total-users').textContent = allUsers.length;
  document.getElementById('total-feedback').textContent = allFeedback.length;
  document.getElementById('total-contacts').textContent = allContacts.length;
  
  if (allFeedback.length > 0) {
    const avgRating = allFeedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) / allFeedback.length;
    document.getElementById('avg-rating').textContent = avgRating.toFixed(1);
  } else {
    document.getElementById('avg-rating').textContent = '0.0';
  }
}

function confirmDelete(id, type, name) {
  currentDeleteId = id;
  currentDeleteType = type;
  
  const typeName = type === 'user' ? 'ผู้ใช้' : type === 'feedback' ? 'ความคิดเห็น' : 'ข้อความ';
  document.getElementById('delete-info').textContent = 
    `คุณต้องการลบ${typeName}: ${name} ใช่หรือไม่?`;
  
  document.getElementById('delete-modal').style.display = 'flex';
}

document.getElementById('confirm-delete').addEventListener('click', () => {
  if (!currentDeleteId || !currentDeleteType) return;
  
  alert('ฟังก์ชันลบยังไม่รองรับในเวอร์ชันนี้ (ต้องสร้าง DELETE API)');
  closeDeleteModal();
});

function closeDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
  currentDeleteId = null;
  currentDeleteType = null;
}

document.querySelectorAll('.cancel-btn').forEach(btn => {
  btn.addEventListener('click', closeDeleteModal);
});

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', closeDeleteModal);
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
  });
});

