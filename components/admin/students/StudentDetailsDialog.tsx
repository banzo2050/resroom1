
import React from 'react';
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
import { User } from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  date: string;
  status: string;
}

interface ApplicationHistory {
  id: string;
  academicYear: string;
  submittedDate: string;
  status: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  isHoused: boolean;
  room?: string;
  block?: string;
  academicYear: string;
  hasApplication: boolean;
  hasMaintenance: boolean;
}

interface StudentDetailsDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentDetailsDialog: React.FC<StudentDetailsDialogProps> = ({
  student,
  open,
  onOpenChange
}) => {
  if (!student) return null;
  
  // Mock maintenance requests for selected student
  const studentMaintenanceRequests: MaintenanceRequest[] = [
    {
      id: 'maint-123',
      title: 'Leaking faucet in bathroom',
      date: '2025-04-10',
      status: 'in-progress'
    }
  ];
  
  // Mock application history for selected student
  const studentApplicationHistory: ApplicationHistory[] = [
    {
      id: 'app-123',
      academicYear: '2025-2026',
      submittedDate: '2025-03-15',
      status: 'approved'
    },
    {
      id: 'app-456',
      academicYear: '2024-2025',
      submittedDate: '2024-09-01',
      status: 'approved'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>
            Details for {student.firstName} {student.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          <div className="md:col-span-1">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User size={40} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{student.firstName} {student.lastName}</h3>
              <p className="text-muted-foreground text-sm">{student.email}</p>
              <p className="text-muted-foreground text-sm mt-1">ID: {student.studentId}</p>
              
              <div className="mt-4 w-full">
                {student.isHoused ? (
                  <Badge className="bg-green-500 w-full flex justify-center py-1">Housed</Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500 text-amber-500 w-full flex justify-center py-1">
                    Not Housed
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Housing Information</h3>
                <div className="bg-muted p-3 rounded-md">
                  {student.isHoused ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Room:</span>
                        <span className="font-medium">{student.room}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Block:</span>
                        <span className="font-medium">{student.block}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Academic Year:</span>
                        <span className="font-medium">{student.academicYear}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Student is not currently housed.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Application History</h3>
                {student.hasApplication || studentApplicationHistory.length > 0 ? (
                  <div className="bg-muted p-3 rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium text-muted-foreground text-sm">Academic Year</th>
                          <th className="text-left py-2 font-medium text-muted-foreground text-sm">Submitted</th>
                          <th className="text-left py-2 font-medium text-muted-foreground text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentApplicationHistory.map(app => (
                          <tr key={app.id} className="border-b last:border-0">
                            <td className="py-2">{app.academicYear}</td>
                            <td className="py-2">{app.submittedDate}</td>
                            <td className="py-2 capitalize">
                              <Badge variant={app.status === 'approved' ? 'default' : 'outline'}>
                                {app.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground bg-muted p-3 rounded-md">No application history found.</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Maintenance Requests</h3>
                {student.hasMaintenance || studentMaintenanceRequests.length > 0 ? (
                  <div className="bg-muted p-3 rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium text-muted-foreground text-sm">Issue</th>
                          <th className="text-left py-2 font-medium text-muted-foreground text-sm">Date</th>
                          <th className="text-left py-2 font-medium text-muted-foreground text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentMaintenanceRequests.map(req => (
                          <tr key={req.id} className="border-b last:border-0">
                            <td className="py-2">{req.title}</td>
                            <td className="py-2">{req.date}</td>
                            <td className="py-2 capitalize">
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                {req.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground bg-muted p-3 rounded-md">No maintenance requests found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {student.isHoused ? (
            <Button variant="destructive">
              Remove Housing Assignment
            </Button>
          ) : (
            <Button>
              Assign Room
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsDialog;
