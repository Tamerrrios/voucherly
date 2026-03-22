import * as admin from 'firebase-admin';
import { PushPayload } from './types';

/**
 * Sends a push notification to all active devices of a user.
 *
 * Flow:
 * 1. Fetch all active devices from /users/{uid}/devices
 * 2. Build a multicast FCM message
 * 3. Send via firebase-admin messaging
 * 4. Deactivate any stale/invalid tokens automatically
 */
export async function sendPushToUser(
  uid: string,
  payload: PushPayload,
): Promise<void> {
  const db = admin.firestore();

  const devicesSnap = await db
    .collection(`users/${uid}/devices`)
    .where('isActive', '==', true)
    .get();

  if (devicesSnap.empty) {
    console.log(`[Push] No active devices for uid: ${uid}`);
    return;
  }

  const tokens = devicesSnap.docs
    .map((d) => d.data().fcmToken as string)
    .filter(Boolean);

  if (!tokens.length) return;

  const message: admin.messaging.MulticastMessage = {
    tokens,

    notification: {
      title: payload.title,
      body: payload.body,
    },

    // data must be Record<string, string> — available in all app states
    data: {
      type: payload.type,
      ...payload.data,
    },

    // iOS-specific config
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          'content-available': 1, // wake up app for data-only pushes
        },
      },
    },

    // Android-specific config (ready for when Android is added)
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'voucherly_default',
      },
    },
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  console.log(
    `[Push] Sent to ${tokens.length} device(s). ` +
    `Success: ${response.successCount}, Failed: ${response.failureCount}`,
  );

  // Deactivate stale/invalid tokens to keep Firestore clean
  const staleIndices: number[] = [];
  response.responses.forEach((resp, idx) => {
    const code = resp.error?.code;
    if (
      !resp.success &&
      (code === 'messaging/invalid-registration-token' ||
        code === 'messaging/registration-token-not-registered')
    ) {
      staleIndices.push(idx);
    }
  });

  if (staleIndices.length) {
    const batch = db.batch();
    staleIndices.forEach((idx) => {
      batch.update(devicesSnap.docs[idx].ref, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
    console.log(`[Push] Deactivated ${staleIndices.length} stale token(s)`);
  }
}
