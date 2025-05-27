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

export interface MaintenanceRequest {
  id: string;
  student_id: string;
  room_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: Timestamp;
  updated_at: Timestamp;
  completed_at?: Timestamp;
  assigned_to?: string;
  notes?: string;
}

// Export createMaintenanceRequest function directly
export const createMaintenanceRequest = async (request: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<MaintenanceRequest> => {
  try {
    const now = Timestamp.now();
    const requestData: Omit<MaintenanceRequest, 'id'> = {
      ...request,
      status: 'pending' as const,
      created_at: now,
      updated_at: now
    };
    
    const docRef = await addDoc(collection(db, 'maintenance_requests'), requestData);
    return {
      id: docRef.id,
      ...requestData
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const maintenanceService = {
  // Get all maintenance requests
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, 'maintenance_requests'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRequest[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get maintenance request by ID
  async getMaintenanceRequestById(id: string): Promise<MaintenanceRequest | null> {
    try {
      const requestDoc = await getDoc(doc(db, 'maintenance_requests', id));
      if (requestDoc.exists()) {
        return {
          id: requestDoc.id,
          ...requestDoc.data()
        } as MaintenanceRequest;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update maintenance request
  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<void> {
    try {
      const requestRef = doc(db, 'maintenance_requests', id);
      const now = Timestamp.now();
      const updateData: Partial<MaintenanceRequest> = {
        ...updates,
        updated_at: now
      };

      if (updates.status === 'completed') {
        updateData.completed_at = now;
      }

      await updateDoc(requestRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete maintenance request
  async deleteMaintenanceRequest(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'maintenance_requests', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get maintenance requests by student
  async getMaintenanceRequestsByStudent(studentId: string): Promise<MaintenanceRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, 'maintenance_requests'),
        where('student_id', '==', studentId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRequest[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get maintenance requests by room
  async getMaintenanceRequestsByRoom(roomId: string): Promise<MaintenanceRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, 'maintenance_requests'),
        where('room_id', '==', roomId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRequest[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get maintenance requests by status
  async getMaintenanceRequestsByStatus(status: MaintenanceRequest['status']): Promise<MaintenanceRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, 'maintenance_requests'),
        where('status', '==', status),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRequest[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}; 