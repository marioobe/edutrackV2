const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} = require('../controllers/taskController');

router.use(auth);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);

module.exports = router;
