import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Try: demo@safezoneph.com / demo123');
    }
  };

  return (
    <div className="min-h-screen bg-warm-sand flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-deep-slate to-deep-slate-700 text-white p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-10 h-10 text-primary" />
            <span className="font-display font-bold text-2xl">SafeZonePH</span>
          </Link>
        </div>
        
        <div>
          <h1 className="font-display text-4xl font-bold mb-4">
            Welcome Back!
          </h1>
          <p className="text-xl text-white/70 leading-relaxed">
            Continue building stronger communities. Your buddies are waiting for you.
          </p>
        </div>

        <div className="text-white/40 text-sm">
          © 2026 SafeZonePH
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Shield className="w-10 h-10 text-primary" />
            <span className="font-display font-bold text-2xl text-deep-slate">SafeZonePH</span>
          </div>

          <div className="card p-8">
            <h2 className="font-display text-2xl font-bold text-deep-slate mb-2">
              Sign In
            </h2>
            <p className="text-deep-slate/60 mb-6">
              Enter your credentials to access your account
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-deep-slate mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-deep-slate mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-slate/40 hover:text-deep-slate"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-deep-slate/20 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-deep-slate/60">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:text-primary-dark font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full justify-center py-3"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-deep-slate/60">Don&apos;t have an account? </span>
              <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                Sign up
              </Link>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-deep-slate/80 text-center">
                <strong>Demo Account:</strong><br />
                Email: demo@safezoneph.com<br />
                Password: demo123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
