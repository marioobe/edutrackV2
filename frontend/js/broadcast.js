const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
}

async function loadSubscribers() {
  try {
    const res = await fetch(API + '/newsletter/subscribers', { headers: authHeaders() });
    if (res.status === 401) { window.location.href = 'login.html?expired=1'; return; }
    const list = await res.json();
    const container = document.getElementById('subscriberList');
    const countEl = document.getElementById('subscriberCount');
    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = '<div class="text-muted text-center py-4 small">Belum ada subscriber.</div>';
      countEl.textContent = '(0 subscriber)';
      return;
    }
    countEl.textContent = '(' + list.length + ' subscriber)';
    container.innerHTML = '';
    list.forEach(s => {
      const div = document.createElement('div');
      div.className = 'd-flex justify-content-between align-items-center px-3 py-2 border-bottom';
      div.innerHTML = '<span class="small">' + esc(s.email) + '</span><small class="text-muted">' + formatDate(s.created_at) + '</small>';
      container.appendChild(div);
    });
  } catch {
    document.getElementById('subscriberList').innerHTML = '<div class="text-muted text-center py-4 small">Gagal memuat data.</div>';
  }
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

loadSubscribers();
