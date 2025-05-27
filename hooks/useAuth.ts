import { useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (userDoc.exists()) {
          setUser({ ...user, ...userDoc.data() });
        } else {
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, userData: any) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (userData.full_name) {
        await updateProfile(user, {
          displayName: userData.full_name
        });
      }

      // Create user profile in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        id: user.uid,
        email: user.email,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during password reset');
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword
  };
}; 