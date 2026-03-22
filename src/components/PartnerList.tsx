import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Navigation } from '../navigation/Navigation';
import { Font } from '../theme/typography';
import { useLocalization } from '../context/LocalizationContext';

const CARD_RADIUS = 22;
const CARD_HEIGHT = 200;

const PartnerList = ({ partners }: { partners: any[] }) => {
  const { language } = useLocalization();
  const copy = {
    ru: { digital: 'Цифровой ваучер', popular: 'Популярное' },
    uz: { digital: 'Raqamli vaucher', popular: 'Ommabop' },
    en: { digital: 'Digital Voucher', popular: 'Popular' },
  }[language];

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 80}
      useNativeDriver
    >
      <TouchableOpacity
        style={styles.cardWrapper}
        activeOpacity={0.93}
        onPress={() =>
          Navigation.navigate(Navigation.Routes.Supplier, {
            partnerId: item.partnerId,
          })
        }
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.card}
          imageStyle={styles.cardImage}
          resizeMode="cover"
        >
          {/* ── Pill sits directly on the image, no gradient behind it ── */}
          <View style={styles.pillWrap}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{copy.digital}</Text>
            </View>
          </View>

          {/* ── Subtle bottom-only scrim ── */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.scrim}
          >
            <View style={styles.bottomRow}>
              <View style={styles.textCol}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              </View>

              <View style={styles.arrowBtn}>
                <Ionicons name="arrow-forward" size={17} color="#E53935" />
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>{copy.popular}</Text>
      <FlatList
        data={partners}
        keyExtractor={(item, index) => item.id ?? String(item.partnerId ?? index)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: Font.bold,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 14,
    color: '#1B1E26',
  },
  list: {
    paddingVertical: 4,
  },

  /* ── Card shell ── */
  cardWrapper: {
    borderRadius: CARD_RADIUS,
    backgroundColor: '#E0DEDA',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 4,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: CARD_RADIUS,
  },

  /* ── Pill — floats on clear image near top-left ── */
  pillWrap: {
    position: 'absolute',
    top: 14,
    left: 16,
    zIndex: 2,
  },
  pill: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: {
    color: '#fff',
    fontFamily: Font.semibold,
    fontSize: 11,
    letterSpacing: 0.3,
  },

  /* ── Bottom scrim — covers only lower ~40% ── */
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CARD_HEIGHT * 0.45,
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    paddingBottom: 0,
  },

  /* ── Bottom action row ── */
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: {
    flex: 1,
    marginRight: 14,
  },
  name: {
    color: '#fff',
    fontFamily: Font.bold,
    fontSize: 18,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    left: 10,
    bottom: 10,
  },

  /* ── White circle CTA with brand-color arrow ── */
  arrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    right: 10,
    bottom: 10
  },
});

export default PartnerList;