import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { maintenanceService } from '@/services/maintenance/maintenanceService';
import { useQuery } from '@tanstack/react-query';

const MaintenanceRequestList: React.FC = () => {
  const { user } = useAuth();
  
  const { data: requests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['maintenance-requests', user?.uid],
    queryFn: () => user ? maintenanceService.getMaintenanceRequestsByStudent(user.uid) : Promise.resolve([]),
    enabled: !!user
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'pending': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default: return '';
    }
  };
  
  const formatStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading maintenance requests...</span>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="text-center py-10">
          <p className="text-red-500">Error loading maintenance requests. Please try again later.</p>
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
          <h1>Maintenance Requests</h1>
          <Link to="/maintenance/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>
        
        {requests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Maintenance Requests</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted any maintenance requests yet.
                </p>
                <Link to="/maintenance/new">
                  <Button>Submit a Request</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell className="capitalize">{request.priority}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                          {formatStatusLabel(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/maintenance/${request.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
};

export default MaintenanceRequestList; 