import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  Animated,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import LottieView from 'lottie-react-native';
import GradientHeader from '../../components/GradientHeader'; 


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

  const route = useRoute();
  const { returnTo } = route.params || {};

  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardWillShow', (event) => {
      Animated.timing(shift, {
        toValue: -150,
        duration: event.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const keyboardDidHide = Keyboard.addListener('keyboardWillHide', (event) => {
      Animated.timing(shift, {
        toValue: 0,
        duration: event.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    try {
      await login(email, password);

      if (returnTo) {
        navigation.replace(returnTo);
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      Alert.alert('Ошибка входа', 'Неверные данные');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: shift }] }]}>
                    <GradientHeader title="" showBackButton = {true} />

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <LottieView
              source={require('../../../assets/animations/loginLottie.json')}
              autoPlay
              loop
              style={styles.animation}
            />

            <Text style={styles.title}>Вход</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Войти</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Нет аккаунта? Зарегистрироваться</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  container: {
    top: -80,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
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
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    textAlign: 'center',
    color: '#6C63FF',
    fontWeight: '600',
    marginTop: 12,
  },
  animation: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default LoginScreen;