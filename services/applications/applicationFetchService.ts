import { 
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '@/main';
import { Application } from './applicationBaseService';

export const applicationFetchService = {
  // Get applications by student ID
  async getApplicationsByStudentId(studentId: string): Promise<Application[]> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('student_id', '==', studentId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(applicationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get applications by status
  async getApplicationsByStatus(status: Application['status']): Promise<Application[]> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('status', '==', status),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(applicationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get applications by block
  async getApplicationsByBlock(blockId: string): Promise<Application[]> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('preferred_block_id', '==', blockId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(applicationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};

// Export the fetchApplications function
export const fetchApplications = async (filters?: {
  studentId?: string;
  status?: Application['status'];
  blockId?: string;
}): Promise<Application[]> => {
  try {
    let applicationsQuery = query(
      collection(db, 'applications'),
      orderBy('created_at', 'desc')
    );

    if (filters) {
      if (filters.studentId) {
        applicationsQuery = query(applicationsQuery, where('student_id', '==', filters.studentId));
      }
      
      if (filters.status) {
        applicationsQuery = query(applicationsQuery, where('status', '==', filters.status));
      }
      
      if (filters.blockId) {
        applicationsQuery = query(applicationsQuery, where('preferred_block_id', '==', filters.blockId));
      }
    }

    const snapshot = await getDocs(applicationsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Application[];
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};
