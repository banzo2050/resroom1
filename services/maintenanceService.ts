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
import { notificationService } from './notificationService';

export interface MaintenanceRequest {
  id: string;
  student_id: string;
  room_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  assigned_to?: string;
  notes?: string;
}

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
        ...doc.data(),
        created_at: doc.data().created_at?.toDate(),
        updated_at: doc.data().updated_at?.toDate(),
        completed_at: doc.data().completed_at?.toDate()
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
          ...requestDoc.data(),
          created_at: requestDoc.data().created_at?.toDate(),
          updated_at: requestDoc.data().updated_at?.toDate(),
          completed_at: requestDoc.data().completed_at?.toDate()
        } as MaintenanceRequest;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new maintenance request
  async createMaintenanceRequest(request: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceRequest> {
    try {
      const now = Timestamp.now();
      const requestData = {
        ...request,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'maintenance_requests'), requestData);
      
      // Create notification for admin
      await notificationService.createNotification({
        userId: 'admin', // You might want to get this from a config or environment variable
        title: 'New Maintenance Request',
        message: `New maintenance request: ${request.title}`,
        type: 'info',
        read: false
      });

      return {
        id: docRef.id,
        ...requestData,
        created_at: now.toDate(),
        updated_at: now.toDate()
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update maintenance request
  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<void> {
    try {
      const requestRef = doc(db, 'maintenance_requests', id);
      const updateData = {
        ...updates,
        updated_at: Timestamp.now()
      };

      if (updates.status === 'completed') {
        updateData.completed_at = Timestamp.now();
      }

      await updateDoc(requestRef, updateData);

      // Create notification for user
      const request = await this.getMaintenanceRequestById(id);
      if (request) {
        await notificationService.createNotification({
          userId: request.student_id,
          title: 'Maintenance Request Updated',
          message: `Your maintenance request "${request.title}" has been ${updates.status}`,
          type: 'info',
          read: false
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};

// Export the fetchMaintenanceRequests function
export const fetchMaintenanceRequests = async (filters?: {
  studentId?: string;
  status?: MaintenanceRequest['status'];
  priority?: MaintenanceRequest['priority'];
}): Promise<MaintenanceRequest[]> => {
  try {
    let requestsQuery = query(
      collection(db, 'maintenance_requests'),
      orderBy('created_at', 'desc')
    );

    if (filters) {
      if (filters.studentId) {
        requestsQuery = query(requestsQuery, where('student_id', '==', filters.studentId));
      }
      
      if (filters.status) {
        requestsQuery = query(requestsQuery, where('status', '==', filters.status));
      }
      
      if (filters.priority) {
        requestsQuery = query(requestsQuery, where('priority', '==', filters.priority));
      }
    }

    const snapshot = await getDocs(requestsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
      completed_at: doc.data().completed_at?.toDate()
    })) as MaintenanceRequest[];
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    throw error;
  }
};
