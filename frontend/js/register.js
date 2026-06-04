document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;
  const errEl = document.getElementById('errorMsg');
  const btn = document.getElementById('btnRegister');

  if (password !== confirm) {
    errEl.textContent = 'Konfirmasi password tidak cocok.';
    errEl.classList.remove('d-none');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Memproses...';

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.message;
      errEl.classList.remove('d-none');
      btn.disabled = false;
      btn.textContent = 'Daftar';
      return;
    }
    alert('Registrasi berhasil! Silakan login.');
    window.location.href = 'login.html';
  } catch (err) {
    errEl.textContent = 'Gagal terhubung ke server.';
    errEl.classList.remove('d-none');
    btn.disabled = false;
    btn.textContent = 'Daftar';
  }
});
