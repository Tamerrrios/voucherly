import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';

// Initialize Firebase Admin once at the top level
admin.initializeApp();

export const health = onRequest((_req, res) => {
  res.status(200).json({ ok: true });
});

// Push notification triggers
export {
  onOrderPaid,
  onVoucherReceived,
  onVoucherRedeemed,
  voucherReminderScheduled,
} from './notifications/triggers';
