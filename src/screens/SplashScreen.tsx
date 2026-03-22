import React, { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, Text, Vibration, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const BRAND = '#E50914';
const GOLD = '#D4AF37';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const screenOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.92);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.7);
  const shineProgress = useSharedValue(-1);

  useEffect(() => {
    Vibration.vibrate(Platform.OS === 'ios' ? 35 : 45);

    logoOpacity.value = withTiming(1, {
      duration: 480,
      easing: Easing.out(Easing.quad),
    });

    logoScale.value = withSequence(
      withTiming(1.02, {
        duration: 900,
        easing: Easing.out(Easing.exp),
      }),
      withTiming(1, {
        duration: 280,
        easing: Easing.inOut(Easing.quad),
      }),
    );

    glowOpacity.value = withSequence(
      withTiming(0.9, {
        duration: 420,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(0.45, {
        duration: 520,
        easing: Easing.inOut(Easing.quad),
      }),
    );

    glowScale.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    shineProgress.value = withDelay(
      260,
      withTiming(1.15, {
        duration: 760,
        easing: Easing.inOut(Easing.cubic),
      }),
    );

    screenOpacity.value = withDelay(
      1620,
      withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }),
    );
  }, [glowOpacity, glowScale, logoOpacity, logoScale, onFinish, screenOpacity, shineProgress]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shineProgress.value, [-1, -0.4, 0.2, 0.9, 1.15], [0, 0.22, 0.65, 0.18, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(shineProgress.value, [-1, 1.15], [-width * 0.9, width * 0.9], Extrapolation.CLAMP),
      },
      { rotate: '-18deg' },
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.glow, glowStyle]} />

      <View style={styles.logoWrap}>
        <Animated.Text style={[styles.logo, logoStyle]}>Voucherly</Animated.Text>
        <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width * 0.36,
    backgroundColor: BRAND,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 54,
    opacity: 0,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
    minWidth: width * 0.78,
    minHeight: 120,
  },
  logo: {
    color: BRAND,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 2.2,
    textTransform: 'none',
    textShadowColor: 'rgba(229, 9, 20, 0.22)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  shine: {
    position: 'absolute',
    width: 54,
    height: 220,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
});

export default SplashScreen;
