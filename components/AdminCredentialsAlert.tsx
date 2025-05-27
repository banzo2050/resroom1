
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Key, Copy } from "lucide-react";

interface AdminCredentialsAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: {
    email: string;
    password: string;
  };
}

const AdminCredentialsAlert: React.FC<AdminCredentialsAlertProps> = ({
  open,
  onOpenChange,
  credentials
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Admin Account Created</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your administrator account has been created successfully. Please save these credentials in a secure location.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-md border bg-muted/50 p-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1" 
                    onClick={() => copyToClipboard(credentials.email)}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
                <div className="mt-1 font-mono text-sm">{credentials.email}</div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Password</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1" 
                    onClick={() => copyToClipboard(credentials.password)}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
                <div className="mt-1 font-mono text-sm">{credentials.password}</div>
              </div>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center sm:space-x-2">
          <AlertDialogAction asChild>
            <Button className="w-full sm:w-auto">
              I've saved these credentials
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminCredentialsAlert;
