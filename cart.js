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

function addToCart(id, name, price, img, sellerId) {
  // Compare ids as strings. Ids can arrive as numbers from one caller and
  // strings from another (e.g. from a data-id HTML attribute), and a plain
  // === would otherwise treat 5 and "5" as two different products.
  const existing = cart.find(item => String(item.id) === String(id));
  if (existing) {
    existing.qty++;
  } else {
    // sellerId is undefined for the default house catalog and set for
    // seller-listed products — carried through so a placed order can be
    // credited to the right seller's dashboard.
    cart.push({ id, name, price: Number(price) || 0, qty: 1, img: img || '', sellerId: sellerId || null });
  }
  saveCart();
  showToast(`Added ${name} to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(item => String(item.id) !== String(id));
  saveCart();
  if (window.location.pathname.includes('cart.html')) {
    renderCartPage();
  }
}

function updateCartQty(id, delta) {
  const item = cart.find(item => String(item.id) === String(id));
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
  const toastMsg = document.getElementById('toast-msg');
  if (toast && toastMsg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}

// Initialize badge on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
