import { Router } from 'express';
import {
  TelegramAuthPayload,
  upsertTelegramFirebaseUser,
  verifyTelegramSignature,
} from '../services/telegramAuth.service';

const router = Router();

router.post('/auth/telegram/verify', async (req, res) => {
  try {
    const payload = req.body as TelegramAuthPayload;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({ error: 'Server misconfigured: TELEGRAM_BOT_TOKEN missing' });
    }

    if (!payload || !payload.id || !payload.auth_date || !payload.hash) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    verifyTelegramSignature(payload, botToken);

    const { customToken } = await upsertTelegramFirebaseUser(payload);
    return res.status(200).json({ customToken });
  } catch (error: any) {
    return res.status(401).json({ error: error?.message || 'Telegram auth verification failed' });
  }
});

export default router;
