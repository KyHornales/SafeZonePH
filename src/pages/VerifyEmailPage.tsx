import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Shield, RefreshCw } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      // Simulate verification process
      const timer = setTimeout(() => {
        // Simulate 90% success rate
        setStatus(Math.random() > 0.1 ? 'success' : 'error');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setStatus('resend');
    }
  }, [token]);

  const handleResendEmail = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsResending(false);
    alert('Verification email sent! Please check your inbox.');
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-deep-slate mb-2">
            Verifying Your Email
          </h1>
          <p className="text-sm sm:text-base text-deep-slate/60">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-deep-slate mb-2">
            Email Verified! 🎉
          </h1>
          <p className="text-sm sm:text-base text-deep-slate/60 mb-6">
            Your email has been successfully verified. You can now access all features of SafeZonePH.
          </p>
          <Link to="/dashboard" className="btn btn-primary w-full justify-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-deep-slate mb-2">
            Verification Failed
          </h1>
          <p className="text-sm sm:text-base text-deep-slate/60 mb-6">
            This verification link is invalid or has expired. Please request a new verification email.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleResendEmail}
              disabled={isResending}
              className="btn btn-primary w-full justify-center"
            >
              {isResending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Resend Verification Email
                </>
              )}
            </button>
            <Link to="/login" className="btn btn-outline w-full justify-center">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Resend state (no token provided)
  return (
    <div className="min-h-screen bg-warm-sand flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-6 sm:p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-xl text-deep-slate">SafeZonePH</span>
        </div>

        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="font-display text-xl sm:text-2xl font-bold text-deep-slate mb-2">
          Verify Your Email
        </h1>
        <p className="text-sm sm:text-base text-deep-slate/60 mb-6">
          {email ? (
            <>We&apos;ve sent a verification link to <strong>{email}</strong>. Please check your inbox.</>
          ) : (
            <>Please verify your email address to access all features of SafeZonePH.</>
          )}
        </p>

        <div className="bg-primary/5 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-deep-slate mb-2">Didn&apos;t receive the email?</h3>
          <ul className="text-sm text-deep-slate/60 space-y-1">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email</li>
            <li>• Wait a few minutes and try again</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleResendEmail}
            disabled={isResending}
            className="btn btn-primary w-full justify-center"
          >
            {isResending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Resend Verification Email
              </>
            )}
          </button>
          <Link to="/login" className="btn btn-outline w-full justify-center">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
