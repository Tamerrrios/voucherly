import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Font } from '../theme/typography';
import { useLocalization } from '../context/LocalizationContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChangeText }) => {
  const { language } = useLocalization();
  const placeholder =
    language === 'uz'
      ? 'Vaucher yoki brend qidiring'
      : language === 'en'
        ? 'Search vouchers or brands'
        : 'Поиск ваучеров и брендов';

  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color="#A2A8B3" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A5ACB8"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearIconWrap}>
          <Ionicons name="close-circle" size={18} color="#C3C9D5" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 14,
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#EFEAE5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: Font.medium,
    fontSize: 15,
    height: 52,
    color: '#22252E',
  },
  clearIconWrap: {
    marginLeft: 6,
    padding: 2,
  },
});

export default SearchBar;