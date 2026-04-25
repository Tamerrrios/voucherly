import { normalizePhoneNumber, OtpApiError } from '../services/otp.service';

type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};

type ValidationResult =
  | {
      ok: true;
      data: Record<string, any>;
    }
  | {
      ok: false;
      issues: ValidationIssue[];
    };

const OPTIONAL_NULL_FIELDS = [
  'senderName',
  'comment',
  'imageUrl',
  'attachedImage',
  'mediaImageUrl',
  'audioUrl',
  'receiverPhone',
  'userEmail',
  'userName',
  'partnerImageUrl',
  'voucherCode',
  'returnUrl',
  'callbackUrl',
] as const;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeNullableString = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const readNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
};

export const validateCheckoutSessionPayload = (input: unknown): ValidationResult => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      issues: [
        {
          field: 'body',
          code: 'required',
          message: 'Checkout payload must be an object',
        },
      ],
    };
  }

  const payload = { ...(input as Record<string, any>) };
  const issues: ValidationIssue[] = [];
  payload.userId = normalizeNullableString(payload.userId);

  if (!isNonEmptyString(payload.userId)) {
    issues.push({
      field: 'userId',
      code: 'required',
      message: 'userId is required',
    });
  } else {
    payload.userId = payload.userId.trim();
  }

  if (!isNonEmptyString(payload.checkoutSessionId)) {
    issues.push({
      field: 'checkoutSessionId',
      code: 'required',
      message: 'checkoutSessionId is required',
    });
  } else {
    payload.checkoutSessionId = payload.checkoutSessionId.trim();
  }

  if (!isNonEmptyString(payload.partnerId)) {
    issues.push({
      field: 'partnerId',
      code: 'required',
      message: 'partnerId is required',
    });
  } else {
    payload.partnerId = payload.partnerId.trim();
  }

  if (!isNonEmptyString(payload.partnerName)) {
    issues.push({
      field: 'partnerName',
      code: 'required',
      message: 'partnerName is required',
    });
  } else {
    payload.partnerName = payload.partnerName.trim();
  }

  if (!payload.voucher || typeof payload.voucher !== 'object' || Array.isArray(payload.voucher)) {
    issues.push({
      field: 'voucher',
      code: 'required',
      message: 'voucher is required',
    });
  } else {
    payload.voucher = { ...(payload.voucher as Record<string, any>) };

    if (!isNonEmptyString(payload.voucher.id)) {
      issues.push({
        field: 'voucher.id',
        code: 'required',
        message: 'voucher.id is required',
      });
    } else {
      payload.voucher.id = payload.voucher.id.trim();
    }

    if (!isNonEmptyString(payload.voucher.title)) {
      issues.push({
        field: 'voucher.title',
        code: 'required',
        message: 'voucher.title is required',
      });
    } else {
      payload.voucher.title = payload.voucher.title.trim();
    }

    const voucherPrice = readNumber(payload.voucher.price);
    if (!Number.isFinite(voucherPrice) || voucherPrice <= 0) {
      issues.push({
        field: 'voucher.price',
        code: 'invalid',
        message: 'voucher.price must be a positive number',
      });
    } else {
      payload.voucher.price = voucherPrice;
    }

    payload.voucher.imageUrl = normalizeNullableString(payload.voucher.imageUrl);
    if (payload.voucher.validityDays !== undefined && payload.voucher.validityDays !== null) {
      const voucherValidityDays = readNumber(payload.voucher.validityDays);
      if (!Number.isFinite(voucherValidityDays) || voucherValidityDays <= 0) {
        issues.push({
          field: 'voucher.validityDays',
          code: 'invalid',
          message: 'voucher.validityDays must be a positive number',
        });
      } else {
        payload.voucher.validityDays = voucherValidityDays;
      }
    }
    payload.voucher.stock =
      payload.voucher.stock === undefined || payload.voucher.stock === null
        ? null
        : payload.voucher.stock;
  }

  const amount = readNumber(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    issues.push({
      field: 'amount',
      code: 'invalid',
      message: 'amount must be a positive number',
    });
  } else {
    payload.amount = amount;
  }

  const total = readNumber(payload.total);
  if (!Number.isFinite(total) || total < 0) {
    issues.push({
      field: 'total',
      code: 'invalid',
      message: 'total must be a non-negative number',
    });
  } else {
    payload.total = total;
  }

  if (Number.isFinite(amount) && Number.isFinite(total) && total < amount) {
    issues.push({
      field: 'total',
      code: 'invalid',
      message: 'total must be greater than or equal to amount',
    });
  }

  if (
    payload.voucher &&
    typeof payload.voucher === 'object' &&
    Number.isFinite(readNumber(payload.voucher.price)) &&
    Number.isFinite(amount) &&
    readNumber(payload.voucher.price) !== amount
  ) {
    issues.push({
      field: 'voucher.price',
      code: 'mismatch',
      message: 'voucher.price must match amount',
    });
  }

  if (!isNonEmptyString(payload.currency)) {
    issues.push({
      field: 'currency',
      code: 'required',
      message: 'currency is required',
    });
  } else {
    payload.currency = payload.currency.trim().toUpperCase();
    if (payload.currency !== 'UZS') {
      issues.push({
        field: 'currency',
        code: 'unsupported',
        message: 'currency must be UZS',
      });
    }
  }

  if (payload.voucherValidityDays !== undefined && payload.voucherValidityDays !== null) {
    const voucherValidityDays = readNumber(payload.voucherValidityDays);
    if (!Number.isFinite(voucherValidityDays) || voucherValidityDays <= 0) {
      issues.push({
        field: 'voucherValidityDays',
        code: 'invalid',
        message: 'voucherValidityDays must be a positive number',
      });
    } else {
      payload.voucherValidityDays = voucherValidityDays;
    }
  }

  if (!isNonEmptyString(payload.platform)) {
    issues.push({
      field: 'platform',
      code: 'required',
      message: 'platform is required',
    });
  } else {
    payload.platform = payload.platform.trim();
  }

  for (const field of OPTIONAL_NULL_FIELDS) {
    payload[field] = normalizeNullableString(payload[field]);
  }

  if (payload.receiverPhone) {
    try {
      payload.receiverPhone = normalizePhoneNumber(payload.receiverPhone);
    } catch (error) {
      const message =
        error instanceof OtpApiError
          ? error.message
          : 'receiverPhone must be a valid Uzbekistan phone number';

      issues.push({
        field: 'receiverPhone',
        code: 'invalid',
        message,
      });
    }
  }

  payload.fee = Number.isFinite(readNumber(payload.fee)) ? readNumber(payload.fee) : 0;

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
    };
  }

  return {
    ok: true,
    data: payload,
  };
};
