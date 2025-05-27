import { useAuth } from '@/context/auth';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '@/services/notificationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.uid],
    queryFn: () => user ? fetchNotifications(user.uid) : Promise.resolve([]),
    enabled: !!user
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => user ? markAllNotificationsAsRead(user.uid) : Promise.reject('No user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return {
    notifications,
    unreadCount,
    loading: isLoading,
    error,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    refresh: refetch
  };
};
