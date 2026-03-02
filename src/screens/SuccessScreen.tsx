import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOrder } from '../context/OrderContext';
import { Navigation } from '../navigation/Navigation';
import { Routes } from '../navigation';
import { Typography } from "../theme/typography";
import { useLocalization } from '../context/LocalizationContext';

// import QRCode from 'react-native-qrcode-svg'; // <-- если нужен QR

const BRAND = '#E53935';
const BRAND_SOFT = '#E53935';

const SuccessScreen = () => {
  const { language } = useLocalization();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { order, resetOrder } = useOrder();
  const { voucher, partnerName } = order || {};
  const voucherCode = (order as any)?.voucherCode;
  const orderId: string | undefined = route?.params?.orderId;

  const copy = {
    ru: {
      title: 'Подарок готов 🎉', subtitle: 'Ваша персональная ссылка и код ваучера созданы.', voucher: 'Ваучер', voucherCode: 'Код ваучера', share: 'Поделиться ссылкой', copyLink: 'Скопировать ссылку', home: 'На главную', shareFail: 'Не удалось поделиться', tryAgain: 'Попробуйте ещё раз.', linkCopied: 'Ссылка скопирована', linkCopiedDesc: 'Отправьте её получателю в любом мессенджере.', codeCopied: 'Код скопирован', codeCopiedDesc: 'Покажите этот код на кассе.', currency: 'сум',
    },
    uz: {
      title: 'Sovg‘a tayyor 🎉', subtitle: 'Shaxsiy havolangiz va vaucher kodingiz yaratildi.', voucher: 'Vaucher', voucherCode: 'Vaucher kodi', share: 'Havolani ulashish', copyLink: 'Havolani nusxalash', home: 'Bosh sahifaga', shareFail: 'Ulashib bo‘lmadi', tryAgain: 'Qayta urinib ko‘ring.', linkCopied: 'Havola nusxalandi', linkCopiedDesc: 'Uni qabul qiluvchiga messenjerda yuboring.', codeCopied: 'Kod nusxalandi', codeCopiedDesc: 'Ushbu kodni kassada ko‘rsating.', currency: 'soʻm',
    },
    en: {
      title: 'Gift is ready 🎉', subtitle: 'Your personal link and voucher code have been created.', voucher: 'Voucher', voucherCode: 'Voucher Code', share: 'Share link', copyLink: 'Copy link', home: 'Go home', shareFail: 'Unable to share', tryAgain: 'Please try again.', linkCopied: 'Link copied', linkCopiedDesc: 'Send it to the recipient in any messenger.', codeCopied: 'Code copied', codeCopiedDesc: 'Show this code at checkout.', currency: 'UZS',
    },
  }[language];

  // Показываем людям короткий, «говорящий» код
  const humanCode = voucherCode ?? '—';

  const shareLink = orderId
    ? `https://voucherly.uz/gift/?orderId=${orderId}`
    : '';

  const handleShare = async () => {
    if (!shareLink) return;
    try {
      const message =
        `🎁 Voucherly\n\n${shareLink}\n\n${copy.voucherCode}: ${humanCode}`;
      await Share.share({ message });
    } catch (err) {
      Alert.alert(copy.shareFail, copy.tryAgain);
    }
  };

  const handleCopy = () => {
    if (!shareLink) return;
    Clipboard.setString(shareLink);
    Alert.alert(copy.linkCopied, copy.linkCopiedDesc);
  };

  const handleCopyCode = () => {
    if (!humanCode || humanCode === '—') return;
    Clipboard.setString(humanCode);
    Alert.alert(copy.codeCopied, copy.codeCopiedDesc);
  };

  const goHome = () => {
    resetOrder();
    Navigation.navigate(Routes.Main);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFECE8', '#F7F7F7']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topTint}
      />

      <View style={styles.header}>
        <View style={styles.successIconWrap}>
          <Ionicons name="sparkles-outline" size={24} color={BRAND_SOFT} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.logoStub}>
            {voucher?.imageUrl ? (
              <Image
                source={{ uri: voucher.imageUrl }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="gift-outline" size={26} color={BRAND_SOFT} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{partnerName || voucher?.title || copy.voucher}</Text>
            <Text style={styles.amount}>
              {voucher?.price
                ? `${voucher.price.toLocaleString(language === 'uz' ? 'uz-UZ' : language === 'en' ? 'en-US' : 'ru-RU')} ${copy.currency}`
                : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>{copy.voucherCode}</Text>
          <View style={styles.codeRow}>
            <View style={styles.codePill}>
              <Ionicons name="pricetag-outline" size={16} color={BRAND_SOFT} />
              <Text style={styles.codeText}>{humanCode}</Text>
            </View>
            <TouchableOpacity onPress={handleCopyCode} style={styles.codeCopy}>
              <Ionicons name="copy-outline" size={18} color={BRAND_SOFT} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn, !orderId && styles.disabledBtn]}
            onPress={handleShare}
            disabled={!orderId}
            activeOpacity={0.9}
          >
            <Ionicons name="share-social-outline" size={18} color="#fff" />
            <Text style={styles.primaryText}>{copy.share}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn, !orderId && styles.disabledBtn]}
            onPress={handleCopy}
            disabled={!orderId}
            activeOpacity={0.9}
          >
            <Ionicons name="link-outline" size={18} color={BRAND_SOFT} />
            <Text style={styles.secondaryText}>{copy.copyLink}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={goHome}
          activeOpacity={0.9}
        >
          <Ionicons name="home-outline" size={18} color="#6C7180" />
          <Text style={styles.homeText}>{copy.home}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: Math.max(insets.bottom + 8, 20) }} />
    </View>
  );
};

const RADIUS = 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 18,
  },
  topTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  header: {
    alignItems: 'center',
    marginTop: 78,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  successIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F4DCD8',
  },
  title: {
    ...Typography.title,
    fontWeight: '800',
    color: '#22242B',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.subtitle,
    color: '#6B707D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  card: {
    marginHorizontal: 2,
    backgroundColor: '#fff',
    borderRadius: RADIUS,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  logoStub: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#FFF3F2',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#20232C' },
  amount: { marginTop: 4, fontSize: 15, fontWeight: '600', color: '#535968' },

  codeBox: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EBF0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  codeLabel: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#8A8F9C',
    fontWeight: '700',
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#FFF4F2',
  },
  codeText: { fontSize: 15, fontWeight: '800', color: BRAND_SOFT, letterSpacing: 1.2, fontFamily: 'Menlo' },
  codeCopy: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4F2',
  },
  actionBtn: {
    marginTop: 14,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actions: {
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: BRAND_SOFT,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  secondaryBtn: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C8CDD6',
  },
  secondaryText: { color: '#3A3F4B', fontSize: 16, fontWeight: '700' },
  disabledBtn: { opacity: 0.45 },

  homeBtn: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F1F3F7',
  },
  homeText: { color: '#616878', fontSize: 15, fontWeight: '600' },
});

export default SuccessScreen;
