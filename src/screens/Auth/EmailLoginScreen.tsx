import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { Font } from '../../theme/typography';
import { Colors } from '../../theme/colors';
import GradientHeader from '../../components/GradientHeader';

const EmailLoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    try {
      setLoading(true);
      await auth().signInWithEmailAndPassword(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err: any) {
      const msg =
        err?.code === 'auth/user-not-found' ? 'Пользователь не найден' :
        err?.code === 'auth/wrong-password' ? 'Неверный пароль' :
        err?.code === 'auth/invalid-email' ? 'Некорректный email' :
        err?.message || 'Ошибка входа';
      Alert.alert('Ошибка', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader title="" showBackButton />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>Войти по email</Text>
          <Text style={styles.subtitle}>Введите почту и пароль от аккаунта</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Пароль</Text>
            <View style={[styles.input, styles.inputRow]}>
              <TextInput
                style={styles.inputInner}
                placeholder="••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setSecure(s => !s)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.toggle}>{secure ? 'Показать' : 'Скрыть'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, (!email.trim() || !password) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!email.trim() || !password || loading}
            activeOpacity={0.9}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.buttonText}>Войти</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
            <Text style={styles.link}>Нет аккаунта? <Text style={styles.linkBold}>Зарегистрироваться</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EmailLoginScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  container: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 24, fontFamily: Font.bold, color: '#111827', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 6, marginBottom: 24 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, color: '#374151', fontFamily: Font.semibold, marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 16,
    color: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  inputInner: { flex: 1, fontSize: 16, color: '#111827', fontFamily: Font.regular },
  toggle: { color: Colors.brand, fontFamily: Font.bold, fontSize: 13 },
  button: {
    backgroundColor: Colors.brand,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: Colors.brand,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: '#F59E9E', shadowOpacity: 0 },
  buttonText: { color: '#FFFFFF', fontFamily: Font.bold, fontSize: 16, letterSpacing: 0.3 },
  linkWrap: { alignItems: 'center' },
  link: { color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#111827', fontFamily: Font.bold },
});
