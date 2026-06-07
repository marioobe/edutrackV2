const API = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

/* ── Users ── */
async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  try {
    const res = await fetch(API + '/admin/users', { headers: authHeaders() });
    if (!res.ok) throw new Error();
    const users = await res.json();
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Belum ada user.</td></tr>';
      return;
    }
    tbody.innerHTML = users.map((u, i) =>
      '<tr>' +
        '<td class="text-muted">' + (i + 1) + '</td>' +
        '<td class="fw-semibold">' + esc(u.name) + '</td>' +
        '<td>' + esc(u.email) + '</td>' +
        '<td>' + esc(u.nim || '-') + '</td>' +
        '<td>' + esc(u.prodi || '-') + '</td>' +
        '<td><span class="badge ' + (u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary') + '">' + esc(u.role) + '</span></td>' +
        '<td><small class="text-muted">' + new Date(u.created_at).toLocaleDateString('id-ID') + '</small></td>' +
      '</tr>'
    ).join('');
  } catch {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Gagal memuat data user.</td></tr>';
  }
}

/* ── Messages ── */
async function loadMessages() {
  const tbody = document.getElementById('messagesTableBody');
  if (!tbody) return;
  try {
    const res = await fetch(API + '/admin/messages', { headers: authHeaders() });
    if (!res.ok) throw new Error();
    const msgs = await res.json();
    if (msgs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Belum ada pesan.</td></tr>';
      return;
    }
    tbody.innerHTML = msgs.map((m, i) =>
      '<tr>' +
        '<td class="text-muted">' + (i + 1) + '</td>' +
        '<td class="fw-semibold">' + esc(m.name) + '</td>' +
        '<td>' + esc(m.email) + '</td>' +
        '<td style="max-width:300px"><small>' + esc(m.message) + '</small></td>' +
        '<td><small class="text-muted">' + new Date(m.created_at).toLocaleDateString('id-ID') + '</small></td>' +
      '</tr>'
    ).join('');
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Gagal memuat pesan.</td></tr>';
  }
}

/* ── Newsletter ── */
async function loadSubscribers() {
  const el = document.getElementById('subscriberList');
  if (!el) return;
  try {
    const res = await fetch(API + '/newsletter/subscribers', { headers: authHeaders() });
    if (!res.ok) throw new Error();
    const list = await res.json();
    document.getElementById('subscriberCount').textContent = list.length + ' subscriber';
    if (list.length === 0) {
      el.innerHTML = '<div class="text-muted text-center py-4 small">Belum ada subscriber.</div>';
      return;
    }
    el.innerHTML = '<ul class="list-group list-group-flush">' +
      list.map(s => '<li class="list-group-item d-flex justify-content-between align-items-center py-2"><small>' + esc(s.email) + '</small><small class="text-muted">' + new Date(s.created_at).toLocaleDateString('id-ID') + '</small></li>').join('') +
      '</ul>';
  } catch {
    el.innerHTML = '<div class="text-muted text-center py-4 small">Gagal memuat.</div>';
  }
}

const form = document.getElementById('broadcastForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const btn = document.getElementById('btnSend');
    const alertBox = document.getElementById('alertBox');
    if (!subject || !message) return;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Mengirim...';
    try {
      const res = await fetch(API + '/newsletter/send', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      alertBox.className = 'alert alert-' + (res.ok ? 'success' : 'danger') + ' alert-dismissible fade show';
      alertBox.innerHTML = (res.ok ? '<i class="fas fa-check-circle me-1"></i>' : '<i class="fas fa-exclamation-circle me-1"></i>') + esc(data.message) +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
      if (res.ok) { form.reset(); loadSubscribers(); }
    } catch {
      alertBox.className = 'alert alert-danger alert-dismissible fade show';
      alertBox.innerHTML = '<i class="fas fa-exclamation-circle me-1"></i>Gagal terhubung ke server.' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane me-1"></i><span>Kirim ke Semua Subscriber</span>';
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  loadMessages();
  loadSubscribers();
});
