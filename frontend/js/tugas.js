const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
}

function handle401(res) {
  if (res.status === 401) { window.location.href = 'login.html?expired=1'; return true; }
  return false;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const d = new Date(dateOnly + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function getDeadlineInfo(dateStr) {
  if (!dateStr) return { cls: '', label: '' };
  const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(dateOnly + 'T00:00:00');
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { cls: 'deadline-danger', label: 'Terlambat ' + Math.abs(diff) + ' hari' };
  if (diff === 0) return { cls: 'deadline-danger', label: 'Hari ini' };
  if (diff <= 3) return { cls: 'deadline-warning', label: diff + ' hari lagi' };
  return { cls: 'deadline-safe', label: diff + ' hari lagi' };
}

let editingTaskId = null;

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
    if (handle401(res)) return null;
    return res;
  } catch {
    showToast('Gagal terhubung ke server', 'danger');
    return null;
  }
}

function showToast(message, type) {
  const colors = { success: '#198754', danger: '#dc3545', warning: '#ffc107', info: '#0dcaf0' };
  const bg = colors[type] || colors.info;
  const container = document.getElementById('toastContainer') || (function() {
    const c = document.createElement('div'); c.id = 'toastContainer';
    c.style.cssText = 'position:fixed;bottom:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;';
    document.body.appendChild(c); return c;
  })();
  const toast = document.createElement('div');
  toast.className = 'text-white px-3 py-2 rounded shadow-sm small';
  toast.style.background = bg;
  toast.style.animation = 'fadeIn .3s';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

async function loadMatkul() {
  const res = await apiFetch(API + '/matkul');
  if (!res) return;
  const list = await res.json();
  const listEl = document.getElementById('matkulList');
  const select = document.getElementById('taskMatkul');
  const filterSelect = document.getElementById('filterMatkul');
  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Pilih Mata Kuliah --</option>';
  filterSelect.innerHTML = '<option value="">Semua Mata Kuliah</option>';
  if (!list || list.length === 0) {
    listEl.innerHTML = '<div class="text-muted text-center py-3 small">Belum ada mata kuliah.</div>';
    return;
  }
  listEl.innerHTML = '';
  list.forEach(m => {
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center py-1 border-bottom';
    div.innerHTML = '<span class="small">' + escHtml(m.nama) + '</span><i class="fas fa-times text-danger del-matkul" data-id="' + m.id + '" style="cursor:pointer;font-size:.75rem"></i>';
    listEl.appendChild(div);
    const opt = document.createElement('option'); opt.value = m.nama; opt.textContent = m.nama;
    select.appendChild(opt);
    const fopt = document.createElement('option'); fopt.value = m.nama; fopt.textContent = m.nama;
    filterSelect.appendChild(fopt);
  });
  select.value = currentVal || '';
  document.querySelectorAll('.del-matkul').forEach(el => {
    el.addEventListener('click', async function() {
      if (!confirm('Hapus mata kuliah ' + this.parentElement.querySelector('span').textContent + '?')) return;
      await apiFetch(API + '/matkul/' + this.dataset.id, { method: 'DELETE' });
      loadMatkul(); loadTasks();
    });
  });
}

let allTasks = [];

async function loadTasks() {
  const res = await apiFetch(API + '/tasks');
  if (!res) return;
  allTasks = await res.json();
  renderTasks();
  updateStats();
  updateMatkulProgress();
}

function updateStats() {
  const total = allTasks.length;
  const doneCount = allTasks.filter(t => t.is_done).length;
  const pending = total - doneCount;
  const unsubmitted = allTasks.filter(t => t.is_done && !t.is_submitted).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  document.getElementById('totalTasks').textContent = total;
  document.getElementById('doneTasks').textContent = doneCount;
  document.getElementById('pendingTasks').textContent = pending;
  document.getElementById('unsubmittedTasks').textContent = unsubmitted;
  document.getElementById('progressPercent').textContent = percent + '%';
  const ring = document.getElementById('progressRing');
  if (ring) ring.style.background = 'conic-gradient(#0d6efd ' + (percent * 3.6) + 'deg, #e9ecef ' + (percent * 3.6) + 'deg)';
}

function updateMatkulProgress() {
  const container = document.getElementById('matkulProgress');
  const tasks = allTasks;
  const matkulMap = {};
  tasks.forEach(t => {
    const mk = t.mata_kuliah || '(Tanpa MK)';
    if (!matkulMap[mk]) matkulMap[mk] = { total: 0, done: 0 };
    matkulMap[mk].total++;
    if (t.is_done) matkulMap[mk].done++;
  });
  const keys = Object.keys(matkulMap);
  if (keys.length === 0) {
    container.innerHTML = '<div class="text-muted text-center py-3 small">Belum ada data tugas.</div>';
    return;
  }
  container.innerHTML = '';
  keys.forEach(k => {
    const m = matkulMap[k];
    const pct = Math.round((m.done / m.total) * 100);
    const div = document.createElement('div');
    div.className = 'matkul-progress-item';
    div.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-1"><span class="small fw-semibold">' + escHtml(k) + '</span><small class="text-muted">' + m.done + '/' + m.total + ' (' + pct + '%)</small></div><div class="progress progress-thin"><div class="progress-bar bg-primary" style="width:' + pct + '%"></div></div>';
    container.appendChild(div);
  });
}

function getFilteredTasks() {
  const status = document.getElementById('filterStatus').value;
  const priority = document.getElementById('filterPriority').value;
  const matkul = document.getElementById('filterMatkul').value;
  let filtered = allTasks.slice();
  if (status === 'belum') filtered = filtered.filter(t => !t.is_done);
  else if (status === 'selesai') filtered = filtered.filter(t => t.is_done);
  else if (status === 'lewat') {
    const now = new Date(); now.setHours(0,0,0,0);
    filtered = filtered.filter(t => {
      if (!t.deadline || t.is_done) return false;
      const dateOnly = t.deadline.includes('T') ? t.deadline.split('T')[0] : t.deadline;
      return new Date(dateOnly + 'T00:00:00') < now;
    });
  }
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  if (matkul) filtered = filtered.filter(t => t.mata_kuliah === matkul);
  return filtered;
}

function renderTasks() {
  const container = document.getElementById('taskList');
  document.getElementById('taskListLoading').style.display = 'none';
  const filtered = getFilteredTasks();
  if (filtered.length === 0) {
    container.innerHTML = '<div class="text-center text-muted py-5"><i class="fas fa-inbox fs-1 mb-3 d-block"></i>Tidak ada tugas ditemukan</div>';
    return;
  }
  container.innerHTML = '';
  filtered.forEach(t => {
    const dl = getDeadlineInfo(t.deadline);
    const div = document.createElement('div');
    div.className = 'card mb-2 priority-' + t.priority + ' task-item border-0 shadow-sm';
    div.innerHTML = '<div class="card-body py-2 px-3"><div class="d-flex align-items-start gap-2"><div class="pt-1"><input type="checkbox" class="form-check-input toggle-task" data-id="' + t.id + '" ' + (t.is_done ? 'checked' : '') + '></div><div class="flex-grow-1"><div class="d-flex justify-content-between align-items-start"><div><span class="' + (t.is_done ? 'task-done' : '') + ' fw-semibold">' + escHtml(t.title) + '</span></div><div class="d-flex gap-1"><button class="btn btn-link btn-sm text-secondary p-0 edit-task" data-id="' + t.id + '" title="Edit"><i class="fas fa-edit"></i></button><button class="btn btn-link btn-sm text-danger p-0 del-task" data-id="' + t.id + '" title="Hapus"><i class="fas fa-trash"></i></button></div></div><div class="d-flex flex-wrap align-items-center gap-1 mt-1"><span class="badge badge-task ' + (t.priority === 'tinggi' ? 'bg-danger' : t.priority === 'sedang' ? 'bg-warning text-dark' : 'bg-success') + '">' + t.priority + '</span>' + (t.mata_kuliah ? '<span class="badge badge-task bg-secondary bg-opacity-25 text-dark">' + escHtml(t.mata_kuliah) + '</span>' : '') + (t.is_submitted ? '<small class="text-success ms-1"><i class="fas fa-check-circle me-1"></i>Sudah dikumpul</small><button class="btn btn-link btn-sm text-success p-0 ms-1 submit-task" data-id="' + t.id + '" style="text-decoration:none;font-size:0.8rem" title="Batal kumpul"><i class="fas fa-undo"></i></button>' : (t.is_done ? '<small class="text-warning ms-1"><i class="fas fa-clock me-1"></i>Selesai dikerjakan</small><button class="btn btn-sm btn-outline-success ms-1 py-0 px-1 submit-task" data-id="' + t.id + '" style="font-size:0.75rem" title="Kumpulkan tugas"><i class="fas fa-upload me-1"></i>Kumpul</button>' : (t.deadline ? '<small class="' + dl.cls + ' ms-1"><i class="far fa-calendar-alt me-1"></i>' + formatDate(t.deadline) + ' <span class="fw-normal">(' + dl.label + ')</span></small>' : '<small class="text-muted ms-1"><i class="far fa-calendar-alt me-1"></i>Tidak ada deadline</small>'))) + '</div></div></div></div>';
    container.appendChild(div);
  });
  document.querySelectorAll('.toggle-task').forEach(el => {
    el.addEventListener('change', async function() {
      await apiFetch(API + '/tasks/' + this.dataset.id + '/toggle', { method: 'PATCH', body: JSON.stringify({}) });
      loadTasks();
    });
  });
  document.querySelectorAll('.del-task').forEach(el => {
    el.addEventListener('click', async function() {
      if (!confirm('Hapus tugas ini?')) return;
      const res = await apiFetch(API + '/tasks/' + this.dataset.id, { method: 'DELETE' });
      if (res) { loadTasks(); }
    });
  });
  document.querySelectorAll('.submit-task').forEach(el => {
    el.addEventListener('click', async function() {
      await apiFetch(API + '/tasks/' + this.dataset.id + '/submit', { method: 'PATCH', body: JSON.stringify({}) });
      loadTasks();
    });
  });
  document.querySelectorAll('.edit-task').forEach(el => {
    el.addEventListener('click', function() {
      const task = allTasks.find(t => t.id == this.dataset.id);
      if (!task) return;
      editingTaskId = task.id;
      document.getElementById('taskModalTitle').innerHTML = '<i class="fas fa-edit me-1"></i>Edit Tugas';
      document.getElementById('taskSubmitBtn').innerHTML = '<i class="fas fa-save me-1"></i>Update';
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskMatkul').value = task.mata_kuliah || '';
      document.getElementById('taskPriority').value = task.priority;
      document.getElementById('taskDeadline').value = task.deadline || '';
      document.getElementById('taskError').classList.add('d-none');
      const modal = new bootstrap.Modal(document.getElementById('taskModal'));
      modal.show();
    });
  });
}

function escHtml(str) {
  const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}

document.getElementById('filterStatus').addEventListener('change', renderTasks);
document.getElementById('filterPriority').addEventListener('change', renderTasks);
document.getElementById('filterMatkul').addEventListener('change', renderTasks);

document.getElementById('matkulForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nama = document.getElementById('matkulName').value.trim();
  if (!nama) return;
  const errEl = document.getElementById('matkulError');
  const res = await apiFetch(API + '/matkul', { method: 'POST', body: JSON.stringify({ nama }) });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.message || 'Gagal menyimpan'; errEl.classList.remove('d-none'); return; }
  errEl.classList.add('d-none');
  bootstrap.Modal.getInstance(document.getElementById('matkulModal')).hide();
  document.getElementById('matkulForm').reset();
  loadMatkul();
  loadTasks();
  showToast('Mata kuliah berhasil ditambahkan', 'success');
});

document.getElementById('taskForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value.trim();
  const mata_kuliah = document.getElementById('taskMatkul').value;
  const priority = document.getElementById('taskPriority').value;
  const deadline = document.getElementById('taskDeadline').value;
  const errEl = document.getElementById('taskError');
  if (!title) { errEl.textContent = 'Judul tugas wajib diisi'; errEl.classList.remove('d-none'); return; }
  const body = { title, mata_kuliah: mata_kuliah || undefined, priority, deadline: deadline || undefined };
  const method = id ? 'PUT' : 'POST';
  const url = id ? API + '/tasks/' + id : API + '/tasks';
  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.message || 'Gagal menyimpan'; errEl.classList.remove('d-none'); return; }
  errEl.classList.add('d-none');
  bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  editingTaskId = null;
  document.getElementById('taskModalTitle').innerHTML = '<i class="fas fa-plus me-1"></i>Tambah Tugas';
  document.getElementById('taskSubmitBtn').innerHTML = '<i class="fas fa-save me-1"></i>Simpan';
  loadTasks();
  showToast(id ? 'Tugas berhasil diperbarui' : 'Tugas berhasil ditambahkan', 'success');
});

document.getElementById('matkulModal').addEventListener('hidden.bs.modal', function() {
  document.getElementById('matkulForm').reset();
  document.getElementById('matkulError').classList.add('d-none');
});

document.getElementById('taskModal').addEventListener('hidden.bs.modal', function() {
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  editingTaskId = null;
  document.getElementById('taskError').classList.add('d-none');
  document.getElementById('taskModalTitle').innerHTML = '<i class="fas fa-plus me-1"></i>Tambah Tugas';
  document.getElementById('taskSubmitBtn').innerHTML = '<i class="fas fa-save me-1"></i>Simpan';
});

document.getElementById('taskModal').addEventListener('show.bs.modal', function() {
  if (!editingTaskId) loadMatkul();
});

loadMatkul();
loadTasks();
