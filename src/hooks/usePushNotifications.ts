import { useEffect } from 'react';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { PushNotificationService } from '../services/PushNotificationService';
import { useAuth } from '../context/AuthContext';
import { Routes } from '../navigation/types';
import { Navigation, navigationRef } from '../navigation/Navigation';

export type NotificationType =
  | 'order_paid'
  | 'voucher_received'
  | 'voucher_redeemed'
  | 'voucher_reminder';

/**
 * Routes user to the correct screen based on notification type.
 * Called in all three states: foreground tap, background tap, quit-state launch.
 */
function handleNavigation(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): void {
  if (!navigationRef.current?.isReady()) return;

  const type = remoteMessage.data?.type as NotificationType | undefined;
  const orderId = remoteMessage.data?.orderId;

  switch (type) {
    case 'order_paid':
      if (orderId) Navigation.navigate(Routes.OrderDetails, { orderId });
      break;

    case 'voucher_received':
    case 'voucher_reminder':
      Navigation.navigate(Routes.MyVouchers);
      break;

    case 'voucher_redeemed':
      if (orderId) Navigation.navigate(Routes.OrderDetails, { orderId });
      break;

    default:
      break;
  }
}

/**
 * Call this hook once inside the root Navigator (after auth is resolved).
 * Handles the full push lifecycle:
 *   - permission request
 *   - device token registration
 *   - token refresh
 *   - foreground / background / quit-state navigation
 */
export const usePushNotifications = (): void => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribeRefresh: (() => void) | undefined;

    const setup = async () => {
      const granted = await PushNotificationService.requestPermission();
      if (!granted) {
        console.log('[Push] Permission not granted');
        return;
      }

      await PushNotificationService.registerDevice(user.uid);
      unsubscribeRefresh = PushNotificationService.setupTokenRefresh(user.uid);
    };

    setup();

    // --- Foreground: app is open, notification arrives ---
    // No navigation here — show an in-app banner/toast (implement later)
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('[Push] Foreground message:', remoteMessage.data?.type);
      // TODO: show in-app notification banner (e.g. react-native-toast-message)
    });

    // --- Background: app is running in background, user taps notification ---
    const unsubscribeOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      handleNavigation(remoteMessage);
    });

    // --- Quit state: app was closed, user taps notification to launch it ---
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        // Delay to ensure Navigator is mounted before navigating
        setTimeout(() => handleNavigation(remoteMessage), 500);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
      unsubscribeRefresh?.();
    };
  }, [user?.uid]);
};
