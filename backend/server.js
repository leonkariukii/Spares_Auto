const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const projectRoot = path.join(__dirname, '..');

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

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/checkout', (req, res) => {
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
    total: Number(total.toFixed(2))
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});