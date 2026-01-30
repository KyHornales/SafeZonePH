import React from 'react';
import { Buddy } from '../../types';
import { getInitials, getStatusColor, getRiskLevelColor, timeAgo } from '../../utils/helpers';
import { MessageCircle, Phone, CheckCircle, AlertTriangle, Shield, User } from 'lucide-react';

interface BuddyCardProps {
  buddy: Buddy;
  onCheckIn?: (buddy: Buddy) => void;
  onMessage?: (buddy: Buddy) => void;
  onCall?: (buddy: Buddy) => void;
  onViewProfile?: (buddy: Buddy) => void;
  compact?: boolean;
}

const BuddyCard: React.FC<BuddyCardProps> = ({ buddy, onCheckIn, onMessage, onCall, onViewProfile, compact = false }) => {
  if (compact) {
    return (
      <div 
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-deep-slate/5 transition-colors cursor-pointer"
        onClick={() => onViewProfile?.(buddy)}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {buddy.avatar ? (
              <img src={buddy.avatar} alt={buddy.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(buddy.name)
            )}
          </div>
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(buddy.status)}`}></div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="font-medium text-deep-slate truncate text-sm">{buddy.name}</h4>
            {buddy.isVerified && (
              <Shield className="w-3 h-3 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-deep-slate/60 truncate">{buddy.location || buddy.relationship}</p>
        </div>

        {/* Risk Badge */}
        <span className={`badge text-xs ${getRiskLevelColor(buddy.riskLevel)}`}>
          {buddy.riskLevel}
        </span>
      </div>
    );
  }

  return (
    <div className="card p-4 md:p-5 hover:shadow-md active:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 md:gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base md:text-lg">
            {buddy.avatar ? (
              <img src={buddy.avatar} alt={buddy.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(buddy.name)
            )}
          </div>
          <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${getStatusColor(buddy.status)}`}></div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 md:mb-1">
            <h3 className="font-semibold text-deep-slate truncate text-sm md:text-base">{buddy.name}</h3>
            {buddy.isVerified && (
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs md:text-sm text-deep-slate/60 mb-1.5 md:mb-2">{buddy.relationship}</p>
          
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <span className={`badge text-[10px] md:text-xs ${getRiskLevelColor(buddy.riskLevel)}`}>
              {buddy.riskLevel === 'high' && <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3" />}
              {buddy.riskLevel.charAt(0).toUpperCase() + buddy.riskLevel.slice(1)} Risk
            </span>
            {buddy.lastCheckIn && (
              <span className="text-[10px] md:text-xs text-deep-slate/50 hidden sm:inline">
                Last check-in: {timeAgo(buddy.lastCheckIn)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-stone-100">
        <button
          onClick={() => onCheckIn?.(buddy)}
          className="flex-1 btn btn-secondary text-xs md:text-sm py-2 min-h-[40px]"
          title="Check in with buddy"
        >
          <CheckCircle className="w-4 h-4" />
          Check In
        </button>
        <button
          onClick={() => onMessage?.(buddy)}
          className="touch-target rounded-lg bg-stone-100 text-deep-slate hover:bg-stone-200 active:bg-stone-300 transition-colors"
          title="Send message"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        {buddy.phone && (
          <button
            onClick={() => onCall?.(buddy)}
            className="touch-target rounded-lg bg-stone-100 text-deep-slate hover:bg-stone-200 active:bg-stone-300 transition-colors"
            title="Call buddy"
          >
            <Phone className="w-5 h-5" />
          </button>
        )}
        {onViewProfile && (
          <button
            onClick={() => onViewProfile(buddy)}
            className="touch-target rounded-lg bg-stone-100 text-deep-slate hover:bg-stone-200 active:bg-stone-300 transition-colors"
            title="View profile"
          >
            <User className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BuddyCard;
