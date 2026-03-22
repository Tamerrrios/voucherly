import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { initFirebaseAdmin } from './config/firebaseAdmin';
import authRoutes from './routes/auth.routes';
import paymentRoutes from './routes/payments.routes';

dotenv.config();
initFirebaseAdmin();

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/auth', authRoutes);
app.use('/payments', paymentRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(port, () => {
  console.log(`Backend server listening on :${port}`);
});
