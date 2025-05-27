import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/components/ui/sonner";
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Check, 
  AlertCircle, 
  Clock, 
  Settings,
  AlarmClock,
  CheckCircle2,
  XCircle,
  Download,
  Printer
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReportData, convertToCSV, downloadFile } from '@/utils/reportUtils';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  roomId: string;
  room: string;
  block: string;
  studentName: string;
  studentId: string;
  submittedDate: string;
  updatedDate: string;
  completedDate?: string;
  adminNotes?: string;
}

const AdminMaintenance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Mock data for maintenance requests
  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 'maint-123',
      title: 'Leaking faucet in bathroom',
      description: 'The sink faucet is constantly dripping and causing water wastage.',
      category: 'plumbing',
      priority: 'medium',
      status: 'pending',
      roomId: 'room-a101',
      room: 'A-101',
      block: 'Block A',
      studentName: 'John Dlamini',
      studentId: '20180123',
      submittedDate: '2025-04-10T14:30:00Z',
      updatedDate: '2025-04-10T14:30:00Z',
    },
    {
      id: 'maint-456',
      title: 'Light fixture not working',
      description: 'The ceiling light in my room is flickering and sometimes does not turn on at all.',
      category: 'electrical',
      priority: 'low',
      status: 'in-progress',
      roomId: 'room-b101',
      room: 'B-101',
      block: 'Block B',
      studentName: 'Thabo Zwane',
      studentId: '20190456',
      submittedDate: '2025-04-08T09:15:00Z',
      updatedDate: '2025-04-11T10:20:00Z',
      adminNotes: 'Assigned to maintenance team. Scheduled for April 12.'
    },
    {
      id: 'maint-789',
      title: 'Broken window handle',
      description: 'The window handle in my room is broken and I cannot properly close the window.',
      category: 'furniture',
      priority: 'high',
      status: 'completed',
      roomId: 'room-c101',
      room: 'C-101',
      block: 'Block C',
      studentName: 'Nomcebo Simelane',
      studentId: '20200789',
      submittedDate: '2025-04-05T16:45:00Z',
      updatedDate: '2025-04-09T11:30:00Z',
      completedDate: '2025-04-09T11:30:00Z',
      adminNotes: 'Window handle replaced with new one.'
    },
    {
      id: 'maint-012',
      title: 'No hot water in shower',
      description: 'The water heater seems to be broken as there is no hot water in the shower.',
      category: 'plumbing',
      priority: 'urgent',
      status: 'pending',
      roomId: 'room-a102',
      room: 'A-102',
      block: 'Block A',
      studentName: 'Sipho Nkambule',
      studentId: '20210012',
      submittedDate: '2025-04-12T08:00:00Z',
      updatedDate: '2025-04-12T08:00:00Z',
    },
  ];
  
  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewDetails = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };
  
  const handleUpdateStatus = (status: 'in-progress' | 'completed' | 'cancelled') => {
    if (!selectedRequest) return;
    
    // In a real application, this would update the database
    toast.success(`Maintenance request status updated to ${status}`);
    setIsDetailsOpen(false);
  };
  
  const handleUpdateNotes = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const notes = formData.get('adminNotes') as string;
    
    // In a real application, this would update the database
    toast.success('Maintenance notes updated successfully');
    setIsDetailsOpen(false);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlarmClock className="h-4 w-4 text-amber-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'low': return <Clock className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge className="bg-red-500 text-white">Urgent</Badge>;
      case 'high': return <Badge className="bg-amber-500 text-white">High</Badge>;
      case 'medium': return <Badge className="bg-blue-500 text-white">Medium</Badge>;
      case 'low': return <Badge className="bg-green-500 text-white">Low</Badge>;
      default: return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
      case 'in-progress': 
        return <Badge variant="outline" className="border-blue-500 text-blue-500">In Progress</Badge>;
      case 'completed': 
        return <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>;
      case 'cancelled': 
        return <Badge variant="outline" className="border-red-500 text-red-500">Cancelled</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Generate and download maintenance report
  const handleGenerateReport = () => {
    const columns = ['title', 'category', 'priority', 'status', 'roomNumber', 'block', 'studentName', 'dateReported'];
    const data = getReportData('maintenance', columns);
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, 'maintenance-report', 'csv');
    toast.success('Maintenance report downloaded successfully');
  };
  
  // Print the current maintenance data
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups for printing.');
      return;
    }
    
    // Format the data for printing
    const tableRows = filteredRequests.map(request => `
      <tr>
        <td>${request.title}</td>
        <td>${request.category}</td>
        <td>${request.priority}</td>
        <td>${request.status}</td>
        <td>${request.room}</td>
        <td>${request.block}</td>
        <td>${request.studentName}</td>
        <td>${new Date(request.submittedDate).toLocaleDateString()}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Maintenance Requests Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1a56db; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>UNESWA Maintenance Requests Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Room</th>
                <th>Block</th>
                <th>Student</th>
                <th>Date Reported</th>
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
          <h1 className="text-2xl font-bold">Maintenance Requests</h1>
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
                placeholder="Search requests..."
                className="pl-8 w-full md:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[3%]">Priority</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No maintenance requests found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {getPriorityIcon(request.priority)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-xs text-muted-foreground capitalize">{request.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{request.room}</div>
                          <div className="text-xs text-muted-foreground">{request.block}</div>
                        </div>
                      </TableCell>
                      <TableCell>{request.studentName}</TableCell>
                      <TableCell>
                        {new Date(request.submittedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleViewDetails(request)}
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

      {/* Maintenance Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Maintenance Request Details</DialogTitle>
                <DialogDescription>
                  Request #: {selectedRequest.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 my-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{selectedRequest.title}</h3>
                    <p className="text-muted-foreground capitalize">{selectedRequest.category}</p>
                  </div>
                  <div>
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-md">
                  <p>{selectedRequest.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Location</h4>
                    <div className="space-y-1">
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Room:</span>
                        <span className="text-sm font-medium">{selectedRequest.room}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Block:</span>
                        <span className="text-sm font-medium">{selectedRequest.block}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Student</h4>
                    <div className="space-y-1">
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm font-medium">{selectedRequest.studentName}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Student ID:</span>
                        <span className="text-sm font-medium">{selectedRequest.studentId}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Timeline</h4>
                  <div className="space-y-1">
                    <div className="grid grid-cols-4">
                      <span className="text-sm text-muted-foreground">Submitted:</span>
                      <span className="text-sm font-medium col-span-3">
                        {new Date(selectedRequest.submittedDate).toLocaleString()}
                      </span>
                    </div>
                    {selectedRequest.updatedDate !== selectedRequest.submittedDate && (
                      <div className="grid grid-cols-4">
                        <span className="text-sm text-muted-foreground">Updated:</span>
                        <span className="text-sm font-medium col-span-3">
                          {new Date(selectedRequest.updatedDate).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedRequest.completedDate && (
                      <div className="grid grid-cols-4">
                        <span className="text-sm text-muted-foreground">Completed:</span>
                        <span className="text-sm font-medium col-span-3">
                          {new Date(selectedRequest.completedDate).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <form onSubmit={handleUpdateNotes} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Administration Notes</Label>
                    <Textarea
                      id="adminNotes"
                      name="adminNotes"
                      placeholder="Add notes about this maintenance request..."
                      defaultValue={selectedRequest.adminNotes || ''}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Notes</Button>
                  </div>
                </form>
              </div>
              
              <DialogFooter>
                {selectedRequest.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button 
                      className="flex-1"
                      onClick={() => handleUpdateStatus('in-progress')}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Mark as In Progress
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleUpdateStatus('cancelled')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Request
                    </Button>
                  </div>
                )}
                
                {selectedRequest.status === 'in-progress' && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => handleUpdateStatus('completed')}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleUpdateStatus('cancelled')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Request
                    </Button>
                  </div>
                )}
                
                {(selectedRequest.status === 'completed' || selectedRequest.status === 'cancelled') && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Reopen Request
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default AdminMaintenance;
