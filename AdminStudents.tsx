
import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import StudentTable from '@/components/admin/students/StudentTable';
import StudentDetailsDialog, { Student } from '@/components/admin/students/StudentDetailsDialog';

const AdminStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Mock data for students
  const students: Student[] = [
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Dlamini',
      email: 'john@uneswa.ac.sz',
      studentId: '20180123',
      isHoused: true,
      room: 'A-101',
      block: 'Block A',
      academicYear: '2025-2026',
      hasApplication: false,
      hasMaintenance: true
    },
    {
      id: 'user-2',
      firstName: 'Thabo',
      lastName: 'Zwane',
      email: 'thabo@uneswa.ac.sz',
      studentId: '20190456',
      isHoused: true,
      room: 'A-102',
      block: 'Block A',
      academicYear: '2025-2026',
      hasApplication: false,
      hasMaintenance: false
    },
    {
      id: 'user-3',
      firstName: 'Nomcebo',
      lastName: 'Simelane',
      email: 'nomcebo@uneswa.ac.sz',
      studentId: '20200789',
      isHoused: true,
      room: 'C-101',
      block: 'Block C',
      academicYear: '2025-2026',
      hasApplication: false,
      hasMaintenance: false
    },
    {
      id: 'user-4',
      firstName: 'Sipho',
      lastName: 'Nkambule',
      email: 'sipho@uneswa.ac.sz',
      studentId: '20210012',
      isHoused: false,
      academicYear: '2025-2026',
      hasApplication: true,
      hasMaintenance: false
    },
    {
      id: 'user-5',
      firstName: 'Precious',
      lastName: 'Maseko',
      email: 'precious@uneswa.ac.sz',
      studentId: '20221234',
      isHoused: false,
      academicYear: '2025-2026',
      hasApplication: true,
      hasMaintenance: false
    }
  ];
  
  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Student Management</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <StudentTable 
              students={students} 
              onViewDetails={handleViewDetails} 
              searchTerm={searchTerm}
            />
          </CardContent>
        </Card>
      </div>

      {/* Student Details Dialog */}
      <StudentDetailsDialog 
        student={selectedStudent}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </AppShell>
  );
};

export default AdminStudents;
