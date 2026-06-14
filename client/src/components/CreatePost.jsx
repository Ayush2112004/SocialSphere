import React, { useState } from 'react';
import { Card, Box, Typography, TextField, Button, IconButton, ToggleButtonGroup, ToggleButton, Popover } from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import FormatAlignLeftOutlinedIcon from '@mui/icons-material/FormatAlignLeftOutlined';
import CampaignIcon from '@mui/icons-material/Campaign';
import SendIcon from '@mui/icons-material/Send';
import EmojiPicker from 'emoji-picker-react';

const CreatePost = ({ user, onPostCreated, onTabChange }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState('all');
  const [isPromoting, setIsPromoting] = useState(false);
  
  // Emoji & Poll state
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setContent(prev => prev + emojiObject.emoji);
  };

  const handleAddOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const handleSubmit = async () => {
    let finalPoll = null;
    const validOptions = pollOptions.filter(o => o.trim());
    if (showPoll && validOptions.length >= 2) {
      finalPoll = {
        question: pollQuestion.trim() || content.trim(),
        options: validOptions.map(text => ({ text }))
      };
    }

    if (!content.trim() && !image && !finalPoll) return;
    
    setLoading(true);
    await onPostCreated({ 
      content, 
      image, 
      isPromotion: isPromoting, 
      poll: finalPoll ? JSON.stringify(finalPoll) : null 
    });
    
    setContent('');
    setImage(null);
    setImagePreview(null);
    setShowPoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setIsPromoting(false);
    setLoading(false);
  };

  const isPostDisabled = loading || (!content.trim() && !image && !(showPoll && pollOptions.filter(o => o.trim()).length >= 2));

  return (
    <Card sx={{ mb: 2, p: 2.5, borderRadius: '16px', boxShadow: 'none', border: '1px solid #f0f0f0' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">Create Post</Typography>
        <ToggleButtonGroup
          value={postType}
          exclusive
          onChange={(e, newType) => { 
            if(newType) {
              setPostType(newType);
              if (onTabChange) onTabChange(newType);
            }
          }}
          size="small"
          sx={{ 
            bgcolor: 'action.hover', 
            p: 0.5, 
            borderRadius: '24px',
            '& .MuiToggleButton-root': { border: 'none', borderRadius: '20px', px: 2, textTransform: 'none', fontWeight: 500, color: 'text.primary' },
            '& .Mui-selected': { bgcolor: '#0084ff !important', color: 'white !important' }
          }}
        >
          <ToggleButton value="all">All Posts</ToggleButton>
          <ToggleButton value="promotions">Promotions</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ bgcolor: 'background.default', borderRadius: '12px', p: 1, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder={showPoll ? "Add context to your poll..." : "What's on your mind?"}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ px: 1 }}
        />
        
        {imagePreview && (
          <Box mt={1} mb={1} position="relative" px={1}>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} 
            />
            <Button 
              size="small" 
              color="error" 
              variant="contained" 
              sx={{ position: 'absolute', top: 4, right: 12, minWidth: 'auto', p: 0.5, borderRadius: '50%' }}
              onClick={() => { setImage(null); setImagePreview(null); }}
            >
              ✕
            </Button>
          </Box>
        )}
      </Box>

      {showPoll && (
        <Box sx={{ bgcolor: 'background.default', borderRadius: '12px', p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>Create a Poll</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask a question..."
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            sx={{ mb: 2 }}
          />
          {pollOptions.map((opt, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
              />
              {pollOptions.length > 2 && (
                <Button color="error" onClick={() => handleRemoveOption(i)} sx={{ minWidth: 40, p: 0 }}>✕</Button>
              )}
            </Box>
          ))}
          {pollOptions.length < 4 && (
            <Button size="small" onClick={handleAddOption} sx={{ mt: 1, textTransform: 'none', fontWeight: 'bold' }}>
              + Add Option
            </Button>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <input
            accept="image/*"
            type="file"
            id="icon-button-file"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <label htmlFor="icon-button-file">
            <IconButton color="primary" component="span" size="small">
              <CameraAltOutlinedIcon />
            </IconButton>
          </label>
          <IconButton color="primary" size="small" onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
            <SentimentSatisfiedOutlinedIcon />
          </IconButton>
          <IconButton color={showPoll ? "secondary" : "primary"} size="small" onClick={() => setShowPoll(!showPoll)}>
            <FormatAlignLeftOutlinedIcon />
          </IconButton>
          
          <Button 
            variant={isPromoting ? "contained" : "text"} 
            color="primary"
            startIcon={<CampaignIcon />}
            onClick={() => setIsPromoting(!isPromoting)}
            sx={{ textTransform: 'none', fontWeight: 600, ml: 1, borderRadius: '20px', boxShadow: 'none' }}
          >
            Promote
          </Button>
        </Box>
        
        <Button
          variant="contained"
          disabled={isPostDisabled}
          onClick={handleSubmit}
          endIcon={<SendIcon />}
          sx={{ 
            borderRadius: '24px', 
            bgcolor: !isPostDisabled ? 'primary.main' : '#e4e6eb',
            color: !isPostDisabled ? 'white' : '#bcc0c4',
            boxShadow: 'none',
            textTransform: 'none',
            px: 3,
            fontWeight: 600
          }}
        >
          Post
        </Button>
      </Box>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchorEl)}
        anchorEl={emojiAnchorEl}
        onClose={() => setEmojiAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" />
      </Popover>
    </Card>
  );
};

export default CreatePost;
