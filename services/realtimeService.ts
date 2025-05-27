import { 
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/main';

export const realtimeService = {
  // Subscribe to applications changes
  subscribeToApplications(
    callback: (applications: any[]) => void,
    filters?: { status?: string; studentId?: string }
  ): Unsubscribe {
    let applicationsQuery = query(collection(db, 'applications'));

    if (filters) {
      if (filters.status) {
        applicationsQuery = query(applicationsQuery, where('status', '==', filters.status));
      }
      if (filters.studentId) {
        applicationsQuery = query(applicationsQuery, where('student_id', '==', filters.studentId));
      }
    }

    return onSnapshot(applicationsQuery, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(applications);
    });
  },

  // Subscribe to room changes
  subscribeToRooms(
    callback: (rooms: any[]) => void,
    filters?: { blockId?: string; status?: string }
  ): Unsubscribe {
    let roomsQuery = query(collection(db, 'rooms'));

    if (filters) {
      if (filters.blockId) {
        roomsQuery = query(roomsQuery, where('block_id', '==', filters.blockId));
      }
      if (filters.status) {
        roomsQuery = query(roomsQuery, where('status', '==', filters.status));
      }
    }

    return onSnapshot(roomsQuery, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(rooms);
    });
  },

  // Subscribe to maintenance requests
  subscribeToMaintenanceRequests(
    callback: (requests: any[]) => void,
    filters?: { status?: string; roomId?: string }
  ): Unsubscribe {
    let requestsQuery = query(collection(db, 'maintenance_requests'));

    if (filters) {
      if (filters.status) {
        requestsQuery = query(requestsQuery, where('status', '==', filters.status));
      }
      if (filters.roomId) {
        requestsQuery = query(requestsQuery, where('room_id', '==', filters.roomId));
      }
    }

    return onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(requests);
    });
  },

  // Subscribe to announcements
  subscribeToAnnouncements(
    callback: (announcements: any[]) => void,
    filters?: { status?: string }
  ): Unsubscribe {
    let announcementsQuery = query(collection(db, 'announcements'));

    if (filters?.status) {
      announcementsQuery = query(announcementsQuery, where('status', '==', filters.status));
    }

    return onSnapshot(announcementsQuery, (snapshot) => {
      const announcements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(announcements);
    });
  }
};
