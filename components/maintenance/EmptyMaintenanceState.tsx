
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const EmptyMaintenanceState: React.FC = () => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="flex flex-col items-center">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Maintenance Requests</h3>
          <p className="text-muted-foreground mb-6">
            You haven't submitted any maintenance requests yet.
          </p>
          <Link to="/maintenance/new">
            <Button>Submit Maintenance Request</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyMaintenanceState;
