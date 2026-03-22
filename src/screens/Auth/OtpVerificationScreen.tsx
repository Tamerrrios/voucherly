import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '../../theme/colors';
import { Font } from '../../theme/typography';
import { Routes } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { AuthApiError, resendPhoneOtp, verifyPhoneOtp } from '../../services/authApi';
import { useLocalization } from '../../context/LocalizationContext';

const OTP_LENGTH = 4;

const OtpVerificationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { loginWithCustomToken } = useAuth();
  const { language } = useLocalization();
  const phoneMasked = route?.params?.phoneMasked || '+998 __ ___ __ __';
  const phone = route?.params?.phone || '';
  const initialRequestId = route?.params?.requestId || '';
  const returnTo = route?.params?.returnTo;

  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [requestId, setRequestId] = useState(initialRequestId);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const copy = {
    ru: {
      title: 'Введите код',
      subtitle: 'Мы отправили код на номер',
      resendIn: 'Отправить код повторно через',
      seconds: 'секунд',
      resend: 'Отправить код повторно',
      confirm: 'Подтвердить',
      errorTitle: 'Ошибка',
      confirmFailed: 'Не удалось подтвердить код.',
      resendFailed: 'Не удалось отправить код.',
      invalidCode: 'Неверный код.',
      expired: 'Срок действия кода истек.',
      inactive: 'Код уже использован или недействителен.',
      blocked: 'Код заблокирован. Запросите новый.',
      rateLimited: 'Слишком много запросов. Попробуйте позже.',
    },
    uz: {
      title: 'Kodni kiriting',
      subtitle: 'Kod ushbu raqamga yuborildi',
      resendIn: 'Kodni qayta yuborish',
      seconds: 'soniyadan so‘ng',
      resend: 'Kodni qayta yuborish',
      confirm: 'Tasdiqlash',
      errorTitle: 'Xatolik',
      confirmFailed: 'Kod tasdiqlanmadi.',
      resendFailed: 'Kod yuborilmadi.',
      invalidCode: 'Kod noto‘g‘ri.',
      expired: 'Kod muddati tugagan.',
      inactive: 'Kod allaqachon ishlatilgan yoki yaroqsiz.',
      blocked: 'Kod bloklangan. Yangisini so‘rang.',
      rateLimited: 'So‘rovlar juda ko‘p. Keyinroq urinib ko‘ring.',
    },
  }[language === 'uz' ? 'uz' : 'ru'];

  const getOtpErrorMessage = (error: unknown, fallback: string) => {
    const code = error instanceof AuthApiError ? error.code : undefined;
    if (code === 'OTP_INVALID_CODE') return copy.invalidCode;
    if (code === 'OTP_EXPIRED') return copy.expired;
    if (code === 'OTP_NOT_ACTIVE') return copy.inactive;
    if (code === 'OTP_BLOCKED') return copy.blocked;
    if (code === 'OTP_RATE_LIMITED' || code === 'OTP_RESEND_TOO_EARLY' || code === 'OTP_COOLDOWN_ACTIVE') {
      return copy.rateLimited;
    }
    return error instanceof Error ? error.message : fallback;
  };

  const inputRefs = useRef<Array<TextInput | null>>([]);

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const isComplete = useMemo(() => code.every((item) => item !== ''), [code]);

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    if (!isComplete) return;

    try {
      setSubmitting(true);
      const result = await verifyPhoneOtp({
        phone,
        requestId,
        code: code.join(''),
      });

      await loginWithCustomToken(result.customToken);

      if (returnTo && returnTo !== Routes.Main) {
        navigation.reset({
          index: 1,
          routes: [{ name: Routes.Main }, { name: returnTo }],
        });
        return;
      }

      navigation.reset({ index: 0, routes: [{ name: Routes.Main }] });
    } catch (error) {
      Alert.alert(copy.errorTitle, getOtpErrorMessage(error, copy.confirmFailed));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;

    try {
      setResending(true);
      const result = await resendPhoneOtp({
        phone,
        language: language === 'uz' ? 'uz' : 'ru',
      });

      setRequestId(result.requestId);
      setCode(Array(OTP_LENGTH).fill(''));
      setSecondsLeft(30);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert(copy.errorTitle, getOtpErrorMessage(error, copy.resendFailed));
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#FFF2F1', '#F7F7F7']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.logoWrap}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>V</Text>
          </View>
          <Text style={styles.logoText}>voucherly</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle} {phoneMasked}</Text>

          <View style={styles.otpRow}>
            {code.map((digit, index) => {
              const isFocused = focusedIndex === index;
              return (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[styles.otpInput, isFocused ? styles.otpInputFocused : null]}
                  value={digit}
                  onChangeText={(value) => handleChange(value, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  onKeyPress={(event) => handleKeyPress(event.nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                />
              );
            })}
          </View>

          <Text style={styles.timerText}>
            {secondsLeft > 0
              ? `${copy.resendIn} ${secondsLeft} ${copy.seconds}`
              : copy.resend}
          </Text>

          {secondsLeft === 0 ? (
            <TouchableOpacity onPress={handleResend} activeOpacity={0.8} style={styles.resendButton}>
              {resending ? <ActivityIndicator color={Colors.brand ?? '#E5483F'} /> : <Text style={styles.resendText}>{copy.resend}</Text>}
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.button, !isComplete || submitting ? styles.buttonDisabled : null]}
            disabled={!isComplete || submitting}
            onPress={handleConfirm}
            activeOpacity={0.9}
          >
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{copy.confirm}</Text>}
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
  header: {
    height: 230,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  logoWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.brand ?? '#E5483F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E5483F',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  logoBadgeText: {
    color: '#fff',
    fontSize: 26,
    fontFamily: Font.bold,
    marginTop: -1,
  },
  logoText: {
    marginTop: 10,
    fontSize: 22,
    fontFamily: Font.bold,
    color: '#111827',
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: '#111827',
    fontFamily: Font.bold,
  },
  subtitle: {
    marginTop: 8,
    color: '#6B7280',
    fontFamily: Font.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  otpRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    fontFamily: Font.bold,
    fontSize: 22,
    color: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  otpInputFocused: {
    borderColor: Colors.brand ?? '#E5483F',
    shadowOpacity: 0.14,
    shadowColor: '#E5483F',
  },
  timerText: {
    marginTop: 14,
    color: '#6B7280',
    fontFamily: Font.medium,
    fontSize: 13,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  resendText: {
    color: Colors.brand ?? '#E5483F',
    fontFamily: Font.semibold,
    fontSize: 14,
  },
  button: {
    marginTop: 22,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.brand ?? '#E5483F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E5483F',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#E6A8A4',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: Font.bold,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default OtpVerificationScreen;
