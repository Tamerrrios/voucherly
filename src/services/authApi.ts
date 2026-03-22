import { Platform } from 'react-native';

const DEV_BACKEND_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
});

const BASE_URL = DEV_BACKEND_URL;

type OtpLanguage = 'ru' | 'uz';

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class AuthApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
  }
}

const parseApiError = async (response: Response) => {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return new AuthApiError(payload?.error?.message || 'Request failed', payload?.error?.code);
  } catch {
    return new AuthApiError('Request failed');
  }
};

export const requestPhoneOtp = async (params: {
  phone: string;
  language: OtpLanguage;
}) => {
  const response = await fetch(`${BASE_URL}/auth/phone/request-otp`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as {
    success: true;
    requestId: string;
    phoneMasked: string;
    expiresInSeconds: number;
  };
};

export const resendPhoneOtp = async (params: {
  phone: string;
  language: OtpLanguage;
}) => {
  const response = await fetch(`${BASE_URL}/auth/phone/resend-otp`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as {
    success: true;
    requestId: string;
    phoneMasked: string;
    expiresInSeconds: number;
  };
};

export const verifyPhoneOtp = async (params: {
  phone: string;
  requestId: string;
  code: string;
}) => {
  const response = await fetch(`${BASE_URL}/auth/phone/verify-otp`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as {
    success: true;
    customToken: string;
    isNewUser: boolean;
    uid: string;
    phone: string;
  };
};
