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

export interface Block {
  id: string;
  name: string;
  description?: string;
  floors: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  status: 'active' | 'inactive' | 'maintenance';
  total_rooms?: number;
  available_rooms?: number;
  occupied_rooms?: number;
  maintenance_rooms?: number;
}

export const blockService = {
  // Get all blocks
  async getBlocks(): Promise<Block[]> {
    try {
      const blocksQuery = query(
        collection(db, 'blocks'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(blocksQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Block[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get block by ID
  async getBlockById(id: string): Promise<Block | null> {
    try {
      const blockDoc = await getDoc(doc(db, 'blocks', id));
      if (blockDoc.exists()) {
        return {
          id: blockDoc.id,
          ...blockDoc.data()
        } as Block;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new block
  async createBlock(block: Omit<Block, 'id' | 'created_at' | 'updated_at'>): Promise<Block> {
    try {
      const now = Timestamp.now();
      const blockData: Omit<Block, 'id'> = {
        ...block,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'blocks'), blockData);
      return {
        id: docRef.id,
        ...blockData
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update block
  async updateBlock(id: string, updates: Partial<Block>): Promise<void> {
    try {
      const blockRef = doc(db, 'blocks', id);
      const now = Timestamp.now();
      const updateData: Partial<Block> = {
        ...updates,
        updated_at: now
      };

      await updateDoc(blockRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete block
  async deleteBlock(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'blocks', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get blocks by status
  async getBlocksByStatus(status: Block['status']): Promise<Block[]> {
    try {
      const blocksQuery = query(
        collection(db, 'blocks'),
        where('status', '==', status),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(blocksQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Block[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get active blocks
  async getActiveBlocks(): Promise<Block[]> {
    return this.getBlocksByStatus('active');
  },

  // Get inactive blocks
  async getInactiveBlocks(): Promise<Block[]> {
    return this.getBlocksByStatus('inactive');
  },

  // Get blocks under maintenance
  async getMaintenanceBlocks(): Promise<Block[]> {
    return this.getBlocksByStatus('maintenance');
  },

  // Update block room counts
  async updateBlockRoomCounts(id: string): Promise<void> {
    try {
      const blockRef = doc(db, 'blocks', id);
      const roomsQuery = query(
        collection(db, 'rooms'),
        where('block_id', '==', id)
      );
      const snapshot = await getDocs(roomsQuery);
      
      const rooms = snapshot.docs.map(doc => doc.data());
      const totalRooms = rooms.length;
      const availableRooms = rooms.filter(room => room.status === 'available').length;
      const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
      const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;

      await updateDoc(blockRef, {
        total_rooms: totalRooms,
        available_rooms: availableRooms,
        occupied_rooms: occupiedRooms,
        maintenance_rooms: maintenanceRooms,
        updated_at: Timestamp.now()
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}; 