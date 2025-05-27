
import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { toast } from "@/components/ui/sonner";
import { CheckCircle, Search, User, XCircle, Download, Printer } from 'lucide-react';
import { Application, ApplicationStatus } from '@/types';
import { getReportData, convertToCSV, downloadFile } from '@/utils/reportUtils';
import { useQuery } from '@tanstack/react-query';
import { fetchApplications, approveApplication, rejectApplication } from '@/services/applicationService';
import { useAuth } from '@/context/auth';
import { fetchAvailableRooms } from '@/services/roomService';

// Extended Application type to handle display properties
interface ExtendedApplication extends Application {
  // Display properties (generated from API data)
  studentName?: string;
  studentEmail?: string;
  blockPreference?: string;
  roomTypePreference?: string;
  assignedRoom?: string;
  academicYear?: string;
  semester?: string;
  reason?: string;
  createdAt?: string;
}

const AdminApplications: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<ExtendedApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch applications data
  const { data: applicationsData = [], isLoading: isLoadingApplications, refetch: refetchApplications } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: () => user ? fetchApplications(user.id, 'admin') : Promise.resolve([]),
    enabled: !!user,
  });

  // Fetch available rooms for assignment
  const { data: availableRooms = [] } = useQuery({
    queryKey: ['available-rooms'],
    queryFn: () => fetchAvailableRooms(),
  });
  
  // Process fetched applications to map to expected structure
  const applications: ExtendedApplication[] = applicationsData.map((app: any) => ({
    ...app,
    studentName: app.profiles?.full_name || 'Unknown Student',
    studentEmail: app.profiles?.email || 'No email',
    studentId: app.profiles?.student_id || app.student_id,
    blockPreference: app.blocks?.name || 'Not specified',
    roomTypePreference: app.room_type,
    createdAt: app.created_at,
    reason: app.admin_notes
  }));
  
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      app.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesFilter = filter === 'all' || app.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (application: ExtendedApplication) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
    setRejectionReason('');
    setSelectedRoomId('');
  };
  
  const handleApproveApplication = async () => {
    if (!selectedApplication || !selectedRoomId) {
      toast.error("Please select a room to assign");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Find the room details
      const room = availableRooms.find((r: any) => r.id === selectedRoomId);
      
      if (!room) {
        throw new Error("Selected room not found");
      }
      
      // Call the API to approve the application
      await approveApplication(
        selectedApplication.id, 
        selectedRoomId,
        `Approved and assigned to room ${room.room_number} in ${room.blocks?.name || 'Unknown Block'}`
      );
      
      toast.success(`Application approved and room ${room.room_number} assigned to ${selectedApplication.studentName || 'student'}`);
      setIsDetailsOpen(false);
      
      // Refresh the applications list
      refetchApplications();
      
    } catch (error: any) {
      console.error('Error approving application:', error);
      toast.error(error.message || 'Failed to approve application');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDenyApplication = async () => {
    if (!selectedApplication) return;
    
    try {
      setIsProcessing(true);
      
      // Call the API to reject the application
      await rejectApplication(
        selectedApplication.id,
        rejectionReason || 'Application denied by administrator'
      );
      
      toast.error(`Application from ${selectedApplication.studentName || 'student'} was denied`);
      setIsDetailsOpen(false);
      
      // Refresh the applications list
      refetchApplications();
      
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast.error(error.message || 'Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
      case 'pending': return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
      case 'denied': return <Badge className="bg-red-500">Denied</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  // Generate and download applications report
  const handleGenerateReport = () => {
    const columns = ['studentName', 'studentId', 'applicationDate', 'status', 'roomType', 'assignedRoom'];
    const data = getReportData('applications', columns);
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, 'applications-report', 'csv');
    toast.success('Applications report downloaded successfully');
  };
  
  // Print the current applications data
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups for printing.');
      return;
    }
    
    // Format the data for printing
    const tableRows = filteredApplications.map(app => `
      <tr>
        <td>${app.studentName || 'Unknown'}</td>
        <td>${app.student_id}</td>
        <td>${new Date(app.createdAt || app.created_at).toLocaleDateString()}</td>
        <td>${app.status}</td>
        <td>${app.roomTypePreference || app.room_type}</td>
        <td>${app.assignedRoom || 'Not assigned'}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Applications Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1a56db; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>UNESWA Student Applications Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Application Date</th>
                <th>Status</th>
                <th>Room Type</th>
                <th>Assigned Room</th>
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

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Student Applications</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateReport}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button variant="outline" onClick={handlePrintReport}>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Preferences</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingApplications ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No applications found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{application.studentName}</div>
                            <div className="text-xs text-muted-foreground">{application.studentEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{application.student_id}</TableCell>
                      <TableCell>
                        {new Date(application.createdAt || application.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{application.blockPreference}</div>
                          <div className="text-xs text-muted-foreground capitalize">{application.roomTypePreference || application.room_type} room</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleViewDetails(application)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review application from {selectedApplication.studentName} ({selectedApplication.student_id})
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Student Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Name:</div>
                    <div className="text-sm font-medium">{selectedApplication.studentName}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Student ID:</div>
                    <div className="text-sm font-medium">{selectedApplication.student_id}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Email:</div>
                    <div className="text-sm font-medium">{selectedApplication.studentEmail}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Application Details</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Academic Year:</div>
                    <div className="text-sm font-medium">{selectedApplication.academicYear || '2023-2024'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Semester:</div>
                    <div className="text-sm font-medium">{selectedApplication.semester || 'Both'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Room Type:</div>
                    <div className="text-sm font-medium capitalize">{selectedApplication.roomTypePreference || selectedApplication.room_type}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Preferences</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-1">
                  <div className="text-sm text-muted-foreground col-span-2">Block Preference:</div>
                  <div className="text-sm col-span-4">{selectedApplication.blockPreference}</div>
                </div>
                {(selectedApplication.special_requirements) && (
                  <div className="grid grid-cols-6 gap-1">
                    <div className="text-sm text-muted-foreground col-span-2">Special Requirements:</div>
                    <div className="text-sm col-span-4">{selectedApplication.special_requirements}</div>
                  </div>
                )}
              </div>
            </div>
            
            {selectedApplication.status === 'pending' && (
              <DialogFooter className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3 space-y-2">
                  <Select 
                    onValueChange={setSelectedRoomId}
                    value={selectedRoomId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign a room" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {availableRooms.length === 0 ? (
                        <SelectItem value="none" disabled>No available rooms</SelectItem>
                      ) : (
                        availableRooms.map((room: any) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.room_number} ({room.type}, {room.blocks?.name})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    className="w-full" 
                    onClick={handleApproveApplication}
                    disabled={isProcessing || !selectedRoomId || availableRooms.length === 0}
                  >
                    {isProcessing ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve & Assign Room
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="w-full md:w-1/3 space-y-2">
                  <Input
                    placeholder="Reason for denial (optional)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleDenyApplication}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Deny
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            )}
            
            {selectedApplication.status === 'approved' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">Application Approved</p>
                </div>
                <p className="mt-1 text-green-600 text-sm">
                  Room {selectedApplication.assignedRoom || 'Unknown'} has been assigned to this student.
                </p>
              </div>
            )}
            
            {selectedApplication.status === 'denied' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  <p className="font-medium">Application Denied</p>
                </div>
                <p className="mt-1 text-red-600 text-sm">
                  Reason: {selectedApplication.reason || selectedApplication.admin_notes || 'No reason provided'}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
};

export default AdminApplications;
