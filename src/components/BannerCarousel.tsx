import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const horizontalPadding = 16;
const bannerWidth = width - horizontalPadding * 2;

const BannerCarousel = ({ banners }: { banners: any[] }) => {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.image}
        imageStyle={{ borderRadius: 16 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.overlay}
        >
          {!!item.title && (
            <View style={styles.titleContainer}>
              <View style={styles.textRow}>
                <Text
                  style={styles.title}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.title?.trim()}
                </Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('VoucherDetail', { id: item.itemId })}
                >
                  <Text style={styles.buttonText}>Перейти</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  return (
    <Carousel
      width={bannerWidth}
      height={160}
      data={banners}
      autoPlay
      loop
      autoPlayInterval={4000}
      scrollAnimationDuration={800}
      style={styles.carouselContainer}
      renderItem={renderItem}
      panGestureHandlerProps={{
        activeOffsetX: [-10, 10],
      }}
    />
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: bannerWidth,
    height: 160,
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  titleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
    marginRight: 8,
  },
  button: {
    backgroundColor: '#E53935',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BannerCarousel;
// import React from 'react';
// import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import LinearGradient from 'react-native-linear-gradient';

// const { width } = Dimensions.get('window');
// const horizontalPadding = 16;
// const bannerWidth = width - horizontalPadding * 2;

// const BannerCarousel = ({ banners }: { banners: any[] }) => {
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
//               <Text style={styles.title}>{item.title?.trim()}</Text>
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
//       panGestureHandlerProps={{
//         activeOffsetX: [-10, 10],
//       }}
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
//     paddingVertical: 6,
//     borderBottomLeftRadius: 16,
//     borderBottomRightRadius: 16,
//   },
//   title: {
//     fontSize: 15,
//     color: '#fff',
//     fontWeight: '700',
//   },
//   textRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     gap: 10,
//   },
  
//   button: {
//     backgroundColor: '#E53935',
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//   },
  
//   buttonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });

// export default BannerCarousel;