// Hero canvas animation
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  function resizeAndDraw() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(220,20,60,0.12)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < canvas.width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
  }
  
  resizeAndDraw();
  window.addEventListener('resize', resizeAndDraw);
}

// Render featured products
function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  
  const featured = products.slice(0, 3);
  grid.innerHTML = featured.map(product => `
    <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
      <div class="product-card-img" style="background-image: url('${product.imgs[0]}')"></div>
      <div class="product-card-body">
        <div class="product-card-cat">${product.cat}</div>
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-footer">
          <div><span class="product-price">${formatNGN(product.price)}</span></div>
          <button class="card-add-btn" onclick="event.stopPropagation();addToCart('${product.id}','${product.name}',${product.price},'${product.imgs[0]}')">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  renderFeatured();
});