import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../main';

export interface RoomApplication {
  id?: string;
  studentId: string;
  studentName: string;
  email: string;
  gender: string;
  preferredRoomType: 'single' | 'double' | 'suite';
  specialNeeds?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  assignedRoom?: string;
  notes?: string;
}

export const applicationService = {
  // Create a new room application
  async createApplication(application: Omit<RoomApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'applications'), {
      ...application,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  // Get all applications (for admin)
  async getAllApplications(): Promise<RoomApplication[]> {
    const q = query(
      collection(db, 'applications'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as RoomApplication[];
  },

  // Get applications for a specific student
  async getStudentApplications(studentId: string): Promise<RoomApplication[]> {
    const q = query(
      collection(db, 'applications'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as RoomApplication[];
  },

  // Update an application
  async updateApplication(id: string, updates: Partial<RoomApplication>): Promise<void> {
    const applicationRef = doc(db, 'applications', id);
    await updateDoc(applicationRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete an application
  async deleteApplication(id: string): Promise<void> {
    const applicationRef = doc(db, 'applications', id);
    await deleteDoc(applicationRef);
  },

  // Get a single application
  async getApplication(id: string): Promise<RoomApplication | null> {
    const applicationRef = doc(db, 'applications', id);
    const applicationSnap = await getDoc(applicationRef);
    
    if (applicationSnap.exists()) {
      return {
        id: applicationSnap.id,
        ...applicationSnap.data(),
        createdAt: applicationSnap.data().createdAt.toDate(),
        updatedAt: applicationSnap.data().updatedAt.toDate()
      } as RoomApplication;
    }
    return null;
  },

  // Update application status (for admin)
  async updateStatus(id: string, status: RoomApplication['status'], notes?: string): Promise<void> {
    const applicationRef = doc(db, 'applications', id);
    await updateDoc(applicationRef, {
      status,
      notes,
      updatedAt: Timestamp.now()
    });
  },

  // Assign room to application (for admin)
  async assignRoom(id: string, roomNumber: string): Promise<void> {
    const applicationRef = doc(db, 'applications', id);
    await updateDoc(applicationRef, {
      assignedRoom: roomNumber,
      status: 'approved',
      updatedAt: Timestamp.now()
    });
  }
}; 