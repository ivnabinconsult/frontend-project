// Cart state - persists across pages
let cart = JSON.parse(localStorage.getItem('cyllux_cart') || '[]');

function saveCart() {
  localStorage.setItem('cyllux_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = total;
  }
}

function addToCart(id, name, price, img) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, qty: 1, img: img || '' });
  }
  saveCart();
  showToast(`Added ${name} to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  if (window.location.pathname.includes('cart.html')) {
    renderCartPage();
  }
}

function updateCartQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    saveCart();
    if (window.location.pathname.includes('cart.html')) {
      renderCartPage();
    }
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function clearCart() {
  cart = [];
  saveCart();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}

// Initialize badge on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});