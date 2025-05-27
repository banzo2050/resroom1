import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
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
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: Date;
  updated_at: Date;
  processed_at?: Date;
  processed_by?: string;
  notes?: string;
}

export interface ApplicationInput {
  student_id: string;
  room_id: string;
  reason: string;
}

// Create a new application
export const createApplication = async (application: ApplicationInput): Promise<Application> => {
  try {
    const now = Timestamp.now();
    const applicationData = {
      ...application,
      status: 'pending' as const,
      created_at: now,
      updated_at: now
    };
    
    const docRef = await addDoc(collection(db, 'applications'), applicationData);
    return {
      id: docRef.id,
      ...applicationData,
      created_at: now.toDate(),
      updated_at: now.toDate()
    };
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

// Fetch applications with optional filters
export const fetchApplications = async (filters?: {
  studentId?: string;
  status?: Application['status'];
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
    }

    const snapshot = await getDocs(applicationsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
      processed_at: doc.data().processed_at?.toDate()
    })) as Application[];
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

export * from './applicationBaseService';
export * from './applicationFetchService';
export * from './applicationMutationService';
export * from './applicationStatusService';
