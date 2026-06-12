function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  
  const themeLabel = document.getElementById('theme-label');
  if (themeLabel) {
    themeLabel.textContent = newTheme === 'dark' ? 'Dark' : 'Light';
  }
  
  localStorage.setItem('cyllux_theme', newTheme);
}

// Apply saved theme immediately (before paint) and update label once DOM is ready
(function () {
  const savedTheme = localStorage.getItem('cyllux_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  // Update the label text after DOM is available
  function applyThemeLabel() {
    const themeLabel = document.getElementById('theme-label');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (themeLabel) {
      themeLabel.textContent = currentTheme === 'dark' ? 'Dark' : 'Light';
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyThemeLabel);
  } else {
    applyThemeLabel();
  }
}());