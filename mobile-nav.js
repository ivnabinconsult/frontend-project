// Mobile navigation toggle — shared across all pages
function toggleMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  const isOpen = navLinks.classList.toggle('mobile-open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
}

// Close mobile nav when a link is clicked
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      const navLinks = document.querySelector('.nav-links');
      const hamburger = document.getElementById('hamburger');
      if (navLinks) navLinks.classList.remove('mobile-open');
      if (hamburger) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', function (e) {
    const nav = document.getElementById('main-nav');
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.getElementById('hamburger');
    if (nav && !nav.contains(e.target)) {
      if (navLinks) navLinks.classList.remove('mobile-open');
      if (hamburger) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });
});
