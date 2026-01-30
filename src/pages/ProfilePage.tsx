import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Camera, Save, Shield, 
  Bell, Lock, Eye, EyeOff, Trash2, ChevronRight
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { skillOptions } from '../data/mockData';

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    barangay: user?.barangay || '',
    city: user?.city || '',
    skills: user?.skills || [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState({
    checkInReminders: true,
    taskAssignments: true,
    buddyRequests: true,
    emergencyAlerts: true,
    pointsEarned: true,
    weeklyDigest: false,
    smsNotifications: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    logout();
    alert('Account deleted. Goodbye!');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Profile Header */}
        <div className="card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl sm:text-3xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors touch-target" title="Change photo">
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-deep-slate">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm sm:text-base text-deep-slate/60">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                <span className="bg-primary/10 text-primary px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  {user?.rank}
                </span>
                <span className="bg-burnt-orange/10 text-burnt-orange px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  {user?.points} Points
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-outline w-full sm:w-auto text-sm sm:text-base"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-deep-slate/5 text-deep-slate/70 hover:bg-deep-slate/10'
              }`}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card p-4 sm:p-6">
            <h2 className="font-bold text-lg text-deep-slate mb-6">Personal Information</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-deep-slate mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-deep-slate mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
              </div>

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
                    disabled={!isEditing}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-deep-slate mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="barangay" className="block text-sm font-medium text-deep-slate mb-1">
                    Barangay
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
                    <input
                      type="text"
                      id="barangay"
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-deep-slate mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block text-sm font-medium text-deep-slate mb-3">
                  Skills &amp; Expertise
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => isEditing && handleSkillToggle(skill)}
                      disabled={!isEditing}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.skills.includes(skill)
                          ? 'bg-primary text-white'
                          : 'bg-deep-slate/5 text-deep-slate/70 hover:bg-deep-slate/10'
                      } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsEditing(false)} className="btn btn-outline flex-1 justify-center">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-primary flex-1 justify-center">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-lg text-deep-slate mb-6">Security Settings</h2>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-deep-slate/5 hover:bg-deep-slate/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-deep-slate/60" />
                    <div className="text-left">
                      <div className="font-medium text-deep-slate">Change Password</div>
                      <div className="text-sm text-deep-slate/60">Update your password regularly</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-deep-slate/40" />
                </button>

                <div className="w-full flex items-center justify-between p-4 rounded-lg bg-deep-slate/5">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-deep-slate/60" />
                    <div>
                      <div className="font-medium text-deep-slate">Two-Factor Authentication</div>
                      <div className="text-sm text-deep-slate/60">Add an extra layer of security</div>
                    </div>
                  </div>
                  <span className="text-sm text-deep-slate/40">Coming Soon</span>
                </div>
              </div>
            </div>

            <div className="card p-6 border-red-200 bg-red-50">
              <h2 className="font-bold text-lg text-red-700 mb-4">Danger Zone</h2>
              <p className="text-red-600 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card p-6">
            <h2 className="font-bold text-lg text-deep-slate mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              {[
                { key: 'checkInReminders', label: 'Check-in Reminders', description: 'Remind me to check in on my buddies' },
                { key: 'taskAssignments', label: 'Task Assignments', description: 'When a new task is assigned to me' },
                { key: 'buddyRequests', label: 'Buddy Requests', description: 'When someone wants to connect' },
                { key: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Critical community alerts', required: true },
                { key: 'pointsEarned', label: 'Points Earned', description: 'When I earn Bayanihan Points' },
                { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of community activity' },
                { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive important alerts via SMS' },
              ].map((item) => (
                <label 
                  key={item.key} 
                  className={`flex items-center justify-between p-4 rounded-lg bg-deep-slate/5 cursor-pointer ${
                    item.required ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-deep-slate/60" />
                    <div>
                      <div className="font-medium text-deep-slate">
                        {item.label}
                        {item.required && <span className="text-xs text-deep-slate/40 ml-2">(Required)</span>}
                      </div>
                      <div className="text-sm text-deep-slate/60">{item.description}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    disabled={item.required}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="w-5 h-5 rounded text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-deep-slate mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-slate/40"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-deep-slate mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-slate/40"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-deep-slate mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-slate/40"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-outline flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1 justify-center">
                Update Password
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-700">
                This action cannot be undone. All your data, including your buddies, tasks, and points will be permanently deleted.
              </p>
            </div>
            <p className="text-deep-slate/60">
              Are you sure you want to delete your account?
            </p>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="btn bg-red-500 text-white hover:bg-red-600 flex-1 justify-center">
                Delete Account
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default ProfilePage;
