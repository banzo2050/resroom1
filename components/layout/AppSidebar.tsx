import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  Wrench,
  Bell,
  Settings,
  Users,
  Building2,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/applications', label: 'My Applications', icon: FileText },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/announcements', label: 'Announcements', icon: Bell },
    { to: '/profile', label: 'Profile', icon: Settings }
  ];

  const adminLinks = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/admin/applications', label: 'Applications', icon: FileText },
    { to: '/admin/rooms', label: 'Rooms', icon: Building2 },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/admin/announcements', label: 'Announcements', icon: Bell },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 border-r bg-card min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">ResRoom</h2>
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
              return (
                <Link
                key={link.to}
                to={link.to}
                  className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive(link.to)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                  )}
                >
                <Icon className="h-4 w-4" />
                {link.label}
                </Link>
              );
            })}
          </nav>
      </div>
      <div className="p-6 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
        </div>
    </aside>
  );
};

export default AppSidebar;
