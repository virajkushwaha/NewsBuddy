import React from 'react';
import { Typography, Container } from '@mui/material';

const Profile = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1">
        User profile settings.
      </Typography>
    </Container>
  );
};

export default Profile;