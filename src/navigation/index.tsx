
import React, { useContext, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SupplierScreen from '../screens/SupplierScreen';
import ContactScreen from '../screens/ContactScreen';
import MediaScreen from '../screens/MediaScreen';
import PreviewScreen from '../screens/PreviewScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SuccessScreen from '../screens/SuccessScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import AuthRedirectScreen from '../screens/AuthRedirectScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import { Image } from 'react-native-animatable';
import VouchersScreen from '../screens/VouchersScreen';
import { PartnersProvider } from '../context/PartnersContext';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { enableScreens } from 'react-native-screens';
import MyVouchersScreen from '../screens/MyVouchersScreent';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    {/* <ProfileStack.Screen name="MyOrders" component={MyOrdersScreen} /> */}
    <ProfileStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
  </ProfileStack.Navigator>
);

enableScreens();

const BottomTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
            animationEnabled: true, 
      tabBarIcon: ({ focused }) => {
        let iconSource;

        if (route.name === 'Главная') {
          iconSource = focused
            ? require('../../assets/images/house-active.png')
            : require('../../assets/images/house.png');
        } else if (route.name === 'Профиль') {
          iconSource = focused
            ? require('../../assets/images/user-active.png')
            : require('../../assets/images/user.png');
        } else if (route.name === 'Ваучеры') {
          iconSource = focused
            ? require('../../assets/images/gift-card.png')
            : require('../../assets/images/voucher.png');

        }

        return (
          <Image
            source={iconSource}
            style={{ width: 24, height: 24, resizeMode: 'contain' }}
          />
        );
      },
       tabBarLabelStyle: {
      fontWeight: 'bold', // 👈 делает текст жирным
      fontSize: 12,        // (опционально) можно настроить размер
    },
      tabBarActiveTintColor: '#E53935',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Главная" component={HomeScreen} />
    <Tab.Screen name="Ваучеры" component={VouchersScreen} />
    <Tab.Screen name="Профиль" component={ProfileStackNavigator} />



  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem('onboardingShown');
      setShowOnboarding(value !== 'true');
      setLoading(false);
    };
    checkOnboarding();
  }, []);

  if (loading) return null;
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="Supplier" component={SupplierScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Media" component={MediaScreen} />
        <Stack.Screen name="Preview" component={PreviewScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen name="AuthRedirect" component={AuthRedirectScreen} />
        {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="MyVouchers" component={MyVouchersScreen} />

        {!user && (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;