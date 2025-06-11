import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native-animatable';
import BackButton from './BackButton';

interface SupplierHeaderProps {
  bannerImg: string;
  name: string;
  description?: string;
  city?: string;
  phone?: string;
  instagram?: string;
}

const SupplierHeader: React.FC<SupplierHeaderProps> = ({
  bannerImg,
  name,
  description = '',
  city = '',
  phone = '',
  instagram = '',
}) => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={{ uri: bannerImg }}
      style={styles.header}
      imageStyle={styles.image}>
      <View style={styles.overlay}></View>

      <BackButton
        onPress={() => navigation.goBack()}
        size={30}
        iconSize={24}
        style={{ position: 'absolute', top: 50, left: 20 }}
      />

      <View style={styles.headerContent}>

        <Text style={styles.brandName}>{name}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 200,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  image: {
    resizeMode: 'stretch',
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 40,
    left: 16,
    zIndex: 10,
    padding: 6,
    borderRadius: 20,
  },
  headerContent: {
    padding: 16,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: '#fff',
    fontSize: 13,
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default SupplierHeader;

{/* <View style={styles.infoRow}>
          {city ? (
            <TouchableOpacity style={styles.infoButton}>
              <Image
                source={require('../../assets/images/map.png')}
                style={styles.icon}
              />
              <Text style={styles.infoText}>{city}</Text>
            </TouchableOpacity>
          ) : null}
          {phone ? (
            <TouchableOpacity style={styles.infoButton}>
               <Image
                source={require('../../assets/images/phone-call.png')}
                style={styles.icon}
              />

              <Text style={styles.infoText}>{phone}</Text>
            </TouchableOpacity>
          ) : null}
          {instagram ? (
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => Linking.openURL(instagram)}
            >
               <Image
                source={require('../../assets/images/instagram.png')}
                style={styles.icon}
              />
              <Text style={styles.infoText}>Instagram</Text>
            </TouchableOpacity>
          ) : null}
        </View> */}