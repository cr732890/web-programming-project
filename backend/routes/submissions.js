const router = require('express').Router();
const { getDb, queryAll, queryOne, run } = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

// POST /api/submissions — submit code for a lab
router.post('/', authenticate, async (req, res) => {
  try {
    const { lab_id, code } = req.body;
    if (!lab_id || !code) return res.status(400).json({ error: 'lab_id and code are required' });

    await getDb();
    const lab = queryOne('SELECT id FROM labs WHERE id = ?', [lab_id]);
    if (!lab) return res.status(404).json({ error: 'Lab not found. Please ensure lab exists.' });

    const id = run(
      'INSERT INTO submissions (user_id, lab_id, code) VALUES (?, ?, ?)',
      [req.user.id, lab_id, code]
    );
    const submission = queryOne('SELECT * FROM submissions WHERE id = ?', [id]);
    res.status(201).json(submission);
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Failed to save submission: ' + err.message });
  }
});

// GET /api/submissions/my — get current student's submissions
router.get('/my', authenticate, async (req, res) => {
  await getDb();
  const submissions = queryAll(`
    SELECT s.*, l.title as lab_title 
    FROM submissions s JOIN labs l ON s.lab_id = l.id
    WHERE s.user_id = ?
    ORDER BY s.submitted_at DESC
  `, [req.user.id]);
  res.json(submissions);
});

// GET /api/submissions — get all submissions (admin only)
router.get('/', authenticate, adminOnly, async (req, res) => {
  await getDb();
  const { lab_id, user_id } = req.query;
  let sql = `
    SELECT s.*, u.name as student_name, u.email as student_email, l.title as lab_title
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    JOIN labs l ON s.lab_id = l.id
    WHERE 1=1
  `;
  const params = [];
  if (lab_id) { sql += ' AND s.lab_id = ?'; params.push(lab_id); }
  if (user_id) { sql += ' AND s.user_id = ?'; params.push(user_id); }
  sql += ' ORDER BY s.submitted_at DESC';

  const submissions = queryAll(sql, params);
  res.json(submissions);
});

// GET /api/submissions/:id — get single submission
router.get('/:id', authenticate, async (req, res) => {
  await getDb();
  const submission = queryOne(`
    SELECT s.*, u.name as student_name, l.title as lab_title
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    JOIN labs l ON s.lab_id = l.id
    WHERE s.id = ?
  `, [req.params.id]);

  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  // Students can only see their own
  if (req.user.role !== 'admin' && submission.user_id !== req.user.id)
    return res.status(403).json({ error: 'Access denied' });

  res.json(submission);
});

// PUT /api/submissions/:id/grade — grade a submission (admin only)
router.put('/:id/grade', authenticate, adminOnly, async (req, res) => {
  const { grade, feedback } = req.body;
  if (grade === undefined) return res.status(400).json({ error: 'Grade is required' });
  if (grade < 0 || grade > 100) return res.status(400).json({ error: 'Grade must be between 0 and 100' });

  await getDb();
  const submission = queryOne('SELECT * FROM submissions WHERE id = ?', [req.params.id]);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  run(
    'UPDATE submissions SET grade=?, feedback=?, graded_at=CURRENT_TIMESTAMP WHERE id=?',
    [grade, feedback || '', req.params.id]
  );
  res.json(queryOne('SELECT * FROM submissions WHERE id = ?', [req.params.id]));
});

module.exports = router;
