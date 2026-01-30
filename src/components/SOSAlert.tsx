import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  X, 
  Clock, 
  Shield,
  Send,
  CheckCircle
} from 'lucide-react';

interface SOSAlertProps {
  isActive: boolean;
  onActivate: () => void;
  onCancel: () => void;
  onConfirm: (message?: string) => void;
  emergencyContacts: {
    id: string;
    name: string;
    phone: string;
  }[];
  currentLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  className?: string;
}

const SOSAlert: React.FC<SOSAlertProps> = ({
  isActive,
  onActivate,
  onCancel,
  onConfirm,
  emergencyContacts,
  currentLocation,
  className = '',
}) => {
  const [countdown, setCountdown] = useState(5);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (isActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isActive && countdown === 0 && !isSent) {
      handleSendSOS();
    }
  }, [isActive, countdown]);

  useEffect(() => {
    if (!isActive) {
      setCountdown(5);
      setCustomMessage('');
      setIsSending(false);
      setIsSent(false);
    }
  }, [isActive]);

  const handleSendSOS = async () => {
    setIsSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    setIsSent(true);
    onConfirm(customMessage || undefined);
  };

  const handleCancel = () => {
    setCountdown(5);
    onCancel();
  };

  if (!isActive) {
    return (
      <button
        onClick={onActivate}
        className={`relative group ${className}`}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
          <div className="text-center text-white">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1" />
            <span className="text-xs font-bold">SOS</span>
          </div>
        </div>
      </button>
    );
  }

  if (isSent) {
    return (
      <div className="fixed inset-0 z-50 bg-green-500 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">SOS Sent!</h1>
        <p className="text-white/80 mb-6">
          Your emergency contacts have been notified with your location.
        </p>
        <div className="space-y-2 w-full max-w-sm">
          {emergencyContacts.slice(0, 3).map(contact => (
            <div key={contact.id} className="bg-white/20 rounded-lg p-3 flex items-center justify-between">
              <span className="font-medium">{contact.name}</span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Notified
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-3 w-full max-w-sm">
          <a
            href="tel:911"
            className="btn w-full justify-center bg-white text-green-600 hover:bg-white/90"
          >
            <Phone className="w-5 h-5" />
            Call Emergency Services (911)
          </a>
          <button
            onClick={handleCancel}
            className="btn btn-outline w-full justify-center border-white text-white hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-red-500 flex flex-col items-center justify-center p-6 text-white">
      {/* Cancel Button */}
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Countdown */}
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="white"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(countdown / 5) * 352} 352`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold">{countdown}</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Sending SOS Alert</h1>
        <p className="text-white/80">
          Tap anywhere to cancel
        </p>
      </div>

      {/* Location Preview */}
      {currentLocation && (
        <div className="w-full max-w-sm bg-white/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Your Location</span>
          </div>
          <p className="text-white/80 text-sm">{currentLocation.address}</p>
        </div>
      )}

      {/* Emergency Contacts Preview */}
      <div className="w-full max-w-sm bg-white/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Will be notified:</span>
        </div>
        <div className="space-y-2">
          {emergencyContacts.slice(0, 3).map(contact => (
            <div key={contact.id} className="flex items-center justify-between text-sm">
              <span>{contact.name}</span>
              <span className="text-white/60">{contact.phone}</span>
            </div>
          ))}
          {emergencyContacts.length === 0 && (
            <p className="text-white/60 text-sm">No emergency contacts set up</p>
          )}
        </div>
      </div>

      {/* Custom Message */}
      <div className="w-full max-w-sm mb-6">
        <label className="block text-sm font-medium mb-2">
          Add a message (optional)
        </label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="I need help..."
          className="w-full bg-white/20 border border-white/30 rounded-lg p-3 text-white placeholder-white/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleSendSOS}
          disabled={isSending}
          className="btn w-full justify-center bg-white text-red-500 hover:bg-white/90"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Now
            </>
          )}
        </button>
        <button
          onClick={handleCancel}
          className="btn btn-outline w-full justify-center border-white text-white hover:bg-white/10"
        >
          Cancel
        </button>
      </div>

      {/* Emergency Call */}
      <div className="absolute bottom-6 w-full max-w-sm px-6">
        <a
          href="tel:911"
          className="flex items-center justify-center gap-2 text-sm text-white/80 hover:text-white"
        >
          <Phone className="w-4 h-4" />
          Call 911 directly
        </a>
      </div>
    </div>
  );
};

export default SOSAlert;
