import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';

const Header = () => {
  const navigation = useNavigation();
  const {user} = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image
          source={require('../../assets/images/image.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Voucherly</Text>
      </View>

      {user ? (
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Image
            source={require('../../assets/images/notification-bell.png')}
            style={styles.notificationIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Войти</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 0,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  loginButton: {
    backgroundColor: '#E53935',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationBtn: {
    padding: 6,
  },
  notificationIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
});

export default Header;