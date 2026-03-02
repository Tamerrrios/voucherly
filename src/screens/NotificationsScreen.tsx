import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GradientHeader from '../components/GradientHeader';
import { Colors } from '../theme/colors';
import { Font } from '../theme/typography';
import { useLocalization } from '../context/LocalizationContext';

type NotificationType = 'promo' | 'info' | 'system';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  read: boolean;
  type: NotificationType;
};

const NotificationsScreen: React.FC = () => {
  const { language } = useLocalization();
  const copy = {
    ru: {
      title: 'Уведомления',
      newLabel: 'НОВОЕ',
      loading: 'Загружаем уведомления…',
      emptyTitle: 'Пока уведомлений нет',
      emptyText: 'Как только появятся акции, новости или подарки — мы обязательно сообщим вам здесь.',
      welcomeTitle: '🎁 Добро пожаловать в Voucherly',
      welcomeBody: 'Дарите ваучеры друзьям и близким — первый подарок уже ждёт вас внутри приложения.',
      locale: 'ru-RU',
    },
    uz: {
      title: 'Bildirishnomalar',
      newLabel: 'YANGI',
      loading: 'Bildirishnomalar yuklanmoqda…',
      emptyTitle: 'Hozircha bildirishnomalar yo‘q',
      emptyText: 'Aksiyalar, yangiliklar yoki sovg‘alar paydo bo‘lsa — shu yerda xabar beramiz.',
      welcomeTitle: '🎁 Voucherly’ga xush kelibsiz',
      welcomeBody: 'Do‘stlaringiz va yaqinlaringizga vaucher yuboring — birinchi sovg‘a ilovada kutmoqda.',
      locale: 'uz-UZ',
    },
    en: {
      title: 'Notifications',
      newLabel: 'NEW',
      loading: 'Loading notifications…',
      emptyTitle: 'No notifications yet',
      emptyText: 'As soon as promotions, news, or gifts appear, we will notify you here.',
      welcomeTitle: '🎁 Welcome to Voucherly',
      welcomeBody: 'Send vouchers to your friends and family — your first gift is already waiting in the app.',
      locale: 'en-US',
    },
  }[language];

  const mockData: AppNotification[] = [
    {
      id: '1',
      title: copy.welcomeTitle,
      body: copy.welcomeBody,
      createdAt: new Date(),
      read: false,
      type: 'info',
    },
  // {
  //   id: '2',
  //   title: '🔥 Спецпредложение от ',
  //   body: 'Скидка 10% при покупке ваучера на сумму от 300 000 сум. Акция действует до конца недели.',
  //   createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  //   read: true,
  //   type: 'promo',
  // },
  // {
  //   id: '3',
  //   title: 'Обновление приложения',
  //   body: 'Мы улучшили экран ваучеров и подготовили новые категории подарков.',
  //   createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  //   read: true,
  //   type: 'system',
  // },
];

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    // TODO: заменить на загрузку с сервера / Firestore
    setLoading(true);
    try {
      // небольшая задержка для имитации сети
      await new Promise((res) => setTimeout(res, 400));
      setItems(mockData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const markAsRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
            }
          : n,
      ),
    );
    // TODO: тут же можно отправить update в Firestore
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const iconConfig = getIconConfig(item);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => markAsRead(item.id)}
        style={[styles.card, !item.read && styles.cardUnread]}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.icon} size={18} color="#fff" />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={2}>
              {item.title}
            </Text>
            {!item.read && (
              <View style={styles.badgeNew}>
                <Text style={styles.badgeNewText}>{copy.newLabel}</Text>
              </View>
            )}
          </View>

          <Text style={styles.body} numberOfLines={3}>
            {item.body}
          </Text>

          <Text style={styles.timeText}>{formatDate(item.createdAt, copy.locale)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <GradientHeader title={copy.title}showBackButton = {true} />
        <View style={styles.loaderInner}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <Text style={styles.loaderText}>{copy.loading}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <GradientHeader title={copy.title} showBackButton = {true} />

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-off-outline" size={32} color={Colors.brand} />
          </View>
          <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
          <Text style={styles.emptyText}>{copy.emptyText}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />
          }
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

// --- helpers ---

function formatDate(date: Date, locale: string) {
  try {
    return date.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function getIconConfig(item: AppNotification) {
  switch (item.type) {
    case 'promo':
      return { icon: 'gift-outline', bg: '#F97373' };
    case 'system':
      return { icon: 'settings-outline', bg: '#6B7280' };
    case 'info':
    default:
      return { icon: 'notifications-outline', bg: Colors.brand };
  }
}

// --- styles ---

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: Colors.brand + '33',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontFamily: Font.bold,
    fontSize: 15,
    color: '#111827',
  },
  titleUnread: {
    color: Colors.brand,
  },
  badgeNew: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors.brand + '15',
  },
  badgeNewText: {
    fontSize: 10,
    fontFamily: Font.bold,
    color: Colors.brand,
  },
  body: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  loaderWrap: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loaderInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 8,
    color: '#6B7280',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Font.bold,
    fontSize: 18,
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});