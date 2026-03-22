import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Animated,
  Modal,
} from "react-native";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Typography } from "../theme/typography";
import { useLocalization } from '../context/LocalizationContext';
import { AppLanguage } from "../localization/translations";

const { width, height } = Dimensions.get("window");

type SlideItem = {
  key: string;
  title: string;
  subtitle: string;
  animation: object;
};

const OnboardingScreen = () => {
  const { language, setLanguage, t } = useLocalization();
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const slidesByLanguage: Record<AppLanguage, SlideItem[]> = {
    ru: [
      { key: "1", title: "Ваучеры лучших брендов", subtitle: "Кафе, магазины, beauty и сотни других партнёров — всё в одном приложении", animation: require("../../assets/animations/onBoarding1.json") },
      { key: "2", title: "Выберите бренд и сумму", subtitle: "Подарите то, что точно понравится — без очередей и упаковки", animation: require("../../assets/animations/onBoarding2.json") },
      { key: "3", title: "Готово за минуту", subtitle: "Оплатите и отправьте ссылку — подарок у получателя мгновенно", animation: require("../../assets/animations/onBoarding3.json") },
    ],
    uz: [
      { key: "1", title: "Top brendlar voucherlari", subtitle: "Kafe, do’konlar, go’zallik va yuzlab boshqa hamkorlar — barchasi bir joyda", animation: require("../../assets/animations/onBoarding1.json") },
      { key: "2", title: "Brend va summani tanlang", subtitle: "Aniq yoqadigan sovg’a bering — navbat va qadoqlarsiz", animation: require("../../assets/animations/onBoarding2.json") },
      { key: "3", title: "Bir daqiqada tayyor", subtitle: "To’lang va havola yuboring — sovg’a darhol qabul qiluvchida", animation: require("../../assets/animations/onBoarding3.json") },
    ],
    en: [
      { key: "1", title: "Top brand vouchers", subtitle: "Cafes, shops, beauty, and hundreds of partners — all in one app", animation: require("../../assets/animations/onBoarding1.json") },
      { key: "2", title: "Pick a brand and amount", subtitle: "Give a gift they’ll love — no queues, no wrapping", animation: require("../../assets/animations/onBoarding2.json") },
      { key: "3", title: "Done in a minute", subtitle: "Pay and share a link — gift received instantly", animation: require("../../assets/animations/onBoarding3.json") },
    ],
  };

  const slides = slidesByLanguage[language];

  const languageOptions: Array<{ code: AppLanguage; label: string; nativeLabel: string }> = [
    { code: 'uz', label: t('profile.languageUz'), nativeLabel: 'O‘zbekcha' },
    { code: 'ru', label: t('profile.languageRu'), nativeLabel: 'Русский' },
    { code: 'en', label: t('profile.languageEn'), nativeLabel: 'English' },
  ];

  const nextText = language === 'uz' ? 'Keyingi' : language === 'en' ? 'Next' : 'Далее';
  const startText = language === 'uz' ? 'Boshlash' : language === 'en' ? 'Start' : 'Начать';

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleDone();
    }
  };

  const handleDone = async () => {
    await AsyncStorage.setItem("onboardingShown", "true");
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  const handleLanguageSelect = async (nextLanguage: AppLanguage) => {
    await setLanguage(nextLanguage);
    setLanguageModalVisible(false);
  };

  useEffect(() => {
    fadeAnim.setValue(0);
    translateY.setValue(30);

    const anim = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    anim.start();
    return () => anim.stop();
  }, [currentIndex]);

  const renderItem = ({ item }: { item: SlideItem }) => (
    <Animated.View
      style={[
        styles.slide,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.animationShell}>
        <LottieView
          source={item.animation}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={["#F8FAFC", "#EEF2FF", "#FFF1F2"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>Voucherly</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.languageButton, pressed ? styles.languageButtonPressed : null]}
          onPress={() => setLanguageModalVisible(true)}
        >
          <Ionicons name="language-outline" size={16} color="#111827" />
          <Text style={styles.languageButtonText}>{t('profile.language')}</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footerCard}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? startText : nextText}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={styles.languageModalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t('profile.languageTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('profile.languageSubtitle')}</Text>

            {languageOptions.map(option => {
              const isActive = language === option.code;

              return (
                <Pressable
                  key={option.code}
                  style={[styles.langRow, isActive ? styles.langRowActive : null]}
                  onPress={() => handleLanguageSelect(option.code)}
                >
                  <View>
                    <Text style={[styles.langLabel, isActive ? styles.langLabelActive : null]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.langHint, isActive ? styles.langHintActive : null]}>
                      {option.nativeLabel}
                    </Text>
                  </View>

                  {isActive ? (
                    <View style={styles.langCheckActive}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.langCheckIdle} />
                  )}
                </Pressable>
              );
            })}

            <Pressable style={styles.cancelButton} onPress={() => setLanguageModalVisible(false)}>
              <Text style={styles.cancelText}>{t('profile.cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  languageButtonPressed: {
    opacity: 0.8,
  },
  languageButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  animationShell: {
    width: width * 0.82,
    height: height * 0.4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  lottie: {
    width: width * 0.72,
    height: height * 0.34,
  },
  title: {
    ...Typography.title,
    marginTop: 28,
    textAlign: 'center',
    color: '#111827',
  },
    

  subtitle: {
    ...Typography.subtitle,
    marginTop: 10,
    paddingHorizontal: 24,
    textAlign: "center",
    color: '#4B5563',
    lineHeight: 22,
  },
  footerCard: {
    marginHorizontal: 18,
    marginBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 5,
  },
  dotActive: {
    width: 20,
    borderRadius: 8,
    backgroundColor: "#E53935",
  },
  button: {
    backgroundColor: "#E53935",
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: "stretch",
    borderRadius: 14,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    ...Typography.buttonText,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  languageModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  langRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langRowActive: {
    borderColor: '#F7B6B5',
    backgroundColor: '#FFF5F5',
  },
  langLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  langLabelActive: {
    color: '#B42318',
  },
  langHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  langHintActive: {
    color: '#D92D20',
  },
  langCheckActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
  },
  langCheckIdle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButton: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  cancelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
});