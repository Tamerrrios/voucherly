import { Platform } from 'react-native';
import { AuthApiError } from './authApi';

const DEV_BACKEND_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
});

const BASE_URL = DEV_BACKEND_URL;

const parseApiError = async (response: Response) => {
  try {
    const payload = await response.json();
    return new AuthApiError(payload?.error?.message || 'Request failed', payload?.error?.code);
  } catch {
    return new AuthApiError('Request failed');
  }
};

export const createCheckoutSession = async (payload: Record<string, unknown>) => {
  const response = await fetch(`${BASE_URL}/payments/checkout-session`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as {
    success: true;
    orderId: string;
    checkoutUrl: string;
    shortLink: string | null;
    deeplink: string | null;
    invoiceUuid: string;
    returnUrl: string;
  };
};

export const getOrderPaymentStatus = async (orderId: string) => {
  const response = await fetch(`${BASE_URL}/payments/orders/${orderId}/status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as {
    success: true;
    orderId: string;
    status: string | null;
    paymentStatus: string | null;
    payTransactionId: string | null;
    multicard: Record<string, unknown> | null;
  };
};
