import React, { useState, useEffect, useContext, useRef } from 'react';
import { Box, Typography, Avatar, Button, Tabs, Tab, CircularProgress, IconButton, LinearProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import ShareIcon from '@mui/icons-material/Share';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import moment from 'moment';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const profilePicInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get(`/users/${id}`);
      setProfileUser(userRes.data);

      const postsRes = await api.get(`/posts?author=${id}`);
      setPosts(postsRes.data.posts);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.put('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileUser(res.data);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.put('/users/cover-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileUser(res.data);
    } catch (error) {
      console.error('Error updating cover photo:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profileUser) {
    return <Typography textAlign="center" mt={4}>User not found.</Typography>;
  }

  const isOwnProfile = currentUser && currentUser._id === profileUser._id;

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', pb: 8 }}>
      {/* Cover Photo */}
      <Box 
        sx={{ 
          height: 180, 
          bgcolor: '#e0e0e0', 
          position: 'relative',
          backgroundImage: profileUser.coverPhoto ? `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profileUser.coverPhoto})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <IconButton sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.8)' }}>
          <ShareIcon color="primary" />
        </IconButton>
        
        {isOwnProfile && (
          <>
            <input type="file" hidden ref={coverPhotoInputRef} onChange={handleCoverPhotoChange} accept="image/*" />
            <IconButton 
              sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
              onClick={() => coverPhotoInputRef.current.click()}
            >
              <PhotoCamera />
            </IconButton>
          </>
        )}
      </Box>

      <Box sx={{ px: 2, position: 'relative' }}>
        {/* Avatar */}
        <Box sx={{ position: 'relative', display: 'inline-block', mt: -6, mb: 1 }}>
          <Avatar 
            src={profileUser.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profileUser.profilePicture}` : ''}
            sx={{ width: 100, height: 100, border: '4px solid white', bgcolor: 'primary.main', fontSize: '40px' }}
          >
            {profileUser.username.charAt(0).toUpperCase()}
          </Avatar>
          {isOwnProfile && (
            <>
              <input type="file" hidden ref={profilePicInputRef} onChange={handleProfilePicChange} accept="image/*" />
              <IconButton 
                sx={{ 
                  position: 'absolute', bottom: 0, right: 0, 
                  bgcolor: 'primary.main', color: 'white', 
                  width: 32, height: 32, 
                  border: '2px solid white',
                  '&:hover': { bgcolor: 'primary.dark' } 
                }}
                onClick={() => profilePicInputRef.current.click()}
              >
                <PhotoCamera sx={{ fontSize: 16 }} />
              </IconButton>
            </>
          )}
        </Box>

        {/* User Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {profileUser.username} 🇮🇳
            </Typography>
            <Typography variant="body2" color="text.secondary">@{profileUser.handle}</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              📅 Joined {moment(profileUser.createdAt).format('MMM YYYY')}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Button 
              variant="outlined" 
              startIcon={<ChatBubbleOutlineIcon />} 
              onClick={() => isOwnProfile ? navigate('/chat') : navigate(`/chat/${profileUser._id}`)}
              sx={{ borderRadius: '20px', mb: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              {isOwnProfile ? "My Chats" : "Chat"}
            </Button>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary" display="block">Earned Points</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">{profileUser.points || 0}</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary" display="block">Total Promotions</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">{profileUser.promotionsCount || 0}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Followers */}
        <Box sx={{ display: 'flex', gap: 3, mt: 3, mb: 2 }}>
          <Box textAlign="center">
            <Typography variant="subtitle1" fontWeight="bold">{profileUser.following?.length || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Following</Typography>
          </Box>
          <Box sx={{ width: '1px', bgcolor: '#eee' }} />
          <Box textAlign="center">
            <Typography variant="subtitle1" fontWeight="bold">{profileUser.followers?.length || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Followers</Typography>
          </Box>
        </Box>

        {/* Milestone */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Follower Milestone 🎯
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              100 <Typography component="span" color="primary" variant="body2">(0%)</Typography>
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', pt: 1 }}>
            <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0' }} />
            <Box sx={{ position: 'absolute', left: 0, top: 0, width: 24, height: 24, borderRadius: '50%', border: '2px solid', borderColor: 'primary.main', bgcolor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translateY(-25%)' }}>
              <Typography variant="caption" fontWeight="bold">0</Typography>
            </Box>
          </Box>
        </Box>

      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
          <Tab label={`My Posts (${posts.length})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab label="Promotions (0)" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab label="Liked (0)" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab label="Commented (0)" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      {/* Posts List */}
      <Box sx={{ p: 2, bgcolor: '#f0f2f5', minHeight: '30vh' }}>
        {tabValue === 0 && (
          posts.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" mt={4}>No posts yet.</Typography>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} />)
          )
        )}
      </Box>
    </Box>
  );
};

export default ProfilePage;
