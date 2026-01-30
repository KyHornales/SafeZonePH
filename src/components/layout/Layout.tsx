import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Home, Users, ClipboardList, BookOpen, Award, User, Bell, Menu, X, LogOut, Shield, MessageCircle, Map, Lightbulb 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/buddies', label: 'Buddies', icon: Users },
    { path: '/chat', label: 'Messages', icon: MessageCircle },
    { path: '/community-hub', label: 'Community', icon: Map },
    { path: '/tasks', label: 'Tasks', icon: ClipboardList },
    { path: '/skill-sharing', label: 'Skills', icon: Lightbulb },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/points', label: 'Points', icon: Award },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-warm-sand">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-deep-slate text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-xl">SafeZonePH</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-white/70 hover:text-white transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-burnt-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                className="hidden md:flex p-2 text-white/70 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white/70 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-deep-slate-600 border-t border-white/10">
            <nav className="px-4 py-4 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer - Hidden on mobile (bottom nav instead) */}
      <footer className="hidden md:block bg-deep-slate text-white/60 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-sm">
            © 2026 SafeZonePH. Building resilient communities together.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bottom-nav">
        <div className="flex items-center justify-around">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item flex-1 ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          <Link
            to="/profile"
            className={`bottom-nav-item flex-1 ${isActive('/profile') ? 'active' : ''}`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
