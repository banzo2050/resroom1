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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/main';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const studentAdminService = {
  // Get all messages between a student and admin
  async getMessages(studentId: string, adminId: string): Promise<Message[]> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('senderId', 'in', [studentId, adminId]),
        where('receiverId', 'in', [studentId, adminId]),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(messagesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get unread message count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(messagesQuery);
      return snapshot.size;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Send a message
  async sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    try {
      const now = Timestamp.now();
      const messageData = {
        ...message,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      return {
        id: docRef.id,
        ...messageData
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Mark message as read
  async markAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Mark all messages as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(messagesQuery);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}; 