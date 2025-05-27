
import { Application, Announcement, MaintenanceRequest, Room, Block } from '@/types';

export interface DashboardData {
  applications: Application[];
  maintenanceRequests: MaintenanceRequest[];
  announcements: Announcement[];
  rooms: Room[];
  blocks: Block[];
}

export interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  stats?: string;
}
