import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { sendPushToUser } from './sendPush';
import { NotificationCopy } from './types';

/**
 * Trigger: order status changed to 'paid'
 *
 * Firestore path: /orders/{orderId}
 * Expected fields: { status, buyerUid }
 */
export const onOrderPaid = onDocumentUpdated('orders/{orderId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();

  if (!before || !after) return;
  if (before.status === after.status) return;   // no change
  if (after.status !== 'paid') return;           // not a payment event

  const buyerUid = after.buyerUid as string | undefined;
  if (!buyerUid) return;

  await sendPushToUser(buyerUid, {
    type: 'order_paid',
    ...NotificationCopy.order_paid,
    data: {
      orderId: event.params.orderId,
    },
  });
});

/**
 * Trigger: voucher received by another user
 *
 * Firestore path: /users/{receiverUid}/receivedVouchers/{voucherId}
 * Adjust the path to match your actual Firestore structure.
 */
export const onVoucherReceived = onDocumentCreated(
  'users/{receiverUid}/receivedVouchers/{voucherId}',
  async (event) => {
    const receiverUid = event.params.receiverUid;
    const voucherId = event.params.voucherId;

    await sendPushToUser(receiverUid, {
      type: 'voucher_received',
      ...NotificationCopy.voucher_received,
      data: { voucherId },
    });
  },
);

/**
 * Trigger: voucher was redeemed by the receiver
 *
 * Firestore path: /orders/{orderId}
 * Expected fields: { voucherStatus, buyerUid }
 */
export const onVoucherRedeemed = onDocumentUpdated('orders/{orderId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();

  if (!before || !after) return;
  if (before.voucherStatus === after.voucherStatus) return;
  if (after.voucherStatus !== 'redeemed') return;

  const buyerUid = after.buyerUid as string | undefined;
  if (!buyerUid) return;

  await sendPushToUser(buyerUid, {
    type: 'voucher_redeemed',
    ...NotificationCopy.voucher_redeemed,
    data: {
      orderId: event.params.orderId,
    },
  });
});

/**
 * Scheduled: remind users about unused vouchers every day at 10:00 UTC
 *
 * Looks for receivedVouchers with status 'unused' older than 3 days.
 */
export const voucherReminderScheduled = onSchedule('every day 10:00', async () => {
  const db = admin.firestore();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  // Query all users — in production, paginate this with a cursor
  const usersSnap = await db.collection('users').get();

  const tasks = usersSnap.docs.map(async (userDoc) => {
    const uid = userDoc.id;

    const unusedSnap = await db
      .collection(`users/${uid}/receivedVouchers`)
      .where('status', '==', 'unused')
      .where('createdAt', '<=', threeDaysAgo)
      .limit(1)                              // one reminder per user per day
      .get();

    if (unusedSnap.empty) return;

    await sendPushToUser(uid, {
      type: 'voucher_reminder',
      ...NotificationCopy.voucher_reminder,
      data: {
        voucherId: unusedSnap.docs[0].id,
      },
    });
  });

  await Promise.allSettled(tasks);
});
