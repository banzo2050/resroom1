
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { Block } from './AddRoomDialog';

interface BlocksListProps {
  blocks: Block[];
  onViewRooms: () => void;
}

const BlocksList: React.FC<BlocksListProps> = ({ blocks, onViewRooms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blocks.map(block => (
        <Card key={block.id} className="overflow-hidden">
          <CardHeader className="bg-primary/5 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{block.name}</CardTitle>
                <CardDescription>{block.description}</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Rooms:</span>
                <span className="font-medium">{block.totalRooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available Rooms:</span>
                <span className="font-medium">{block.availableRooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gender:</span>
                <span className="font-medium capitalize">{block.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Occupancy Rate:</span>
                <span className="font-medium">
                  {Math.round(((block.totalRooms - block.availableRooms) / block.totalRooms) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full" onClick={onViewRooms}>
                View Rooms
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlocksList;
