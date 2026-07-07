/* ============================================
   CYLLUX STORE — PRODUCT, CART & ORDER DATA LAYER
   Backed by localStorage so the catalog you build in
   the Admin Panel shows up across every page.
   ============================================ */

(function (global) {
  const PRODUCTS_KEY = 'cyllux_products';
  const CART_KEY = 'cyllux_cart';
  const WISHLIST_KEY = 'cyllux_wishlist';
  const ORDERS_KEY = 'cyllux_orders';

  // ---------- low level storage helpers ----------
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (e) {
      console.error('CylluxStore: failed to read', key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('CylluxStore: failed to write', key, e);
      return false;
    }
  }

  // ---------- products ----------
  function getProducts() {
    return readJSON(PRODUCTS_KEY, []);
  }

  function saveProducts(products) {
    writeJSON(PRODUCTS_KEY, products);
  }

  function getProduct(id) {
    return getProducts().find(p => p.id === id) || null;
  }

  function addProduct(product) {
    const products = getProducts();
    const newProduct = Object.assign({
      id: 'p_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      createdAt: Date.now()
    }, product);
    products.unshift(newProduct);
    saveProducts(products);
    return newProduct;
  }

  function updateProduct(id, updates) {
    const products = getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = Object.assign({}, products[idx], updates);
    saveProducts(products);
    return products[idx];
  }

  function deleteProduct(id) {
    const products = getProducts().filter(p => p.id !== id);
    saveProducts(products);
  }

  function getCategories() {
    const cats = new Set(getProducts().map(p => (p.category || 'uncategorized').toLowerCase()));
    return Array.from(cats);
  }

  // ---------- cart ----------
  function getCart() {
    return readJSON(CART_KEY, []);
  }

  function saveCart(cart) {
    writeJSON(CART_KEY, cart);
    refreshCartBadges();
  }

  function addToCart(productId, qty) {
    qty = qty || 1;
    const cart = getCart();
    const existing = cart.find(i => i.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId: productId, qty: qty });
    }
    saveCart(cart);
  }

  function setCartQty(productId, qty) {
    let cart = getCart();
    if (qty <= 0) {
      cart = cart.filter(i => i.productId !== productId);
    } else {
      const item = cart.find(i => i.productId === productId);
      if (item) item.qty = qty;
    }
    saveCart(cart);
  }

  function removeFromCart(productId) {
    const cart = getCart().filter(i => i.productId !== productId);
    saveCart(cart);
  }

  function getCartDetails() {
    const cart = getCart();
    const products = getProducts();
    const details = [];
    const cleanedCart = [];
    let hadStaleEntries = false;

    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        details.push({ productId: item.productId, qty: item.qty, product: product });
        cleanedCart.push(item);
      } else {
        // product was deleted from the catalog since being added to the cart
        hadStaleEntries = true;
      }
    });

    if (hadStaleEntries) {
      writeJSON(CART_KEY, cleanedCart); // self-heal so the badge and cart page never disagree again
    }

    return details;
  }

  function getCartCount() {
    return getCartDetails().reduce((sum, e) => sum + e.qty, 0);
  }

  function getCartSubtotal() {
    return getCartDetails().reduce((sum, e) => sum + (e.product.price * e.qty), 0);
  }

  let activePromoRate = 0;

  function applyPromo(rate) {
    activePromoRate = rate;
    renderCartPage();
  }

  // ---------- wishlist ----------
  function getWishlist() {
    return readJSON(WISHLIST_KEY, []);
  }

  function saveWishlist(list) {
    writeJSON(WISHLIST_KEY, list);
  }

  function toggleWishlist(productId) {
    let list = getWishlist();
    let added;
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
      added = false;
    } else {
      list.push(productId);
      added = true;
    }
    saveWishlist(list);
    return added;
  }

  // ---------- orders ----------
  function getOrders() {
    return readJSON(ORDERS_KEY, []);
  }

  function saveOrders(orders) {
    writeJSON(ORDERS_KEY, orders);
  }

  function placeOrder() {
    const details = getCartDetails();
    if (!details.length) return null;
    const subtotal = getCartSubtotal();
    const shipping = 0;
    const tax = +(subtotal * 0.08).toFixed(2);
    const discount = +(subtotal * activePromoRate).toFixed(2);
    const total = +(subtotal + shipping + tax - discount).toFixed(2);
    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

    const order = {
      id: orderId,
      date: new Date().toISOString(),
      items: details.map(e => ({
        productId: e.productId,
        name: e.product.name,
        price: e.product.price,
        qty: e.qty
      })),
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      discount: discount,
      total: total,
      status: 'Processing'
    };

    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);

    saveCart([]);
    activePromoRate = 0;

    return orderId;
  }

  // ---------- currency ----------
  const CURRENCY_OVERRIDE_KEY = 'cyllux_currency_override';
  const RATES_CACHE_KEY = 'cyllux_rates_cache';
  const RATES_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

  const SUPPORTED_CURRENCIES = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    NGN: 'Nigerian Naira',
    KES: 'Kenyan Shilling',
    GHS: 'Ghanaian Cedi',
    ZAR: 'South African Rand',
    EGP: 'Egyptian Pound',
    INR: 'Indian Rupee',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar'
  };

  // fallback: guess a currency from the browser's own locale, used only
  // if IP-based geolocation lookup is unavailable (offline, blocked, etc.)
  const REGION_TO_CURRENCY = {
    US: 'USD', GB: 'GBP', NG: 'NGN', KE: 'KES', GH: 'GHS', ZA: 'ZAR',
    EG: 'EGP', IN: 'INR', CA: 'CAD', AU: 'AUD',
    DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR', PT: 'EUR'
  };

  let currentCurrency = 'USD';
  let currentRate = 1;

  function detectCurrencyFromLocale() {
    try {
      const locale = navigator.language || 'en-US';
      const region = locale.split('-')[1];
      if (region && REGION_TO_CURRENCY[region.toUpperCase()]) {
        return REGION_TO_CURRENCY[region.toUpperCase()];
      }
    } catch (e) { /* ignore */ }
    return 'USD';
  }

  function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
  }

  async function fetchGeoCurrency() {
    try {
      const res = await fetchWithTimeout('https://ipwho.is/', 4000);
      const data = await res.json();
      const code = data && data.currency && data.currency.code;
      if (code && SUPPORTED_CURRENCIES[code]) return code;
    } catch (e) { /* network unavailable or blocked — fall back silently */ }
    return null;
  }

  async function fetchRates() {
    const cached = readJSON(RATES_CACHE_KEY, null);
    if (cached && cached.rates && (Date.now() - cached.fetchedAt) < RATES_MAX_AGE_MS) {
      return cached.rates;
    }
    try {
      const res = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD', 4000);
      const data = await res.json();
      if (data && data.rates) {
        writeJSON(RATES_CACHE_KEY, { rates: data.rates, fetchedAt: Date.now() });
        return data.rates;
      }
    } catch (e) { /* network unavailable — use cache or flat 1:1 */ }
    return (cached && cached.rates) || null;
  }

  function getCurrentCurrency() {
    return currentCurrency;
  }

  async function setCurrency(code) {
    if (!SUPPORTED_CURRENCIES[code]) return;
    currentCurrency = code;
    writeJSON(CURRENCY_OVERRIDE_KEY, code);
    const rates = await fetchRates();
    currentRate = (rates && rates[code]) || 1;
    populateCurrencySelectors();
    refreshAllDisplays();
  }

  function populateCurrencySelectors() {
    document.querySelectorAll('#currencySelect').forEach(sel => {
      if (!sel.options.length) {
        sel.innerHTML = Object.keys(SUPPORTED_CURRENCIES).map(code =>
          '<option value="' + code + '">' + code + '</option>'
        ).join('');
      }
      sel.value = currentCurrency;
      if (!sel.dataset.cyWired) {
        sel.addEventListener('change', function () { setCurrency(this.value); });
        sel.dataset.cyWired = '1';
      }
    });
  }

  async function initCurrency() {
    populateCurrencySelectors(); // show something immediately, defaulting to USD

    const override = readJSON(CURRENCY_OVERRIDE_KEY, null);
    if (override && SUPPORTED_CURRENCIES[override]) {
      currentCurrency = override;
    } else {
      const geoCurrency = await fetchGeoCurrency();
      currentCurrency = geoCurrency || detectCurrencyFromLocale();
    }

    const rates = await fetchRates();
    currentRate = (rates && rates[currentCurrency]) || 1;

    populateCurrencySelectors();
    refreshAllDisplays();
  }

  function refreshAllDisplays() {
    renderProductGrid();
    refreshCartBadges();
    renderCartPage();
    renderCheckoutSummary();
    renderAccountOverview();
    renderCollectionCounts();
  }

  // ---------- formatting ----------
  // moneyUSD: always shows the raw base-currency (USD) value — used in the
  // Admin Panel where you enter and manage prices, independent of whichever
  // currency a shopper currently has selected.
  function moneyUSD(n) {
    return '$' + (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // money: customer-facing price, converted + formatted in the shopper's
  // detected or chosen currency. All internal math (cart totals, orders)
  // stays in USD; this only affects what's displayed.
  function money(n) {
    const converted = n * currentRate;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currentCurrency,
        maximumFractionDigits: currentCurrency === 'NGN' || currentCurrency === 'KES' ? 0 : 2
      }).format(converted);
    } catch (e) {
      return moneyUSD(converted);
    }
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function placeholderSvg() {
    return '<svg viewBox="0 0 200 200" fill="none" class="product-placeholder"><rect x="50" y="50" width="100" height="100" rx="10" stroke="currentColor" stroke-width="3"/><path d="M50 130l30-35 25 25 20-22 25 32" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="80" cy="80" r="10" stroke="currentColor" stroke-width="3"/></svg>';
  }

  // ---------- badge / drawer refresh (every page) ----------
  function refreshCartBadges() {
    const count = getCartCount();
    document.querySelectorAll('#cartBadge').forEach(el => { el.textContent = count; });
    document.querySelectorAll('#mobileCartLink').forEach(el => { el.textContent = 'Cart (' + count + ')'; });
    renderCartDrawer();
  }

  function renderCartDrawer() {
    const container = document.getElementById('cartDrawerItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    if (!container) return;

    const details = getCartDetails();

    if (!details.length) {
      container.innerHTML = '<div class="cart-drawer-empty" style="padding:32px 8px;text-align:center;color:var(--color-text-tertiary);font-size:14px;">Your cart is empty.</div>';
      if (subtotalEl) subtotalEl.textContent = money(0);
      return;
    }

    container.innerHTML = details.map(entry => {
      const p = entry.product;
      const img = p.image
        ? '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" style="width:100%;height:100%;object-fit:cover;">'
        : placeholderSvg();
      return (
        '<div class="cart-item" data-product-id="' + p.id + '">' +
          '<div class="cart-item-img">' + img + '</div>' +
          '<div class="cart-item-info">' +
            '<h4>' + escapeHtml(p.name) + '</h4>' +
            '<div class="cart-item-qty">' +
              '<button class="qty-btn" data-action="decrease" data-id="' + p.id + '">-</button>' +
              '<span>' + entry.qty + '</span>' +
              '<button class="qty-btn" data-action="increase" data-id="' + p.id + '">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item-price">$' + p.price + '</div>' +
          '<button class="cart-item-remove" data-id="' + p.id + '" aria-label="Remove item">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
          '</button>' +
        '</div>'
      );
    }).join('');

    if (subtotalEl) subtotalEl.textContent = money(getCartSubtotal());

    container.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const details = getCartDetails();
        const entry = details.find(e => e.productId === id);
        if (!entry) return;
        const delta = this.dataset.action === 'increase' ? 1 : -1;
        setCartQty(id, entry.qty + delta);
      });
    });

    container.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', function () {
        removeFromCart(this.dataset.id);
      });
    });
  }

  // ---------- product grid rendering (home + shop pages) ----------
  function buildProductCard(product) {
    const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
    const outOfStock = (product.stock != null && product.stock <= 0);
    const img = product.image
      ? '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" style="width:100%;height:100%;object-fit:cover;">'
      : placeholderSvg();

    const badge = outOfStock
      ? '<span class="product-badge" style="background:var(--color-text-tertiary);color:#fff;">Sold Out</span>'
      : (onSale ? '<span class="product-badge product-badge-sale">-' + Math.round((1 - product.price / product.compareAtPrice) * 100) + '%</span>' : '');

    const priceHtml = onSale
      ? '<span class="product-price-current">' + money(product.price) + '</span><span class="product-price-old">' + money(product.compareAtPrice) + '</span>'
      : '<span class="product-price-current">' + money(product.price) + '</span>';

    return (
      '<article class="product-card" data-category="' + escapeHtml((product.category || '').toLowerCase()) + '" data-id="' + product.id + '" data-price="' + product.price + '" data-stock="' + (product.stock || 0) + '" data-sale="' + (onSale ? '1' : '0') + '" data-name="' + escapeHtml((product.name || '').toLowerCase()) + '" data-created="' + (product.createdAt || 0) + '">' +
        '<div class="product-img">' + img + badge +
          '<button class="product-wishlist cy-wishlist" data-id="' + product.id + '" aria-label="Add to wishlist">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' +
          '</button>' +
          '<div class="product-actions">' +
            '<button class="product-action-btn cy-add-to-cart" data-id="' + product.id + '" aria-label="Add to cart" ' + (outOfStock ? 'disabled style="opacity:.4;cursor:not-allowed;"' : '') + '>' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="product-info">' +
          '<span class="product-cat">' + escapeHtml(product.category || 'Uncategorized') + '</span>' +
          '<h3 class="product-name">' + escapeHtml(product.name) + '</h3>' +
          '<div class="product-price">' + priceHtml + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const emptyState = document.getElementById('productEmptyState');
    let products = getProducts();

    const limit = parseInt(grid.dataset.limit, 10);
    if (limit) products = products.slice(0, limit);

    if (!products.length) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = '';
      const resultsEl = document.getElementById('shopResultsCount');
      if (resultsEl) resultsEl.textContent = 'No products yet';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = products.map(buildProductCard).join('');

    const resultsEl = document.getElementById('shopResultsCount');
    if (resultsEl) resultsEl.textContent = 'Showing ' + products.length + ' of ' + getProducts().length + ' products';

    wireProductGridEvents(grid);
    wireCategoryTabs();
    wireShopFilters();
  }

  // ---------- shop sidebar filters (category / price / stock / sale / sort) ----------
  const CATEGORY_FILTER_KEYWORDS = {
    'interior design': ['interior', 'design', 'decor', 'living'],
    'tech & gadgets': ['tech', 'gadget', 'electronic'],
    'household furniture': ['furniture', 'chair', 'sofa', 'table', 'household'],
    'lighting': ['lighting', 'lamp', 'light'],
    'decor': ['decor', 'accent', 'ornament']
  };

  function wireShopFilters() {
    const sidebar = document.querySelector('.shop-sidebar');
    const grid = document.getElementById('productGrid');
    if (!sidebar || !grid) return;

    const categoryLabels = Array.from(sidebar.querySelectorAll('.filter-group:nth-of-type(1) .filter-list label'));
    const allCheckbox = categoryLabels[0] ? categoryLabels[0].querySelector('input') : null;
    const categoryCheckboxes = categoryLabels.slice(1);
    const inStockCheckbox = sidebar.querySelector('.filter-group:nth-of-type(3) .filter-list label:nth-of-type(1) input');
    const onSaleCheckbox = sidebar.querySelector('.filter-group:nth-of-type(3) .filter-list label:nth-of-type(2) input');
    const priceInputs = sidebar.querySelectorAll('.price-range input');
    const minPriceInput = priceInputs[0];
    const maxPriceInput = priceInputs[1];
    const sortSelect = document.querySelector('.shop-sort');

    // URL ?category= support (from homepage category links / footer links)
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = (urlParams.get('category') || '').toLowerCase().trim();

    function applyFilters() {
      const checkedCategoryKeywords = [];
      categoryCheckboxes.forEach(label => {
        const input = label.querySelector('input');
        if (input && input.checked) {
          const text = label.textContent.trim().toLowerCase();
          checkedCategoryKeywords.push(...(CATEGORY_FILTER_KEYWORDS[text] || [text]));
        }
      });

      const minPrice = minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
      const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;
      const requireStock = inStockCheckbox ? inStockCheckbox.checked : false;
      const requireSale = onSaleCheckbox ? onSaleCheckbox.checked : false;

      let visibleCount = 0;
      const cards = Array.from(grid.querySelectorAll('.product-card'));

      cards.forEach(card => {
        const category = card.dataset.category || '';
        const name = card.dataset.name || '';
        const price = parseFloat(card.dataset.price) || 0;
        const stock = parseInt(card.dataset.stock, 10) || 0;
        const sale = card.dataset.sale === '1';

        const matchesUrlCategory = !urlCategory || category.includes(urlCategory) || name.includes(urlCategory);
        const matchesCheckedCategories = !checkedCategoryKeywords.length ||
          checkedCategoryKeywords.some(k => category.includes(k) || name.includes(k));
        const matchesPrice = price >= minPrice && price <= maxPrice;
        const matchesStock = !requireStock || stock > 0;
        const matchesSale = !requireSale || sale;

        const visible = matchesUrlCategory && matchesCheckedCategories && matchesPrice && matchesStock && matchesSale;
        card.classList.toggle('hidden', !visible);
        if (visible) visibleCount++;
      });

      const resultsEl = document.getElementById('shopResultsCount');
      if (resultsEl) resultsEl.textContent = 'Showing ' + visibleCount + ' of ' + getProducts().length + ' products';

      applySort();
    }

    function applySort() {
      if (!sortSelect) return;
      const mode = sortSelect.value;
      const cards = Array.from(grid.querySelectorAll('.product-card'));

      let sorted = cards;
      if (mode === 'Price: Low to High') {
        sorted = cards.slice().sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
      } else if (mode === 'Price: High to Low') {
        sorted = cards.slice().sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
      } else if (mode === 'Newest') {
        sorted = cards.slice().sort((a, b) => parseFloat(b.dataset.created) - parseFloat(a.dataset.created));
      }
      // "Featured" / "Best Rated" fall back to catalog order (no rating data collected).

      sorted.forEach(card => grid.appendChild(card));
    }

    if (allCheckbox && !allCheckbox.dataset.cyWired) {
      allCheckbox.addEventListener('change', function () {
        if (this.checked) {
          categoryCheckboxes.forEach(label => { const i = label.querySelector('input'); if (i) i.checked = false; });
        }
        applyFilters();
      });
      allCheckbox.dataset.cyWired = '1';
    }

    categoryCheckboxes.forEach(label => {
      const input = label.querySelector('input');
      if (!input || input.dataset.cyWired) return;
      input.addEventListener('change', function () {
        if (this.checked && allCheckbox) allCheckbox.checked = false;
        const anyChecked = categoryCheckboxes.some(l => { const i = l.querySelector('input'); return i && i.checked; });
        if (!anyChecked && allCheckbox) allCheckbox.checked = true;
        applyFilters();
      });
      input.dataset.cyWired = '1';
    });

    [inStockCheckbox, onSaleCheckbox].forEach(cb => {
      if (cb && !cb.dataset.cyWired) {
        cb.addEventListener('change', applyFilters);
        cb.dataset.cyWired = '1';
      }
    });

    [minPriceInput, maxPriceInput].forEach(input => {
      if (input && !input.dataset.cyWired) {
        input.addEventListener('input', applyFilters);
        input.dataset.cyWired = '1';
      }
    });

    if (sortSelect && !sortSelect.dataset.cyWired) {
      sortSelect.addEventListener('change', applyFilters);
      sortSelect.dataset.cyWired = '1';
    }

    // Pre-check the matching category checkbox if arriving via a ?category= link
    if (urlCategory) {
      const match = categoryCheckboxes.find(label => {
        const text = label.textContent.trim().toLowerCase();
        const keywords = CATEGORY_FILTER_KEYWORDS[text] || [text];
        return keywords.some(k => urlCategory.includes(k) || k.includes(urlCategory));
      });
      if (match) {
        const input = match.querySelector('input');
        if (input) input.checked = true;
        if (allCheckbox) allCheckbox.checked = false;
      }
    }

    applyFilters();
  }

  function renderCollectionCounts() {
    const cards = document.querySelectorAll('.collection-card[data-collection-keywords]');
    if (!cards.length) return;

    const products = getProducts();

    cards.forEach(card => {
      const keywords = card.dataset.collectionKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
      const count = products.filter(p => {
        const category = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return keywords.some(k => category.includes(k) || name.includes(k));
      }).length;

      const countEl = card.querySelector('.collection-count');
      if (!countEl) return;
      countEl.textContent = count === 0 ? 'No products yet' : (count + (count === 1 ? ' Product' : ' Products'));
    });
  }

  function wireProductGridEvents(grid) {
    grid.querySelectorAll('.cy-add-to-cart').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (this.hasAttribute('disabled')) return;
        const id = this.dataset.id;
        const product = getProduct(id);
        addToCart(id, 1);
        if (typeof window.showToast === 'function') {
          window.showToast((product ? product.name : 'Item') + ' added to cart');
        }
        const badge = document.getElementById('cartBadge');
        if (badge) {
          badge.style.transform = 'scale(1.4)';
          setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
        }
      });
    });

    grid.querySelectorAll('.cy-wishlist').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const id = this.dataset.id;
        const product = getProduct(id);
        const added = toggleWishlist(id);
        this.classList.toggle('active', added);
        if (typeof window.showToast === 'function') {
          window.showToast((product ? product.name : 'Item') + (added ? ' added to wishlist' : ' removed from wishlist'));
        }
      });
    });

    // reflect existing wishlist state
    const wishlist = getWishlist();
    grid.querySelectorAll('.cy-wishlist').forEach(btn => {
      if (wishlist.includes(btn.dataset.id)) btn.classList.add('active');
    });
  }

  function wireCategoryTabs() {
    const tabs = document.querySelectorAll('.product-tab');
    if (!tabs.length) return;

    // Build tabs dynamically from actual product categories (keep "All")
    const tabsContainer = tabs[0].parentElement;
    const categories = getCategories();
    const existingTabs = Array.from(tabsContainer.querySelectorAll('.product-tab'));
    const dynamicallyBuilt = tabsContainer.dataset.cyBuilt === '1';

    if (!dynamicallyBuilt) {
      const allBtn = existingTabs.find(t => t.dataset.tab === 'all') || existingTabs[0];
      tabsContainer.innerHTML = '';
      const allButton = document.createElement('button');
      allButton.className = 'product-tab active';
      allButton.dataset.tab = 'all';
      allButton.textContent = 'All';
      tabsContainer.appendChild(allButton);

      categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'product-tab';
        btn.dataset.tab = cat;
        btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        tabsContainer.appendChild(btn);
      });
      tabsContainer.dataset.cyBuilt = '1';
    }

    tabsContainer.querySelectorAll('.product-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        tabsContainer.querySelectorAll('.product-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const category = this.dataset.tab;
        document.querySelectorAll('#productGrid .product-card').forEach(card => {
          if (category === 'all' || card.dataset.category === category) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  // ---------- cart page (cart.html) ----------
  function renderCartPage() {
    const list = document.getElementById('cartItemsList');
    if (!list) return;

    const details = getCartDetails();
    const countEl = document.getElementById('cartItemCount');
    const subtotalEl = document.getElementById('summarySubtotal');
    const totalEl = document.getElementById('summaryTotal');
    const layout = document.getElementById('cartLayout');

    const count = details.reduce((s, e) => s + e.qty, 0);
    if (countEl) countEl.textContent = count + ' item' + (count !== 1 ? 's' : '');

    if (!details.length) {
      if (layout) {
        layout.innerHTML = '<div class="cart-empty" style="grid-column:1/-1;">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="80" height="80"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
          '<h3>Your cart is empty</h3>' +
          '<p>Looks like you haven&rsquo;t added anything yet.</p>' +
          '<a href="shop.html" class="btn btn-primary">Start Shopping</a>' +
        '</div>';
      }
      return;
    }

    list.innerHTML = details.map(entry => {
      const p = entry.product;
      const img = p.image
        ? '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">'
        : placeholderSvg();
      return (
        '<div class="cart-page-item" data-id="' + p.id + '">' +
          '<div class="cart-page-item-img">' + img + '</div>' +
          '<div class="cart-page-item-info">' +
            '<h4>' + escapeHtml(p.name) + '</h4>' +
            '<p>' + escapeHtml(p.category || '') + '</p>' +
            '<div class="cart-page-item-qty">' +
              '<button class="qty-decrease" data-id="' + p.id + '">-</button>' +
              '<span class="qty-value">' + entry.qty + '</span>' +
              '<button class="qty-increase" data-id="' + p.id + '">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-page-item-price">' + money(p.price * entry.qty) + '</div>' +
          '<button class="cart-page-item-remove" data-id="' + p.id + '" aria-label="Remove item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
        '</div>'
      );
    }).join('');

    const subtotal = getCartSubtotal();
    const discounted = subtotal * (1 - activePromoRate);
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (totalEl) totalEl.textContent = money(discounted);

    list.querySelectorAll('.qty-increase').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const entry = getCartDetails().find(e => e.productId === id);
        if (entry) setCartQty(id, entry.qty + 1);
        renderCartPage();
      });
    });
    list.querySelectorAll('.qty-decrease').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const entry = getCartDetails().find(e => e.productId === id);
        if (entry) setCartQty(id, entry.qty - 1);
        renderCartPage();
      });
    });
    list.querySelectorAll('.cart-page-item-remove').forEach(btn => {
      btn.addEventListener('click', function () {
        removeFromCart(this.dataset.id);
        renderCartPage();
      });
    });
  }

  // ---------- checkout page ----------
  function renderCheckoutSummary() {
    const container = document.getElementById('checkoutOrderItems');
    if (!container) return;
    const details = getCartDetails();

    if (!details.length) {
      container.innerHTML = '<p style="color:var(--color-text-tertiary);font-size:14px;">Your cart is empty. <a href="shop.html" class="link-arrow">Continue shopping</a></p>';
    } else {
      container.innerHTML = details.map(entry => {
        const p = entry.product;
        const img = p.image
          ? '<img src="' + escapeHtml(p.image) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">'
          : placeholderSvg();
        return (
          '<div class="order-item">' +
            '<div class="order-item-img">' + img + '</div>' +
            '<div class="order-item-info"><h5>' + escapeHtml(p.name) + '</h5><p>Qty: ' + entry.qty + '</p></div>' +
            '<div class="order-item-price">' + money(p.price * entry.qty) + '</div>' +
          '</div>'
        );
      }).join('');
    }
    updateCheckoutTotals(0);
  }

  function updateCheckoutTotals(shipping) {
    const subtotal = getCartSubtotal();
    const tax = subtotal * 0.08;
    const discount = subtotal * activePromoRate;
    const total = subtotal + shipping + tax - discount;

    const subEl = document.getElementById('checkoutSubtotal');
    const shipEl = document.getElementById('shippingCost');
    const taxEl = document.getElementById('checkoutTax');
    const totalEl = document.getElementById('orderTotal');

    if (subEl) subEl.textContent = money(subtotal);
    if (shipEl) shipEl.textContent = money(shipping);
    if (taxEl) taxEl.textContent = money(tax);
    if (totalEl) totalEl.textContent = money(total);
  }

  // ---------- account page ----------
  function orderStatusClass(status) {
    switch ((status || '').toLowerCase()) {
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      default: return 'status-processing';
    }
  }

  function renderOrderRow(order) {
    const date = new Date(order.date);
    const dateStr = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
    return (
      '<div class="order-row">' +
        '<div><h5>' + escapeHtml(order.id) + '</h5><p>' + dateStr + '</p></div>' +
        '<div><p>' + itemCount + ' item' + (itemCount !== 1 ? 's' : '') + '</p></div>' +
        '<div><p>' + money(order.total) + '</p></div>' +
        '<div><span class="order-status ' + orderStatusClass(order.status) + '">' + escapeHtml(order.status) + '</span></div>' +
      '</div>'
    );
  }

  function renderAccountOverview() {
    const recentList = document.getElementById('recentOrdersList');
    const allList = document.getElementById('allOrdersList');
    if (!recentList && !allList) return;

    const orders = getOrders();
    const wishlist = getWishlist();
    const products = getProducts();

    const statOrders = document.getElementById('statTotalOrders');
    const statWishlist = document.getElementById('statWishlistItems');
    if (statOrders) statOrders.textContent = orders.length;
    if (statWishlist) statWishlist.textContent = wishlist.length;

    if (recentList) {
      const recent = orders.slice(0, 3);
      recentList.innerHTML = recent.map(renderOrderRow).join('');
      const emptyEl = document.getElementById('recentOrdersEmpty');
      if (emptyEl) emptyEl.style.display = recent.length ? 'none' : '';
    }

    if (allList) {
      allList.innerHTML = orders.map(renderOrderRow).join('');
      const emptyEl = document.getElementById('allOrdersEmpty');
      if (emptyEl) emptyEl.style.display = orders.length ? 'none' : '';
    }

    const wishlistGrid = document.getElementById('wishlistGrid');
    if (wishlistGrid) {
      const items = wishlist.map(id => products.find(p => p.id === id)).filter(Boolean);
      const emptyEl = document.getElementById('wishlistEmpty');
      if (emptyEl) emptyEl.style.display = items.length ? 'none' : '';
      wishlistGrid.innerHTML = items.map(p => {
        const img = p.image
          ? '<img src="' + escapeHtml(p.image) + '" alt="" style="width:100%;height:100%;object-fit:cover;">'
          : placeholderSvg();
        return (
          '<div class="wishlist-item">' +
            '<button class="wishlist-remove" data-id="' + p.id + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
            '<div class="wishlist-item-img">' + img + '</div>' +
            '<div class="wishlist-item-info"><h5>' + escapeHtml(p.name) + '</h5><p>' + money(p.price) + '</p><div class="wishlist-item-actions"><button class="btn btn-primary cy-wishlist-add" data-id="' + p.id + '">Add to Cart</button></div></div>' +
          '</div>'
        );
      }).join('');

      wishlistGrid.querySelectorAll('.wishlist-remove').forEach(btn => {
        btn.addEventListener('click', function () {
          toggleWishlist(this.dataset.id);
          renderAccountOverview();
        });
      });
      wishlistGrid.querySelectorAll('.cy-wishlist-add').forEach(btn => {
        btn.addEventListener('click', function () {
          addToCart(this.dataset.id, 1);
          if (typeof window.showToast === 'function') window.showToast('Added to cart');
        });
      });
    }
  }

  function renderSearchSuggestions() {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    const products = getProducts().slice(0, 6);
    if (!products.length) {
      container.innerHTML = '<div class="search-suggestion-group"><h4>Trending</h4><p style="font-size:13px;color:var(--color-text-tertiary);">No products yet — visit the <a href="admin.html" class="link-arrow">Admin Panel</a> to add some.</p></div>';
      return;
    }
    container.innerHTML = '<div class="search-suggestion-group"><h4>Trending</h4>' +
      products.map(p => '<a href="shop.html" class="search-suggestion">' + escapeHtml(p.name) + '</a>').join('') +
      '</div>';
  }

  function wireSearchInput() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('input', function () {
      const q = this.value.trim().toLowerCase();
      const container = document.getElementById('searchSuggestions');
      if (!container) return;
      if (!q) { renderSearchSuggestions(); return; }
      const matches = getProducts().filter(p => (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
      if (!matches.length) {
        container.innerHTML = '<div class="search-suggestion-group"><h4>No matches</h4><p style="font-size:13px;color:var(--color-text-tertiary);">Try a different search term.</p></div>';
        return;
      }
      container.innerHTML = '<div class="search-suggestion-group"><h4>Results</h4>' +
        matches.slice(0, 8).map(p => '<a href="shop.html" class="search-suggestion">' + escapeHtml(p.name) + '</a>').join('') +
        '</div>';
    });
  }

  // ---------- init on every page ----------
  document.addEventListener('DOMContentLoaded', function () {
    renderProductGrid();
    refreshCartBadges();
    renderSearchSuggestions();
    wireSearchInput();
    renderCollectionCounts();
    initCurrency();
  });

  // ---------- public API ----------
  global.CylluxStore = {
    // products
    getProducts, saveProducts, getProduct, addProduct, updateProduct, deleteProduct, getCategories,
    // cart
    getCart, addToCart, setCartQty, removeFromCart, getCartCount, getCartDetails, getCartSubtotal, applyPromo,
    // wishlist
    getWishlist, toggleWishlist,
    // orders
    getOrders, placeOrder,
    // rendering
    renderProductGrid, renderCartDrawer, renderCartPage, renderCheckoutSummary, updateCheckoutTotals,
    renderAccountOverview, refreshCartBadges, renderCollectionCounts,
    // currency
    getCurrentCurrency, setCurrency, SUPPORTED_CURRENCIES,
    // utils
    money, moneyUSD, escapeHtml
  };
})(window);
