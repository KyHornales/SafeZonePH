import React from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Shield, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Clock3,
  MessageSquare
} from 'lucide-react';

interface BuddySession {
  id: string;
  buddyId: string;
  buddyName: string;
  buddyAvatar?: string;
  buddyVerified: boolean;
  taskTitle: string;
  location: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled';
  rating?: number;
  review?: string;
}

interface SessionHistoryProps {
  sessions: BuddySession[];
  onViewSession: (session: BuddySession) => void;
  onMessageBuddy: (buddyId: string) => void;
  onRateSession: (sessionId: string) => void;
  className?: string;
}

const getStatusStyles = (status: BuddySession['status']) => {
  switch (status) {
    case 'active':
      return {
        bg: 'bg-green-50 border-green-200',
        badge: 'bg-green-500 text-white',
        label: 'Active',
      };
    case 'completed':
      return {
        bg: 'bg-gray-50 border-gray-200',
        badge: 'bg-gray-500 text-white',
        label: 'Completed',
      };
    case 'cancelled':
      return {
        bg: 'bg-red-50 border-red-200',
        badge: 'bg-red-500 text-white',
        label: 'Cancelled',
      };
    case 'accepted':
      return {
        bg: 'bg-blue-50 border-blue-200',
        badge: 'bg-blue-500 text-white',
        label: 'Scheduled',
      };
    case 'pending':
    default:
      return {
        bg: 'bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-500 text-white',
        label: 'Pending',
      };
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  onViewSession,
  onMessageBuddy,
  onRateSession,
  className = '',
}) => {
  const activeSessions = sessions.filter(s => s.status === 'active');
  const upcomingSessions = sessions.filter(s => 
    s.status === 'pending' || s.status === 'accepted'
  );
  const pastSessions = sessions.filter(s => 
    s.status === 'completed' || s.status === 'cancelled'
  );

  const SessionCard: React.FC<{ session: BuddySession }> = ({ session }) => {
    const styles = getStatusStyles(session.status);

    return (
      <div
        className={`border rounded-lg overflow-hidden transition-all hover:shadow-md ${styles.bg}`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {session.buddyAvatar ? (
                  <img src={session.buddyAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-primary">
                    {session.buddyName.charAt(0)}
                  </span>
                )}
              </div>
              {session.buddyVerified && (
                <CheckCircle className="w-4 h-4 text-primary absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-deep-slate truncate">{session.taskTitle}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${styles.badge}`}>
                  {styles.label}
                </span>
              </div>

              <p className="text-sm text-deep-slate/60 mb-2">
                with <span className="font-medium">{session.buddyName}</span>
              </p>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-deep-slate/60">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(session.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {session.startTime}
                  {session.endTime && ` - ${session.endTime}`}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {session.location}
                </span>
              </div>

              {/* Rating */}
              {session.status === 'completed' && session.rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= session.rating! 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                  {session.review && (
                    <span className="text-xs text-deep-slate/50 ml-2 truncate">
                      "{session.review}"
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-2 bg-white/50 border-t flex gap-2">
          <button
            onClick={() => onViewSession(session)}
            className="text-sm text-primary hover:text-primary-dark"
          >
            View Details
          </button>
          {(session.status === 'active' || session.status === 'accepted') && (
            <button
              onClick={() => onMessageBuddy(session.buddyId)}
              className="text-sm text-deep-slate/60 hover:text-deep-slate flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          )}
          {session.status === 'completed' && !session.rating && (
            <button
              onClick={() => onRateSession(session.id)}
              className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 ml-auto"
            >
              <Star className="w-4 h-4" />
              Rate Session
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 font-semibold text-deep-slate mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Active Now
          </h3>
          <div className="space-y-3">
            {activeSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 font-semibold text-deep-slate mb-3">
            <Clock3 className="w-4 h-4 text-primary" />
            Upcoming
          </h3>
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-deep-slate mb-3">
            <CheckCircle className="w-4 h-4 text-deep-slate/60" />
            Past Sessions
          </h3>
          <div className="space-y-3">
            {pastSessions.slice(0, 5).map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
          {pastSessions.length > 5 && (
            <button className="w-full text-center text-sm text-primary hover:text-primary-dark mt-3">
              View all past sessions ({pastSessions.length})
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="card p-8 text-center">
          <Users className="w-12 h-12 text-deep-slate/20 mx-auto mb-3" />
          <h3 className="font-semibold text-deep-slate mb-1">No sessions yet</h3>
          <p className="text-sm text-deep-slate/60">
            Start by finding a buddy or creating a task request.
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
