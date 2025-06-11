import React from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';

type BackButtonProps = {
  onPress: () => void;
  size?: number;
  iconSize?: number;
  style?: object;
  disabled?: boolean;
};

const BackButton: React.FC<BackButtonProps> = ({ 
  onPress, 
  size = 44, 
  iconSize = 20, 
  style,
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        }
      ]}>
        <Image
          source={require('../../assets/images/left-arrow.png')} 
          style={[
            styles.icon,
            {
              width: iconSize,
              height: iconSize,
            }
          ]}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Тень для iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        // Тень для Android
        elevation: 5,
      },
    }),
  },
  icon: {
    tintColor: '#333333', // Цвет иконки
  },
  disabled: {
    opacity: 0.5,
  },
});

export default BackButton;