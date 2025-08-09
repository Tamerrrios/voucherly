import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import ProgressHeader from '../components/ProgressHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useOrder } from '../context/OrderContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Image } from 'react-native-animatable';

import firestore from '@react-native-firebase/firestore';
import { auth } from '../firebase/firebase';
import { v4 as uuidv4 } from 'uuid';


const CheckoutScreen = () => {

  const navigation = useNavigation();
  const { order, resetOrder } = useOrder();
  const { imageUrl, audioUrl, comment, voucher, partnerName, receiverPhone } = order || {};

const generateUniqueVoucherCode = async (): Promise<string> => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const generateCode = () => {
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `VC-${result}`;
  };

  let voucherCode = '';
  let exists = true;

  while (exists) {
    voucherCode = generateCode();
    const snapshot = await firestore()
      .collection('orders')
      .where('voucherCode', '==', voucherCode)
      .get();
    exists = !snapshot.empty;
  }

  return voucherCode;
};


useFocusEffect(
  React.useCallback(() => {
    let isActive = true; // для отмены эффекта при уходе с экрана

    const checkUserVerification = async () => {
      const user = auth().currentUser;
      if (!user) {
        if (isActive) {
          navigation.navigate('AuthRedirect', {
            returnTo: 'Checkout',
          });
        }
        return;
      }

      try {
        await user.reload(); // обновляем данные пользователя
        if (isActive && !user.emailVerified) {
          Alert.alert(
            'Подтверждение email',
            'Пожалуйста, подтвердите вашу почту, чтобы оформить заказ. Проверьте почтовый ящик и перейдите по ссылке из письма.',
            [
              {
                text: 'Отправить письмо повторно',
                onPress: async () => {
                  try {
                    await user.sendEmailVerification();
                    Alert.alert('Письмо отправлено', 'Письмо для подтверждения отправлено на ваш email.');
                  } catch (e) {
                    Alert.alert('Ошибка', 'Не удалось отправить письмо. Попробуйте позже.');
                  }
                },
              },
              {
                text: 'Ок',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        // Можно добавить алерт или обработку ошибки
      }
    };

    checkUserVerification();

    return () => {
      isActive = false;
    };
  }, [navigation])
);
  
const handleConfirm = async () => {
  console.log('[CONFIRM] Оформление заказа...');

  if (!order || typeof order !== 'object') {
    Alert.alert('Ошибка', 'Данные заказа не найдены.');
    return;
  }

  const cleanOrder = Object.fromEntries(
    Object.entries(order).filter(([_, v]) => v !== undefined)
  );

  const userID = auth().currentUser?.uid;

  try {
    const voucherCode = await generateUniqueVoucherCode();
    console.log('[VoucherCode]', voucherCode);

    const docRef = await firestore().collection('orders').add({
      ...cleanOrder,
      userID,
      voucherCode, // 👈 Читаемый код ваучера
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    navigation.navigate('Success', { orderId: docRef.id });
  } catch (error) {
    console.error('Ошибка при оформлении:', error);
    Alert.alert('Ошибка', 'Не удалось оформить заказ. Попробуйте ещё раз.');
  }
};



  // const handleConfirm = async () => {
  //   const cleanOrder = Object.fromEntries(
  //     Object.entries(order).filter(([_, v]) => v !== undefined)
  //   );
  
  //   const userID = auth().currentUser?.uid;
  
  //   try {
  //     const docRef = await firestore()
  //       .collection('orders')
  //       .add({
  //         ...cleanOrder,
  //         userID, // 👈 Добавляем userId
  //         createdAt: firestore.FieldValue.serverTimestamp(),
  //       });

  //     // await docRef.update({ orderId: docRef.id });
  //     navigation.navigate('Success', { orderId: docRef.id });
  //     // navigation.navigate('Success');
  //   } catch (error) {
  //     console.error('Ошибка при отправке заказа:', error);
  //     Alert.alert('Ошибка', 'Не удалось отправить заказ. Попробуйте ещё раз.');
  //   }
  // };

  return (
    <View style={styles.wrapper}>
      <ProgressHeader currentStep={3} steps={['Получатель', 'Медиа', 'Оплата']} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={styles.title}>💳 Подтвердите заказ</Text>
        </Animated.View>

        {/* Voucher Info */}
        <Animated.View style={styles.card} entering={FadeInUp.delay(200).duration(400)}>
          <Text style={styles.cardTitle}>🎁 Ваучер</Text>
          <Text style={styles.cardValue}>
          {voucher && `${partnerName} - ${voucher.price.toLocaleString('ru-RU')} Сум`}
            {/* {`${parnertName} - ${voucher.price.toLocaleString('ru-RU')} Сум`} */}
          </Text>
        </Animated.View>

        {/* Receiver Info */}
        <Animated.View style={styles.card} entering={FadeInUp.delay(300).duration(400)}>
          <Text style={styles.cardTitle}>👤 Получатель</Text>
          <Text style={styles.cardValue}>{receiverPhone}</Text>
        </Animated.View>

        {/* Media info */}
        {(imageUrl || comment) && (
          <Animated.View style={styles.card} entering={FadeInUp.delay(400).duration(400)}>
            <Text style={styles.cardTitle}>📎 Медиа</Text>
            <Text style={styles.cardValue}>
              {imageUrl && comment
                ? '1 изображение и комментарий'
                : imageUrl
                  ? '1 изображение'
                  : 'Комментарий'}
            </Text>
          </Animated.View>
        )}
        <Animated.View style={styles.card} entering={FadeInUp.delay(500).duration(400)}>
          <Text style={styles.cardTitle}>💰 Способ оплаты</Text>
          <TouchableOpacity style={styles.paymentBtn}>
            <Image
              source={require('../../assets/images/atm-card.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
            <Text style={styles.paymentText}>Карта (UzCard / Humo)</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Подтвердить заказ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  paymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  paymentText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
  },
  confirmBtn: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CheckoutScreen;