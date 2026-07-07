/* ============================================
   CYLLUX E-COMMERCE — MAIN JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ===== HEADER SCROLL EFFECT =====
  const header = document.getElementById('header');
  let lastScroll = 0;

  function handleScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ===== MOBILE MENU =====
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // ===== SEARCH OVERLAY =====
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (searchInput) setTimeout(() => searchInput.focus(), 100);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function(e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeSearch();
      closeCartDrawer();
      closeMobileMenu();
    }
  });

  // ===== CART DRAWER =====
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerClose = document.getElementById('cartDrawerClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartBadge = document.getElementById('cartBadge');
  const cartSubtotal = document.getElementById('cartSubtotal');

  function openCartDrawer() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // ===== CART QUANTITY =====
  const qtyBtns = document.querySelectorAll('.qty-btn');
  qtyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const qtySpan = this.parentElement.querySelector('span');
      let qty = parseInt(qtySpan.textContent);

      if (this.dataset.action === 'increase') {
        qty++;
      } else if (this.dataset.action === 'decrease' && qty > 1) {
        qty--;
      }

      qtySpan.textContent = qty;
      updateCartTotal();
    });
  });

  // ===== REMOVE CART ITEM =====
  const removeBtns = document.querySelectorAll('.cart-item-remove');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.closest('.cart-item');
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';
      setTimeout(() => {
        item.remove();
        updateCartTotal();
        updateCartCount();
      }, 300);
    });
  });

  function updateCartTotal() {
    const items = document.querySelectorAll('.cart-item');
    let total = 0;
    let count = 0;

    items.forEach(item => {
      const priceText = item.querySelector('.cart-item-price').textContent;
      const price = parseFloat(priceText.replace('$', ''));
      const qty = parseInt(item.querySelector('.cart-item-qty span').textContent);
      total += price * qty;
      count += qty;
    });

    if (cartSubtotal) cartSubtotal.textContent = '$' + total.toFixed(0);
    if (cartBadge) cartBadge.textContent = count;
  }

  function updateCartCount() {
    const items = document.querySelectorAll('.cart-item');
    let count = 0;
    items.forEach(item => {
      count += parseInt(item.querySelector('.cart-item-qty span').textContent);
    });
    if (cartBadge) cartBadge.textContent = count;
  }

  // ===== ADD TO CART =====
  const addToCartBtns = document.querySelectorAll('.add-to-cart:not(.cy-add-to-cart)');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const productName = this.dataset.product;
      const price = this.dataset.price;

      showToast(productName + ' added to cart');

      // Animate cart badge
      if (cartBadge) {
        cartBadge.style.transform = 'scale(1.4)';
        setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
      }
    });
  });

  // ===== WISHLIST TOGGLE =====
  const wishlistBtns = document.querySelectorAll('.product-wishlist:not(.cy-wishlist)');
  wishlistBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      const productName = this.closest('.product-card').querySelector('.product-name a').textContent;

      if (this.classList.contains('active')) {
        showToast(productName + ' added to wishlist');
      } else {
        showToast(productName + ' removed from wishlist');
      }
    });
  });

  // ===== PRODUCT TABS =====
  const productTabs = document.querySelectorAll('.product-tab');
  const productCards = document.querySelectorAll('.product-card');

  productTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const category = this.dataset.tab;

      // Update active tab
      productTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Filter products
      productCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ===== NEWSLETTER FORM =====
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      showToast('Thanks for subscribing! Check your inbox.');
      this.reset();
    });
  }

  // ===== STATS COUNTER ANIMATION =====
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(easeProgress * target);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  // Intersection Observer for stats
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => statsObserver.observe(stat));

  // ===== SCROLL REVEAL =====
  const revealElements = document.querySelectorAll('.product-card, .category-card, .testimonial-card, .feature-banner, .stat-item, .newsletter, .social-item');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach((el, i) => {
    el.classList.add('reveal');
    el.classList.add('reveal-delay-' + ((i % 4) + 1));
    revealObserver.observe(el);
  });

  // ===== TOAST NOTIFICATION =====
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ===== PRODUCT COLOR SWATCHES =====
  const colorSwatches = document.querySelectorAll('.product-colors span');
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', function(e) {
      e.stopPropagation();
      const colorName = this.getAttribute('title');
      const productCard = this.closest('.product-card');
      const productName = productCard.querySelector('.product-name a').textContent;
      showToast(colorName + ' selected for ' + productName);
    });
  });

  // ===== HERO PARALLAX (subtle) =====
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', function() {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
      }
    }, { passive: true });
  }

  // ===== PREVENT BODY SCROLL WHEN OVERLAY IS OPEN =====
  function lockBody() {
    document.body.style.overflow = 'hidden';
  }

  function unlockBody() {
    document.body.style.overflow = '';
  }

  // ===== INITIALIZE =====
  console.log('%c Cyllux ', 'background: #111; color: #fff; font-size: 16px; font-weight: bold; padding: 8px 16px; border-radius: 8px;');
  console.log('%c Elevate Your Everyday ', 'color: #666; font-size: 12px;');

});
