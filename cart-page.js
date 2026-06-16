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
      <div class="cart-item-img" style="background-image: url('${escapeHtml(item.img || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80')}')"></div>
      <div>
        <div class="cart-item-name" style="font-weight:600;">${escapeHtml(item.name)}</div>
        <div style="color: var(--text-secondary);">${formatNGN(item.price)}</div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="cart-qty-btn" data-action="decrease" data-id="${escapeHtml(String(item.id))}" style="width: 28px; height: 28px; background: var(--bg-3); border: 1px solid var(--border); cursor: pointer;">-</button>
        <span style="min-width: 30px; text-align: center;">${item.qty}</span>
        <button class="cart-qty-btn" data-action="increase" data-id="${escapeHtml(String(item.id))}" style="width: 28px; height: 28px; background: var(--bg-3); border: 1px solid var(--border); cursor: pointer;">+</button>
        <button class="cart-remove" data-action="remove" data-id="${escapeHtml(String(item.id))}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; margin-left: 8px;">🗑️</button>
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

// Escapes text before it's inserted into innerHTML so a product name/image
// containing quotes, "<", or "&" can't break the row markup.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Event delegation for the qty +/- and remove buttons. Using data-id +
// addEventListener (instead of building an onclick="...('id')" string)
// avoids markup breaking on ids with quotes, and avoids the ===/!== type
// mismatch that happens when an id gets stringified into an attribute.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === 'increase') updateCartQty(id, 1);
  else if (action === 'decrease') updateCartQty(id, -1);
  else if (action === 'remove') removeFromCart(id);
});

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
});
