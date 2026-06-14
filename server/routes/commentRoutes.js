const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:postId', getComments);
router.post('/:postId', authMiddleware, addComment);

module.exports = router;
