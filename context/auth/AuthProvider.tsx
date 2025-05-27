import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../main';
import { AuthContextType, CustomUser, UserData, UserRole } from './types';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              ...firebaseUser,
              role: userData.role,
              studentId: userData.student_id,
              firstName: userData.full_name?.split(' ')[0] || '',
              lastName: userData.full_name?.split(' ').slice(1).join(' ') || ''
            });
          } else {
            console.warn('User profile not found in Firestore');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<CustomUser> => {
    try {
      setIsLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'profiles', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const customUser = {
          ...userCredential.user,
          role: userData.role,
          studentId: userData.student_id,
          firstName: userData.full_name?.split(' ')[0] || '',
          lastName: userData.full_name?.split(' ').slice(1).join(' ') || ''
        };
        setUser(customUser);
        return customUser;
      }
      
      throw new Error('User profile not found');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: Partial<UserData>): Promise<CustomUser> => {
    try {
      setIsLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const newUserData: UserData = {
        id: userCredential.user.uid,
        email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role || 'student',
        studentId: userData.studentId,
        gender: userData.gender,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);

      return {
        ...userCredential.user,
        role: newUserData.role,
        studentId: newUserData.studentId,
        name: `${newUserData.firstName} ${newUserData.lastName}`
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user?.role) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        error,
        login, 
        logout, 
        register,
        hasRole,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
