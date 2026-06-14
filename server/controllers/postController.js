const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createPost = async (req, res) => {
  try {
    const { content, isPromotion, poll } = req.body;
    let imageUrl = '';
    let parsedPoll = null;

    if (poll) {
      try { parsedPoll = JSON.parse(poll); } catch(e) {}
    }

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!content && !imageUrl && !parsedPoll) {
      return res.status(400).json({ message: 'Post must contain text, an image, or a poll' });
    }

    const post = await Post.create({
      author: req.user.id,
      content,
      image: imageUrl,
      isPromotion: isPromotion === 'true' || isPromotion === true,
      poll: parsedPoll
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username handle profilePicture hasBadge');

    // Notify followers about the new post
    const followers = await User.find({ following: req.user.id });
    if (followers.length > 0) {
      const followerIds = followers.map(f => f._id);
      await User.updateMany(
        { _id: { $in: followerIds } },
        {
          $push: {
            notifications: {
              sender: req.user.id,
              type: 'post',
              post: post._id
            }
          }
        }
      );
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { author: authorId, type, category, userId } = req.query;

    let matchQuery = {};
    if (authorId) matchQuery.author = new mongoose.Types.ObjectId(authorId);
    if (type === 'promotions') matchQuery.isPromotion = true;

    if (category === 'For You' && userId) {
      const user = await User.findById(userId);
      if (user) {
        matchQuery.author = { $in: user.following };
      }
    }

    let sortQuery = { createdAt: -1 };
    
    if (category === 'Most Liked') sortQuery = { likeCount: -1, createdAt: -1 };
    if (category === 'Most Commented') sortQuery = { commentCount: -1, createdAt: -1 };
    if (category === 'Most Shared') sortQuery = { shares: -1, createdAt: -1 };

    const pipeline = [
      { $match: matchQuery },
      {
        $addFields: {
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          commentCount: { $size: { $ifNull: ["$comments", []] } }
        }
      },
      { $sort: sortQuery },
      {
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author'
              }
            },
            { $unwind: "$author" },
            {
              $project: {
                "author.password": 0,
                "author.email": 0
              }
            }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ];

    const result = await Post.aggregate(pipeline);
    const posts = result[0].paginatedResults;
    const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
      
      // Notify the post author if someone else liked their post
      if (post.author.toString() !== userId) {
        await User.findByIdAndUpdate(post.author, {
          $push: {
            notifications: {
              sender: userId,
              type: 'like',
              post: post._id
            }
          }
        });
      }
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post || !post.poll || !post.poll.options) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Remove user's vote from any previous option
    post.poll.options.forEach(option => {
      option.votes = option.votes.filter(userId => userId.toString() !== req.user.id.toString());
    });

    // Add vote to the selected option
    if (optionIndex !== undefined && post.poll.options[optionIndex]) {
      post.poll.options[optionIndex].votes.push(req.user.id);
    }

    await post.save();
    
    // Return updated post
    const populatedPost = await Post.findById(post._id).populate('author', 'username handle profilePicture hasBadge');
    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
