import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./RootStackParamList";
import { NotificationsScreen } from "../../screens";

/**
 * Enum со всеми именами экранов — используем вместо "магических" строк
 */
export enum Routes {
  /** ---------- AUTH ---------- */
  Login = "Login",
  OtpVerification = "OtpVerification",
  Register = "Register",
  AuthRedirect = "AuthRedirect",

  /** ---------- MAIN STACK ---------- */
  Main = "Main",

  /** ---------- TABS ---------- */
  Home = "Home",
  Vouchers = "Vouchers",
  Wallet = "Wallet",
  Profile = "Profile",

  /** ---------- VOUCHER FLOW ---------- */
  Supplier = "Supplier",
  Contact = "Contact",
  MediaScreen = "MediaScreen",
  MediaPreview = "MediaPreview",
  Checkout = "Checkout",
  Success = "Success",

  /** ---------- ORDERS ---------- */
  MyOrders = "MyOrders",
  MyVouchers = "MyVouchers",
  OrderDetails = "OrderDetails",

  /** ---------- SETTINGS & MISC ---------- */
  Settings = "Settings",
  Language = "Language",
  PrivacyPolicy = "PrivacyPolicy",
  AboutApp = "AboutApp",

  /** ---------- Others ---------- */
  Onboarding = "Onboarding",
  GiftClaim = 'GiftClaim',
  CategoryScreen = 'CategoryScreen',
  NotificationsScreen = 'NotificationScreen'
}

/**
 * Типизированные пропсы для экранов Root Stack
 */
export type RootStackProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Тип экранов нижнего таб-меню
 */
export type TabParamList = {
  [Routes.Home]: undefined;
  [Routes.CategoryScreen]: undefined;
  [Routes.Wallet]: undefined;
  [Routes.Profile]: undefined;
};

export type { RootStackParamList };
