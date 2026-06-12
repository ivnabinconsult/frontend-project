function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<div class="empty-cart">Your cart is empty. <a href="products.html" style="color: var(--crimson);">Continue Shopping</a></div>';
    updateCartSummary(0);
    return;
  }
  
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img" style="background-image: url('${item.img || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'}')"></div>
      <div>
        <div class="cart-item-name" style="font-weight:600;">${item.name}</div>
        <div style="color: var(--text-secondary);">${formatNGN(item.price)}</div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', -1)" style="width: 28px; height: 28px; background: var(--bg-3); border: 1px solid var(--border); cursor: pointer;">-</button>
        <span style="min-width: 30px; text-align: center;">${item.qty}</span>
        <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', 1)" style="width: 28px; height: 28px; background: var(--bg-3); border: 1px solid var(--border); cursor: pointer;">+</button>
        <button class="cart-remove" onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; margin-left: 8px;">🗑️</button>
      </div>
    </div>
  `).join('');
  
  const subtotal = getCartTotal();
  updateCartSummary(subtotal);
}

function updateCartSummary(subtotal) {
  const vat = Math.round(subtotal * 0.075);
  const total = subtotal + vat;
  
  const subtotalEl = document.getElementById('summary-subtotal');
  const vatEl = document.getElementById('summary-vat');
  const totalEl = document.getElementById('summary-total');
  
  if (subtotalEl) subtotalEl.textContent = formatNGN(subtotal);
  if (vatEl) vatEl.textContent = formatNGN(vat);
  if (totalEl) totalEl.textContent = formatNGN(total);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
});