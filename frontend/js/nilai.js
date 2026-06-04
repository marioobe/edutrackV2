const API = 'http://localhost:3000/api';
let allNilai = [];
let currentFilter = 'all';
let editingId = null;

function getToken() { return localStorage.getItem('token'); }

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

async function api(url, options) {
  const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...(options ? options.headers : {}) } });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
    return null;
  }
  return res;
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

function previewGrade() {
  const val = document.getElementById('nilaiAngka').value;
  const grade = konversiNilai(val);
  document.getElementById('gradePreview').innerHTML = grade.huruf === '-' ? '<span class="text-muted fw-normal">-</span>' : grade.huruf;
  document.getElementById('gradeBobotPreview').textContent = grade.bobot.toFixed(1);
}

function hitungIPK(list) {
  if (!list || list.length === 0) return 0;
  let totalBobot = 0, totalSKS = 0;
  list.forEach(n => {
    const g = konversiNilai(n.nilai_angka);
    totalBobot += g.bobot * n.sks;
    totalSKS += n.sks;
  });
  return totalSKS > 0 ? totalBobot / totalSKS : 0;
}

function getSemesters(list) {
  const s = new Set();
  list.forEach(n => { if (n.semester) s.add(n.semester); });
  return Array.from(s).sort();
}

function colorIPK(ipk) {
  if (ipk >= 3.5) return 'bg-success';
  if (ipk >= 3.0) return 'bg-primary';
  if (ipk >= 2.5) return 'bg-warning';
  return 'bg-danger';
}

function colorGrade(huruf) {
  const map = { 'A':'bg-success', 'A-':'bg-success', 'B+':'bg-primary', 'B':'bg-primary', 'B-':'bg-info', 'C+':'bg-info', 'C':'bg-warning', 'D':'bg-warning', 'E':'bg-danger' };
  return map[huruf] || 'bg-secondary';
}

async function loadNilai() {
  const res = await api(API + '/nilai');
  if (!res) return;
  try {
    allNilai = await res.json();
    if (!Array.isArray(allNilai)) allNilai = [];
  } catch { allNilai = []; }
  renderSemesterFilters(allNilai);
  renderAll();
}

function renderAll() {
  const filtered = currentFilter === 'all' ? allNilai : allNilai.filter(n => n.semester === currentFilter);
  renderStats(allNilai);
  renderDistribusi(filtered);
  renderIPKSemester(allNilai);
  renderTable(filtered);
}

function renderStats(list) {
  let totalSKS = 0, totalMatkul = 0, highest = -1;
  list.forEach(n => {
    totalSKS += n.sks || 0;
    totalMatkul++;
    if (n.nilai_angka !== null && n.nilai_angka !== undefined && n.nilai_angka > highest) highest = n.nilai_angka;
  });
  const ipk = hitungIPK(list);
  document.getElementById('totalSKS').textContent = totalSKS;
  document.getElementById('totalIPK').textContent = ipk.toFixed(2);
  document.getElementById('totalMatkul').textContent = totalMatkul;
  if (highest >= 0) {
    const g = konversiNilai(highest);
    document.getElementById('highestGrade').innerHTML = highest + ' <small class="text-muted fw-normal">(' + g.huruf + ')</small>';
  } else {
    document.getElementById('highestGrade').textContent = '-';
  }
}

function renderDistribusi(list) {
  const container = document.getElementById('gradeDistribution');
  const grades = ['A','A-','B+','B','B-','C+','C','D','E'];
  const counts = {};
  grades.forEach(g => counts[g] = 0);
  list.forEach(n => {
    const g = konversiNilai(n.nilai_angka);
    if (g.huruf !== '-' && counts[g.huruf] !== undefined) counts[g.huruf]++;
  });
  const maxCount = Math.max(...Object.values(counts), 1);
  let html = '';
  grades.forEach(g => {
    const cnt = counts[g];
    const pct = Math.round((cnt / maxCount) * 100);
    html += '<div class="mb-2">' +
      '<div class="d-flex justify-content-between small mb-1">' +
      '<span class="fw-semibold">' + g + '</span>' +
      '<span class="text-muted">' + cnt + ' mata kuliah</span>' +
      '</div>' +
      '<div class="progress grade-bar" style="height:14px">' +
      '<div class="progress-bar ' + colorGrade(g) + '" style="width:' + pct + '%" role="progressbar" aria-valuenow="' + cnt + '" aria-valuemin="0" aria-valuemax="' + maxCount + '"></div>' +
      '</div></div>';
  });
  if (list.length === 0) {
    container.innerHTML = '<div class="text-muted text-center py-4">Belum ada data nilai.</div>';
  } else {
    container.innerHTML = html;
  }
}

function renderIPKSemester(list) {
  const container = document.getElementById('ipkSemesterContainer');
  const semesters = getSemesters(list);
  if (semesters.length === 0) {
    container.innerHTML = '<div class="text-muted text-center py-4">Belum ada data nilai.</div>';
    return;
  }
  let html = '';
  semesters.forEach(sem => {
    const filtered = list.filter(n => n.semester === sem);
    const ipk = hitungIPK(filtered);
    const pct = Math.min(ipk / 4.0 * 100, 100);
    const color = colorIPK(ipk);
    const label = ipk >= 3.5 ? 'Sangat Baik' : ipk >= 3.0 ? 'Baik' : ipk >= 2.5 ? 'Cukup' : 'Kurang';
    html += '<div class="mb-3">' +
      '<div class="d-flex justify-content-between small mb-1">' +
      '<span class="fw-semibold">' + sem + '</span>' +
      '<span><strong>' + ipk.toFixed(2) + '</strong> <small class="text-muted">(' + label + ')</small></span>' +
      '</div>' +
      '<div class="progress ipk-bar" style="height:20px;background:#e9ecef">' +
      '<div class="progress-bar ' + color + ' ipk-bar" style="width:' + pct + '%" role="progressbar" aria-valuenow="' + ipk.toFixed(2) + '" aria-valuemin="0" aria-valuemax="4.0"></div>' +
      '</div></div>';
  });
  container.innerHTML = html;
}

function renderSemesterFilters(list) {
  const container = document.getElementById('semesterFilter');
  const s = new Set();
  list.forEach(n => { if (n.semester) s.add(n.semester); });
  const semesters = Array.from(s).sort();
  let html = '<span class="text-muted small me-1"><i class="fas fa-filter me-1"></i>Semester:</span>' +
    '<button class="btn btn-outline-primary btn-sm semester-tab active" data-semester="all">Semua</button>';
  semesters.forEach(sem => {
    html += '<button class="btn btn-outline-primary btn-sm semester-tab" data-semester="' + sem.replace(/"/g, '&quot;') + '">' + sem + '</button>';
  });
  container.innerHTML = html;
  container.querySelectorAll('.semester-tab').forEach(btn => {
    btn.addEventListener('click', function () {
      container.querySelectorAll('.semester-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.semester;
      renderAll();
    });
  });
}

function esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }

function renderTable(list) {
  const tbody = document.getElementById('nilaiTableBody');
  document.getElementById('nilaiCount').textContent = list.length;
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4"><i class="fas fa-inbox me-2"></i>Belum ada data nilai.</td></tr>';
    return;
  }
  let html = '';
  list.forEach((n, i) => {
    const grade = konversiNilai(n.nilai_angka);
    const warna = colorGrade(grade.huruf);
    html += '<tr>' +
      '<td class="text-muted">' + (i + 1) + '</td>' +
      '<td class="fw-semibold">' + esc(n.mata_kuliah) + '</td>' +
      '<td>' + n.sks + '</td>' +
      '<td>' + (n.nilai_angka !== null && n.nilai_angka !== undefined ? n.nilai_angka : '-') + '</td>' +
      '<td><span class="badge ' + warna + '">' + grade.huruf + '</span></td>' +
      '<td>' + grade.bobot.toFixed(1) + '</td>' +
      '<td><small class="text-muted">' + (n.semester || '-') + '</small></td>' +
      '<td>' +
      '<button class="btn btn-sm btn-outline-primary me-1 hover-action" onclick="editNilai(' + n.id + ')" title="Edit"><i class="fas fa-edit"></i></button>' +
      '<button class="btn btn-sm btn-outline-danger hover-action" onclick="deleteNilai(' + n.id + ')" title="Hapus"><i class="fas fa-trash"></i></button>' +
      '</td></tr>';
  });
  tbody.innerHTML = html;
}

function resetForm() {
  document.getElementById('nilaiForm').reset();
  document.getElementById('nilaiId').value = '';
  editingId = null;
  document.getElementById('nilaiModalTitle').innerHTML = '<i class="fas fa-plus-circle me-2"></i>Tambah Nilai';
  document.getElementById('nilaiSubmitBtn').innerHTML = '<i class="fas fa-save me-1"></i>Simpan';
  document.getElementById('nilaiError').classList.add('d-none');
  document.getElementById('gradePreview').innerHTML = '<span class="text-muted fw-normal">-</span>';
  document.getElementById('gradeBobotPreview').textContent = '0.0';
  populateSemesterOptions();
}

function populateSemesterOptions() {
  const select = document.getElementById('nilaiSemester');
  const currentVal = select.value;
  select.innerHTML = '<option value="">Pilih Semester</option>';
  const semesters = new Set();
  allNilai.forEach(n => { if (n.semester) semesters.add(n.semester); });
  const predefined = ['Ganjil 2024/2025','Genap 2024/2025','Ganjil 2025/2026','Genap 2025/2026'];
  predefined.forEach(s => semesters.add(s));
  Array.from(semesters).sort().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  });
  select.value = currentVal;
}

async function editNilai(id) {
  const res = await api(API + '/nilai/' + id);
  if (!res) return;
  try {
    const n = await res.json();
    if (!n || n.error) {
      alert('Data tidak ditemukan');
      return;
    }
    editingId = n.id;
    document.getElementById('nilaiId').value = n.id;
    document.getElementById('nilaiMatkul').value = n.mata_kuliah || '';
    document.getElementById('nilaiSKS').value = n.sks || 1;
    document.getElementById('nilaiAngka').value = n.nilai_angka !== null && n.nilai_angka !== undefined ? n.nilai_angka : '';
    document.getElementById('nilaiSemester').value = n.semester || '';
    document.getElementById('nilaiModalTitle').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Nilai';
    document.getElementById('nilaiSubmitBtn').innerHTML = '<i class="fas fa-save me-1"></i>Update';
    document.getElementById('nilaiError').classList.add('d-none');
    previewGrade();
    populateSemesterOptions();
    bootstrap.Modal.getInstance(document.getElementById('nilaiModal'));
    const modal = new bootstrap.Modal(document.getElementById('nilaiModal'));
    modal.show();
  } catch {
    alert('Gagal memuat data nilai');
  }
}

async function deleteNilai(id) {
  if (!confirm('Yakin ingin menghapus nilai ini?')) return;
  const res = await api(API + '/nilai/' + id, { method: 'DELETE' });
  if (!res) return;
  loadNilai();
}

document.getElementById('nilaiForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const id = editingId;
  const mata_kuliah = document.getElementById('nilaiMatkul').value.trim();
  const sks = parseInt(document.getElementById('nilaiSKS').value);
  const nilai_angka = parseFloat(document.getElementById('nilaiAngka').value);
  const semester = document.getElementById('nilaiSemester').value;
  const errEl = document.getElementById('nilaiError');

  if (!mata_kuliah || !sks || isNaN(nilai_angka) || !semester) {
    errEl.textContent = 'Semua field harus diisi dengan benar.';
    errEl.classList.remove('d-none');
    return;
  }
  if (nilai_angka < 0 || nilai_angka > 100) {
    errEl.textContent = 'Nilai angka harus antara 0-100.';
    errEl.classList.remove('d-none');
    return;
  }

  const body = { mata_kuliah, sks, nilai_angka, semester };
  let url = API + '/nilai';
  let method = 'POST';
  if (id) { url += '/' + id; method = 'PUT'; }

  const res = await api(url, { method, body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) {
    errEl.textContent = data.message || 'Gagal menyimpan data.';
    errEl.classList.remove('d-none');
    return;
  }
  errEl.classList.add('d-none');
  bootstrap.Modal.getInstance(document.getElementById('nilaiModal')).hide();
  loadNilai();
});

document.getElementById('nilaiModal').addEventListener('hidden.bs.modal', function () {
  document.getElementById('nilaiForm').reset();
  document.getElementById('nilaiError').classList.add('d-none');
  editingId = null;
});

loadNilai();
