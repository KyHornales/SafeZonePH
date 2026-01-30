import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users, 
  Phone,
  MessageSquare,
  ChevronRight,
  Shield,
  X,
  Check
} from 'lucide-react';

interface HelpRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userVerified: boolean;
  type: 'safety' | 'escort' | 'emergency' | 'general';
  title: string;
  description: string;
  location: string;
  distance: number;
  createdAt: Date;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  respondersNeeded: number;
  respondersCount: number;
  status: 'open' | 'in_progress' | 'resolved';
}

interface HelpRequestSystemProps {
  requests: HelpRequest[];
  onAcceptRequest: (requestId: string) => void;
  onMessageUser: (userId: string) => void;
  onCallUser: (userId: string) => void;
  onViewDetails: (request: HelpRequest) => void;
  currentUserId: string;
  className?: string;
}

const getUrgencyStyles = (urgency: HelpRequest['urgency']) => {
  switch (urgency) {
    case 'critical':
      return {
        bg: 'bg-red-50 border-red-200',
        badge: 'bg-red-500 text-white',
        text: 'text-red-600',
      };
    case 'high':
      return {
        bg: 'bg-orange-50 border-orange-200',
        badge: 'bg-orange-500 text-white',
        text: 'text-orange-600',
      };
    case 'normal':
      return {
        bg: 'bg-blue-50 border-blue-200',
        badge: 'bg-blue-500 text-white',
        text: 'text-blue-600',
      };
    case 'low':
    default:
      return {
        bg: 'bg-gray-50 border-gray-200',
        badge: 'bg-gray-500 text-white',
        text: 'text-gray-600',
      };
  }
};

const getTypeIcon = (type: HelpRequest['type']) => {
  switch (type) {
    case 'emergency':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'safety':
      return <Shield className="w-5 h-5 text-primary" />;
    case 'escort':
      return <Users className="w-5 h-5 text-primary" />;
    default:
      return <MessageSquare className="w-5 h-5 text-deep-slate/60" />;
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
};

const HelpRequestSystem: React.FC<HelpRequestSystemProps> = ({
  requests,
  onAcceptRequest,
  onMessageUser,
  onCallUser,
  onViewDetails,
  currentUserId,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'nearby' | 'urgent'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRequests = requests
    .filter(req => req.status === 'open')
    .filter(req => {
      if (filter === 'nearby') return req.distance <= 5;
      if (filter === 'urgent') return req.urgency === 'high' || req.urgency === 'critical';
      return true;
    })
    .sort((a, b) => {
      // Sort by urgency first, then by time
      const urgencyOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const urgentCount = requests.filter(
    r => r.status === 'open' && (r.urgency === 'high' || r.urgency === 'critical')
  ).length;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-deep-slate">Help Requests</h2>
        {urgentCount > 0 && (
          <span className="flex items-center gap-1 text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <AlertTriangle className="w-4 h-4" />
            {urgentCount} urgent
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { value: 'all', label: 'All Requests' },
          { value: 'nearby', label: 'Nearby (< 5km)' },
          { value: 'urgent', label: 'Urgent Only' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === option.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Request List */}
      {filteredRequests.length === 0 ? (
        <div className="card p-8 text-center">
          <Shield className="w-12 h-12 text-primary/30 mx-auto mb-3" />
          <h3 className="font-semibold text-deep-slate mb-1">No help requests</h3>
          <p className="text-sm text-deep-slate/60">
            {filter === 'all' 
              ? "Everyone's safe! Check back later."
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(request => {
            const styles = getUrgencyStyles(request.urgency);
            const isExpanded = expandedId === request.id;

            return (
              <div
                key={request.id}
                className={`border rounded-lg overflow-hidden transition-all ${styles.bg}`}
              >
                {/* Main Content */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Type Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(request.type)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-deep-slate truncate">
                          {request.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
                          {request.urgency}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-deep-slate/60">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {request.distance} km away
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(request.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {request.respondersCount}/{request.respondersNeeded} helping
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {request.userAvatar ? (
                            <img src={request.userAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {request.userName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-deep-slate/70">{request.userName}</span>
                        {request.userVerified && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <ChevronRight 
                      className={`w-5 h-5 text-deep-slate/40 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200/50">
                    <p className="text-sm text-deep-slate/70 mt-3 mb-4">
                      {request.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptRequest(request.id);
                        }}
                        className="btn btn-primary btn-sm flex-1 sm:flex-none justify-center"
                      >
                        <Check className="w-4 h-4" />
                        Accept & Help
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessageUser(request.userId);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {request.urgency === 'critical' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCallUser(request.userId);
                          }}
                          className="btn btn-outline btn-sm text-red-500 border-red-200"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HelpRequestSystem;
