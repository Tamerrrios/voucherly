

import React, { useEffect, useRef, useState } from 'react';

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
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';

import { useOrder } from '../context/OrderContext';
import LottieView from 'lottie-react-native';
import { Font } from '../theme/typography';
import { useLocalization } from '../context/LocalizationContext';

const screenWidth = Dimensions.get('window').width;

const PreviewScreen = ({ navigation }: { navigation: any }) => {
  const { language } = useLocalization();
  const { order } = useOrder();
  const copy = {
    ru: {
      tap: 'Нажмите, чтобы открыть подарок 🎁',
      tapSub: 'Маленький момент радости уже ждёт вас.',
      reveal: 'Открыть подарок',
      title: 'Так ваш подарок увидит получатель',
      subtitle: 'Спокойный и элегантный предпросмотр перед отправкой.',
      voucherPreview: 'Предпросмотр ваучера',
      digitalVoucher: 'Цифровой ваучер',
      amountUnavailable: 'Сумма недоступна',
      voucher: 'Цифровой ваучер',
      attachedPhoto: 'Прикреплённое фото',
      message: 'Сообщение',
      voice: 'Голосовое сообщение',
      voiceAttached: 'Голосовое сообщение прикреплено',
      back: 'Назад',
      currency: 'Сум',
    },
    uz: {
      tap: 'Sovg‘ani ochish uchun bosing 🎁',
      tapSub: 'Kichik quvonchli lahza sizni kutmoqda.',
      reveal: 'Sovg‘ani ochish',
      title: 'Sovg‘angiz qabul qiluvchiga shunday ko‘rinadi',
      subtitle: 'Yuborishdan oldingi nafis ko‘rinish.',
      voucherPreview: 'Vaucher ko‘rinishi',
      digitalVoucher: 'Raqamli vaucher',
      amountUnavailable: 'Summa mavjud emas',
      voucher: 'Raqamli vaucher',
      attachedPhoto: 'Biriktirilgan rasm',
      message: 'Xabar',
      voice: 'Ovozli xabar',
      voiceAttached: 'Ovozli xabar biriktirilgan',
      back: 'Orqaga',
      currency: 'soʻm',
    },
    en: {
      tap: 'Tap to reveal your gift 🎁',
      tapSub: 'A small moment of joy is waiting.',
      reveal: 'Reveal gift',
      title: 'This is how your gift will appear',
      subtitle: 'A calm, elegant preview before it arrives.',
      voucherPreview: 'Voucher preview',
      digitalVoucher: 'Digital voucher',
      amountUnavailable: 'Amount unavailable',
      voucher: 'Digital Voucher',
      attachedPhoto: 'Attached photo',
      message: 'Message',
      voice: 'Voice note',
      voiceAttached: 'Voice message attached',
      back: 'Back',
      currency: 'UZS',
    },
  }[language];

  const { imageUrl, audioUrl, comment, voucher } = order || {};
  const [currentScreen, setCurrentScreen] = useState('opening');
  const chestAnimationRef = useRef<LottieView>(null);

  // Анимационные значения
  const openingOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const giftScale = useSharedValue(1);
  const giftGlowOpacity = useSharedValue(0.26);

  useEffect(() => {
    giftScale.value = withRepeat(
      withSequence(
        withTiming(1.035, { duration: 1800 }),
        withTiming(0.985, { duration: 1800 }),
      ),
      -1,
      false,
    );

    giftGlowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.38, { duration: 1800 }),
        withTiming(0.2, { duration: 1800 }),
      ),
      -1,
      false,
    );
  }, [giftGlowOpacity, giftScale]);

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

  const giftAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: giftScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: giftGlowOpacity.value,
  }));

  const renderOpeningScreen = () => (
    <Animated.View style={[styles.openingContainer, openingAnimatedStyle]}>
      <LinearGradient
        colors={['#F7F6F4', '#F3F0EC', '#EFEAE2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.openingGradient}
      >
        <View style={styles.openingHero}>
          <Animated.View style={[styles.giftGlow, glowAnimatedStyle]} />

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={onOpenPress}
            style={styles.giftTapArea}
          >
            <Animated.View style={giftAnimatedStyle}>
              <LottieView
                ref={chestAnimationRef}
                source={require('../../assets/animations/giftBox.json')}
                autoPlay={true}
                loop={true}
                style={styles.lottieChest}
              />
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.revealHint}>{copy.tap}</Text>
          <Text style={styles.revealSubtext}>{copy.tapSub}</Text>

          <TouchableOpacity style={styles.openButton} onPress={onOpenPress} activeOpacity={0.9}>
            <Text style={styles.openButtonText} numberOfLines={1} allowFontScaling={false}>
              {copy.reveal}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderContentScreen = () => {
    return (
      <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
        <LinearGradient
          colors={['#F7F6F4', '#F3F0EC', '#EFEAE2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.contentGlowTop} />
          <View style={styles.contentGlowBottom} />

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInUp.delay(220).duration(700)}>
              <Text style={styles.contentTitle}>{copy.title}</Text>
              <Text style={styles.contentSubtitle}>{copy.subtitle}</Text>
            </Animated.View>

            {voucher && (
              <Animated.View entering={FadeInUp.delay(340).duration(720)}>
                <Text style={styles.blockLabel}>{copy.voucherPreview}</Text>
                <View style={styles.voucherCardWrap}>
                  <ImageBackground
                    source={{ uri: voucher.imageUrl }}
                    style={styles.voucherCardPremium}
                    imageStyle={styles.voucherCardImage}
                    resizeMode="cover"
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.16)', 'rgba(0,0,0,0.58)']}
                      style={styles.voucherScrim}
                    >
                      <View style={styles.voucherTag}>
                        <Text style={styles.voucherTagText}>{copy.digitalVoucher}</Text>
                      </View>
                      <Text style={styles.voucherAmount}>
                        {voucher.price
                          ? voucher.price.toLocaleString(language === 'uz' ? 'uz-UZ' : language === 'en' ? 'en-US' : 'ru-RU') + ` ${copy.currency}`
                          : copy.amountUnavailable}
                      </Text>
                      <Text style={styles.voucherNameText} numberOfLines={1}>
                        {voucher.name || voucher.title || copy.voucher}
                      </Text>
                    </LinearGradient>
                  </ImageBackground>
                </View>
              </Animated.View>
            )}

            {imageUrl && (
              <Animated.View entering={FadeInUp.delay(460).duration(720)}>
                <Text style={styles.blockLabel}>{copy.attachedPhoto}</Text>
                <View style={styles.photoCard}>
                  <Image source={{ uri: imageUrl }} style={styles.attachedImage} />
                </View>
              </Animated.View>
            )}

            {comment ? (
              <Animated.View entering={FadeInUp.delay(580).duration(720)}>
                <Text style={styles.blockLabel}>{copy.message}</Text>
                <View style={styles.messageCard}>
                  <Text style={styles.messageText}>{comment}</Text>
                </View>
              </Animated.View>
            ) : null}

            {audioUrl && (
              <Animated.View entering={FadeInUp.delay(680).duration(720)}>
                <Text style={styles.blockLabel}>{copy.voice}</Text>
                <View style={styles.voiceCard}>
                  <Text style={styles.voiceText}>{copy.voiceAttached}</Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </LinearGradient>

        <Animated.View
          style={styles.backButtonContainer}
          entering={FadeInUp.delay(1300).duration(800)}
        >
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={styles.backButtonText}>{copy.back}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F6F4' }}>
      {currentScreen === 'opening' && renderOpeningScreen()}
      {currentScreen === 'content' && renderContentScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  contentGlowTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: 38,
    right: -60,
    backgroundColor: '#EDE2D5',
    opacity: 0.24,
  },
  contentGlowBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 40,
    left: -55,
    backgroundColor: '#F2E9DD',
    opacity: 0.22,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 128,
    rowGap: 18,
  },
  contentTitle: {
    fontFamily: Font.bold,
    fontSize: 25,
    lineHeight: 32,
    color: '#2E2D2A',
    letterSpacing: -0.3,
  },
  contentSubtitle: {
    marginTop: 6,
    color: '#6E6862',
    fontFamily: Font.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  blockLabel: {
    marginBottom: 10,
    color: '#756E66',
    fontFamily: Font.medium,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.35,
  },
  voucherCardWrap: {
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 9 },
    shadowRadius: 16,
    elevation: 4,
    backgroundColor: '#E6DFD7',
  },
  voucherCardPremium: {
    height: 192,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  voucherCardImage: {
    borderRadius: 22,
  },
  voucherScrim: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 14,
    justifyContent: 'flex-end',
    height: '58%',
    paddingBottom: 0,
  },
  voucherTag: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  voucherTagText: {
    color: '#FDFCFB',
    fontFamily: Font.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  voucherAmount: {
    color: '#FFFFFF',
    fontFamily: Font.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
    left: 10
  },
  voucherNameText: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Font.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  photoCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 8,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 13,
    elevation: 3,
  },
  attachedImage: {
    width: '100%',
    height: 198,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  messageCard: {
    borderRadius: 18,
    backgroundColor: '#FCFAF7',
    borderWidth: 1,
    borderColor: '#ECE5DB',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    color: '#3F3932',
    fontFamily: Font.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  voiceCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6DD',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  voiceText: {
    color: '#5E5750',
    fontFamily: Font.medium,
    fontSize: 14,
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
  },
  openingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  openingHero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftTapArea: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftGlow: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#E8DED0',
    shadowColor: '#D8BFA1',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 34,
    elevation: 8,
  },
  lottieChest: {
    width: 250,
    height: 250,
  },
  revealHint: {
    marginTop: 2,
    fontSize: 24,
    lineHeight: 30,
    color: '#2E2D2A',
    fontFamily: Font.bold,
    textAlign: 'center',
  },
  revealSubtext: {
    marginTop: 8,
    marginBottom: 22,
    color: '#6A655F',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Font.regular,
    textAlign: 'center',
  },
  openButton: {
    minWidth: 188,
    height: 54,
    borderWidth: 1,
    borderColor: '#E9E2D9',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    shadowColor: '#A38A70',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
  },
  openButtonText: {
    color: '#2F2A24',
    fontFamily: Font.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  // Стили для кнопки "Вернуться назад"
  backButtonContainer: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    backgroundColor: '#F7F2EA',
    borderWidth: 1,
    borderColor: '#E9E1D6',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9F8D76',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 13,
    elevation: 3,
  },
  backButtonText: {
    color: '#3B352E',
    fontSize: 15,
    fontFamily: Font.semibold,
  },
});

export default PreviewScreen;


