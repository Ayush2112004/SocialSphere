const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfilePicture, updateCoverPhoto, toggleFollow, getSuggestions } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/suggestions', protect, getSuggestions);
router.get('/:id', protect, getUserProfile);
router.put('/profile-picture', protect, upload.single('image'), updateProfilePicture);
router.put('/cover-photo', protect, upload.single('image'), updateCoverPhoto);
router.put('/:id/follow', protect, toggleFollow);

module.exports = router;
