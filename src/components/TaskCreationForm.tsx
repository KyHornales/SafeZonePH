import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TaskFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  maxBuddies: number;
  urgency: 'low' | 'normal' | 'high';
  notes: string;
}

interface TaskCreationFormProps {
  onSubmit: (task: TaskFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const CATEGORIES = [
  { value: 'errand', label: 'Errand / Shopping', icon: '🛒' },
  { value: 'walk', label: 'Walking Companion', icon: '🚶' },
  { value: 'transport', label: 'Transportation', icon: '🚗' },
  { value: 'appointment', label: 'Medical / Appointment', icon: '🏥' },
  { value: 'night', label: 'Night Safety', icon: '🌙' },
  { value: 'event', label: 'Event / Gathering', icon: '🎉' },
  { value: 'other', label: 'Other', icon: '📌' },
];

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    maxBuddies: 1,
    urgency: 'normal',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className={`card p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-deep-slate">Create Task</h2>
        <button type="button" onClick={onCancel} className="p-1 text-deep-slate/60 hover:text-deep-slate">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-deep-slate mb-1.5">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className={`input-field ${errors.title ? 'border-red-500' : ''}`}
            placeholder="e.g., Walk to grocery store"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-deep-slate mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => updateField('category', cat.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  formData.category === cat.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-deep-slate mb-1.5">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="input-field min-h-[80px]"
            placeholder="Describe what you need help with..."
            rows={3}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-deep-slate mb-1.5">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              className={`input-field pl-10 ${errors.location ? 'border-red-500' : ''}`}
              placeholder="Where do you need a buddy?"
            />
          </div>
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-deep-slate mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                min={today}
                className={`input-field pl-10 ${errors.date ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-deep-slate mb-1.5">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
                className={`input-field pl-10 ${errors.startTime ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-deep-slate mb-1.5">
              End Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAdvanced ? 'Hide' : 'Show'} advanced options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            {/* Max Buddies */}
            <div>
              <label className="block text-sm font-medium text-deep-slate mb-1.5">
                Number of Buddies Needed
              </label>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-deep-slate/40" />
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateField('maxBuddies', Math.max(1, formData.maxBuddies - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{formData.maxBuddies}</span>
                  <button
                    type="button"
                    onClick={() => updateField('maxBuddies', Math.min(5, formData.maxBuddies + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-deep-slate mb-1.5">
                Urgency Level
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
                  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
                  { value: 'high', label: 'Urgent', color: 'bg-red-100 text-red-700' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('urgency', option.value as TaskFormData['urgency'])}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.urgency === option.value
                        ? option.color + ' ring-2 ring-offset-1'
                        : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
                    }`}
                  >
                    {option.value === 'high' && <AlertTriangle className="w-4 h-4" />}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-deep-slate mb-1.5">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="input-field min-h-[60px]"
                placeholder="Any specific requirements or instructions..."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex-1 justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Task
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskCreationForm;
