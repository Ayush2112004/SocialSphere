const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('notifications.sender', 'username profilePicture')
      .populate('notifications.post', 'content image');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notifications = user.notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { "notifications.$[].read": true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
