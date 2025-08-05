import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '@/components/layout/notifications-dropdown';

// Generate sample notifications for testing
const generateSampleNotifications = (): Notification[] => {
  return [
    {
      id: 1,
      title: 'New song upload',
      message: 'Your song "Summer Vibes" has been approved',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      type: 'success'
    },
    {
      id: 2,
      title: 'Playlist update',
      message: 'Your playlist "Morning Chill" has been updated',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'info'
    },
    {
      id: 3,
      title: 'New follower',
      message: 'DJ Harmony is now following your content',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: 'info'
    },
    {
      id: 4,
      title: 'Upload error',
      message: 'Your audio file could not be processed. Please try again.',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      type: 'error'
    },
    {
      id: 5,
      title: 'Payment reminder',
      message: 'Your subscription will renew in 3 days',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: 'warning'
    }
  ];
};

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearAllNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load sample notifications on mount (this would be replaced with API calls in production)
  useEffect(() => {
    setNotifications(generateSampleNotifications());
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}