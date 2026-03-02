import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BackButton from './BackButton';

interface GradientHeaderProps {
  title: string;
  showBackButton?: boolean;
}

const GradientHeader: React.FC<GradientHeaderProps> = ({ title, showBackButton = false }) => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#E53935', '#FF6F61']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.innerContainer}>
        {showBackButton ? (
          <BackButton
            onPress={() => {
              console.log('Back pressed');
              navigation.goBack();
            }}
            size={24}
            iconSize={20}
            style={{
              position: 'absolute',
              left: 20,
              bottom: 10,
              zIndex: 10, // 👈 добавь обязательно!
            }}
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>

        {/* пустой View справа для симметрии */}
        <View style={styles.placeholder} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 120,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 6,
    borderRadius: 20,
  },
  placeholder: {
    width: 36, // ширина соответствует ширине иконки + паддинг
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginBottom: 10,
  },
});

export default GradientHeader;