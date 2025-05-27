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

export interface RoomAssignment {
  id: string;
  roomId: string;
  userId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
}

export const assignmentService = {
  // Get all room assignments
  async getRoomAssignments(): Promise<RoomAssignment[]> {
    try {
      const assignmentsQuery = query(
        collection(db, 'room_assignments'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(assignmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoomAssignment[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get room assignment by ID
  async getRoomAssignmentById(id: string): Promise<RoomAssignment | null> {
    try {
      const assignmentDoc = await getDoc(doc(db, 'room_assignments', id));
      if (assignmentDoc.exists()) {
        return {
          id: assignmentDoc.id,
          ...assignmentDoc.data()
        } as RoomAssignment;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new room assignment
  async createRoomAssignment(assignment: Omit<RoomAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoomAssignment> {
    try {
      const now = Timestamp.now();
      const assignmentData = {
        ...assignment,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, 'room_assignments'), assignmentData);
      return {
        id: docRef.id,
        ...assignmentData
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update room assignment
  async updateRoomAssignment(id: string, updates: Partial<RoomAssignment>): Promise<void> {
    try {
      const assignmentRef = doc(db, 'room_assignments', id);
      await updateDoc(assignmentRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};

// Export the fetchRoomAssignment function
export const fetchRoomAssignment = async (roomId: string): Promise<RoomAssignment | null> => {
  try {
    const assignmentsQuery = query(
      collection(db, 'room_assignments'),
      where('roomId', '==', roomId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(assignmentsQuery);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as RoomAssignment;
    }
    return null;
  } catch (error) {
    console.error('Error fetching room assignment:', error);
    throw error;
  }
};
