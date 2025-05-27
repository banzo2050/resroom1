
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center p-6">
        <h1 className="text-4xl font-bold text-primary mb-4">Access Denied</h1>
        <p className="text-xl mb-8">
          You don't have permission to access this page.
        </p>
        <Link to="/">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
