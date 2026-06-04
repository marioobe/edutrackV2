const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getNilai, getNilaiById, addNilai, updateNilai, deleteNilai } = require('../controllers/nilaiController');

router.use(auth);

router.get('/', getNilai);
router.get('/:id', getNilaiById);
router.post('/', addNilai);
router.put('/:id', updateNilai);
router.delete('/:id', deleteNilai);

module.exports = router;
