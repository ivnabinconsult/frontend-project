let currentFilter = 'all';
let currentSort = 'default';
let maxPrice = 2000000;

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  
  let filtered = currentFilter === 'all' 
    ? [...products] 
    : products.filter(p => p.catKey === currentFilter);
  
  filtered = filtered.filter(p => p.price <= maxPrice);
  
  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="text-align:center; padding:60px;">No products found in this range.</div>';
    return;
  }
  
  grid.innerHTML = filtered.map(product => `
    <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
      <div class="product-card-img" style="background-image: url('${product.imgs[0]}')"></div>
      <div class="product-card-body">
        <div class="product-card-cat">${product.cat}</div>
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-desc">${product.desc.substring(0, 60)}...</div>
        <div class="product-card-footer">
          <div><span class="product-price">${formatNGN(product.price)}</span></div>
          <button class="card-add-btn" onclick="event.stopPropagation();addToCart('${product.id}','${product.name}',${product.price},'${product.imgs[0]}')">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function updatePriceRange(value) {
  maxPrice = parseInt(value);
  const priceVal = document.getElementById('priceVal');
  if (priceVal) {
    priceVal.textContent = `up to ${formatNGN(maxPrice)}`;
  }
  renderCatalog();
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  renderCatalog();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCatalog();
    });
  }
  
  const priceRange = document.getElementById('priceRange');
  if (priceRange) {
    priceRange.addEventListener('input', (e) => updatePriceRange(e.target.value));
  }
  
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setFilter(tab.dataset.filter, tab);
    });
  });
});