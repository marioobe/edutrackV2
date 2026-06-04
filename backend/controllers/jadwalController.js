const pool = require('../config/db');

const getJadwal = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM jadwal WHERE user_id = ? ORDER BY FIELD(hari, "senin","selasa","rabu","kamis","jumat","sabtu"), jam_mulai',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const addJadwal = async (req, res) => {
  try {
    const { mata_kuliah, jenis, hari, jam_mulai, jam_selesai, ruang } = req.body;

    if (!mata_kuliah || !hari || !jam_mulai || !jam_selesai) {
      return res.status(400).json({ message: 'mata_kuliah, hari, jam_mulai, jam_selesai are required.' });
    }

    const [bentrok] = await pool.execute(
      `SELECT * FROM jadwal WHERE user_id = ? AND hari = ? AND (
        (jam_mulai < ? AND jam_selesai > ?) OR
        (jam_mulai >= ? AND jam_mulai < ?)
      )`,
      [req.user.id, hari, jam_selesai, jam_mulai, jam_mulai, jam_selesai]
    );

    if (bentrok.length > 0) {
      return res.status(409).json({
        message: `Jadwal bentrok dengan "${bentrok[0].mata_kuliah}" (${bentrok[0].jam_mulai}-${bentrok[0].jam_selesai}).`,
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO jadwal (user_id, mata_kuliah, jenis, hari, jam_mulai, jam_selesai, ruang) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, mata_kuliah, jenis || 'kuliah', hari, jam_mulai, jam_selesai, ruang || null]
    );

    const [jadwal] = await pool.execute('SELECT * FROM jadwal WHERE id = ?', [result.insertId]);
    res.status(201).json(jadwal[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const updateJadwal = async (req, res) => {
  try {
    const { mata_kuliah, jenis, hari, jam_mulai, jam_selesai, ruang } = req.body;

    const [existing] = await pool.execute('SELECT * FROM jadwal WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Jadwal not found.' });
    }

    const [bentrok] = await pool.execute(
      `SELECT * FROM jadwal WHERE user_id = ? AND hari = ? AND id != ? AND (
        (jam_mulai < ? AND jam_selesai > ?) OR
        (jam_mulai >= ? AND jam_mulai < ?)
      )`,
      [req.user.id, hari || existing[0].hari, req.params.id, jam_selesai || existing[0].jam_selesai, jam_mulai || existing[0].jam_mulai, jam_mulai || existing[0].jam_mulai, jam_selesai || existing[0].jam_selesai]
    );

    if (bentrok.length > 0) {
      return res.status(409).json({
        message: `Jadwal bentrok dengan "${bentrok[0].mata_kuliah}" (${bentrok[0].jam_mulai}-${bentrok[0].jam_selesai}).`,
      });
    }

    await pool.execute(
      'UPDATE jadwal SET mata_kuliah = ?, jenis = ?, hari = ?, jam_mulai = ?, jam_selesai = ?, ruang = ? WHERE id = ?',
      [
        mata_kuliah ?? existing[0].mata_kuliah,
        jenis ?? existing[0].jenis,
        hari ?? existing[0].hari,
        jam_mulai ?? existing[0].jam_mulai,
        jam_selesai ?? existing[0].jam_selesai,
        ruang ?? existing[0].ruang,
        req.params.id,
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM jadwal WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteJadwal = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM jadwal WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Jadwal not found.' });
    }
    res.json({ message: 'Jadwal deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getJadwal, addJadwal, updateJadwal, deleteJadwal };
