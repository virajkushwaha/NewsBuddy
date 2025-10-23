import React from 'react';
import { Typography, Container } from '@mui/material';

const Categories = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      <Typography variant="body1">
        Browse news by categories.
      </Typography>
    </Container>
  );
};

export default Categories;