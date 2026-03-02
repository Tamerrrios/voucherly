import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
  Alert,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GradientHeader from '../components/GradientHeader';
import VoucherCodeModal from '../components/VoucherCodeModal';
import Clipboard from '@react-native-clipboard/clipboard';
import { useLocalization } from '../context/LocalizationContext';

type Voucher = {
  id: string;
  partnerName: string;
  image: any;          
  price: number;
  createdAt: string;  
  status: 'active' | 'used';
  code: string;
};

const DUMMY: Voucher[] = [
  {
    id: '1',
    partnerName: 'Café de Paris',
    image: require('../../assets/images/addidas.png'),
    price: 50000,
    createdAt: '2025-06-01',
    status: 'active',
    code: 'VC-WGPJ53',
  },
  {
    id: '2',
    partnerName: 'Burger Hero',
    image: require('../../assets/images/addidas.png'),
    price: 70000,
    createdAt: '2025-05-15',
    status: 'used',
    code: 'VC-7K2M9Q',
  },
];

const SEGMENTS = ['active', 'used'] as const;

const MyVouchersScreen = () => {
  const { language } = useLocalization();
  const [segment, setSegment] = useState<typeof SEGMENTS[number]>('active');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const vouchers = DUMMY; 
  const filtered = useMemo(
    () => vouchers.filter(v => v.status === segment),
    [vouchers, segment]
  );

const copyCode = (code: string) => {
  Clipboard.setString(code);
  Alert.alert(
    language === 'uz' ? 'Tayyor' : language === 'en' ? 'Done' : 'Готово',
    language === 'uz' ? 'Kod nusxalandi ✅' : language === 'en' ? 'Code copied ✅' : 'Код скопирован ✅'
  );
};

  const copy = {
    ru: {
      active: 'Активные',
      used: 'Использованные',
      activeBadge: 'Активен',
      usedBadge: 'Использован',
      received: 'Получен:',
      showCode: 'Показать код',
      title: 'Мои ваучеры',
      noActive: 'Нет активных ваучеров',
      noUsed: 'Нет использованных ваучеров',
      emptyDesc: 'Оформите ваучер — он появится в этом списке.',
      shareText: '🎁 Ваучер для',
      shareEnd: 'Покажите код на кассе или в приложении.',
      currency: 'сум',
    },
    uz: {
      active: 'Faol',
      used: 'Ishlatilgan',
      activeBadge: 'Faol',
      usedBadge: 'Ishlatilgan',
      received: 'Olingan:',
      showCode: 'Kodni ko‘rsatish',
      title: 'Mening vaucherlarim',
      noActive: 'Faol vaucherlar yo‘q',
      noUsed: 'Ishlatilgan vaucherlar yo‘q',
      emptyDesc: 'Vaucher rasmiylashtiring — u shu ro‘yxatda paydo bo‘ladi.',
      shareText: '🎁',
      shareEnd: 'Kodni kassada yoki ilovada ko‘rsating.',
      currency: 'soʻm',
    },
    en: {
      active: 'Active',
      used: 'Used',
      activeBadge: 'Active',
      usedBadge: 'Used',
      received: 'Received:',
      showCode: 'Show code',
      title: 'My Vouchers',
      noActive: 'No active vouchers',
      noUsed: 'No used vouchers',
      emptyDesc: 'Create a voucher and it will appear in this list.',
      shareText: '🎁 Voucher for',
      shareEnd: 'Show the code at checkout or in the app.',
      currency: 'UZS',
    },
  }[language];

  const shareCode = async (code: string, partner: string) => {
    try {
      await Share.share({
        message: `${copy.shareText} ${partner}\n${language === 'uz' ? 'Kod' : language === 'en' ? 'Code' : 'Код'}: ${code}\n${copy.shareEnd}`,
      });
    } catch (e) {
      // no-op
    }
  };

  const renderSegment = () => (
    <View style={styles.segmentWrap}>
      {SEGMENTS.map((key) => {
        const active = key === segment;
        return (
          <Pressable
            key={key}
            onPress={() => setSegment(key)}
            style={[
              styles.segmentBtn,
              active && styles.segmentBtnActive,
            ]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {key === 'active' ? copy.active : copy.used}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderBadge = (status: Voucher['status']) => {
    const meta =
      status === 'active'
        ? { bg: '#ECFDF5', color: '#047857', label: copy.activeBadge }
        : { bg: '#F3F4F6', color: '#6B7280', label: copy.usedBadge };

    return (
      <View style={[styles.badge, { backgroundColor: meta.bg }]}>
        <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
      </View>
    );
  };

  const renderVoucher = ({ item }: { item: Voucher }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {item.partnerName}
          </Text>
          {renderBadge(item.status)}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              {item.price.toLocaleString(language === 'uz' ? 'uz-UZ' : language === 'en' ? 'en-US' : 'ru-RU')} {copy.currency}
            </Text>
          </View>
          <View style={styles.metaCell}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{copy.received} {item.createdAt}</Text>
          </View>
        </View>

        <View style={styles.codeRow}>
          <View style={styles.codeCell}>
            <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
            <Text style={styles.codeText} numberOfLines={1}>
              {item.code}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => copyCode(item.code)}
              hitSlop={10}
            >
              <Ionicons name="copy-outline" size={18} color="#374151" />
            </Pressable>
            <Pressable
              style={styles.iconBtn}
              onPress={() => shareCode(item.code, item.partnerName)}
              hitSlop={10}
            >
              <Ionicons name="share-social-outline" size={18} color="#374151" />
            </Pressable>
          </View>
        </View>

        {item.status === 'active' && (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setSelectedCode(item.code)}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>{copy.showCode}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <GradientHeader title={copy.title} showBackButton />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderVoucher}
        ListHeaderComponent={renderSegment}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="ticket-outline" size={28} color="#E53935" />
            </View>
            <Text style={styles.emptyTitle}>
              {segment === 'active' ? copy.noActive : copy.noUsed}
            </Text>
            <Text style={styles.emptyText}>
              {copy.emptyDesc}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
      />

      <VoucherCodeModal
        visible={!!selectedCode}
        code={selectedCode || ''}
        onClose={() => setSelectedCode(null)}
      />
    </View>
  );
};

export default MyVouchersScreen;

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },

  /* Segment */
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#111827',
    fontWeight: '800',
  },

  /* Card */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 148,
    resizeMode: 'cover',
  },
  content: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  metaCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13.5,
    color: '#374151',
    fontWeight: '600',
  },

  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  codeCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 8,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    height: 34,
    width: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: '#E53935',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});