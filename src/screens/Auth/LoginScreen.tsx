import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GradientHeader from '../../components/GradientHeader';

import LottieView from 'lottie-react-native';
import { AuthContext } from '../../context/AuthContext';


import { Typography } from '../../theme/typography';
import { Colors } from '../../theme/colors';
import { Routes } from '../../navigation/types';
import { Font } from '../../theme/typography';
import { auth } from '../../firebase/firebase';
import TelegramLoginWebView from '../../components/TelegramLoginWebView';
import { useLocalization } from '../../context/LocalizationContext';


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [telegramVisible, setTelegramVisible] = useState(false);

  const navigation = useNavigation<any>();
  const { login } = useContext(AuthContext);

  const route = useRoute<any>();
  const { returnTo } = route.params || {};
  const { t } = useLocalization();

  const finishAuthNavigation = () => {
    if (returnTo) {
      navigation.replace(returnTo);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: Routes.Main }],
      });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('login.fillAllTitle'), t('login.fillAllMessage'));
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      finishAuthNavigation();
    } catch (error: any) {
      Alert.alert(t('login.invalidTitle'), t('login.invalidMessage'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    const target = email.trim();

    if (!target) {
      Alert.alert(
        t('login.needEmailTitle'),
        t('login.needEmailMessage')
      );
      return;
    }

    try {
      await auth().sendPasswordResetEmail(target);
      Alert.alert(
        t('login.sentTitle'),
        `${t('login.sentMessagePrefix')} ${target}. ${t('login.sentMessageSuffix')}`
      );
    } catch (err: any) {
      const msg =
        err?.code === 'auth/invalid-email'
          ? t('login.invalidEmail')
          : err?.code === 'auth/user-not-found'
            ? t('login.notFound')
            : err?.message || t('login.sendFailed');
      Alert.alert(t('common.error'), msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GradientHeader title="" showBackButton />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Иллюстрация / Лотти */}
        <LottieView
          source={require('../../../assets/animations/loginLottie.json')}
          autoPlay
          loop
          style={styles.animation}
        />

        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>
          {t('login.subtitle')}
        </Text>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('login.email')}
            placeholderTextColor="#9E9E9E"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />
        </View>

        {/* Пароль */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('login.password')}
            placeholderTextColor="#9E9E9E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.eye}
            onPress={() => setSecure((s) => !s)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeText}>{secure ? '👁‍🗨' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        {/* Кнопка входа */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          disabled={loading}
          onPress={handleLogin}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('login.signIn')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.telegramButton}
          onPress={() => setTelegramVisible(true)}
          activeOpacity={0.9}
        >
          <Text style={styles.telegramButtonText}>{t('login.telegram')}</Text>
        </TouchableOpacity>

        {/* Ссылка на регистрацию */}

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={() => navigation.navigate(Routes.Register)}
          activeOpacity={0.7}
        >
          <Text style={styles.link}>
            {t('login.noAccount')} <Text style={styles.linkAccent}>{t('login.register')}</Text>
          </Text>

          <TouchableOpacity onPress={handleForgot} activeOpacity={0.7}>
            <View style={styles.divider} />

            <Text style={styles.forgot}>{t('login.forgot')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TelegramLoginWebView
          visible={telegramVisible}
          onClose={() => setTelegramVisible(false)}
          onAuthSuccess={finishAuthNavigation}
        />

          {/* <View style={{ marginTop: 12 }}>
            <SocialAuthButtons
              onGoogle={handleGoogle}
              onApple={handleApple}
              loading={submitting}
              disabled={submitting}
              compact
            />
          </View> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const INPUT_HEIGHT = 52;
const RADIUS = 14;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  animation: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },

  title: {
    ...Typography.title,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    ...Typography.subtitle,
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'center',
    maxWidth: '90%',
  },

  inputWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  input: {
    height: INPUT_HEIGHT,
    borderRadius: RADIUS,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontFamily: Font.regular,
    fontSize: 15,
    color: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  eye: {
    position: 'absolute',
    right: 12,
    top: (INPUT_HEIGHT - 24) / 2,
  },
  eyeText: {
    fontSize: 16,
  },

  button: {
    backgroundColor: Colors.brand ?? '#E53935',
    height: 50,
    borderRadius: RADIUS + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
    // лёгкая тень
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  buttonText: {
    fontFamily: Font.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  telegramButton: {
    height: 50,
    borderRadius: RADIUS + 2,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  telegramButtonText: {
    fontFamily: Font.semibold,
    color: '#1F2937',
    fontSize: 15,
  },

  link: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: Font.regular,
    fontSize: 15,
  },
  linkAccent: {
    color: Colors.brand ?? '#E53935',
    fontFamily: Font.bold,
  },
  forgot: {
    textAlign: 'center',
    color: Colors.brand,
    fontFamily: Font.bold,
    marginBottom: 8,
    paddingTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
    alignSelf: 'stretch',
  },
});

export default LoginScreen;