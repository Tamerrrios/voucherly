

// import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Platform } from 'react-native';
import { firestore } from '../firebase/firebase';
import storage from '@react-native-firebase/storage';



export const getBanners = async () => {
  const snapshot = await firestore().collection('banners').get();
  const banners = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  return banners;
};

export const getPartnerWithVouchers = async (partnerId: string) => {
  const partnerRef = firestore().collection('partners').doc(partnerId);
  const partnerSnap = await partnerRef.get();

  if (!partnerSnap.exists) throw new Error('Партнёр не найден');

  const partnerData = partnerSnap.data();

  const vouchersSnap = await partnerRef.collection('vouchers').get();

  const vouchers = vouchersSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    ...partnerData,
    vouchers,
  };
};

export const getPartners = async () => {
  try {
    const snapshot = await firestore().collection('partners').get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data;
  } catch (error) {
    console.error('Ошибка при получении партнёров:', error);
    return [];
  }
};

export const getVouchersByPartnerId = async (partnerId: string) => {
  try {
    const querySnapshot = await firestore()
      .collection('supplier')
      .where('partnerId', '==', partnerId)
      .get();

    const vouchers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return vouchers;
  } catch (error) {
    console.error('Ошибка получения ваучеров:', error);
    return [];
  }
};

export const getCategories = async () => {
  const snapshot = await firestore().collection('categories').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const searchPartners = async (searchTerm: string) => {
  const normalized = searchTerm.trim().toLowerCase();

  try {
    const snapshot = await firestore().collection('partners').get();
    const filtered = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((doc: any) =>
        doc.title?.toLowerCase().includes(normalized)
      );

    return filtered;
  } catch (error) {
    console.error('Ошибка поиска партнёров:', error);
    return [];
  }
};


export const uploadImageToFirebaseAlt = async (
  uri: string,
  storagePath: string,
): Promise<string> => {
  // исходный uri лучше не трогать — RNFirebase сам съест file://
  let localPath = uri;

  // иногда приходит без file:// — добавим
  if (!localPath.startsWith('file://')) {
    localPath = 'file://' + localPath;
  }

  // вытащим расширение
  const raw = localPath.split('?')[0];     // отрежем query
  const ext = raw.split('.').pop() || 'jpg';

  // итоговый путь в бакете
  const refPath = `${storagePath}.${ext}`;
  const ref = storage().ref(refPath);

  console.log('STORAGE_UPLOAD', { localPath, refPath });

  // если putFile упадёт — вылетит ошибка
  await ref.putFile(localPath);

  // если файла нет по refPath — здесь как раз будет [object-not-found]
  const url = await ref.getDownloadURL();
  console.log('STORAGE_URL', url);
  return url;
};