// AuthRedirectScreen.js
import React, { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

const AuthRedirectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { returnTo } = route.params || {};

  useEffect(() => {
    navigation.navigate('Login', { returnTo }); // или 'Register'
  }, []);

  return null; // пустой экран — просто редирект
};

export default AuthRedirectScreen;