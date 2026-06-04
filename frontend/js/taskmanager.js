function konversiNilai(angka) {
  if (angka >= 85) return 4.00;
  if (angka >= 80) return 3.70;
  if (angka >= 75) return 3.30;
  if (angka >= 70) return 3.00;
  if (angka >= 65) return 2.70;
  if (angka >= 60) return 2.30;
  if (angka >= 55) return 2.00;
  if (angka >= 50) return 1.70;
  if (angka >= 40) return 1.00;
  return 0.00;
}
(function() {
  const api = 'http://localhost:3000/api';
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch(api + '/tugas', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.json())
    .then(data => {
      const list = Array.isArray(data) ? data : [];
      const aktif = list.filter(t => !t.is_done);
      document.getElementById('statTugasAktif').textContent = aktif.length;
    })
    .catch(() => document.getElementById('statTugasAktif').textContent = '0');

  fetch(api + '/jadwal', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.json())
    .then(data => {
      const list = Array.isArray(data) ? data : [];
      document.getElementById('statJadwal').textContent = list.length;
    })
    .catch(() => document.getElementById('statJadwal').textContent = '0');

  fetch(api + '/nilai', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.json())
    .then(data => {
      const list = Array.isArray(data) ? data : [];
      let totalBobot = 0, totalSks = 0;
      list.forEach(n => {
        if (n.sks && n.nilai_angka !== undefined && n.nilai_angka !== null) {
          totalSks += n.sks;
          totalBobot += n.sks * konversiNilai(n.nilai_angka);
        }
      });
      const ipk = totalSks > 0 ? (totalBobot / totalSks) : 0;
      document.getElementById('statIpk').textContent = ipk > 0 ? ipk.toFixed(2) : '-';
    })
    .catch(() => document.getElementById('statIpk').textContent = '-');
})();
