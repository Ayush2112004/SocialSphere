import React, { useContext, useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Button, Badge, Menu, MenuItem, Popover, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import moment from 'moment';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [localFollowing, setLocalFollowing] = useState([]);

  useEffect(() => {
    if (user?.following) setLocalFollowing(user.following);
  }, [user]);

  const handleFollowUser = async (targetId) => {
    if (!targetId) return;
    try {
      const res = await api.put(`/users/${targetId}/follow`);
      setLocalFollowing(res.data.following);
      if (user) {
        user.following = res.data.following;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleNavigateToProfile = (userId) => {
    if (!userId) return;
    handleCloseNotifMenu();
    navigate(`/profile/${userId}`);
  };

  const handleNavigateToNotif = (notif) => {
    if (!notif.sender?._id) return;
    handleCloseNotifMenu();
    if (notif.type === 'message') {
      navigate(`/chat/${notif.sender._id}`);
    } else {
      navigate(`/profile/${notif.sender._id}`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Optional: Polling every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const handleOpenNotifMenu = async (event) => {
    setAnchorElNotif(event.currentTarget);
    // Mark as read when opening
    if (unreadCount > 0) {
      try {
        await api.put('/notifications/read');
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
  };
  const handleCloseNotifMenu = () => setAnchorElNotif(null);

  const unreadCount = notifications.filter(n => !n.read && n.type !== 'message').length;
  const unreadMessageCount = notifications.filter(n => !n.read && n.type === 'message').length;

  const getNotificationText = (notif) => {
    if (notif.type === 'like') return 'liked your post.';
    if (notif.type === 'comment') return 'commented on your post.';
    if (notif.type === 'post') return 'published a new post.';
    if (notif.type === 'follow') return 'started following you.';
    if (notif.type === 'message') return 'sent you a message.';
    return 'interacted with your profile.';
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'background.paper', color: 'text.primary', backgroundImage: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 900, width: '100%', mx: 'auto', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="SocialSphere Logo" style={{ width: 32, height: 32, marginRight: 8, borderRadius: '50%' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            SocialSphere
          </Typography>
        </Box>
        
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton size="small" onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <IconButton size="small" onClick={() => navigate('/chat')} color="inherit">
              <Badge badgeContent={unreadMessageCount} color="error">
                <ChatBubbleOutlineIcon />
              </Badge>
            </IconButton>
            <IconButton size="small" onClick={handleOpenNotifMenu}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar 
              src={user.profilePicture || ''} 
              alt={user?.username || 'User'} 
              sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '16px', border: '2px solid #e0e0e0', cursor: 'pointer' }}
              onClick={handleOpenUserMenu}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            
            {/* User Profile Menu */}
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate(`/profile/${user._id}`); }}>
                <PersonOutlineIcon sx={{ mr: 1.5, fontSize: 20 }} />
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20, color: 'error.main' }} />
                <Typography textAlign="center" color="error.main">Logout</Typography>
              </MenuItem>
            </Menu>

            {/* Notifications Popover */}
            <Popover
              open={Boolean(anchorElNotif)}
              anchorEl={anchorElNotif}
              onClose={handleCloseNotifMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 320, maxHeight: 400, mt: 1.5, borderRadius: '12px' } }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No new notifications.</Typography>
                  </Box>
                ) : (
                  notifications.map((notif, index) => (
                    <React.Fragment key={notif._id}>
                      <ListItem alignItems="center" sx={{ bgcolor: notif.read ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(30, 136, 229, 0.1)' : '#f0f8ff'), px: 2, py: 1.5 }}>
                        <ListItemAvatar onClick={() => handleNavigateToNotif(notif)} sx={{ cursor: 'pointer' }}>
                          <Avatar src={notif.sender?.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${notif.sender.profilePicture}` : ''}>
                            {notif.sender?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              <strong onClick={() => handleNavigateToNotif(notif)} style={{ cursor: 'pointer' }}>
                                {notif.sender?.username || 'Someone'}
                              </strong> {getNotificationText(notif)}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {moment(notif.createdAt).fromNow()}
                            </Typography>
                          }
                        />
                        {notif.type === 'follow' && !localFollowing.includes(notif.sender?._id) && (
                           <Button 
                             variant="contained" 
                             size="small" 
                             sx={{ ml: 1, borderRadius: '20px', textTransform: 'none', minWidth: '90px', fontSize: '0.75rem' }}
                             onClick={() => handleFollowUser(notif.sender?._id)}
                           >
                             Follow Back
                           </Button>
                        )}
                        {notif.type === 'follow' && localFollowing.includes(notif.sender?._id) && (
                           <Button 
                             variant="outlined" 
                             size="small" 
                             disabled
                             sx={{ ml: 1, borderRadius: '20px', textTransform: 'none', minWidth: '90px', fontSize: '0.75rem' }}
                           >
                             Following
                           </Button>
                        )}
                      </ListItem>
                      {index < notifications.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Popover>

          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" size="small" onClick={() => navigate('/login')} sx={{ borderRadius: '20px' }}>
              Log In
            </Button>
            <Button variant="contained" size="small" onClick={() => navigate('/login?mode=signup')} sx={{ borderRadius: '20px' }}>
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
