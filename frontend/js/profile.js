const API = 'http://localhost:3000/api';
const esc = (str) => { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; };

function getToken() { return localStorage.getItem('token'); }

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

async function api(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
  if (res.status === 401) { logout(); return null; }
  return res;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  window.location.href = 'index.html';
}

function konversiNilai(angka) {
  if (angka === null || angka === undefined || angka === '' || angka < 0) return { huruf: '-', bobot: 0 };
  const n = Number(angka);
  if (isNaN(n)) return { huruf: '-', bobot: 0 };
  if (n >= 85) return { huruf: 'A', bobot: 4.0 };
  if (n >= 80) return { huruf: 'A-', bobot: 3.7 };
  if (n >= 75) return { huruf: 'B+', bobot: 3.3 };
  if (n >= 70) return { huruf: 'B', bobot: 3.0 };
  if (n >= 65) return { huruf: 'B-', bobot: 2.7 };
  if (n >= 60) return { huruf: 'C+', bobot: 2.3 };
  if (n >= 55) return { huruf: 'C', bobot: 2.0 };
  if (n >= 50) return { huruf: 'D', bobot: 1.0 };
  return { huruf: 'E', bobot: 0.0 };
}

function getDayIndo() {
  const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  return days[new Date().getDay()];
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(deadlineStr) {
  if (!deadlineStr) return false;
  const d = new Date(deadlineStr);
  d.setHours(23, 59, 59, 999);
  return d < new Date();
}

async function loadProfile() {
  const res = await api(API + '/auth/profile');
  if (!res) return;
  const data = await res.json();
  document.getElementById('profileName').textContent = data.name || '-';
  document.getElementById('profileEmail').textContent = data.email || '-';
  document.getElementById('profileNim').textContent = data.nim || '-';
  document.getElementById('profileProdi').textContent = data.prodi || '-';

  const initial = (data.name || 'U').charAt(0).toUpperCase();
  const img = document.getElementById('profilePhoto');
  const initialDiv = document.getElementById('avatarInitial');
  if (data.foto_profil) {
    img.src = API.replace('/api', '') + data.foto_profil;
    img.classList.remove('d-none');
    initialDiv.classList.add('d-none');
  } else {
    img.classList.add('d-none');
    initialDiv.classList.remove('d-none');
    initialDiv.textContent = initial;
  }

  document.getElementById('editName').value = data.name || '';
  document.getElementById('editNim').value = data.nim || '';
  document.getElementById('editProdi').value = data.prodi || '';

  const emailEl = document.getElementById('dropdownUserEmail');
  if (emailEl) emailEl.textContent = data.email || '-';
}

async function loadStats() {
  let totalNilai = 0, totalBobot = 0, totalSks = 0;

  const nilaiRes = await api(API + '/nilai');
  const nilaiList = nilaiRes ? await nilaiRes.json() : [];

  if (Array.isArray(nilaiList)) {
    nilaiList.forEach(n => {
      const g = konversiNilai(n.nilai_angka);
      const bobot = g.bobot;
      const sks = parseInt(n.sks) || 0;
      if (bobot !== null && sks > 0) {
        totalBobot += bobot * sks;
        totalSks += sks;
        totalNilai++;
      }
    });
  }

  const ipk = totalSks > 0 ? (totalBobot / totalSks) : 0;
  document.getElementById('statIpk').textContent = ipk > 0 ? ipk.toFixed(2) : '-';
  document.getElementById('statSks').textContent = totalSks || '-';

  const taskRes = await api(API + '/tasks');
  const taskList = taskRes ? await taskRes.json() : [];

  if (Array.isArray(taskList)) {
    const total = taskList.length;
    const done = taskList.filter(t => t.is_done).length;
    const pending = total - done;
    const overdue = taskList.filter(t => !t.is_done && isOverdue(t.deadline)).length;

    document.getElementById('statTotalTugas').textContent = total;
    document.getElementById('statSelesai').textContent = done;
    document.getElementById('statBelum').textContent = pending;
    document.getElementById('statLewat').textContent = overdue;
  }
}

async function loadTodaySchedule() {
  const container = document.getElementById('todaySchedule');
  const today = getDayIndo();
  const res = await api(API + '/jadwal');
  if (!res) { container.innerHTML = '<div class="text-muted small text-center py-2">Gagal memuat jadwal.</div>'; return; }
  const list = await res.json();
  const filtered = Array.isArray(list) ? list.filter(j => (j.hari || '').toLowerCase() === today) : [];

  if (filtered.length === 0) {
    container.innerHTML = '<div class="text-muted small text-center py-2"><i class="fas fa-check-circle text-success me-1"></i>Tidak ada jadwal hari ini.</div>';
    return;
  }

  container.innerHTML = '';
  filtered.sort((a, b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || ''));
  filtered.forEach(j => {
    const div = document.createElement('div');
    div.className = 'schedule-item';
    div.innerHTML = '<div class="fw-semibold small">' + esc(j.mata_kuliah || j.matakuliah || '-') + '</div>' +
      '<div class="text-muted small"><i class="far fa-clock me-1"></i>' + (j.jam_mulai || '') + ' - ' + (j.jam_selesai || '') +
      (j.ruang ? ' &middot; ' + esc(j.ruang) : '') + '</div>';
    container.appendChild(div);
  });
}

async function loadUpcomingTasks() {
  const container = document.getElementById('upcomingTasks');
  const res = await api(API + '/tasks');
  if (!res) { container.innerHTML = '<div class="text-muted small text-center py-2">Gagal memuat tugas.</div>'; return; }
  const list = await res.json();
  const pending = Array.isArray(list) ? list.filter(t => !t.is_done) : [];
  pending.sort((a, b) => {
    if (!a.deadline) return 1; if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });
  const top = pending.slice(0, 6);

  if (top.length === 0) {
    container.innerHTML = '<div class="text-muted small text-center py-2"><i class="fas fa-check-circle text-success me-1"></i>Semua tugas selesai!</div>';
    return;
  }

  container.innerHTML = '';
  top.forEach(t => {
    const overdue = isOverdue(t.deadline);
    const div = document.createElement('div');
    div.className = 'task-upcoming bg-light' + (overdue ? ' overdue' : '');
    div.innerHTML = '<div class="d-flex justify-content-between align-items-center"><span class="fw-semibold extra-small">' +
      esc(t.title || '-') + '</span><span class="extra-small text-muted">' + formatDate(t.deadline) + '</span></div>' +
      (t.mata_kuliah ? '<div class="extra-small text-muted">' + esc(t.mata_kuliah) + '</div>' : '') +
      (overdue ? '<div class="extra-small text-danger"><i class="fas fa-exclamation-circle me-1"></i>Terlewat</div>' : '');
    container.appendChild(div);
  });
}

async function loadProgressMatkul() {
  const container = document.getElementById('progressMatkul');
  const res = await api(API + '/tasks');
  if (!res) { container.innerHTML = '<div class="text-muted small text-center py-2">Gagal memuat data.</div>'; return; }
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<div class="text-muted small text-center py-2">Belum ada tugas.</div>'; return;
  }

  const groups = {};
  list.forEach(t => {
    const mk = t.mata_kuliah || 'Tanpa MK';
    if (!groups[mk]) groups[mk] = { total: 0, done: 0 };
    groups[mk].total++;
    if (t.is_done) groups[mk].done++;
  });

  container.innerHTML = '';
  Object.entries(groups).forEach(([mk, val]) => {
    const pct = Math.round((val.done / val.total) * 100);
    const color = pct === 100 ? 'bg-success' : pct >= 50 ? 'bg-primary' : pct >= 25 ? 'bg-warning' : 'bg-danger';
    const div = document.createElement('div');
    div.className = 'mb-2';
    div.innerHTML = '<div class="d-flex justify-content-between extra-small mb-1"><span class="fw-semibold">' + esc(mk) +
      '</span><span>' + val.done + '/' + val.total + ' (' + pct + '%)</span></div>' +
      '<div class="progress" style="height:6px;"><div class="progress-bar ' + color + '" role="progressbar" style="width:' + pct + '%"></div></div>';
    container.appendChild(div);
  });
}

async function loadIpkSemester() {
  const container = document.getElementById('ipkSemester');
  const res = await api(API + '/nilai');
  if (!res) { container.innerHTML = '<div class="text-muted small text-center py-2">Gagal memuat data.</div>'; return; }
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<div class="text-muted small text-center py-2">Belum ada nilai.</div>'; return;
  }

  const groups = {};
  list.forEach(n => {
    const sem = n.semester || 'Umum';
    if (!groups[sem]) groups[sem] = { totalBobot: 0, totalSks: 0 };
    const g = konversiNilai(n.nilai_angka);
    const bobot = g.bobot;
    const sks = parseInt(n.sks) || 0;
    if (bobot !== null && sks > 0) {
      groups[sem].totalBobot += bobot * sks;
      groups[sem].totalSks += sks;
    }
  });

  container.innerHTML = '';
  const sorted = Object.entries(groups).sort(([a], [b]) => {
    const na = parseInt(a), nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  const maxIpk = 4.0;
  sorted.forEach(([sem, val]) => {
    const ipk = val.totalSks > 0 ? (val.totalBobot / val.totalSks) : 0;
    const pct = Math.min((ipk / maxIpk) * 100, 100);
    const color = ipk >= 3.5 ? 'bg-success' : ipk >= 3.0 ? 'bg-primary' : ipk >= 2.5 ? 'bg-info' : ipk >= 2.0 ? 'bg-warning' : 'bg-danger';
    const div = document.createElement('div');
    div.className = 'mb-2';
    div.innerHTML = '<div class="d-flex justify-content-between extra-small mb-1"><span class="fw-semibold">Semester ' + sem +
      '</span><span>' + ipk.toFixed(2) + '</span></div>' +
      '<div class="progress" style="height:6px;"><div class="progress-bar ' + color + '" role="progressbar" style="width:' + pct + '%"></div></div>';
    container.appendChild(div);
  });
}

async function loadTaskCompletion() {
  const container = document.getElementById('taskCompletion');
  const res = await api(API + '/tasks');
  if (!res) { container.innerHTML = '<div class="text-muted small py-2">Gagal memuat data.</div>'; return; }
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<div class="text-muted small py-2">Belum ada tugas.</div>'; return;
  }
  const total = list.length;
  const done = list.filter(t => t.is_done).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  container.innerHTML = '';
  const div = document.createElement('div');
  div.innerHTML = '<div class="h2 fw-bold text-primary mb-0">' + pct + '%</div>' +
    '<div class="text-muted extra-small mb-2">selesai</div>' +
    '<div class="progress mb-1" style="height:10px;"><div class="progress-bar bg-success" role="progressbar" style="width:' + pct + '%"></div></div>' +
    '<div class="text-muted extra-small">' + done + '/' + total + ' tugas</div>';
  container.appendChild(div);
}

async function loadBusiestDay() {
  const container = document.getElementById('busiestDay');
  const res = await api(API + '/jadwal');
  if (!res) { container.innerHTML = '<div class="text-muted small text-center py-2">Gagal memuat data.</div>'; return; }
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<div class="text-muted small text-center py-2">Belum ada jadwal.</div>'; return;
  }
  const dayOrder = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  const dayLabels = { senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis', jumat: 'Jumat', sabtu: 'Sabtu' };
  const hoursPerDay = {};
  dayOrder.forEach(d => hoursPerDay[d] = 0);
  list.forEach(j => {
    const hari = (j.hari || '').toLowerCase();
    if (!hoursPerDay.hasOwnProperty(hari)) return;
    const mulai = j.jam_mulai || '00:00';
    const selesai = j.jam_selesai || '00:00';
    const [h1, m1] = mulai.split(':').map(Number);
    const [h2, m2] = selesai.split(':').map(Number);
    let durasi = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (durasi < 0) durasi += 24;
    hoursPerDay[hari] += durasi;
  });
  const maxHours = Math.max(...Object.values(hoursPerDay), 1);
  container.innerHTML = '';
  dayOrder.forEach(day => {
    const hours = hoursPerDay[day];
    const pct = hours > 0 ? Math.min((hours / maxHours) * 100, 100) : 0;
    const isMax = hours > 0 && hours === maxHours;
    const barColor = isMax ? 'bg-primary' : 'bg-secondary';
    const div = document.createElement('div');
    div.className = 'd-flex align-items-center mb-1';
    div.innerHTML = '<span class="extra-small fw-semibold flex-shrink-0" style="width:38px;">' + dayLabels[day] + '</span>' +
      '<div class="progress flex-grow-1 mx-1" style="height:10px;"><div class="progress-bar ' + barColor + '" role="progressbar" style="width:' + pct + '%"></div></div>' +
      '<span class="extra-small text-muted flex-shrink-0 text-end" style="width:32px;">' + hours.toFixed(1) + '</span>';
    container.appendChild(div);
  });
}

function evaluatePasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++; if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 5);
}

function updatePasswordStrength(pw) {
  const level = evaluatePasswordStrength(pw);
  const bars = document.querySelectorAll('#pwBars .pw-bar');
  const label = document.getElementById('pwLabel');
  const colors = ['#dc3545', '#dc3545', '#ffc107', '#0d6efd', '#198754', '#198754'];
  const labels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat', 'Sangat Kuat'];

  bars.forEach((bar, i) => {
    const idx = i + 1;
    bar.style.backgroundColor = idx <= level ? colors[level] : '#adb5bd';
  });

  label.textContent = level > 0 ? labels[level] : 'Masukkan password baru';
  label.style.color = level > 0 ? colors[level] : '#6c757d';
}

document.getElementById('newPassword').addEventListener('input', function() {
  updatePasswordStrength(this.value);
});

document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('changePasswordError');
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    errEl.textContent = 'Konfirmasi password tidak cocok.';
    errEl.classList.remove('d-none');
    return;
  }

  const res = await api(API + '/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.message || 'Gagal mengubah password.'; errEl.classList.remove('d-none'); return; }
  errEl.classList.add('d-none');
  bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
  document.getElementById('changePasswordForm').reset();
  document.getElementById('pwLabel').textContent = 'Masukkan password baru';
  document.getElementById('pwLabel').style.color = '#6c757d';
  document.querySelectorAll('#pwBars .pw-bar').forEach(b => b.style.backgroundColor = '#adb5bd');
  alert('Password berhasil diubah!');
});

document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('editProfileError');
  const name = document.getElementById('editName').value;
  const nim = document.getElementById('editNim').value;
  const prodi = document.getElementById('editProdi').value;

  const res = await api(API + '/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, nim, prodi }),
  });
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.message || 'Gagal menyimpan.'; errEl.classList.remove('d-none'); return; }
  errEl.classList.add('d-none');

  if (data.token) localStorage.setItem('token', data.token);
  localStorage.setItem('userName', name);
  bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
  loadProfile();
});

document.getElementById('changePasswordModal').addEventListener('hidden.bs.modal', () => {
  document.getElementById('changePasswordForm').reset();
  document.getElementById('changePasswordError').classList.add('d-none');
  document.getElementById('pwLabel').textContent = 'Masukkan password baru';
  document.getElementById('pwLabel').style.color = '#6c757d';
  document.querySelectorAll('#pwBars .pw-bar').forEach(b => b.style.backgroundColor = '#adb5bd');
});

document.getElementById('editProfileModal').addEventListener('hidden.bs.modal', () => {
  document.getElementById('editProfileError').classList.add('d-none');
});

document.getElementById('fotoUpload').addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('File maksimal 2MB.'); this.value = ''; return; }
  const fd = new FormData();
  fd.append('foto', file);
  const res = await fetch(API + '/auth/upload-foto', { method: 'POST', headers: { 'Authorization': 'Bearer ' + getToken() }, body: fd });
  if (!res.ok) { const e = await res.json(); alert(e.message || 'Gagal upload.'); return; }
  loadProfile();
});

loadProfile();
loadStats();
loadTodaySchedule();
loadUpcomingTasks();
loadProgressMatkul();
loadIpkSemester();
loadTaskCompletion();
loadBusiestDay();
