(function () {
  const token = localStorage.getItem('token');

  if (!token) {
    const current = window.location.pathname.split('/').pop();
    if (current !== 'login.html' && current !== 'register.html' && current !== 'index.html') {
      window.location.href = 'login.html?next=' + current;
    }
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      window.location.href = 'login.html?expired=1';
      return;
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
    return;
  }

  const userName = localStorage.getItem('userName') || 'User';
  const initial = userName.charAt(0).toUpperCase();

  const fill = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  fill('navUserName', userName);
  fill('navUserInitial', initial);
  fill('dropdownUserName', userName);
  fill('sidebarUserName', userName);
  fill('sidebarUserInitial', initial);

  const emailEl = document.getElementById('dropdownUserEmail');
  const prodiEl = document.getElementById('sidebarUserProdi');

  if (emailEl || prodiEl) {
    fetch('http://localhost:3000/api/auth/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(u => {
        if (emailEl) emailEl.textContent = u.email;
        if (prodiEl) prodiEl.textContent = u.prodi || '-';
        if (u.email) localStorage.setItem('userEmail', u.email);
      })
      .catch(() => {});
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      window.location.href = 'index.html';
    });
  }

  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
    });
    if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
      document.body.classList.add('sb-sidenav-toggled');
    }
  }
})();
