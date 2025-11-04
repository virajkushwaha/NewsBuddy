import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box sx={{ display: 'flex', flex: 1, pt: { xs: 7, sm: 8 } }}>
        <Sidebar />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;