import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChangeText }) => (
  <View style={styles.container}>
    <Image
      source={require('../../assets/images/search.png')}
      style={styles.icon}
    />
    <TextInput
      style={styles.input}
      placeholder="Поиск ваучеров и магазинов"
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText('')}>
        <Image
          source={require('../../assets/images/close.png')} // ← добавь эту иконку в assets/images/
          style={styles.clearIcon}
        />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    margin: 16,
    borderRadius: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#999',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  clearIcon: {
    width: 20,
    height: 20,
    tintColor: '#999',
    marginLeft: 8,
  },
});

export default SearchBar;
// import React from 'react';
// import { View, TextInput, StyleSheet, Image } from 'react-native';

// interface Props {
//   value: string;
//   onChangeText: (text: string) => void;
// }

// const SearchBar: React.FC<Props> = ({ value, onChangeText }) => (
//   <View style={styles.container}>
//     <Image
//       source={require('../../assets/images/search.png')}
//       style={styles.icon}
//     />
//     <TextInput
//       style={styles.input}
//       placeholder="Поиск ваучеров и магазинов"
//       placeholderTextColor="#999"
//       value={value}
//       onChangeText={onChangeText}
//     />
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     backgroundColor: '#EFEFEF',
//     margin: 16,
//     borderRadius: 14,
//     paddingHorizontal: 12,
//     alignItems: 'center',
//   },
//   icon: {
//     width: 18,
//     height: 18,
//     marginRight: 8,
//     tintColor: '#999',
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 10,
//   },
// });

// export default SearchBar;