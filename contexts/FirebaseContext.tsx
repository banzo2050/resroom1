import { createContext, useContext, ReactNode } from 'react';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Analytics } from 'firebase/analytics';
import { auth, db, storage, analytics } from '@/lib/firebase';

interface FirebaseContextType {
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  analytics: Analytics | null;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    auth,
    db,
    storage,
    analytics
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}; 