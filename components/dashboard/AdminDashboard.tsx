
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, FileText, MessageSquare, Settings, Users } from 'lucide-react';
import { DashboardData } from '@/types/dashboard';
import { MaintenancePriority } from '@/types';

interface AdminDashboardProps {
  data: DashboardData;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data }) => {
  const { applications, maintenanceRequests, announcements, rooms, blocks } = data;
  
  // Calculate stats
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const pendingMaintenance = maintenanceRequests.filter(req => req.status === 'pending').length;
  const urgentMaintenance = maintenanceRequests.filter(req => 
    req.priority === 'high' || req.priority === 'emergency'
  ).length;
  
  const availableRooms = rooms.filter(room => room.status === 'available').length;
  const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  
  const adminCards = [
    {
      title: 'Applications',
      description: 'Review and process student applications',
      icon: <FileText className="h-8 w-8 text-primary" />,
      link: '/admin/applications',
      stats: pendingApplications > 0 ? `${pendingApplications} pending` : '0 pending'
    },
    {
      title: 'Rooms & Blocks',
      description: 'Manage residence facilities',
      icon: <Building className="h-8 w-8 text-primary" />,
      link: '/admin/rooms',
      stats: `${rooms.length} rooms, ${blocks.length} blocks`
    },
    {
      title: 'Students',
      description: 'View and manage student records',
      icon: <Users className="h-8 w-8 text-primary" />,
      link: '/admin/students',
      stats: `${approvedApplications} housed`
    },
    {
      title: 'Maintenance',
      description: 'Handle maintenance requests',
      icon: <Settings className="h-8 w-8 text-primary" />,
      link: '/admin/maintenance',
      stats: urgentMaintenance > 0 ? `${urgentMaintenance} urgent` : `${pendingMaintenance} pending`
    },
    {
      title: 'Announcements',
      description: 'Post important notices',
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      link: '/admin/announcements',
      stats: `${announcements.length} published`
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <Card className="h-full card-hover">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
                {card.stats && (
                  <p className="text-sm font-medium text-primary mt-2">
                    {card.stats}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{occupancyRate}%</p>
              <p className="text-sm text-muted-foreground">
                {occupiedRooms} of {rooms.length} rooms filled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingApplications}</p>
              <p className="text-sm text-muted-foreground">Requiring review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Maintenance Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingMaintenance}</p>
              <p className="text-sm text-muted-foreground">
                {urgentMaintenance} urgent, {pendingMaintenance - urgentMaintenance} standard
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
