import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Bell,
  X
} from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNotifications } from '@/hooks/useNotifications';
// Use the new logo in public
const resroomLogo = '/uneswa-logo.png';

interface AppHeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ setSidebarOpen, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const isMobile = useMobile();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications, markAsRead } = useNotifications();
  
  const unreadNotifications = notifications?.filter(n => !n.read) || [];
  
  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;
  };
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <Link to="/" className="flex items-center gap-2 font-bold">
            <img 
              src={resroomLogo} 
              alt="UNESWA Logo" 
              className="h-10 w-auto max-w-[40px] md:h-12 md:max-w-[48px] object-contain"
            />
            <span className="text-lg md:text-xl hidden md:inline-flex">ResRoom</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications.length > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-destructive text-destructive-foreground"
                      >
                        {unreadNotifications.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <div className="h-full flex flex-col">
                    <h3 className="text-lg font-medium mb-2">Notifications</h3>
                    <div className="flex-1 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        <div className="space-y-2">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`p-3 rounded-md border ${notification.read ? 'bg-background' : 'bg-muted'}`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">{notification.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No notifications</p>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.firstName} {user.lastName}
                    <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!user && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
