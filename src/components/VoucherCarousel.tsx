import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const screenWidth = Dimensions.get('window').width;
const horizontalPadding = 16;
const cardWidth = screenWidth - horizontalPadding * 2;

interface VoucherCarouselProps {
  vouchers: any[];
  onFocus?: (voucher: any) => void;
}

const VoucherCarousel = ({ vouchers, onFocus }: VoucherCarouselProps) => {
  const isSingle = vouchers.length === 1;
  const isLoopable = vouchers.length > 1;

  useEffect(() => {
    if (isSingle && onFocus) {
      onFocus(vouchers[0]);
    }
  }, [vouchers]);

  if (!vouchers || vouchers.length === 0) {
    return <Text style={styles.empty}>Нет доступных ваучеров</Text>;
  }

  return (
    <View style={styles.wrapper}>
      <Carousel
        data={vouchers}
        width={cardWidth}
        height={180}
        loop={isLoopable}
        // autoPlay={isLoopable}
        // autoPlayInterval={4000}
        pagingEnabled={!isSingle}
        enabled={!isSingle}
        style={styles.carousel}
        mode={isLoopable ? 'parallax' : undefined}
        modeConfig={
          isLoopable
            ? {
                parallaxScrollingOffset: 60,
                parallaxScrollingScale: 0.9,
              }
            : undefined
        }
        onSnapToItem={(index) => {
          if (onFocus) onFocus(vouchers[index]);
        }}
        renderItem={({ item }) => (
          <ImageBackground
            source={{ uri: item.imageUrl }}
            style={styles.card}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.overlay}>
              <Text style={styles.price}>
                {item.price.toLocaleString('ru-RU')} сум
              </Text>
              <Text style={styles.desc}>{item.title}</Text>
            </View>
          </ImageBackground>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: horizontalPadding,
    marginTop: 20,
  },
  carousel: {
    overflow: 'visible',
  },
  card: {
    width: cardWidth,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  overlay: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  price: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  desc: {
    color: '#eee',
    fontSize: 14,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 16,
  },
});

export default VoucherCarousel;