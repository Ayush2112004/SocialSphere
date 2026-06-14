const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  handle: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  points: { type: Number, default: 0 },
  promotionsCount: { type: Number, default: 0 },
  hasBadge: { type: Boolean, default: false },
  notifications: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['post', 'like', 'comment', 'follow', 'message'] },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  chats: [{
    withUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [{
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
