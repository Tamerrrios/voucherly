import express from 'express';
import { sendOtpSms } from '../services/eskiz.service';
import {
  createOtpRequest,
  maskPhoneNumber,
  OtpLanguage,
  OtpApiError,
  verifyOtpCode,
} from '../services/otp.service';

const router = express.Router();

const sendError = (res: express.Response, error: unknown, fallbackMessage: string) => {
  const apiError =
    error instanceof OtpApiError
      ? error
      : new OtpApiError('OTP_UNKNOWN_ERROR', error instanceof Error ? error.message : fallbackMessage, 400);

  res.status(apiError.status).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  });
};

router.post('/phone/request-otp', async (req, res) => {
  try {
    const phone = String(req.body?.phone || '');
    const language = (req.body?.language === 'uz' ? 'uz' : 'ru') as OtpLanguage;

    const otpRequest = await createOtpRequest(phone, language);
    await sendOtpSms({
      phone: otpRequest.phone,
      code: otpRequest.code,
      language,
      requestId: otpRequest.requestId,
    });

    res.status(200).json({
      success: true,
      requestId: otpRequest.requestId,
      phoneMasked: maskPhoneNumber(otpRequest.phone),
      expiresInSeconds: otpRequest.expiresInSeconds,
    });
  } catch (error) {
    sendError(res, error, 'Failed to request OTP');
  }
});

router.post('/phone/resend-otp', async (req, res) => {
  try {
    const phone = String(req.body?.phone || '');
    const language = (req.body?.language === 'uz' ? 'uz' : 'ru') as OtpLanguage;

    const otpRequest = await createOtpRequest(phone, language, { resend: true });
    await sendOtpSms({
      phone: otpRequest.phone,
      code: otpRequest.code,
      language,
      requestId: otpRequest.requestId,
    });

    res.status(200).json({
      success: true,
      requestId: otpRequest.requestId,
      phoneMasked: maskPhoneNumber(otpRequest.phone),
      expiresInSeconds: otpRequest.expiresInSeconds,
    });
  } catch (error) {
    sendError(res, error, 'Failed to resend OTP');
  }
});

router.post('/phone/verify-otp', async (req, res) => {
  try {
    const phone = String(req.body?.phone || '');
    const requestId = String(req.body?.requestId || '');
    const code = String(req.body?.code || '');

    const result = await verifyOtpCode({
      phone,
      requestId,
      code,
    });

    res.status(200).json({
      success: true,
      customToken: result.customToken,
      isNewUser: result.isNewUser,
      uid: result.uid,
      phone: result.phone,
    });
  } catch (error) {
    sendError(res, error, 'Failed to verify OTP');
  }
});

export default router;
