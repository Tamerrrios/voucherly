import crypto from 'crypto';
import { admin } from '../config/firebaseAdmin';

export type TelegramAuthPayload = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number | string;
  hash: string;
};

const TELEGRAM_AUTH_MAX_AGE_SECONDS = Number(process.env.TELEGRAM_AUTH_MAX_AGE_SECONDS || 86400);

const buildDataCheckString = (payload: TelegramAuthPayload): string => {
  const entries = Object.entries(payload)
    .filter(([key, value]) => key !== 'hash' && value !== undefined && value !== null)
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([key, value]) => `${key}=${value}`).join('\n');
};

const safeEqualHex = (aHex: string, bHex: string): boolean => {
  const a = Buffer.from(aHex, 'hex');
  const b = Buffer.from(bHex, 'hex');

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const verifyTelegramSignature = (payload: TelegramAuthPayload, botToken: string): void => {
  if (!payload.hash) {
    throw new Error('Missing Telegram hash');
  }

  const authDate = Number(payload.auth_date);
  if (!Number.isFinite(authDate)) {
    throw new Error('Invalid auth_date');
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > TELEGRAM_AUTH_MAX_AGE_SECONDS) {
    throw new Error('Telegram auth payload expired');
  }

  const dataCheckString = buildDataCheckString(payload);
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (!safeEqualHex(expectedHash, payload.hash)) {
    throw new Error('Invalid Telegram signature');
  }
};

export const upsertTelegramFirebaseUser = async (payload: TelegramAuthPayload): Promise<{ uid: string; customToken: string }> => {
  const telegramId = String(payload.id);
  const uid = `tg_${telegramId}`;

  const displayName = [payload.first_name, payload.last_name].filter(Boolean).join(' ').trim() || payload.username || `tg_${telegramId}`;

  try {
    await admin.auth().getUser(uid);
  } catch (error: any) {
    if (error?.code !== 'auth/user-not-found') {
      throw error;
    }

    await admin.auth().createUser({
      uid,
      displayName,
      photoURL: payload.photo_url || undefined,
    });
  }

  await admin
    .firestore()
    .collection('users')
    .doc(uid)
    .set(
      {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        telegram: {
          id: telegramId,
          username: payload.username || null,
          firstName: payload.first_name || null,
          lastName: payload.last_name || null,
          photoUrl: payload.photo_url || null,
          authDate: Number(payload.auth_date),
        },
      },
      { merge: true },
    );

  const customToken = await admin.auth().createCustomToken(uid, {
    provider: 'telegram',
    telegramId,
  });

  return { uid, customToken };
};
