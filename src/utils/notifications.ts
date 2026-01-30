import { PointsHistory } from '../types';

export const addPointsHistoryEntry = (points: number, description: string, type: string): void => {
  const existingHistory = localStorage.getItem('safezoneph_points_history');
  const history: PointsHistory[] = existingHistory ? JSON.parse(existingHistory) : [];
  
  const newEntry: PointsHistory = {
    id: Date.now().toString(),
    type: type as any,
    description,
    points,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0]
  };
  
  history.unshift(newEntry);
  localStorage.setItem('safezoneph_points_history', JSON.stringify(history));
};

export const createNotification = (type: string, title: string, message: string): void => {
  // Create browser notification if permission is granted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      tag: type
    });
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};