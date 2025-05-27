
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SetupInstructionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SetupInstructions: React.FC<SetupInstructionsProps> = ({
  open,
  onOpenChange
}) => {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("admin");

  const adminCredentials = {
    email: 'admin@uneswa.ac.sz',
    password: 'Admin@123'
  };

  const studentCredentials = {
    email: 'student@uneswa.ac.sz',
    password: 'Student@123'
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center">Welcome to ResRoom</DialogTitle>
          <DialogDescription className="text-center">
            Here are the default credentials to get started with the system
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="admin" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
            <TabsTrigger value="student">Student Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="admin" className="mt-4">
            <div className="rounded-md border bg-muted/50 p-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1" 
                      onClick={() => copyToClipboard(adminCredentials.email, 'adminEmail')}
                    >
                      {copied.adminEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                  <div className="mt-1 font-mono text-sm">{adminCredentials.email}</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Password</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1" 
                      onClick={() => copyToClipboard(adminCredentials.password, 'adminPassword')}
                    >
                      {copied.adminPassword ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                  <div className="mt-1 font-mono text-sm">{adminCredentials.password}</div>
                </div>
              </div>
              
              <p className="mt-4 text-xs text-muted-foreground">
                Remember to change the password after your first login for security reasons.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="student" className="mt-4">
            <div className="rounded-md border bg-muted/50 p-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1" 
                      onClick={() => copyToClipboard(studentCredentials.email, 'studentEmail')}
                    >
                      {copied.studentEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                  <div className="mt-1 font-mono text-sm">{studentCredentials.email}</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Password</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1" 
                      onClick={() => copyToClipboard(studentCredentials.password, 'studentPassword')}
                    >
                      {copied.studentPassword ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                  <div className="mt-1 font-mono text-sm">{studentCredentials.password}</div>
                </div>
              </div>
              
              <p className="mt-4 text-xs text-muted-foreground">
                You can also register a new student account through the registration page.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-center">
          <Button onClick={() => onOpenChange(false)}>
            Continue to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetupInstructions;
