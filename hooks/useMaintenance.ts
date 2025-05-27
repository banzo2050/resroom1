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

export const useMaintenance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMaintenanceRequests = async (filters?: { studentId?: string; status?: string }) => {
    try {
      setLoading(true);
      let q = collection(db, 'maintenance_requests');
      
      if (filters) {
        const constraints = [];
        if (filters.studentId) constraints.push(where('student_id', '==', filters.studentId));
        if (filters.status) constraints.push(where('status', '==', filters.status));
        
        q = query(q, ...constraints, orderBy('created_at', 'desc'));
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

  const submitMaintenanceRequest = async (requestData: any) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'maintenance_requests'), {
        ...requestData,
        student_id: user?.uid,
        status: 'pending',
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

  const updateMaintenanceRequest = async (requestId: string, data: any) => {
    try {
      setLoading(true);
      const requestRef = doc(db, 'maintenance_requests', requestId);
      await updateDoc(requestRef, {
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
    getMaintenanceRequests,
    submitMaintenanceRequest,
    updateMaintenanceRequest
  };
}; 