import { Router } from 'express';
import { admin } from '../config/firebaseAdmin';
import {
  MulticardApiError,
  createMulticardInvoice,
  verifyMulticardSuccessSignature,
  verifyMulticardWebhookSignature,
} from '../services/multicard.service';

const router = Router();

const getBackendBaseUrl = () => {
  const configured = process.env.BACKEND_PUBLIC_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return `http://localhost:${Number(process.env.PORT || 8080)}`;
};

const getReturnUrlBase = () =>
  (process.env.MULTICARD_RETURN_URL_BASE || 'voucherly://payment-return').replace(/\/$/, '');

const buildPendingOrderPayload = (input: Record<string, any>) => ({
  ...input,
  status: 'pending_payment',
  payProvider: 'multicard',
  payTransactionId: null,
  paymentStatus: 'invoice_created',
  shared: false,
  sharedAt: null,
  redeemed: false,
  redeemedAt: null,
  redeemedBy: null,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});

router.post('/checkout-session', async (req, res) => {
  try {
    const db = admin.firestore();
    const ordersRef = db.collection('orders');
    const orderRef = ordersRef.doc();
    const orderId = orderRef.id;

    const amount = Number(req.body?.amount || 0);
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_INVALID_AMOUNT',
          message: 'Payment amount is invalid',
        },
      });
    }

    const backendBaseUrl = getBackendBaseUrl();
    const callbackUrl = `${backendBaseUrl}/payments/multicard/callback/success`;
    const returnUrl = `${getReturnUrlBase()}?orderId=${orderId}`;

    const basePayload = buildPendingOrderPayload({
      ...req.body,
      invoiceId: orderId,
      returnUrl,
      callbackUrl,
    });

    const invoice = await createMulticardInvoice({
      amount,
      invoiceId: orderId,
      returnUrl,
      callbackUrl,
    });

    await orderRef.set(
      {
        ...basePayload,
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
      success: true,
      orderId,
      checkoutUrl: invoice.checkout_url,
      shortLink: invoice.short_link ?? null,
      deeplink: invoice.deeplink ?? null,
      invoiceUuid: invoice.uuid,
      returnUrl,
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

router.get('/orders/:orderId/status', async (req, res) => {
  const orderId = req.params.orderId;
  const snapshot = await admin.firestore().collection('orders').doc(orderId).get();

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
  return res.status(200).json({
    success: true,
    orderId,
    status: data.status || null,
    paymentStatus: data.paymentStatus || null,
    payTransactionId: data.payTransactionId || null,
    multicard: data.multicard || null,
  });
});

router.post('/multicard/callback/success', async (req, res) => {
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

  const isValid = verifyMulticardSuccessSignature({
    storeId: payload.store_id,
    invoiceId,
    amount: payload.amount,
    sign: payload.sign,
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

  await admin.firestore().collection('orders').doc(invoiceId).set(
    {
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
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return res.status(200).json({});
});

router.post('/multicard/callback/webhook', async (req, res) => {
  const payload = req.body || {};
  const invoiceId = String(payload.invoice_id || payload.store_invoice_id || '');

  if (!invoiceId) {
    return res.status(400).json({ success: false });
  }

  const isValid = verifyMulticardWebhookSignature({
    uuid: String(payload.uuid || ''),
    invoiceId,
    amount: payload.amount || payload.payment_amount || 0,
    sign: payload.sign,
  });

  if (!isValid) {
    return res.status(403).json({ success: false });
  }

  const statusMap: Record<string, string> = {
    draft: 'pending_payment',
    progress: 'pending_payment',
    success: 'paid',
    error: 'payment_failed',
    revert: 'cancelled',
  };

  await admin.firestore().collection('orders').doc(invoiceId).set(
    {
      status: statusMap[String(payload.status || 'draft')] || 'pending_payment',
      paymentStatus: payload.status || null,
      payProvider: 'multicard',
      payTransactionId: payload.uuid || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      multicard: {
        invoiceUuid: payload.uuid || null,
        invoiceId,
        rawStatus: payload.status || null,
      },
    },
    { merge: true },
  );

  return res.status(200).json({ success: true });
});

export default router;
