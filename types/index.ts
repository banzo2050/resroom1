export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  gender?: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = "pending" | "approved" | "denied";
export type RoomStatus = "available" | "occupied" | "maintenance" | "reserved";
export type RoomType = "single" | "double" | "accessible";
export type MaintenancePriority = "low" | "medium" | "high" | "emergency";
export type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type AnnouncementType = "general" | "emergency" | "event";

export interface Block {
  id: string;
  name: string;
  description?: string;
  total_rooms: number;
  floors: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  block_id: string;
  floor: number;
  type: RoomType;
  gender: "male" | "female" | "any";
  status: RoomStatus;
  features: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joined data
  blocks?: {
    name: string;
  };
}

export interface Application {
  id: string;
  student_id: string;
  preferred_block_id?: string;
  room_type: RoomType;
  special_requirements?: string;
  status: ApplicationStatus;
  admin_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  created_at: string;
  updated_at: string;
  // Extended properties for display
  blocks?: {
    name: string;
  };
  profiles?: {
    full_name: string;
    student_id: string;
    email: string;
    gender?: string;
  };
  
  // Mapped properties for backward compatibility
  studentName?: string;
  studentId?: string;
  studentEmail?: string;
  blockPreference?: string;
  roomTypePreference?: string;
  assignedRoom?: string;
  specialRequirements?: string;
  createdAt?: string;
  reason?: string;
  academicYear?: string;
  semester?: string;
}

export interface MaintenanceRequest {
  id: string;
  student_id: string;
  room_id: string;
  description: string;
  category: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  staff_notes?: string;
  photos?: string[];
  resolved_at?: string;
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  rooms?: {
    room_number: string;
    block_id: string;
  };
  blocks?: {
    name: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  type: AnnouncementType;
  target_blocks?: string[];
  publish_at: string;
  created_at: string;
  updated_at: string;
  // Extended properties
  profiles?: {
    full_name: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface RoomAssignment {
  id: string;
  room_id: string;
  student_id: string;
  application_id: string;
  check_in_date: string;
  check_out_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  year_of_study?: number;
  created_at: string;
  updated_at: string;
  faculty?: string;
  program?: string;
  gender?: string;
  role: UserRole;
  full_name: string;
  student_id: string;
  phone?: string;
}
