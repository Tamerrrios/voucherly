export type PaymentEnvironment = 'sandbox' | 'prod';
export type PaymentExecutionMode = 'test' | 'live';
export type PaymentEntryMode = 'direct_checkout' | 'method_selection';

type MulticardEnvironmentConfig = {
  environment: PaymentEnvironment;
  baseUrl: string;
  applicationId: string;
  secret: string;
  storeId: number;
  returnUrlBase: string;
  backendBaseUrl: string;
};

const FUNCTION_PUBLIC_BASE_URL = 'https://us-central1-voucherly-93d61.cloudfunctions.net/api';
const DEFAULT_MULTICARD_SANDBOX_BASE_URL = 'https://dev-mesh.multicard.uz';
const DEFAULT_MULTICARD_PROD_BASE_URL = 'https://mesh.multicard.uz';
const DEFAULT_RETURN_URL_BASE = 'voucherly://payment-return';

export const normalizePaymentEnvironment = (value?: string | null): PaymentEnvironment => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  if (normalized === 'prod' || normalized === 'production' || normalized === 'live') {
    return 'prod';
  }

  return 'sandbox';
};

const sanitizeBaseUrl = (value?: string | null) => String(value || '').trim().replace(/\/$/, '');
const readBoolean = (value?: string | null, fallback = false) => {
  if (value == null || value === '') {
    return fallback;
  }

  return String(value).trim().toLowerCase() === 'true';
};

const getDefaultBackendBaseUrl = () => {
  if (process.env.K_SERVICE) {
    return FUNCTION_PUBLIC_BASE_URL;
  }

  return `http://localhost:${Number(process.env.PORT || 8080)}`;
};

const getValueByEnvironment = (params: {
  environment: PaymentEnvironment;
  sandboxKeys: string[];
  prodKeys: string[];
  fallback?: string;
}) => {
  const keys = params.environment === 'prod' ? params.prodKeys : params.sandboxKeys;

  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return params.fallback;
};

const getStoreIdByEnvironment = (environment: PaymentEnvironment) => {
  const raw = getValueByEnvironment({
    environment,
    sandboxKeys: ['MULTICARD_SANDBOX_STORE_ID', 'MULTICARD_STORE_ID'],
    prodKeys: ['MULTICARD_PROD_STORE_ID', 'MULTICARD_STORE_ID'],
    fallback: '0',
  });

  return Number(raw || 0);
};

export const getPaymentEnvironment = (override?: string | null): PaymentEnvironment =>
  normalizePaymentEnvironment(override ?? process.env.PAYMENT_ENV);

export const isPaymentTestMode = () =>
  String(process.env.PAYMENT_TEST_MODE || process.env.TEST_MODE || '').trim().toLowerCase() ===
  'true';

export const getPaymentExecutionMode = (): PaymentExecutionMode =>
  isPaymentTestMode() ? 'test' : 'live';

export const getMulticardEnvironmentConfig = (
  override?: PaymentEnvironment | null,
): MulticardEnvironmentConfig => {
  const environment = getPaymentEnvironment(override);
  const baseUrl = sanitizeBaseUrl(
    getValueByEnvironment({
      environment,
      sandboxKeys: ['MULTICARD_SANDBOX_BASE_URL', 'MULTICARD_BASE_URL'],
      prodKeys: ['MULTICARD_PROD_BASE_URL', 'MULTICARD_BASE_URL'],
      fallback:
        environment === 'prod'
          ? DEFAULT_MULTICARD_PROD_BASE_URL
          : DEFAULT_MULTICARD_SANDBOX_BASE_URL,
    }),
  );
  const applicationId = getValueByEnvironment({
    environment,
    sandboxKeys: ['MULTICARD_SANDBOX_APPLICATION_ID', 'MULTICARD_APPLICATION_ID'],
    prodKeys: ['MULTICARD_PROD_APPLICATION_ID', 'MULTICARD_APPLICATION_ID'],
    fallback: '',
  }) as string;
  const secret = getValueByEnvironment({
    environment,
    sandboxKeys: ['MULTICARD_SANDBOX_SECRET', 'MULTICARD_SECRET'],
    prodKeys: ['MULTICARD_PROD_SECRET', 'MULTICARD_SECRET'],
    fallback: '',
  }) as string;
  const storeId = getStoreIdByEnvironment(environment);
  const returnUrlBase = sanitizeBaseUrl(
    getValueByEnvironment({
      environment,
      sandboxKeys: ['MULTICARD_SANDBOX_RETURN_URL_BASE', 'MULTICARD_RETURN_URL_BASE'],
      prodKeys: ['MULTICARD_PROD_RETURN_URL_BASE', 'MULTICARD_RETURN_URL_BASE'],
      fallback: DEFAULT_RETURN_URL_BASE,
    }),
  );
  const backendBaseUrl = sanitizeBaseUrl(
    getValueByEnvironment({
      environment,
      sandboxKeys: ['BACKEND_PUBLIC_BASE_URL_SANDBOX', 'BACKEND_PUBLIC_BASE_URL'],
      prodKeys: ['BACKEND_PUBLIC_BASE_URL_PROD', 'BACKEND_PUBLIC_BASE_URL'],
      fallback: getDefaultBackendBaseUrl(),
    }),
  );

  return {
    environment,
    baseUrl,
    applicationId,
    secret,
    storeId,
    returnUrlBase,
    backendBaseUrl,
  };
};

export const getPaymentPublicConfig = (override?: PaymentEnvironment | null) => {
  const paymentEnvironment = getPaymentEnvironment(override);
  const mode = getPaymentExecutionMode();
  const configuredEntryMode = String(process.env.VOUCHERLY_PAYMENT_PAGE_MODE || '')
    .trim()
    .toLowerCase();
  const paymentEntryMode: PaymentEntryMode =
    configuredEntryMode === 'direct_checkout' || configuredEntryMode === 'method_selection'
      ? (configuredEntryMode as PaymentEntryMode)
      : 'direct_checkout';
  const voucherlyPaymentPageEnabled = paymentEntryMode === 'method_selection';

  return {
    provider: 'multicard' as const,
    paymentEnvironment,
    mode,
    paymentEntryMode,
    cardFlow: 'hosted_invoice' as const,
    hostedInvoiceFlowEnabled: true,
    voucherlyPaymentPageEnabled,
    methods: {
      payme: readBoolean(process.env.PAYMENT_METHOD_PAYME_ENABLED, true),
      click: readBoolean(process.env.PAYMENT_METHOD_CLICK_ENABLED, true),
      uzum: readBoolean(process.env.PAYMENT_METHOD_UZUM_ENABLED, true),
      card: readBoolean(process.env.PAYMENT_METHOD_CARD_ENABLED, true),
    },
  };
};
