const router = require('express').Router();
const { getDb, queryAll, queryOne, run } = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

// GET /api/labs — list all labs (students & admins)
router.get('/', authenticate, async (req, res) => {
  await getDb();
  const labs = queryAll(`
    SELECT l.*, u.name as author_name 
    FROM labs l LEFT JOIN users u ON l.created_by = u.id
    ORDER BY l.created_at DESC
  `);
  res.json(labs);
});

// GET /api/labs/:id — get single lab
router.get('/:id', authenticate, async (req, res) => {
  await getDb();
  const lab = queryOne(`
    SELECT l.*, u.name as author_name 
    FROM labs l LEFT JOIN users u ON l.created_by = u.id
    WHERE l.id = ?
  `, [req.params.id]);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  res.json(lab);
});

// POST /api/labs — create lab (admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
  const { title, description, instructions, starter_code, language } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  await getDb();
  const id = run(
    'INSERT INTO labs (title, description, instructions, starter_code, language, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description || '', instructions || '', starter_code || '', language || 'javascript', req.user.id]
  );
  const lab = queryOne('SELECT * FROM labs WHERE id = ?', [id]);
  res.status(201).json(lab);
});

// PUT /api/labs/:id — update lab (admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  const { title, description, instructions, starter_code, language } = req.body;
  await getDb();
  const lab = queryOne('SELECT * FROM labs WHERE id = ?', [req.params.id]);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });

  run(
    'UPDATE labs SET title=?, description=?, instructions=?, starter_code=?, language=? WHERE id=?',
    [title || lab.title, description ?? lab.description, instructions ?? lab.instructions, starter_code ?? lab.starter_code, language || lab.language, req.params.id]
  );
  res.json(queryOne('SELECT * FROM labs WHERE id = ?', [req.params.id]));
});

// DELETE /api/labs/:id — delete lab (admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  await getDb();
  const lab = queryOne('SELECT * FROM labs WHERE id = ?', [req.params.id]);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  run('DELETE FROM labs WHERE id = ?', [req.params.id]);
  res.json({ message: 'Lab deleted' });
});

module.exports = router;
