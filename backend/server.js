const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const projectRoot = path.join(__dirname, '..');

const users = [
  {
    id: 'u-1001',
    name: 'Demo User',
    email: 'demo@sparesauto.com',
    password: 'password123'
  },
  {
    id: 'u-1002',
    name: 'Workshop Admin',
    email: 'admin@sparesauto.com',
    password: 'admin123'
  }
];

const sessions = new Map();

const products = [
  {
    id: '1',
    name: 'Brake Pads',
    price: 45.99,
    category: 'pads',
    brand: 'toyota',
    stock: 15,
    description: 'High-quality brake pads for various car models.',
    image: 'images/brake pads.jpg'
  },
  {
    id: '2',
    name: 'Oil Filters',
    price: 32.50,
    category: 'filters',
    brand: 'ford',
    stock: 20,
    description: 'Durable oil filters to keep your engine running smoothly.',
    image: 'images/oil filter.jpg'
  },
  {
    id: '3',
    name: 'Spark Plugs',
    price: 28.99,
    category: 'plugs',
    brand: 'honda',
    stock: 25,
    description: 'Reliable spark plugs for optimal engine performance.',
    image: 'images/spark plugs.jpg'
  },
  {
    id: '4',
    name: 'Air Filters',
    price: 22.00,
    category: 'filters',
    brand: 'ford',
    stock: 18,
    description: 'High-efficiency air filters for clean airflow.',
    image: 'images/air filter.jpg'
  }
];

app.use(cors());
app.use(express.json());
app.use(express.static(projectRoot));

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || !sessions.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in first.'
    });
  }

  const session = sessions.get(token);
  const user = users.find((entry) => entry.id === session.userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Session invalid. Please log in again.'
    });
  }

  req.user = user;
  next();
}

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  const user = users.find((entry) =>
    entry.email.toLowerCase() === String(email).trim().toLowerCase() &&
    entry.password === String(password)
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const token = `sa_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  sessions.set(token, { userId: user.id, createdAt: Date.now() });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token
  });
});

app.get('/api/me', authenticate, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json({
    success: true,
    user: safeUser
  });
});

app.post('/api/checkout', authenticate, (req, res) => {
  const { cart } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty.'
    });
  }

  const orderItems = [];
  let total = 0;

  for (const item of cart) {
    const product = products.find((entry) => entry.id === String(item.id));
    const quantity = Number(item.quantity);

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'One of the products was not found.'
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid quantity for ${product.name}.`
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units of ${product.name} are available.`
      });
    }

    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity
    });
    total += product.price * quantity;
  }

  orderItems.forEach((item) => {
    const product = products.find((entry) => entry.id === item.id);
    product.stock -= item.quantity;
  });

  res.status(201).json({
    success: true,
    orderId: `ORDER-${Date.now()}`,
    items: orderItems,
    total: Number(total.toFixed(2)),
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});