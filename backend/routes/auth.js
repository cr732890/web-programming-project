const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, queryOne, run } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

  await getDb();
  const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const userRole = role === 'admin' ? 'admin' : 'student'; // Only allow admin if explicitly set
  const id = run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashed, userRole]);

  const token = jwt.sign({ id, name, email, role: userRole }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email, role: userRole } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  await getDb();
  const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  await getDb();
  const user = queryOne('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;