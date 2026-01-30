import React, { useState } from 'react';
import { 
  X, Heart, Droplets, Flame, Package, MapPin, AlertTriangle 
} from 'lucide-react';

interface SOSEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: SOSData) => void;
}

interface SOSData {
  emergencyType: string;
  location: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
}

const emergencyTypes = [
  { id: 'medical', label: 'Medical', icon: Heart, color: 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100' },
  { id: 'flood', label: 'Flood/Rescue', icon: Droplets, color: 'text-blue-500 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-orange-500 bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { id: 'supply', label: 'Supply Shortage', icon: Package, color: 'text-purple-500 bg-purple-50 border-purple-200 hover:bg-purple-100' },
];

const SOSEmergencyModal: React.FC<SOSEmergencyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'low'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !location) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit?.({
      emergencyType: selectedType,
      location,
      description,
      urgency,
    });

    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setSelectedType('');
    setLocation('');
    setDescription('');
    setUrgency('high');
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-deep-slate/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-warm-sand w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {showSuccess ? (
          /* Success State */
          <>
            <div className="bg-burnt-orange py-4 px-6">
              <h2 className="text-white text-center font-bold tracking-wider text-base sm:text-lg uppercase">
                Emergency Request
              </h2>
            </div>
            <div className="p-8 sm:p-12 flex flex-col items-center text-center space-y-6 sm:space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-deep-slate">Emergency Request Dispatched</h3>
                <p className="text-base sm:text-lg text-deep-slate/70 leading-relaxed max-w-md mx-auto">
                  Your request has been broadcast to local response teams and nearby buddies. Help is on the way.
                </p>
              </div>
              <div className="flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/50 rounded-full border border-primary/30">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">Responders Notified</span>
              </div>
            </div>
            <div className="px-8 sm:px-12 pb-8 sm:pb-12">
              <button 
                onClick={handleClose}
                className="w-full btn-primary py-4 sm:py-5 font-bold text-sm sm:text-base tracking-wider uppercase"
              >
                Understood
              </button>
            </div>
          </>
        ) : (
          /* Form State */
          <>
            <div className="bg-burnt-orange py-4 px-6 flex items-center justify-between">
              <h2 className="text-white font-bold tracking-wider text-base sm:text-lg uppercase">
                SOS Emergency Request
              </h2>
              <button 
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Emergency Type Selection */}
              <fieldset className="space-y-3">
                <legend className="block text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider">
                  Emergency Type
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:gap-3" role="group" aria-label="Select emergency type">
                  {emergencyTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        aria-pressed={selectedType === type.id}
                        className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          selectedType === type.id 
                            ? `${type.color} border-current ring-2 ring-offset-2 ring-current`
                            : 'bg-white border-deep-slate/10 hover:border-deep-slate/20'
                        }`}
                      >
                        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${selectedType === type.id ? '' : 'text-deep-slate/60'}`} />
                        <span className={`text-xs sm:text-sm font-bold ${selectedType === type.id ? '' : 'text-deep-slate'}`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Location */}
              <div className="space-y-3">
                <label htmlFor="sos-location" className="block text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider">
                  Location Details
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
                  <input
                    id="sos-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your current location..."
                    className="w-full input-field pl-12 py-3 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label htmlFor="sos-description" className="block text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider">
                  Describe the Situation
                </label>
                <textarea
                  id="sos-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional details about the emergency..."
                  className="w-full input-field py-3 text-sm sm:text-base resize-none"
                  rows={3}
                />
              </div>

              {/* Urgency Level */}
              <fieldset className="space-y-3">
                <legend className="block text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider">
                  Urgency Level
                </legend>
                <div className="flex gap-2 sm:gap-3" role="group" aria-label="Select urgency level">
                  {(['high', 'medium', 'low'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      aria-pressed={urgency === level}
                      className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${
                        urgency === level
                          ? level === 'high' 
                            ? 'bg-red-500 text-white ring-2 ring-offset-2 ring-red-500'
                            : level === 'medium'
                            ? 'bg-yellow-500 text-deep-slate ring-2 ring-offset-2 ring-yellow-500'
                            : 'bg-green-500 text-white ring-2 ring-offset-2 ring-green-500'
                          : 'bg-white border-2 border-deep-slate/10 text-deep-slate/60 hover:border-deep-slate/20'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedType || !location || isSubmitting}
                className="w-full btn-primary py-4 sm:py-5 font-bold text-sm sm:text-base tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    Send SOS Request
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SOSEmergencyModal;
