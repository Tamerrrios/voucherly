// src/navigation/Navigator.tsx
import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { enableScreens } from "react-native-screens";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthContext } from '../context/AuthContext';

import { Navigation, navigationRef } from "./Navigation";
import { Routes, RootStackParamList, TabParamList } from "./types";
import CustomTabBar from "./CustomTabBar";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useLocalization } from '../context/LocalizationContext';


// Barrel-импорт экранов
import {
  HomeScreen,
  ProfileScreen,
  SupplierScreen,
  ContactScreen,
  MediaScreen,
  PreviewScreen,
  CheckoutScreen,
  SuccessScreen,
  RegisterScreen,
  LoginScreen,
  OtpVerificationScreen,
  AuthRedirectScreen,
  MyOrdersScreen,
  OrderDetailsScreen,
  VouchersScreen,
  PrivacyPolicyScreen,
  OnboardingScreen,
  MyVouchersScreen,
  GiftClaimScreen,
  CategoryScreen,
  NotificationsScreen
} from "../screens";

// Навигаторы с типами
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const ProfileStack = createNativeStackNavigator<RootStackParamList>();
const WalletStack = createNativeStackNavigator<RootStackParamList>();

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name={Routes.Profile} component={ProfileScreen} />
    <ProfileStack.Screen name={Routes.OrderDetails} component={OrderDetailsScreen} />
    <ProfileStack.Screen name={Routes.PrivacyPolicy} component={PrivacyPolicyScreen} />
  </ProfileStack.Navigator>
);

const WalletStackNavigator = () => (
  <WalletStack.Navigator screenOptions={{ headerShown: false }}>
    <WalletStack.Screen name={Routes.MyOrders} component={MyOrdersScreen} />
    <WalletStack.Screen name={Routes.OrderDetails} component={OrderDetailsScreen} />
  </WalletStack.Navigator>
);

enableScreens();

const BottomTabs: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLocalization();

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            position: "absolute",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#fff",
            height: 70,
            paddingBottom: 8,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 6,
            elevation: 4,
          },
          tabBarIcon: ({ focused }) => {
            let iconName: string = "home-outline";
            if (route.name === Routes.Home) iconName = focused ? "home" : "home-outline";
            if (route.name === Routes.CategoryScreen) iconName = focused ? "gift" : "gift-outline";
            if (route.name === Routes.Wallet) iconName = focused ? "wallet" : "wallet-outline";
            if (route.name === Routes.Profile) iconName = focused ? "person" : "person-outline";
            return (
              <Ionicons
                name={iconName}
                size={24}
                color={focused ? "#E53935" : "gray"}
              />
            );
          },
          tabBarActiveTintColor: "#E53935",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginTop: -2 },
        })}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name={Routes.Home}
          component={HomeScreen}
          options={{ tabBarLabel: t('navigation.home') }}
        />

        <Tab.Screen
          name={Routes.CategoryScreen}
          component={CategoryScreen}
          options={{ tabBarLabel: t('navigation.vouchers') }}
        />

        <Tab.Screen
          name={Routes.Wallet}
          component={WalletStackNavigator}
          options={{ tabBarLabel: t('navigation.wallet') }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (!user) {
                e.preventDefault();
                navigation.getParent()?.navigate(Routes.Login);
              }
            },
          })}
        />

        <Tab.Screen
          name={Routes.Profile}
          component={ProfileStackNavigator}
          options={{ tabBarLabel: t('navigation.profile') }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (!user) {
                e.preventDefault();
                navigation.getParent()?.navigate(Routes.Login);
              }
            },
          })}
        />
      </Tab.Navigator>
    </>
  );
};

/** Runs inside NavigationContainer so hooks can access navigation context */
const PushHandler = () => {
  const { usePushNotifications } = require('../hooks/usePushNotifications');
  usePushNotifications();
  return null;
};

export const Navigator = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem("onboardingShown");
      setShowOnboarding(value !== "true");
      setLoading(false);
    };
    checkOnboarding();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={Navigation.onStateChange}
    >
      <PushHandler />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding && (
          <Stack.Screen name={Routes.Onboarding} component={OnboardingScreen} />
        )}

        <Stack.Screen name={Routes.Main} component={BottomTabs} />
        <Stack.Screen name={Routes.Supplier} component={SupplierScreen} />
        <Stack.Screen name={Routes.Contact} component={ContactScreen} />
        <Stack.Screen name={Routes.MediaScreen} component={MediaScreen} />
        <Stack.Screen name={Routes.MediaPreview} component={PreviewScreen} />
        <Stack.Screen name={Routes.Checkout} component={CheckoutScreen} />
        <Stack.Screen name={Routes.Success} component={SuccessScreen} />
        <Stack.Screen name={Routes.AuthRedirect} component={AuthRedirectScreen} />
        <Stack.Screen name={Routes.OrderDetails} component={OrderDetailsScreen} />
        <Stack.Screen name={Routes.PrivacyPolicy} component={PrivacyPolicyScreen} />
        <Stack.Screen name={Routes.MyVouchers} component={MyVouchersScreen} />
        <Stack.Screen name={Routes.GiftClaim} component={GiftClaimScreen} />
        <Stack.Screen name={Routes.CategoryScreen} component={CategoryScreen} />
        <Stack.Screen name={Routes.Vouchers} component={VouchersScreen} />
        <Stack.Screen name={Routes.NotificationsScreen} component={NotificationsScreen} options={{ headerShown: false }}/>
        {!user && (
          <>
            <Stack.Screen name={Routes.Login} component={LoginScreen} />
            <Stack.Screen name={Routes.OtpVerification} component={OtpVerificationScreen} />
            <Stack.Screen name={Routes.Register} component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};



// const BottomTabs = () => (
//   <Tab.Navigator
//     screenOptions={({ route }) => ({
//       headerShown: false,
//       tabBarShowLabel: true,
//       // отключим стандартный стиль, так как мы рендерим свой:
//       tabBarStyle: { position: "absolute" }, // не обязат., но ок
//       tabBarIcon: ({ focused }) => {
//         // вернём Image как ноду — кастомный таббар отрисует
//         if (route.name === Routes.Home) {
//           return (
//             <Image
//               source={
//                 focused
//                   ? require("../../assets/images/house-active.png")
//                   : require("../../assets/images/house.png")
//               }
//               style={{ width: 24, height: 24, resizeMode: "contain" }}
//             />
//           );
//         }
//         if (route.name === Routes.Vouchers) {
//           return (
//             <Image
//               source={
//                 focused
//                   ? require("../../assets/images/gift-card.png")
//                   : require("../../assets/images/voucher.png")
//               }
//               style={{ width: 24, height: 24, resizeMode: "contain" }}
//             />
//           );
//         }
//         if (route.name === Routes.Profile) {
//           return (
//             <Image
//               source={
//                 focused
//                   ? require("../../assets/images/user-active.png")
//                   : require("../../assets/images/user.png")
//               }
//               style={{ width: 24, height: 24, resizeMode: "contain" }}
//             />
//           );
//         }
//         return null;
//       },
//       tabBarActiveTintColor: "#E53935",
//       tabBarInactiveTintColor: "gray",
//     })}
//     tabBar={(props) => <CustomTabBar {...props} />} // 👈 подключаем
//   >
//     <Tab.Screen
//       name={Routes.Home}
//       component={HomeScreen}
//       options={{ tabBarLabel: "Home" }}
//     />
//     <Tab.Screen
//       name={Routes.Vouchers}
//       component={VouchersScreen}
//       options={{ tabBarLabel: "Vouchers" }}
//     />
//     <Tab.Screen
//       name={Routes.Profile}
//       component={ProfileStackNavigator}
//       options={{ tabBarLabel: "Profile" }}
//     />
//   </Tab.Navigator>
// );
// const BottomTabs = () => (
//     <Tab.Navigator
//         screenOptions={({ route }) => ({
//             headerShown: false,
//             animationEnabled: true,
//             tabBarIcon: ({ focused }) => {
//                 let iconSource;
//                 if (route.name === Routes.Home) {
//                     iconSource = focused
//                         ? require("../../assets/images/house-active.png")
//                         : require("../../assets/images/house.png");
//                 } else if (route.name === Routes.Profile) {
//                     iconSource = focused
//                         ? require("../../assets/images/user-active.png")
//                         : require("../../assets/images/user.png");
//                 } else if (route.name === Routes.Vouchers) {
//                     iconSource = focused
//                         ? require("../../assets/images/gift-card.png")
//                         : require("../../assets/images/voucher.png");
//                 }
//                 return (
//                     <Image
//                         source={iconSource}
//                         style={{ width: 24, height: 24, resizeMode: "contain" }}
//                     />
//                 );
//             },
//             tabBarLabelStyle: { fontWeight: "bold", fontSize: 12 },
//             tabBarActiveTintColor: "#E53935",
//             tabBarInactiveTintColor: "gray",
//         })}
//     >
//         <Tab.Screen name={Routes.Home} component={HomeScreen} />
//         <Tab.Screen name={Routes.Vouchers} component={VouchersScreen} />
//         <Tab.Screen name={Routes.Profile} component={ProfileStackNavigator} />
//     </Tab.Navigator>
// );
