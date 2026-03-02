// import React, { useEffect, useState, useMemo } from 'react';
// import { View, Text, StyleSheet, FlatList, Platform, StatusBar } from 'react-native';
// import PartnerList from '../components/PartnerList';
// import SearchBar from '../components/SearchBar';
// import LottieView from 'lottie-react-native';
// import GradientHeader from '../components/GradientHeader';
// import firestore from '@react-native-firebase/firestore';

// type Props = { route: { params?: { categoryId?: string; categoryName?: string } } };

// const VouchersScreen: React.FC<Props> = ({ route }) => {
//   const categoryId = route?.params?.categoryId ?? null;
//   const categoryName = route?.params?.categoryName ?? 'Ваучеры';

//   const [partners, setPartners] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [searching, setSearching] = useState(false);
//   const [filteredPartners, setFilteredPartners] = useState<any[]>([]);

//   // --- Загрузка партнёров: по категории или все (fallback)
//   useEffect(() => {
//     let unsub: (() => void) | undefined;
//     setLoading(true);

//     const col = firestore().collection('partners');

//     const q = categoryId
//       ? col.where('categoryIds', 'array-contains', categoryId)
//       : col; // старое поведение, если пришли без категории

//     unsub = q.onSnapshot(
//       snap => {
//         const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//         setPartners(list);
//         setLoading(false);
//       },
//       err => {
//         console.error(err);
//         setPartners([]);
//         setLoading(false);
//       }
//     );

//     return () => unsub && unsub();
//   }, [categoryId]);

//   // --- Поиск по уже загруженному списку
//   useEffect(() => {
//     setSearching(true);
//     const t = setTimeout(() => {
//       const q = searchQuery.trim().toLowerCase();
//       if (!q) setFilteredPartners(partners);
//       else setFilteredPartners(partners.filter(p => (p.name || '').toLowerCase().includes(q)));
//       setSearching(false);
//     }, 250);
//     return () => clearTimeout(t);
//   }, [searchQuery, partners]);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView source={require('../../assets/animations/loader.json')} autoPlay loop style={styles.lottie}/>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.statusBarSpacer} />
//       <GradientHeader title={categoryName} />

//       <FlatList
//         data={[]}
//         keyExtractor={() => 'main'}
//         ListHeaderComponent={
//           <View>
//             <View style={{ marginBottom: 16 }}>
//               <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
//             </View>

//             {searching ? (
//               <View style={styles.searchLoader}>
//                 <LottieView source={require('../../assets/animations/loader.json')} autoPlay loop style={{ width: 60, height: 60 }}/>
//               </View>
//             ) : filteredPartners.length === 0 ? (
//               <View style={styles.emptyResult}>
//                 <LottieView source={require('../../assets/animations/emptySearch.json')} autoPlay loop style={{ width: 150, height: 150 }}/>
//                 <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
//                   Ничего не найдено {searchQuery ? `по запросу "${searchQuery}"` : 'в этой категории'}
//                 </Text>
//               </View>
//             ) : (
//               <PartnerList partners={filteredPartners} />
//             )}
//           </View>
//         }
//         renderItem={null}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       />
//     </View>
//   );
// };

// export default VouchersScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FAFAFA',
//   },
//   statusBarSpacer: {
//     height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//     backgroundColor: '#6C63FF',
//   },
//   headerWrapper: {
//     backgroundColor: '#6C63FF',
//     zIndex: 10,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FAFAFA',
//   },
//   lottie: {
//     width: 100,
//     height: 100,
//   },
//   searchLoader: {
//     alignItems: 'center',
//     marginTop: 20,
//     marginBottom: 30,
//   },
//   emptyResult: {
//     alignItems: 'center',
//     paddingVertical: 40,
//     paddingHorizontal: 20,
//   },
// });

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, StatusBar } from 'react-native';
import PartnerList from '../components/PartnerList';
import SearchBar from '../components/SearchBar';
import LottieView from 'lottie-react-native';
import GradientHeader from '../components/GradientHeader';
import firestore from '@react-native-firebase/firestore';
import { useLocalization } from '../context/LocalizationContext';

type Props = { route: { params?: { categoryId?: string; categoryName?: string } } };

const VouchersScreen: React.FC<Props> = ({ route }) => {
  const { language } = useLocalization();
  // categoryId — ЭТО SLUG ИЗ ПОЛЯ `id` ВНУТРИ ДОКУМЕНТА КАТЕГОРИИ (напр. "clothes")
  const categoryId = route?.params?.categoryId ?? null;
  const copy = {
    ru: { vouchers: 'Ваучеры', emptyStart: 'Ничего не найдено', byQuery: 'по запросу', byCategory: 'в этой категории' },
    uz: { vouchers: 'Vaucherlar', emptyStart: 'Hech narsa topilmadi', byQuery: 'so‘rov bo‘yicha', byCategory: 'ushbu kategoriyada' },
    en: { vouchers: 'Vouchers', emptyStart: 'Nothing found', byQuery: 'for query', byCategory: 'in this category' },
  }[language];
  const [categoryTitle, setCategoryTitle] = useState<string>(route?.params?.categoryName ?? copy.vouchers);

  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filteredPartners, setFilteredPartners] = useState<any[]>([]);

  // ---- Фолбэк: подтянуть title категории по её slug (если не передали)
  useEffect(() => {
    if (!categoryId || route?.params?.categoryName) return;
    const unsub = firestore()
      .collection('categories')
      .where('id', '==', categoryId)     // <-- ищем по полю id (slug)
      .limit(1)
      .onSnapshot(snap => {
        const doc = snap.docs[0];
        const data = doc?.data() as any;
        if (data?.title) setCategoryTitle(data.title);
      });
    return () => unsub();
  }, [categoryId, route?.params?.categoryName]);

  // ---- Загрузка партнёров ПО SLUG-У категории
  useEffect(() => {
    let unsub: (() => void) | undefined;
    setLoading(true);

    const col = firestore().collection('partners');

    const q = categoryId
      ? col.where('categoryIds', 'array-contains', categoryId) // <-- slug внутри массива
      : col;

    unsub = q.onSnapshot(
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPartners(list);
        setLoading(false);
      },
      err => {
        console.error(err);
        setPartners([]);
        setLoading(false);
      }
    );

    return () => unsub && unsub();
  }, [categoryId]);

  // ---- Поиск по загруженному списку
  useEffect(() => {
    setSearching(true);
    const t = setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) setFilteredPartners(partners);
      else setFilteredPartners(partners.filter(p => (p.name || '').toLowerCase().includes(q)));
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, partners]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView source={require('../../assets/animations/loader.json')} autoPlay loop style={styles.lottie}/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBarSpacer} />
      <GradientHeader title={categoryTitle} />

      <FlatList
        data={[]}
        keyExtractor={() => 'main'}
        ListHeaderComponent={
          <View>
            <View style={{ marginBottom: 16 }}>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            </View>

            {searching ? (
              <View style={styles.searchLoader}>
                <LottieView source={require('../../assets/animations/loader.json')} autoPlay loop style={{ width: 60, height: 60 }}/>
              </View>
            ) : filteredPartners.length === 0 ? (
              <View style={styles.emptyResult}>
                <LottieView source={require('../../assets/animations/emptySearch.json')} autoPlay loop style={{ width: 150, height: 150 }}/>
                <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                  {copy.emptyStart} {searchQuery ? `${copy.byQuery} "${searchQuery}"` : copy.byCategory}
                </Text>
              </View>
            ) : (
              <PartnerList partners={filteredPartners} />
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

export default VouchersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  statusBarSpacer: { height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#6C63FF' },
  headerWrapper: { backgroundColor: '#6C63FF', zIndex: 10, elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  scrollContent: { paddingBottom: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  lottie: { width: 100, height: 100 },
  searchLoader: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  emptyResult: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
});