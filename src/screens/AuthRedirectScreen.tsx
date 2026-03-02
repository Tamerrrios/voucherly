// AuthRedirectScreen.js
import React, { useEffect } from 'react';
import { Navigation } from '../navigation/Navigation';
import { Routes } from '../navigation/types';

const AuthRedirectScreen = () => {
  const { returnTo } = route.params || {};

  useEffect(() => {
    navigation.navigate('Login', { returnTo }); // или 'Register'
  }, []);

  return null; // пустой экран — просто редирект
};

export default AuthRedirectScreen;