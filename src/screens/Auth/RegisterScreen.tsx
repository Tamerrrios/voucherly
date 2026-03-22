import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Linking
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GradientHeader from '../../components/GradientHeader';
import { firebaseAuth, db } from '../../firebase/firebase';
import { Font } from '../../theme/typography';
import {
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  AppleAuthProvider,
} from '@react-native-firebase/auth';
import { doc, setDoc } from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth, { AppleRequestOperation, AppleRequestScope } from '@invertase/react-native-apple-authentication';
import { useLocalization } from '../../context/LocalizationContext';

const MIN_PASSWORD_LEN = 6;

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const RegisterScreen = () => {
  const { language } = useLocalization();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { returnTo, params } = route.params || {};

  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // локальные ошибки под полями
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [agree, setAgree] = useState(false);

  const copy = {
    ru: {
      consentRequired: 'Согласие обязательно',
      consentRequiredDesc: 'Поставьте галочку о согласии с документами.',
      validEmail: 'Введите корректный email',
      shortName: 'Имя слишком короткое',
      weakPassword: 'Пароль должен быть не короче',
      regSuccess: 'Регистрация успешна',
      verifySent: 'Мы отправили письмо с подтверждением на',
      emailInUse: 'Этот email уже зарегистрирован',
      invalidEmail: 'Некорректный email',
      weakPass: 'Слишком простой пароль',
      regError: 'Ошибка регистрации',
      error: 'Ошибка',
      openLinkError: 'Не удалось открыть ссылку',
      googleTokenError: 'Не удалось получить токен Google',
      googleLoginError: 'Не удалось войти через Google',
      appleTokenError: 'Не получен токен Apple',
      appleUser: 'Пользователь Apple',
      appleLoginError: 'Не удалось войти через Apple',
      title: 'Создайте аккаунт',
      subtitle: 'Дарите подарочные ваучеры друзьям и близким за минуту',
      name: 'Имя',
      namePlaceholder: 'Как к вам обращаться',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      pass: 'Пароль',
      minPrefix: 'Минимум',
      chars: 'символов',
      show: 'Показать',
      hide: 'Скрыть',
      create: 'Создать аккаунт',
      agreeStart: 'Я принимаю',
      offer: 'условия оферты',
      and: 'и',
      privacy: 'политику конфиденциальности',
      hasAccount: 'Уже есть аккаунт?',
      login: 'Войти',
    },
    uz: {
      consentRequired: 'Rozilik majburiy',
      consentRequiredDesc: 'Hujjatlarga rozilik belgisini qo‘ying.',
      validEmail: 'To‘g‘ri email kiriting',
      shortName: 'Ism juda qisqa',
      weakPassword: 'Parol kamida',
      regSuccess: 'Ro‘yxatdan o‘tish muvaffaqiyatli',
      verifySent: 'Tasdiqlash xatini quyidagi manzilga yubordik:',
      emailInUse: 'Bu email allaqachon ro‘yxatdan o‘tgan',
      invalidEmail: 'Noto‘g‘ri email',
      weakPass: 'Parol juda oddiy',
      regError: 'Ro‘yxatdan o‘tishda xatolik',
      error: 'Xatolik',
      openLinkError: 'Havolani ochib bo‘lmadi',
      googleTokenError: 'Google tokenini olib bo‘lmadi',
      googleLoginError: 'Google orqali kirib bo‘lmadi',
      appleTokenError: 'Apple tokeni olinmadi',
      appleUser: 'Apple foydalanuvchisi',
      appleLoginError: 'Apple orqali kirib bo‘lmadi',
      title: 'Akkaunt yarating',
      subtitle: 'Do‘stlar va yaqinlarga sovg‘a vaucherlarini bir daqiqada yuboring',
      name: 'Ism',
      namePlaceholder: 'Sizga qanday murojaat qilaylik',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      pass: 'Parol',
      minPrefix: 'Kamida',
      chars: 'ta belgi',
      show: 'Ko‘rsatish',
      hide: 'Yashirish',
      create: 'Akkaunt yaratish',
      agreeStart: 'Men',
      offer: 'oferta shartlari',
      and: 'va',
      privacy: 'maxfiylik siyosatini',
      hasAccount: 'Akkaunt mavjudmi?',
      login: 'Kirish',
    },
    en: {
      consentRequired: 'Consent required',
      consentRequiredDesc: 'Please check the consent box for documents.',
      validEmail: 'Enter a valid email',
      shortName: 'Name is too short',
      weakPassword: 'Password must be at least',
      regSuccess: 'Registration successful',
      verifySent: 'We sent a verification email to',
      emailInUse: 'This email is already registered',
      invalidEmail: 'Invalid email',
      weakPass: 'Password is too weak',
      regError: 'Registration error',
      error: 'Error',
      openLinkError: 'Unable to open link',
      googleTokenError: 'Failed to get Google token',
      googleLoginError: 'Unable to sign in with Google',
      appleTokenError: 'Apple token was not received',
      appleUser: 'Apple User',
      appleLoginError: 'Unable to sign in with Apple',
      title: 'Create your account',
      subtitle: 'Send gift vouchers to friends and family in a minute',
      name: 'Name',
      namePlaceholder: 'How should we call you',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      pass: 'Password',
      minPrefix: 'Minimum',
      chars: 'characters',
      show: 'Show',
      hide: 'Hide',
      create: 'Create account',
      agreeStart: 'I accept the',
      offer: 'offer terms',
      and: 'and',
      privacy: 'privacy policy',
      hasAccount: 'Already have an account?',
      login: 'Sign in',
    },
  }[language];

  // live-валидация (мягкая)
  const canSubmit = useMemo(() => {
    const emailOk = isValidEmail(email);
    const nameOk = userName.trim().length >= 2;
    const passOk = password.length >= MIN_PASSWORD_LEN;
    return emailOk && nameOk && passOk && agree && !submitting; // ← NEW: учитываем agree
  }, [email, userName, password, submitting, agree]);

  // --- GOOGLE CONFIG (один раз) ---
  useEffect(() => {
    GoogleSignin.configure({
      // ВСТАВЬ свой Web client ID из Firebase → Project settings → OAuth 2.0 Client IDs (Web)
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  // helper: создать/обновить профиль в Firestore (мягкий merge)
  const upsertUserProfile = async (
    uid: string,
    data: { email?: string | null; name?: string | null }
  ) => {
    try {
      await setDoc(
        doc(db, 'users', uid),
        {
          email: data.email ?? null,
          name: data.name ?? null,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.log('FIRESTORE_UPSERT_ERROR', e);
    }
  };

  const navigateAfterAuth = () => {
    if (returnTo) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login', params: { returnTo, params } }],
      });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    }
  };

  // ---------- EMAIL/PASSWORD REG ----------
  const handleRegister = async () => {
    const _email = email.trim();
    const _name = userName.trim();

    if (!agree) {                         // ← NEW: страховка
      Alert.alert(copy.consentRequired, copy.consentRequiredDesc);
      return;
    }

    let localErrors = { e: null as string | null, n: null as string | null, p: null as string | null };
    if (!isValidEmail(_email)) localErrors.e = copy.validEmail;
    if (_name.length < 2) localErrors.n = copy.shortName;
    if (password.length < MIN_PASSWORD_LEN) localErrors.p = `${copy.weakPassword} ${MIN_PASSWORD_LEN} ${copy.chars}`;

    setEmailError(localErrors.e);
    setNameError(localErrors.n);
    setPasswordError(localErrors.p);
    if (localErrors.e || localErrors.n || localErrors.p) return;

    try {
      setSubmitting(true);

      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, _email, password);
      await userCredential.user.updateProfile({ displayName: _name });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: _email,
        name: _name,
        createdAt: new Date().toISOString(),
      });

      try {
        await userCredential.user.sendEmailVerification();
        Alert.alert(copy.regSuccess, `${copy.verifySent} ${_email}.`);
        // await bumpUsers();
      } catch { }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login', params: returnTo ? { returnTo, params } : undefined }],
      });
    } catch (err: any) {
      const msg =
        err?.code === 'auth/email-already-in-use'
          ? copy.emailInUse
          : err?.code === 'auth/invalid-email'
            ? copy.invalidEmail
            : err?.code === 'auth/weak-password'
              ? copy.weakPass
              : err?.message || copy.regError;
      Alert.alert(copy.error, msg);
    } finally {
      setSubmitting(false);
    }
  };

    const openURL = (url: string) => Linking.openURL(url).catch(() => {
    Alert.alert(copy.error, copy.openLinkError);
  });

  // ---------- GOOGLE SIGN-IN ----------
  const handleGoogle = async () => {
    try {
      setSubmitting(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      if (!idToken) throw new Error(copy.googleTokenError);

      const credential = GoogleAuthProvider.credential(idToken);
      const res = await signInWithCredential(firebaseAuth, credential);

      await upsertUserProfile(res.user.uid, {
        email: res.user.email,
        name: res.user.displayName,
      });

      navigateAfterAuth();
    } catch (err: any) {
      console.log('GOOGLE_SIGNIN_ERROR', err);
      Alert.alert(copy.error, err?.message || copy.googleLoginError);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- APPLE SIGN-IN (только iOS, требуется capability) ----------
  const handleApple = async () => {
    try {
      if (!(Platform.OS === 'ios' && appleAuth.isSupported)) return;
      setSubmitting(true);

      const response = await appleAuth.performRequest({
        requestedOperation: AppleRequestOperation.LOGIN,
        requestedScopes: [AppleRequestScope.EMAIL, AppleRequestScope.FULL_NAME],
      });

      const { identityToken, authorizationCode } = response;
      if (!identityToken) throw new Error(copy.appleTokenError);

      const credential = AppleAuthProvider.credential(identityToken, authorizationCode);
      const res = await signInWithCredential(firebaseAuth, credential);

      const displayName =
        res.user.displayName ||
        [response.fullName?.givenName, response.fullName?.familyName].filter(Boolean).join(' ') ||
        copy.appleUser;

      await upsertUserProfile(res.user.uid, {
        email: res.user.email, // может быть relay-адрес
        name: displayName,
      });

      navigateAfterAuth();
    } catch (err: any) {
      if (err?.code === appleAuth.Error.CANCELED) return;
      console.log('APPLE_SIGNIN_ERROR', err);
      Alert.alert(copy.error, err?.message || copy.appleLoginError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader title="" showBackButton />

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>

          {/* Имя */}
          <View style={styles.field}>
            <Text style={styles.label}>{copy.name}</Text>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              placeholder={copy.namePlaceholder}
              value={userName}
              onChangeText={(t) => {
                setUserName(t);
                if (nameError) setNameError(null);
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>{copy.email}</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder={copy.emailPlaceholder}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          {/* Пароль */}
          <View style={styles.field}>
            <Text style={styles.label}>{copy.pass}</Text>
            <View style={[styles.input, passwordError && styles.inputError, styles.inputRow]}>
              <TextInput
                style={styles.inputInner}
                placeholder={`${copy.minPrefix} ${MIN_PASSWORD_LEN} ${copy.chars}`}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passwordError) setPasswordError(null);
                }}
                secureTextEntry={secure}
                autoCapitalize="none"
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setSecure((s) => !s)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.toggle}>{secure ? copy.show : copy.hide}</Text>
              </TouchableOpacity>
            </View>
            {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          </View>

          {/* Кнопка регистрации */}
        <TouchableOpacity
            style={[styles.button, (!canSubmit ? styles.buttonDisabled : null)]}
            onPress={handleRegister}
            disabled={!canSubmit || submitting}
            activeOpacity={0.9}
          >
            {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{copy.create}</Text>}
          </TouchableOpacity>

        {/* ← NEW: чекбокс согласия (ставим перед ссылкой "Войти") */}
          <View style={styles.agreeRow}>
            <TouchableOpacity
              onPress={() => setAgree(v => !v)}
              activeOpacity={0.8}
              style={[styles.checkbox, agree && styles.checkboxOn]}
            >
              {agree ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </TouchableOpacity>

            <Text style={styles.agreeText}>
              {copy.agreeStart}{' '}
              <Text style={styles.agreeLink} onPress={() => openURL('https://voucherly.uz/offer')}>
                {copy.offer}
              </Text>
              {' '}{copy.and}{' '}
              <Text style={styles.agreeLink} onPress={() => openURL('https://voucherly.uz/privacy')}>
                {copy.privacy}
              </Text>
              .
            </Text>
          </View>

          {/* Ссылка Войти */}
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.link}>
              {copy.hasAccount} <Text style={styles.linkBold}>{copy.login}</Text>
            </Text>
          </TouchableOpacity>

          {/* Соц-авторизация */}
          {/* <View style={{ marginTop: 12 }}>
            <SocialAuthButtons
              onGoogle={handleGoogle}
              onApple={handleApple}
              loading={submitting}
              disabled={submitting}
              compact
            />
          </View> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#111827', marginTop: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#6B7280', marginTop: 6, marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
    height: 50,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  inputInner: { flex: 1, fontSize: 16, color: '#111827' },
  inputError: { borderColor: '#F43F5E', backgroundColor: '#FEF2F2' },
  toggle: { color: '#6C63FF', fontWeight: '700', fontSize: 13 },
  errorText: { marginTop: 6, color: '#DC2626', fontSize: 12 },
  button: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
    shadowColor: '#E53935',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    height: 50,
  },
  buttonDisabled: { backgroundColor: '#F59E9E', shadowOpacity: 0.05 },
  buttonText: { fontFamily: Font.bold, color: '#FFFFFF', letterSpacing: 0.5 },
  link: { marginTop: 6, color: '#6B7280', textAlign: 'center', fontSize: 14 },
  linkBold: { color: '#111827', fontWeight: '700' },
    agreeRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6, marginBottom: 10 }, // NEW
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#E53935',
    alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: '#fff',
  }, // NEW
  checkboxOn: { backgroundColor: '#E53935' }, // NEW
  checkboxTick: { color: '#fff', fontWeight: '800', lineHeight: Platform.OS === 'ios' ? 18 : 16 }, // NEW
  agreeText: { flex: 1, color: '#4B5563', fontSize: 13, lineHeight: 18 }, // NEW
  agreeLink: { color: '#6C63FF', fontWeight: '700' },
});