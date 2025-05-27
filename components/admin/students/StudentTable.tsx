
import React from 'react';
import { Student } from './StudentDetailsDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Download, Printer } from 'lucide-react';
import { getReportData, convertToCSV, downloadFile } from '@/utils/reportUtils';
import { toast } from '@/components/ui/sonner';

interface StudentTableProps {
  students: Student[];
  onViewDetails: (student: Student) => void;
  searchTerm: string;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onViewDetails, searchTerm }) => {
  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Generate and download students report
  const handleGenerateReport = () => {
    const columns = ['name', 'id', 'email', 'block', 'room', 'hasApplication', 'applicationStatus'];
    const data = getReportData('students', columns);
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, 'students-report', 'csv');
    toast.success('Students report downloaded successfully');
  };
  
  // Print the current students data
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups for printing.');
      return;
    }
    
    // Format the data for printing
    const tableRows = filteredStudents.map(student => `
      <tr>
        <td>${student.firstName} ${student.lastName}</td>
        <td>${student.studentId}</td>
        <td>${student.email}</td>
        <td>${student.isHoused ? 'Housed' : 'Not Housed'}</td>
        <td>${student.room || '-'}</td>
        <td>${student.block || '-'}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Students Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1a56db; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>UNESWA Students Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Email</th>
                <th>Housing Status</th>
                <th>Room</th>
                <th>Block</th>
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
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={handleGenerateReport}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
        <Button variant="outline" onClick={handlePrintReport}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Housing Status</TableHead>
            <TableHead>Room</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No students found matching your search criteria
              </TableCell>
            </TableRow>
          ) : (
            filteredStudents.map(student => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>
                  {student.isHoused ? (
                    <Badge className="bg-green-500">Housed</Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                      Not Housed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {student.room ? (
                    <div>
                      <div className="text-sm">{student.room}</div>
                      <div className="text-xs text-muted-foreground">{student.block}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" onClick={() => onViewDetails(student)}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentTable;
