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

export interface Room {
  id: string;
  block_id: string;
  room_number: string;
  capacity: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  status: 'available' | 'occupied' | 'maintenance';
  floor: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  amenities?: string[];
  description?: string;
  price_per_semester?: number;
}

export const roomService = {
  // Get all rooms
  async getRooms(): Promise<Room[]> {
    try {
      const roomsQuery = query(
        collection(db, 'rooms'),
        orderBy('room_number', 'asc')
      );
      const snapshot = await getDocs(roomsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get room by ID
  async getRoomById(id: string): Promise<Room | null> {
    try {
      const roomDoc = await getDoc(doc(db, 'rooms', id));
      if (roomDoc.exists()) {
        return {
          id: roomDoc.id,
          ...roomDoc.data()
        } as Room;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new room
  async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    try {
      const now = Timestamp.now();
      const roomData: Omit<Room, 'id'> = {
        ...room,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      return {
        id: docRef.id,
        ...roomData
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update room
  async updateRoom(id: string, updates: Partial<Room>): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', id);
      const now = Timestamp.now();
      const updateData: Partial<Room> = {
        ...updates,
        updated_at: now
      };

      await updateDoc(roomRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete room
  async deleteRoom(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'rooms', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get rooms by block
  async getRoomsByBlock(blockId: string): Promise<Room[]> {
    try {
      const roomsQuery = query(
        collection(db, 'rooms'),
        where('block_id', '==', blockId),
        orderBy('room_number', 'asc')
      );
      const snapshot = await getDocs(roomsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get rooms by status
  async getRoomsByStatus(status: Room['status']): Promise<Room[]> {
    try {
      const roomsQuery = query(
        collection(db, 'rooms'),
        where('status', '==', status),
        orderBy('room_number', 'asc')
      );
      const snapshot = await getDocs(roomsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get rooms by type
  async getRoomsByType(type: Room['type']): Promise<Room[]> {
    try {
      const roomsQuery = query(
        collection(db, 'rooms'),
        where('type', '==', type),
        orderBy('room_number', 'asc')
      );
      const snapshot = await getDocs(roomsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get available rooms
  async getAvailableRooms(): Promise<Room[]> {
    return this.getRoomsByStatus('available');
  },

  // Get occupied rooms
  async getOccupiedRooms(): Promise<Room[]> {
    return this.getRoomsByStatus('occupied');
  },

  // Get rooms under maintenance
  async getMaintenanceRooms(): Promise<Room[]> {
    return this.getRoomsByStatus('maintenance');
  }
}; 