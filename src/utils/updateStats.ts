// app/stats/bumpers.ts
import { firestore } from '../firebase/firebase'; // путь подстрой под свой

// Ташкентское "сегодня"
function uzToday() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const uz = new Date(utc + 5 * 3600000);
  const yyyy = uz.getFullYear();
  const mm = String(uz.getMonth() + 1).padStart(2, '0');
  const dd = String(uz.getDate()).padStart(2, '0');
  return { day: `${yyyy}-${mm}-${dd}`, month: `${yyyy}-${mm}` };
}

// ==== Увеличить счётчики ПОЛЬЗОВАТЕЛЕЙ (вызвать один раз при успешной регистрации)
export async function bumpUsers() {
  const db = firestore();
  const { day, month } = uzToday();
  const inc = firestore.FieldValue.increment(1);
  const batch = db.batch();

  batch.set(db.collection('stats_global').doc('summary'), { totalUsers: inc }, { merge: true });
  batch.set(db.collection('stats_daily').doc(day),           { users: inc },      { merge: true });
  batch.set(db.collection('stats_monthly').doc(month),       { users: inc },      { merge: true });

  await batch.commit();
}

// ==== Увеличить счётчики ВАУЧЕРОВ (вызвать после успешного создания заказа/оплаты)
export async function bumpVouchers(partnerNameRaw?: string) {
  const db = firestore();
  const { day, month } = uzToday();
  const inc = firestore.FieldValue.increment(1);
  const batch = db.batch();

  const partnerName = (partnerNameRaw || 'unknown').trim() || 'unknown';

  // глобально / за день / за месяц
  batch.set(db.collection('stats_global').doc('summary'), { totalVouchers: inc }, { merge: true });
  batch.set(db.collection('stats_daily').doc(day),           { vouchers: inc },     { merge: true });
  batch.set(db.collection('stats_monthly').doc(month),       { vouchers: inc },     { merge: true });

  // топ партнёров за месяц
  batch.set(
    db.collection('stats_monthly').doc(month).collection('partners').doc(partnerName),
    { name: partnerName, count: inc },
    { merge: true }
  );

  // распределение по дням внутри месяца
  batch.set(
    db.collection('stats_monthly').doc(month).collection('days').doc(day),
    { vouchers: inc },
    { merge: true }
  );

  await batch.commit();
}