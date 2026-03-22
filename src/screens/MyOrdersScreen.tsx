import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import 'moment/locale/ru';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Modal from 'react-native-modal';
import Clipboard from '@react-native-clipboard/clipboard';

import { AuthContext } from '../context/AuthContext';
import { Font } from '../theme/typography';
import { useLocalization } from '../context/LocalizationContext';

moment.locale('ru');

type OrderDoc = {
  id: string;
  userId?: string;
  userID?: string;
  partnerId?: string;
  parnertName?: string;
  partnerName?: string;
  partnerImageUrl?: string | null;
  voucher?: { price?: number; imageUrl?: string; title?: string };
  voucherCode?: string;
  createdAt?: any;
  redeemed?: boolean;
  status?: 'paid' | 'redeemed' | 'delivered' | 'processing' | 'canceled' | 'cancelled' | 'expired' | 'used' | 'sent' | string;
};

type WalletTab = 'active' | 'history';

const MyOrdersScreen = () => {
  const { user } = useContext(AuthContext);
  const { t, language } = useLocalization();

  useEffect(() => {
    moment.locale(language === 'ru' ? 'ru' : 'en');
  }, [language]);
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<WalletTab>('active');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>('');

  const enrichOrdersWithPartnerLogos = useCallback(async (items: OrderDoc[]) => {
    const missingPartnerIds = Array.from(
      new Set(
        items
          .filter((item) => !item.partnerImageUrl && item.partnerId)
          .map((item) => item.partnerId as string),
      ),
    );

    if (missingPartnerIds.length === 0) {
      return items;
    }

    const partnerEntries = await Promise.all(
      missingPartnerIds.map(async (partnerId) => {
        try {
          const partnerSnap = await firestore().collection('partners').doc(partnerId).get();
          const partnerImageUrl = (partnerSnap.data() as { imageUrl?: string | null } | undefined)?.imageUrl ?? null;
          return [partnerId, partnerImageUrl] as const;
        } catch {
          return [partnerId, null] as const;
        }
      }),
    );

    const partnerImageMap = Object.fromEntries(partnerEntries);

    return items.map((item) => ({
      ...item,
      partnerImageUrl: item.partnerImageUrl || partnerImageMap[item.partnerId || ''] || null,
    }));
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setRefreshing(true);
      const snap = await firestore()
        .collection('orders')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const fetched = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as OrderDoc[];
      const enriched = await enrichOrdersWithPartnerLogos(fetched);
      setOrders(enriched);
    } catch (e) {
      console.error('Ошибка загрузки заказов', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [enrichOrdersWithPartnerLogos, user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsub = firestore()
      .collection('orders')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        async (snapshot) => {
          const fetched = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as OrderDoc[];
          const enriched = await enrichOrdersWithPartnerLogos(fetched);
          setOrders(enriched);
          setLoading(false);
        },
        (err) => {
          console.error('Ошибка onSnapshot', err);
          setLoading(false);
        },
      );

    return () => unsub();
  }, [enrichOrdersWithPartnerLogos, user]);

  const onRefresh = () => fetchOrders();

  const HISTORY_STATUSES = new Set(['delivered', 'canceled', 'expired', 'used', 'sent']);

  const isHistoryOrder = (item: OrderDoc) => {
    if (typeof item.redeemed === 'boolean') {
      return item.redeemed;
    }

    const normalized = (item.status || '').toLowerCase();
    return HISTORY_STATUSES.has(normalized);
  };

  const isActiveOrder = (item: OrderDoc) => {
    return !isHistoryOrder(item);
  };

  const getHistoryStatusMeta = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return { label: t('wallet.used'), bg: '#EEF0F3', color: '#5B6470' };
      case 'canceled':
        return { label: t('wallet.expired'), bg: '#F2F2F2', color: '#6B7280' };
      default:
        return { label: t('wallet.sent'), bg: '#EEF0F3', color: '#5B6470' };
    }
  };

  const filteredOrders = useMemo(
    () => orders.filter((item) => (tab === 'active' ? isActiveOrder(item) : isHistoryOrder(item))),
    [orders, tab],
  );

  const formatExpiry = (createdAt: any) => {
    if (!createdAt?.toDate) return '—';
    return moment(createdAt.toDate()).add(6, 'months').format('DD MMM YYYY');
  };

  const formatAmount = (price?: number) => {
    if (!price) return '—';
    const locale = language === 'uz' ? 'uz-UZ' : language === 'en' ? 'en-US' : 'ru-RU';
    return `${Number(price).toLocaleString(locale)} ${t('wallet.currency')}`;
  };

  const openRedeemSheet = (code?: string) => {
    setSelectedCode(code || '— — — — — —');
    setSheetVisible(true);
  };

  const onCopyCode = () => {
    if (!selectedCode) return;
    Clipboard.setString(selectedCode);
    Alert.alert(t('wallet.copiedTitle'), t('wallet.copiedMessage'));
  };

  const renderOrder = ({ item }: { item: OrderDoc }) => {
    const partner = item.partnerName || item.parnertName || item.voucher?.title || 'Merchant';
    const partnerLogo = item.partnerImageUrl || item.voucher?.imageUrl || null;
    const amount = formatAmount(item.voucher?.price);
    const date = item.createdAt?.toDate ? moment(item.createdAt.toDate()).format('DD MMM YYYY') : '—';
    const code = item.voucherCode || '— — — — — —';
    const historyStatus = getHistoryStatusMeta(item.status);
    const historyMode = tab === 'history';

    return (
      <Animated.View entering={FadeInUp.duration(320)}>
        <TouchableOpacity activeOpacity={0.96} style={styles.card}>
          <LinearGradient
            colors={['rgba(229,57,53,0.10)', 'rgba(229,57,53,0.03)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardAccent}
          />

          <View style={styles.topRow}>
            <View style={styles.logoWrap}>
              {partnerLogo ? (
                <Image source={{ uri: partnerLogo }} style={styles.logoImage} />
              ) : (
                <LinearGradient
                  colors={['#F0F2F5', '#E8EBF0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoPlaceholder}
                >
                  <Ionicons name="image-outline" size={16} color="#8E96A3" />
                </LinearGradient>
              )}
            </View>

            <View style={styles.partnerCol}>
              <Text style={styles.partnerName} numberOfLines={1}>
                {partner}
              </Text>
              <Text style={styles.categoryText}>{t('wallet.digitalVoucher')}</Text>
            </View>

            {historyMode ? (
              <View style={[styles.statusBadge, { backgroundColor: historyStatus.bg }]}>
                <Text style={[styles.statusText, { color: historyStatus.color }]}>{historyStatus.label}</Text>
              </View>
            ) : (
              <View style={styles.amountCol}>
                <Text style={styles.amount}>{amount}</Text>
                <Text style={styles.remainingLabel}>{t('wallet.remaining')}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>{t('wallet.code')}</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {code}
              </Text>
            </View>
            <View style={[styles.metaCol, styles.metaColRight]}>
              <Text style={styles.metaLabel}>{t('wallet.expires')}</Text>
              <Text style={styles.metaValue}>{formatExpiry(item.createdAt)}</Text>
            </View>
          </View>

          {historyMode ? (
            <Text style={styles.historyDate}>{t('wallet.updated')} {date}</Text>
          ) : (
            <View style={styles.actionRow}>
                <TouchableOpacity activeOpacity={0.9} style={styles.redeemBtn} onPress={() => openRedeemSheet(code)}>
                  <Text style={styles.redeemText}>{t('wallet.redeem')}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} style={styles.shareBtn}>
                  <Ionicons name="share-social-outline" size={16} color="#6B7280" />
                </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t('wallet.title')}</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.addButton}>
          <Ionicons name="add" size={18} color="#5C5A57" />
        </TouchableOpacity>
      </View>

      <View style={styles.segmentWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setTab('active')}
          style={[styles.segmentButton, tab === 'active' && styles.segmentButtonActive]}
        >
          <Text style={[styles.segmentLabel, tab === 'active' && styles.segmentLabelActive]}>{t('wallet.active')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setTab('history')}
          style={[styles.segmentButton, tab === 'history' && styles.segmentButtonActive]}
        >
          <Text style={[styles.segmentLabel, tab === 'history' && styles.segmentLabelActive]}>{t('wallet.history')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#D96E63" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {renderHeader()}

      <FlatList
        data={filteredOrders}
        key={tab}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D96E63']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="wallet-outline" size={26} color="#D96E63" />
            </View>
            <Text style={styles.emptyTitle}>{tab === 'active' ? t('wallet.noActive') : t('wallet.noHistory')}</Text>
            <Text style={styles.emptyText}>
              {tab === 'active'
                ? t('wallet.noActiveDesc')
                : t('wallet.noHistoryDesc')}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <Modal
        isVisible={sheetVisible}
        onBackdropPress={() => setSheetVisible(false)}
        style={styles.sheetModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <View style={styles.sheetCard}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{t('wallet.voucherCode')}</Text>
          <Text style={styles.sheetHint}>{t('wallet.voucherHint')}</Text>

          <View style={styles.sheetCodeBox}>
            <Text style={styles.sheetCode}>{selectedCode}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.sheetPrimaryBtn} onPress={onCopyCode}>
            <Text style={styles.sheetPrimaryText}>{t('wallet.copyCode')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.sheetSecondaryBtn}
            onPress={() => Alert.alert(t('wallet.qrSoonTitle'), t('wallet.qrSoonMessage'))}
          >
            <Text style={styles.sheetSecondaryText}>{t('wallet.showQr')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  headerWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 80,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: Font.bold,
    fontSize: 28,
    color: '#1E1E1E',
    letterSpacing: -0.4,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#ECECEE',
  },
  segmentWrap: {
    marginTop: 14,
    backgroundColor: '#EFF1F4',
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
  },
  segmentButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },
  segmentLabel: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: '#7B8088',
  },
  segmentLabelActive: {
    fontFamily: Font.semibold,
    color: '#31343A',
  },
  listContainer: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 82,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  logoPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerCol: {
    flex: 1,
    paddingRight: 10,
  },
  partnerName: {
    fontFamily: Font.semibold,
    fontSize: 17,
    color: '#1E2228',
  },
  categoryText: {
    fontFamily: Font.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#8C929D',
    marginTop: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
    minWidth: 112,
  },
  amount: {
    fontFamily: Font.bold,
    fontSize: 26,
    color: '#1E2228',
    letterSpacing: -0.7,
  },
  remainingLabel: {
    marginTop: 1,
    fontFamily: Font.regular,
    fontSize: 9,
    color: '#A2A8B2',
    letterSpacing: 0.35,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: Font.semibold,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaColRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontFamily: Font.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#969CA6',
  },
  metaValue: {
    marginTop: 5,
    fontFamily: Font.semibold,
    fontSize: 15,
    color: '#303641',
  },
  historyDate: {
    marginTop: 14,
    fontFamily: Font.regular,
    fontSize: 12,
    color: '#8A909B',
  },
  actionRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  redeemBtn: {
    flex: 1,
    height: 56,
    borderRadius: 30,
    backgroundColor: '#D45E52',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D45E52',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  redeemText: {
    fontFamily: Font.semibold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  shareBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F6F8',
    borderWidth: 1,
    borderColor: '#E7E9ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#E7E9ED',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: Font.bold,
    fontSize: 21,
    color: '#1F2329',
    textAlign: 'center',
  },
  sheetHint: {
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    color: '#707782',
    fontFamily: Font.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  sheetCodeBox: {
    backgroundColor: '#F5F7FA',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetCode: {
    fontFamily: Font.bold,
    fontSize: 24,
    color: '#232832',
    letterSpacing: 1,
  },
  sheetPrimaryBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D45E52',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sheetPrimaryText: {
    color: '#FFFFFF',
    fontFamily: Font.semibold,
    fontSize: 15,
  },
  sheetSecondaryBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F3F5F8',
    borderWidth: 1,
    borderColor: '#E6E9EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSecondaryText: {
    color: '#4A515D',
    fontFamily: Font.medium,
    fontSize: 14,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7F9',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EEE6E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: Font.bold,
    fontSize: 18,
    color: '#232832',
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: Font.regular,
    fontSize: 14,
    color: '#7C828D',
    textAlign: 'center',
  },
});

export default MyOrdersScreen;
