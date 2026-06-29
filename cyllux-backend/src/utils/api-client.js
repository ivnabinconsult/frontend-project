/**
 * api.js — Cyllux Homes frontend API client
 * Drop this file alongside your other JS files and include it before any
 * script that calls these functions.
 *
 * Usage:
 *   <script src="api.js"></script>
 */

const API_BASE = 'http://localhost:4000/api'; // Change to your deployed URL in production

/* ── Token helpers ─────────────────────────────────── */
function getToken() { return localStorage.getItem('cyllux_token'); }
function setToken(t) { localStorage.setItem('cyllux_token', t); }
function clearToken() { localStorage.removeItem('cyllux_token'); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

/* ── Auth ──────────────────────────────────────────── */
async function apiRegister(firstName, lastName, email, password) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  setToken(data.token);
  return data.user;
}

async function apiLogin(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

function apiLogout() {
  clearToken();
  window.location.href = 'login.html';
}

async function apiGetMe() {
  return apiFetch('/auth/me');
}

/* ── Products ──────────────────────────────────────── */
async function apiGetProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/products${qs ? '?' + qs : ''}`);
}

async function apiGetProduct(id) {
  return apiFetch(`/products/${id}`);
}

/* ── Orders ────────────────────────────────────────── */
async function apiPlaceOrder({ items, shipping, paymentMethod }) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({ items, shipping, paymentMethod }),
  });
}

async function apiGetMyOrders() {
  return apiFetch('/orders/mine');
}

/* ── Cart (logged-in users only) ───────────────────── */
async function apiGetCart() { return apiFetch('/cart'); }

async function apiAddToCart(productId, name, price, img, qty = 1) {
  return apiFetch('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, name, price, img, qty }),
  });
}

async function apiUpdateCartItem(productId, qty) {
  return apiFetch(`/cart/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ qty }),
  });
}

async function apiRemoveCartItem(productId) {
  return apiFetch(`/cart/${productId}`, { method: 'DELETE' });
}

async function apiClearCart() {
  return apiFetch('/cart', { method: 'DELETE' });
}

/* ── Contact ───────────────────────────────────────── */
async function apiSendContact(name, email, message) {
  return apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify({ name, email, message }),
  });
}
