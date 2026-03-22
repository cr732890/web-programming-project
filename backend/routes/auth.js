const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, queryOne, run } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, username, email, password, role } = req.body;
  if (!name || !username || !password) return res.status(400).json({ error: 'Name, username, and password are required' });

  await getDb();

  const existingUsername = queryOne('SELECT id FROM users WHERE username = ?', [username]);
  if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

  if (email) {
    const existingEmail = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const userRole = role === 'admin' ? 'admin' : 'student';
  const id = run(
    'INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [name, username, email || null, hashed, userRole]
  );

  const token = jwt.sign({ id, name, username, role: userRole }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, username, role: userRole } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  await getDb();
  const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

  const token = jwt.sign(
    { id: user.id, name: user.name, username: user.username, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, username: user.username, role: user.role } });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  await getDb();
  const user = queryOne('SELECT id, name, username, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
