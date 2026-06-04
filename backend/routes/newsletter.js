const router = require('express').Router();
const pool = require('../config/db');
const nodemailer = require('nodemailer');
const auth = require('../middleware/authMiddleware');

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

router.get('/subscribers', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.post('/send', auth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }

    const [rows] = await pool.execute('SELECT email FROM subscribers');
    if (rows.length === 0) {
      return res.status(400).json({ message: 'No subscribers.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const bccList = rows.map(r => r.email);
    const info = await transporter.sendMail({
      from: `"EduTrack" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      bcc: bccList,
      subject: subject,
      html: message,
    });

    res.json({ message: `Newsletter sent to ${bccList.length} subscribers.`, messageId: info.messageId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send newsletter.', error: err.message });
  }
});

module.exports = router;
