import React, { useState, useEffect, useContext, useRef } from 'react';
import { Box, Typography, Avatar, TextField, IconButton, List, ListItem, ListItemAvatar, ListItemText, Divider, Paper, CircularProgress, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import moment from 'moment';

const ChatPage = () => {
  const { userId: activeUserId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all chats
  const fetchChats = async () => {
    try {
      const res = await api.get('/messages/chats');
      setChats(res.data);
    } catch (error) {
      console.error('Error fetching chats', error);
    } finally {
      setLoadingChats(false);
    }
  };

  // Fetch messages for active chat
  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
      // Fetch active user details if not already in chats list
      const activeChat = chats.find(c => c.user._id === userId);
      if (activeChat) {
        setActiveUser(activeChat.user);
      } else {
        const userRes = await api.get(`/users/${userId}`);
        setActiveUser(userRes.data);
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeUserId) {
      setLoadingMessages(true);
      fetchMessages(activeUserId);
      
      // Setup polling for new messages
      const interval = setInterval(() => {
        fetchMessages(activeUserId);
        fetchChats();
      }, 3000);
      
      return () => clearInterval(interval);
    } else {
      setActiveUser(null);
      setMessages([]);
    }
  }, [activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUserId) return;

    try {
      const res = await api.post(`/messages/${activeUserId}`, { text: newMessage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      fetchChats(); // Update last message in sidebar
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
      
      {/* Sidebar - Chat List */}
      <Box sx={{ 
        width: { xs: activeUserId ? '0px' : '100%', sm: activeUserId ? 320 : 600 }, 
        mx: activeUserId ? 0 : 'auto',
        flexShrink: 0,
        borderRight: activeUserId ? '1px solid' : 'none', borderColor: 'divider', 
        display: { xs: activeUserId ? 'none' : 'flex', sm: 'flex' },
        flexDirection: 'column',
        bgcolor: 'background.paper',
        ...( !activeUserId && {
            border: { sm: '1px solid' },
            borderColor: 'divider',
            mt: { sm: 4 },
            mb: { sm: 4 },
            borderRadius: { sm: 2 },
            height: { sm: 'calc(100% - 64px)' },
            boxShadow: { sm: '0 4px 12px rgba(0,0,0,0.05)' }
        })
      }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">My Chats</Typography>
        </Box>
        
        {loadingChats ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress size={24} /></Box>
        ) : chats.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" mt={4}>No chats yet.</Typography>
        ) : (
          <List sx={{ p: 0, overflowY: 'auto', flexGrow: 1 }}>
            {chats.map((chat) => (
              <React.Fragment key={chat.user._id}>
                <ListItem 
                  onClick={() => navigate(`/chat/${chat.user._id}`)}
                  sx={{ 
                    cursor: 'pointer', 
                    bgcolor: activeUserId === chat.user._id ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={chat.user.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${chat.user.profilePicture}` : ''}>
                      {chat.user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography fontWeight={activeUserId === chat.user._id ? 'bold' : 'normal'}>{chat.user.username}</Typography>}
                    secondary={<Typography variant="body2" color="text.secondary" noWrap>{chat.lastMessage}</Typography>}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Main Chat Area */}
      <Box sx={{ 
        flexGrow: 1,
        width: { xs: activeUserId ? '100%' : '0px', sm: 'auto' }, 
        display: { xs: activeUserId ? 'flex' : 'none', sm: activeUserId ? 'flex' : 'none' },
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        {activeUserId && (
          <>
            {/* Chat Header */}
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
              <Button sx={{ display: { sm: 'none' }, minWidth: 'auto', mr: 1, p: 1 }} onClick={() => navigate('/chat')}>
                Back
              </Button>
              {activeUser && (
                <Box 
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${activeUser._id}`)}
                >
                  <Avatar src={activeUser.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${activeUser.profilePicture}` : ''} sx={{ mr: 2 }}>
                    {activeUser.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" sx={{ '&:hover': { textDecoration: 'underline' } }}>{activeUser.username}</Typography>
                </Box>
              )}
            </Box>

            {/* Messages */}
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {loadingMessages ? (
                <Box display="flex" justifyContent="center" mt={4}><CircularProgress size={24} /></Box>
              ) : messages.length === 0 ? (
                <Typography textAlign="center" color="text.secondary" mt={4}>Start the conversation!</Typography>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender === currentUser._id;
                  return (
                    <Box key={msg._id} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', mb: 2 }}>
                      <Paper sx={{ 
                        p: 1.5, 
                        maxWidth: '70%', 
                        bgcolor: isMine ? 'primary.main' : 'background.paper', 
                        color: isMine ? 'white' : 'text.primary',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                      }}>
                        <Typography variant="body1">{msg.text}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8, textAlign: isMine ? 'right' : 'left' }}>
                          {moment(msg.createdAt).format('LT')}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
              <TextField 
                fullWidth 
                placeholder="Type a message..." 
                variant="outlined" 
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{ mr: 1, '& .MuiOutlinedInput-root': { borderRadius: '24px' } }}
              />
              <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Box>

    </Box>
  );
};

export default ChatPage;
