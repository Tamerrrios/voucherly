
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { db } from '../firebase/firebase';

export const getBanners = async () => {
  const snapshot = await getDocs(collection(db, 'banners'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getPartnerWithVouchers = async (partnerId: string) => {
  const partnerRef = doc(db, 'partners', partnerId);
  const partnerSnap = await getDoc(partnerRef);

  if (!partnerSnap.exists()) throw new Error('Партнёр не найден');

  const partnerData = partnerSnap.data();

  const vouchersSnap = await getDocs(collection(db, 'partners', partnerId, 'vouchers'));
  const vouchers = vouchersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  return { ...partnerData, vouchers };
};

export const getPartners = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'partners'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Ошибка при получении партнёров:', error);
    return [];
  }
};

export const getVouchersByPartnerId = async (partnerId: string) => {
  try {
    const q = query(collection(db, 'supplier'), where('partnerId', '==', partnerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Ошибка получения ваучеров:', error);
    return [];
  }
};

export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const searchPartners = async (searchTerm: string) => {
  const normalized = searchTerm.trim().toLowerCase();
  try {
    const snapshot = await getDocs(collection(db, 'partners'));
    return snapshot.docs
      .map(d => ({ id: d.id, ...(d.data() as any) }))
      .filter((d: any) => d.title?.toLowerCase().includes(normalized));
  } catch (error) {
    console.error('Ошибка поиска партнёров:', error);
    return [];
  }
};

export const uploadImageToFirebaseAlt = async (
  uri: string,
  storagePath: string,
): Promise<string> => {
  let localPath = uri;

  const hasKnownScheme = /^(file|content|ph|assets-library):\/\//i.test(localPath);
  if (!hasKnownScheme) {
    localPath = `file://${localPath}`;
  }

  const raw = localPath.split('?')[0];
  const extMatch = raw.match(/\.([a-zA-Z0-9]+)$/);
  const ext = (extMatch?.[1] || 'jpg').toLowerCase();

  const refPath = `${storagePath}.${ext}`;
  const ref = storage().ref(refPath);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const getCode = (error: unknown) =>
    (error as { code?: string })?.code || '';

  console.log('STORAGE_UPLOAD', { localPath, refPath });

  try {
    const uploadResult = await ref.putFile(localPath);
    console.log('STORAGE_UPLOAD_DONE', {
      path: uploadResult?.metadata?.fullPath,
      size: uploadResult?.metadata?.size,
    });

    let lastError: unknown = null;
    // Storage metadata/url visibility can lag shortly after putFile on mobile.
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      try {
        const url = await ref.getDownloadURL();
        console.log('STORAGE_URL', { url, attempt });
        return url;
      } catch (error) {
        lastError = error;

        const code = getCode(error);
        const shouldRetry =
          !code ||
          code === 'storage/object-not-found' ||
          code === 'storage/retry-limit-exceeded' ||
          code === 'storage/unknown';

        if (!shouldRetry) {
          throw error;
        }

        console.log('STORAGE_URL_RETRY', { attempt, refPath, code });

        // Force metadata check before the next URL read to reduce race errors.
        try {
          await ref.getMetadata();
        } catch {
          // Metadata may still be unavailable for a short time; continue retrying.
        }

        await sleep(Math.min(6000, 300 * attempt));
      }
    }

    throw lastError;
  } catch (error) {
    console.error('STORAGE_UPLOAD_FAILED', { localPath, refPath, error });
    throw error;
  }
};
