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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: Timestamp;
  archived_at?: Timestamp;
  priority: 'low' | 'medium' | 'high';
  target_audience?: string[];
  attachments?: string[];
}

export const announcementService = {
  // Get all announcements
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(announcementsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get announcement by ID
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    try {
      const announcementDoc = await getDoc(doc(db, 'announcements', id));
      if (announcementDoc.exists()) {
        return {
          id: announcementDoc.id,
          ...announcementDoc.data()
        } as Announcement;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new announcement
  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement> {
    try {
      const now = Timestamp.now();
      const announcementData: Omit<Announcement, 'id'> = {
        ...announcement,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'announcements'), announcementData);
      return {
        id: docRef.id,
        ...announcementData
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update announcement
  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<void> {
    try {
      const announcementRef = doc(db, 'announcements', id);
      const now = Timestamp.now();
      const updateData: Partial<Announcement> = {
        ...updates,
        updated_at: now
      };

      if (updates.status === 'published') {
        updateData.published_at = now;
      } else if (updates.status === 'archived') {
        updateData.archived_at = now;
      }

      await updateDoc(announcementRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete announcement
  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get announcements by status
  async getAnnouncementsByStatus(status: Announcement['status']): Promise<Announcement[]> {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('status', '==', status),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(announcementsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get announcements by priority
  async getAnnouncementsByPriority(priority: Announcement['priority']): Promise<Announcement[]> {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('priority', '==', priority),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(announcementsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get announcements by creator
  async getAnnouncementsByCreator(creatorId: string): Promise<Announcement[]> {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('created_by', '==', creatorId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(announcementsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get published announcements
  async getPublishedAnnouncements(): Promise<Announcement[]> {
    return this.getAnnouncementsByStatus('published');
  },

  // Get draft announcements
  async getDraftAnnouncements(): Promise<Announcement[]> {
    return this.getAnnouncementsByStatus('draft');
  },

  // Get archived announcements
  async getArchivedAnnouncements(): Promise<Announcement[]> {
    return this.getAnnouncementsByStatus('archived');
  }
}; 