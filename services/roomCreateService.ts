import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/main';

export interface Room {
  id: string;
  block_id: string;
  room_number: string;
  capacity: number;
  type: 'single' | 'double' | 'triple';
  status: 'available' | 'occupied' | 'maintenance';
  created_at: Timestamp;
  updated_at: Timestamp;
}

export const roomCreateService = {
  // Create a new room
  async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    try {
      const now = Timestamp.now();
      const roomData = {
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

  // Update room details
  async updateRoom(id: string, updates: Partial<Omit<Room, 'id' | 'created_at'>>): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', id);
      const now = Timestamp.now();
      
      await updateDoc(roomRef, {
        ...updates,
        updated_at: now
      });
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
  }
};
