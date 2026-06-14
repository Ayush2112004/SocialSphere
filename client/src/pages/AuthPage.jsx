import React, { useState, useContext, useEffect } from 'react';
import { Box, Card, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { login, register } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');
  
  const [isLogin, setIsLogin] = useState(mode !== 'signup');

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  const [formData, setFormData] = useState({
    username: '',
    handle: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(formData.username, formData.handle, formData.email, formData.password);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', width: '100%', px: 2 }}>
      <Card sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3} color="primary">
          SocialSphere
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Handle (e.g. @user)"
                name="handle"
                value={formData.handle}
                onChange={handleChange}
                margin="normal"
                required
              />
            </>
          )}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, borderRadius: '24px' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Log In' : 'Sign Up')}
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button 
              variant="text" 
              onClick={() => navigate(isLogin ? '/login?mode=signup' : '/login')}
              sx={{ fontWeight: 'bold', p: 0, minWidth: 'auto', textTransform: 'none' }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </Button>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default AuthPage;
