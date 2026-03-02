import React, { useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import LinearGradient from 'react-native-linear-gradient';
import { useLocalization } from '../context/LocalizationContext';

const screenWidth = Dimensions.get('window').width;
const horizontalPadding = 16;
const cardWidth = screenWidth - horizontalPadding * 2;

interface Voucher {
  id?: string;
  title?: string;
  price: number;
  imageUrl?: string | null;
}

interface VoucherCarouselProps {
  vouchers: Voucher[];
  onFocus?: (voucher: Voucher) => void;
  partnerName?: string;
  partnerIcon?: string | null;
  showImages?: boolean;
  gradientColors?: [string, string];
}

const Caption = memo(({
  item,
  partnerName,
  locale,
  currency,
  voucherLabel,
}: {
  item: Voucher;
  partnerName: string;
  locale: string;
  currency: string;
  voucherLabel: string;
}) => (
  <View style={styles.captionBox} pointerEvents="none">
    <Text style={styles.brandLine} numberOfLines={1}>
     {partnerName}
    </Text>
    {!!item?.title && (
      <Text style={styles.subtitle} numberOfLines={1}>
        {item.title}
      </Text>
    )}
    <Text style={styles.price}>{item.price.toLocaleString(locale)} {currency}</Text>
    <Text style={styles.pill}>{voucherLabel}</Text>
  </View>
));
Caption.displayName = 'Caption';

const PartnerBadge = memo(({ partnerIcon, partnerName }: { partnerIcon?: string | null; partnerName: string }) => (
  <View style={styles.logoBadge} pointerEvents="none">
    {partnerIcon ? (
      <Image source={{ uri: partnerIcon }} style={styles.logo} />
    ) : (
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoPHText}>{(partnerName || 'P').slice(0, 1).toUpperCase()}</Text>
      </View>
    )}
  </View>
));
PartnerBadge.displayName = 'PartnerBadge';

const VoucherCarousel: React.FC<VoucherCarouselProps> = ({
  vouchers,
  onFocus,
  partnerName = 'Partner',
  partnerIcon = null,
  showImages = false,
  gradientColors = ['#E53935', '#FF7043'],
}) => {
  const { language } = useLocalization();
  const locale = language === 'uz' ? 'uz-UZ' : language === 'en' ? 'en-US' : 'ru-RU';
  const currency = language === 'uz' ? 'soʻm' : language === 'en' ? 'UZS' : 'сум';
  const voucherLabel = language === 'uz' ? 'Vaucher' : language === 'en' ? 'Voucher' : 'Ваучер';
  const emptyText = language === 'uz' ? 'Mavjud vaucherlar yo‘q' : language === 'en' ? 'No available vouchers' : 'Нет доступных ваучеров';
  const isSingle = vouchers.length === 1;
  const isLoopable = vouchers.length > 1;

  useEffect(() => {
    if (isSingle && onFocus) onFocus(vouchers[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vouchers]);

  const handleSnap = useCallback(
    (index: number) => {
      onFocus?.(vouchers[index]);
    },
    [onFocus, vouchers]
  );

  const renderItem = useCallback(
    ({ item }: { item: Voucher }) => {
      return (
        <View style={styles.cardContainer}>
          {/* фон */}
          {showImages && item?.imageUrl ? (
            <>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.bgImage}
                resizeMode="cover"
                fadeDuration={0} // убираем флик при загрузке
              />
              <View style={styles.imageDim} />
            </>
          ) : (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bgGradient}
            />
          )}

          {/* оверлеи */}
          <Caption item={item} partnerName={partnerName} locale={locale} currency={currency} voucherLabel={voucherLabel} />
          <PartnerBadge partnerIcon={partnerIcon} partnerName={partnerName} />
        </View>
      );
    },
    [currency, gradientColors, locale, partnerIcon, partnerName, showImages, voucherLabel]
  );

  if (!vouchers || vouchers.length === 0) {
    return <Text style={styles.empty}>{emptyText}</Text>;
    }

  return (
    <View style={styles.wrapper}>
      <Carousel
        data={vouchers}
        width={cardWidth}
        height={190}
        loop={isLoopable}
        pagingEnabled={!isSingle}
        enabled={!isSingle}
        style={styles.carousel}
        scrollAnimationDuration={350}
        mode={isLoopable ? 'parallax' : undefined}
        modeConfig={
          isLoopable
            ? { parallaxScrollingOffset: 60, parallaxScrollingScale: 0.92 }
            : undefined
        }
        onSnapToItem={handleSnap}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: horizontalPadding, marginTop: 20 },
  carousel: { overflow: 'visible' },

  /* Карточка: контейнер с clipping — решает мерцание borderRadius */
  cardContainer: {
    width: cardWidth,
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
  },

  /* фон */
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },

  /* оверлеи */
  captionBox: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    right: 110,
  },
  brandLine: { color: '#fff', fontWeight: '800', fontSize: 16 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  price: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 8 },
  pill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  /* бейдж партнёра (упростил тени для плавности) */
  logoBadge: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    // лёгкая тень; на Android только elevation
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPHText: { color: '#333', fontWeight: '800', fontSize: 20 },

  empty: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 16 },
});

export default VoucherCarousel;