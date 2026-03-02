// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   ImageBackground,
//   TouchableOpacity,
//   Linking,
//   Alert,
// } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import LinearGradient from 'react-native-linear-gradient';
// import { useNavigation } from '@react-navigation/native';
// import { Font } from '../theme/typography';
// import { Colors } from '../theme/colors';


// export const handleBannerAction = async (actionUrl?: string) => {
//   if (!actionUrl) return;

//   const url = actionUrl.trim();

//   // Instagram handle
//   if (url.startsWith("@")) {
//     const username = url.slice(1);
//     const appUrl = `instagram://user?username=${username}`;
//     const webUrl = `https://instagram.com/${username}`;

//     const canOpen = await Linking.canOpenURL(appUrl);
//     return Linking.openURL(canOpen ? appUrl : webUrl);
//   }

//   // Внешняя ссылка
//   if (url.startsWith("http")) {
//     const canOpen = await Linking.canOpenURL(url);
//     if (!canOpen) {
//       Alert.alert("Ошибка", "Не удалось открыть ссылку");
//       return;
//     }
//     return Linking.openURL(url);
//   }
//   Alert.alert("Ошибка", `Неизвестный actionUrl: ${url}`);
// };

// const { width } = Dimensions.get('window');
// const horizontalPadding = 16;
// const bannerWidth = width - horizontalPadding * 2;

// const BannerCarousel = ({ banners }: { banners: any[] }) => {
//   const navigation = useNavigation();

//   const renderItem = ({ item }: { item: any }) => (
//     <View style={styles.card}>
//       <ImageBackground
//         source={{ uri: item.imageUrl }}
//         style={styles.image}
//         imageStyle={{ borderRadius: 16 }}
//         resizeMode="cover"
//       >
//         <LinearGradient
//           colors={['transparent', 'rgba(0,0,0,0.5)']}
//           style={styles.overlay}
//         >
//           {!!item.title && (
//             <View style={styles.titleContainer}>
//               <View style={styles.textRow}>
//                 <Text
//                   style={styles.title}
//                   numberOfLines={2}
//                   ellipsizeMode="tail"
//                 >
//                   {item.title?.trim()}
//                 </Text>

//                 <TouchableOpacity
//                   style={styles.button}
//                onPress={() => handleBannerAction(item.actionUrl)}
//                 >
//                   <Text style={styles.buttonText}>Перейти</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         </LinearGradient>
//       </ImageBackground>
//     </View>
//   );

//   return (
//     <Carousel
//       width={bannerWidth}
//       height={160}
//       data={banners}
//       autoPlay
//       loop
//       autoPlayInterval={4000}
//       scrollAnimationDuration={800}
//       style={styles.carouselContainer}
//       renderItem={renderItem}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   carouselContainer: {
//     marginBottom: 16,
//     alignSelf: 'center',
//   },
//   card: {
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   image: {
//     width: bannerWidth,
//     height: 160,
//     borderRadius: 16,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     borderRadius: 16,
//   },
//   titleContainer: {
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderBottomLeftRadius: 16,
//     borderBottomRightRadius: 16,
//   },
//   textRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   title: {
//     flex: 1,
//     fontSize: 15,
//     color: Colors.white,
//     fontFamily: Font.medium,
//     marginRight: 8,
//   },
//   button: {
//     backgroundColor: Colors.white,
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//   },
//   buttonText: {
//     color: Colors.textPrimary,
//     fontFamily: Font.semibold,
//     fontSize: 14
//   },
// });

// export default BannerCarousel;


// src/components/PromoPosters.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Font } from '../theme/typography';
import { useLocalization } from '../context/LocalizationContext';

type Poster = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  actionUrl?: string;
  cta?: string;
};

export const handleBannerAction = async (
  actionUrl: string | undefined,
  t: ReturnType<typeof useLocalization>['t'],
) => {
  if (!actionUrl) return;
  const url = actionUrl.trim();

  if (url.startsWith('@')) {
    const username = url.slice(1);
    const app = `instagram://user?username=${username}`;
    const web = `https://instagram.com/${username}`;
    const canOpen = await Linking.canOpenURL(app);
    return Linking.openURL(canOpen ? app : web);
  }

  if (/^https?:\/\//i.test(url)) {
    const ok = await Linking.canOpenURL(url);
    return ok ? Linking.openURL(url) : Alert.alert(t('common.error'), t('common.openLinkFailed'));
  }

  Alert.alert(t('common.error'), `${t('common.unknownActionUrl')}: ${url}`);
};

const { width } = Dimensions.get('window');
const H_PADDING = 20;
const CARD_WIDTH = width * 0.82;
const CARD_HEIGHT = 184;
const CARD_RADIUS = 22;

const PosterCard = ({
  item,
  t,
}: {
  item: Poster;
  t: ReturnType<typeof useLocalization>['t'];
}) => (
  <TouchableOpacity
    activeOpacity={0.93}
    onPress={() => handleBannerAction(item.actionUrl, t)}
    style={styles.cardWrapper}
  >
    <ImageBackground
      source={{ uri: item.imageUrl }}
      style={styles.card}
      imageStyle={styles.cardImage}
      resizeMode="cover"
    >
      {/* ── Subtle bottom-only scrim ── */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.58)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.scrim}
      >
        <View style={styles.bottomRow}>
          <View style={styles.textCol}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            {!!item.subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => handleBannerAction(item.actionUrl, t)}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText} numberOfLines={1} allowFontScaling={false}>
            {item.cta || t('common.explore')}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  </TouchableOpacity>
);

const PromoPosters = ({ banners }: { banners: Poster[] }) => {
  const { t } = useLocalization();

  if (!banners?.length) return null;

  return (
    <FlatList
      horizontal
      data={banners}
      keyExtractor={(it) => it.id}
      renderItem={({ item }) => <PosterCard item={item} t={t} />}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + 14}
    />
  );
};

export default PromoPosters;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingVertical: 4,
  },

  /* ── Card shell ── */
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 14,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#E5E0DA',
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: CARD_RADIUS,
  },

  /* ── Bottom scrim — lower ~42% only ── */
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CARD_HEIGHT * 0.46,
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    justifyContent: 'flex-end',
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
  },

  /* ── Bottom content ── */
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textCol: {
    flex: 1,
    paddingRight: 124,
    flexShrink: 1,
    minWidth: 0,
  },
  title: {
    color: '#fff',
    fontFamily: Font.bold,
    fontSize: 17,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  paddingBottom: 10,
  paddingHorizontal: 18,
  },
  subtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Font.regular,
    fontSize: 12,
    lineHeight: 17,
  },

  /* ── CTA — soft coral pill, not flat white ── */
  cta: {
    position: 'absolute',
    right: 20,
    bottom: 15,
    backgroundColor: '#E53935',
    width: 100,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E53935',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    flexShrink: 0,
  },
  ctaText: {
    color: '#fff',
    fontFamily: Font.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
});