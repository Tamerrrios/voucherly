import React from 'react';
import { View, Text, Button } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { useLocalization } from '../context/LocalizationContext';

export default function AuthScreen({ navigation }: any) {
  const { language } = useLocalization();
  const title = language === 'uz' ? 'Xush kelibsiz!' : language === 'en' ? 'Welcome!' : 'Добро пожаловать!';
  const button = language === 'uz' ? 'Kirish' : language === 'en' ? 'Sign in' : 'Войти';

  const handleLogin = async () => {
    await signInAnonymously(auth);
    navigation.replace('Home');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{title}</Text>
      <Button title={button} onPress={handleLogin} />
    </View>
  );
}