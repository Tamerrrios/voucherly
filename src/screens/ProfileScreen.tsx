import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import GradientHeader from '../components/GradientHeader'; // наш кастомный header
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Main');
  };

  const menuItems = [
    { title: 'Мои покупки', icon: require('../../assets/images/checkout.png'), onPress: () => navigation.navigate('MyOrders') },
    { title: 'Мои ваучеры', icon: require('../../assets/images/voucher.png'), onPress: () => { } },
    { title: 'Язык', icon: require('../../assets/images/world.png'), onPress: () => { } },
    { title: 'Политика конфиденциальности', icon: require('../../assets/images/google-docs.png'), onPress: () => navigation.navigate('PrivacyPolicy') },
    { title: 'Выйти из приложения', icon: require('../../assets/images/user-logout.png'), onPress: handleLogout, color: '#E53935' },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader title="Профиль" />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.Text style={styles.welcome} entering={FadeInUp.duration(400)}>
          Добро пожаловать, {user?.name || 'Гость'}
        </Animated.Text>

        {menuItems.map((item, index) => (
          <Animated.View key={index} entering={FadeInUp.delay(index * 100)}>
            <TouchableOpacity style={styles.item} onPress={item.onPress}>
              <View style={styles.iconWrapper}>
                <Image source={item.icon} style={{ width: 20, height: 20 }} />
              </View>
              <Text style={[styles.itemText, item.color && { color: item.color }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20 },
  welcome: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    backgroundColor: '#eee',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default ProfileScreen;