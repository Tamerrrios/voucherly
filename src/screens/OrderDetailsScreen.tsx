import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import { useLocalization } from '../context/LocalizationContext';

const OrderDetailsScreen = ({ route }) => {
  const { language } = useLocalization();
  const { orderId } = route.params;
    const copy = {
      ru: { loading: 'Загрузка...', notFound: 'Заказ не найден', title: 'Детали заказа', partner: 'Партнёр:', amount: 'Сумма:', receiver: 'Получатель:', comment: 'Комментарий:', date: 'Дата заказа:', status: 'Статус:', unknown: 'Неизвестен', currency: 'Сум' },
      uz: { loading: 'Yuklanmoqda...', notFound: 'Buyurtma topilmadi', title: 'Buyurtma tafsilotlari', partner: 'Hamkor:', amount: 'Summa:', receiver: 'Qabul qiluvchi:', comment: 'Izoh:', date: 'Buyurtma sanasi:', status: 'Holat:', unknown: 'Noma’lum', currency: 'soʻm' },
      en: { loading: 'Loading...', notFound: 'Order not found', title: 'Order details', partner: 'Partner:', amount: 'Amount:', receiver: 'Recipient:', comment: 'Comment:', date: 'Order date:', status: 'Status:', unknown: 'Unknown', currency: 'UZS' },
    }[language];
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const doc = await firestore().collection('orders').doc(orderId).get();
        if (doc.exists) {
          setOrder({ id: doc.id, ...doc.data() });
        }
      } catch (e) {
        console.error('Ошибка загрузки заказа', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>{copy.loading}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loader}>
        <Text>{copy.notFound}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{copy.title}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{copy.partner}</Text>
        <Text style={styles.value}>{order.parnertName || '-'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{copy.amount}</Text>
        <Text style={styles.value}>
          {order.voucher?.price ? `${order.voucher.price.toLocaleString(language === 'uz' ? 'uz-UZ' : language === 'en' ? 'en-US' : 'ru-RU')} ${copy.currency}` : '-'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{copy.receiver}</Text>
        <Text style={styles.value}>{order.receiverPhone || '-'}</Text>
      </View>

      {order.comment && (
        <View style={styles.row}>
          <Text style={styles.label}>{copy.comment}</Text>
          <Text style={styles.value}>{order.comment}</Text>
        </View>
      )}

      {(order.imageUrl || order.audioUrl) && (
        <View style={styles.mediaContainer}>
          {order.imageUrl && (
            <Image
              source={{ uri: order.imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          )}
          {/* Тут можно добавить аудио-плеер для audioUrl */}
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>{copy.date}</Text>
        <Text style={styles.value}>
          {order.createdAt?.toDate ? moment(order.createdAt.toDate()).format('DD.MM.YYYY HH:mm') : '-'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{copy.status}</Text>
        <Text style={styles.value}>{order.status || copy.unknown}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  loader: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    width: 110,
    color: '#555',
  },
  value: {
    flex: 1,
    color: '#222',
  },
  mediaContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
});

export default OrderDetailsScreen;