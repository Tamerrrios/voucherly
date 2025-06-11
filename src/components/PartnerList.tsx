import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth - 32;

const PartnerList = ({ partners }: { partners: any[] }) => {
  const navigation = useNavigation();

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      useNativeDriver
    >
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() =>
          navigation.navigate('Supplier', { partnerId: item.partnerId })
        }
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.card}
          imageStyle={{ borderRadius: 16, width: '100%' }}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Перейти</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Популярное</Text>
      <FlatList
        data={partners}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: -16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  list: {
    paddingVertical: 8,
  },
  cardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    width: cardWidth,
    height: 150,
    borderRadius: 16,
    justifyContent: 'flex-end',
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  overlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    maxWidth: '75%',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  buttonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PartnerList;