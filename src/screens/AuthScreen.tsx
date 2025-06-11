import React from 'react';
import { View, Text, Button } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function AuthScreen({ navigation }: any) {
  const handleLogin = async () => {
    await signInAnonymously(auth);
    navigation.replace('Home');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Добро пожаловать!</Text>
      <Button title="Войти" onPress={handleLogin} />
    </View>
  );
}