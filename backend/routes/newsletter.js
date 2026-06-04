const router = require('express').Router();
const pool = require('../config/db');

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    await pool.execute('INSERT INTO subscribers (email) VALUES (?)', [email]);
    res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already subscribed.' });
    }
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
