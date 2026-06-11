let currentProduct = null;
let currentQty = 1;

function getProductFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  return products.find(p => p.id === id);
}

function loadProduct() {
  currentProduct = getProductFromURL();
  if (!currentProduct) {
    window.location.href = 'products.html';
    return;
  }
  
  document.getElementById('detail-cat-label').textContent = currentProduct.cat;
  document.getElementById('detail-title').textContent = currentProduct.name;
  document.getElementById('detail-price').textContent = formatNGN(currentProduct.price);
  document.getElementById('detail-desc').textContent = currentProduct.desc;
  document.getElementById('detail-main-img').style.backgroundImage = `url('${currentProduct.imgs[0]}')`;
  document.getElementById('qty-display').textContent = '1';
  currentQty = 1;
}

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('qty-display').textContent = currentQty;
}

function addCurrentToCart() {
  if (currentProduct) {
    for (let i = 0; i < currentQty; i++) {
      addToCart(currentProduct.id, currentProduct.name, currentProduct.price, currentProduct.imgs[0]);
    }
    showToast(`Added ${currentQty} × ${currentProduct.name} to cart`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProduct();
});