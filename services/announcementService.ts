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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/main';
import { notificationService } from './notificationService';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  createdBy: string;
  targetAudience?: 'all' | 'students' | 'admins';
}

export const announcementService = {
  // Get all announcements
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
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
  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> {
    try {
      const now = Timestamp.now();
      const announcementData = {
        ...announcement,
        createdAt: now,
        updatedAt: now
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
      const updateData = {
        ...updates,
        updatedAt: now
      };

      if (updates.status === 'published') {
        updateData.publishedAt = now;
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

  // Publish announcement
  async publishAnnouncement(id: string): Promise<void> {
    try {
      const now = Timestamp.now();
      const announcementRef = doc(db, 'announcements', id);
      await updateDoc(announcementRef, {
        status: 'published',
        publishedAt: now,
        updatedAt: now
      });

      // Create notifications for target audience
      const announcement = await this.getAnnouncementById(id);
      if (announcement) {
        // Get all users based on target audience
        const usersQuery = query(
          collection(db, 'users'),
          where('role', 'in', 
            announcement.targetAudience === 'all' 
              ? ['admin', 'student']
              : announcement.targetAudience === 'students' 
                ? ['student']
                : ['admin']
          )
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        // Create notifications for each user
        const batch = writeBatch(db);
        usersSnapshot.docs.forEach(userDoc => {
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
            user_id: userDoc.id,
            title: 'New Announcement',
            message: announcement.title,
            type: 'info',
            read: false,
            created_at: now,
            updated_at: now
          });
        });
        
        await batch.commit();
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};

// Export the fetchAnnouncements function
export const fetchAnnouncements = async (filters?: {
  status?: Announcement['status'];
  priority?: Announcement['priority'];
  targetAudience?: Announcement['targetAudience'];
}): Promise<Announcement[]> => {
  try {
    let announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    if (filters) {
      if (filters.status) {
        announcementsQuery = query(announcementsQuery, where('status', '==', filters.status));
      }
      
      if (filters.priority) {
        announcementsQuery = query(announcementsQuery, where('priority', '==', filters.priority));
      }
      
      if (filters.targetAudience) {
        announcementsQuery = query(announcementsQuery, where('targetAudience', '==', filters.targetAudience));
      }
    }

    const snapshot = await getDocs(announcementsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Announcement[];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};
