const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const { register, login, getProfile, updateProfile, changePassword, uploadFoto } = require('../controllers/authController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/profiles'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'user-' + req.user.id + '-' + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);
router.post('/upload-foto', auth, upload.single('foto'), uploadFoto);

module.exports = router;
