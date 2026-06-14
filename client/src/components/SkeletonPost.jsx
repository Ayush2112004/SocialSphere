import React from 'react';
import { Card, Box, Skeleton } from '@mui/material';

const SkeletonPost = () => {
  return (
    <Card sx={{ mb: 3, p: 2, borderRadius: '18px' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box ml={2} flex={1}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="20%" height={16} />
        </Box>
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '16px' }} />
      </Box>
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '12px', mb: 2 }} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
      
      <Box display="flex" gap={3} mt={2}>
        <Skeleton variant="text" width={40} height={24} />
        <Skeleton variant="text" width={40} height={24} />
      </Box>
    </Card>
  );
};

export default SkeletonPost;
