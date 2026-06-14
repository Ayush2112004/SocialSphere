const express = require('express');
const router = express.Router();
const { getChats, getMessages, sendMessage } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/chats', getChats);
router.get('/:id', getMessages);
router.post('/:id', sendMessage);

module.exports = router;
