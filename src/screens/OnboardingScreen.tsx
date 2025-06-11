import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient"; 

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Добро пожаловать!",
    subtitle: "Voucherly — маркетплейс электронных ваучеров",
    animation: require("../../assets/animations/onBoarding1.json"),
  },
  {
    key: "2",
    title: "Дарите ваучеры",
    subtitle: "Выбирай и отправляй друзьям с открытками 🎁",
    animation: require("../../assets/animations/onBoarding2.json"),
  },
  {
    key: "3",
    title: "Просто и быстро",
    subtitle: "Покупка и отправка за пару кликов",
    animation: require("../../assets/animations/onBoarding3.json"),
  },
];

const OnboardingScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

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

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
  }, [currentIndex]);

  const renderItem = ({ item }: any) => (
    <Animated.View
      style={[
        styles.slide,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <LottieView
        source={item.animation}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={["#FFE8E8", "#FFD9F2", "#E1F5FE"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onScroll={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
      />

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

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? "Начать" : "Далее"}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  lottie: {
    width: width * 0.8,
    height: height * 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginTop: 15,
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  dotActive: {
    width: 16,
    backgroundColor: "#000",
  },
  button: {
    backgroundColor: "#E53935",
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: "center",
    borderRadius: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});