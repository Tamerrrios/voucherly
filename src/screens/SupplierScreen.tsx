import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import SupplierHeader from '../components/SupplierHeader';
import VoucherCarousel from '../components/VoucherCarousel';
import FAQSection from '../components/FAQSection';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { getPartnerWithVouchers } from '../api/homeApi';
import LottieView from 'lottie-react-native';
import { useOrder } from '../context/OrderContext';
import BackButton from '../components/BackButton';

const screenWidth = Dimensions.get('window').width;

const SupplierScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { setOrder } = useOrder();
  const { partnerId } = route.params as { partnerId: string };

  const [partner, setPartner] = useState<any>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const data = await getPartnerWithVouchers(partnerId);
        setPartner(data);
  
        if (data.vouchers.length === 1) {
          setSelectedVoucher(data.vouchers[0]);
          setOrder({
            ...{},
            voucher: data.vouchers[0],
            partnerId: partnerId,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [partnerId]);

  const handleVoucherFocus = (voucher: any) => {
    setSelectedVoucher(voucher);
    console.log('Selected partner:', partner.name);
    setOrder({
      voucher: voucher,
      partnerId: voucher.partnerId,
      partnerName: partner.name,
    });
  };

  if (loading || !partner) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={require('../../assets/animations/loader.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SupplierHeader
        bannerImg={partner.bannerImg}
        name={partner.name}
        city={partner.city}
        phone={partner.phone}
        description={partner.description}
        instagram="https://www.instagram.com/nike"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* <Text style={styles.sectionTitle}>🎟️ Выберите ваучер</Text> */}

        <VoucherCarousel vouchers={partner.vouchers} onFocus={handleVoucherFocus} />

        <View style={styles.separator} />
        <FAQSection />

        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View style={[styles.buyButtonWrapper, animatedStyle]}>
        <TouchableOpacity
          style={styles.buyButton}
          onPressIn={() => (scale.value = withSpring(0.95))}
          onPressOut={() => (scale.value = withSpring(1))}
          onPress={() => navigation.navigate('Contact')}
          disabled={!selectedVoucher}
        >
          <Text style={styles.buyButtonText}>Купить ваучер 🎁</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
    marginHorizontal: 16,
  },
  buyButtonWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  buyButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  lottie: {
    width: 100,
    height: 100,
  },
});

export default SupplierScreen;