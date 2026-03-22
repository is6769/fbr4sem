const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { SECRET, REFRESH_SECRET } = require('../middleware/auth');
const router = express.Router();

const users = [];
const validRefreshTokens = new Set();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body;

  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const allowedRoles = ['user', 'seller', 'admin'];
  const userRole = allowedRoles.includes(role) ? role : 'user';

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), email, first_name, last_name, password: hashedPassword, role: userRole, blocked: false };
  users.push(user);

  const { password: _, ...userWithoutPassword } = user;
  res.status(201).json(userWithoutPassword);
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.blocked) {
    return res.status(403).json({ message: 'User is blocked' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, REFRESH_SECRET, { expiresIn: '7d' });
  validRefreshTokens.add(refreshToken);
  res.json({ accessToken, refreshToken });
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  const token = header.split(' ')[1];
  if (!validRefreshTokens.has(token)) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user || user.blocked) {
      return res.status(403).json({ message: 'Access denied' });
    }
    validRefreshTokens.delete(token);
    const accessToken = jwt.sign({ id: decoded.id, email: decoded.email, role: user.role }, SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: decoded.id, email: decoded.email, role: user.role }, REFRESH_SECRET, { expiresIn: '7d' });
    validRefreshTokens.add(refreshToken);
    res.json({ accessToken, refreshToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
module.exports.users = users;
