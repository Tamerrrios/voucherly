import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BackButton from './BackButton';
import { Text } from 'react-native-animatable';

interface SupplierHeaderProps {
  bannerImg?: string; // теперь опционально
  name: string;
  description?: string;
}

const SupplierHeader: React.FC<SupplierHeaderProps> = ({
  bannerImg,
  name,
  description = '',
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E53935', '#FF7043']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {bannerImg ? (
        <View style={styles.imageOverlay}>
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: 'rgba(0,0,0,0.35)' },
            ]}
          />
        </View>
      ) : null}

      {/* Кнопка назад */}
      <BackButton
        onPress={() => navigation.goBack()}
        size={30}
        iconSize={24}
        style={{ position: 'absolute', top: 50, left: 20 }}
      />

      {/* Контент */}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        {!!description && (
          <Text style={styles.desc} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  desc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
});

export default SupplierHeader;