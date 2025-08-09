import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import GradientHeader from '../components/GradientHeader';
import VoucherCodeModal from '../components/VoucherCodeModal';


const MyVouchersScreen = () => {
  const vouchers = [
    {
      id: '1',
      partnerName: 'Café de Paris',
      image: require('../../assets/images/addidas.png'),
      price: 50000,
      createdAt: '2025-06-01',
      status: 'active',
      code: 'ABCD-1234',
    },
    {
      id: '2',
      partnerName: 'Burger Hero',
      image: require('../../assets/images/addidas.png'),
      price: 70000,
      createdAt: '2025-05-15',
      status: 'used',
      code: 'XZY9-4567',
    },
  ];

  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const renderVoucher = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.partnerName}>{item.partnerName}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()} сум</Text>
        <Text style={styles.date}>Получен: {item.createdAt}</Text>
        <Text
          style={[
            styles.status,
            item.status === 'used' ? styles.used : styles.active,
          ]}
        >
          {item.status === 'used' ? 'Использован' : 'Активен'}
        </Text>
        {item.status === 'active' && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log('👆 Нажали показать код:', item.code);
              setSelectedCode(item.code);
            }}
          >
            <Text style={styles.buttonText}>Показать код</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <GradientHeader title="Мои ваучеры" showBackButton />
      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id}
        renderItem={renderVoucher}
        contentContainerStyle={styles.listContainer}
      />

      <VoucherCodeModal
        visible={!!selectedCode}
        code={selectedCode || ''}
        onClose={() => setSelectedCode(null)}
      />
    </View>
  );
};

export default MyVouchersScreen;

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    paddingBottom: 8,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 15,
    color: '#4CAF50',
    marginTop: 4,
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  status: {
    marginTop: 6,
    fontWeight: 'bold',
    fontSize: 13,
  },
  used: {
    color: '#999',
  },
  active: {
    color: '#2196F3',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#E53935',
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});

// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
// import GradientHeader from '../components/GradientHeader';
// import { StyleSheet } from 'react-native';
// import { BottomSheetModal } from '@gorhom/bottom-sheet';
// import { VoucherCodeSheet } from '../components/VoucherCodeSheet'; 

// const MyVouchersScreen = () => {
//   const vouchers = [
//     {
//       id: '1',
//       partnerName: 'Café de Paris',
//       image: require('../../assets/images/addidas.png'),
//       price: 50000,
//       createdAt: '2025-06-01',
//       status: 'active',
//       code: 'ABCD-1234',
//     },
//     {
//       id: '2',
//       partnerName: 'Burger Hero',
//       image: require('../../assets/images/addidas.png'),
//       price: 70000,
//       createdAt: '2025-05-15',
//       status: 'used',
//       code: 'XZY9-4567',
//     },
//   ];

//   const voucherSheetRef = useRef<BottomSheetModal>(null);
//   const [selectedCode, setSelectedCode] = useState<string | null>(null);

// useEffect(() => {
//   if (selectedCode && voucherSheetRef.current) {
//     console.log('📦 Calling present()...');
//     setTimeout(() => {
//       voucherSheetRef.current?.present();
//     }, 100);
//   }
// }, [selectedCode]);

//   const renderVoucher = ({ item }) => (
//     <View style={styles.card}>
//       <Image source={item.image} style={styles.image} />
//       <View style={styles.content}>
//         <Text style={styles.partnerName}>{item.partnerName}</Text>
//         <Text style={styles.price}>{item.price.toLocaleString()} сум</Text>
//         <Text style={styles.date}>Получен: {item.createdAt}</Text>
//         <Text
//           style={[
//             styles.status,
//             item.status === 'used' ? styles.used : styles.active,
//           ]}
//         >
//           {item.status === 'used' ? 'Использован' : 'Активен'}
//         </Text>
//         {item.status === 'active' && (
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => {
//               console.log('👆 Нажали показать код:', item.code);
//               setSelectedCode(item.code);
//             }}
//           >
//             <Text style={styles.buttonText}>Показать код</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );

//   return (
//     <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
//       <GradientHeader title="Мои ваучеры" showBackButton />
//       <FlatList
//         data={vouchers}
//         keyExtractor={(item) => item.id}
//         renderItem={renderVoucher}
//         contentContainerStyle={styles.listContainer}
//       />

//       {selectedCode && (
//         <>
//           {console.log('✅ VoucherCodeSheet rendered with:', selectedCode)}
//           <VoucherCodeSheet ref={voucherSheetRef} code={selectedCode} />
//         </>
//       )}
//     </View>
//   );
// };

// export default MyVouchersScreen;


// const styles = StyleSheet.create({
//   listContainer: {
//     padding: 16,
//   },
// card: {
//   backgroundColor: '#fff',
//   borderRadius: 16,
//   marginBottom: 16,
//   paddingBottom: 8,
//   overflow: Platform.OS === 'android' ? 'hidden' : 'visible',

//   // iOS-тень
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 6 },
//   shadowOpacity: 0.1,
//   shadowRadius: 10,

//   // Android-тень
//   elevation: 6,
// },
//   image: {
//     width: '100%',
//     height: 140,
//     resizeMode: 'cover',
//       borderRadius: 16,
//   },
//   content: {
//     padding: 16,
//   },
//   partnerName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   price: {
//     fontSize: 15,
//     color: '#4CAF50',
//     marginTop: 4,
//   },
//   date: {
//     fontSize: 13,
//     color: '#888',
//     marginTop: 2,
//   },
//   status: {
//     marginTop: 6,
//     fontWeight: 'bold',
//     fontSize: 13,
//   },
//   used: {
//     color: '#999',
//   },
//   active: {
//     color: '#2196F3',
//   },
//   button: {
//     marginTop: 12,
//     backgroundColor: '#E53935',
//     paddingVertical: 8,
//     borderRadius: 10,
//   },
//   buttonText: {
//     textAlign: 'center',
//     color: '#fff',
//     fontWeight: '600',
//   },
// });
