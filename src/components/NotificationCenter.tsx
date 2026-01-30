import React from 'react';
import { 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  Users, 
  CheckCircle,
  Clock,
  X,
  ChevronRight,
  Shield
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'message' | 'buddy_request' | 'alert' | 'check_in' | 'system' | 'sos';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (notificationId: string) => void;
  onClearAll: () => void;
  className?: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="w-5 h-5 text-primary" />;
    case 'buddy_request':
      return <Users className="w-5 h-5 text-primary" />;
    case 'alert':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'sos':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'check_in':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'system':
    default:
      return <Bell className="w-5 h-5 text-deep-slate/60" />;
  }
};

const getNotificationBg = (type: Notification['type']) => {
  switch (type) {
    case 'sos':
      return 'bg-red-50 border-red-200';
    case 'alert':
      return 'bg-yellow-50 border-yellow-200';
    case 'buddy_request':
      return 'bg-primary/5 border-primary/20';
    case 'message':
      return 'bg-blue-50 border-blue-200';
    case 'check_in':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-white border-gray-200';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  className = '',
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const sortedNotifications = [...notifications].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const urgentNotifications = sortedNotifications.filter(
    n => n.type === 'sos' || n.type === 'alert'
  );
  const regularNotifications = sortedNotifications.filter(
    n => n.type !== 'sos' && n.type !== 'alert'
  );

  if (notifications.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="font-semibold text-deep-slate mb-1">No notifications</h3>
          <p className="text-sm text-deep-slate/60">
            You're all caught up! Check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-deep-slate">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-burnt-orange text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm text-deep-slate/60 hover:text-deep-slate"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-deep-slate/60 uppercase tracking-wide mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Urgent
          </h3>
          <div className="space-y-2">
            {urgentNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick(notification)}
                onDismiss={() => onDismiss(notification.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notifications */}
      {regularNotifications.length > 0 && (
        <div>
          {urgentNotifications.length > 0 && (
            <h3 className="text-xs font-medium text-deep-slate/60 uppercase tracking-wide mb-2">
              Other
            </h3>
          )}
          <div className="space-y-2">
            {regularNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick(notification)}
                onDismiss={() => onDismiss(notification.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationItem: React.FC<{
  notification: Notification;
  onClick: () => void;
  onDismiss: () => void;
}> = ({ notification, onClick, onDismiss }) => {
  return (
    <div
      className={`relative border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${
        getNotificationBg(notification.type)
      } ${!notification.isRead ? 'border-l-4' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-medium truncate ${
              notification.isRead ? 'text-deep-slate/70' : 'text-deep-slate'
            }`}>
              {notification.title}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-deep-slate/40 hover:text-deep-slate p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className={`text-sm mt-0.5 line-clamp-2 ${
            notification.isRead ? 'text-deep-slate/50' : 'text-deep-slate/70'
          }`}>
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-deep-slate/40" />
            <span className="text-xs text-deep-slate/40">
              {formatTimestamp(notification.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-3 right-8 w-2 h-2 bg-burnt-orange rounded-full" />
      )}
    </div>
  );
};

export default NotificationCenter;
