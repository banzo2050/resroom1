import React from 'react';
import { useAuth } from '../context/auth';
import AppShell from '../components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { fetchApplications } from '@/services/applications';
import { fetchMaintenanceRequests } from '@/services/maintenanceService';
import { fetchRooms } from '@/services/roomService';
import { fetchBlocks } from '@/services/blockService';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Room, Block } from '@/types';

// Fetch announcements service separately to handle potential errors gracefully
const fetchAnnouncementsWithFallback = async () => {
  try {
    const { fetchAnnouncements } = await import('@/services/announcementService');
    return await fetchAnnouncements();
  } catch (error) {
    console.error('Error loading announcements:', error);
    return []; // Return empty array as fallback
  }
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch data based on user role
  const { data: applications = [] } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: () => user ? fetchApplications(user.id, user.role) : Promise.resolve([]),
    enabled: !!user
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenance-requests', user?.id],
    queryFn: () => user ? fetchMaintenanceRequests(user.id, user.role) : Promise.resolve([]),
    enabled: !!user
  });

  const { data: rawAnnouncements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => fetchAnnouncementsWithFallback(),
  });

  // Transform announcements to match the expected type
  const announcements = rawAnnouncements.map((announcement: any) => ({
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    author_id: announcement.author_id,
    type: announcement.type as "general" | "emergency" | "event",
    target_blocks: announcement.target_blocks || [],
    publish_at: announcement.publish_at || announcement.created_at,
    created_at: announcement.created_at,
    updated_at: announcement.updated_at,
    profiles: { full_name: 'Administrator' } // Default since we have issues with the join
  }));

  // Fetch rooms and transform them to match our Room type
  const { data: rawRooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => fetchRooms(),
    enabled: user?.role === 'admin'
  });

  const rooms = rawRooms.map((room: any) => ({
    ...room,
    gender: room.gender === 'any' || room.gender === 'male' || room.gender === 'female' 
      ? room.gender as "male" | "female" | "any" 
      : "any",
    // Ensure type is one of the allowed enum values
    type: room.type === 'single' || room.type === 'double' 
      ? room.type as "single" | "double" 
      : 'double'
  })) as Room[];

  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => fetchBlocks(),
    enabled: !!user
  });

  // Calculate stats for passing to child components
  const dashboardData = {
    applications,
    maintenanceRequests,
    announcements,
    rooms,
    blocks: blocks as Block[]
  };

  return (
    <AppShell>
      <div className="page-container">
        <h1 className="mb-8">Welcome, {user?.firstName || 'User'}!</h1>
        
        {user?.role === 'admin' ? (
          <AdminDashboard data={dashboardData} />
        ) : (
          <StudentDashboard data={dashboardData} />
        )}
      </div>
    </AppShell>
  );
};

export default Dashboard;
