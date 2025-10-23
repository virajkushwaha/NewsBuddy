import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  Badge,
  useMediaQuery,
  useTheme,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Brightness4,
  Brightness7,
  Login,
  PersonAdd
} from '@mui/icons-material';

import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import SearchBar from '../UI/SearchBar';

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ px: 0 }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 800,
              mr: 4,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            📰 NewsBuddy
          </Typography>

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 2 }}>
              <SearchBar />
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search Icon - Mobile */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setShowSearch(!showSearch)}
              >
                <SearchIcon />
              </IconButton>
            )}

            {/* Theme Toggle */}
            <IconButton color="inherit" onClick={toggleTheme}>
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {user ? (
              <>
                {/* Notifications */}
                <IconButton color="inherit">
                  <Badge badgeContent={0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                {/* Profile Menu */}
                <IconButton onClick={handleProfileMenuOpen} color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.username?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  startIcon={<Login />}
                  onClick={() => navigate('/login')}
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  startIcon={<PersonAdd />}
                  onClick={() => navigate('/register')}
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  Register
                </Button>
                {isMobile && (
                  <IconButton color="inherit" onClick={() => navigate('/login')}>
                    <AccountCircle />
                  </IconButton>
                )}
              </>
            )}
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { navigate('/personalized'); handleMenuClose(); }}>
              My Feed
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>

        {/* Mobile Search Bar */}
        {isMobile && showSearch && (
          <Box sx={{ pb: 2 }}>
            <SearchBar />
          </Box>
        )}
      </Container>
    </AppBar>
  );
};

export default Header;