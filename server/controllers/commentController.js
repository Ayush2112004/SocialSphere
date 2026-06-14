const Post = require('../models/Post');
const User = require('../models/User');

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add comment to Post document
    post.comments.push({
      author: req.user.id,
      text
    });
    
    await post.save();

    const newCommentId = post.comments[post.comments.length - 1]._id;

    await post.populate({
      path: 'comments.author',
      select: 'username handle profilePicture'
    });
    
    const populatedComment = post.comments.find(c => c._id.toString() === newCommentId.toString());

    // Notify the post author if someone else commented on their post
    if (post.author.toString() !== req.user.id) {
      await User.findByIdAndUpdate(post.author, {
        $push: {
          notifications: {
            sender: req.user.id,
            type: 'comment',
            post: post._id
          }
        }
      });
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId)
      .populate('comments.author', 'username handle profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Sort comments by createdAt ascending
    const sortedComments = post.comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json(sortedComments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
