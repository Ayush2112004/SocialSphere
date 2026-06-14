import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import SkeletonPost from '../components/SkeletonPost';
import UserSuggestions from '../components/UserSuggestions';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const FeedPage = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Post');
  const [feedType, setFeedType] = useState('all');
  const categories = ['All Post', 'For You', 'Most Liked', 'Most Commented', 'Most Shared'];
  
  const observer = useRef();

  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchPosts = async (reset = false) => {
    const currentPage = reset ? 1 : page;
    setLoading(true);
    if (reset) setInitialLoading(true);
    try {
      const res = await api.get(`/posts?page=${currentPage}&limit=5&type=${feedType}&category=${activeCategory}&userId=${user?._id || ''}`);
      setPosts(prevPosts => {
        if (reset) return res.data.posts;
        const newPosts = res.data.posts.filter(p => !prevPosts.find(op => op._id === p._id));
        return [...prevPosts, ...newPosts];
      });
      setHasMore(res.data.hasMore);
      if (reset) setPage(1);
    } catch (err) {
      console.error('Error fetching posts', err);
      toast.error('Failed to load feed');
    }
    setLoading(false);
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchPosts(true);
  }, [feedType, activeCategory]);

  useEffect(() => {
    if (page > 1) fetchPosts(false);
  }, [page]);

  const handlePostCreated = async (postData) => {
    try {
      const formData = new FormData();
      if (postData.content) formData.append('content', postData.content);
      if (postData.image) formData.append('image', postData.image);
      if (postData.isPromotion) formData.append('isPromotion', postData.isPromotion);
      if (postData.poll) formData.append('poll', postData.poll);

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPosts([res.data, ...posts]);
      toast.success('Posted successfully');
    } catch (error) {
      console.error('Error creating post', error);
      toast.error('Failed to create post');
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      await api.put(`/posts/${postId}/like`);
    } catch (error) {
      console.error('Error toggling like', error);
      throw error;
    }
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 0, sm: 2 }, pt: 2 }}>
      {user && <CreatePost user={user} onPostCreated={handlePostCreated} onTabChange={setFeedType} />}
      
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, mb: 2, pb: 1, '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <Chip 
            key={cat} 
            label={cat} 
            onClick={() => setActiveCategory(cat)}
            sx={{ 
              bgcolor: activeCategory === cat ? '#0084ff' : 'background.paper', 
              color: activeCategory === cat ? 'white' : 'text.primary',
              border: '1px solid',
              borderColor: activeCategory === cat ? '#0084ff' : 'divider',
              fontWeight: activeCategory === cat ? 600 : 400,
              '&:hover': { bgcolor: activeCategory === cat ? '#0073e6' : 'action.hover' }
            }} 
          />
        ))}
      </Box>
      
      {initialLoading ? (
        <>
          <SkeletonPost />
          <SkeletonPost />
        </>
      ) : posts.length === 0 ? (
        <Box textAlign="center" mt={5} color="text.secondary">
          <Typography variant="h6">No posts yet. Be the first to share something!</Typography>
        </Box>
      ) : (
        posts.map((post, index) => {
          const isLastPost = posts.length === index + 1;
          const postElement = isLastPost ? (
            <div ref={lastPostElementRef} key={post._id}><PostCard post={post} onLikeToggle={handleLikeToggle} /></div>
          ) : (
            <PostCard key={post._id} post={post} onLikeToggle={handleLikeToggle} />
          );

          // Render suggestions at pseudo-random intervals (feels organic like Twitter)
          const suggestionIndices = new Set([3, 7, 12, 18, 22, 29, 34, 40, 46, 51, 57, 63, 68, 75, 81, 86, 92, 99]);
          
          if (suggestionIndices.has(index)) {
            return (
              <React.Fragment key={post._id}>
                {postElement}
                <UserSuggestions />
              </React.Fragment>
            );
          }
          return postElement;
        })
      )}
      
      {loading && !initialLoading && <SkeletonPost />}
      
      {/* Fallback to ensure it always shows at the bottom if it didn't just appear naturally */}
      {(!loading && !hasMore && !new Set([3, 7, 12, 18, 22, 29, 34, 40, 46, 51, 57, 63, 68, 75, 81, 86, 92, 99]).has(posts.length - 1)) && (
        <UserSuggestions />
      )}
    </Box>
  );
};

export default FeedPage;
