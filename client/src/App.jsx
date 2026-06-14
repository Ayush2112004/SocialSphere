import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import FeedPage from './pages/FeedPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import Navbar from './components/Navbar';
import { Box, CircularProgress } from '@mui/material';

function App() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', pt: 8, pb: isChatPage ? 0 : 4, height: isChatPage ? '100vh' : 'auto', minHeight: '100vh', width: '100%', bgcolor: 'background.default' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: isChatPage ? '100%' : { xs: '100%', sm: 600, md: 680 }, mx: 'auto' }}>
          <Routes>
            <Route path="/login" element={!user ? <AuthPage /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <FeedPage /> : <Navigate to="/login" />} />
            <Route path="/profile/:id" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" />} />
            <Route path="/chat/:userId" element={user ? <ChatPage /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Box>
      </Box>
    </>
  );
}

export default App;
