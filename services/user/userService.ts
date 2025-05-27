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

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'student';
  first_name: string;
  last_name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  last_login?: Timestamp;
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  avatar_url?: string;
  department?: string;
  position?: string;
}

export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('last_name', 'asc')
      );
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        } as User;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      const snapshot = await getDocs(usersQuery);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as User;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new user
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      const now = Timestamp.now();
      const userData: Omit<User, 'id'> = {
        ...user,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'users'), userData);
      return {
        id: docRef.id,
        ...userData
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', id);
      const now = Timestamp.now();
      const updateData: Partial<User> = {
        ...updates,
        updated_at: now
      };

      await updateDoc(userRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get users by role
  async getUsersByRole(role: User['role']): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', role),
        orderBy('last_name', 'asc')
      );
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get users by status
  async getUsersByStatus(status: User['status']): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('status', '==', status),
        orderBy('last_name', 'asc')
      );
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get users by department
  async getUsersByDepartment(department: string): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('department', '==', department),
        orderBy('last_name', 'asc')
      );
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get active users
  async getActiveUsers(): Promise<User[]> {
    return this.getUsersByStatus('active');
  },

  // Get inactive users
  async getInactiveUsers(): Promise<User[]> {
    return this.getUsersByStatus('inactive');
  },

  // Get suspended users
  async getSuspendedUsers(): Promise<User[]> {
    return this.getUsersByStatus('suspended');
  },

  // Get admin users
  async getAdminUsers(): Promise<User[]> {
    return this.getUsersByRole('admin');
  },

  // Get staff users
  async getStaffUsers(): Promise<User[]> {
    return this.getUsersByRole('staff');
  },

  // Get student users
  async getStudentUsers(): Promise<User[]> {
    return this.getUsersByRole('student');
  }
}; 