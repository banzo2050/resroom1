import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Room } from "./RoomDetailsDialog";

interface RoomsTableProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
}

export default function RoomsTable({ rooms, onEdit, onDelete }: RoomsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "occupied":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Occupied</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-500">Maintenance</Badge>;
      case "reserved":
        return <Badge className="bg-purple-500">Reserved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Building</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium">{room.number}</TableCell>
              <TableCell className="capitalize">{room.type}</TableCell>
              <TableCell>{room.building}</TableCell>
              <TableCell>{room.floor}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell>${room.price}</TableCell>
              <TableCell>{getStatusBadge(room.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(room)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(room.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
