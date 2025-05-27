
import { User, UserRole } from '../../types';

export const hasRole = (user: User | null, role: UserRole | UserRole[]): boolean => {
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
};
