import { OtpLanguage } from './otp.service';

const ESKIZ_BASE_URL = process.env.ESKIZ_BASE_URL || 'https://notify.eskiz.uz/api';

let cachedToken: { value: string; expiresAtMs: number } | null = null;

const getSmsText = (language: OtpLanguage, code: string) => {
  if (language === 'uz') {
    return `Voucherly ilovasiga kirish uchun tasdiqlash kodi: ${code}`;
  }

  return `Код подтверждения для входа в приложение Voucherly: ${code}`;
};

const getEskizToken = async () => {
  if (cachedToken && cachedToken.expiresAtMs > Date.now()) {
    return cachedToken.value;
  }

  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;

  if (!email || !password) {
    throw new Error('Eskiz credentials are not configured');
  }

  const body = new FormData();
  body.append('email', email);
  body.append('password', password);

  const response = await fetch(`${ESKIZ_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body,
  });

  const payload = (await response.json()) as {
    data?: { token?: string };
    message?: string;
  };

  const token = payload?.data?.token;

  if (!response.ok || !token) {
    console.error('[ESKIZ_AUTH_FAILED]', {
      status: response.status,
      message: payload?.message || null,
    });
    throw new Error(payload?.message || 'Eskiz auth failed');
  }

  cachedToken = {
    value: token,
    expiresAtMs: Date.now() + 25 * 60 * 1000,
  };

  return token;
};

export const sendOtpSms = async (params: {
  phone: string;
  code: string;
  language: OtpLanguage;
  requestId?: string;
}) => {
  const message = getSmsText(params.language, params.code);
  const isDevMode =
    process.env.NODE_ENV !== 'production' &&
    process.env.ESKIZ_SKIP_SEND === 'true';
  const skipSend =
    process.env.ESKIZ_SKIP_SEND === 'true' ||
    !process.env.ESKIZ_EMAIL ||
    !process.env.ESKIZ_PASSWORD ||
    !process.env.ESKIZ_FROM;

  if (skipSend) {
    if (isDevMode) {
      console.log('[OTP_SMS_DEV]', {
        phone: params.phone,
        requestId: params.requestId ?? null,
        message,
      });
    } else {
      console.log('[OTP_SMS_SKIPPED]', {
        phone: params.phone,
        requestId: params.requestId ?? null,
      });
    }

    return { provider: 'dev', message };
  }

  const attemptSend = async (forceRefreshToken = false) => {
    if (forceRefreshToken) {
      cachedToken = null;
    }

    const token = await getEskizToken();
    const body = new FormData();
    body.append('mobile_phone', params.phone.replace('+', ''));
    body.append('message', message);
    body.append('from', process.env.ESKIZ_FROM as string);

    const response = await fetch(`${ESKIZ_BASE_URL}/message/sms/send`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const payload = await response.json();

    if (response.status === 401 && !forceRefreshToken) {
      return attemptSend(true);
    }

    if (!response.ok) {
      console.error('[ESKIZ_SEND_FAILED]', {
        status: response.status,
        message: payload?.message || null,
        requestId: params.requestId ?? null,
        phone: params.phone,
      });
      throw new Error(payload?.message || 'Eskiz SMS send failed');
    }

    console.log('[OTP_SMS_SENT]', {
      phone: params.phone,
      requestId: params.requestId ?? null,
      provider: 'eskiz',
    });

    return payload;
  };

  try {
    return await attemptSend();
  } catch (error) {
    console.error('[OTP_SMS_SEND_FAILED]', {
      phone: params.phone,
      requestId: params.requestId ?? null,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};
