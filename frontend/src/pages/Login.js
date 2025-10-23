import React from 'react';
import { Typography, Container, Paper, Box } from '@mui/material';

const Login = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Login
          </Typography>
          <Typography variant="body1" align="center">
            Login form will be here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;