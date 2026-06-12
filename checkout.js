let currentStep = 1;

function renderCheckoutSummary() {
  const subtotal = getCartTotal();
  const vat = Math.round(subtotal * 0.075);
  const total = subtotal + vat;
  
  const totalEl = document.getElementById('co-total');
  if (totalEl) totalEl.textContent = formatNGN(total);
  
  const reviewContainer = document.getElementById('checkout-review-items');
  if (reviewContainer) {
    if (cart.length === 0) {
      reviewContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    } else {
      reviewContainer.innerHTML = cart.map(item => `
        <div class="summary-line">
          <span>${item.name} × ${item.qty}</span>
          <span>${formatNGN(item.price * item.qty)}</span>
        </div>
      `).join('');
    }
  }
}

function goToStep(step) {
  currentStep = step;
  const step1 = document.getElementById('checkout-step-1');
  const step2 = document.getElementById('checkout-step-2');
  
  if (step1) step1.style.display = step === 1 ? 'block' : 'none';
  if (step2) step2.style.display = step === 2 ? 'block' : 'none';
}

function selectPayment(el) {
  document.querySelectorAll('.payment-method').forEach(m => {
    m.classList.remove('active');
  });
  el.classList.add('active');
}

function placeOrder() {
  if (cart.length === 0) {
    showToast('Your cart is empty');
    return;
  }
  
  const firstName = document.getElementById('firstname')?.value;
  const lastName = document.getElementById('lastname')?.value;
  const email = document.getElementById('email')?.value;
  
  if (!firstName || !lastName || !email) {
    showToast('Please fill in all shipping information');
    goToStep(1);
    return;
  }
  
  // Process order
  clearCart();
  showToast('Order placed successfully! Thank you for shopping with Cyllux Homes.');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();
  
  // If cart is empty, redirect
  if (cart.length === 0) {
    showToast('Your cart is empty');
    setTimeout(() => {
      window.location.href = 'products.html';
    }, 1500);
  }
});