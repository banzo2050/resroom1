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

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type RoomType = 'single' | 'double' | 'triple';

export interface Application {
  id: string;
  student_id: string;
  preferred_block_id?: string;
  room_type: RoomType;
  special_requirements?: string;
  status: ApplicationStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
  reviewed_at?: Timestamp;
  reviewed_by?: string;
  review_notes?: string;
}

export interface ApplicationInput {
  student_id: string;
  preferred_block_id?: string;
  room_type: RoomType;
  special_requirements?: string;
}

/**
 * Transform application data for display compatibility
 */
export const transformApplicationData = (app: any) => {
  // Handle profiles data safely with type checking
  const profileData = app.profiles || {};
  const safeProfileName = typeof profileData === 'object' && profileData !== null && 'full_name' in profileData 
    ? String(profileData.full_name) 
    : 'Unknown';
  
  return {
    ...app,
    studentName: safeProfileName,
    studentEmail: app.student_id ? `${app.student_id}@student.uneswa.ac.sz` : 'No email',
    blockPreference: app.blocks?.name,
    roomTypePreference: app.room_type,
    createdAt: app.created_at
  };
};

/**
 * Validate and normalize room type
 */
export const normalizeRoomType = (roomTypeInput: any): RoomType => {
  let roomType: RoomType = 'double';
  
  if (roomTypeInput) {
    const roomTypeStr = String(roomTypeInput).toLowerCase();
    
    // Only allow single or double rooms
    if (roomTypeStr === 'single') {
      roomType = 'single';
    } else if (roomTypeStr === 'double') {
      roomType = 'double';
    } else if (roomTypeStr === 'accessible') {
      roomType = 'accessible';
    }
    // Default to double for any other type
  }
  
  return roomType;
};

export const applicationBaseService = {
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
  async createApplication(application: ApplicationInput): Promise<Application> {
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
  async updateApplication(id: string, updates: Partial<Omit<Application, 'id' | 'created_at'>>): Promise<void> {
    try {
      const applicationRef = doc(db, 'applications', id);
      const now = Timestamp.now();
      const updateData: Partial<Application> = {
        ...updates,
        updated_at: now
      };

      if (updates.status && updates.status !== 'pending') {
        updateData.reviewed_at = now;
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
  }
};
