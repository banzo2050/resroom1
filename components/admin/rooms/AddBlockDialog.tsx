
import React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const AddBlockDialog: React.FC<AddBlockDialogProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Residence Block</DialogTitle>
          <DialogDescription>
            Enter details for the new residence block
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="blockName">Block Name</Label>
              <Input id="blockName" name="blockName" placeholder="e.g. Block D" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender Assignment</Label>
              <Select name="gender" defaultValue="mixed">
                <SelectTrigger>
                  <SelectValue placeholder="Select gender assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" placeholder="Brief description of the block" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Block</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockDialog;
