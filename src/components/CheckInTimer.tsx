import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  MapPin, 
  Shield, 
  AlertTriangle,
  Check,
  RefreshCw,
  Bell
} from 'lucide-react';

interface CheckInTimerProps {
  isActive: boolean;
  intervalMinutes: number;
  lastCheckIn?: Date;
  buddyName?: string;
  location?: string;
  onCheckIn: () => void;
  onMissedCheckIn: () => void;
  onExtendTimer: (minutes: number) => void;
  onEndSession: () => void;
  className?: string;
}

const CheckInTimer: React.FC<CheckInTimerProps> = ({
  isActive,
  intervalMinutes,
  lastCheckIn,
  buddyName,
  location,
  onCheckIn,
  onMissedCheckIn,
  onExtendTimer,
  onEndSession,
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = useState(intervalMinutes * 60);
  const [isOverdue, setIsOverdue] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  // Calculate time remaining based on last check-in
  useEffect(() => {
    if (!isActive) return;

    const calculateRemaining = () => {
      if (lastCheckIn) {
        const elapsed = Math.floor((Date.now() - lastCheckIn.getTime()) / 1000);
        const remaining = (intervalMinutes * 60) - elapsed;
        return remaining;
      }
      return intervalMinutes * 60;
    };

    setTimeRemaining(calculateRemaining());
  }, [isActive, lastCheckIn, intervalMinutes]);

  // Countdown timer
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0 && !isOverdue) {
          setIsOverdue(true);
          onMissedCheckIn();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isOverdue, onMissedCheckIn]);

  const handleCheckIn = useCallback(() => {
    setTimeRemaining(intervalMinutes * 60);
    setIsOverdue(false);
    setJustCheckedIn(true);
    onCheckIn();

    setTimeout(() => setJustCheckedIn(false), 2000);
  }, [intervalMinutes, onCheckIn]);

  const handleExtend = (minutes: number) => {
    setTimeRemaining(prev => prev + (minutes * 60));
    setShowExtendModal(false);
    onExtendTimer(minutes);
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const total = intervalMinutes * 60;
    return Math.max(0, Math.min(100, (timeRemaining / total) * 100));
  };

  const getTimerColor = () => {
    if (isOverdue) return 'text-red-500';
    if (timeRemaining < 60) return 'text-red-500';
    if (timeRemaining < 180) return 'text-yellow-500';
    return 'text-primary';
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className={`card overflow-hidden ${isOverdue ? 'border-red-500 border-2' : ''} ${className}`}>
      {/* Header */}
      <div className={`p-4 ${isOverdue ? 'bg-red-50' : 'bg-primary/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-primary'}`} />
            <span className="font-semibold text-deep-slate">Safety Check-in</span>
          </div>
          {isOverdue && (
            <span className="flex items-center gap-1 text-sm text-red-500 font-medium animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              Overdue!
            </span>
          )}
        </div>

        {/* Session Info */}
        <div className="mt-2 text-sm text-deep-slate/60">
          {buddyName && (
            <p className="flex items-center gap-1">
              <span>Buddy session with</span>
              <span className="font-medium text-deep-slate">{buddyName}</span>
            </p>
          )}
          {location && (
            <p className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {location}
            </p>
          )}
        </div>
      </div>

      {/* Timer Display */}
      <div className="p-6 text-center">
        {/* Circular Progress */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${getProgressPercentage() * 3.52} 352`}
              strokeLinecap="round"
              className={`${getTimerColor()} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock className={`w-6 h-6 mb-1 ${getTimerColor()}`} />
            <span className={`text-2xl font-bold ${getTimerColor()}`}>
              {formatTime(timeRemaining)}
            </span>
            <span className="text-xs text-deep-slate/50">
              {isOverdue ? 'overdue' : 'remaining'}
            </span>
          </div>
        </div>

        {/* Success Feedback */}
        {justCheckedIn && (
          <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <Check className="w-16 h-16 mx-auto mb-2" />
              <p className="text-xl font-bold">Checked In!</p>
            </div>
          </div>
        )}

        {/* Check In Button */}
        <button
          onClick={handleCheckIn}
          className={`btn w-full justify-center mb-3 ${
            isOverdue 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'btn-primary'
          }`}
        >
          <Check className="w-5 h-5" />
          {isOverdue ? "I'm Safe - Check In Now" : 'Check In'}
        </button>

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowExtendModal(true)}
            className="btn btn-outline flex-1 justify-center text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Extend
          </button>
          <button
            onClick={onEndSession}
            className="btn btn-outline flex-1 justify-center text-sm text-deep-slate/60"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Last Check-in Info */}
      {lastCheckIn && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-deep-slate/60 text-center">
          Last check-in: {lastCheckIn.toLocaleTimeString()}
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-semibold text-deep-slate mb-4">Extend Timer</h3>
            <p className="text-sm text-deep-slate/60 mb-4">
              Add more time before your next check-in:
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[5, 10, 15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => handleExtend(mins)}
                  className="btn btn-outline justify-center py-3"
                >
                  +{mins}m
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExtendModal(false)}
              className="btn btn-outline w-full justify-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInTimer;
