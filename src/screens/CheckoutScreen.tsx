import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  AppState,
  Image,
  Linking,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { firebaseAuth } from '../firebase/firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

import { useOrder } from '../context/OrderContext';
import { Navigation } from '../navigation/Navigation';
import { Routes } from '../navigation/types';
import { uploadImageToFirebaseAlt } from '../api/homeApi';
import { useLocalization } from '../context/LocalizationContext';
import { createCheckoutSession, getOrderPaymentStatus } from '../services/paymentApi';


const FEE_RATE = 0.0;

const COPY = {
  ru: {
    step: 'Шаг 2 из 2',
    headerTitle: 'Подтверждение заказа',
    title: 'Проверьте детали перед оплатой',
    infoTitle: 'Как получатель увидит подарок?',
    infoText: 'После оплаты мы создадим персональную ссылку. Отправьте её в Telegram, WhatsApp, SMS или по e-mail.',
    voucher: 'Ваучер',
    media: '📎 Медиа',
    mediaBoth: 'Изображение + комментарий',
    mediaImage: 'Изображение',
    mediaComment: 'Комментарий',
    summary: '🧾 Резюме',
    amount: 'Сумма',
    fee: 'Комиссия',
    total: 'Итого',
    agreeText: 'Я понимаю, что получателя укажу после оплаты — отправив персональную ссылку.',
    payAndGetLink: 'Перейти к оплате',
    paymentPendingTitle: 'Ожидаем оплату',
    paymentPendingMessage: 'После оплаты вернитесь в приложение. Мы проверим статус автоматически.',
    paymentFailed: 'Оплата не завершена. Попробуйте снова.',
    error: 'Ошибка',
    ok: 'Ок',
    orderDataMissing: 'Данные заказа не найдены.',
    confirmationRequired: 'Требуется подтверждение',
    checkRequired: 'Поставьте галочку.',
    orderFailed: 'Не удалось создать платеж. Попробуйте ещё раз.',
    uploadPhotoTitle: 'Ошибка загрузки фото',
    uploadPhotoMessage: 'Не удалось загрузить фото. Попробуйте снова или продолжите без фото.',
    retryUpload: 'Повторить',
    continueWithoutPhoto: 'Продолжить без фото',
    cancel: 'Отмена',
  },
  uz: {
    step: '2/2-qadam',
    headerTitle: 'Buyurtmani tasdiqlash',
    title: 'To‘lovdan oldin tafsilotlarni tekshiring',
    infoTitle: 'Qabul qiluvchi sovg‘ani qanday ko‘radi?',
    infoText: 'To‘lovdan so‘ng biz shaxsiy havola yaratamiz. Uni Telegram, WhatsApp, SMS yoki e-mail orqali yuboring.',
    voucher: 'Vaucher',
    media: '📎 Media',
    mediaBoth: 'Rasm + izoh',
    mediaImage: 'Rasm',
    mediaComment: 'Izoh',
    summary: '🧾 Xulosa',
    amount: 'Summa',
    fee: 'Komissiya',
    total: 'Jami',
    agreeText: 'Qabul qiluvchini to‘lovdan keyin shaxsiy havolani yuborish orqali ko‘rsatishimni tushunaman.',
    payAndGetLink: 'To‘lovga o‘tish',
    paymentPendingTitle: 'To‘lov kutilmoqda',
    paymentPendingMessage: 'To‘lovdan so‘ng ilovaga qayting. Statusni avtomatik tekshiramiz.',
    paymentFailed: 'To‘lov yakunlanmadi. Qayta urinib ko‘ring.',
    error: 'Xatolik',
    ok: 'OK',
    orderDataMissing: 'Buyurtma ma’lumotlari topilmadi.',
    confirmationRequired: 'Tasdiqlash talab qilinadi',
    checkRequired: 'Belgilash katagiga belgi qo‘ying.',
    orderFailed: 'To‘lovni yaratib bo‘lmadi. Qaytadan urinib ko‘ring.',
    uploadPhotoTitle: 'Rasm yuklash xatosi',
    uploadPhotoMessage: 'Rasmni yuklab bo‘lmadi. Qayta urinib ko‘ring yoki rasmsiz davom eting.',
    retryUpload: 'Qayta urinish',
    continueWithoutPhoto: 'Rasmsiz davom etish',
    cancel: 'Bekor qilish',
  },
  en: {
    step: 'Step 2 of 2',
    headerTitle: 'Order Confirmation',
    title: 'Review details before payment',
    infoTitle: 'How will the recipient see the gift?',
    infoText: 'After payment we create a personal link. Send it via Telegram, WhatsApp, SMS, or email.',
    voucher: 'Voucher',
    media: '📎 Media',
    mediaBoth: 'Image + comment',
    mediaImage: 'Image',
    mediaComment: 'Comment',
    summary: '🧾 Summary',
    amount: 'Amount',
    fee: 'Fee',
    total: 'Total',
    agreeText: 'I understand that I will specify the recipient after payment by sending a personal link.',
    payAndGetLink: 'Proceed to payment',
    paymentPendingTitle: 'Waiting for payment',
    paymentPendingMessage: 'Return to the app after payment. We will re-check the status automatically.',
    paymentFailed: 'Payment was not completed. Please try again.',
    error: 'Error',
    ok: 'OK',
    orderDataMissing: 'Order data not found.',
    confirmationRequired: 'Confirmation required',
    checkRequired: 'Please check the box.',
    orderFailed: 'Could not create payment. Please try again.',
    uploadPhotoTitle: 'Photo upload failed',
    uploadPhotoMessage: 'Could not upload photo. Retry or continue without photo.',
    retryUpload: 'Retry',
    continueWithoutPhoto: 'Continue without photo',
    cancel: 'Cancel',
  },
} as const;


const CheckoutScreen = () => {
  const insets = useSafeAreaInsets();
  const { language } = useLocalization();
  const t = COPY[language];
  const { order } = useOrder();
  const { imageUrl, comment, voucher, partnerName } = order || {};

  const [agree, setAgree] = React.useState(true);
  const subtotal = voucher?.price ?? 0;
  const fee = Math.round(subtotal * FEE_RATE);
  const total = subtotal + fee;
  const [submitting, setSubmitting] = React.useState(false);
  const [pendingOrderId, setPendingOrderId] = React.useState<string | null>(null);


  const generateUniqueVoucherCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const ts = Date.now().toString(36).toUpperCase().slice(-4);
    const rand = Array.from({ length: 4 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
    return `VC-${ts}${rand}`;
  };

  useFocusEffect(
    React.useCallback(() => {
      const check = async () => {
        const user = firebaseAuth.currentUser;
        if (!user) {
          Navigation.navigate(Routes.Login, { returnTo: Routes.Checkout });
        }
      };

      check();
      return undefined;
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && pendingOrderId) {
        try {
          const status = await getOrderPaymentStatus(pendingOrderId);
          if (status.status === 'paid') {
            setPendingOrderId(null);
            Navigation.navigate(Routes.Success, { orderId: pendingOrderId });
          } else if (status.status === 'payment_failed' || status.status === 'cancelled') {
            setPendingOrderId(null);
            Alert.alert(t.error, t.paymentFailed);
          }
        } catch (error) {
          console.log('payment status check failed', error);
        }
      }
    });
    return () => sub.remove();
  }, [pendingOrderId, t.error, t.paymentFailed]);

  const askUploadFallbackAction = () =>
    new Promise<'retry' | 'without' | 'cancel'>((resolve) => {
      Alert.alert(
        t.uploadPhotoTitle,
        t.uploadPhotoMessage,
        [
          { text: t.retryUpload, onPress: () => resolve('retry') },
          { text: t.continueWithoutPhoto, onPress: () => resolve('without') },
          { text: t.cancel, style: 'cancel', onPress: () => resolve('cancel') },
        ],
        { cancelable: false },
      );
    });

const handleConfirm = async () => {
  console.log('ORDER ON CHECKOUT:', order);
  console.log('Checkout imageUrl:', imageUrl);

  if (!order || !voucher) {
    Alert.alert(t.error, t.orderDataMissing);
    return;
  }
  if (!agree) {
    Alert.alert(t.confirmationRequired, t.checkRequired);
    return;
  }

  try {
    setSubmitting(true);
    const user = firebaseAuth.currentUser;
    if (!user) {
      Navigation.navigate(Routes.Login, { returnTo: Routes.Checkout });
      return;
    }

    const userID = user.uid;
    const userEmail = user.email ?? null;
    const userName = (user.displayName ?? '').trim() || null;

    const voucherCode = await generateUniqueVoucherCode();

    // ---- 1. Готовим ссылку на картинку ----
    let attachedImageUrl: string | null = null;

    if (imageUrl) {
      if (/^https?:\/\//.test(imageUrl)) {
        attachedImageUrl = imageUrl;
        console.log({ localUri: imageUrl, attachedImageUrl });
      } else {
        let uploadComplete = false;

        while (!uploadComplete) {
          try {
            attachedImageUrl = await uploadImageToFirebaseAlt(
              imageUrl,
              `orders/${userID}/${voucherCode}`,
            );
            console.log({ localUri: imageUrl, attachedImageUrl });
            uploadComplete = true;
          } catch (err) {
            console.error('IMAGE_UPLOAD_ERROR', err);

            const action = await askUploadFallbackAction();
            if (action === 'retry') {
              continue;
            }
            if (action === 'without') {
              attachedImageUrl = null;
              console.log({ localUri: imageUrl, attachedImageUrl });
              uploadComplete = true;
              break;
            }

            return;
          }
        }
      }
    }

    // ---- 2. Чистим order, убираем локальный imageUrl ----
    const cleanOrder = Object.fromEntries(
      Object.entries(order).filter(
        ([key, v]) => v !== undefined && key !== 'imageUrl',
      ),
    );

    // ---- 3. Фиксируем срез ваучера ----
    const voucherSnap = order?.voucher
      ? {
          id: order.voucher.id,
          title: order.voucher.title,
          price: order.voucher.price,
          imageUrl: order.voucher.imageUrl ?? null,
          stock: order.voucher.stock ?? null,
        }
      : null;

    const payload = {
      ...cleanOrder,
      voucher: voucherSnap ?? cleanOrder.voucher,
      senderName: ((order?.senderName as string | undefined)?.trim()) || 'Анонимный отправитель',

      // Keep both keys for backward compatibility across screens.
      imageUrl: attachedImageUrl,
      attachedImage: attachedImageUrl,
      mediaImageUrl: attachedImageUrl,
      comment: comment?.trim() || null,

      userId: userID,
      userID,
      userEmail,
      userName,

      partnerImageUrl: ((order?.partnerImageUrl as string | undefined) ?? null),

      amount: subtotal,
      fee,
      total,
      currency: 'UZS',
      platform: Platform.OS,

      voucherCode,
    } as const;

    const session = await createCheckoutSession(payload);
    setPendingOrderId(session.orderId);
    Alert.alert(t.paymentPendingTitle, t.paymentPendingMessage);
    await Linking.openURL(session.checkoutUrl);
  } catch (e) {
    console.error('checkout error', e);
    Alert.alert(t.error, t.orderFailed);
  } finally {
    setSubmitting(false);
  }
};

  // const handleConfirm = async () => {
  //   // ★ Доп. защита на всякий случай
  //   if (!verified) {
  //     Alert.alert('Подтверждение email', 'Подтвердите почту, чтобы продолжить.');
  //     return;
  //   }

  //   if (!order || !voucher) {
  //     Alert.alert('Ошибка', 'Данные заказа не найдены.');
  //     return;
  //   }
  //   if (!agree) {
  //     Alert.alert('Требуется подтверждение', 'Поставьте галочку.');
  //     return;
  //   }

  //   try {
  //     const user = firebaseAuth.currentUser;
  //     if (!user) {
  //       Navigation.navigate(Routes.Login, { returnTo: Routes.Checkout });
  //       return;
  //     }

  //     const userID = user.uid;
  //     const userEmail = user.email ?? null;
  //     const userName = (user.displayName ?? '').trim() || null;

  //     const voucherCode = await generateUniqueVoucherCode();

  //     // оставляем только заполненные поля из order
  //     const cleanOrder = Object.fromEntries(
  //       Object.entries(order).filter(([, v]) => v !== undefined)
  //     );

  //     // (опц) зафиксируем срез ваучера в заказе
  //     const voucherSnap = order?.voucher
  //       ? {
  //         id: order.voucher.id,
  //         title: order.voucher.title,
  //         price: order.voucher.price,
  //         imageUrl: order.voucher.imageUrl ?? null,
  //         stock: order.voucher.stock ?? null,
  //       }
  //       : null;

  //     const payload = {
  //       ...cleanOrder,                          // partnerId, partnerName, comment и т.д.
  //       voucher: voucherSnap ?? cleanOrder.voucher, // если уже было — не дублируем

  //       userID,
  //       userEmail,
  //       userName,

  //       amount: subtotal,
  //       fee,
  //       total,
  //       currency: 'UZS',

  //       voucherCode,

  //       // ключевые статусы/метаданные
  //       status: 'paid',                         // paid → refunded/failed → redeemed
  //       shared: false,
  //       sharedAt: null,

  //       redeemed: false,
  //       redeemedAt: null,
  //       redeemedBy: null,

  //       payProvider: null,
  //       payTransactionId: null,

  //       createdAt: firestore.FieldValue.serverTimestamp(),
  //       updatedAt: firestore.FieldValue.serverTimestamp(),
  //     } as const;

  //     const docRef = await firestore().collection('orders').add(payload);
  //     // await bumpVouchers(partnerName);
  //     Navigation.navigate(Routes.Success, { orderId: docRef.id });
  //   } catch (e) {
  //     console.error('checkout error', e);
  //     Alert.alert('Ошибка', 'Не удалось оформить заказ. Попробуйте ещё раз.');
  //   }
  // };

  const payDisabled = !agree || submitting;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerSurface}>
        <View style={styles.headerGlassLayer} pointerEvents="none" />
        <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerTopRow}>
            <BackButton onPress={() => Navigation.goBack()} size={34} iconSize={15} />
            <Text style={styles.headerTitle}>{t.headerTitle}</Text>
            <View style={styles.headerTopSpacer} />
          </View>
          <Text style={styles.stepLabel}>{t.step}</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
        <View style={styles.headerSeparator} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(350)}>
          <Text style={styles.title}>{t.title}</Text>
        </Animated.View>

        {/* Инфоблок */}
        <Animated.View style={styles.info} entering={FadeInUp.delay(80).duration(350)}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#D86559"
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>{t.infoTitle}</Text>
            <Text style={styles.infoText}>{t.infoText}</Text>
          </View>
        </Animated.View>

        {/* Ваучер */}
        <Animated.View style={styles.card} entering={FadeInUp.delay(140).duration(350)}>
          <View style={styles.voucherHead}>
            {!!voucher?.imageUrl && (
              <Image source={{ uri: voucher.imageUrl }} style={styles.voucherThumb} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t.voucher}</Text>
              <Text style={styles.cardValue}>{partnerName}</Text>
            </View>
          </View>
          <Text style={styles.voucherAmount}>{subtotal.toLocaleString('ru-RU')} сум</Text>
        </Animated.View>

        {/* Медиа */}
        {(imageUrl || comment) && (
          <Animated.View style={styles.card} entering={FadeInUp.delay(200).duration(350)}>
            <Text style={styles.cardTitle}>{t.media}</Text>
            <Text style={styles.cardValue}>
              {imageUrl && comment
                ? t.mediaBoth
                : imageUrl
                  ? t.mediaImage
                  : t.mediaComment}
            </Text>
          </Animated.View>
        )}

        {/* Резюме */}
        <Animated.View style={styles.summaryCard} entering={FadeInUp.delay(320).duration(350)}>
          <Text style={styles.cardTitle}>{t.summary}</Text>
          <View style={styles.row}>
            <Text style={styles.muted}>{t.amount}</Text>
            <Text style={styles.bold}>{subtotal.toLocaleString('ru-RU')} сум</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>{t.fee}</Text>
            <Text style={styles.bold}>{fee.toLocaleString('ru-RU')} сум</Text>
          </View>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Text style={styles.totalLabel}>{t.total}</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('ru-RU')} сум</Text>
          </View>
        </Animated.View>

        {/* Чекбокс */}
        <Animated.View style={styles.agree} entering={FadeInUp.delay(380).duration(350)}>
          <TouchableOpacity
            style={[styles.check, agree && styles.checkOn]}
            onPress={() => setAgree((s) => !s)}
            activeOpacity={0.8}
          >
            {agree ? <Text style={styles.checkTick}>✓</Text> : null}
          </TouchableOpacity>
          <Text style={styles.agreeText}>{t.agreeText}</Text>
        </Animated.View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, payDisabled && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={payDisabled} // ★ дизейблим кнопку
          activeOpacity={0.9}
        >
          <Text style={styles.confirmText}>
            {t.payAndGetLink}
          </Text>
        </TouchableOpacity>
        {/* <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !agree && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={!agree}
          activeOpacity={0.9}
        >
          <Text style={styles.confirmText}>Оплатить и получить ссылку</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#F7F7F7' },
  headerSurface: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 7,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  headerInner: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTopSpacer: {
    width: 34,
    height: 34,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7E818A',
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E8E9ED',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#E53935',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#23242A',
  },
  headerSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,126,138,0.25)',
  },
  container: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 24 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#3E424B' },

  info: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFF5F3',
    marginBottom: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#3B3E46' },
  infoText: { marginTop: 6, color: '#70747F', lineHeight: 19, fontSize: 13 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F1F4',
  },
  voucherHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherThumb: {
    width: 54,
    height: 54,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#F2F3F6',
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#7A7E88', marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: '700', color: '#23262E' },
  voucherAmount: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '800',
    color: '#22252D',
  },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F1F4',
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  muted: { color: '#7E838F', fontSize: 15 },
  bold: { fontWeight: '700', color: '#333' },
  totalLabel: { fontSize: 17, fontWeight: '800', color: '#17191F' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#17191F' },

  agree: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, marginBottom: 8 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
    backgroundColor: '#fff',
  },
  checkOn: { backgroundColor: '#E53935', borderColor: '#D96E63' },
  checkTick: { color: '#fff', fontWeight: '800', lineHeight: Platform.OS === 'ios' ? 18 : 16 },
  agreeText: { flex: 1, color: '#4F5562', lineHeight: 20 },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(247,247,247,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E6EB',
  },
  confirmBtn: {
    backgroundColor: '#E53935',
    minHeight: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
});

export default CheckoutScreen;
