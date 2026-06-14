import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Avatar, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const UserSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/users/suggestions');
        setSuggestions(res.data);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    };
    fetchSuggestions();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/${userId}/follow`);
      // Remove from suggestions locally after follow
      setSuggestions(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleDismiss = (userId) => {
    setSuggestions(prev => prev.filter(user => user._id !== userId));
  };

  if (!visible || suggestions.length === 0) return null;

  return (
    <Card sx={{ mt: 2, mb: 4, p: 2, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Suggested for you</Typography>
        <IconButton size="small" onClick={() => setVisible(false)} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: 2, 
        pb: 1,
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4 }
      }}>
        {suggestions.map((user) => (
          <Card 
            key={user._id} 
            sx={{ 
              minWidth: 150, 
              maxWidth: 150, 
              p: 2, 
              borderRadius: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              position: 'relative',
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <IconButton 
              size="small" 
              onClick={() => handleDismiss(user._id)}
              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.02)', width: 22, height: 22 }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>

            <Avatar 
              src={user.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePicture}` : ''}
              sx={{ width: 64, height: 64, mb: 1, mt: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>

            <Typography 
              variant="subtitle2" 
              fontWeight="bold" 
              noWrap 
              sx={{ width: '100%', textAlign: 'center', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              {user.username.toUpperCase()}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ width: '100%', textAlign: 'center', mb: 2 }}>
              @{user.handle}
            </Typography>

            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              onClick={() => handleFollow(user._id)}
              sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 'bold' }}
            >
              Follow
            </Button>
          </Card>
        ))}
      </Box>
    </Card>
  );
};

export default UserSuggestions;
