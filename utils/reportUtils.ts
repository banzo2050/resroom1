
import { format } from 'date-fns';

// Define interfaces for the sample data that match our expected types
interface SampleRoom {
  id: string;
  room_number: string;
  block_id: string;
  capacity: number;
  occupied: number;
  floor: number;
  type: string;
  amenities: string[];
  status: string;
}

interface SampleBlock {
  id: string;
  name: string;
  gender: string;
  total_rooms: number;
  description: string;
}

interface SampleApplication {
  id: string;
  student_id: string;
  academicYear: string;
  semester: string;
  roomTypePreference: string;
  status: string;
  created_at: string;
  updated_at: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  reason?: string;
  assignedRoom?: string;
}

interface SampleMaintenanceRequest {
  id: string;
  student_id: string;
  room_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  completedAt?: string;
}

interface SampleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
}

// Sample data for report generation (in a real app, this would come from the database)
const sampleData = {
  rooms: [
    { id: 'r1', room_number: '101', block_id: 'b1', capacity: 2, occupied: 1, floor: 1, type: 'double', amenities: ['desk', 'closet'], status: 'available' },
    { id: 'r2', room_number: '102', block_id: 'b1', capacity: 1, occupied: 1, floor: 1, type: 'single', amenities: ['desk', 'closet', 'bathroom'], status: 'full' },
    { id: 'r3', room_number: '201', block_id: 'b2', capacity: 2, occupied: 0, floor: 2, type: 'double', amenities: ['desk', 'closet'], status: 'available' },
    { id: 'r4', room_number: '202', block_id: 'b2', capacity: 4, occupied: 2, floor: 2, type: 'quad', amenities: ['desk', 'closet', 'bathroom'], status: 'available' },
    { id: 'r5', room_number: '301', block_id: 'b3', capacity: 3, occupied: 3, floor: 3, type: 'triple', amenities: ['desk', 'closet'], status: 'full' }
  ] as SampleRoom[],
  
  blocks: [
    { id: 'b1', name: 'Alpha Block', gender: 'male', total_rooms: 20, description: 'Main male residence block' },
    { id: 'b2', name: 'Beta Block', gender: 'female', total_rooms: 25, description: 'Main female residence block' },
    { id: 'b3', name: 'Gamma Block', gender: 'mixed', total_rooms: 15, description: 'Mixed gender graduate residence' }
  ] as SampleBlock[],
  
  applications: [
    { id: 'a1', student_id: 'u1', academicYear: '2025-2026', semester: 'First', roomTypePreference: 'single', status: 'pending', created_at: '2025-03-10', updated_at: '2025-03-10', studentName: 'John Doe', studentId: 'S12345', studentEmail: 'john@uneswa.edu' },
    { id: 'a2', student_id: 'u2', academicYear: '2025-2026', semester: 'First', roomTypePreference: 'double', status: 'approved', assignedRoom: '101', created_at: '2025-03-08', updated_at: '2025-03-15', studentName: 'Jane Smith', studentId: 'S12346', studentEmail: 'jane@uneswa.edu' },
    { id: 'a3', student_id: 'u3', academicYear: '2025-2026', semester: 'Both', roomTypePreference: 'single', status: 'denied', created_at: '2025-03-05', updated_at: '2025-03-12', reason: 'No available rooms', studentName: 'Mark Johnson', studentId: 'S12347', studentEmail: 'mark@uneswa.edu' }
  ] as SampleApplication[],
  
  maintenance: [
    { id: 'm1', student_id: 'u2', room_id: 'r1', title: 'Leaking faucet', description: 'Bathroom sink is leaking', category: 'plumbing', priority: 'medium', status: 'pending', created_at: '2025-04-10', updated_at: '2025-04-10' },
    { id: 'm2', student_id: 'u4', room_id: 'r4', title: 'Broken light', description: 'Ceiling light not working', category: 'electrical', priority: 'high', status: 'in-progress', created_at: '2025-04-08', updated_at: '2025-04-12' },
    { id: 'm3', student_id: 'u5', room_id: 'r5', title: 'Damaged desk', description: 'Desk drawer broken', category: 'furniture', priority: 'low', status: 'completed', created_at: '2025-04-05', updated_at: '2025-04-15', completedAt: '2025-04-15' }
  ] as SampleMaintenanceRequest[],
  
  students: [
    { id: 'u1', email: 'john@uneswa.edu', firstName: 'John', lastName: 'Doe', role: 'student', studentId: 'S12345', createdAt: '2024-09-01', updatedAt: '2024-09-01' },
    { id: 'u2', email: 'jane@uneswa.edu', firstName: 'Jane', lastName: 'Smith', role: 'student', studentId: 'S12346', createdAt: '2024-09-01', updatedAt: '2024-09-01' },
    { id: 'u3', email: 'mark@uneswa.edu', firstName: 'Mark', lastName: 'Johnson', role: 'student', studentId: 'S12347', createdAt: '2024-09-01', updatedAt: '2024-09-01' },
    { id: 'u4', email: 'sarah@uneswa.edu', firstName: 'Sarah', lastName: 'Williams', role: 'student', studentId: 'S12348', createdAt: '2024-09-01', updatedAt: '2024-09-01' },
    { id: 'u5', email: 'robert@uneswa.edu', firstName: 'Robert', lastName: 'Brown', role: 'student', studentId: 'S12349', createdAt: '2024-09-01', updatedAt: '2024-09-01' }
  ] as SampleUser[]
};

// Function to get report data based on type and selected columns
export const getReportData = (
  reportType: string,
  columns: string[],
  startDate?: Date,
  endDate?: Date
): Record<string, any>[] => {
  switch (reportType) {
    case 'occupancy':
      return generateOccupancyReport(columns);
    case 'applications':
      return generateApplicationsReport(columns, startDate, endDate);
    case 'maintenance':
      return generateMaintenanceReport(columns, startDate, endDate);
    case 'blocks':
      return generateBlocksReport(columns);
    case 'students':
      return generateStudentsReport(columns);
    default:
      return [];
  }
};

// Helper function to filter data by date range if provided
const filterByDateRange = <T extends { created_at: string }>(
  data: T[],
  startDate?: Date,
  endDate?: Date
): T[] => {
  if (!startDate && !endDate) return data;
  
  return data.filter(item => {
    const createdDate = new Date(item.created_at);
    if (startDate && endDate) {
      return createdDate >= startDate && createdDate <= endDate;
    } else if (startDate) {
      return createdDate >= startDate;
    } else if (endDate) {
      return createdDate <= endDate;
    }
    return true;
  });
};

// Generate occupancy report
const generateOccupancyReport = (columns: string[]): Record<string, any>[] => {
  const { rooms, blocks } = sampleData;
  
  return rooms.map(room => {
    const block = blocks.find(b => b.id === room.block_id);
    
    const rowData: Record<string, any> = {
      block: block?.name || 'Unknown',
      roomNumber: room.room_number,
      type: room.type,
      capacity: room.capacity,
      occupied: room.occupied,
      status: room.status,
      floor: room.floor,
      occupants: `${room.occupied}/${room.capacity}`,
      amenities: room.amenities.join(', ')
    };
    
    // Filter to only include selected columns
    return columns.reduce((obj, column) => {
      if (column in rowData) {
        obj[column] = rowData[column];
      }
      return obj;
    }, {} as Record<string, any>);
  });
};

// Generate applications report
const generateApplicationsReport = (columns: string[], startDate?: Date, endDate?: Date): Record<string, any>[] => {
  const { applications } = sampleData;
  
  const filteredApplications = filterByDateRange(applications, startDate, endDate);
  
  return filteredApplications.map(app => {
    const rowData: Record<string, any> = {
      studentName: app.studentName,
      studentId: app.studentId,
      blockPreference: 'Any',
      roomType: app.roomTypePreference,
      applicationDate: app.created_at,
      status: app.status,
      assignedRoom: app.assignedRoom || 'Not assigned',
      semester: app.semester,
      academicYear: app.academicYear,
      email: app.studentEmail,
      reason: app.status === 'denied' ? (app.reason || 'No reason provided') : 'N/A'
    };
    
    return columns.reduce((obj, column) => {
      if (column in rowData) {
        obj[column] = rowData[column];
      }
      return obj;
    }, {} as Record<string, any>);
  });
};

// Generate maintenance report
const generateMaintenanceReport = (columns: string[], startDate?: Date, endDate?: Date): Record<string, any>[] => {
  const { maintenance, rooms, blocks } = sampleData;
  
  const filteredMaintenance = filterByDateRange(maintenance, startDate, endDate);
  
  return filteredMaintenance.map(request => {
    const room = rooms.find(r => r.id === request.room_id);
    const block = room ? blocks.find(b => b.id === room.block_id) : null;
    
    const rowData: Record<string, any> = {
      issueType: request.category,
      description: request.description,
      block: block?.name || 'Unknown',
      roomNumber: room?.room_number || 'Unknown',
      reportedBy: request.student_id,
      dateReported: request.created_at,
      status: request.status,
      priority: request.priority,
      completedDate: request.completedAt || 'Not completed',
      title: request.title
    };
    
    return columns.reduce((obj, column) => {
      if (column in rowData) {
        obj[column] = rowData[column];
      }
      return obj;
    }, {} as Record<string, any>);
  });
};

// Generate blocks report
const generateBlocksReport = (columns: string[]): Record<string, any>[] => {
  const { blocks, rooms, maintenance } = sampleData;
  
  return blocks.map(block => {
    const blockRooms = rooms.filter(r => r.block_id === block.id);
    const availableRooms = blockRooms.filter(r => r.status === 'available').length;
    const maintenanceIssues = maintenance.filter(m => {
      const room = rooms.find(r => r.id === m.room_id);
      return room?.block_id === block.id && m.status !== 'completed';
    }).length;
    
    const rowData: Record<string, any> = {
      name: block.name,
      totalRooms: block.total_rooms,
      availableRooms: availableRooms,
      occupancyRate: Math.round((1 - (availableRooms / block.total_rooms)) * 100),
      gender: block.gender,
      maintenanceIssues: maintenanceIssues,
      description: block.description || 'No description'
    };
    
    return columns.reduce((obj, column) => {
      if (column in rowData) {
        obj[column] = rowData[column];
      }
      return obj;
    }, {} as Record<string, any>);
  });
};

// Generate students report
const generateStudentsReport = (columns: string[]): Record<string, any>[] => {
  const { students, applications, rooms } = sampleData;
  
  return students.map(student => {
    const studentApp = applications.find(a => a.student_id === student.id);
    const assignedRoom = studentApp?.assignedRoom ? 
      rooms.find(r => r.room_number === studentApp.assignedRoom) : null;
    const blockId = assignedRoom?.block_id;
    
    const rowData: Record<string, any> = {
      name: `${student.firstName} ${student.lastName}`,
      id: student.studentId,
      email: student.email,
      block: blockId ? sampleData.blocks.find(b => b.id === blockId)?.name || 'Unknown' : 'Not assigned',
      room: assignedRoom?.room_number || 'Not assigned',
      hasApplication: applications.some(a => a.student_id === student.id) ? 'Yes' : 'No',
      hasMaintenance: sampleData.maintenance.some(m => m.student_id === student.id) ? 'Yes' : 'No',
      applicationStatus: studentApp ? studentApp.status : 'No application',
      createdAt: student.createdAt
    };
    
    return columns.reduce((obj, column) => {
      if (column in rowData) {
        obj[column] = rowData[column];
      }
      return obj;
    }, {} as Record<string, any>);
  });
};

// Function to convert JSON data to CSV format
export const convertToCSV = (data: Record<string, any>[]) => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');
  
  const rows = data.map(row => {
    return headers.map(header => {
      const cell = row[header] === null || row[header] === undefined ? '' : row[header];
      // Escape commas, quotes, etc. in cell values
      const escaped = typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
      return escaped;
    }).join(',');
  });
  
  return [headerRow, ...rows].join('\n');
};

// Function to convert report data to PDF format (simplified version)
export const createPDFContent = (title: string, data: Record<string, any>[]) => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  let content = `${title}\nGenerated on: ${format(new Date(), 'PPP')}\n\n`;
  
  // Add headers
  content += headers.join('\t') + '\n';
  content += headers.map(() => '---').join('\t') + '\n';
  
  // Add data rows
  data.forEach(row => {
    content += headers.map(header => row[header]).join('\t') + '\n';
  });
  
  return content;
};

// Function to download a file
export const downloadFile = (content: string, filename: string, format: string) => {
  const element = document.createElement('a');
  
  let mimeType = 'text/plain';
  let fileExtension = 'txt';
  
  switch (format.toLowerCase()) {
    case 'csv':
      mimeType = 'text/csv';
      fileExtension = 'csv';
      break;
    case 'pdf':
      mimeType = 'application/pdf';
      fileExtension = 'pdf';
      // In a real app, you would use a PDF generation library
      break;
    case 'excel':
      mimeType = 'application/vnd.ms-excel';
      fileExtension = 'xls';
      // In a real app, you would use an Excel generation library
      break;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  element.href = url;
  element.download = `${filename}.${fileExtension}`;
  document.body.appendChild(element);
  element.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  }, 100);
};
