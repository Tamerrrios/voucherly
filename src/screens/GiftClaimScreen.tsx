// src/screens/GiftClaimScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../navigation/Navigation';
import { Routes } from '../navigation/types';
import { useLocalization } from '../context/LocalizationContext';

type GiftDoc = {
  userID?: string;
  comment?: string;
  partnerName?: string;
  voucher?: { price?: number; imageUrl?: string; title?: string };
  imageUrl?: string;        // user attached image
  attachedImage?: string;
  mediaImageUrl?: string;
  voucherCode?: string;     // "VC-ABC123"
  expiresAt?: FirebaseFirestoreTypes.Timestamp | null;
  status?: string;          // optional
  claimedBy?: string | null;
};

const GiftClaimScreen: React.FC = () => {
  const { language } = useLocalization();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const orderId: string | undefined = route?.params?.orderId;
  const [loading, setLoading] = useState(true);
  const [gift, setGift] = useState<GiftDoc | null>(null);
  const [claiming, setClaiming] = useState(false);

  const copy = {
    ru: { error: 'Ошибка', addFail: 'Не удалось добавить ваучер. Попробуйте позже.', loading: 'Загружаем подарок…', notFound: 'Подарок не найден', checkLink: 'Проверь ссылку или попробуйте позже', title: '🎉 Вам отправлен ваучер', voucher: 'Ваучер', wish: '💬 Пожелание', senderImage: '📷 Изображение от отправителя', voucherCode: 'Код ваучера', addWallet: 'Добавить в мой кошелёк', later: 'Позже', currency: 'сум' },
    uz: { error: 'Xatolik', addFail: 'Vaucher qo‘shib bo‘lmadi. Keyinroq urinib ko‘ring.', loading: 'Sovg‘a yuklanmoqda…', notFound: 'Sovg‘a topilmadi', checkLink: 'Havolani tekshiring yoki keyinroq urinib ko‘ring', title: '🎉 Sizga vaucher yuborildi', voucher: 'Vaucher', wish: '💬 Tilak', senderImage: '📷 Yuboruvchidan rasm', voucherCode: 'Vaucher kodi', addWallet: 'Hamyonimga qo‘shish', later: 'Keyinroq', currency: 'soʻm' },
    en: { error: 'Error', addFail: 'Unable to add voucher. Please try later.', loading: 'Loading gift…', notFound: 'Gift not found', checkLink: 'Check the link or try again later', title: '🎉 You received a voucher', voucher: 'Voucher', wish: '💬 Message', senderImage: '📷 Sender image', voucherCode: 'Voucher code', addWallet: 'Add to my wallet', later: 'Later', currency: 'UZS' },
  }[language];

  useEffect(() => {
    let unsub: (() => void) | null = null;
    const load = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        unsub = firestore()
          .collection('orders')
          .doc(orderId)
          .onSnapshot((doc) => {
            if (doc.exists) setGift(doc.data() as GiftDoc);
            else setGift(null);
            setLoading(false);
          });
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    load();
    return () => { if (unsub) unsub(); };
  }, [orderId]);

  const claim = async () => {
    if (!user?.uid || !orderId || !gift) return;
    try {
      setClaiming(true);

      // 1) Запишем ваучер в кошелёк пользователя
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('vouchers')
        .doc(orderId)
        .set({
          orderId,
          voucherCode: gift.voucherCode ?? null,
          partnerName: gift.partnerName ?? null,
          title: gift.voucher?.title ?? null,
          price: gift.voucher?.price ?? null,
          imageUrl: gift.voucher?.imageUrl ?? null,
          message: gift.comment ?? null,
          mediaImageUrl: senderImageUrl,
          claimedAt: firestore.FieldValue.serverTimestamp(),
          status: 'active',
          expiresAt: gift.expiresAt ?? null,
        });

      // 2) Отметим заказ как «присвоен»
      await firestore().collection('orders').doc(orderId).update({
        claimedBy: user.uid,
        claimedAt: firestore.FieldValue.serverTimestamp(),
        status: 'claimed',
      });

      // 3) Успешный экран / «в кошелёк»
      Navigation.navigate(Routes.MyVouchers);
    } catch (e) {
      console.error(e);
      Alert.alert(copy.error, copy.addFail);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={{ marginTop: 8, color: '#555' }}>{copy.loading}</Text>
      </View>
    );
  }

  if (!gift) {
    return (
      <View style={styles.center}>
        <Text style={{ fontWeight: '700', fontSize: 16 }}>{copy.notFound}</Text>
        <Text style={{ color: '#777', marginTop: 6 }}>{copy.checkLink}</Text>
      </View>
    );
  }

  const amountText = gift.voucher?.price
    ? `${gift.voucher.price.toLocaleString(language === 'uz' ? 'uz-UZ' : language === 'en' ? 'en-US' : 'ru-RU')} ${copy.currency}`
    : '';

  const senderImageUrl = gift.imageUrl || gift.attachedImage || gift.mediaImageUrl || null;

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      {/* Анимация подарка */}
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <LottieView
          source={require('../../assets/animations/giftBox.json')}
          autoPlay
          loop
          style={{ width: 190, height: 190 }}
        />
      </View>

      {/* Карточка с превью */}
      <View style={styles.card}>
        <Text style={styles.h1}>{copy.title}</Text>

        {gift.voucher?.imageUrl ? (
          <ImageBackground
            source={{ uri: gift.voucher.imageUrl }}
            style={styles.cover}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.overlay}>
              {!!amountText && <Text style={styles.amount}>{amountText}</Text>}
              <Text style={styles.title}>{gift.voucher?.title || copy.voucher}</Text>
            </View>
          </ImageBackground>
        ) : null}

        {!!gift.comment && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.subhead}>{copy.wish}</Text>
            <Text style={styles.message}>{gift.comment}</Text>
          </View>
        )}

        {!!senderImageUrl && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.subhead}>{copy.senderImage}</Text>
            <ImageBackground
              source={{ uri: senderImageUrl }}
              style={styles.attach}
              imageStyle={{ borderRadius: 12 }}
            />
          </View>
        )}

        {!!gift.voucherCode && (
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>{copy.voucherCode}: {gift.voucherCode}</Text>
          </View>
        )}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, claiming && { opacity: 0.7 }]}
          onPress={claim}
          disabled={claiming}
        >
          <Text style={styles.primaryText}>{copy.addWallet}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryText}>{copy.later}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GiftClaimScreen;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  h1: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 8 },
  cover: { width: '100%', height: 150, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end' },
  overlay: { padding: 12, backgroundColor: 'rgba(0,0,0,0.35)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  amount: { color: '#fff', fontWeight: '800' },
  title: { color: '#fff', marginTop: 4, fontWeight: '700' },
  subhead: { fontWeight: '700', color: '#444' },
  message: { marginTop: 4, color: '#555', lineHeight: 20 },
  attach: { width: '100%', height: 140, borderRadius: 12, marginTop: 6 },
  badgeRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  badge: { backgroundColor: '#F3F4F6', color: '#111', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  footer: { position: 'absolute', left: 16, right: 16, bottom: 24, gap: 10 },
  primaryBtn: { backgroundColor: '#E53935', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#fff', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  secondaryText: { color: '#333', fontWeight: '600' },
});