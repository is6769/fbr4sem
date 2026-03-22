const express = require('express');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/auth');
const { users } = require('./auth');
const router = express.Router();

// GET /api/users — Администратор
router.get('/', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

// PUT /api/users/:id — Администратор
router.put('/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { first_name, last_name, role } = req.body;
  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (role && ['user', 'seller', 'admin'].includes(role)) user.role = role;

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// PATCH /api/users/:id/block — Администратор
router.patch('/:id/block', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.blocked = !user.blocked;
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
