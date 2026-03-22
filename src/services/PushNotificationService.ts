import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { doc, setDoc } from '@react-native-firebase/firestore';
import { db } from '../firebase/firebase';

const DEVICE_ID_KEY = '@voucherly/device_id';

/**
 * Returns a stable device ID.
 * Generated once on first launch and persisted in AsyncStorage.
 */
async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

async function ensureUserDocument(uid: string): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastSeenPlatform: Platform.OS,
    },
    { merge: true },
  );
}

async function waitForApnsToken(timeoutMs = 5000): Promise<string | null> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const token = await messaging().getAPNSToken();
    if (token) {
      return token;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return null;
}

export class PushNotificationService {
  /**
   * Request push notification permission from the user.
   * Returns true if granted or provisional.
   */
  static async requestPermission(): Promise<boolean> {
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  /**
   * Register device in Firestore: /users/{uid}/devices/{deviceId}
   * Called after login and on app start if user is authenticated.
   */
  static async registerDevice(uid: string): Promise<void> {
    try {
      // iOS requires APNs registration before requesting FCM token
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }

      if (Platform.OS === 'ios') {
        const apnsToken = await waitForApnsToken();
        if (!apnsToken) {
          console.log('[Push] APNs token is not ready yet, skipping FCM registration for now');
          return;
        }
      }

      const [token, deviceId] = await Promise.all([
        messaging().getToken(),
        getDeviceId(),
      ]);

      console.log('[Push] FCM Token:', token);

      if (!token) {
        console.log('[Push] No FCM token available');
        return;
      }

      await ensureUserDocument(uid);

      await setDoc(
        doc(db, 'users', uid, 'devices', deviceId),
        {
          fcmToken: token,
          platform: Platform.OS,           // 'ios' | 'android'
          deviceId,
          isActive: true,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        { merge: true },                   // preserve createdAt on updates
      );

      console.log(`[Push] Device registered: ${deviceId}`);
    } catch (e) {
      console.warn('[Push] registerDevice skipped:', e);
    }
  }

  /**
   * Mark device as inactive on logout.
   * We don't delete the document to preserve audit trail.
   */
  static async unregisterDevice(uid: string): Promise<void> {
    try {
      const deviceId = await getDeviceId();
      await ensureUserDocument(uid);
      await setDoc(
        doc(db, 'users', uid, 'devices', deviceId),
        { isActive: false, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      console.log('[Push] Device unregistered');
    } catch (e) {
      console.error('[Push] unregisterDevice error:', e);
    }
  }

  /**
   * Subscribe to FCM token refresh.
   * FCM rotates tokens periodically — we must keep Firestore in sync.
   * Returns an unsubscribe function.
   */
  static setupTokenRefresh(uid: string): () => void {
    return messaging().onTokenRefresh(async (newToken) => {
      try {
        const deviceId = await getDeviceId();
        await ensureUserDocument(uid);
        await setDoc(
          doc(db, 'users', uid, 'devices', deviceId),
          { fcmToken: newToken, updatedAt: new Date().toISOString() },
          { merge: true },
        );
        console.log('[Push] Token refreshed');
      } catch (e) {
        console.error('[Push] tokenRefresh error:', e);
      }
    });
  }
}
