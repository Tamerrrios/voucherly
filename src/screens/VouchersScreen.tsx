import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  FlatList
} from 'react-native';
import PartnerList from '../components/PartnerList';
import SearchBar from '../components/SearchBar';
import { usePartners } from '../context/PartnersContext';
import LottieView from 'lottie-react-native';
import GradientHeader from '../components/GradientHeader'; // наш кастомный header


const VouchersScreen = () => {
  const { partners, popularPartners, loading } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filteredPartners, setFilteredPartners] = useState<any[]>([]);

  useEffect(() => {
    setFilteredPartners(partners);
  }, [partners]);

  useEffect(() => {
    setSearching(true);
    const delay = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredPartners(partners);
      } else {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = partners.filter(partner =>
          partner.name.toLowerCase().includes(lowerQuery)
        );
        setFilteredPartners(filtered);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, partners]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={require('../../assets/animations/loader.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBarSpacer} />
      <GradientHeader title="Ваучеры" />

      <FlatList
        data={[]}
        keyExtractor={() => 'main'}
        ListHeaderComponent={
          <View>
            <View style={{ marginBottom: 16, marginTop: 0 }}>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            
            {searchQuery.trim() === '' && popularPartners.length > 0 && (
              <View style={{ marginBottom: 8, paddingHorizontal: 24 }}>
                {/* Ваш контент для популярных партнеров */}
              </View>
            )}
            {searching ? (
              <View style={styles.searchLoader}>
                <LottieView
                  source={require('../../assets/animations/loader.json')}
                  autoPlay
                  loop
                  style={{ width: 60, height: 60 }}
                />
              </View>
            ) : filteredPartners.length === 0 && searchQuery.trim() !== '' ? (
              <View style={styles.emptyResult}>
                <LottieView
                  source={require('../../assets/animations/emptySearch.json')}
                  autoPlay
                  loop
                  style={{ width: 150, height: 150 }}
                />
                <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                  Ничего не найдено по запросу "{searchQuery}"
                </Text>
              </View>
            ) : (
              <PartnerList 
                partners={filteredPartners.filter(p => 
                  searchQuery.trim() ? true : p.isPopular
                )} 
              />
            )}
          </View>
        }
        renderItem={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#6C63FF',
  },
  headerWrapper: {
    backgroundColor: '#6C63FF',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  lottie: {
    width: 100,
    height: 100,
  },
  searchLoader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  emptyResult: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
});

export default VouchersScreen;