import { Router } from 'express';
import { admin } from '../config/firebaseAdmin';
import {
  getMulticardEnvironmentConfig,
  normalizePaymentEnvironment,
  getPaymentExecutionMode,
  getPaymentPublicConfig,
  isPaymentTestMode,
  type PaymentEnvironment,
} from '../config/paymentEnvironment';
import {
  MulticardApiError,
  createMulticardInvoice,
  createMulticardPartnerPayment,
  verifyMulticardSuccessSignature,
  verifyMulticardWebhookSignature,
} from '../services/multicard.service';
import { validateCheckoutSessionPayload } from '../validators/checkoutSession.validator';

const router = Router();
const PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000;
const DEFAULT_WEB_RETURN_BASE = 'https://voucherly.uz';

const getStorageBucketName = () =>
  admin.app().options.storageBucket || 'voucherly-93d61.firebasestorage.app';

const getExtensionFromMimeType = (mimeType?: string | null) => {
  const normalized = (mimeType || '').toLowerCase();

  if (normalized.includes('png')) return 'png';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('heic')) return 'heic';
  if (normalized.includes('heif')) return 'heif';
  return 'jpg';
};

const generateStorageDownloadToken = () => admin.firestore().collection('_').doc().id;

const buildStorageDownloadUrl = (filePath: string, token: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${getStorageBucketName()}/o/${encodeURIComponent(
    filePath,
  )}?alt=media&token=${token}`;

const generateVoucherCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Array.from({ length: 4 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');

  return `VC-${ts}${rand}`;
};

const findUserUidByPhone = async (phone?: string | null) => {
  if (!phone) {
    return null;
  }

  const snapshot = await admin
    .firestore()
    .collection('users')
    .where('phone', '==', phone)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  try {
    const authUser = await admin.auth().getUserByPhoneNumber(phone);
    return authUser.uid;
  } catch {
    return null;
  }
};

const isReusableCheckoutOrder = (data: Record<string, any>) => {
  return data.status === 'pending_payment' || data.paymentStatus === 'invoice_created';
};

const getVoucherValidityDays = (data: Record<string, any>) => {
  const nestedValidity = Number(data?.voucher?.validityDays);
  if (Number.isFinite(nestedValidity) && nestedValidity > 0) {
    return nestedValidity;
  }

  const topLevelValidity = Number(data?.voucherValidityDays);
  if (Number.isFinite(topLevelValidity) && topLevelValidity > 0) {
    return topLevelValidity;
  }

  return null;
};

const buildVoucherExpiryTimestamp = (data: Record<string, any>, baseMs = Date.now()) => {
  const validityDays = getVoucherValidityDays(data);
  if (!validityDays) {
    return null;
  }

  return admin.firestore.Timestamp.fromMillis(
    baseMs + validityDays * 24 * 60 * 60 * 1000,
  );
};

const sanitizeBaseUrl = (value?: string | null) => String(value || '').trim().replace(/\/$/, '');

const isAllowedWebReturnUrl = (value?: string | null) => {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'voucherly.uz' ||
      host === 'www.voucherly.uz' ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
};

const resolveOrderReturnUrl = (params: {
  orderId: string;
  platform?: string | null;
  requestedReturnUrl?: string | null;
  paymentConfig: { returnUrlBase: string };
}) => {
  const platform = String(params.platform || '').trim().toLowerCase();

  if (platform === 'web') {
    if (isAllowedWebReturnUrl(params.requestedReturnUrl)) {
      const parsed = new URL(String(params.requestedReturnUrl));
      parsed.searchParams.set('orderId', params.orderId);
      parsed.searchParams.set('checkout', 'success');
      return parsed.toString();
    }

    const fallbackBase = sanitizeBaseUrl(
      process.env.LANDING_PUBLIC_BASE_URL || DEFAULT_WEB_RETURN_BASE,
    );
    return `${fallbackBase}/?orderId=${params.orderId}&checkout=success`;
  }

  return `${params.paymentConfig.returnUrlBase}?orderId=${params.orderId}`;
};

const findReusableCheckoutOrder = async (params: {
  userId: string;
  checkoutSessionId: string;
}) => {
  const snapshot = await admin
    .firestore()
    .collection('orders')
    .where('userId', '==', params.userId)
    .where('checkoutSessionId', '==', params.checkoutSessionId)
    .limit(5)
    .get();

  const reusableDoc = snapshot.docs.find((doc) => {
    const data = doc.data() || {};
    return isReusableCheckoutOrder(data) && !!data?.multicard?.checkoutUrl;
  });

  if (!reusableDoc) {
    return null;
  }

  return {
    orderId: reusableDoc.id,
    data: reusableDoc.data() as Record<string, any>,
  };
};

const findReusablePendingOrder = async (params: {
  userId: string;
  checkoutSessionId: string;
}) => {
  const snapshot = await admin
    .firestore()
    .collection('orders')
    .where('userId', '==', params.userId)
    .where('checkoutSessionId', '==', params.checkoutSessionId)
    .limit(5)
    .get();

  const reusableDoc = snapshot.docs.find((doc) => {
    const data = doc.data() || {};
    return isReusableCheckoutOrder(data);
  });

  if (!reusableDoc) {
    return null;
  }

  return {
    orderId: reusableDoc.id,
    data: reusableDoc.data() as Record<string, any>,
  };
};

const buildPaymentSessionResponse = (
  orderId: string,
  orderData: Record<string, any>,
  extra: Record<string, unknown> = {},
) => {
  const multicard = (orderData.multicard || {}) as Record<string, any>;
  const resolvedEnvironment = normalizePaymentEnvironment(orderData.paymentEnvironment);
  const paymentConfig = getMulticardEnvironmentConfig(resolvedEnvironment);

  return {
    success: true,
    mode: getPaymentExecutionMode(),
    paymentEnvironment: resolvedEnvironment,
    paymentFlow: (orderData.paymentFlow as string | null) || null,
    provider: (orderData.payProvider as string | null) || 'multicard',
    paymentMethod: (orderData.paymentMethod as string | null) || null,
    orderId,
    checkoutUrl: multicard.checkoutUrl || null,
    shortLink: multicard.shortLink ?? null,
    deeplink: multicard.deeplink ?? null,
    invoiceUuid: multicard.invoiceUuid || null,
    paymentUuid: multicard.paymentUuid || null,
    returnUrl: multicard.returnUrl || orderData.returnUrl || null,
    voucherCode: orderData.voucherCode || null,
    ...extra,
  };
};

const mapWebhookStatusToOrderStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'pending_payment',
    progress: 'pending_payment',
    success: 'paid',
    error: 'payment_failed',
    revert: 'cancelled',
  };

  return statusMap[status] || 'pending_payment';
};

const PAYMENT_METHODS: PaymentMethod[] = ['payme', 'click', 'uzum', 'card'];

const isSupportedPaymentMethod = (value: unknown): value is PaymentMethod =>
  typeof value === 'string' && PAYMENT_METHODS.includes(value as PaymentMethod);

type PartnerAccount = {
  partnerId?: string;
  name?: string;
  active?: boolean;
};

type RedemptionValidationStatus =
  | 'valid'
  | 'already_redeemed'
  | 'expired'
  | 'invalid'
  | 'partner_mismatch';

type PaymentMethod = 'payme' | 'click' | 'uzum' | 'card';

type NormalizedRedemptionOrder = {
  orderId: string;
  voucherCode: string | null;
  partnerId: string | null;
  partnerName: string | null;
  voucherTitle: string | null;
  amount: number | null;
  status: string | null;
  redeemed: boolean;
  redeemedAt: FirebaseFirestore.Timestamp | null;
  createdAt: FirebaseFirestore.Timestamp | null;
  expiresAt: FirebaseFirestore.Timestamp | null;
};

const getBearerToken = (authorizationHeader?: string | null) => {
  const header = String(authorizationHeader || '').trim();
  if (!header.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return header.slice(7).trim() || null;
};

const getPaymentEnvironmentAllowlist = () =>
  String(process.env.PAYMENT_ENV_OVERRIDE_ALLOWLIST || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const isPaymentEnvironmentAllowedForActor = (params: {
  uid?: string | null;
  email?: string | null;
}) => {
  const allowlist = getPaymentEnvironmentAllowlist();
  if (!allowlist.length) {
    return false;
  }

  const uid = String(params.uid || '').trim().toLowerCase();
  const email = String(params.email || '').trim().toLowerCase();

  return (uid && allowlist.includes(uid)) || (email && allowlist.includes(email));
};

const resolveRequestedPaymentEnvironment = (value: unknown): PaymentEnvironment | null => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  return normalizePaymentEnvironment(value);
};

const getPaymentEnvironmentOverrideActor = async (authorizationHeader?: string | null) => {
  const idToken = getBearerToken(authorizationHeader);
  if (!idToken) {
    return null;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email || null,
    };
  } catch {
    return null;
  }
};

const resolveEffectivePaymentEnvironment = async (params: {
  requestedEnvironment?: unknown;
  authorizationHeader?: string | null;
}) => {
  const requestedEnvironment = resolveRequestedPaymentEnvironment(params.requestedEnvironment);
  if (!requestedEnvironment) {
    return {
      environment: getMulticardEnvironmentConfig().environment,
      overrideApplied: false,
    };
  }

  const actor = await getPaymentEnvironmentOverrideActor(params.authorizationHeader);
  if (!actor || !isPaymentEnvironmentAllowedForActor(actor)) {
    return {
      environment: getMulticardEnvironmentConfig().environment,
      overrideApplied: false,
    };
  }

  return {
    environment: requestedEnvironment,
    overrideApplied: true,
  };
};

const normalizeVoucherCode = (value: string) => value.trim().toUpperCase();

const getOrderAmount = (data: Record<string, any>) => {
  if (typeof data?.voucher?.price === 'number') {
    return data.voucher.price;
  }

  if (typeof data?.total === 'number') {
    return data.total;
  }

  if (typeof data?.amount === 'number') {
    return data.amount;
  }

  return null;
};

const isOrderRedeemed = (data: Record<string, any>) => {
  const normalizedStatus = String(data.status || '').toLowerCase();

  return (
    data.redeemed === true ||
    data.redeemedAt != null ||
    normalizedStatus === 'redeemed' ||
    normalizedStatus === 'used' ||
    normalizedStatus === 'delivered'
  );
};

const isOrderExpired = (data: Record<string, any>) => {
  const normalizedStatus = String(data.status || '').toLowerCase();
  const expiresAtMillis =
    typeof data?.expiresAt?.toMillis === 'function' ? data.expiresAt.toMillis() : null;

  return normalizedStatus === 'expired' || (!!expiresAtMillis && expiresAtMillis <= Date.now());
};

const normalizeRedemptionOrder = (
  orderId: string,
  data: Record<string, any>,
): NormalizedRedemptionOrder => ({
  orderId,
  voucherCode: data.voucherCode || null,
  partnerId: data.partnerId || null,
  partnerName: data.partnerName || data.parnertName || null,
  voucherTitle: data?.voucher?.title || null,
  amount: getOrderAmount(data),
  status: data.status || null,
  redeemed: isOrderRedeemed(data),
  redeemedAt: data.redeemedAt || null,
  createdAt: data.createdAt || null,
  expiresAt: data.expiresAt || null,
});

const buildRedemptionValidationResult = (
  orderId: string | null,
  data: Record<string, any> | null,
  partnerId: string,
): { status: RedemptionValidationStatus; order: NormalizedRedemptionOrder | null } => {
  if (!orderId || !data) {
    return { status: 'invalid', order: null };
  }

  const order = normalizeRedemptionOrder(orderId, data);

  if (!order.partnerId || order.partnerId !== partnerId) {
    return { status: 'partner_mismatch', order };
  }

  if (order.redeemed) {
    return { status: 'already_redeemed', order };
  }

  if (isOrderExpired(data)) {
    return { status: 'expired', order };
  }

  return { status: 'valid', order };
};

const getPartnerContext = async (authorizationHeader?: string | null) => {
  const idToken = getBearerToken(authorizationHeader);

  if (!idToken) {
    const error = new Error('Unauthorized');
    (error as Error & { status?: number; code?: string }).status = 401;
    (error as Error & { status?: number; code?: string }).code = 'PARTNER_AUTH_REQUIRED';
    throw error;
  }

  const decoded = await admin.auth().verifyIdToken(idToken);
  const partnerSnap = await admin
    .firestore()
    .collection('partner_accounts')
    .doc(decoded.uid)
    .get();

  if (!partnerSnap.exists) {
    const error = new Error('Partner account not found');
    (error as Error & { status?: number; code?: string }).status = 403;
    (error as Error & { status?: number; code?: string }).code = 'PARTNER_ACCOUNT_NOT_FOUND';
    throw error;
  }

  const partnerAccount = partnerSnap.data() as PartnerAccount;

  if (!partnerAccount?.active || !partnerAccount?.partnerId) {
    const error = new Error('Partner account is inactive');
    (error as Error & { status?: number; code?: string }).status = 403;
    (error as Error & { status?: number; code?: string }).code = 'PARTNER_ACCOUNT_INACTIVE';
    throw error;
  }

  return {
    uid: decoded.uid,
    email: decoded.email || null,
    partnerId: partnerAccount.partnerId,
    partnerName: partnerAccount.name || null,
  };
};

const findOrderByVoucherCode = async (voucherCode: string) => {
  const snapshot = await admin
    .firestore()
    .collection('orders')
    .where('voucherCode', '==', voucherCode)
    .limit(5)
    .get();

  const found = snapshot.docs.find((doc) => !!doc.data());
  if (!found) {
    return null;
  }

  return {
    orderId: found.id,
    data: found.data() as Record<string, any>,
  };
};

const applyMulticardOrderUpdate = async (
  invoiceId: string,
  patch: Record<string, unknown>,
) => {
  const orderRef = admin.firestore().collection('orders').doc(invoiceId);

  await admin.firestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    const currentData = snapshot.data() || {};
    const alreadyPaid = currentData.status === 'paid' || currentData.paymentStatus === 'success';
    const nextStatus = patch.status;
    const nextPaymentStatus = patch.paymentStatus;
    const isSuccessfulPayment = nextStatus === 'paid' || nextPaymentStatus === 'success';

    // Keep successful payments terminal and idempotent.
    if (
      alreadyPaid &&
      nextStatus !== 'paid' &&
      nextPaymentStatus !== 'success'
    ) {
      transaction.set(
        orderRef,
        {
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          multicard: {
            ...(currentData.multicard || {}),
            lastIgnoredStatusPatch: patch,
          },
        },
        { merge: true },
      );
      return;
    }

    const successPatch = isSuccessfulPayment
      ? {
          expiresAt:
            buildVoucherExpiryTimestamp(currentData) ||
            currentData.expiresAt ||
            null,
          paymentExpiresAt: null,
          expiredAt: null,
        }
      : {};

    transaction.set(
      orderRef,
      {
        ...patch,
        ...successPatch,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
};

const buildPendingOrderPayload = (input: Record<string, any>) => ({
  ...input,
  status: 'pending_payment',
  payProvider: 'multicard',
  payTransactionId: null,
  paymentStatus: 'invoice_created',
  expiresAt: null,
  paymentExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + PENDING_PAYMENT_TTL_MS),
  expiredAt: null,
  shared: false,
  sharedAt: null,
  redeemed: false,
  redeemedAt: null,
  redeemedBy: null,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});

router.post('/upload-image', async (req, res) => {
  try {
    const base64 = String(req.body?.base64 || '').replace(/^data:[^;]+;base64,/, '');
    const userId = String(req.body?.userId || '').trim();
    const checkoutSessionId = String(req.body?.checkoutSessionId || '').trim();
    const mimeType = String(req.body?.mimeType || 'image/jpeg').trim();

    if (!base64 || !userId || !checkoutSessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_IMAGE_UPLOAD_INVALID',
          message: 'base64, userId and checkoutSessionId are required',
        },
      });
    }

    const ext = getExtensionFromMimeType(mimeType);
    const filePath = `orders/${userId}/${checkoutSessionId}.${ext}`;
    const token = generateStorageDownloadToken();
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);

    await file.save(Buffer.from(base64, 'base64'), {
      resumable: false,
      metadata: {
        contentType: mimeType || 'image/jpeg',
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    return res.status(200).json({
      success: true,
      path: filePath,
      url: buildStorageDownloadUrl(filePath, token),
    });
  } catch (error) {
    const err = error as { code?: string; message?: string; stack?: string };
    console.error('PAYMENT_IMAGE_UPLOAD_FAILED', {
      code: err?.code || null,
      message: err?.message || null,
      stack: err?.stack || null,
      bucket: getStorageBucketName(),
    });
    return res.status(500).json({
      success: false,
      error: {
        code: 'PAYMENT_IMAGE_UPLOAD_FAILED',
        message: err?.message || 'Unable to upload image',
      },
    });
  }
});

router.post('/checkout-session', async (req, res) => {
  try {
    const db = admin.firestore();
    const validation = validateCheckoutSessionPayload(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_INVALID_CHECKOUT_PAYLOAD',
          message: 'Checkout payload validation failed',
          details: validation.issues,
        },
      });
    }

    const payload = validation.data;
    const checkoutSessionId = payload.checkoutSessionId || '';
    const userId = payload.userId;

    if (checkoutSessionId && userId) {
      const existing = await findReusableCheckoutOrder({ userId, checkoutSessionId });

      if (existing) {
        return res.status(200).json(buildPaymentSessionResponse(existing.orderId, existing.data));
      }
    }

    const ordersRef = db.collection('orders');
    const orderRef = ordersRef.doc();
    const orderId = orderRef.id;

    const amount = Number(payload.amount || 0);
    const voucherCode = generateVoucherCode();
    const receiverUid = await findUserUidByPhone(payload.receiverPhone);
    const resolvedPaymentEnvironment = await resolveEffectivePaymentEnvironment({
      requestedEnvironment: req.body?.paymentEnvironmentOverride,
      authorizationHeader: req.headers.authorization,
    });

    const paymentConfig = getMulticardEnvironmentConfig(resolvedPaymentEnvironment.environment);
    const backendBaseUrl = paymentConfig.backendBaseUrl;
    const callbackUrl = `${backendBaseUrl}/payments/multicard/callback/success`;
    const returnUrl = resolveOrderReturnUrl({
      orderId,
      platform: payload.platform,
      requestedReturnUrl: payload.returnUrl,
      paymentConfig,
    });

    const basePayload = buildPendingOrderPayload({
      ...payload,
      voucherCode,
      receiverUid,
      invoiceId: orderId,
      returnUrl,
      callbackUrl,
      paymentEnvironment: resolvedPaymentEnvironment.environment,
    });

    if (isPaymentTestMode()) {
      console.log('⚠️ TEST MODE ACTIVE: simulating successful payment');

      await orderRef.set(
        {
          ...basePayload,
          status: 'paid',
          paymentStatus: 'success',
          payProvider: 'test',
          payTransactionId: `test_${checkoutSessionId || orderId}`,
          paidAt: new Date().toISOString(),
          expiresAt: buildVoucherExpiryTimestamp(basePayload),
          paymentExpiresAt: null,
          multicard: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      return res.status(200).json({
        ...buildPaymentSessionResponse(orderId, {
          ...basePayload,
          voucherCode,
          payProvider: 'test',
          paymentMethod: 'card',
          paymentFlow: 'hosted_invoice',
          multicard: null,
        }),
      });
    }

    const invoice = await createMulticardInvoice({
      amount,
      invoiceId: orderId,
      returnUrl,
      callbackUrl,
      environment: resolvedPaymentEnvironment.environment,
    });

    await orderRef.set(
        {
          ...basePayload,
          paymentMethod: 'card',
          paymentFlow: 'hosted_invoice',
          multicard: {
          invoiceUuid: invoice.uuid,
          invoiceId: invoice.invoice_id,
          checkoutUrl: invoice.checkout_url,
          shortLink: invoice.short_link ?? null,
          deeplink: invoice.deeplink ?? null,
          storeId: invoice.store_id,
          amount: invoice.amount,
          callbackUrl,
          returnUrl,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return res.status(200).json({
      ...buildPaymentSessionResponse(orderId, {
        ...basePayload,
        voucherCode,
        paymentMethod: 'card',
        paymentFlow: 'hosted_invoice',
        multicard: {
          invoiceUuid: invoice.uuid,
          invoiceId: invoice.invoice_id,
          checkoutUrl: invoice.checkout_url,
          shortLink: invoice.short_link ?? null,
          deeplink: invoice.deeplink ?? null,
          storeId: invoice.store_id,
          amount: invoice.amount,
          callbackUrl,
          returnUrl,
        },
      }),
    });
  } catch (error) {
    const apiError = error as MulticardApiError;
    return res.status(apiError.status || 500).json({
      success: false,
      error: {
        code: apiError.code || 'PAYMENT_SESSION_CREATE_FAILED',
        message: apiError.message || 'Unable to create payment session',
      },
    });
  }
});

router.get('/config', async (req, res) => {
  try {
    const resolvedPaymentEnvironment = await resolveEffectivePaymentEnvironment({
      requestedEnvironment: req.query?.paymentEnvironmentOverride,
      authorizationHeader: req.headers.authorization,
    });
    return res.status(200).json({
      success: true,
      ...getPaymentPublicConfig(resolvedPaymentEnvironment.environment),
    });
  } catch (error) {
    const apiError = error as MulticardApiError;
    return res.status(apiError.status || 500).json({
      success: false,
      error: {
        code: apiError.code || 'PAYMENT_CONFIG_FETCH_FAILED',
        message: apiError.message || 'Unable to load payment config',
      },
    });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const db = admin.firestore();
    const validation = validateCheckoutSessionPayload(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_INVALID_CHECKOUT_PAYLOAD',
          message: 'Checkout payload validation failed',
          details: validation.issues,
        },
      });
    }

    const payload = validation.data;
    const checkoutSessionId = payload.checkoutSessionId || '';
    const userId = payload.userId;

    if (checkoutSessionId && userId) {
      const existing = await findReusablePendingOrder({ userId, checkoutSessionId });
      if (existing) {
        return res
          .status(200)
          .json(buildPaymentSessionResponse(existing.orderId, existing.data, { paymentSelectionRequired: true }));
      }
    }

    const orderRef = db.collection('orders').doc();
    const orderId = orderRef.id;
    const voucherCode = generateVoucherCode();
    const receiverUid = await findUserUidByPhone(payload.receiverPhone);
    const resolvedPaymentEnvironment = await resolveEffectivePaymentEnvironment({
      requestedEnvironment: req.body?.paymentEnvironmentOverride,
      authorizationHeader: req.headers.authorization,
    });
    const paymentConfig = getMulticardEnvironmentConfig(resolvedPaymentEnvironment.environment);
    const callbackUrl = `${paymentConfig.backendBaseUrl}/payments/multicard/callback/success`;
    const returnUrl = resolveOrderReturnUrl({
      orderId,
      platform: payload.platform,
      requestedReturnUrl: payload.returnUrl,
      paymentConfig,
    });

    const basePayload = buildPendingOrderPayload({
      ...payload,
      voucherCode,
      receiverUid,
      invoiceId: orderId,
      returnUrl,
      callbackUrl,
      paymentEnvironment: resolvedPaymentEnvironment.environment,
    });

    await orderRef.set(
      {
        ...basePayload,
        paymentMethod: null,
        paymentFlow: null,
        multicard: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return res.status(200).json(
      buildPaymentSessionResponse(orderId, {
        ...basePayload,
        paymentMethod: null,
        paymentFlow: null,
        multicard: null,
      }, { paymentSelectionRequired: true }),
    );
  } catch (error) {
    const apiError = error as MulticardApiError;
    return res.status(apiError.status || 500).json({
      success: false,
      error: {
        code: apiError.code || 'PAYMENT_ORDER_CREATE_FAILED',
        message: apiError.message || 'Unable to create pending payment order',
      },
    });
  }
});

router.post('/orders/:orderId/payment-method', async (req, res) => {
  try {
    const orderId = String(req.params.orderId || '').trim();
    const paymentMethod = String(req.body?.paymentMethod || '')
      .trim()
      .toLowerCase();

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_ORDER_ID_REQUIRED',
          message: 'orderId is required',
        },
      });
    }

    if (!isSupportedPaymentMethod(paymentMethod)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_METHOD_UNSUPPORTED',
          message: 'paymentMethod is invalid',
        },
      });
    }

    const config = getPaymentPublicConfig();
    if (!config.methods[paymentMethod]) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_METHOD_DISABLED',
          message: 'Selected payment method is disabled',
        },
      });
    }

    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const snapshot = await orderRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    const orderData = snapshot.data() || {};
    if (orderData.status === 'paid' || orderData.paymentStatus === 'success') {
      return res.status(200).json(buildPaymentSessionResponse(orderId, orderData));
    }

    if (orderData.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_ORDER_INVALID_STATE',
          message: 'Order is not eligible for payment',
        },
      });
    }

    const existingMulticard = (orderData.multicard || {}) as Record<string, any>;
    if (
      orderData.paymentMethod === paymentMethod &&
      existingMulticard.checkoutUrl &&
      (orderData.paymentStatus === 'invoice_created' ||
        orderData.paymentStatus === 'draft' ||
        orderData.paymentStatus === 'progress')
    ) {
      return res.status(200).json(buildPaymentSessionResponse(orderId, orderData));
    }

    const amount = Number(orderData.amount || orderData.total || orderData?.voucher?.price || 0);
    const orderPaymentEnvironment = normalizePaymentEnvironment(orderData.paymentEnvironment);
    const paymentConfig = getMulticardEnvironmentConfig(orderPaymentEnvironment);
    const callbackUrl = `${paymentConfig.backendBaseUrl}/payments/multicard/callback/success`;
    const returnUrl = resolveOrderReturnUrl({
      orderId,
      platform: orderData.platform,
      requestedReturnUrl: orderData.returnUrl,
      paymentConfig,
    });

    if (isPaymentTestMode()) {
      await orderRef.set(
        {
          paymentMethod,
          paymentFlow: paymentMethod === 'card' ? 'hosted_invoice' : 'partner_page',
          payProvider: 'test',
          status: 'paid',
          paymentStatus: 'success',
          payTransactionId: `test_${orderId}_${paymentMethod}`,
          paidAt: new Date().toISOString(),
          expiresAt: buildVoucherExpiryTimestamp(orderData),
          paymentExpiresAt: null,
          multicard: null,
          paymentEnvironment: orderPaymentEnvironment,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      const updatedData = (await orderRef.get()).data() || {};
      return res.status(200).json(buildPaymentSessionResponse(orderId, updatedData));
    }

    if (paymentMethod === 'card') {
      const invoice = await createMulticardInvoice({
        amount,
        invoiceId: orderId,
        returnUrl,
        callbackUrl,
        environment: orderPaymentEnvironment,
      });

      await orderRef.set(
        {
          payProvider: 'multicard',
          paymentMethod,
          paymentFlow: 'hosted_invoice',
          paymentStatus: 'invoice_created',
          paymentEnvironment: orderPaymentEnvironment,
          multicard: {
            ...(existingMulticard || {}),
            invoiceUuid: invoice.uuid,
            invoiceId: invoice.invoice_id,
            checkoutUrl: invoice.checkout_url,
            shortLink: invoice.short_link ?? null,
            deeplink: invoice.deeplink ?? null,
            storeId: invoice.store_id,
            amount: invoice.amount,
            callbackUrl,
            returnUrl,
            paymentMethod,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    } else {
      const payment = await createMulticardPartnerPayment({
        amount,
        invoiceId: orderId,
        callbackUrl,
        paymentSystem: paymentMethod as 'payme' | 'click' | 'uzum',
        environment: orderPaymentEnvironment,
      });

      await orderRef.set(
        {
          payProvider: 'multicard',
          paymentMethod,
          paymentFlow: 'partner_page',
          paymentStatus: 'invoice_created',
          paymentEnvironment: orderPaymentEnvironment,
          multicard: {
            ...(existingMulticard || {}),
            paymentUuid: payment.uuid,
            invoiceUuid: null,
            invoiceId: payment.invoice_id ?? orderId,
            checkoutUrl: payment.checkout_url,
            shortLink: payment.short_link ?? null,
            deeplink: payment.deeplink ?? null,
            storeId: payment.store_id,
            amount: payment.amount,
            callbackUrl,
            returnUrl: null,
            paymentMethod,
            paymentSystem: payment.payment_system || paymentMethod,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    const updatedData = (await orderRef.get()).data() || {};
    return res.status(200).json(buildPaymentSessionResponse(orderId, updatedData));
  } catch (error) {
    const apiError = error as MulticardApiError;
    return res.status(apiError.status || 500).json({
      success: false,
      error: {
        code: apiError.code || 'PAYMENT_METHOD_CREATE_FAILED',
        message: apiError.message || 'Unable to initialize payment method',
      },
    });
  }
});

router.get('/gift/:orderId', async (req, res) => {
  try {
    const orderId = String(req.params.orderId || '').trim();

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'GIFT_ORDER_ID_REQUIRED',
          message: 'orderId is required',
        },
      });
    }

    const snapshot = await admin.firestore().collection('orders').doc(orderId).get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GIFT_ORDER_NOT_FOUND',
          message: 'Gift order not found',
        },
      });
    }

    const data = snapshot.data() || {};

    return res.status(200).json({
      success: true,
      orderId,
      gift: {
        senderName: data.senderName || 'Анонимный отправитель',
        voucherCode: data.voucherCode || null,
        comment: data.comment || null,
        partnerName: data.partnerName || data.parnertName || 'Voucherly',
        amount:
          typeof data?.voucher?.price === 'number'
            ? data.voucher.price
            : typeof data?.total === 'number'
              ? data.total
              : typeof data?.amount === 'number'
                ? data.amount
                : null,
        voucherTitle: data?.voucher?.title || 'Подарочный ваучер',
        partnerImageUrl: data?.voucher?.imageUrl || data.partnerImageUrl || null,
        attachedImage: data.attachedImage || null,
        mediaImageUrl: data.mediaImageUrl || null,
        imageUrl: data.imageUrl || null,
        receiverPhone: data.receiverPhone || null,
        status: data.status || null,
      },
    });
  } catch (error) {
    console.error('gift page order fetch failed', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'GIFT_ORDER_FETCH_FAILED',
        message: 'Unable to load gift order',
      },
    });
  }
});

router.post("/orders/:orderId/gift-reveal-seen", async (req, res) => {
  try {
    const orderId = String(req.params.orderId || "").trim();
    const userId = String(req.body?.userId || "").trim();

    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "GIFT_REVEAL_SEEN_INVALID",
          message: "orderId and userId are required",
        },
      });
    }

    const orderRef = admin.firestore().collection("orders").doc(orderId);
    const snapshot = await orderRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        error: {
          code: "GIFT_REVEAL_ORDER_NOT_FOUND",
          message: "Gift order not found",
        },
      });
    }

    const data = snapshot.data() || {};
    const isRecipient = data.receiverUid === userId || data.claimedBy === userId;

    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        error: {
          code: "GIFT_REVEAL_SEEN_FORBIDDEN",
          message: "Only the gift recipient can mark this gift as seen",
        },
      });
    }

    if (data?.giftRevealSeenBy?.[userId]) {
      return res.status(200).json({
        success: true,
        alreadySeen: true,
      });
    }

    await orderRef.set(
      {
        giftRevealSeenAt: admin.firestore.FieldValue.serverTimestamp(),
        giftRevealSeenBy: {
          [userId]: admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return res.status(200).json({
      success: true,
      alreadySeen: false,
    });
  } catch (error) {
    console.error("gift reveal seen update failed", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "GIFT_REVEAL_SEEN_UPDATE_FAILED",
        message: "Unable to mark gift reveal as seen",
      },
    });
  }
});

router.post('/partner/redemptions/validate', async (req, res) => {
  try {
    const partner = await getPartnerContext(req.headers.authorization);
    const voucherCode = normalizeVoucherCode(String(req.body?.voucherCode || ''));

    if (!voucherCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REDEMPTION_VOUCHER_CODE_REQUIRED',
          message: 'voucherCode is required',
        },
      });
    }

    const orderMatch = await findOrderByVoucherCode(voucherCode);
    const validation = buildRedemptionValidationResult(
      orderMatch?.orderId || null,
      orderMatch?.data || null,
      partner.partnerId,
    );

    return res.status(200).json({
      success: true,
      validationStatus: validation.status,
      order: validation.order,
    });
  } catch (error) {
    const err = error as Error & { status?: number; code?: string };
    return res.status(err.status || 500).json({
      success: false,
      error: {
        code: err.code || 'REDEMPTION_VALIDATE_FAILED',
        message: err.message || 'Unable to validate voucher',
      },
    });
  }
});

router.post('/partner/redemptions/redeem', async (req, res) => {
  try {
    const partner = await getPartnerContext(req.headers.authorization);
    const voucherCode = normalizeVoucherCode(String(req.body?.voucherCode || ''));

    if (!voucherCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REDEMPTION_VOUCHER_CODE_REQUIRED',
          message: 'voucherCode is required',
        },
      });
    }

    const orderMatch = await findOrderByVoucherCode(voucherCode);
    if (!orderMatch) {
      return res.status(200).json({
        success: true,
        redemptionStatus: 'invalid',
        order: null,
        redemptionId: null,
      });
    }

    const db = admin.firestore();
    const orderRef = db.collection('orders').doc(orderMatch.orderId);
    const redemptionRef = db.collection('redemptions').doc();

    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(orderRef);
      if (!snapshot.exists) {
        return {
          redemptionStatus: 'invalid' as const,
          order: null,
          redemptionId: null as string | null,
        };
      }

      const currentData = snapshot.data() || {};
      const validation = buildRedemptionValidationResult(
        snapshot.id,
        currentData,
        partner.partnerId,
      );

      if (validation.status !== 'valid' || !validation.order) {
        return {
          redemptionStatus: validation.status,
          order: validation.order,
          redemptionId: null as string | null,
        };
      }

      transaction.set(
        orderRef,
        {
          status: 'used',
          redeemed: true,
          redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
          redeemedBy: partner.uid,
          redemptionId: redemptionRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.set(redemptionRef, {
        orderId: snapshot.id,
        voucherCode,
        partnerId: partner.partnerId,
        partnerName: validation.order.partnerName || partner.partnerName || null,
        redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
        redeemedBy: partner.uid,
        redeemedByEmail: partner.email,
        redeemSource: 'manual',
        validationSnapshot: {
          amount: validation.order.amount,
          expiresAt: validation.order.expiresAt,
          statusBefore: validation.order.status,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        redemptionStatus: 'redeemed' as const,
        order: {
          ...validation.order,
          status: 'used',
          redeemed: true,
        },
        redemptionId: redemptionRef.id,
      };
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const err = error as Error & { status?: number; code?: string };
    return res.status(err.status || 500).json({
      success: false,
      error: {
        code: err.code || 'REDEMPTION_REDEEM_FAILED',
        message: err.message || 'Unable to redeem voucher',
      },
    });
  }
});


router.get('/orders/:orderId/status', async (req, res) => {
  const orderId = req.params.orderId;
  const orderRef = admin.firestore().collection('orders').doc(orderId);
  const snapshot = await orderRef.get();

  if (!snapshot.exists) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      },
    });
  }

  const data = snapshot.data() || {};
  const paymentExpiresAtMillis =
    typeof data?.paymentExpiresAt?.toMillis === 'function'
      ? data.paymentExpiresAt.toMillis()
      : typeof data?.expiresAt?.toMillis === 'function'
        ? data.expiresAt.toMillis()
        : null;
  const isPending =
    data.status === 'pending_payment' &&
    (data.paymentStatus === 'invoice_created' ||
      data.paymentStatus === 'draft' ||
      data.paymentStatus === 'progress');

  if (isPending && paymentExpiresAtMillis && paymentExpiresAtMillis <= Date.now()) {
    await applyMulticardOrderUpdate(orderId, {
      status: 'expired',
      paymentStatus: 'expired',
      expiredAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const expiredSnapshot = await orderRef.get();
    const expiredData = expiredSnapshot.data() || {};

    return res.status(200).json({
      success: true,
      orderId,
      status: expiredData.status || 'expired',
      paymentStatus: expiredData.paymentStatus || 'expired',
      payTransactionId: expiredData.payTransactionId || null,
      voucherCode: expiredData.voucherCode || null,
      multicard: expiredData.multicard || null,
    });
  }

  return res.status(200).json({
    success: true,
    orderId,
    status: data.status || null,
    paymentStatus: data.paymentStatus || null,
    payTransactionId: data.payTransactionId || null,
    voucherCode: data.voucherCode || null,
    multicard: data.multicard || null,
  });
});

router.post('/multicard/callback/success', async (req, res) => {
  try {
    const payload = req.body || {};
    const invoiceId = String(payload.invoice_id || '');

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MULTICARD_CALLBACK_INVALID',
          message: 'invoice_id is required',
        },
      });
    }

    const orderSnapshot = await admin.firestore().collection('orders').doc(invoiceId).get();
    const orderData = orderSnapshot.data() || {};
    const paymentEnvironment = normalizePaymentEnvironment(orderData.paymentEnvironment);

    const isValid = verifyMulticardSuccessSignature({
      storeId: payload.store_id,
      invoiceId,
      amount: payload.amount,
      sign: payload.sign,
      environment: paymentEnvironment,
    });

    if (!isValid) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'MULTICARD_INVALID_SIGN',
          message: 'Invalid callback signature',
        },
      });
    }

    await applyMulticardOrderUpdate(invoiceId, {
      status: 'paid',
      paymentStatus: 'success',
      payProvider: 'multicard',
      payTransactionId: payload.uuid || null,
      paidAt: payload.payment_time || null,
      payerPhone: payload.phone || null,
      receiptUrl: payload.receipt_url || null,
      multicard: {
        invoiceUuid: payload.uuid || null,
        invoiceId,
        billingId: payload.billing_id || null,
        paymentSystem: payload.ps || null,
        cardPan: payload.card_pan || null,
        cardToken: payload.card_token || null,
        lastSuccessCallbackAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('multicard success callback error', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'MULTICARD_CALLBACK_PROCESSING_FAILED',
        message: 'Failed to process success callback',
      },
    });
  }
});

router.post('/multicard/callback/webhook', async (req, res) => {
  try {
    const payload = req.body || {};
    const invoiceId = String(payload.invoice_id || payload.store_invoice_id || '');

    if (!invoiceId) {
      return res.status(400).json({ success: false });
    }

    const orderSnapshot = await admin.firestore().collection('orders').doc(invoiceId).get();
    const orderData = orderSnapshot.data() || {};
    const paymentEnvironment = normalizePaymentEnvironment(orderData.paymentEnvironment);

    const isValid = verifyMulticardWebhookSignature({
      uuid: String(payload.uuid || ''),
      invoiceId,
      amount: payload.amount || payload.payment_amount || 0,
      sign: payload.sign,
      environment: paymentEnvironment,
    });

    if (!isValid) {
      return res.status(403).json({ success: false });
    }

    const rawStatus = String(payload.status || 'draft');
    const orderStatus = mapWebhookStatusToOrderStatus(rawStatus);

    await applyMulticardOrderUpdate(invoiceId, {
      status: orderStatus,
      paymentStatus: rawStatus,
      payProvider: 'multicard',
      payTransactionId: payload.uuid || null,
      paidAt: rawStatus === 'success' ? payload.payment_time || null : null,
      payerPhone: payload.phone || null,
      receiptUrl: payload.receipt_url || null,
      multicard: {
        invoiceUuid: payload.uuid || null,
        invoiceId,
        billingId: payload.billing_id || null,
        paymentSystem: payload.ps || null,
        cardPan: payload.card_pan || null,
        cardToken: payload.card_token || null,
        rawStatus,
        lastWebhookAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('multicard webhook error', error);
    return res.status(500).json({ success: false });
  }
});

export default router;
