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

// Load saved theme
const savedTheme = localStorage.getItem('cyllux_theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeLabel = document.getElementById('theme-label');
  if (themeLabel) {
    themeLabel.textContent = savedTheme === 'dark' ? 'Dark' : 'Light';
  }
}