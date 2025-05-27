
import React from 'react';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';

const AuthStatus = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="text-lg font-medium mb-3">Authentication Status</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              isLoading 
                ? 'bg-yellow-500 animate-pulse' 
                : isAuthenticated 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
            }`} 
          />
          <span>
            {isLoading 
              ? 'Loading authentication...' 
              : isAuthenticated 
                ? 'Authenticated' 
                : 'Not authenticated'}
          </span>
        </div>
        
        {isAuthenticated && user && (
          <div className="text-sm space-y-1 pt-2">
            <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
            {user.studentId && (
              <p><span className="font-medium">Student ID:</span> {user.studentId}</p>
            )}
          </div>
        )}
        
        {!isAuthenticated && !isLoading && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not authenticated</AlertTitle>
            <AlertDescription>
              You need to log in to access protected areas of the application.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AuthStatus;
