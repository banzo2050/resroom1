
import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
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
import { FileText, Plus, Printer, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/auth';
import { fetchApplications } from '@/services/applications';
import { Application } from '@/types';
import { useQuery } from '@tanstack/react-query';

const ApplicationList: React.FC = () => {
  const { user } = useAuth();
  
  const { data: applications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: () => user ? fetchApplications(user.id, user.role) : Promise.resolve([]),
    enabled: !!user
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'denied': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return '';
    }
  };
  
  const formatStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Print the current applications
  const handlePrintReport = () => {
    if (applications.length === 0) {
      toast.error('No applications to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups for printing.');
      return;
    }
    
    // Format the data for printing
    const tableRows = applications.map((app: Application) => `
      <tr>
        <td>${app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</td>
        <td>${app.room_type}</td>
        <td>${formatStatusLabel(app.status)}</td>
        <td>${app.blocks?.name || 'Not specified'}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>My Applications</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1a56db; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>My Accommodation Applications</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Submitted Date</th>
                <th>Room Type</th>
                <th>Status</th>
                <th>Block Preference</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading applications...</span>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="text-center py-10">
          <p className="text-red-500">Error loading applications. Please try again later.</p>
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
          <h1>My Applications</h1>
          <div className="flex gap-2">
            <Button onClick={handlePrintReport} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print Applications
            </Button>
            <Link to="/apply">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Button>
            </Link>
          </div>
        </div>
        
        {applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted any accommodation applications yet.
                </p>
                <Link to="/apply">
                  <Button>Apply for Accommodation</Button>
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
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Block Preference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application: Application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="capitalize">{application.room_type}</TableCell>
                      <TableCell>{application.blocks?.name || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(application.status)}>
                          {formatStatusLabel(application.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/applications/${application.id}`}>
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

export default ApplicationList;
