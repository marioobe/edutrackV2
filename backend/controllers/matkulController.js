const pool = require('../config/db');

const getMatkul = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM mata_kuliah WHERE user_id = ? ORDER BY nama ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const createMatkul = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({ message: 'Nama mata kuliah is required.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO mata_kuliah (user_id, nama) VALUES (?, ?)',
      [req.user.id, nama]
    );

    const [matkul] = await pool.execute('SELECT * FROM mata_kuliah WHERE id = ?', [result.insertId]);
    res.status(201).json(matkul[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const updateMatkul = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({ message: 'Nama mata kuliah is required.' });
    }

    const [result] = await pool.execute(
      'UPDATE mata_kuliah SET nama = ? WHERE id = ? AND user_id = ?',
      [nama, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mata kuliah not found.' });
    }

    const [updated] = await pool.execute('SELECT * FROM mata_kuliah WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteMatkul = async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM mata_kuliah WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mata kuliah not found.' });
    }
    res.json({ message: 'Mata kuliah deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getMatkul, createMatkul, updateMatkul, deleteMatkul };
