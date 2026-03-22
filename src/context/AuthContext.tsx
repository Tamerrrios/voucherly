
import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
} from '@react-native-firebase/auth';
import { doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { db } from '../firebase/firebase';

const firebaseAuth = getAuth();

interface CustomUser {
  uid: string;
  email: string | null;
  phone?: string | null;
  name?: string | null;
  displayName?: string | null;
  phoneVerified?: boolean;
  authProvider?: string | null;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithCustomToken: (token: string) => Promise<void>;
  register: (email: string, password: string, userName: string) => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithCustomToken: async () => {},
  register: async () => {},
  updateProfileName: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (firebaseUser: NonNullable<typeof firebaseAuth.currentUser>, data?: Record<string, any>): CustomUser => {
    const normalizedName = (data?.name ?? firebaseUser.displayName ?? '').trim() || null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      phone: data?.phone || firebaseUser.phoneNumber || null,
      name: normalizedName,
      displayName: normalizedName,
      phoneVerified: data?.phoneVerified ?? !!firebaseUser.phoneNumber,
      authProvider: data?.authProvider ?? null,
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        await firebaseUser.reload();
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser(mapUser(firebaseUser, data));
        } else {
          const now = new Date().toISOString();
          await setDoc(
            doc(db, 'users', firebaseUser.uid),
            {
              email: firebaseUser.email ?? null,
              phone: firebaseUser.phoneNumber ?? null,
              phoneVerified: !!firebaseUser.phoneNumber,
              authProvider: firebaseUser.phoneNumber ? 'phone_otp' : 'email',
              name: (firebaseUser.displayName ?? '').trim() || null,
              updatedAt: now,
              createdAt: now,
              lastLoginAt: now,
            },
            { merge: true },
          );
          setUser(mapUser(firebaseUser, {
            phone: firebaseUser.phoneNumber ?? null,
            name: firebaseUser.displayName ?? null,
            phoneVerified: !!firebaseUser.phoneNumber,
            authProvider: firebaseUser.phoneNumber ? 'phone_otp' : 'email',
          }));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const now = new Date().toISOString();
    await setDoc(
      doc(db, 'users', credential.user.uid),
      {
        email: credential.user.email ?? email,
        name: (credential.user.displayName ?? '').trim() || null,
        authProvider: 'email',
        updatedAt: now,
        lastLoginAt: now,
      },
      { merge: true },
    );
  };

  const loginWithCustomToken = async (token: string) => {
    const credential = await signInWithCustomToken(firebaseAuth, token);
    const now = new Date().toISOString();
    await setDoc(
      doc(db, 'users', credential.user.uid),
      {
        phone: credential.user.phoneNumber ?? null,
        email: credential.user.email ?? null,
        name: (credential.user.displayName ?? '').trim() || null,
        phoneVerified: !!credential.user.phoneNumber,
        authProvider: 'phone_otp',
        updatedAt: now,
        lastLoginAt: now,
      },
      { merge: true },
    );
  };

  const register = async (email: string, password: string, userName: string) => {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const fbUser = userCredential.user;
    const normalizedName = userName.trim();
    const now = new Date().toISOString();

    if (normalizedName) {
      await fbUser.updateProfile({ displayName: normalizedName });
    }

    await setDoc(doc(db, 'users', fbUser.uid), {
      email,
      phone: null,
      phoneVerified: false,
      authProvider: 'email',
      name: normalizedName || null,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });

    await fbUser.reload();

    setUser(mapUser(fbUser, {
      email: fbUser.email,
      name: normalizedName || null,
      phone: null,
      phoneVerified: false,
      authProvider: 'email',
    }));
  };

  const updateProfileName = async (name: string) => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    const normalizedName = name.trim();
    if (normalizedName.length < 2) {
      throw new Error('Введите имя не короче 2 символов');
    }

    await currentUser.updateProfile({ displayName: normalizedName });
    await setDoc(
      doc(db, 'users', currentUser.uid),
      {
        name: normalizedName,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    setUser(prev =>
      prev
        ? {
            ...prev,
            name: normalizedName,
            displayName: normalizedName,
          }
        : prev,
    );
  };

  const logout = async () => {
    await signOut(firebaseAuth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithCustomToken, register, updateProfileName, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
