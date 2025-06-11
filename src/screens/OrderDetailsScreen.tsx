import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';

const OrderDetailsScreen = ({ route }) => {
  const { orderId } = route.params;
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
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loader}>
        <Text>Заказ не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Детали заказа</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Партнёр:</Text>
        <Text style={styles.value}>{order.parnertName || '-'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Сумма:</Text>
        <Text style={styles.value}>
          {order.voucher?.price ? `${order.voucher.price.toLocaleString('ru-RU')} Сум` : '-'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Получатель:</Text>
        <Text style={styles.value}>{order.receiverPhone || '-'}</Text>
      </View>

      {order.comment && (
        <View style={styles.row}>
          <Text style={styles.label}>Комментарий:</Text>
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
        <Text style={styles.label}>Дата заказа:</Text>
        <Text style={styles.value}>
          {order.createdAt?.toDate ? moment(order.createdAt.toDate()).format('DD.MM.YYYY HH:mm') : '-'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Статус:</Text>
        <Text style={styles.value}>{order.status || 'Неизвестен'}</Text>
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