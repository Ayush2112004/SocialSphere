const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { username, handle, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { handle }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or handle already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      handle,
      email,
      password: hashedPassword,
      hasBadge: Math.random() > 0.5 // Randomly assign a badge for demo purposes
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        handle: user.handle,
        email: user.email,
        profilePicture: user.profilePicture,
        hasBadge: user.hasBadge,
        following: user.following,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        handle: user.handle,
        email: user.email,
        profilePicture: user.profilePicture,
        hasBadge: user.hasBadge,
        following: user.following,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
