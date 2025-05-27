import { db } from '@/main';
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  target_audience: 'all' | 'students' | 'staff';
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
  expires_at?: Date;
  is_active: boolean;
}

/**
 * Create a new announcement
 */
export const createAnnouncement = async (announcement: Partial<Announcement>) => {
  try {
    if (!announcement.title || !announcement.content || !announcement.created_by) {
      throw new Error('Missing required fields');
    }

    const announcementData = {
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || 'medium',
      target_audience: announcement.target_audience || 'all',
      created_by: announcement.created_by,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      expires_at: announcement.expires_at ? Timestamp.fromDate(new Date(announcement.expires_at)) : null,
      is_active: true
    };

    const docRef = await addDoc(collection(db, 'announcements'), announcementData);

    // Create notification
    await addDoc(collection(db, 'notifications'), {
      title: 'New Announcement',
      content: announcement.title,
      type: 'announcement',
      read: false,
      created_at: Timestamp.now()
    });

    toast.success('Announcement created successfully!');
    return { id: docRef.id, ...announcementData };
  } catch (error) {
    console.error('Error creating announcement:', error);
    toast.error('Failed to create announcement. Please try again.');
    throw error;
  }
};

/**
 * Fetch announcements based on user role
 */
export const fetchAnnouncements = async (role: string) => {
  try {
    let q = query(
      collection(db, 'announcements'),
      where('is_active', '==', true),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const announcements = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Announcement[];

    // Filter by target audience
    return announcements.filter(announcement => {
      if (role === 'student') {
        return ['all', 'students'].includes(announcement.target_audience);
      } else if (role === 'staff') {
        return ['all', 'staff'].includes(announcement.target_audience);
      }
      return true;
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    toast.error('Failed to load announcements');
    throw error;
  }
};

/**
 * Update an announcement
 */
export const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
  try {
    const announcementRef = doc(db, 'announcements', id);
    const updateData = {
      ...updates,
      updated_at: Timestamp.now()
    };

    await updateDoc(announcementRef, updateData);
    toast.success('Announcement updated successfully!');
    
    return { id, ...updateData };
  } catch (error) {
    console.error('Error updating announcement:', error);
    toast.error('Failed to update announcement');
    throw error;
  }
};

/**
 * Delete an announcement (soft delete by setting is_active to false)
 */
export const deleteAnnouncement = async (id: string) => {
  try {
    const announcementRef = doc(db, 'announcements', id);
    await updateDoc(announcementRef, {
      is_active: false,
      updated_at: Timestamp.now()
    });

    toast.success('Announcement deleted successfully!');
  } catch (error) {
    console.error('Error deleting announcement:', error);
    toast.error('Failed to delete announcement');
    throw error;
  }
}; 