import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query as firestoreQuery,
  where,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/main';
import { toast } from '@/components/ui/sonner';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'classroom' | 'laboratory' | 'conference' | 'other' | 'single' | 'double';
  floor: number;
  building: string;
  status: 'available' | 'occupied' | 'maintenance';
  features: string[];
  createdAt: Date;
  updatedAt: Date;
  blockId?: string;
  gender?: 'male' | 'female' | 'any';
}

const convertToRoom = (doc: DocumentData): Room => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    capacity: data.capacity,
    type: data.type,
    floor: data.floor,
    building: data.building,
    status: data.status,
    features: data.features || [],
    blockId: data.blockId,
    gender: data.gender,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

export const roomService = {
  // Get all rooms
  async getRooms(): Promise<Room[]> {
    try {
      const roomsQuery = firestoreQuery(
        collection(db, 'rooms'),
        orderBy('name')
      );
      const snapshot = await getDocs(roomsQuery);
      return snapshot.docs.map(doc => convertToRoom(doc));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get room by ID
  async getRoomById(id: string): Promise<Room | null> {
    try {
      const roomDoc = await getDoc(doc(db, 'rooms', id));
      if (roomDoc.exists()) {
        return convertToRoom(roomDoc);
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new room
  async createRoom(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    try {
      const now = Timestamp.now();
      const roomData = {
        ...room,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      return {
        id: docRef.id,
        ...roomData,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update room
  async updateRoom(id: string, updates: Partial<Room>): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', id);
      await updateDoc(roomRef, {
        ...updates,
        updatedAt: Timestamp.now()
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

  // Get rooms by status
  async getRoomsByStatus(status: Room['status']): Promise<Room[]> {
    try {
      const roomsQuery = firestoreQuery(
        collection(db, 'rooms'),
        where('status', '==', status),
        orderBy('name')
      );
      const snapshot = await getDocs(roomsQuery);
      return snapshot.docs.map(doc => convertToRoom(doc));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};

export const fetchRooms = async (filters?: {
  blockId?: string;
  status?: string;
  gender?: string;
}): Promise<Room[]> => {
  try {
    console.log('Fetching rooms with filters:', filters);
    
    let roomsQuery = firestoreQuery(
      collection(db, 'rooms'),
      orderBy('name')
    );

    if (filters) {
      if (filters.blockId) {
        roomsQuery = firestoreQuery(roomsQuery, where('blockId', '==', filters.blockId));
      }
      
      if (filters.status) {
        roomsQuery = firestoreQuery(roomsQuery, where('status', '==', filters.status));
      }
      
      if (filters.gender && filters.gender !== 'any') {
        roomsQuery = firestoreQuery(roomsQuery, where('gender', '==', filters.gender));
      }
    }

    const snapshot = await getDocs(roomsQuery);
    const rooms = snapshot.docs.map(doc => convertToRoom(doc));

    console.log(`Successfully fetched ${rooms.length} rooms:`, rooms);
    return rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    toast.error('Failed to load rooms');
    throw error;
  }
};

export const fetchRoomById = async (roomId: string): Promise<Room | null> => {
  try {
    console.log(`Fetching room with id ${roomId}`);
    
    const roomDoc = await getDoc(doc(db, 'rooms', roomId));
    if (roomDoc.exists()) {
      return convertToRoom(roomDoc);
    }
    return null;
  } catch (error) {
    console.error('Error fetching room:', error);
    toast.error('Failed to load room details');
    throw error;
  }
};

export const fetchAvailableRooms = async (gender?: string): Promise<Room[]> => {
  try {
    console.log(`Fetching available rooms with gender filter: ${gender}`);
    
    let roomsQuery = firestoreQuery(
      collection(db, 'rooms'),
      where('status', '==', 'available')
    );
    
    if (gender && gender !== 'any') {
      roomsQuery = firestoreQuery(roomsQuery, where('gender', '==', gender));
    }
      
    const snapshot = await getDocs(roomsQuery);
    const rooms = snapshot.docs.map(doc => convertToRoom(doc));

    console.log(`Successfully fetched ${rooms.length} available rooms:`, rooms);
    // Filter out any room types other than 'single' and 'double'
    const filteredRooms = rooms.filter(room => room.type === 'single' || room.type === 'double');
    
    console.log(`Filtered to ${filteredRooms.length} rooms (single/double only):`, filteredRooms);
    return filteredRooms;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    toast.error('Failed to load available rooms');
    throw error;
  }
};

export const updateRoom = async (
  id: string,
  updates: Partial<Room>,
  roomType?: string,
  gender?: string
): Promise<void> => {
  try {
    console.log(`Updating room ${id} with:`, { updates, roomType, gender });

    const roomRef = doc(db, 'rooms', id);
    await updateDoc(roomRef, {
      ...updates,
      type: roomType,
      gender: gender,
      updatedAt: Timestamp.now()
    });

    console.log('Successfully updated room');
    toast.success(`Room "${id}" updated successfully!`);
  } catch (error) {
    console.error('Error updating room:', error);
    toast.error('Failed to update room');
    throw error;
  }
};

// Import the fetchRoomAssignment function from assignmentService
export { fetchRoomAssignment } from './assignmentService';
