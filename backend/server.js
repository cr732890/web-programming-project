require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Virtual Lab API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Virtual Lab API running at http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   GET    /api/labs`);
  console.log(`   POST   /api/labs          (admin)`);
  console.log(`   PUT    /api/labs/:id       (admin)`);
  console.log(`   DELETE /api/labs/:id       (admin)`);
  console.log(`   POST   /api/submissions`);
  console.log(`   GET    /api/submissions/my`);
  console.log(`   GET    /api/submissions    (admin)`);
  console.log(`   PUT    /api/submissions/:id/grade (admin)`);
  console.log(`   GET    /api/admin/stats    (admin)`);
  console.log(`   GET    /api/admin/users    (admin)`);
});
