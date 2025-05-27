import { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export const useAnnouncements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAnnouncements = async (filters?: { type?: string; targetBlocks?: string[] }) => {
    try {
      setLoading(true);
      let q = collection(db, 'announcements');
      
      if (filters) {
        const constraints = [];
        if (filters.type) constraints.push(where('type', '==', filters.type));
        if (filters.targetBlocks) {
          constraints.push(where('target_blocks', 'array-contains-any', filters.targetBlocks));
        }
        
        q = query(q, ...constraints, orderBy('publish_at', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (announcementData: any) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'announcements'), {
        ...announcementData,
        author_id: user?.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAnnouncement = async (announcementId: string, data: any) => {
    try {
      setLoading(true);
      const announcementRef = doc(db, 'announcements', announcementId);
      await updateDoc(announcementRef, {
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
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement
  };
}; 