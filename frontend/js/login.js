const params = new URLSearchParams(window.location.search);
if (params.get('expired') === '1') {
  document.getElementById('expiredBanner').classList.remove('d-none');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('errorMsg');
  const btn = document.getElementById('btnLogin');
  btn.disabled = true;
  btn.textContent = 'Memproses...';

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.message;
      errEl.classList.remove('d-none');
      btn.disabled = false;
      btn.textContent = 'Masuk';
      return;
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.user.name);
    localStorage.setItem('userRole', data.user.role || 'user');
    const next = params.get('next') || 'taskmanager.html';
    window.location.href = next;
  } catch (err) {
    errEl.textContent = 'Gagal terhubung ke server.';
    errEl.classList.remove('d-none');
    btn.disabled = false;
    btn.textContent = 'Masuk';
  }
});
