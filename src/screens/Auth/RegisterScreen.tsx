import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { auth, firestore } from '../../firebase/firebase';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const navigation = useNavigation();
  const { register } = useAuth();
  const route = useRoute(); // 👈 добавлено
  const { returnTo } = route.params || {}; // 👈 получаем returnTo


const handleRegister = async () => {
  if (!email || !password || !userName) {
    Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
    return;
  }

  try {
    // Создаём пользователя
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);

    // Обновляем профиль пользователя (имя)
    await userCredential.user.updateProfile({ displayName: userName });

    // Сохраняем данные пользователя в Firestore
    await firestore().collection('users').doc(userCredential.user.uid).set({
      email,
      name: userName,
      createdAt: new Date().toISOString(),
    });

    // Отправляем письмо с подтверждением email
    await userCredential.user.sendEmailVerification();

    Alert.alert(
      'Регистрация успешна!',
      `Письмо с подтверждением отправлено на ${email}. Пожалуйста, подтвердите ваш email, перейдя по ссылке из письма.`
    );

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } catch (err) {
    Alert.alert('Ошибка регистрации', err.message);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>

      <TextInput
        style={styles.input}
        placeholder="Имя пользователя"
        value={userName}
        onChangeText={setUserName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Создать аккаунт</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F3F3F3',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    marginTop: 16,
    color: '#6C63FF',
    textAlign: 'center',
  },
});