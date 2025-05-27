
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, MessageSquare, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardData } from '@/types/dashboard';

interface StudentDashboardProps {
  data: DashboardData;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ data }) => {
  const { applications, maintenanceRequests, announcements } = data;
  
  // Calculate stats
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const pendingMaintenance = maintenanceRequests.filter(req => req.status === 'pending').length;
  
  const studentCards = [
    {
      title: 'Apply for Room',
      description: 'Submit a new accommodation application',
      icon: <FileText className="h-8 w-8 text-primary" />,
      link: '/apply',
      stats: pendingApplications > 0 ? `${pendingApplications} pending` : undefined
    },
    {
      title: 'My Applications',
      description: 'Check the status of your applications',
      icon: <Calendar className="h-8 w-8 text-primary" />,
      link: '/applications',
      stats: approvedApplications > 0 ? `${approvedApplications} approved` : undefined
    },
    {
      title: 'Maintenance Requests',
      description: 'Report issues with your accommodation',
      icon: <Settings className="h-8 w-8 text-primary" />,
      link: '/maintenance',
      stats: pendingMaintenance > 0 ? `${pendingMaintenance} pending` : undefined
    },
    {
      title: 'Announcements',
      description: 'View important notices from housing office',
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      link: '/announcements',
      stats: announcements.length > 0 ? `${announcements.length} total` : undefined
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentCards.map((card, index) => (
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
        <h2 className="text-xl font-semibold mb-4">Recent Announcements</h2>
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.slice(0, 3).map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <CardTitle>{announcement.title}</CardTitle>
                  <CardDescription>
                    Posted on {format(new Date(announcement.publish_at), 'MMMM dd, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    {announcement.content.length > 200
                      ? `${announcement.content.substring(0, 200)}...`
                      : announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No announcements available at the moment.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default StudentDashboard;
