const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

router.use(auth, admin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/messages', adminController.getMessages);
router.delete('/messages/:id', adminController.deleteMessage);
router.delete('/subscribers/:id', adminController.deleteSubscriber);

module.exports = router;
