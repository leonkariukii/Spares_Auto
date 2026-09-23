/* ==========================================================================
   Spares_Auto Shop — Client Behavioral Layer
   Implements System Design Specification §3 (Frontend) and §4 (Backend API)
   ========================================================================== */

/* ---- §3 State Management: in-memory cart array ---- */
let cart = [];

/* ---- §3 Data source: rendered from GET /api/products, falls back to the
   server-rendered grid already in the DOM if the API is unreachable ---- */
let products = [];

const API_BASE = '/api';

/* ---------------------------- DOM References ---------------------------- */
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

/* ==========================================================================
   §5 Next Steps: dynamic rendering fetched from GET /api/products
   ========================================================================== */

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const data = await res.json();
    products = normalizeProducts(data);
  } catch (err) {
    // Backend not available yet (e.g. static preview) — degrade gracefully
    // by reading the product data already baked into the HTML grid.
    console.warn('Falling back to static product grid:', err.message);
    products = readProductsFromDOM();
  }
  renderProducts();
}

function normalizeProducts(data) {
  return data.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: Number(p.price),
    category: p.category,
    stock: Number(p.stock),
    description: p.description || '',
    image: p.image || '',
  }));
}

function readProductsFromDOM() {
  return Array.from(document.querySelectorAll('.product-item')).map((el) => ({
    id: el.dataset.id,
    name: el.dataset.name,
    price: Number(el.dataset.price),
    category: el.dataset.category,
    stock: Number(el.dataset.stock),
    description: el.querySelector('p')?.textContent || '',
    image: el.querySelector('img')?.getAttribute('src') || '',
  }));
}

/* ---- §3 Data Binding: data-* attributes carry product info into the DOM ---- */
function renderProducts() {
  const category = categoryFilter.value;
  const sortBy = sortSelect.value;

  let visible = products.filter((p) => !category || p.category === category);
  visible = sortProducts(visible, sortBy);

  productList.innerHTML = '';

  if (visible.length === 0) {
    productList.innerHTML = '<p class="empty-cart">No products match this filter.</p>';
    return;
  }

  visible.forEach((p) => {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.dataset.id = p.id;
    item.dataset.name = p.name;
    item.dataset.price = p.price;
    item.dataset.category = p.category;
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

categoryFilter.addEventListener('change', renderProducts);
sortSelect.addEventListener('change', renderProducts);

/* ==========================================================================
   Cart state management (§3) — quantities and cumulative totals
   ========================================================================== */

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

/* ---- Cart sidebar open/close ---- */
function openCart() {
  cartSidebar.classList.add('open');
}
function closeCart() {
  cartSidebar.classList.remove('open');
}
cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);

/* ==========================================================================
   Product Detail Modal
   ========================================================================== */

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

/* ==========================================================================
   §4 Backend API Interface — POST /api/checkout
   ========================================================================== */

async function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty.');
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

    alert(`Order placed! Order ID: ${result.orderId}`);

    // Server-side render engine already cleared the cart and generated
    // the empty-cart markup — use it directly instead of re-rendering client-side.
    cart = result.cart ?? [];
    cartItemsEl.innerHTML = result.cartItemsHTML;
    cartTotalEl.textContent = result.cartTotalHTML;
    cartCountEl.textContent = result.cartCount;

    closeCart();
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Sorry, we could not complete checkout right now. Please try again.');
  }
}

checkoutBtn.addEventListener('click', checkout);

/* ==========================================================================
   Init
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  renderCart();
});
