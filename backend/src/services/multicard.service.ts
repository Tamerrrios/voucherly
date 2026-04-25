import crypto from 'crypto';
import {
  getMulticardEnvironmentConfig,
  type PaymentEnvironment,
} from '../config/paymentEnvironment';

type MulticardTokenResponse = {
  token: string;
  expiry?: string;
};

type MulticardInvoiceRequest = {
  amount: number;
  invoiceId: string;
  returnUrl: string;
  callbackUrl: string;
};

type MulticardInvoiceResponse = {
  uuid: string;
  checkout_url: string;
  short_link?: string | null;
  deeplink?: string | null;
  amount: number;
  invoice_id: string;
  store_id: number;
};

type MulticardPartnerPaymentMethod = 'payme' | 'click' | 'uzum';

type MulticardPartnerPaymentRequest = {
  amount: number;
  invoiceId: string;
  callbackUrl: string;
  paymentSystem: MulticardPartnerPaymentMethod;
};

type MulticardPartnerPaymentResponse = {
  uuid: string;
  checkout_url: string;
  short_link?: string | null;
  deeplink?: string | null;
  amount: number;
  invoice_id: string;
  store_id: number;
  payment_system?: string | null;
};

type CachedTokenEntry = {
  token: string;
  expiresAtMs: number;
};

export class MulticardApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, code = 'MULTICARD_REQUEST_FAILED', status = 500) {
    super(message);
    this.name = 'MulticardApiError';
    this.code = code;
    this.status = status;
  }
}

const cachedTokens = new Map<string, CachedTokenEntry>();

const getMulticardConfig = (environment?: PaymentEnvironment | null) =>
  getMulticardEnvironmentConfig(environment);

const getTokenCacheKey = (environment?: PaymentEnvironment | null) => {
  const { environment: resolvedEnvironment, baseUrl, applicationId, storeId } =
    getMulticardConfig(environment);
  return `${resolvedEnvironment}:${baseUrl}:${applicationId}:${storeId}`;
};

const ensureConfigured = (environment?: PaymentEnvironment | null) => {
  const { applicationId, secret, storeId } = getMulticardConfig(environment);

  if (!applicationId || !secret || !storeId) {
    throw new MulticardApiError(
      'Multicard credentials are not configured',
      'MULTICARD_NOT_CONFIGURED',
      500,
    );
  }
};

const buildUrl = (path: string, environment?: PaymentEnvironment | null) => {
  const { baseUrl } = getMulticardConfig(environment);
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

const parseExpiry = (expiry?: string) => {
  if (!expiry) {
    return Date.now() + 23 * 60 * 60 * 1000;
  }

  const normalized = expiry.includes('T') ? expiry : expiry.replace(' ', 'T');
  const parsed = Date.parse(normalized);
  if (Number.isNaN(parsed)) {
    return Date.now() + 23 * 60 * 60 * 1000;
  }

  return parsed;
};

const requestJson = async <T>(
  path: string,
  init: RequestInit,
  environment?: PaymentEnvironment | null,
): Promise<T> => {
  const response = await fetch(buildUrl(path, environment), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  let payload: any = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      (typeof payload === 'string' ? payload : 'Multicard request failed');
    throw new MulticardApiError(message, 'MULTICARD_REQUEST_FAILED', response.status);
  }

  return payload as T;
};

export const getMulticardToken = async (environment?: PaymentEnvironment | null) => {
  ensureConfigured(environment);
  const { applicationId, secret } = getMulticardConfig(environment);
  const cacheKey = getTokenCacheKey(environment);
  const cachedToken = cachedTokens.get(cacheKey) || null;

  if (cachedToken && cachedToken.expiresAtMs - Date.now() > 60 * 1000) {
    return cachedToken.token;
  }

  const payload = await requestJson<MulticardTokenResponse>('/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      application_id: applicationId,
      secret,
    }),
  }, environment);

  cachedTokens.set(cacheKey, {
    token: payload.token,
    expiresAtMs: parseExpiry(payload.expiry),
  });

  return payload.token;
};

export const createMulticardInvoice = async (
  params: MulticardInvoiceRequest & { environment?: PaymentEnvironment | null },
) => {
  ensureConfigured(params.environment);
  const { storeId } = getMulticardConfig(params.environment);
  const token = await getMulticardToken(params.environment);

  const payload = await requestJson<{ success: boolean; data: MulticardInvoiceResponse }>('/payment/invoice', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      store_id: storeId,
      amount: params.amount * 100,
      invoice_id: params.invoiceId,
      return_url: params.returnUrl,
      callback_url: params.callbackUrl,
    }),
  }, params.environment);

  if (!payload?.success || !payload?.data?.checkout_url) {
    throw new MulticardApiError('Multicard did not return checkout_url', 'MULTICARD_INVALID_RESPONSE', 502);
  }

  return payload.data;
};

export const createMulticardPartnerPayment = async (
  params: MulticardPartnerPaymentRequest & { environment?: PaymentEnvironment | null },
) => {
  ensureConfigured(params.environment);
  const { storeId } = getMulticardConfig(params.environment);
  const token = await getMulticardToken(params.environment);

  const payload = await requestJson<{ success: boolean; data: MulticardPartnerPaymentResponse }>(
    '/payment',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        store_id: storeId,
        amount: params.amount * 100,
        invoice_id: params.invoiceId,
        payment_system: params.paymentSystem,
        callback_url: params.callbackUrl,
      }),
    },
    params.environment,
  );

  if (!payload?.success || !payload?.data?.checkout_url) {
    throw new MulticardApiError(
      'Multicard did not return checkout_url for partner page payment',
      'MULTICARD_INVALID_RESPONSE',
      502,
    );
  }

  return payload.data;
};

export const verifyMulticardSuccessSignature = (params: {
  storeId: number | string;
  invoiceId: string;
  amount: number | string;
  sign?: string;
  environment?: PaymentEnvironment | null;
}) => {
  const { secret } = getMulticardConfig(params.environment);
  const expected = crypto
    .createHash('md5')
    .update(`${params.storeId}${params.invoiceId}${params.amount}${secret}`)
    .digest('hex');

  return expected === String(params.sign || '').toLowerCase();
};

export const verifyMulticardWebhookSignature = (params: {
  uuid: string;
  invoiceId: string;
  amount: number | string;
  sign?: string;
  environment?: PaymentEnvironment | null;
}) => {
  const { secret } = getMulticardConfig(params.environment);
  const expected = crypto
    .createHash('sha1')
    .update(`${params.uuid}${params.invoiceId}${params.amount}${secret}`)
    .digest('hex');

  return expected === String(params.sign || '').toLowerCase();
};
