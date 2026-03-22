import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import SupplierHeader from '../components/SupplierHeader';
import VoucherCarousel from '../components/VoucherCarousel';
import FAQSection from '../components/FAQSection';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { getPartnerWithVouchers } from '../api/homeApi';
import LottieView from 'lottie-react-native';
import { useOrder } from '../context/OrderContext';
import BackButton from '../components/BackButton';
import { Navigation } from '../navigation/Navigation';
import { Routes, RootStackProps } from '../navigation/types';
import { Header } from 'react-native/Libraries/NewAppScreen';
import GradientHeader from '../components/GradientHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization } from '../context/LocalizationContext';

const screenWidth = Dimensions.get('window').width;

type Props = RootStackProps<Routes.Supplier>;

const SupplierScreen = ({ route }: Props) => {
  const { language } = useLocalization();
  const { setOrder } = useOrder();
  const { partnerId } = route.params;
  const insets = useSafeAreaInsets();

  const [partner, setPartner] = useState<any>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scale = useSharedValue(1);

  const copy = {
    ru: { partner: 'Партнёр', about: 'О заведении', terms: 'Условия ваучера', contacts: 'Адрес и контакты', call: 'Позвонить', maps: 'Открыть в Maps', site: 'Сайт', buy: 'Купить ваучер', choose: 'Выберите ваучер', shareTail: 'в Voucherly — купи ваучер и порадуй близких!' },
    uz: { partner: 'Hamkor', about: 'Muassasa haqida', terms: 'Vaucher shartlari', contacts: 'Manzil va aloqa', call: 'Qo‘ng‘iroq qilish', maps: 'Mapsda ochish', site: 'Sayt', buy: 'Vaucher sotib olish', choose: 'Vaucher tanlang', shareTail: 'Voucherly’da — vaucher olib yaqinlaringizni xursand qiling!' },
    en: { partner: 'Partner', about: 'About venue', terms: 'Voucher terms', contacts: 'Address and contacts', call: 'Call', maps: 'Open in Maps', site: 'Website', buy: 'Buy voucher', choose: 'Choose voucher', shareTail: 'on Voucherly — buy a voucher and delight your loved ones!' },
  }[language];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const data = await getPartnerWithVouchers(partnerId);
        setPartner(data);

        // если один ваучер — выбираем его автоматически
        if (data?.vouchers?.length === 1) {
          const v = data.vouchers[0];
          setSelectedVoucher(v);
          setOrder({
            voucher: v,
            partnerId: partnerId,
            partnerName: data?.name,
            partnerImageUrl: data?.imageUrl ?? null,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [partnerId, setOrder]);

  const minPrice = useMemo(() => {
    if (!partner?.vouchers?.length) return null;
    const nums = partner.vouchers
      .map((v: any) => Number(v?.price || v?.amount || 0))
      .filter((n: number) => !Number.isNaN(n) && n > 0);
    if (!nums.length) return null;
    return Math.min(...nums);
  }, [partner]);

  const handleVoucherFocus = (voucher: any) => {
    setSelectedVoucher(voucher);
    setOrder({
      voucher: voucher,
      partnerId: voucher.partnerId ?? partnerId,
      partnerName: partner?.name,
      partnerImageUrl: partner?.imageUrl ?? null,
    });
  };

  const onShare = async () => {
    try {
      const url = partner?.shareUrl || 'https://voucherly.uz';
      await Share.share({
        message: `${partner?.name ?? copy.partner} ${copy.shareTail} ${url}`,
      });
    } catch (e) {
      // ignore
    }
  };

  const callPhone = () => {
    if (!partner?.phone) return;
    Linking.openURL(`tel:${partner.phone}`);
  };

  const openMaps = () => {
    const addr = partner?.address;
    if (!addr) return;
    const q = encodeURIComponent(addr);
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  };

  if (loading || !partner) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={require('../../assets/animations/loader.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.customHeader,
          {
            paddingTop:
              insets.top ||
              (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => Navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text style={styles.customHeaderTitle} numberOfLines={1}>
          {partner?.name || 'Voucherly'}
        </Text>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={onShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="share-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Витрина ваучеров */}
        <VoucherCarousel
          vouchers={partner.vouchers}
          onFocus={handleVoucherFocus}
          partnerName={partner.name}
          partnerIcon={partner.imageUrl} // если есть
          showImages={false}            // оставить фирменный градиент
        // gradientColors={['#D32F2F','#FF7043']} // опционально сменить под бренд
        />
        {/* <VoucherCarousel vouchers={partner.vouchers} onFocus={handleVoucherFocus} /> */}

        <View style={styles.separator} />

        {/* О заведении */}
        {!!partner?.description && (
          <SectionCard title={copy.about}>
            <Text style={styles.body}>{partner.description}</Text>
          </SectionCard>
        )}

        {/* Условия ваучера (без возвратов) */}
        {(partner?.terms || selectedVoucher?.terms)?.length ? (
          <SectionCard title={copy.terms}>
            {((partner?.terms || selectedVoucher?.terms) as string[]).map((t: string, idx: number) => (
              <View key={`${t}-${idx}`} style={styles.bulletRow}>
                <View style={styles.dot} />
                <Text style={styles.body}>{t}</Text>
              </View>
            ))}
          </SectionCard>
        ) : null}
        {/* Адрес и контакты */}
        {(partner?.address || partner?.phone || partner?.instagram || partner?.website) && (
          <SectionCard title={copy.contacts}>
            {partner?.address ? <Text style={styles.body}>{partner.address}</Text> : null}
            <View style={styles.row}>
              {partner?.phone ? (
                <TouchableOpacity style={styles.linkBtn} onPress={callPhone}>
                  <Text style={styles.linkBtnText}>{copy.call}</Text>
                </TouchableOpacity>
              ) : null}
              {partner?.address ? (
                <TouchableOpacity style={styles.linkBtn} onPress={openMaps}>
                  <Text style={styles.linkBtnText}>{copy.maps}</Text>
                </TouchableOpacity>
              ) : null}
              {partner?.instagram ? (
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => Linking.openURL(partner.instagram)}
                >
                  <Text style={styles.linkBtnText}>Instagram</Text>
                </TouchableOpacity>
              ) : null}
              {partner?.website ? (
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => Linking.openURL(partner.website)}
                >
                  <Text style={styles.linkBtnText}>{copy.site}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </SectionCard>
        )}

        {/* FAQ */}
        <View style={styles.separator} />
        <FAQSection />

        {/* Отступ под кнопку */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA */}
      <Animated.View
        style={[
          styles.buyButtonWrapper,
          { bottom: Math.max(insets.bottom + 12, 20) },
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          style={[styles.buyButton, !selectedVoucher && styles.buyBtnDisabled]}
          onPressIn={() => selectedVoucher && (scale.value = withSpring(0.95))}
          onPressOut={() => selectedVoucher && (scale.value = withSpring(1))}
          onPress={() =>
            selectedVoucher &&
            Navigation.navigate(Routes.MediaScreen, { voucherId: selectedVoucher.id })
          }
          disabled={!selectedVoucher}
        >
          {selectedVoucher && <Text style={styles.buyEmoji}>🎁</Text>}
          <Text style={styles.buyButtonText}>
            {selectedVoucher ? copy.buy : copy.choose}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

/* ----------------- Внутренние мини-компоненты ----------------- */

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={{ marginTop: 8 }}>{children}</View>
  </View>
);

/* ----------------- Стили ----------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F7',
  },
  customHeader: {
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEF',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F7',
  },
  customHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    fontSize: 19,
    fontWeight: '700',
    color: '#1F1F22',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E6E7EB',
    marginVertical: 12,
    marginHorizontal: 20,
  },

  /* Cards */
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFEFF2',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 9,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#232327' },
  body: { fontSize: 14, color: '#4E4F57', lineHeight: 21 },

  /* Bullets */
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E3554B', marginRight: 9, marginTop: 8 },

  /* Badges */
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  badgeText: { fontSize: 12, color: '#333', fontWeight: '600' },

  /* CTA */
  buyButtonWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10,
  },
  buyButton: {
    backgroundColor: '#E53935',
    minHeight: 58,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  buyBtnDisabled: { backgroundColor: '#D1D1D1' },
  buyEmoji: {
    fontSize: 21,
    lineHeight: 22,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  /* Loader */
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  lottie: {
    width: 100,
    height: 100,
  },

  /* Share button */
  shareBtnWrap: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  shareBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  /* Links */
  row: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  linkBtn: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 14, backgroundColor: '#F2F3F5' },
  linkBtnText: { color: '#3A3B42', fontWeight: '600' },
});

export default SupplierScreen;
