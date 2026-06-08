const pool = require('../config/db');

const getStats = async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.execute('SELECT COUNT(*) AS userCount FROM users');
    const [[{ taskCount }]] = await pool.execute('SELECT COUNT(*) AS taskCount FROM tasks');
    const [[{ messageCount }]] = await pool.execute('SELECT COUNT(*) AS messageCount FROM messages');
    const [[{ subscriberCount }]] = await pool.execute('SELECT COUNT(*) AS subscriberCount FROM subscribers');
    res.json({ userCount, taskCount, messageCount, subscriberCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, nim, prodi, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM messages WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Message not found.' });
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM subscribers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Subscriber not found.' });
    res.json({ message: 'Subscriber deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getStats, getUsers, deleteUser, getMessages, deleteMessage, deleteSubscriber };
