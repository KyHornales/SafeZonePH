import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types';
import { mockNotifications } from '../data/mockData';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications from backend
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await apiService.getNotifications();
        if (!response.data) return;
        
        // Convert backend notifications to frontend format
        const formattedNotifications = response.data.map((n: any) => ({
          id: n.id.toString(),
          type: n.type as Notification['type'],
          title: n.title,
          message: n.message,
          timestamp: n.created_at,
          isRead: n.is_read,
          data: n.data,
          actionUrl: n.action_url
        }));
        
        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Keep using mock data on error
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await apiService.markNotificationRead(parseInt(id));
      if (response.data) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications
      await Promise.all(
        notifications
          .filter(n => !n.isRead)
          .map(n => apiService.markNotificationRead(parseInt(n.id)))
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearNotification = async (id: string) => {
    try {
      const response = await apiService.deleteNotification(parseInt(id));
      if (response.data !== undefined) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
