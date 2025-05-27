import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/sonner";
import { Plus } from 'lucide-react';
import RoomsTable from '@/components/admin/rooms/RoomsTable';
import RoomDetailsDialog, { Room } from '@/components/admin/rooms/RoomDetailsDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/main";

const AdminRooms: React.FC = () => {
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const queryClient = useQueryClient();

  // Fetch rooms
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const roomsRef = collection(db, "rooms");
      const snapshot = await getDocs(roomsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
    }
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: async (newRoom: Omit<Room, "id">) => {
      const roomsRef = collection(db, "rooms");
      const docRef = await addDoc(roomsRef, newRoom);
      return { id: docRef.id, ...newRoom };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success('Room added successfully');
      setRoomDetailsOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to add room: ' + error.message);
    }
  });

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: async (room: Room) => {
      const roomRef = doc(db, "rooms", room.id!);
      await updateDoc(roomRef, room);
      return room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success('Room updated successfully');
      setRoomDetailsOpen(false);
      setSelectedRoom(null);
    },
    onError: (error) => {
      toast.error('Failed to update room: ' + error.message);
    }
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const roomRef = doc(db, "rooms", roomId);
      await deleteDoc(roomRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success('Room deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete room: ' + error.message);
    }
  });

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setRoomDetailsOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setRoomDetailsOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      await deleteRoomMutation.mutateAsync(roomId);
    }
  };

  const handleSaveRoom = async (roomData: Omit<Room, "id">) => {
    if (selectedRoom) {
      await updateRoomMutation.mutateAsync({ ...roomData, id: selectedRoom.id });
    } else {
      await addRoomMutation.mutateAsync(roomData);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AppShell>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Room Management</h1>
          <Button onClick={handleAddRoom}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>

        <RoomsTable
          rooms={rooms}
          onEdit={handleEditRoom}
          onDelete={handleDeleteRoom}
        />

        <RoomDetailsDialog
          open={roomDetailsOpen}
          onOpenChange={setRoomDetailsOpen}
          room={selectedRoom}
          onSave={handleSaveRoom}
        />
      </div>
    </AppShell>
  );
};

export default AdminRooms;
