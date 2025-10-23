import React from 'react';
import { Typography, Container } from '@mui/material';

const PersonalizedFeed = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Personalized Feed
      </Typography>
      <Typography variant="body1">
        Your personalized news feed will appear here.
      </Typography>
    </Container>
  );
};

export default PersonalizedFeed;