import { toast } from '@/components/ui/sonner';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { User, UserRole } from '../../types';

export const useAuthActions = (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || 'Login failed');
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error("Logout failed:", error);
      setError(error.message || 'Logout failed');
      toast.error(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    studentId: string,
    gender: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user profile in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        id: user.uid,
        email: user.email,
        full_name: `${firstName} ${lastName}`,
        student_id: studentId,
        gender: gender,
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      toast.success('Account created successfully! Please check your email to verify your account.');
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error.message || 'Registration failed');
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Force a token refresh
        await currentUser.getIdToken(true);
      }
    } catch (error: any) {
      console.error("Error refreshing user data:", error);
      setError(error.message || 'Failed to refresh user data');
      toast.error(error.message || 'Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  };

  const bypassAuth = (role: UserRole = 'admin') => {
    console.warn('Bypassing authentication - FOR DEVELOPMENT ONLY');
    const mockUser: User = {
      id: `bypass-${role}-${Date.now()}`,
      email: role === 'admin' ? 'admin@uneswa.ac.sz' : 'student@uneswa.ac.sz',
      firstName: role === 'admin' ? 'Admin' : 'Student',
      lastName: 'User',
      role: role,
      gender: 'male',
      studentId: role === 'student' ? '12345678' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(mockUser);
  };

  return {
    login,
    logout,
    register,
    bypassAuth,
    refreshUser
  };
};
