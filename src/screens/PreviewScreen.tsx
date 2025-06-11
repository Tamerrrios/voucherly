

import React, { useState, useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import Animated, {
  FadeInUp,
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';

import { useOrder } from '../context/OrderContext';
import LottieView from 'lottie-react-native';

const screenWidth = Dimensions.get('window').width;

const PreviewScreen = ({ navigation }) => {
  const { order } = useOrder();

  const { imageUrl, audioUrl, comment, voucher } = order || {};
  const [currentScreen, setCurrentScreen] = useState('opening');
  const chestAnimationRef = useRef<LottieView>(null);

  // Анимационные значения
  const openingOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);

  console.log('currentScreen:', currentScreen);
  console.log('order:', order);

  const onOpenPress = () => {
    console.log('Кнопка нажата');
    // Запускаем анимацию сундука
    if (chestAnimationRef.current) {
      chestAnimationRef.current.play();
    }

    // Плавно скрываем экран открытия
    openingOpacity.value = withTiming(0, { duration: 800 });

    // С небольшой задержкой показываем контент
    setTimeout(() => {
      setCurrentScreen('content');
      // Плавно появляется контент
      contentOpacity.value = withDelay(200, withTiming(1, { duration: 1000 }));
      contentScale.value = withDelay(200, withTiming(1, { duration: 1000 }));
    }, 600);
  };

  const onBackPress = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  // Стили анимации для экрана открытия
  const openingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: openingOpacity.value,
  }));

  // Стили анимации для контента
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{
      scale: contentScale.value
    }],
  }));

  const renderOpeningScreen = () => (
    <Animated.View style={[styles.openingContainer, openingAnimatedStyle]}>
      <LottieView
        ref={chestAnimationRef}
        source={require('../../assets/animations/giftBox.json')}
        autoPlay={true}
        loop={true}
        style={styles.lottieChest}
      />
      <TouchableOpacity style={styles.openButton} onPress={onOpenPress}>
        <Text style={styles.openButtonText}>Открыть</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderContentScreen = () => {
    return (
      <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
        <ScrollView 
          contentContainerStyle={styles.container} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Анимация появления заголовка */}
          <Animated.View
            style={[styles.card, { backgroundColor: 'pink' }]}
            entering={FadeInUp.delay(300).duration(800)}
          >
            <Text style={styles.title}>🎁 Что увидит получатель</Text>

            {voucher && (
              <Animated.View
                style={styles.voucherCard}
                entering={FadeInUp.delay(500).duration(800)}
              >
                <ImageBackground
                  source={{ uri: voucher.imageUrl }}
                  style={styles.voucherCard}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.overlay}>
                    <Text style={styles.price}>
                      {voucher.price
                        ? voucher.price.toLocaleString('ru-RU') + ' Сум'
                        : 'Цена не указана'}
                    </Text>
                    <Text style={styles.desc}>{voucher.name || voucher.title || 'Без названия'}</Text>
                  </View>
                </ImageBackground>
              </Animated.View>
            )}

            {imageUrl && (
              <Animated.View entering={FadeInUp.delay(700).duration(800)}>
                <Text style={styles.subtitle}>📷 Прикреплённое изображение</Text>
                <Image source={{ uri: imageUrl }} style={styles.image} />
              </Animated.View>
            )}

            {audioUrl && (
              <Animated.View entering={FadeInUp.delay(900).duration(800)}>
                <Text style={styles.subtitle}>🎧 Голосовое сообщение</Text>
                <Text style={styles.audioAttached}>▶️ Прикреплено</Text>
              </Animated.View>
            )}

            {comment ? (
              <Animated.View entering={FadeInUp.delay(1100).duration(800)}>
                <Text style={styles.subtitle}>💬 Пожелание</Text>
                <Text style={styles.comment}>{comment}</Text>
              </Animated.View>
            ) : null}
          </Animated.View>
        </ScrollView>

        {/* Кнопка "Вернуться назад" внизу экрана */}
        <Animated.View 
          style={styles.backButtonContainer}
          entering={FadeInUp.delay(1300).duration(800)}
        >
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={styles.backButtonText}>Вернуться назад</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111111' }}>
      {currentScreen === 'opening' && renderOpeningScreen()}
      {currentScreen === 'content' && renderContentScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 100, // Добавляем отступ снизу для кнопки
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#D32F2F',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
    color: '#333',
  },
  voucherCard: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  voucherName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00796B',
  },
  voucherPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
  },
  image: {
    width: screenWidth - 80,
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  comment: {
    marginTop: 8,
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  audioAttached: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  lottieSuccessFullScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  price: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 0,
  },
  desc: {
    color: '#eee',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 0,
  },
  // Стили для экрана с сундуком
  openingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieChest: {
    width: 250,
    height: 250,
  },
  openButton: {
    marginTop: 24,
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  openButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  // Стили для кнопки "Вернуться назад"
  backButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#111111',
  },
  backButton: {
    backgroundColor: '#E53935',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PreviewScreen;