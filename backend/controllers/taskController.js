const pool = require('../config/db');

const getTasks = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getTask = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, mata_kuliah, priority, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const validPriorities = ['tinggi', 'sedang', 'rendah'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Priority must be tinggi, sedang, or rendah.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO tasks (user_id, title, mata_kuliah, priority, deadline) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, mata_kuliah || null, priority || 'sedang', deadline || null]
    );

    const [task] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(task[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, mata_kuliah, priority, deadline, is_done } = req.body;

    const [existing] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (priority) {
      const validPriorities = ['tinggi', 'sedang', 'rendah'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ message: 'Priority must be tinggi, sedang, or rendah.' });
      }
    }

    await pool.execute(
      'UPDATE tasks SET title = ?, mata_kuliah = ?, priority = ?, deadline = ?, is_done = ? WHERE id = ?',
      [
        title ?? existing[0].title,
        mata_kuliah ?? existing[0].mata_kuliah,
        priority ?? existing[0].priority,
        deadline ?? existing[0].deadline,
        is_done ?? existing[0].is_done,
        req.params.id,
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const toggleTask = async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await pool.execute(
      'UPDATE tasks SET is_done = ? WHERE id = ?',
      [!existing[0].is_done, req.params.id]
    );

    const [updated] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, toggleTask };
