/* ==========================================================================
   Spares_Auto Shop — API Layer (Node.js / Express)
   Implements System Design Specification §4: Backend API Interface
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serves index.html, style.css, script.js

/* ==========================================================================
   In-memory "garage operations system" catalog
   (stands in for a real inventory DB per §4)
   ========================================================================== */
let products = [
  {
    id: '1',
    name: 'Brake Pads',
    price: 45.99,
    category: 'pads',
    stock: 15,
    description: 'High-quality brake pads for various car models.',
    image: 'images/brake pads.jpg',
  },
  {
    id: '2',
    name: 'Oil Filters',
    price: 32.5,
    category: 'filters',
    stock: 20,
    description: 'Durable oil filters to keep your engine running smoothly.',
    image: 'images/oil filter.jpg',
  },
  {
    id: '3',
    name: 'Spark Plugs',
    price: 28.99,
    category: 'plugs',
    stock: 25,
    description: 'Reliable spark plugs for optimal engine performance.',
    image: 'images/spark plugs.jpg',
  },
  {
    id: '4',
    name: 'Air Filters',
    price: 22.0,
    category: 'filters',
    stock: 18,
    description: 'High-efficiency air filters for clean airflow.',
    image: 'images/air filter.jpg',
  },
];

let orderSequence = 1000;

/* ==========================================================================
   Render engine
   Generates the cart-sidebar markup server-side. Used to hand the client
   fresh HTML for the "empty cart" state right after checkout, instead of
   leaving that markup to be rebuilt client-side.
   ========================================================================== */
function renderCartItemsHTML(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return '<p class="empty-cart">Your cart is empty</p>';
  }

  return cartItems
    .map(
      (item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <p class="cart-item-name">${escapeHTML(item.name)}</p>
          <span class="cart-item-price">$${Number(item.price).toFixed(2)}</span>
          <span class="cart-item-qty">x${item.quantity}</span>
        </div>
        <button class="cart-item-remove">Remove</button>
      </div>`
    )
    .join('');
}

function renderCartTotalHTML(total) {
  return `$${Number(total || 0).toFixed(2)}`;
}

/**
 * clearCart — the render-engine function invoked after a successful
 * checkout. It resets the cart state to empty and dynamically generates
 * the HTML fragments the client needs to reflect that (cart items list,
 * total, and count), rather than the client having to reconstruct the
 * "empty" UI on its own.
 */
function clearCart() {
  const emptyCart = [];
  return {
    cart: emptyCart,
    cartItemsHTML: renderCartItemsHTML(emptyCart),
    cartTotalHTML: renderCartTotalHTML(0),
    cartCount: 0,
  };
}

function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==========================================================================
   GET /api/products
   Fetch the full catalog of auto spare parts, including categories and
   stock levels.
   ========================================================================== */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/* ==========================================================================
   POST /api/checkout
   Submit the user's cart state to generate a service job card, deduct
   from central inventory, and clear + re-render the cart.
   ========================================================================== */
app.post('/api/checkout', (req, res) => {
  const { cart, total } = req.body || {};

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty or invalid.' });
  }

  // Validate stock and line-item pricing against the catalog before committing.
  for (const item of cart) {
    const product = products.find((p) => p.id === String(item.id));
    if (!product) {
      return res.status(400).json({ success: false, message: `Unknown product: ${item.id}` });
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}.` });
    }
    if (item.quantity > product.stock) {
      return res.status(409).json({
        success: false,
        message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
      });
    }
  }

  // Deduct from central inventory.
  cart.forEach((item) => {
    const product = products.find((p) => p.id === String(item.id));
    product.stock -= item.quantity;
  });

  // Generate a service job card / order ID.
  orderSequence += 1;
  const orderId = `JOB-${orderSequence}`;
  const computedTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // Render engine: clear the cart and produce fresh HTML for the client.
  const rendered = clearCart();

  res.status(201).json({
    success: true,
    orderId,
    total: Number((total ?? computedTotal).toFixed(2)),
    ...rendered,
  });
});

app.listen(PORT, () => {
  console.log(`Spares_Auto Shop API listening on http://localhost:${PORT}`);
});
