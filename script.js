const API_BASE = '/api';

// This keeps the main app data in one place.
// The UI can read and update this object whenever the cart, filters, or login state changes.
const state = {
  cart: [],
  products: [],
  query: '',
  brand: '',
  modalId: null,
  lastOrder: null,
  isCheckingOut: false,
  auth: {
    user: null,
    token: null
  }
};

// These elements are grabbed once so we can reuse them in many functions.
// This keeps the code cleaner and avoids repeating document.getElementById all over the page.
const els = {
  list: document.getElementById('product-list'),
  category: document.getElementById('category-filter'),
  sort: document.getElementById('sort-select'),
  cart: document.getElementById('cart-sidebar'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  cartCount: document.getElementById('cart-count'),
  navCount: document.getElementById('nav-cart-count'),
  checkout: document.querySelector('.checkout-btn'),
  checkoutSuccess: document.getElementById('checkout-success'),
  successOrderId: document.getElementById('success-order-id'),
  successOrderItems: document.getElementById('success-order-items'),
  continueShopping: document.getElementById('continue-shopping-btn'),
  viewOrder: document.getElementById('view-order-btn'),
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  login: document.getElementById('login-modal'),
  loginForm: document.getElementById('login-form'),
  modal: document.getElementById('product-modal'),
  modalTitle: document.getElementById('modal-title'),
  modalDesc: document.getElementById('modal-description'),
  modalPrice: document.getElementById('modal-price'),
  modalStock: document.getElementById('modal-stock'),
  modalImage: document.getElementById('modal-image'),
  quantity: document.getElementById('quantity'),
  toast: document.getElementById('toast-container'),
  cartToggle: document.getElementById('cart-toggle'),
  cartClose: document.getElementById('cart-close'),
  navCart: document.getElementById('nav-cart-btn'),
  profile: document.getElementById('profile-icon-btn'),
  closeLogin: document.getElementById('login-modal-close'),
  closeModal: document.getElementById('modal-close'),
  qtyMinus: document.getElementById('qty-minus'),
  qtyPlus: document.getElementById('qty-plus'),
  addModal: document.getElementById('add-to-cart-modal'),
  categoryButtons: document.querySelectorAll('#category-buttons .pill-btn'),
  brandButtons: document.querySelectorAll('#brand-buttons .pill-btn')
};

// Simple helper to protect text before inserting it into HTML.
// This prevents characters like < and > from breaking the page.
function escapeHTML(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
}

// This helper reads the response text and turns it into a JavaScript object.
// If the backend sends invalid data, we throw a clear error to help with debugging.
async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    console.error('Server returned non-JSON response:', trimmed.slice(0, 200));
    throw new Error('The server responded with HTML instead of JSON. Check that the backend is running and the correct port is being used.');
  }
}

// A small notification box for user feedback.
// This is used for things like successful login, cart updates, and checkout errors.
function showToast(message, type = 'success') {
  if (!els.toast) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  els.toast.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Make sure each product object follows the same structure.
// This avoids errors when data comes from the API or the static HTML page.
function normalizeProduct(product) {
  return {
    id: String(product.id),
    name: product.name,
    price: Number(product.price) || 0,
    category: String(product.category || ''),
    brand: String(product.brand || ''),
    stock: Number(product.stock) || 0,
    description: product.description || 'No description available.',
    image: product.image || ''
  };
}

function readProductsFromDOM() {
  return Array.from(document.querySelectorAll('.product-item')).map((item) => ({
    id: item.dataset.id,
    name: item.dataset.name,
    price: Number(item.dataset.price) || 0,
    category: String(item.dataset.category || ''),
    brand: String(item.dataset.brand || ''),
    stock: Number(item.dataset.stock) || 0,
    description: item.querySelector('p')?.textContent || '',
    image: item.querySelector('img')?.getAttribute('src') || ''
  }));
}

function setActivePill(buttons, value, key) {
  buttons.forEach((button) => button.classList.toggle('active', button.dataset[key] === value));
}

function getStoredAuth() {
  try {
    const user = localStorage.getItem('sparesAutoUser');
    const token = localStorage.getItem('sparesAutoToken');
    if (!user || !token) return { user: null, token: null };
    return { user: JSON.parse(user), token };
  } catch (error) {
    console.warn('Unable to restore auth session:', error);
    return { user: null, token: null };
  }
}

function saveAuthSession(user, token) {
  state.auth.user = user;
  state.auth.token = token;
  localStorage.setItem('sparesAutoUser', JSON.stringify(user));
  localStorage.setItem('sparesAutoToken', token);
}

function clearAuthSession() {
  state.auth.user = null;
  state.auth.token = null;
  localStorage.removeItem('sparesAutoUser');
  localStorage.removeItem('sparesAutoToken');
}

function renderAuthUI() {
  if (!els.profile) return;

  if (!state.auth.user) {
    els.profile.innerHTML = '<span aria-hidden="true">&#128100;</span>';
    els.profile.title = 'Login / Profile';
    return;
  }

  const name = state.auth.user.name || 'Profile';
  els.profile.innerHTML = `<span aria-hidden="true">&#128100;</span><span class="profile-label">${escapeHTML(name)}</span>`;
  els.profile.title = `Logged in as ${name}`;
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Products API failed');
    const data = await parseJsonResponse(response);
    state.products = Array.isArray(data) ? data.map(normalizeProduct) : readProductsFromDOM();
  } catch (error) {
    console.warn('Using static products instead:', error.message);
    state.products = readProductsFromDOM();
  }
  renderProducts();
}

function getVisibleProducts() {
  const category = els.category.value;
  let items = state.products.filter((product) => {
    const matchCategory = !category || product.category === category;
    const matchBrand = !state.brand || product.brand === state.brand;
    return matchCategory && matchBrand;
  });

  if (state.query) {
    const q = state.query.toLowerCase();
    items = items.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(q));
  }

  if (els.sort.value === 'price-low') return items.sort((a, b) => a.price - b.price);
  if (els.sort.value === 'price-high') return items.sort((a, b) => b.price - a.price);
  if (els.sort.value === 'name') return items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

// Rebuild the product list based on the current filters, search, and sort option.
// This is a simple example of re-rendering the UI when state changes.
function renderProducts() {
  els.list.innerHTML = '';
  const items = getVisibleProducts();
  if (!items.length) {
    els.list.innerHTML = '<p class="empty-cart">No products is available.</p>';
    return;
  }

  items.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-item';
    card.dataset.id = product.id;
    card.dataset.name = product.name;
    card.dataset.price = product.price;
    card.dataset.category = product.category;
    card.dataset.brand = product.brand;
    card.dataset.stock = product.stock;
    card.innerHTML = `
      <img src='${product.image}' alt='${product.name}'>
      <h4>${product.name}</h4>
      <p>${product.description}</p>
      <div class='product-price'>$${product.price.toFixed(2)}</div>
      <button class='view-details-btn' type='button'>View Details</button>
      <button class='add-to-cart-btn' type='button'>Add to Cart</button>
    `;
    card.querySelector('.view-details-btn').addEventListener('click', () => openModal(product.id));
    card.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product.id, 1));
    card.querySelector('img').addEventListener('click', () => openModal(product.id));
    card.querySelector('h4').addEventListener('click', () => openModal(product.id));
    els.list.appendChild(card);
  });
}

function cartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartCount() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Update the shopping cart panel and the cart badges in the page.
// The cart total and item count are calculated from the current state each time.
function renderCart() {
  const count = cartCount();
  els.cartCount.textContent = count;
  els.navCount.textContent = count;
  els.cartTotal.textContent = `$${cartTotal().toFixed(2)}`;

  if (!state.cart.length) {
    els.cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }

  els.cartItems.innerHTML = '';
  state.cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class='cart-item-info'>
        <p class='cart-item-name'>${item.name}</p>
        <span class='cart-item-price'>$${item.price.toFixed(2)}</span>
        <span class='cart-item-qty'>x${item.quantity}</span>
      </div>
      <button class='cart-item-remove' type='button'>Remove</button>
    `;
    row.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.id));
    els.cartItems.appendChild(row);
  });
}

function hideCheckoutSuccess() {
  if (!els.checkoutSuccess) return;
  els.checkoutSuccess.classList.add('hidden');
}

function showCheckoutSuccess(order) {
  if (!els.checkoutSuccess || !els.successOrderId || !els.successOrderItems) return;

  const total = Number(order?.total ?? 0);
  els.successOrderId.textContent = order?.orderId || 'N/A';
  els.successOrderItems.innerHTML = '';

  (order?.items || []).forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.name} x${item.quantity} — $${(Number(item.price) * Number(item.quantity)).toFixed(2)}`;
    els.successOrderItems.appendChild(listItem);
  });

  const summaryText = document.createElement('li');
  summaryText.className = 'summary-total';
  summaryText.textContent = `Total: $${total.toFixed(2)}`;
  els.successOrderItems.appendChild(summaryText);

  els.checkoutSuccess.classList.remove('hidden');
  els.checkoutSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addToCart(id, qty) {
  hideCheckoutSuccess();

  const product = state.products.find((item) => item.id === String(id));
  if (!product) return;

  const amount = Math.max(1, Number(qty) || 1);
  const existing = state.cart.find((item) => item.id === product.id);

  if (existing) {
    const next = existing.quantity + amount;
    if (next > product.stock) {
      showToast(`Only ${product.stock} units available.`, 'error');
      return;
    }
    existing.quantity = next;
  } else {
    if (amount > product.stock) {
      showToast(`Only ${product.stock} units available.`, 'error');
      return;
    }
    state.cart.push({ id: product.id, name: product.name, price: product.price, quantity: amount });
  }

  renderCart();
  els.cart.classList.add('open');
  showToast('Item added to cart', 'success');
}

function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
  renderCart();
}

function openModal(id) {
  const product = state.products.find((item) => item.id === String(id));
  if (!product) return;
  state.modalId = product.id;
  els.modalImage.src = product.image || 'images/default-product.jpg';
  els.modalImage.alt = product.name;
  els.modalTitle.textContent = product.name;
  els.modalDesc.textContent = product.description;
  els.modalPrice.textContent = `$${product.price.toFixed(2)}`;
  els.modalStock.textContent = product.stock;
  els.quantity.value = '1';
  els.quantity.max = product.stock;
  els.modal.classList.add('open');
}

function closeModal() {
  els.modal.classList.remove('open');
  state.modalId = null;
}

// Process a real checkout request.
// We validate the cart, the login session, and then send the order to the backend.
async function checkout() {
  if (!state.cart.length) {
    showToast('Your cart is empty.', 'error');
    return;
  }

  if (!state.auth.token) {
    showToast('Please log in before checking out.', 'error');
    els.login.classList.add('open');
    return;
  }

  if (state.isCheckingOut) return;

  const payload = {
    cart: state.cart.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
    total: Number(cartTotal().toFixed(2))
  };

  state.isCheckingOut = true;
  els.checkout.disabled = true;
  els.checkout.textContent = 'Processing...';

  try {
    const response = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.auth.token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await parseJsonResponse(response);
    if (!response.ok || !result.success) throw new Error(result?.message || 'Checkout failed');

    state.lastOrder = result;
    state.cart = [];
    renderCart();
    hideCheckoutSuccess();
    els.cart.classList.remove('open');
    showCheckoutSuccess(result);
    showToast(`Order placed! Order ID: ${result.orderId || 'N/A'}`, 'success');
  } catch (error) {
    console.error('Checkout error:', error);
    showToast(error.message || 'Checkout failed. Please try again.', 'error');
  } finally {
    state.isCheckingOut = false;
    els.checkout.disabled = false;
    els.checkout.textContent = 'Proceed to Checkout';
  }
}

// Connect page controls to the app logic.
// When a user clicks a button or changes a filter, the app updates state and re-renders the UI.
function bindEvents() {
  els.category.addEventListener('change', () => {
    setActivePill(els.categoryButtons, els.category.value, 'category');
    renderProducts();
  });

  els.sort.addEventListener('change', renderProducts);

  els.categoryButtons.forEach((button) => button.addEventListener('click', () => {
    els.category.value = button.dataset.category;
    setActivePill(els.categoryButtons, button.dataset.category, 'category');
    renderProducts();
  }));

  els.brandButtons.forEach((button) => button.addEventListener('click', () => {
    state.brand = button.dataset.brand;
    setActivePill(els.brandButtons, button.dataset.brand, 'brand');
    renderProducts();
  }));

  els.searchInput.addEventListener('input', () => {
    state.query = els.searchInput.value.trim();
    renderProducts();
  });

  els.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = els.searchInput.value.trim();
    renderProducts();
  });

  els.cartToggle.addEventListener('click', () => els.cart.classList.add('open'));
  els.cartClose.addEventListener('click', () => els.cart.classList.remove('open'));
  els.navCart.addEventListener('click', () => els.cart.classList.add('open'));
  els.profile.addEventListener('click', () => {
    if (state.auth.user) {
      clearAuthSession();
      renderAuthUI();
      showToast('Logged out successfully.', 'success');
      return;
    }

    els.login.classList.add('open');
  });

  els.closeLogin.addEventListener('click', () => els.login.classList.remove('open'));
  els.login.addEventListener('click', (event) => {
    if (event.target === els.login) els.login.classList.remove('open');
  });

  els.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      showToast('Please enter a valid email.', 'error');
      return;
    }

    if (!password) {
      showToast('Please enter your password.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await parseJsonResponse(response);
      if (!response.ok || !result.success) throw new Error(result?.message || 'Login failed');

      saveAuthSession(result.user, result.token);
      renderAuthUI();
      els.loginForm.reset();
      els.login.classList.remove('open');
      showToast(`Welcome back, ${result.user.name}!`, 'success');
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed. Please try again.', 'error');
    }
  });

  els.closeModal.addEventListener('click', closeModal);
  els.modal.addEventListener('click', (event) => {
    if (event.target === els.modal) closeModal();
  });

  els.qtyMinus.addEventListener('click', () => {
    const next = Math.max(1, Number(els.quantity.value) - 1);
    els.quantity.value = String(next);
  });

  els.qtyPlus.addEventListener('click', () => {
    const max = Number(els.quantity.max) || Infinity;
    const next = Math.min(max, Number(els.quantity.value) + 1);
    els.quantity.value = String(next);
  });

  els.quantity.addEventListener('change', () => {
    let value = Number(els.quantity.value);
    const max = Number(els.quantity.max) || Infinity;
    if (!value || value < 1) value = 1;
    if (value > max) value = max;
    els.quantity.value = String(value);
  });

  els.addModal.addEventListener('click', () => {
    if (!state.modalId) return;
    addToCart(state.modalId, Number(els.quantity.value) || 1);
    closeModal();
  });

  els.checkout.addEventListener('click', checkout);

  els.continueShopping?.addEventListener('click', () => {
    hideCheckoutSuccess();
    document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  els.viewOrder?.addEventListener('click', () => {
    if (!state.lastOrder) {
      showToast('No recent order to view.', 'error');
      return;
    }

    if (els.checkoutSuccess) {
      els.checkoutSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showToast(`Viewing order ${state.lastOrder.orderId}. Total: $${Number(state.lastOrder.total || 0).toFixed(2)}`, 'success');
  });
}

// When the page is ready, restore the logged-in user if one exists and then start the app.
document.addEventListener('DOMContentLoaded', () => {
  const restoredAuth = getStoredAuth();
  state.auth.user = restoredAuth.user;
  state.auth.token = restoredAuth.token;

  bindEvents();
  renderCart();
  renderAuthUI();
  loadProducts();
  hideCheckoutSuccess();
});
