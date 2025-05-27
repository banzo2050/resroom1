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
import { toast } from '@/components/ui/sonner';

export interface Block {
  id: string;
  name: string;
  description?: string;
  gender: 'male' | 'female' | 'any';
  totalRooms: number;
  availableRooms: number;
  createdAt: Date;
  updatedAt: Date;
}

export const blockService = {
  // Get all blocks
  async getBlocks(): Promise<Block[]> {
    try {
      const blocksQuery = query(
        collection(db, 'blocks'),
        orderBy('name')
      );
      const snapshot = await getDocs(blocksQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
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
          ...blockDoc.data(),
          createdAt: blockDoc.data().createdAt?.toDate(),
          updatedAt: blockDoc.data().updatedAt?.toDate()
        } as Block;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new block
  async createBlock(block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>): Promise<Block> {
    try {
      const now = Timestamp.now();
      const blockData = {
        ...block,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, 'blocks'), blockData);
      return {
        id: docRef.id,
        ...blockData,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update block
  async updateBlock(id: string, updates: Partial<Block>): Promise<void> {
    try {
      const blockRef = doc(db, 'blocks', id);
      await updateDoc(blockRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
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
  }
};

// Export the fetchBlocks function
export const fetchBlocks = async (filters?: {
  gender?: 'male' | 'female' | 'any';
}): Promise<Block[]> => {
  try {
    let blocksQuery = query(
      collection(db, 'blocks'),
      orderBy('name')
    );

    if (filters?.gender) {
      blocksQuery = query(blocksQuery, where('gender', '==', filters.gender));
    }

    const snapshot = await getDocs(blocksQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Block[];
  } catch (error) {
    console.error('Error fetching blocks:', error);
    throw error;
  }
};
