// ── Auth (frontend-only demo) ─────────────────────────────────────
// Accounts + session live in localStorage. This is NOT secure —
// passwords are stored in plain text on the visitor's own device and
// nothing is verified server-side. Good enough for a prototype/demo,
// not for a real production launch (that needs a real backend).

const USERS_KEY = 'cyllux_users';
const SESSION_KEY = 'cyllux_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

function signup(name, email, password, role) {
  name = (name || '').trim();
  email = (email || '').trim();
  if (!name || !email || !password) return { ok: false, error: 'Please fill in all fields.' };
  if (!role) role = 'buyer';

  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with that email already exists — try signing in instead.' };
  }
  // NOTE: plain-text password, demo only.
  const user = { name, email, password, role, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  setSession({ name: user.name, email: user.email, role: user.role });
  return { ok: true, user };
}

function login(email, password, role) {
  email = (email || '').trim();
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { ok: false, error: 'Incorrect email or password.' };
  if (role && user.role !== role) {
    return { ok: false, error: `That account is registered as a ${user.role === 'seller' ? 'Seller' : 'Buyer'}. Switch tabs and try again.` };
  }
  setSession({ name: user.name, email: user.email, role: user.role });
  return { ok: true, user };
}

// Gate a page to logged-in sellers only. Redirects to login.html (with a
// `next` param so login.html can bounce back here) if not authenticated
// as a seller. Returns the session object, or null (and redirects) if not.
function requireSellerAuth() {
  const session = getSession();
  if (!session || session.role !== 'seller') {
    const here = window.location.pathname.split('/').pop() || 'seller-dashboard.html';
    window.location.href = `login.html?next=${encodeURIComponent(here)}`;
    return null;
  }
  return session;
}

// Wires up the 👤 nav icon on every page: shows the signed-in person's
// first name once logged in, and routes sellers straight to their
// dashboard instead of the login page.
function initNavAuth() {
  const btn = document.getElementById('nav-account-btn');
  if (!btn) return;
  const session = getSession();
  if (session) {
    btn.innerHTML = '👤 <span style="font-size:12px">' + session.name.split(' ')[0] + '</span>';
    btn.title = session.role === 'seller' ? 'Seller account — click for dashboard' : 'Your account';
  }
}

function goAccount() {
  const session = getSession();
  if (session && session.role === 'seller') {
    window.location.href = 'seller-dashboard.html';
  } else {
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', initNavAuth);
