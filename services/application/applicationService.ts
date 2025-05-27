import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/main';

export interface Application {
  id: string;
  student_id: string;
  room_id: string;
  block_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: Timestamp;
  updated_at: Timestamp;
  processed_at?: Timestamp;
  processed_by?: string;
  notes?: string;
  semester: number;
  academic_year: string;
}

export const applicationService = {
  // Get all applications
  async getApplications(): Promise<Application[]> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
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

  // Get application by ID
  async getApplicationById(id: string): Promise<Application | null> {
    try {
      const applicationDoc = await getDoc(doc(db, 'applications', id));
      if (applicationDoc.exists()) {
        return {
          id: applicationDoc.id,
          ...applicationDoc.data()
        } as Application;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new application
  async createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Application> {
    try {
      const now = Timestamp.now();
      const applicationData: Omit<Application, 'id'> = {
        ...application,
        status: 'pending',
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      return {
        id: docRef.id,
        ...applicationData
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update application
  async updateApplication(id: string, updates: Partial<Application>): Promise<void> {
    try {
      const applicationRef = doc(db, 'applications', id);
      const now = Timestamp.now();
      const updateData: Partial<Application> = {
        ...updates,
        updated_at: now
      };

      if (updates.status && updates.status !== 'pending') {
        updateData.processed_at = now;
      }

      await updateDoc(applicationRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete application
  async deleteApplication(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'applications', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get applications by student
  async getApplicationsByStudent(studentId: string): Promise<Application[]> {
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

  // Get applications by room
  async getApplicationsByRoom(roomId: string): Promise<Application[]> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('room_id', '==', roomId),
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
        where('block_id', '==', blockId),
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

  // Get pending applications
  async getPendingApplications(): Promise<Application[]> {
    return this.getApplicationsByStatus('pending');
  },

  // Get approved applications
  async getApprovedApplications(): Promise<Application[]> {
    return this.getApplicationsByStatus('approved');
  },

  // Get rejected applications
  async getRejectedApplications(): Promise<Application[]> {
    return this.getApplicationsByStatus('rejected');
  },

  // Get cancelled applications
  async getCancelledApplications(): Promise<Application[]> {
    return this.getApplicationsByStatus('cancelled');
  }
}; 