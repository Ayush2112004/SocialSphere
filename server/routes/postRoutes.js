const express = require('express');
const router = express.Router();
const { createPost, getPosts, toggleLike, votePoll } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getPosts);
router.post('/', authMiddleware, upload.single('image'), createPost);
router.put('/:id/like', authMiddleware, toggleLike);
router.put('/:id/poll/vote', authMiddleware, votePoll);

module.exports = router;
