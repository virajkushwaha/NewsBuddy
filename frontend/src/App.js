import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import PersonalizedFeed from './pages/PersonalizedFeed';
import Categories from './pages/Categories';
import Search from './pages/Search';
import ArticleDetail from './pages/ArticleDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      connect(user.id);
    } else {
      disconnect();
    }

    return () => disconnect();
  }, [user, connect, disconnect]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner size={60} />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      
      {/* Protected routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route 
          path="personalized" 
          element={
            <ProtectedRoute>
              <PersonalizedFeed />
            </ProtectedRoute>
          } 
        />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:category" element={<Categories />} />
        <Route path="search" element={<Search />} />
        <Route path="article/:id" element={<ArticleDetail />} />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;