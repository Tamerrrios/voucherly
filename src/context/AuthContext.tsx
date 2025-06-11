
import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface CustomUser {
  uid: string;
  email: string | null;
  name?: string;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      await firebaseUser.reload(); // Обновляем пользователя
      const docSnap = await firestore().collection('users').doc(firebaseUser.uid).get();
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: data?.name || '',
        });
      } else {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);

  const login = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const register = async (email: string, password: string, userName: string) => {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  const firebaseUser = userCredential.user;

  await firestore().collection('users').doc(firebaseUser.uid).set({
    email,
    name: userName,
    createdAt: new Date().toISOString(),
  });

  await firebaseUser.reload();

  setUser({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: userName,
  });
};


  const logout = async () => {
    await auth().signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
