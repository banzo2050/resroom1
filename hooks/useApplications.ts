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

export const useApplications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApplications = async (filters?: { studentId?: string; status?: string }) => {
    try {
      setLoading(true);
      let q = collection(db, 'applications');
      
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

  const submitApplication = async (applicationData: any) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'applications'), {
        ...applicationData,
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

  const updateApplication = async (applicationId: string, data: any) => {
    try {
      setLoading(true);
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
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
    getApplications,
    submitApplication,
    updateApplication
  };
}; 