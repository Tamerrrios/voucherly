import crypto from 'crypto';
import { admin } from '../config/firebaseAdmin';

const OTP_COLLECTION = 'otp_requests';
const OTP_TTL_MS = Number(process.env.OTP_TTL_MS || 3 * 60 * 1000);
const OTP_LENGTH = Number(process.env.OTP_LENGTH || 4);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_MAX_PER_HOUR = Number(process.env.OTP_MAX_PER_HOUR || 5);
const OTP_RESEND_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_MS || 60 * 1000);
const OTP_SECRET = process.env.OTP_SECRET || 'voucherly-dev-otp-secret';

export type OtpLanguage = 'ru' | 'uz';
type OtpStatus = 'pending' | 'verified' | 'expired' | 'blocked' | 'superseded';

type OtpRequestRecord = {
  phone: string;
  codeHash: string;
  expiresAtMs: number;
  attempts: number;
  maxAttempts: number;
  status: OtpStatus;
  language: OtpLanguage;
  createdAtMs: number;
  verifiedAtMs: number | null;
  resendCount: number;
  supersededAtMs?: number | null;
};

export class OtpApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'OtpApiError';
    this.code = code;
    this.status = status;
  }
}

const hashOtpCode = (requestId: string, code: string) =>
  crypto
    .createHash('sha256')
    .update(`${OTP_SECRET}:${requestId}:${code}`)
    .digest('hex');

export const normalizePhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.startsWith('998') ? digits : `998${digits}`;

  if (!/^998\d{9}$/.test(normalized)) {
    throw new OtpApiError('OTP_INVALID_PHONE', 'Некорректный номер телефона');
  }

  return `+${normalized}`;
};

export const maskPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.startsWith('998') ? digits : `998${digits}`;
  const body = normalized.slice(3);

  return `+998 ${body.slice(0, 2)} ${body.slice(2, 5)} ${body.slice(5, 7)} ${body.slice(7, 9)}`;
};

const generateOtpCode = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const invalidatePendingRequests = async (normalizedPhone: string, now: number) => {
  const db = admin.firestore();
  const recentRequests = await db
    .collection(OTP_COLLECTION)
    .where('phone', '==', normalizedPhone)
    .get();

  const pendingDocs = recentRequests.docs.filter((doc) => doc.data().status === 'pending');
  if (pendingDocs.length > 0) {
    const batch = db.batch();
    pendingDocs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'superseded',
        supersededAtMs: now,
      });
    });
    await batch.commit();
  }

  return recentRequests;
};

const assertRequestRateLimits = (
  recentRequests: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  now: number,
  isResend: boolean,
) => {
  const hourAgo = now - 60 * 60 * 1000;
  const recentCount = recentRequests.docs.filter(
    (doc) => Number(doc.data().createdAtMs || 0) >= hourAgo,
  ).length;

  if (OTP_MAX_PER_HOUR > 0 && recentCount >= OTP_MAX_PER_HOUR) {
    throw new OtpApiError('OTP_RATE_LIMITED', 'Слишком много запросов. Попробуйте позже.', 429);
  }

  const lastRequest = recentRequests.docs
    .map((doc) => doc.data() as OtpRequestRecord)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)[0];

  if (OTP_RESEND_COOLDOWN_MS > 0 && lastRequest && now - lastRequest.createdAtMs < OTP_RESEND_COOLDOWN_MS) {
    const code = isResend ? 'OTP_RESEND_TOO_EARLY' : 'OTP_COOLDOWN_ACTIVE';
    throw new OtpApiError(code, 'Повторная отправка пока недоступна. Попробуйте позже.', 429);
  }
};

const buildOtpRecord = (
  requestId: string,
  normalizedPhone: string,
  code: string,
  language: OtpLanguage,
  now: number,
  resendCount: number,
): OtpRequestRecord => ({
  phone: normalizedPhone,
  codeHash: hashOtpCode(requestId, code),
  expiresAtMs: now + OTP_TTL_MS,
  attempts: 0,
  maxAttempts: OTP_MAX_ATTEMPTS,
  status: 'pending',
  language,
  createdAtMs: now,
  verifiedAtMs: null,
  resendCount,
});

export const createOtpRequest = async (
  phone: string,
  language: OtpLanguage,
  options?: { resend?: boolean },
) => {
  const db = admin.firestore();
  const normalizedPhone = normalizePhoneNumber(phone);
  const now = Date.now();
  const recentRequests = await invalidatePendingRequests(normalizedPhone, now);

  assertRequestRateLimits(recentRequests, now, !!options?.resend);

  const requestId = crypto.randomUUID();
  const code = generateOtpCode();
  const lastResendCount = recentRequests.docs
    .map((doc) => Number(doc.data().resendCount || 0))
    .sort((a, b) => b - a)[0] || 0;
  const record = buildOtpRecord(
    requestId,
    normalizedPhone,
    code,
    language,
    now,
    options?.resend ? lastResendCount + 1 : 0,
  );

  await db.collection(OTP_COLLECTION).doc(requestId).set(record);

  return {
    requestId,
    code,
    phone: normalizedPhone,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
  };
};

const ensurePhoneAuthUser = async (phone: string) => {
  const db = admin.firestore();
  const usersRef = db.collection('users');

  let uid: string;
  let isNewUser = false;
  let authUser: admin.auth.UserRecord | null = null;

  try {
    authUser = await admin.auth().getUserByPhoneNumber(phone);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== 'auth/user-not-found') {
      throw error;
    }
  }

  if (authUser) {
    uid = authUser.uid;
  } else {
    const existingUserSnapshot = await usersRef.where('phone', '==', phone).limit(1).get();

    if (!existingUserSnapshot.empty) {
      uid = existingUserSnapshot.docs[0].id;
      authUser = await admin.auth().createUser({
        uid,
        phoneNumber: phone,
      });
    } else {
      authUser = await admin.auth().createUser({
        phoneNumber: phone,
      });
      uid = authUser.uid;
      isNewUser = true;
    }
  }

  await usersRef.doc(uid).set(
    {
      phone,
      phoneVerified: true,
      authProvider: 'phone_otp',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return { uid, isNewUser };
};

export const verifyOtpCode = async (params: {
  requestId: string;
  phone: string;
  code: string;
}) => {
  const db = admin.firestore();
  const normalizedPhone = normalizePhoneNumber(params.phone);
  const docRef = db.collection(OTP_COLLECTION).doc(params.requestId);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error('Код подтверждения не найден');
  }

  const data = snapshot.data() as OtpRequestRecord;

  if (data.phone !== normalizedPhone) {
    throw new OtpApiError('OTP_PHONE_MISMATCH', 'Неверный номер телефона');
  }

  if (data.status !== 'pending') {
    throw new OtpApiError('OTP_NOT_ACTIVE', 'Код уже использован или недействителен');
  }

  if (Date.now() > data.expiresAtMs) {
    await docRef.update({ status: 'expired' });
    throw new OtpApiError('OTP_EXPIRED', 'Срок действия кода истек');
  }

  const nextAttempts = data.attempts + 1;
  const expectedHash = hashOtpCode(params.requestId, params.code.trim());

  if (data.codeHash !== expectedHash) {
    await docRef.update({
      attempts: nextAttempts,
      status: nextAttempts >= data.maxAttempts ? 'blocked' : 'pending',
    });
    throw new OtpApiError(
      nextAttempts >= data.maxAttempts ? 'OTP_BLOCKED' : 'OTP_INVALID_CODE',
      nextAttempts >= data.maxAttempts ? 'Код заблокирован' : 'Неверный код',
      400,
    );
  }

  await docRef.update({
    attempts: nextAttempts,
    status: 'verified',
    verifiedAtMs: Date.now(),
  });

  const { uid, isNewUser } = await ensurePhoneAuthUser(normalizedPhone);
  const customToken = await admin.auth().createCustomToken(uid);

  return {
    customToken,
    isNewUser,
    uid,
    phone: normalizedPhone,
  };
};
