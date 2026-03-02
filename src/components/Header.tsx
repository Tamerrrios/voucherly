import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Font } from '../theme/typography';
import { Navigation } from '../navigation/Navigation';
import { Routes } from '../navigation';

const BG = '#F7F6F4';
const BRAND = '#E53935';

const Header = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { language } = useLocalization();
  const loginText = language === 'uz' ? 'Kirish' : language === 'en' ? 'Sign in' : 'Войти';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.logoWrap}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>V</Text>
        </View>
        <Text style={styles.logoText}>oucherly</Text>
      </View>

      {user ? (
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => Navigation.navigate(Routes.NotificationsScreen)}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color="#3A404D" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login' as never)}
          activeOpacity={0.9}
        >
          <Text style={styles.loginText}>{loginText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BG,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  logoLetter: {
    color: '#fff',
    fontFamily: Font.bold,
    fontSize: 17,
    lineHeight: 20,
  },
  logoText: {
    fontFamily: Font.bold,
    fontSize: 20,
    lineHeight: 24,
    color: '#1A1D25',
    marginLeft: -1,
  },
  loginButton: {
    backgroundColor: BRAND,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  loginText: {
    fontFamily: Font.bold,
    fontSize: 14,
    color: '#fff',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE8E3',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
});