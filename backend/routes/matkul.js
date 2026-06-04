const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getMatkul, createMatkul, updateMatkul, deleteMatkul } = require('../controllers/matkulController');

router.use(auth);

router.get('/', getMatkul);
router.post('/', createMatkul);
router.put('/:id', updateMatkul);
router.delete('/:id', deleteMatkul);

module.exports = router;
