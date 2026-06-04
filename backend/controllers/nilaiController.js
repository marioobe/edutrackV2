const pool = require('../config/db');

const getNilai = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM nilai WHERE user_id = ? ORDER BY semester DESC, created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const addNilai = async (req, res) => {
  try {
    const { mata_kuliah, semester, sks, nilai_angka } = req.body;

    if (!mata_kuliah || nilai_angka === undefined) {
      return res.status(400).json({ message: 'mata_kuliah and nilai_angka are required.' });
    }
    if (nilai_angka < 0 || nilai_angka > 100) {
      return res.status(400).json({ message: 'nilai_angka must be between 0 and 100.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO nilai (user_id, mata_kuliah, semester, sks, nilai_angka) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, mata_kuliah, semester || 1, sks || 2, nilai_angka]
    );

    const [nilai] = await pool.execute('SELECT * FROM nilai WHERE id = ?', [result.insertId]);
    res.status(201).json(nilai[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const updateNilai = async (req, res) => {
  try {
    const { mata_kuliah, semester, sks, nilai_angka } = req.body;

    const [existing] = await pool.execute('SELECT * FROM nilai WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Nilai not found.' });
    }

    if (nilai_angka !== undefined && (nilai_angka < 0 || nilai_angka > 100)) {
      return res.status(400).json({ message: 'nilai_angka must be between 0 and 100.' });
    }

    await pool.execute(
      'UPDATE nilai SET mata_kuliah = ?, semester = ?, sks = ?, nilai_angka = ? WHERE id = ?',
      [
        mata_kuliah ?? existing[0].mata_kuliah,
        semester ?? existing[0].semester,
        sks ?? existing[0].sks,
        nilai_angka ?? existing[0].nilai_angka,
        req.params.id,
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM nilai WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteNilai = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM nilai WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Nilai not found.' });
    }
    res.json({ message: 'Nilai deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getNilaiById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM nilai WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nilai not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getNilai, getNilaiById, addNilai, updateNilai, deleteNilai };
