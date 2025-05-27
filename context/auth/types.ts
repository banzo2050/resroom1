import { User } from 'firebase/auth';

export type UserRole = 'admin' | 'student' | 'staff';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  studentId?: string;
  gender?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomUser extends User {
  role?: UserRole;
  studentId?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthContextType {
  user: CustomUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<CustomUser>;
  logout: () => Promise<void>;
  register: (email: string, password: string, userData: Partial<UserData>) => Promise<CustomUser>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}
