import { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = async (userId: string) => {
    try {
      setLoading(true);
      const profileDoc = await getDoc(doc(db, 'profiles', userId));
      if (profileDoc.exists()) {
        return profileDoc.data();
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId: string, data: any) => {
    try {
      setLoading(true);
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, {
        ...data,
        updated_at: new Date().toISOString()
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getProfile,
    updateProfile
  };
}; 