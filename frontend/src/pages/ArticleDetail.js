import React from 'react';
import { Typography, Container } from '@mui/material';

const ArticleDetail = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Article Detail
      </Typography>
      <Typography variant="body1">
        Article details will appear here.
      </Typography>
    </Container>
  );
};

export default ArticleDetail;