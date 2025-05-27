
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Block {
  id: string;
  name: string;
  totalRooms: number;
  availableRooms: number;
  gender: 'male' | 'female' | 'mixed';
  description?: string;
}

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  blocks: Block[];
}

const AddRoomDialog: React.FC<AddRoomDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  blocks
}) => {
  const [selectedYearLevels, setSelectedYearLevels] = useState<string[]>(['1', '2', '3', '4']);
  const [selectedSemesters, setSelectedSemesters] = useState<('First' | 'Second' | 'Both')[]>(['Both']);
  
  const handleYearLevelChange = (yearLevel: string) => {
    setSelectedYearLevels(
      selectedYearLevels.includes(yearLevel)
        ? selectedYearLevels.filter(y => y !== yearLevel)
        : [...selectedYearLevels, yearLevel]
    );
  };

  const handleSemesterChange = (semester: 'First' | 'Second' | 'Both') => {
    setSelectedSemesters(
      selectedSemesters.includes(semester)
        ? selectedSemesters.filter(s => s !== semester)
        : [...selectedSemesters, semester]
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            Enter details for the new room including eligibility restrictions
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left column - Room details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input id="roomNumber" name="roomNumber" placeholder="e.g. A-103" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blockId">Block</Label>
                <Select name="blockId" defaultValue="block-a">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a block" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks.map(block => (
                      <SelectItem key={block.id} value={block.id}>
                        {block.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type</Label>
                <Select name="roomType" defaultValue="single">
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="triple">Triple</SelectItem>
                    <SelectItem value="quad">Quad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor Number</Label>
                <Input id="floor" name="floor" type="number" defaultValue="1" required />
              </div>
            </div>
            
            {/* Right column - Eligibility restrictions */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Allowed Year Levels</Label>
                <div className="flex flex-wrap gap-4">
                  {['1', '2', '3', '4', 'Graduate'].map((year) => (
                    <div className="flex items-center space-x-2" key={year}>
                      <Checkbox 
                        id={`year-${year}`}
                        checked={selectedYearLevels.includes(year)}
                        onCheckedChange={() => handleYearLevelChange(year)}
                      />
                      <Label htmlFor={`year-${year}`} className="text-sm">
                        Year {year}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Allowed Semesters</Label>
                <div className="flex flex-wrap gap-4">
                  {(['First', 'Second', 'Both'] as const).map((semester) => (
                    <div className="flex items-center space-x-2" key={semester}>
                      <Checkbox 
                        id={`semester-${semester}`}
                        checked={selectedSemesters.includes(semester)}
                        onCheckedChange={() => handleSemesterChange(semester)}
                      />
                      <Label htmlFor={`semester-${semester}`} className="text-sm">
                        {semester} Semester
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Room Status</Label>
                <Select name="roomStatus" defaultValue="available">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomDialog;
