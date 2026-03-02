import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import telegramAuthRoutes from './routes/telegramAuth.routes';
import { initFirebaseAdmin } from './config/firebaseAdmin';

dotenv.config();
initFirebaseAdmin();

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../public')));

app.get('/telegram-login.html', (req, res) => {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return res.status(500).send('TELEGRAM_BOT_USERNAME is not configured');
  }

  const htmlPath = path.resolve(__dirname, '../public/telegram-login.html');
  const html = fs.readFileSync(htmlPath, 'utf8').replace(/__TELEGRAM_BOT_USERNAME__/g, botUsername);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

app.use(telegramAuthRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(port, () => {
  console.log(`Telegram auth server listening on :${port}`);
});
