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

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth: Timestamp;
  address: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  room_id?: string;
  block_id?: string;
  status: 'active' | 'inactive';
  program?: string;
  year_level?: number;
  semester?: number;
}

export const studentService = {
  // Get all students
  async getStudents(): Promise<Student[]> {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        orderBy('last_name', 'asc')
      );
      const snapshot = await getDocs(studentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get student by ID
  async getStudentById(id: string): Promise<Student | null> {
    try {
      const studentDoc = await getDoc(doc(db, 'students', id));
      if (studentDoc.exists()) {
        return {
          id: studentDoc.id,
          ...studentDoc.data()
        } as Student;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get student by user ID
  async getStudentByUserId(userId: string): Promise<Student | null> {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('user_id', '==', userId)
      );
      const snapshot = await getDocs(studentsQuery);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Student;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create new student
  async createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    try {
      const now = Timestamp.now();
      const studentData: Omit<Student, 'id'> = {
        ...student,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'students'), studentData);
      return {
        id: docRef.id,
        ...studentData
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update student
  async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    try {
      const studentRef = doc(db, 'students', id);
      const now = Timestamp.now();
      const updateData: Partial<Student> = {
        ...updates,
        updated_at: now
      };

      await updateDoc(studentRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete student
  async deleteStudent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get students by room
  async getStudentsByRoom(roomId: string): Promise<Student[]> {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('room_id', '==', roomId),
        orderBy('last_name', 'asc')
      );
      const snapshot = await getDocs(studentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get students by block
  async getStudentsByBlock(blockId: string): Promise<Student[]> {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('block_id', '==', blockId),
        orderBy('last_name', 'asc')
      );
      const snapshot = await getDocs(studentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get students by status
  async getStudentsByStatus(status: Student['status']): Promise<Student[]> {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('status', '==', status),
        orderBy('last_name', 'asc')
      );
      const snapshot = await getDocs(studentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get active students
  async getActiveStudents(): Promise<Student[]> {
    return this.getStudentsByStatus('active');
  },

  // Get inactive students
  async getInactiveStudents(): Promise<Student[]> {
    return this.getStudentsByStatus('inactive');
  }
}; 