import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Colors } from '../../theme/colors';
import { Font } from '../../theme/typography';
import { Routes } from '../../navigation/types';
import { useLocalization } from '../../context/LocalizationContext';
import { AuthApiError, requestPhoneOtp } from '../../services/authApi';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const phoneInputRef = useRef<TextInput | null>(null);
  const { language } = useLocalization();

  const [phoneDigits, setPhoneDigits] = useState('');
  const [loading, setLoading] = useState(false);

  const copy = {
    ru: {
      errorTitle: 'Ошибка',
      sendFailed: 'Не удалось отправить код. Попробуйте позже.',
      invalidPhone: 'Введите корректный номер телефона.',
      cooldown: 'Повторная отправка пока недоступна. Попробуйте позже.',
      rateLimited: 'Слишком много запросов. Попробуйте позже.',
    },
    uz: {
      errorTitle: 'Xatolik',
      sendFailed: 'Kod yuborilmadi. Keyinroq urinib ko‘ring.',
      invalidPhone: 'To‘g‘ri telefon raqamini kiriting.',
      cooldown: 'Qayta yuborish hozircha mavjud emas. Keyinroq urinib ko‘ring.',
      rateLimited: 'So‘rovlar juda ko‘p. Keyinroq urinib ko‘ring.',
    },
  }[language === 'uz' ? 'uz' : 'ru'];

  // TODO: используется для OTP — вернуть когда будет SMS API
  const phoneMasked = useMemo(() => {
    const d = phoneDigits.slice(0, 9);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 7);
    const p4 = d.slice(7, 9);
    return `+998 ${p1.padEnd(2, '_')} ${p2.padEnd(3, '_')} ${p3.padEnd(2, '_')} ${p4.padEnd(2, '_')}`;
  }, [phoneDigits]);

  const phoneInputValue = useMemo(() => {
    const d = phoneDigits.slice(0, 9);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 7);
    const p4 = d.slice(7, 9);
    return [p1, p2, p3, p4].filter(Boolean).join(' ');
  }, [phoneDigits]);

const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    setPhoneDigits(digits);
  };

  const handleContinue = () => {
    const normalizedPhone = `+998${phoneDigits.slice(0, 9)}`;
    const returnTo = route?.params?.returnTo;

    setLoading(true);
    requestPhoneOtp({
      phone: normalizedPhone,
      language: language === 'uz' ? 'uz' : 'ru',
    })
      .then((result) => {
        navigation.navigate(Routes.OtpVerification, {
          phoneMasked: result.phoneMasked || phoneMasked,
          phone: normalizedPhone,
          requestId: result.requestId,
          returnTo,
        });
      })
      .catch((error: unknown) => {
        const apiCode = error instanceof AuthApiError ? error.code : undefined;
        const message =
          apiCode === 'OTP_INVALID_PHONE' ? copy.invalidPhone :
          apiCode === 'OTP_COOLDOWN_ACTIVE' || apiCode === 'OTP_RESEND_TOO_EARLY' ? copy.cooldown :
          apiCode === 'OTP_RATE_LIMITED' ? copy.rateLimited :
          error instanceof Error ? error.message : copy.sendFailed;
        Alert.alert(copy.errorTitle, message);
      })
      .finally(() => setLoading(false));
  };


  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#FFF2F1', '#F7F7F7']} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <View style={styles.logoWrap}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>V</Text>
            </View>
            <Text style={styles.logoText}>voucherly</Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.iconBubble}>
            <Ionicons name="gift-outline" size={28} color={Colors.brand ?? '#E5483F'} />
          </View>

          <Text style={styles.title}>Введите номер телефона</Text>
          <Text style={styles.subtitle}>Мы отправим вам SMS с кодом подтверждения</Text>

          <View style={styles.inputWrap}>
            <Pressable style={styles.phoneField} onPress={() => phoneInputRef.current?.focus()}>
              <Text style={styles.phonePrefix}>+998</Text>
              <TextInput
                ref={phoneInputRef}
                style={styles.phoneInput}
                value={phoneInputValue}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={12}
                placeholder="XX XXX XX XX"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </Pressable>
          </View>

          <TouchableOpacity
            style={[styles.button, phoneDigits.length !== 9 || loading ? styles.buttonDisabled : null]}
            onPress={handleContinue}
            disabled={phoneDigits.length !== 9 || loading}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Войти</Text>}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 260,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: -10,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand ?? '#E5483F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E5483F',
    shadowOpacity: 0.34,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 5,
  },
  logoBadgeText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: Font.bold,
    marginTop: -2,
  },
  logoText: {
    marginTop: 12,
    fontSize: 24,
    fontFamily: Font.bold,
    color: '#111827',
    letterSpacing: 0.25,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 22,
    marginTop: -8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  iconBubble: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F0',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FFE0DC',
    marginBottom: 16,
  },
  title: {
    fontSize: 31,
    lineHeight: 36,
    color: '#111827',
    fontFamily: Font.bold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#6B7280',
    fontFamily: Font.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  inputWrap: {
    marginTop: 20,
  },
  phoneField: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  phonePrefix: {
    color: '#111827',
    fontFamily: Font.bold,
    fontSize: 18,
  },
  phoneInput: {
    flex: 1,
    color: '#111827',
    fontFamily: Font.semibold,
    fontSize: 18,
    paddingVertical: 0,
  },
  button: {
    marginTop: 18,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.brand ?? '#E5483F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E5483F',
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 9 },
    shadowRadius: 16,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#E8B3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: Font.bold,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  divider: {
    marginTop: 18,
    marginBottom: 14,
    height: 1,
    backgroundColor: '#ECEFF3',
  },
  emailButton: {
    textAlign: 'center',
    color: '#1F2937',
    fontFamily: Font.semibold,
    fontSize: 16,
  },
});

export default LoginScreen;
