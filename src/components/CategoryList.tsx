import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';

interface Category {
  id: string;
  title: string;
  imageUrl: string;
}

const CategoryCard = ({ item, index }: { item: Category; index: number }) => (
  <Animatable.View
    animation="fadeInUp"
    delay={index * 100}
    duration={400}
    useNativeDriver
  >
    <TouchableOpacity activeOpacity={0.8} style={styles.card}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.image}
        imageStyle={{ borderRadius: 20 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  </Animatable.View>
);

const CategoryList = ({
  categories = [],
  onSeeAll,
}: {
  categories: Category[];
  onSeeAll?: () => void;
}) => {
    const handlePress = (category: Category) => {
    Alert.alert('Скоро!', `Раздел  скоро будет доступен`);
  };


  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Категории</Text>
        <TouchableOpacity style={styles.seeAllButton} onPress={handlePress}>
          <Text style={styles.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CategoryCard item={item} index={index} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android shadow
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  seeAllButton: {
    backgroundColor: '#E53935',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  seeAllText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  content: {
    paddingBottom: 8,
  },
  card: {
    width: (Dimensions.get('window').width - 24 * 2 - 16) / 2,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default CategoryList;