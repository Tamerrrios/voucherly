import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const vouchers = [
  { id: '1', name: 'Chayhona Navat', price: '100 000 сум', image: require('../../assets/images/voucher2.png') },
  { id: '2', name: 'Street Coffee', price: '50 000 сум', image: require('../../assets/images/voucher2.png') },
];

const VoucherList = () => (
  <FlatList
    data={vouchers}
    keyExtractor={item => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.card}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </TouchableOpacity>
    )}
    contentContainerStyle={styles.list}
  />
);

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 160,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  price: {
    marginTop: 6,
    fontSize: 16,
    color: '#888',
  },
});

export default VoucherList;