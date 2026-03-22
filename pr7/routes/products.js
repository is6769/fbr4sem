const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const products = [];

// POST /api/products
router.post('/', (req, res) => {
  const { title, category, description, price } = req.body;

  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const product = { id: uuidv4(), title, category, description, price };
  products.push(product);
  res.status(201).json(product);
});

// GET /api/products
router.get('/', (req, res) => {
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { title, category, description, price } = req.body;
  products[index] = { ...products[index], title, category, description, price };
  res.json(products[index]);
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products.splice(index, 1);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
