const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getJadwal, addJadwal, updateJadwal, deleteJadwal } = require('../controllers/jadwalController');

router.use(auth);

router.get('/', getJadwal);
router.post('/', addJadwal);
router.put('/:id', updateJadwal);
router.delete('/:id', deleteJadwal);

module.exports = router;
