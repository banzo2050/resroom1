import React, { useState } from 'react';
import { useAuth } from '@/context/auth';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

const AppShell: React.FC<AppShellProps> = ({ children, className }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <div className="flex">
      <AppSidebar />
        <main className={cn("flex-1 p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
