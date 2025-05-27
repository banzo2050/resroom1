
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, CalendarIcon, HomeIcon, ClipboardCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { fetchApplication } from '@/services/applicationService';
import { fetchRoomAssignment } from '@/services/roomService';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => id ? fetchApplication(id) : Promise.resolve(null),
    enabled: !!id,
  });

  const { data: roomAssignment } = useQuery({
    queryKey: ['room-assignment', id],
    queryFn: () => id ? fetchRoomAssignment(id) : Promise.resolve(null),
    enabled: !!id && application?.status === 'approved',
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-500">Denied</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="container max-w-3xl py-6">
          <div className="flex items-center space-x-2 mb-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (!application) {
    return (
      <AppShell>
        <div className="container max-w-3xl py-6">
          <div className="flex items-center space-x-2 mb-6">
            <Link to="/applications" className="flex items-center text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Applications</span>
            </Link>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
              <p className="text-muted-foreground mb-6">The application you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button asChild>
                <Link to="/applications">View My Applications</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container max-w-3xl py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Link to="/applications" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Applications</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Application Details</CardTitle>
                <CardDescription>
                  Submitted on {format(new Date(application.created_at), 'PPP')}
                </CardDescription>
              </div>
              {getStatusBadge(application.status)}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Accommodation Preferences</h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Block Preference</p>
                    <p className="font-medium">{application.blockPreference || application.blocks?.name || 'No preference'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Room Type</p>
                    <p className="font-medium capitalize">{application.roomTypePreference || application.room_type}</p>
                  </div>
                  {(application.special_requirements || application.specialRequirements) && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Special Requirements</p>
                      <p className="font-medium">{application.special_requirements || application.specialRequirements}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {application.status === 'approved' && roomAssignment && (
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <HomeIcon className="h-5 w-5 text-green-600" />
                    Room Assignment
                  </h3>
                  <div className="mt-3 p-4 bg-green-50 border border-green-100 rounded-md">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Room Number</p>
                        <p className="font-medium">{roomAssignment.room?.room_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Block</p>
                        <p className="font-medium">{roomAssignment.room?.block?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in Date</p>
                        <p className="font-medium">{roomAssignment.check_in_date ? format(new Date(roomAssignment.check_in_date), 'PPP') : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {application.status === 'approved' && !roomAssignment && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-md flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Application Approved</p>
                    <p className="text-sm text-green-700">Your application has been approved. Room assignment details will be provided soon.</p>
                  </div>
                </div>
              )}
              
              {application.status === 'denied' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-md flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Application Denied</p>
                    {application.admin_notes ? (
                      <p className="text-sm text-red-700">Reason: {application.admin_notes}</p>
                    ) : (
                      <p className="text-sm text-red-700">No reason provided. Please contact the residence office for more information.</p>
                    )}
                  </div>
                </div>
              )}
              
              {application.status === 'pending' && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-md flex items-start gap-3">
                  <ClipboardCheck className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Application Under Review</p>
                    <p className="text-sm text-amber-700">Your application is currently being reviewed by the residence administration. You will be notified when a decision is made.</p>
                  </div>
                </div>
              )}
              
              {application.emergency_contact_name && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium">Emergency Contact</h3>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{application.emergency_contact_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Relationship</p>
                        <p className="font-medium">{application.emergency_contact_relationship}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{application.emergency_contact_phone}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-6 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Application ID: {application.id}</span>
            </div>
            {application.status === 'pending' && (
              <Button asChild variant="outline">
                <Link to="/applications">View All Applications</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
};

export default ApplicationDetails;
