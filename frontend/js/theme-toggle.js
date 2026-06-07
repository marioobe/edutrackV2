(function() {
  const KEY = 'edutrack-theme';
  const btn = document.getElementById('btnThemeToggle');
  const icon = btn ? btn.querySelector('i') : null;

  function getTheme() {
    return localStorage.getItem(KEY) || 'dark';
  }

  function setTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem(KEY, theme);
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (btn) {
      btn.title = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
    }
  }

  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // Apply saved theme on load
  setTheme(getTheme());

  // Expose toggle function globally
  window.toggleTheme = toggleTheme;
})();
