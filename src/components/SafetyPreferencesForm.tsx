import React, { useState } from 'react';
import { 
  Sliders, 
  Shield, 
  Eye, 
  Bell, 
  Users, 
  MapPin,
  Check,
  AlertTriangle
} from 'lucide-react';

interface SafetyPreferences {
  shareLocation: boolean;
  showOnBuddyList: boolean;
  emergencyAlerts: boolean;
  communityAlerts: boolean;
  nightModeReminders: boolean;
  checkInReminders: boolean;
  buddyGender: 'any' | 'same' | 'female' | 'male';
  maxBuddyDistance: number;
  requireVerifiedBuddies: boolean;
  allowUnknownRequests: boolean;
}

interface SafetyPreferencesFormProps {
  preferences: SafetyPreferences;
  onChange: (preferences: SafetyPreferences) => void;
  className?: string;
}

const SafetyPreferencesForm: React.FC<SafetyPreferencesFormProps> = ({
  preferences,
  onChange,
  className = '',
}) => {
  const updatePreference = <K extends keyof SafetyPreferences>(
    key: K,
    value: SafetyPreferences[K]
  ) => {
    onChange({ ...preferences, [key]: value });
  };

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onToggle: () => void;
    label: string;
    description?: string;
    icon?: React.ReactNode;
  }> = ({ enabled, onToggle, label, description, icon }) => (
    <div className="flex items-start justify-between py-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <p className="font-medium text-deep-slate">{label}</p>
          {description && (
            <p className="text-sm text-deep-slate/60 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
          enabled ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-deep-slate">Safety Preferences</h3>
      </div>

      {/* Privacy Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-deep-slate/60 uppercase tracking-wide mb-3">
          Privacy & Visibility
        </h4>
        <div className="card divide-y divide-gray-100">
          <div className="px-4">
            <ToggleSwitch
              enabled={preferences.shareLocation}
              onToggle={() => updatePreference('shareLocation', !preferences.shareLocation)}
              label="Share Location"
              description="Allow buddies to see your location during active sessions"
              icon={<MapPin className="w-5 h-5 text-primary" />}
            />
          </div>
          <div className="px-4">
            <ToggleSwitch
              enabled={preferences.showOnBuddyList}
              onToggle={() => updatePreference('showOnBuddyList', !preferences.showOnBuddyList)}
              label="Appear in Buddy Search"
              description="Let others find and request you as a buddy"
              icon={<Eye className="w-5 h-5 text-primary" />}
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-deep-slate/60 uppercase tracking-wide mb-3">
          Notifications
        </h4>
        <div className="card divide-y divide-gray-100">
          <div className="px-4">
            <ToggleSwitch
              enabled={preferences.emergencyAlerts}
              onToggle={() => updatePreference('emergencyAlerts', !preferences.emergencyAlerts)}
              label="Emergency Alerts"
              description="Receive SOS alerts from your connections"
              icon={<AlertTriangle className="w-5 h-5 text-burnt-orange" />}
            />
          </div>
          <div className="px-4">
            <ToggleSwitch
              enabled={preferences.communityAlerts}
              onToggle={() => updatePreference('communityAlerts', !preferences.communityAlerts)}
              label="Community Alerts"
              description="Get notified about safety reports in your area"
              icon={<Bell className="w-5 h-5 text-primary" />}
            />
          </div>
          <div className="px-4">
            <ToggleSwitch
              enabled={preferences.nightModeReminders}
              onToggle={() => updatePreference('nightModeReminders', !preferences.nightModeReminders)}
              label="Night Safety Reminders"
              description="Receive check-in prompts after 8 PM"
            />
          </div>
          <div className="px-4">
            <ToggleSwitch
              enabled={preferences.checkInReminders}
              onToggle={() => updatePreference('checkInReminders', !preferences.checkInReminders)}
              label="Check-in Reminders"
              description="Get reminded to check in during buddy sessions"
            />
          </div>
        </div>
      </div>

      {/* Buddy Preferences Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-deep-slate/60 uppercase tracking-wide mb-3">
          Buddy Preferences
        </h4>
        <div className="card p-4 space-y-4">
          {/* Gender Preference */}
          <div>
            <label className="block text-sm font-medium text-deep-slate mb-2">
              Preferred Buddy Gender
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'any', label: 'Any' },
                { value: 'same', label: 'Same as me' },
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreference('buddyGender', option.value as SafetyPreferences['buddyGender'])}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preferences.buddyGender === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Distance */}
          <div>
            <label className="block text-sm font-medium text-deep-slate mb-2">
              Maximum Buddy Distance: {preferences.maxBuddyDistance} km
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={preferences.maxBuddyDistance}
              onChange={(e) => updatePreference('maxBuddyDistance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-deep-slate/50 mt-1">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Verified Only */}
          <ToggleSwitch
            enabled={preferences.requireVerifiedBuddies}
            onToggle={() => updatePreference('requireVerifiedBuddies', !preferences.requireVerifiedBuddies)}
            label="Verified Buddies Only"
            description="Only show buddies with verified ID"
            icon={<Shield className="w-5 h-5 text-primary" />}
          />

          {/* Allow Unknown Requests */}
          <ToggleSwitch
            enabled={preferences.allowUnknownRequests}
            onToggle={() => updatePreference('allowUnknownRequests', !preferences.allowUnknownRequests)}
            label="Allow Requests from New Users"
            description="Receive buddy requests from users you haven't connected with"
            icon={<Users className="w-5 h-5 text-primary" />}
          />
        </div>
      </div>

      {/* Save Note */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-deep-slate/60">
          Your preferences are automatically saved. You can change them anytime from your profile settings.
        </p>
      </div>
    </div>
  );
};

export default SafetyPreferencesForm;
