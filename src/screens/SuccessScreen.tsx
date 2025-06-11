import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useOrder } from '../context/OrderContext';
import { useRoute } from '@react-navigation/native';


const SuccessScreen = () => {
  const navigation = useNavigation();
  const { order, resetOrder } = useOrder();
  const { voucher, receiverPhone } = order || {};
  const route = useRoute();
  const { orderId } = route.params || {};

  const shareLink = orderId ? `https://voucherly.uz/gift?orderId=${orderId}` : '';


  const handleShare = async () => {
    console.log('Нажата кнопка Поделиться');

    if (!shareLink) {
      console.log('voucherLink пустой, не делимся');
      return;
    }

    try {
      const message = `🎁 Я только что отправил тебе ваучер в приложении Voucherly!

Открой, чтобы получить: ${shareLink}

Если приложение не установлено — установи его по ссылке и зарегистрируйся, чтобы получить подарок 🎉`;

      await Share.share({ message });
    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error);
    }
  };

  return (
    <LinearGradient colors={["#E53935", "#FF6F61"]} style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../../assets/animations/success.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
        <Text style={styles.title}>Покупка прошла успешно! 🎉</Text>
        <Text style={styles.subtitle}>
          Получатель получит свою открытку вместе с ваучером в ближайшее время
        </Text>
      </View>

      <View style={styles.buttonsWrapper}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.buttonText}>📤 Поделиться открыткой</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            resetOrder(); // очищаем заказ
            navigation.navigate('Main');
          }}
        >
          <Text style={[styles.buttonText, { color: '#E53935' }]}>🏠 Вернуться на главный</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  buttonsWrapper: {
    marginBottom: 40,
    marginHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default SuccessScreen;