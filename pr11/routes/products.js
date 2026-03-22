const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/auth');
const router = express.Router();

const products = [];

// POST /api/products — Продавец
router.post('/', authMiddleware, roleMiddleware('seller', 'admin'), (req, res) => {
  const { title, category, description, price } = req.body;

  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const product = { id: uuidv4(), title, category, description, price };
  products.push(product);
  res.status(201).json(product);
});

// GET /api/products — Пользователь
router.get('/', authMiddleware, roleMiddleware('user', 'seller', 'admin'), (req, res) => {
  res.json(products);
});

// GET /api/products/:id — Пользователь
router.get('/:id', authMiddleware, roleMiddleware('user', 'seller', 'admin'), (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// PUT /api/products/:id — Продавец
router.put('/:id', authMiddleware, roleMiddleware('seller', 'admin'), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { title, category, description, price } = req.body;
  products[index] = { ...products[index], title, category, description, price };
  res.json(products[index]);
});

// DELETE /api/products/:id — Администратор
router.delete('/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products.splice(index, 1);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
