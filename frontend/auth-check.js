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
      localStorage.removeItem('userRole');
      window.location.href = 'login.html?expired=1';
      return;
    }

    if (payload.role) {
      localStorage.setItem('userRole', payload.role);
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
    return;
  }

  const currentPage = window.location.pathname.split('/').pop();
  const role = localStorage.getItem('userRole') || 'user';

  if (currentPage === 'broadcast.html' && role !== 'admin') {
    window.location.href = 'taskmanager.html';
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

  if (role === 'admin') {
    const nav = document.querySelector('.navbar-nav');
    const profilItem = nav?.querySelector('a[href="profile.html"]')?.closest('.nav-item');
    const existingBroadcast = nav?.querySelector('a[href="broadcast.html"]');
    if (nav && profilItem && !existingBroadcast) {
      const li = document.createElement('li');
      li.className = 'nav-item';
      const a = document.createElement('a');
      a.className = 'nav-link';
      a.href = 'broadcast.html';
      a.textContent = 'Broadcast';
      li.appendChild(a);
      profilItem.after(li);
    }
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
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
