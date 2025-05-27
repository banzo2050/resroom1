
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaintenanceRequest } from '@/types';

interface MaintenanceTableProps {
  requests: MaintenanceRequest[];
}

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({ requests }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return <Badge variant="outline">Low</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'high': return <Badge variant="default">High</Badge>;
      case 'emergency': return <Badge variant="destructive">Emergency</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return '';
    }
  };
  
  const formatStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request: MaintenanceRequest) => (
          <TableRow key={request.id}>
            <TableCell className="capitalize font-medium">{request.category}</TableCell>
            <TableCell className="max-w-[300px] truncate">{request.description}</TableCell>
            <TableCell>{getPriorityBadge(request.priority)}</TableCell>
            <TableCell>
              {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
            </TableCell>
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
  );
};

export default MaintenanceTable;
