import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  X, 
  FileText,
  Clock,
  Lock
} from 'lucide-react';

interface IDVerificationProps {
  status: 'none' | 'pending' | 'verified' | 'rejected';
  onUpload: (frontImage: string, backImage?: string) => void;
  idType?: string;
  className?: string;
}

const ID_TYPES = [
  { value: 'national_id', label: 'Philippine National ID' },
  { value: 'passport', label: 'Philippine Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'voters_id', label: "Voter's ID" },
  { value: 'philhealth', label: 'PhilHealth ID' },
  { value: 'sss', label: 'SSS ID' },
  { value: 'postal', label: 'Postal ID' },
  { value: 'prc', label: 'PRC ID' },
];

const IDVerification: React.FC<IDVerificationProps> = ({
  status,
  onUpload,
  idType = '',
  className = '',
}) => {
  const [step, setStep] = useState<'select' | 'upload' | 'review' | 'done'>(
    status === 'none' ? 'select' : 'done'
  );
  const [selectedIdType, setSelectedIdType] = useState(idType);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (side === 'front') {
        setFrontImage(result);
      } else {
        setBackImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!frontImage) return;

    setIsUploading(true);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));

    onUpload(frontImage, backImage || undefined);
    setStep('done');
    setIsUploading(false);
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Pending Review</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Status View
  if (step === 'done' || status !== 'none') {
    return (
      <div className={`card p-4 sm:p-6 ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              status === 'verified' ? 'bg-green-100' :
              status === 'pending' ? 'bg-yellow-100' :
              status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Shield className={`w-6 h-6 ${
                status === 'verified' ? 'text-green-600' :
                status === 'pending' ? 'text-yellow-600' :
                status === 'rejected' ? 'text-red-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-deep-slate">ID Verification</h3>
              <p className="text-sm text-deep-slate/60">
                {ID_TYPES.find(t => t.value === selectedIdType)?.label || 'Government ID'}
              </p>
            </div>
          </div>
          {renderStatusBadge()}
        </div>

        {status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm">
            <p className="text-yellow-800">
              Your ID is being reviewed. This usually takes 1-2 business days.
              We'll notify you once the verification is complete.
            </p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm">
            <p className="text-red-800 mb-3">
              Your ID verification was rejected. Please ensure your document is clear and valid.
            </p>
            <button
              onClick={() => {
                setStep('select');
                setFrontImage(null);
                setBackImage(null);
              }}
              className="btn btn-primary btn-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'verified' && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm flex items-start gap-3">
            <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">
              Your identity has been verified. You now have access to all buddy features
              and enhanced trust status in the community.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Select ID Type
  if (step === 'select') {
    return (
      <div className={`card p-4 sm:p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-deep-slate">Verify Your Identity</h3>
            <p className="text-sm text-deep-slate/60">
              Become a trusted member of SafeZonePH
            </p>
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-deep-slate mb-2">Why verify?</h4>
          <ul className="text-sm text-deep-slate/60 space-y-1">
            <li>✓ Get the verified badge on your profile</li>
            <li>✓ Build trust with other community members</li>
            <li>✓ Unlock all buddy and help features</li>
          </ul>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-deep-slate mb-2">
            Select ID Type
          </label>
          <select
            value={selectedIdType}
            onChange={(e) => setSelectedIdType(e.target.value)}
            className="input-field"
          >
            <option value="">Choose your ID type</option>
            {ID_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setStep('upload')}
          disabled={!selectedIdType}
          className="btn btn-primary w-full justify-center"
        >
          Continue
        </button>
      </div>
    );
  }

  // Upload Step
  if (step === 'upload') {
    return (
      <div className={`card p-4 sm:p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-deep-slate">Upload Your ID</h3>
          <button
            onClick={() => setStep('select')}
            className="text-deep-slate/60 hover:text-deep-slate"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-deep-slate/60 mb-6">
          Take clear photos of your {ID_TYPES.find(t => t.value === selectedIdType)?.label}
        </p>

        {/* Front Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-deep-slate mb-2">
            Front of ID <span className="text-red-500">*</span>
          </label>
          {frontImage ? (
            <div className="relative rounded-lg overflow-hidden border-2 border-primary">
              <img src={frontImage} alt="ID Front" className="w-full h-48 object-cover" />
              <button
                onClick={() => {
                  setFrontImage(null);
                  if (frontInputRef.current) frontInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => frontInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="w-8 h-8 text-deep-slate/40 mx-auto mb-2" />
              <p className="text-sm text-deep-slate/60">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-deep-slate/40 mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
          )}
          <input
            ref={frontInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'front')}
            className="hidden"
          />
        </div>

        {/* Back Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-deep-slate mb-2">
            Back of ID (optional)
          </label>
          {backImage ? (
            <div className="relative rounded-lg overflow-hidden border-2 border-primary">
              <img src={backImage} alt="ID Back" className="w-full h-48 object-cover" />
              <button
                onClick={() => {
                  setBackImage(null);
                  if (backInputRef.current) backInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => backInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Camera className="w-6 h-6 text-deep-slate/40 mx-auto mb-2" />
              <p className="text-sm text-deep-slate/60">
                Upload back of ID
              </p>
            </div>
          )}
          <input
            ref={backInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'back')}
            className="hidden"
          />
        </div>

        {/* Privacy Note */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-deep-slate/40 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-deep-slate/60">
            Your ID will be encrypted and securely stored. It will only be used for
            verification purposes and will not be shared with other users.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('select')}
            className="btn btn-outline flex-1 justify-center"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!frontImage || isUploading}
            className="btn btn-primary flex-1 justify-center"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Submit for Verification'
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default IDVerification;
