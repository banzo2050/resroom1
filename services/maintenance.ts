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

export interface MaintenanceRequest {
  id?: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  issue: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  notes?: string;
}

export const maintenanceService = {
  // Create a new maintenance request
  async createRequest(request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'maintenance'), {
      ...request,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  // Get all maintenance requests (for admin)
  async getAllRequests(): Promise<MaintenanceRequest[]> {
    const q = query(
      collection(db, 'maintenance'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as MaintenanceRequest[];
  },

  // Get maintenance requests for a specific student
  async getStudentRequests(studentId: string): Promise<MaintenanceRequest[]> {
    const q = query(
      collection(db, 'maintenance'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as MaintenanceRequest[];
  },

  // Update a maintenance request
  async updateRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<void> {
    const requestRef = doc(db, 'maintenance', id);
    await updateDoc(requestRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete a maintenance request
  async deleteRequest(id: string): Promise<void> {
    const requestRef = doc(db, 'maintenance', id);
    await deleteDoc(requestRef);
  },

  // Get a single maintenance request
  async getRequest(id: string): Promise<MaintenanceRequest | null> {
    const requestRef = doc(db, 'maintenance', id);
    const requestSnap = await getDoc(requestRef);
    
    if (requestSnap.exists()) {
      return {
        id: requestSnap.id,
        ...requestSnap.data(),
        createdAt: requestSnap.data().createdAt.toDate(),
        updatedAt: requestSnap.data().updatedAt.toDate()
      } as MaintenanceRequest;
    }
    return null;
  },

  // Update request status (for admin)
  async updateStatus(id: string, status: MaintenanceRequest['status'], notes?: string): Promise<void> {
    const requestRef = doc(db, 'maintenance', id);
    await updateDoc(requestRef, {
      status,
      notes,
      updatedAt: Timestamp.now()
    });
  },

  // Assign request to staff member (for admin)
  async assignRequest(id: string, assignedTo: string): Promise<void> {
    const requestRef = doc(db, 'maintenance', id);
    await updateDoc(requestRef, {
      assignedTo,
      status: 'in-progress',
      updatedAt: Timestamp.now()
    });
  }
}; 