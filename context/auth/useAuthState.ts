import { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseAuthStateReturn {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthState = (): UseAuthStateReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.email);
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
              
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: userData.full_name?.split(' ')[0] || '',
              lastName: userData.full_name?.split(' ').slice(1).join(' ') || '',
              role: userData.role || 'student',
              gender: userData.gender || '',
              studentId: userData.student_id || '',
              createdAt: userData.created_at || new Date().toISOString(),
              updatedAt: userData.updated_at || new Date().toISOString(),
            });
          } else {
            // If no profile exists, create a basic user object
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: '',
              lastName: '',
              role: 'student',
              gender: '',
              studentId: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
        }
      } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
        setIsLoading(false);
    });
    
    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      unsubscribe();
    };
  }, []);

  return { 
    user, 
    isLoading, 
    setUser,
    setIsLoading
  };
};
