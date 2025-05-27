import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Bell } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { fetchAnnouncements } from '@/services/announcements/announcementService';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const AnnouncementsList: React.FC = () => {
  const { user } = useAuth();
  
  const { data: announcements = [], isLoading, error, refetch } = useQuery({
    queryKey: ['announcements', user?.role],
    queryFn: () => user ? fetchAnnouncements(user.role) : Promise.resolve([]),
    enabled: !!user
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-200';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading announcements...</span>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="text-center py-10">
          <p className="text-red-500">Error loading announcements. Please try again later.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1>Announcements</h1>
        </div>
        
        {announcements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Announcements</h3>
                <p className="text-muted-foreground">
                  There are no announcements to display at this time.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {announcement.title}
                  </CardTitle>
                  <Badge variant="outline" className={getPriorityBadgeClass(announcement.priority)}>
                    {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      Posted by: {announcement.profiles?.full_name || 'Staff'}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>Posted: {format(new Date(announcement.created_at), 'PPp')}</span>
                      {announcement.expires_at && (
                        <span>Expires: {format(new Date(announcement.expires_at), 'PPp')}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AnnouncementsList; 