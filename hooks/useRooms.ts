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

export const useRooms = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRooms = async (filters?: { blockId?: string; status?: string; gender?: string }) => {
    try {
      setLoading(true);
      let q = collection(db, 'rooms');
      
      if (filters) {
        const constraints = [];
        if (filters.blockId) constraints.push(where('block_id', '==', filters.blockId));
        if (filters.status) constraints.push(where('status', '==', filters.status));
        if (filters.gender) constraints.push(where('gender', '==', filters.gender));
        
        q = query(q, ...constraints, orderBy('room_number'));
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

  const addRoom = async (roomData: any) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'rooms'), {
        ...roomData,
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

  const updateRoom = async (roomId: string, data: any) => {
    try {
      setLoading(true);
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
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
    getRooms,
    addRoom,
    updateRoom
  };
}; 