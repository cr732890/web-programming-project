const router = require('express').Router();
const { getDb, queryAll, queryOne, run } = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly);

// GET /api/admin/stats — dashboard summary
router.get('/stats', async (req, res) => {
  await getDb();
  const [{ total_users }] = queryAll("SELECT COUNT(*) as total_users FROM users WHERE role='student'");
  const [{ total_labs }] = queryAll('SELECT COUNT(*) as total_labs FROM labs');
  const [{ total_submissions }] = queryAll('SELECT COUNT(*) as total_submissions FROM submissions');
  const [{ graded }] = queryAll('SELECT COUNT(*) as graded FROM submissions WHERE grade IS NOT NULL');
  const [{ avg_grade }] = queryAll('SELECT ROUND(AVG(grade), 1) as avg_grade FROM submissions WHERE grade IS NOT NULL');

  res.json({ total_users, total_labs, total_submissions, graded, pending: total_submissions - graded, avg_grade: avg_grade || 0 });
});

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
  await getDb();
  const users = queryAll('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  res.json(users);
});

// DELETE /api/admin/users/:id — remove a user
router.delete('/users/:id', async (req, res) => {
  await getDb();
  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  run('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deleted' });
});

// PUT /api/admin/users/:id/role — change user role
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['student', 'admin'].includes(role)) return res.status(400).json({ error: 'Role must be student or admin' });
  await getDb();
  run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  res.json(queryOne('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id]));
});

module.exports = router;
