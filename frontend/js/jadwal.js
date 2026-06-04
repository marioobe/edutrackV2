const API = 'http://localhost:3000/api';
const TOKEN = localStorage.getItem('token');
const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const HOURS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

function getHeaders() { return { 'Content-Type':'application/json','Authorization':'Bearer '+TOKEN }; }

function loadJadwal() {
  fetch(API+'/jadwal',{headers:getHeaders()})
    .then(r=>{ if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(data=>{
      const list = Array.isArray(data) ? data : [];
      renderCalendar(list);
      renderMobile(list);
      updateSummary(list);
    })
    .catch(err=>console.error('loadJadwal error:', err));
}

function renderCalendar(list) {
  const grid = document.getElementById('calendarGrid');
  let html = '<div class="cal-header time-col">Jam</div>';
  DAYS.forEach(d=>{ html+='<div class="cal-header">'+d+'</div>'; });
  HOURS.forEach(h=>{
    html+='<div class="cal-cell" style="background:#f8f9fa;text-align:right;padding:4px;font-size:0.7rem;color:#6c757d;">'+h+'</div>';
    DAYS.forEach(day=>{
      const items = list.filter(j=> j.hari.toLowerCase()===day.toLowerCase() && j.jam_mulai && j.jam_mulai.startsWith(h.slice(0,2)));
      let cell = '<div class="cal-cell">';
      items.forEach(j=>{
        const cls = j.jenis==='praktikum'?'cal-praktikum':j.jenis==='bimbingan'?'cal-bimbingan':'';
        cell += '<div class="cal-item '+cls+'" data-id="'+j.id+'">';
        cell += '<strong>'+escapeHtml(j.mata_kuliah)+'</strong><br>';
        cell += '<span>'+escapeHtml(j.ruang)+' | '+fmtJam(j.jam_mulai)+'-'+fmtJam(j.jam_selesai)+'</span>';
        cell += '<div class="item-actions">';
        cell += '<button class="btn-edit-item" data-id="'+j.id+'" title="Edit"><i class="fas fa-pen"></i></button>';
        cell += '<button class="btn-del-item" data-id="'+j.id+'" title="Hapus"><i class="fas fa-times"></i></button>';
        cell += '</div></div>';
      });
      cell += '</div>';
      html += cell;
    });
  });
  grid.innerHTML = html;

  grid.querySelectorAll('.btn-edit-item').forEach(b=>{
    b.addEventListener('click',e=>{ e.stopPropagation(); editJadwal(b.dataset.id); });
  });
  grid.querySelectorAll('.btn-del-item').forEach(b=>{
    b.addEventListener('click',e=>{ e.stopPropagation(); if(confirm('Hapus jadwal ini?')) deleteJadwal(b.dataset.id); });
  });
}

function renderMobile(list) {
  const container = document.getElementById('mobileListContainer');
  if (!list.length) { container.innerHTML = '<p class="text-muted text-center py-3">Belum ada jadwal.</p>'; return; }
  let html = '';
  DAYS.forEach(day=>{
    const items = list.filter(j=> j.hari.toLowerCase()===day.toLowerCase()).sort((a,b)=> a.jam_mulai.localeCompare(b.jam_mulai));
    if (!items.length) return;
    html += '<h6 class="fw-bold mt-3 mb-2"><i class="fas fa-calendar-day me-1"></i>'+day+'</h6>';
    items.forEach(j=>{
      const cls = j.jenis==='praktikum'?'praktikum':j.jenis==='bimbingan'?'bimbingan':'';
      html += '<div class="list-jadwal-item '+cls+' card border-0 shadow-sm p-3">';
      html += '<div class="d-flex justify-content-between align-items-start">';
      html += '<div><h6 class="fw-bold mb-1">'+escapeHtml(j.mata_kuliah)+'</h6>';
      html += '<small class="text-muted">'+fmtJam(j.jam_mulai)+'-'+fmtJam(j.jam_selesai)+' &bull; '+escapeHtml(j.ruang)+'</small></div>';
      html += '<div class="d-flex gap-1"><button class="btn btn-sm btn-outline-warning btn-edit-mobile" data-id="'+j.id+'"><i class="fas fa-pen"></i></button>';
      html += '<button class="btn btn-sm btn-outline-danger btn-del-mobile" data-id="'+j.id+'"><i class="fas fa-trash"></i></button></div></div></div>';
    });
  });
  container.innerHTML = html;
  container.querySelectorAll('.btn-edit-mobile').forEach(b=>{
    b.addEventListener('click',()=>editJadwal(b.dataset.id));
  });
  container.querySelectorAll('.btn-del-mobile').forEach(b=>{
    b.addEventListener('click',()=>{ if(confirm('Hapus jadwal ini?')) deleteJadwal(b.dataset.id); });
  });
}

function updateSummary(list) {
  const unique = new Set(list.map(j=>j.mata_kuliah));
  document.getElementById('totalMatkul').textContent = unique.size;
  let totalMin = 0;
  list.forEach(j=>{
    if (!j.jam_mulai || !j.jam_selesai) return;
    const [m1,h1] = j.jam_mulai.split(':').map(Number);
    const [m2,h2] = j.jam_selesai.split(':').map(Number);
    totalMin += (m2*60+h2) - (m1*60+h1);
  });
  document.getElementById('totalJam').textContent = (totalMin/60).toFixed(1)+'h';
}

document.getElementById('btnSimpanJadwal').addEventListener('click', function() {
  const data = {
    mata_kuliah: document.getElementById('jMatkul').value.trim(),
    jenis: document.getElementById('jJenis').value,
    hari: document.getElementById('jHari').value,
    jam_mulai: document.getElementById('jMulai').value,
    jam_selesai: document.getElementById('jSelesai').value,
    ruang: document.getElementById('jRuang').value.trim()
  };
  if (!data.mata_kuliah || !data.jenis || !data.hari || !data.jam_mulai || !data.jam_selesai || !data.ruang) {
    showAlert('jadwalAlert','Semua field harus diisi.','danger'); return;
  }
  fetch(API+'/jadwal',{method:'POST',headers:getHeaders(),body:JSON.stringify(data)})
    .then(r=>{
      if (!r.ok) return r.json().then(e=>{ throw new Error(e.message||'Gagal menyimpan.'); });
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalTambahJadwal'));
      modal.hide();
      document.getElementById('formTambahJadwal').reset();
      loadJadwal();
    })
    .catch(err=>showAlert('jadwalAlert',err.message,'danger'));
});

function editJadwal(id) {
  fetch(API+'/jadwal/'+id,{headers:getHeaders()})
    .then(r=>{
      if (!r.ok) throw new Error('Gagal memuat data jadwal.');
      return r.json();
    })
    .then(j=>{
      document.getElementById('editJadwalId').value = j.id;
      document.getElementById('eMatkul').value = j.mata_kuliah;
      document.getElementById('eJenis').value = j.jenis;
      document.getElementById('eHari').value = j.hari;
      document.getElementById('eMulai').value = j.jam_mulai;
      document.getElementById('eSelesai').value = j.jam_selesai;
      document.getElementById('eRuang').value = j.ruang;
      const modal = new bootstrap.Modal(document.getElementById('modalEditJadwal'));
      modal.show();
    })
    .catch(err=>alert(err.message));
}

document.getElementById('btnSimpanEditJadwal').addEventListener('click', function() {
  const id = document.getElementById('editJadwalId').value;
  const data = {
    mata_kuliah: document.getElementById('eMatkul').value.trim(),
    jenis: document.getElementById('eJenis').value,
    hari: document.getElementById('eHari').value,
    jam_mulai: document.getElementById('eMulai').value,
    jam_selesai: document.getElementById('eSelesai').value,
    ruang: document.getElementById('eRuang').value.trim()
  };
  if (!data.mata_kuliah || !data.jenis || !data.hari || !data.jam_mulai || !data.jam_selesai || !data.ruang) {
    showAlert('editJadwalAlert','Semua field harus diisi.','danger'); return;
  }
  fetch(API+'/jadwal/'+id,{method:'PUT',headers:getHeaders(),body:JSON.stringify(data)})
    .then(r=>{
      if (!r.ok) return r.json().then(e=>{ throw new Error(e.message||'Gagal mengupdate.'); });
      bootstrap.Modal.getInstance(document.getElementById('modalEditJadwal')).hide();
      loadJadwal();
    })
    .catch(err=>showAlert('editJadwalAlert',err.message,'danger'));
});

function deleteJadwal(id) {
  fetch(API+'/jadwal/'+id,{method:'DELETE',headers:getHeaders()})
    .then(r=>{
      if (!r.ok) return r.json().then(e=>{ throw new Error(e.message||'Gagal menghapus.'); });
      loadJadwal();
    })
    .catch(err=>alert(err.message));
}

function showAlert(id,msg,type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '<div class="alert alert-'+type+' alert-dismissible fade show">'+escapeHtml(msg)+'<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
}
function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}
function fmtJam(t) {
  if (!t) return '';
  return t.length >= 5 ? t.slice(0,5) : t;
}

loadJadwal();
