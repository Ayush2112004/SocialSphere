import React, { useState, useContext } from 'react';
import { Card, Box, Avatar, Typography, Button, IconButton, Collapse, TextField, Dialog, DialogTitle, DialogContent, Grid, Tooltip } from '@mui/material';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import ChatBubbleOutlined from '@mui/icons-material/ChatBubbleOutlined';
import ShareOutlined from '@mui/icons-material/ShareOutlined';
import Verified from '@mui/icons-material/Verified';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkIcon from '@mui/icons-material/Link';
import moment from 'moment';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const formatContent = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const formattedLine = line.split(/(\s+)/).map((word, j) => {
      if (word.startsWith('#')) {
        return <span key={j} style={{ color: '#1E88E5' }}>{word}</span>;
      }
      return word;
    });
    return <React.Fragment key={i}>{formattedLine}<br /></React.Fragment>;
  });
};

const PostCard = ({ post, onLikeToggle }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isLiked = user ? post.likes.includes(user._id) : false;
  
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [liked, setLiked] = useState(isLiked);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  
  // Follow State
  const [isFollowing, setIsFollowing] = useState(user?.following?.includes(post.author?._id) || false);
  const [followLoading, setFollowLoading] = useState(false);

  React.useEffect(() => {
    setIsFollowing(user?.following?.includes(post.author?._id) || false);
  }, [user?.following, post.author?._id]);

  // Share Dialog State
  const [shareOpen, setShareOpen] = useState(false);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    try {
      await onLikeToggle(post._id);
    } catch (error) {
      setLiked(liked);
      setLikesCount(liked ? likesCount + 1 : likesCount - 1);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!post.author?._id) return;
    
    try {
      setFollowLoading(true);
      const res = await api.put(`/users/${post.author._id}/follow`);
      // Update local state based on response
      setIsFollowing(res.data.following.includes(post.author._id));
      // Update AuthContext user object and localStorage
      if (user) {
        user.following = res.data.following; 
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Poll State
  const [pollData, setPollData] = useState(post.poll);
  
  React.useEffect(() => {
    setPollData(post.poll);
  }, [post.poll]);

  const handleVote = async (optionIndex) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.put(`/posts/${post._id}/poll/vote`, { optionIndex });
      setPollData(res.data.poll);
    } catch (err) {
      console.error('Failed to vote', err);
      toast.error('Failed to submit vote');
    }
  };

  const loadComments = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentsLoaded) {
      try {
        const res = await api.get(`/comments/${post._id}`);
        setComments(res.data);
        setCommentsLoaded(true);
      } catch (err) {
        console.error('Failed to load comments', err);
      }
    }
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async (e) => {
    if (e.key === 'Enter' && newComment.trim()) {
      try {
        const res = await api.post(`/comments/${post._id}`, { text: newComment });
        setComments([...comments, res.data]);
        setNewComment('');
      } catch (err) {
        console.error('Failed to add comment', err);
      }
    }
  };

  const handleShareClick = () => {
    if (navigator.share && window.innerWidth < 768) {
      navigator.share({
        title: 'Check out this post on SocialSphere',
        text: post.content || 'Great post!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      setShareOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setShareOpen(false);
  };

  return (
    <Card sx={{ mb: 3, borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={post.author?.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.author.profilePicture}` : ''} sx={{ width: 44, height: 44, bgcolor: 'primary.main', cursor: 'pointer' }} onClick={() => navigate(`/profile/${post.author?._id}`)}>
              {post.author?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '16px', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate(`/profile/${post.author?._id}`)}>
                  {post.author?.username || 'Unknown User'}
                </Typography>
                {post.author?.hasBadge && <Verified color="primary" sx={{ fontSize: 16 }} />}
                <Typography variant="body2" color="text.secondary">
                  {post.author?.handle || '@unknown'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {moment(post.createdAt).fromNow()}
              </Typography>
            </Box>
          </Box>
          {user && user._id !== post.author?._id && (
            <Button 
              variant={isFollowing ? "outlined" : "contained"} 
              size="small" 
              onClick={handleFollow}
              disabled={followLoading}
              sx={{ borderRadius: '20px', px: 3, textTransform: 'none', fontWeight: 'bold', boxShadow: 'none' }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </Box>

        {post.content && (
          <Typography variant="body1" sx={{ mb: 2, fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {formatContent(post.content)}
          </Typography>
        )}

        {/* Poll Rendering */}
        {pollData && pollData.options && pollData.options.length > 0 && (
          <Box sx={{ mt: 2, mb: 1, p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#fafafa' }}>
            {pollData.question && (
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>{pollData.question}</Typography>
            )}
            {(() => {
              const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes.length, 0);
              const userVotedOptionIndex = user ? pollData.options.findIndex(opt => opt.votes.includes(user._id)) : -1;
              const hasVoted = userVotedOptionIndex !== -1;

              return pollData.options.map((opt, i) => {
                const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                const isUserChoice = i === userVotedOptionIndex;

                if (hasVoted) {
                  return (
                    <Box key={i} sx={{ mb: 1.5, position: 'relative', cursor: 'pointer' }} onClick={() => handleVote(i)}>
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 0, left: 0, bottom: 0, 
                        width: `${percentage}%`, 
                        bgcolor: isUserChoice ? 'primary.main' : (theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0'), 
                        borderRadius: '8px',
                        zIndex: 0,
                        opacity: isUserChoice ? 0.2 : 0.5,
                        transition: 'width 0.5s ease-out'
                      }} />
                      <Box sx={{ position: 'relative', zIndex: 1, p: 1.5, display: 'flex', justifyContent: 'space-between', border: `2px solid ${isUserChoice ? '#1976d2' : 'transparent'}`, borderRadius: '8px' }}>
                        <Typography variant="body2" fontWeight={isUserChoice ? "bold" : "500"}>{opt.text}</Typography>
                        <Typography variant="body2" fontWeight="bold">{percentage}%</Typography>
                      </Box>
                    </Box>
                  );
                } else {
                  return (
                    <Button 
                      key={i} 
                      fullWidth 
                      variant="outlined" 
                      onClick={() => handleVote(i)}
                      sx={{ mb: 1.5, py: 1, textTransform: 'none', justifyContent: 'flex-start', borderRadius: '8px', color: 'text.primary', borderColor: 'divider', fontWeight: '500', '&:hover': { borderColor: 'primary.main', bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'primary.50' } }}
                    >
                      {opt.text}
                    </Button>
                  );
                }
              });
            })()}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {pollData.options.reduce((sum, opt) => sum + opt.votes.length, 0)} votes
            </Typography>
          </Box>
        )}
      </Box>

      {post.image && (
        <Box sx={{ width: '100%', px: 2, pb: 2 }}>
          <img 
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.image}`} 
            alt="Post content" 
            style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', maxHeight: '500px' }} 
            loading="lazy"
          />
        </Box>
      )}

      <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: liked ? 'error.main' : 'text.secondary', '&:hover': { color: 'error.main' } }} onClick={handleLike}>
          {liked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          <Typography variant="body2" fontWeight="500">{likesCount}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={loadComments}>
          <ChatBubbleOutlined fontSize="small" />
          <Typography variant="body2" fontWeight="500">{comments.length}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={handleShareClick}>
          <ShareOutlined fontSize="small" />
          <Typography variant="body2" fontWeight="500">{post.shares || 0}</Typography>
        </Box>
      </Box>

      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, pb: 2, bgcolor: '#FAFAFA' }}>
          {comments.map((comment) => (
            <Box key={comment._id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <Avatar src={comment.author?.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${comment.author.profilePicture}` : ''} sx={{ width: 32, height: 32, mt: 0.5 }}>
                {comment.author?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: '12px', flex: 1, border: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {comment.author?.username || 'Unknown User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {moment(comment.createdAt).fromNow()}
                  </Typography>
                </Box>
                <Typography variant="body2">{comment.text}</Typography>
              </Box>
            </Box>
          ))}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            {user && (
              <Avatar src={user?.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePicture}` : ''} sx={{ width: 32, height: 32 }}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            )}
            <TextField
              fullWidth
              size="small"
              placeholder={user ? "Write a comment..." : "Login to comment"}
              disabled={!user}
              variant="outlined"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleCommentSubmit}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: 'white' } }}
            />
          </Box>
        </Box>
      </Collapse>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: '300px' } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Share this post</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 1, pb: 2 }}>
            <Grid item xs={4} textAlign="center">
              <Tooltip title="WhatsApp">
                <IconButton 
                  component="a" 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`} 
                  target="_blank"
                  sx={{ bgcolor: '#25D366', color: 'white', '&:hover': { bgcolor: '#128C7E' }, width: 48, height: 48 }}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Tooltip title="Twitter">
                <IconButton 
                  component="a" 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Check out this post!`} 
                  target="_blank"
                  sx={{ bgcolor: '#1DA1F2', color: 'white', '&:hover': { bgcolor: '#0c85d0' }, width: 48, height: 48 }}
                >
                  <TwitterIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Tooltip title="Facebook">
                <IconButton 
                  component="a" 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                  target="_blank"
                  sx={{ bgcolor: '#1877F2', color: 'white', '&:hover': { bgcolor: '#165eab' }, width: 48, height: 48 }}
                >
                  <FacebookIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Tooltip title="Email">
                <IconButton 
                  component="a" 
                  href={`mailto:?subject=Check out this post&body=${encodeURIComponent(window.location.href)}`} 
                  sx={{ bgcolor: '#EA4335', color: 'white', '&:hover': { bgcolor: '#c5221f' }, width: 48, height: 48 }}
                >
                  <EmailIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Tooltip title="Copy Link">
                <IconButton 
                  onClick={copyToClipboard}
                  sx={{ bgcolor: '#757575', color: 'white', '&:hover': { bgcolor: '#424242' }, width: 48, height: 48 }}
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PostCard;
