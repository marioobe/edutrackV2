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

  // Render empty grid
  let html = '<div class="cal-header time-col">Jam</div>';
  DAYS.forEach(d => { html += '<div class="cal-header">' + d + '</div>'; });
  HOURS.forEach(h => {
    html += '<div class="cal-cell time-cell">' + h + '</div>';
    DAYS.forEach(() => { html += '<div class="cal-cell"></div>'; });
  });
  grid.innerHTML = html;

  // Remove old overlay
  const oldOverlay = grid.querySelector('.cal-items-overlay');
  if (oldOverlay) oldOverlay.remove();

  // Measure cell dimensions
  const cells = grid.querySelectorAll('.cal-cell');
  if (!cells.length) return;
  const gridRect = grid.getBoundingClientRect();
  const style = getComputedStyle(grid);
  const borderL = parseFloat(style.borderLeftWidth) || 1;
  const borderT = parseFloat(style.borderTopWidth) || 1;
  const cellWidth = cells[1].offsetWidth;
  const cellHeight = cells[0].offsetHeight;
  const gap = 1;

  // Column positions — measure first day cell's left relative to grid content area
  const firstDayRect = cells[1].getBoundingClientRect();
  const colLeft = firstDayRect.left - gridRect.left - borderL;
  const rowTop = cells[0].getBoundingClientRect().top - gridRect.top - borderT;

  // Create overlay and position items
  const overlay = document.createElement('div');
  overlay.className = 'cal-items-overlay';
  grid.appendChild(overlay);

  list.forEach(j => {
    if (!j.jam_mulai) return;

    const dayIdx = DAYS.findIndex(d => d.toLowerCase() === j.hari.toLowerCase());
    if (dayIdx === -1) return;

    const [sH, sM] = j.jam_mulai.split(':').map(Number);
    const [eH, eM] = j.jam_selesai ? j.jam_selesai.split(':').map(Number) : [sH + 1, sM];

    const hourIdx = HOURS.findIndex(h => +h.split(':')[0] === sH);
    if (hourIdx === -1) return;

    const durMin = (eH * 60 + eM) - (sH * 60 + sM);
    if (durMin <= 0) return;

    const rowH = cellHeight + gap;
    const top = rowTop + hourIdx * rowH + (sM / 60) * rowH;
    const height = Math.max((durMin / 60) * rowH - 2, 14);
    const left = colLeft + dayIdx * (cellWidth + gap);
    const width = cellWidth;

    const cls = j.jenis === 'praktikum' ? 'cal-praktikum' : j.jenis === 'bimbingan' ? 'cal-bimbingan' : '';

    const div = document.createElement('div');
    div.className = 'cal-item ' + cls;
    div.dataset.id = j.id;
    div.style.cssText =
      'position:absolute;top:' + top + 'px;left:' + left + 'px;width:' + width + 'px;' +
      'height:' + height + 'px;pointer-events:auto;';
    div.innerHTML =
      '<strong>' + escapeHtml(j.mata_kuliah) + '</strong><br>' +
      '<span>' + escapeHtml(j.ruang) + ' | ' + fmtJam(j.jam_mulai) + '-' + fmtJam(j.jam_selesai) + '</span>' +
      '<div class="item-actions">' +
      '<button class="btn-edit-item" data-id="' + j.id + '" title="Edit"><i class="fas fa-pen"></i></button>' +
      '<button class="btn-del-item" data-id="' + j.id + '" title="Hapus"><i class="fas fa-times"></i></button>' +
      '</div>';
    overlay.appendChild(div);
  });

  // Event delegation for edit/delete (single listener on overlay)
  overlay.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('btn-edit-item')) {
      e.stopPropagation();
      editJadwal(id);
    } else if (btn.classList.contains('btn-del-item')) {
      e.stopPropagation();
      if (confirm('Hapus jadwal ini?')) deleteJadwal(id);
    }
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
