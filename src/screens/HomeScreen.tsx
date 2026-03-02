import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  Text,
} from 'react-native';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import BannerCarousel from '../components/BannerCarousel';
import PartnerList from '../components/PartnerList';
import LottieView from 'lottie-react-native';
import { usePartners } from '../context/PartnersContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VoucherCodeModal from '../components/VoucherCodeModal';
import { Font } from '../theme/typography';
import { useLocalization } from '../context/LocalizationContext';

const TABBAR_HEIGHT = 64;
const BG = '#F7F6F4';

const HomeScreen = () => {
  const { language } = useLocalization();
  const { partners, banners, loading } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filteredPartners, setFilteredPartners] = useState<any[]>([]);
  const insets = useSafeAreaInsets();
  const [demoVisible, setDemoVisible] = useState(false);

  const copy = {
    ru: {
      title: 'Найдите идеальный подарок 🎁',
      subtitle: 'Отправляйте цифровые ваучеры мгновенно',
      nothing: 'Ничего не найдено по запросу',
      demoTitle: 'Демо режим',
      demoDescription: 'Приложение сейчас работает в демо-режиме, оплата пока не активна.',
      close: 'Закрыть',
    },
    uz: {
      title: 'Mukammal sovg‘ani toping 🎁',
      subtitle: 'Raqamli vaucherlarni darhol yuboring',
      nothing: 'So‘rov bo‘yicha hech narsa topilmadi',
      demoTitle: 'Demo rejim',
      demoDescription: 'Ilova hozir demo rejimda ishlayapti, to‘lov hozircha faol emas.',
      close: 'Yopish',
    },
    en: {
      title: 'Find the perfect gift 🎁',
      subtitle: 'Send digital vouchers instantly',
      nothing: 'Nothing found for',
      demoTitle: 'Demo mode',
      demoDescription: 'The app is currently running in demo mode, payment is not active yet.',
      close: 'Close',
    },
  }[language];

  useEffect(() => {
    setFilteredPartners(partners);
    const timer = setTimeout(() => {
      setDemoVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [partners]);

  useEffect(() => {
    setSearching(true);
    const delay = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredPartners(partners);
      } else {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = partners.filter(partner =>
          partner.name.toLowerCase().includes(lowerQuery)
        );
        setFilteredPartners(filtered);
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, partners]);

  if (loading) {
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
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <Header />

      <FlatList
        data={[]}
        keyExtractor={() => 'main'}
        ListHeaderComponent={
          <View>
            <View style={styles.greetingBlock}>
              <Text style={styles.greetingTitle}>{copy.title}</Text>
              <Text style={styles.greetingSubtitle}>{copy.subtitle}</Text>
            </View>

            <View style={styles.searchWrap}>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            </View>

            <View style={styles.bannerWrap}>
              <BannerCarousel banners={banners} />
            </View>

            {searching ? (
              <View style={styles.searchLoader}>
                <LottieView
                  source={require('../../assets/animations/loader.json')}
                  autoPlay
                  loop
                  style={{ width: 58, height: 58 }}
                />
              </View>
            ) : filteredPartners.length === 0 && searchQuery.trim() !== '' ? (
              <View style={styles.emptyResult}>
                <LottieView
                  source={require('../../assets/animations/emptySearch.json')}
                  autoPlay
                  loop
                  style={{ width: 148, height: 148 }}
                />
                <Text style={styles.emptyText}>
                  {copy.nothing} “{searchQuery}”
                </Text>
              </View>
            ) : (
              <PartnerList
                partners={filteredPartners.filter(p =>
                  searchQuery.trim() ? true : p.isPopular
                )}
              />
            )}
          </View>
        }
        renderItem={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + TABBAR_HEIGHT + 16 },
        ]}
      />

      <VoucherCodeModal
        visible={demoVisible}
        code={null}
        title={copy.demoTitle}
        description={copy.demoDescription}
        showCodeBox={false}
        showCopyButton={false}
        onClose={() => setDemoVisible(false)}
        closeButtonLabel={copy.close}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greetingBlock: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 2,
  },
  greetingTitle: {
    fontFamily: Font.bold,
    fontSize: 29,
    lineHeight: 36,
    color: '#191B22',
  },
  greetingSubtitle: {
    marginTop: 6,
    fontFamily: Font.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#757C89',
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  bannerWrap: {
    marginBottom: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  lottie: {
    width: 92,
    height: 92,
  },
  searchLoader: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 34,
  },
  emptyResult: {
    alignItems: 'center',
    paddingVertical: 42,
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 8,
    color: '#7A8190',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Font.medium,
    textAlign: 'center',
  },
});

export default HomeScreen;


