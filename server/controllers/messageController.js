const User = require('../models/User');

exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('chats.withUser', 'username profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const chats = user.chats.map(chat => {
      const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
      return {
        user: chat.withUser,
        lastMessage: lastMessage ? lastMessage.text : '',
        lastMessageAt: lastMessage ? lastMessage.createdAt : null,
        unreadCount: 0 // Simplification
      };
    }).filter(c => c.user); // remove null users if any

    // Sort chats by lastMessageAt descending
    chats.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const chat = user.chats.find(c => c.withUser.toString() === otherUserId);

    // Clear notifications for this chat
    user.notifications = user.notifications.filter(n => !(n.sender.toString() === otherUserId && n.type === 'message'));
    await user.save();

    res.json(chat ? chat.messages : []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text } = req.body;
    const senderId = req.user.id;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    const newMessage = { sender: senderId, text };

    // Update sender's chats array
    const sender = await User.findById(senderId);
    let senderChat = sender.chats.find(c => c.withUser.toString() === receiverId);
    if (senderChat) {
      senderChat.messages.push(newMessage);
    } else {
      sender.chats.push({ withUser: receiverId, messages: [newMessage] });
    }
    await sender.save();

    // Update receiver's chats array
    const receiver = await User.findById(receiverId);
    let receiverChat = receiver.chats.find(c => c.withUser.toString() === senderId);
    if (receiverChat) {
      receiverChat.messages.push(newMessage);
    } else {
      receiver.chats.push({ withUser: senderId, messages: [newMessage] });
    }

    // Add notification if not already present
    const existingNotif = receiver.notifications.find(n => n.sender.toString() === senderId && n.type === 'message');
    if (!existingNotif) {
      receiver.notifications.push({ sender: senderId, type: 'message' });
    }

    await receiver.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
