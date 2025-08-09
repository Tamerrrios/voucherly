import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import 'moment/locale/ru';
import { AuthContext } from '../context/AuthContext';
import GradientHeader from '../components/GradientHeader';
import { useNavigation } from '@react-navigation/native';


const MyOrdersScreen = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);


  
  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('orders')
      .where('userID', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const fetchedOrders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(fetchedOrders);
          setLoading(false);
        },
        err => {
          console.error('Ошибка загрузки заказов', err);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user]);

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* <Image
          source={require('../../assets/images/store.png')}
          style={styles.icon}
        /> */}
        <Text style={styles.partnerName}>
          {item.parnertName || 'Партнёр не указан'}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Стоимость:</Text>
        <Text style={styles.price}>
          {item.voucher?.price
            ? `${item.voucher.price.toLocaleString('ru-RU')} Сум`
            : '-'}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Дата заказа:</Text>
        <Text style={styles.date}>
          {item.createdAt?.toDate
            ? moment(item.createdAt.toDate()).format('DD MMM YYYY, HH:mm')
            : '-'}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Статус:</Text>
        <Text style={styles.status}>{item.status || 'Доставлен'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {/* <Image
          source={require('../../assets/images/empty-box.png')}
          style={{ width: 100, height: 100, marginBottom: 16 }}
        /> */}
        <Text style={styles.emptyText}>У вас пока нет заказов</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <GradientHeader title="Мои заказы" showBackButton = {true} />
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#6C63FF',
  },
  partnerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#888',
    fontSize: 13,
  },
  price: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: '#555',
  },
  status: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00AA00',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MyOrdersScreen;
// import React, { useEffect, useState, useContext } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
// import { AuthContext } from '../context/AuthContext';
// import moment from 'moment';
// import GradientHeader from '../components/GradientHeader'; // наш кастомный header


// const MyOrdersScreen = ({ navigation }) => {
//   const { user } = useContext(AuthContext);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const documentId = firestore.FieldPath.documentId;

//   useEffect(() => {
//     if (!user) return;

//     const unsubscribe = firestore()
//     .collection('orders')
//     .where('userID', '==', user.uid)
//     .orderBy('createdAt', 'desc')
//       .onSnapshot(snapshot => {
//         const fetchedOrders = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setOrders(fetchedOrders);
//         setLoading(false);
//       }, err => {
//         console.error('Ошибка загрузки заказов', err);
//         setLoading(false);
//       });

//     return () => unsubscribe();
//   }, [user]);

//   const renderOrder = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
//     >
//       <Text style={styles.partnerName}>{item.parnertName || 'Партнёр не указан'}</Text>
//       <Text style={styles.price}>{item.voucher?.price ? `${item.voucher.price.toLocaleString('ru-RU')} Сум` : '-'}</Text>
//       <Text style={styles.date}>{item.createdAt?.toDate ? moment(item.createdAt.toDate()).format('DD.MM.YYYY HH:mm') : '-'}</Text>
//       <Text style={styles.status}>{item.status || 'Статус не указан'}</Text>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#6C63FF" />
//       </View>
//     );
//   }

//   if (orders.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>У вас пока нет заказов</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <GradientHeader title="Мои заказы" />
//     <FlatList
//       data={orders}
//       renderItem={renderOrder}
//       keyExtractor={item => item.id}
//       contentContainerStyle={styles.listContainer}
//     />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   listContainer: {
//     padding: 16,
//     backgroundColor: '#f9f9f9',
//   },
//   card: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//     elevation: 3,
//   },
//   partnerName: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 4,
//     color: '#333',
//   },
//   price: {
//     fontSize: 14,
//     color: '#6C63FF',
//     marginBottom: 4,
//   },
//   date: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   status: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#00AA00',
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex:1,
//     justifyContent:'center',
//     alignItems:'center',
//     padding: 16,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//   },
// });

// export default MyOrdersScreen;