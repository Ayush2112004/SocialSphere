const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username handle profilePicture hasBadge')
      .populate('following', 'username handle profilePicture hasBadge')
      .select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCoverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { coverPhoto: imageUrl },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      // Create notification
      targetUser.notifications.push({
        sender: currentUserId,
        type: 'follow'
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ following: currentUser.following });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const followingIds = currentUser.following || [];
    
    // Ensure all excluded IDs are plain strings
    const excludedIds = [...followingIds.map(id => id.toString()), req.user.id.toString()];

    // Find users followed by people the current user follows
    const followedUsers = await User.find({ _id: { $in: followingIds } }).select('following');
    let friendsOfFriendsIds = [];
    followedUsers.forEach(user => {
      if (user.following) {
        user.following.forEach(id => {
          if (!excludedIds.includes(id.toString())) {
            friendsOfFriendsIds.push(id.toString());
          }
        });
      }
    });

    friendsOfFriendsIds = [...new Set(friendsOfFriendsIds)];
    // Randomize array
    friendsOfFriendsIds = friendsOfFriendsIds.sort(() => 0.5 - Math.random());

    let suggestions = [];
    
    if (friendsOfFriendsIds.length > 0) {
      suggestions = await User.find({ _id: { $in: friendsOfFriendsIds.slice(0, 10) } })
        .select('username handle profilePicture');
    }

    if (suggestions.length < 10) {
      const mongoose = require('mongoose');
      const moreExcludedIds = [...excludedIds, ...suggestions.map(s => s._id.toString())];
      const objectIdExclusions = moreExcludedIds.map(id => {
        try { return new mongoose.Types.ObjectId(id); } catch(e) { return null; }
      }).filter(Boolean);

      let randomUsers = await User.find({ _id: { $nin: objectIdExclusions } })
        .select('username handle profilePicture')
        .limit(50); // Fetch a pool to sample from
        
      randomUsers = randomUsers.sort(() => 0.5 - Math.random()).slice(0, 10 - suggestions.length);
      suggestions = [...suggestions, ...randomUsers];
    }
    
    // Final shuffle to mix friends of friends with randoms
    suggestions = suggestions.sort(() => 0.5 - Math.random());

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

