const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.use(auth, admin);

router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, nim, prodi, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, message, created_at FROM messages ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
