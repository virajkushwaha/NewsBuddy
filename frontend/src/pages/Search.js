import React from 'react';
import { Typography, Container } from '@mui/material';

const Search = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Search
      </Typography>
      <Typography variant="body1">
        Search for news articles.
      </Typography>
    </Container>
  );
};

export default Search;