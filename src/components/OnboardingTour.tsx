import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  MapPin, 
  Bell, 
  CheckCircle,
  ChevronRight,
  X
} from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  userName?: string;
}

interface TourStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onComplete,
  onSkip,
  userName = 'there',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: `Welcome to SafeZonePH, ${userName}!`,
      description: "We're here to help you stay safe and connected with your community. Let's take a quick tour of the key features.",
    },
    {
      id: 'buddies',
      icon: <Users className="w-12 h-12 text-primary" />,
      title: 'Find Your Safety Buddies',
      description: 'Connect with trusted community members who can accompany you during errands, walks, or any time you need extra safety.',
      action: {
        label: 'Browse Buddies',
      },
    },
    {
      id: 'locations',
      icon: <MapPin className="w-12 h-12 text-primary" />,
      title: 'Know Your Safe Zones',
      description: 'View community-reported safe areas and risk zones in your neighborhood. Share information to help keep everyone safe.',
      action: {
        label: 'View Map',
      },
    },
    {
      id: 'alerts',
      icon: <Bell className="w-12 h-12 text-primary" />,
      title: 'Stay Informed',
      description: 'Get real-time alerts about safety concerns in your area. One-tap SOS sends your location to emergency contacts instantly.',
      action: {
        label: 'Set Up Alerts',
      },
    },
    {
      id: 'complete',
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      title: "You're All Set!",
      description: "You're ready to start using SafeZonePH. Remember, safety is a community effort. Welcome to the family! 💚",
      action: {
        label: 'Get Started',
        onClick: onComplete,
      },
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goToNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card max-w-lg w-full max-h-[90vh] overflow-hidden relative">
        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-deep-slate/60 hover:text-deep-slate z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className={`p-6 sm:p-8 transition-opacity duration-200 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}>
          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                    ? 'bg-primary/40' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              {currentStepData.icon}
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-deep-slate mb-3">
              {currentStepData.title}
            </h2>
            <p className="text-sm sm:text-base text-deep-slate/60 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Action Button */}
          {currentStepData.action && (
            <button
              onClick={currentStepData.action.onClick || goToNext}
              className="btn btn-primary w-full justify-center mb-4"
            >
              {currentStepData.action.label}
              {!isLastStep && <ChevronRight className="w-5 h-5 ml-1" />}
            </button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrev}
              disabled={currentStep === 0}
              className={`text-sm font-medium transition-opacity ${
                currentStep === 0 
                  ? 'opacity-0 pointer-events-none' 
                  : 'text-deep-slate/60 hover:text-deep-slate'
              }`}
            >
              Back
            </button>

            {!currentStepData.action && (
              <button
                onClick={goToNext}
                className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
              >
                {isLastStep ? 'Finish' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onSkip}
              className="text-sm text-deep-slate/40 hover:text-deep-slate/60"
            >
              Skip tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
