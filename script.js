/*
  Spares_Auto shop UI logic.
  This file handles the storefront behavior: loading products, updating the cart,
  filtering items, opening a modal, and sending checkout requests.
*/

// Current cart items in memory.
let cart = [];

// Product data loaded from the API. If the API is unavailable, we fall back to
// the HTML already on the page.
let products = [];

const API_BASE = '/api';

// Grab the main UI elements we need to update.
const productList = document.getElementById('product-list');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');

const cartSidebar = document.getElementById('cart-sidebar');
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const checkoutBtn = document.querySelector('.checkout-btn');

// Header navbar icons (profile/login + cart).
const profileIconBtn = document.getElementById('profile-icon-btn');
const navCartBtn = document.getElementById('nav-cart-btn');
const navCartCountEl = document.getElementById('nav-cart-count');

// Shop by Category / Shop by Vehicle Brand pill buttons.
const categoryButtons = document.querySelectorAll('#category-buttons .pill-btn');
const brandButtons = document.querySelectorAll('#brand-buttons .pill-btn');
let activeBrand = '';

// Header search bar.
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
let searchQuery = '';

// Login modal.
const loginModal = document.getElementById('login-modal');
const loginModalClose = document.getElementById('login-modal-close');
const loginForm = document.getElementById('login-form');

// Toast/alert container.
const toastContainer = document.getElementById('toast-container');

const modal = document.getElementById('product-modal');
const modalClose = document.getElementById('modal-close');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalPrice = document.getElementById('modal-price');
const modalStock = document.getElementById('modal-stock');
const quantityInput = document.getElementById('quantity');
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');
const addToCartModalBtn = document.getElementById('add-to-cart-modal');

let activeModalProductId = null;

// Central toast/alert system used for cart, login, and checkout feedback.
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Load products from the backend. If that fails, use the product data already
// rendered in the page.
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const data = await res.json();
    products = normalizeProducts(data);
  } catch (err) {
    // by reading the product data already baked into the HTML grid.
    console.warn('Falling back to static product data:', err.message);
    products = readProductsFromDOM();
  }
  renderProducts();
}

function normalizeProducts(data) {
  return data.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: Number(p.price),
    category: String(p.category || ''),
    brand: String(p.brand || ''),
    stock: Number(p.stock),
    description: String(p.description || ''),
    image: p.image || '',
  }));
}

function readProductsFromDOM() {
  return Array.from(document.querySelectorAll('.product-item')).map((el) => ({
    id: el.dataset.id,
    name: el.dataset.name,
    price: Number(el.dataset.price),
    category: String(el.dataset.category || ''),
    brand: String(el.dataset.brand || ''),
    stock: Number(el.dataset.stock),
    description: String(el.querySelector('p')?.textContent || ''),
    image: el.querySelector('img')?.getAttribute('src') || '',
  }));
}

// Build the product cards and refresh the list whenever the filters or sort
// settings change.
function renderProducts() {
  const category = categoryFilter.value;
  const sortBy = sortSelect.value;
  const query = searchQuery.trim().toLowerCase();

  let visible = products.filter((p) => !category || p.category === category);
  visible = visible.filter((p) => !activeBrand || p.brand === activeBrand);
  if (query) {
    visible = visible.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }
  visible = sortProducts(visible, sortBy);

  productList.innerHTML = '';

  if (visible.length === 0) {
    productList.innerHTML = '<p class="empty-cart">No products is available.</p>';
    return;
  }

  visible.forEach((p) => {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.dataset.id = p.id;
    item.dataset.name = p.name;
    item.dataset.price = p.price;
    item.dataset.category = p.category;
    item.dataset.brand = p.brand;
    item.dataset.stock = p.stock;

    item.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.description}</p>
      <div class="product-price">$${p.price.toFixed(2)}</div>
      <button class="view-details-btn">View Details</button>
      <button class="add-to-cart-btn">Add to Cart</button>
    `;

    item.querySelector('.view-details-btn').addEventListener('click', () => openModal(p.id));
    item.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(p.id, 1));
    item.querySelector('img').addEventListener('click', () => openModal(p.id)); 
    item.querySelector('h4').addEventListener('click', () => openModal(p.id));

    productList.appendChild(item);
  });
}

function sortProducts(list, sortBy) {
  const sorted = [...list];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

categoryFilter.addEventListener('change', () => {
  setActivePill(categoryButtons, categoryFilter.value, 'category');
  renderProducts();
});
sortSelect.addEventListener('change', renderProducts);

// "Shop by Category" pills stay in sync with the existing category <select>.
function setActivePill(buttons, value, datasetKey) {
  buttons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset[datasetKey] === value);
  });
}

categoryButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    categoryFilter.value = btn.dataset.category;
    setActivePill(categoryButtons, btn.dataset.category, 'category');
    renderProducts();
  });
});

// "Shop by Vehicle Brand" filtering (Toyota, Ford, Honda).
brandButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    activeBrand = btn.dataset.brand;
    setActivePill(brandButtons, btn.dataset.brand, 'brand');
    renderProducts();
  });
});

// Filter the product catalog as the user types or submits the search form.
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  renderProducts();
});
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  searchQuery = searchInput.value;
  renderProducts();
});

// Handle cart updates: add items, remove items, and keep totals in sync.
function addToCart(productId, quantity) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((c) => c.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }
  renderCart();
  openCart();
  showToast('Item added to cart', 'success');
}

function updateQuantity(productId, delta) {
  const item = cart.find((c) => c.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((c) => c.id !== productId);
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
  cartCountEl.textContent = cartCount();
  navCartCountEl.textContent = cartCount();
  cartTotalEl.textContent = `$${cartTotal().toFixed(2)}`;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }

  cartItemsEl.innerHTML = '';
  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
        <span class="cart-item-qty">x${item.quantity}</span>
      </div>
      <button class="cart-item-remove">Remove</button>
    `;
    row.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.id));
    cartItemsEl.appendChild(row);
  });
}

// Open and close the cart drawer.
function openCart() {
  cartSidebar.classList.add('open');
}
function closeCart() {
  cartSidebar.classList.remove('open');
}
cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
navCartBtn.addEventListener('click', openCart);

// Basic login flow tied to the navbar profile icon.
function openLoginModal() {
  loginModal.classList.add('open');
}
function closeLoginModal() {
  loginModal.classList.remove('open');
}

profileIconBtn.addEventListener('click', openLoginModal);
loginModalClose.addEventListener('click', closeLoginModal);
loginModal.addEventListener('click', (e) => {
  if (e.target === loginModal) closeLoginModal();
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    showToast('Please enter a valid email.', 'error');
    return;
  }
  loginForm.reset();
  closeLoginModal();
  showToast('Login successful', 'success');
});

// Show a popup with more details about a product and let the user choose a
// quantity before adding it to the cart.
function openModal(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  activeModalProductId = productId;
  modalImage.src = product.image;
  modalImage.alt = product.name;
  modalTitle.textContent = product.name;
  modalDescription.textContent = product.description;
  modalPrice.textContent = `$${product.price.toFixed(2)}`;
  modalStock.textContent = product.stock;
  quantityInput.value = 1;
  quantityInput.max = product.stock;

  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
  activeModalProductId = null;
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

qtyMinus.addEventListener('click', () => {
  const val = Math.max(1, Number(quantityInput.value) - 1);
  quantityInput.value = val;
});
qtyPlus.addEventListener('click', () => {
  const max = Number(quantityInput.max) || Infinity;
  const val = Math.min(max, Number(quantityInput.value) + 1);
  quantityInput.value = val;
});
quantityInput.addEventListener('change', () => {
  let val = Number(quantityInput.value);
  const max = Number(quantityInput.max) || Infinity;
  if (!val || val < 1) val = 1;
  if (val > max) val = max;
  quantityInput.value = val;
});

addToCartModalBtn.addEventListener('click', () => {
  if (!activeModalProductId) return;
  addToCart(activeModalProductId, Number(quantityInput.value) || 1);
  closeModal();
});

// Send the cart to the backend to complete checkout.
async function checkout() {
  if (cart.length === 0) {
    showToast('Your cart is empty.', 'error');
    return;
  }

  const payload = {
    cart: cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    total: Number(cartTotal().toFixed(2)),
  };

  try {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || `Checkout failed with status ${res.status}`);
    }

    showToast(`Order placed! Order ID: ${result.orderId}`, 'success');

    // Server-side render engine already cleared the cart and generated
    // the empty-cart markup — use it directly instead of re-rendering client-side.
    cart = result.cart ?? [];
    cartItemsEl.innerHTML = result.cartItemsHTML;
    cartTotalEl.textContent = result.cartTotalHTML;
    cartCountEl.textContent = result.cartCount;
    navCartCountEl.textContent = result.cartCount;

    closeCart();
  } catch (err) {
    console.error('Checkout error:', err);
    showToast('Checkout failed. Please try again.', 'error');
  }
}

checkoutBtn.addEventListener('click', checkout);

// Run the main setup when the page has loaded.
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  renderCart();
});
