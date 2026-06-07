(function() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const btnLogin = document.getElementById('btnLogin');
  const navMenuLoggedIn = document.getElementById('navMenuLoggedIn');
  const navUserName = document.getElementById('navUserName');
  const btnLogout = document.getElementById('btnLogout');

  if (token && userName) {
    btnLogin.classList.add('d-none');
    navMenuLoggedIn.classList.remove('d-none');
    navUserName.textContent = userName;
    navUserName.classList.remove('d-none');

    document.getElementById('ctaTaskManager')?.setAttribute('href', 'taskmanager.html');
    document.getElementById('btnMulaiSekarang')?.setAttribute('href', 'taskmanager.html');
    const role = localStorage.getItem('userRole');
    const adminLink = document.getElementById('navAdminLink');
    if (adminLink) {
      if (role === 'admin') {
        adminLink.classList.remove('d-none');
      } else {
        adminLink.classList.add('d-none');
      }
    }

    document.getElementById('cardNilai')?.setAttribute('href', 'nilai.html');
    document.getElementById('cardJadwal')?.setAttribute('href', 'jadwal.html');
    document.getElementById('cardTugas')?.setAttribute('href', 'tugas.html');
    document.getElementById('footerTugas')?.setAttribute('href', 'tugas.html');
    document.getElementById('footerJadwal')?.setAttribute('href', 'jadwal.html');
    document.getElementById('footerNilai')?.setAttribute('href', 'nilai.html');
  }

  btnLogout.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
  });

  const api = 'http://localhost:3000/api';
  document.getElementById('btnSubscribe').addEventListener('click', function() {
    const email = document.getElementById('newsletterEmail').value.trim();
    const alertEl = document.getElementById('newsletterAlert');
    if (!email) {
      alertEl.className = 'alert alert-danger py-2 small mb-2';
      alertEl.textContent = 'Masukkan email terlebih dahulu.';
      alertEl.style.display = 'block';
      return;
    }
    fetch(api + '/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(r => r.json().then(data => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        alertEl.className = 'alert alert-success py-2 small mb-2';
        alertEl.textContent = 'Berhasil berlangganan! Terima kasih.';
        document.getElementById('newsletterEmail').value = '';
      } else {
        alertEl.className = 'alert alert-warning py-2 small mb-2';
        alertEl.textContent = data.message || 'Gagal berlangganan.';
      }
      alertEl.style.display = 'block';
    })
    .catch(() => {
      alertEl.className = 'alert alert-danger py-2 small mb-2';
      alertEl.textContent = 'Gagal terhubung ke server.';
      alertEl.style.display = 'block';
    });
  });

  document.getElementById('btnKirimPesan').addEventListener('click', function() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const alertEl = document.getElementById('contactAlert');
    if (!name || !email || !message) {
      alertEl.className = 'alert alert-danger py-2 small mb-3';
      alertEl.textContent = 'Semua field harus diisi.';
      alertEl.style.display = 'block';
      return;
    }
    fetch(api + '/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    })
    .then(r => r.json().then(data => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        alertEl.className = 'alert alert-success py-2 small mb-3';
        alertEl.textContent = 'Pesan berhasil dikirim! Kami akan merespon dalam 1x24 jam.';
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMessage').value = '';
      } else {
        alertEl.className = 'alert alert-danger py-2 small mb-3';
        alertEl.textContent = data.message || 'Gagal mengirim pesan.';
      }
      alertEl.style.display = 'block';
    })
    .catch(() => {
      alertEl.className = 'alert alert-danger py-2 small mb-3';
      alertEl.textContent = 'Gagal terhubung ke server.';
      alertEl.style.display = 'block';
    });
  });
})();
