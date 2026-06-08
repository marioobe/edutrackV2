const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncate(str, len) {
  if (!str) return '-';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

async function loadDashboard() {
  try {
    const res = await fetch(API + '/admin/stats', { headers: authHeaders() });
    if (res.status === 403) { window.location.href = 'index.html'; return; }
    if (res.status === 401) { window.location.href = 'login.html?expired=1'; return; }
    const data = await res.json();
    document.getElementById('statUsers').textContent = data.userCount ?? 0;
    document.getElementById('statTasks').textContent = data.taskCount ?? 0;
    document.getElementById('statMessages').textContent = data.messageCount ?? 0;
    document.getElementById('statSubscribers').textContent = data.subscriberCount ?? 0;
  } catch { /* ignore */ }
}

async function loadUsers() {
  try {
    const res = await fetch(API + '/admin/users', { headers: authHeaders() });
    const users = await res.json();
    const tbody = document.getElementById('usersTableBody');
    document.getElementById('userCountBadge').textContent = users.length;
    if (!Array.isArray(users) || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No users found.</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${esc(u.name)}</td>
        <td>${esc(u.email)}</td>
        <td>${esc(u.nim) || '-'}</td>
        <td>${esc(u.prodi) || '-'}</td>
        <td><span class="badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}">${esc(u.role)}</span></td>
        <td class="small">${formatDate(u.created_at)}</td>
        <td>
          ${u.role !== 'admin' ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>` : '<span class="text-muted small">-</span>'}
        </td>
      </tr>
    `).join('');
  } catch { /* ignore */ }
}

async function deleteUser(id) {
  if (!confirm('Delete this user and all their data?')) return;
  try {
    const res = await fetch(API + '/admin/users/' + id, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    loadUsers();
  } catch { alert('Failed to delete user.'); }
}

async function loadMessages() {
  try {
    const res = await fetch(API + '/admin/messages', { headers: authHeaders() });
    const messages = await res.json();
    const tbody = document.getElementById('messagesTableBody');
    document.getElementById('messageCountBadge').textContent = messages.length;
    if (!Array.isArray(messages) || messages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No messages.</td></tr>';
      return;
    }
    tbody.innerHTML = messages.map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${esc(m.name)}</td>
        <td>${esc(m.email)}</td>
        <td class="small">${truncate(esc(m.message), 80)}</td>
        <td class="small">${formatDate(m.created_at)}</td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="deleteMessage(${m.id})"><i class="fas fa-trash"></i></button></td>
      </tr>
    `).join('');
  } catch { /* ignore */ }
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    const res = await fetch(API + '/admin/messages/' + id, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    loadMessages();
  } catch { alert('Failed to delete message.'); }
}

async function loadSubscribersTable() {
  try {
    const res = await fetch(API + '/newsletter/subscribers', { headers: authHeaders() });
    const list = await res.json();
    const tbody = document.getElementById('subscribersTableBody');
    document.getElementById('subscriberCountBadge').textContent = list.length;
    document.getElementById('subscriberCount').textContent = '(' + list.length + ' subscriber)';
    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No subscribers.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${esc(s.email)}</td>
        <td class="small">${formatDate(s.created_at)}</td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="deleteSubscriber(${s.id})"><i class="fas fa-trash"></i></button></td>
      </tr>
    `).join('');
  } catch { /* ignore */ }
}

async function deleteSubscriber(id) {
  if (!confirm('Delete this subscriber?')) return;
  try {
    const res = await fetch(API + '/admin/subscribers/' + id, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    loadSubscribersTable();
  } catch { alert('Failed to delete subscriber.'); }
}

// Newsletter form
document.getElementById('broadcastForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  const alertBox = document.getElementById('alertBox');
  const btn = document.getElementById('btnSend');

  if (!subject || !message) {
    showAlert('danger', 'Subject dan pesan harus diisi.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Mengirim...';

  try {
    const res = await fetch(API + '/newsletter/send', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ subject, message }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert('danger', data.message || 'Gagal mengirim.');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane me-1"></i><span>Kirim ke Semua Subscriber</span>';
      return;
    }
    showAlert('success', '<i class="fas fa-check-circle me-1"></i>' + data.message);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane me-1"></i><span>Kirim ke Semua Subscriber</span>';
  } catch {
    showAlert('danger', 'Gagal terhubung ke server.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane me-1"></i><span>Kirim ke Semua Subscriber</span>';
  }
});

function showAlert(type, msg) {
  const el = document.getElementById('alertBox');
  el.className = 'alert alert-' + type + ' alert-dismissible fade show';
  el.innerHTML = msg + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
  el.classList.remove('d-none');
}

// Init: load dashboard on page load, other tabs load on click
loadDashboard();

document.getElementById('tab-users-btn').addEventListener('shown.bs.tab', loadUsers);
document.getElementById('tab-messages-btn').addEventListener('shown.bs.tab', loadMessages);
document.getElementById('tab-subscribers-btn').addEventListener('shown.bs.tab', loadSubscribersTable);
