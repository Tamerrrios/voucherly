import crypto from 'crypto';

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

type CachedToken = {
  token: string;
  expiresAtMs: number;
} | null;

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

let cachedToken: CachedToken = null;

const getMulticardConfig = () => ({
  baseUrl: (process.env.MULTICARD_BASE_URL || 'https://dev-mesh.multicard.uz').replace(/\/$/, ''),
  applicationId: process.env.MULTICARD_APPLICATION_ID || '',
  secret: process.env.MULTICARD_SECRET || '',
  storeId: Number(process.env.MULTICARD_STORE_ID || 0),
});

const ensureConfigured = () => {
  const { applicationId, secret, storeId } = getMulticardConfig();

  if (!applicationId || !secret || !storeId) {
    throw new MulticardApiError(
      'Multicard credentials are not configured',
      'MULTICARD_NOT_CONFIGURED',
      500,
    );
  }
};

const buildUrl = (path: string) => {
  const { baseUrl } = getMulticardConfig();
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

const requestJson = async <T>(path: string, init: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
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

export const getMulticardToken = async () => {
  ensureConfigured();
  const { applicationId, secret } = getMulticardConfig();

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
  });

  cachedToken = {
    token: payload.token,
    expiresAtMs: parseExpiry(payload.expiry),
  };

  return payload.token;
};

export const createMulticardInvoice = async (params: MulticardInvoiceRequest) => {
  ensureConfigured();
  const { storeId } = getMulticardConfig();
  const token = await getMulticardToken();

  const payload = await requestJson<{ success: boolean; data: MulticardInvoiceResponse }>('/invoice', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      store_id: storeId,
      amount: params.amount,
      invoice_id: params.invoiceId,
      return_url: params.returnUrl,
      callback_url: params.callbackUrl,
    }),
  });

  if (!payload?.success || !payload?.data?.checkout_url) {
    throw new MulticardApiError('Multicard did not return checkout_url', 'MULTICARD_INVALID_RESPONSE', 502);
  }

  return payload.data;
};

export const verifyMulticardSuccessSignature = (params: {
  storeId: number | string;
  invoiceId: string;
  amount: number | string;
  sign?: string;
}) => {
  const { secret } = getMulticardConfig();
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
}) => {
  const { secret } = getMulticardConfig();
  const expected = crypto
    .createHash('sha1')
    .update(`${params.uuid}${params.invoiceId}${params.amount}${secret}`)
    .digest('hex');

  return expected === String(params.sign || '').toLowerCase();
};
