import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import appleAuth from '@invertase/react-native-apple-authentication';
import { useLocalization } from '../context/LocalizationContext';

type Props = {
  onGoogle: () => Promise<void> | void;
  onApple?: () => Promise<void> | void;     // опционально (iOS)
  loading?: boolean;                         // общий лоадер, если авторизация идёт
  disabled?: boolean;                        // заблокировать кнопки (напр., пока сабмит формы)
  compact?: boolean;                         // более компактная высота
};

const SocialAuthButtons: React.FC<Props> = ({
  onGoogle,
  onApple,
  loading = false,
  disabled = false,
  compact = false,
}) => {
  const { language } = useLocalization();
  const googleText = language === 'uz' ? 'Google orqali kirish' : language === 'en' ? 'Continue with Google' : 'Войти через Google';
  const appleText = language === 'uz' ? 'Apple orqali kirish' : language === 'en' ? 'Continue with Apple' : 'Войти через Apple';
  const btnHeight = compact ? 44 : 48;
  const isAppleAvailable = Platform.OS === 'ios' && appleAuth.isSupported && typeof onApple === 'function';

  return (
    <View style={styles.container}>
      {/* Google */}
      <TouchableOpacity
        style={[styles.btn, styles.btnOutline, { height: btnHeight }, (loading || disabled) && styles.btnDisabled]}
        onPress={onGoogle}
        disabled={loading || disabled}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color="#DB4437" />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color="#DB4437" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>{googleText}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Apple — показываем только на iOS и если передали onApple */}
      {isAppleAvailable && (
        <TouchableOpacity
          style={[styles.btn, styles.btnDark, { height: btnHeight }, (loading || disabled) && styles.btnDisabledDark]}
          onPress={onApple}
          disabled={loading || disabled}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="logo-apple" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={[styles.btnText, { color: '#fff' }]}>{appleText}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SocialAuthButtons;

const styles = StyleSheet.create({
  container: { gap: 10, marginTop: 6 },
  btn: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  btnDark: {
    backgroundColor: '#111827',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnDisabledDark: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
});