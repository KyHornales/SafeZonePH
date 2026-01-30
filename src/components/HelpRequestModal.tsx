import React, { useState } from 'react';
import { X, AlertTriangle, Shield, Users, MessageSquare, MapPin, Loader2 } from 'lucide-react';

interface HelpRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: string;
    title: string;
    description: string;
    location: string;
    urgency: string;
    responders_needed: number;
  }) => Promise<void>;
}

const HelpRequestModal: React.FC<HelpRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    description: '',
    location: '',
    urgency: 'normal',
    responders_needed: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypes = [
    { value: 'safety', label: 'Safety Concern', icon: Shield, color: 'text-primary' },
    { value: 'escort', label: 'Need Escort', icon: Users, color: 'text-blue-500' },
    { value: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-red-500' },
    { value: 'general', label: 'General Help', icon: MessageSquare, color: 'text-gray-500' },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', description: 'Can wait a few hours', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { value: 'normal', label: 'Normal', description: 'Within 1-2 hours', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'high', label: 'High', description: 'Within 30 minutes', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'critical', label: 'Critical', description: 'Immediate help needed', color: 'bg-red-100 text-red-700 border-red-300' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        type: 'general',
        title: '',
        description: '',
        location: '',
        urgency: 'normal',
        responders_needed: 1,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting help request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-deep-slate">Request Help</h2>
            <p className="text-sm text-gray-500 mt-1">Let your community know you need assistance</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Request Type */}
          <fieldset>
            <legend className="block text-sm font-semibold text-deep-slate mb-3">
              What kind of help do you need?
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {requestTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${type.color}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Title */}
          <div>
            <label htmlFor="help-title" className="block text-sm font-semibold text-deep-slate mb-2">
              Title
            </label>
            <input
              id="help-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of your situation"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="help-description" className="block text-sm font-semibold text-deep-slate mb-2">
              Description
            </label>
            <textarea
              id="help-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide more details about what help you need..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="help-location" className="block text-sm font-semibold text-deep-slate mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Your Location
            </label>
            <input
              id="help-location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Brgy. Poblacion, Sector 3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          {/* Urgency */}
          <fieldset>
            <legend className="block text-sm font-semibold text-deep-slate mb-3">
              Urgency Level
            </legend>
            <div className="space-y-2">
              {urgencyLevels.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: level.value })}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                    formData.urgency === level.value
                      ? `${level.color} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{level.label}</span>
                  <span className="text-sm opacity-75">{level.description}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Responders Needed */}
          <fieldset>
            <legend className="block text-sm font-semibold text-deep-slate mb-2">
              How many responders do you need?
            </legend>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Decrease responders"
                onClick={() => setFormData({ ...formData, responders_needed: Math.max(1, formData.responders_needed - 1) })}
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center font-bold hover:border-primary transition-colors"
              >
                -
              </button>
              <span className="text-2xl font-bold text-deep-slate w-8 text-center" aria-live="polite">
                {formData.responders_needed}
              </span>
              <button
                type="button"
                aria-label="Increase responders"
                onClick={() => setFormData({ ...formData, responders_needed: Math.min(10, formData.responders_needed + 1) })}
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center font-bold hover:border-primary transition-colors"
              >
                +
              </button>
            </div>
          </fieldset>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-burnt-orange text-white rounded-xl font-bold text-lg hover:bg-burnt-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Request...
              </>
            ) : (
              'Send Help Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HelpRequestModal;
