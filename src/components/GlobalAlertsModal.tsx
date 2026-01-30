import React, { useState, useEffect } from 'react';
import { X, Plus, AlertTriangle, Cloud, Users, Shield, Package, Loader2, Check, Bell, Eye, EyeOff } from 'lucide-react';
import apiService from '../services/api';

interface Alert {
  id: number;
  type: string;
  priority: string;
  title: string;
  message: string;
  affected_areas: string;
  created_by: string;
  is_active: boolean;
  acknowledged_count: number;
  expires_at?: string;
  created_at: string;
}

interface GlobalAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated?: () => void;
}

const GlobalAlertsModal: React.FC<GlobalAlertsModalProps> = ({ isOpen, onClose, onAlertCreated }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  
  const [newAlert, setNewAlert] = useState({
    type: 'community',
    priority: 'medium',
    title: '',
    message: '',
    affected_areas: [] as string[],
    expires_in: '24',
  });

  const alertTypes = [
    { value: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-red-500 bg-red-100' },
    { value: 'weather', label: 'Weather', icon: Cloud, color: 'text-blue-500 bg-blue-100' },
    { value: 'community', label: 'Community', icon: Users, color: 'text-green-500 bg-green-100' },
    { value: 'safety', label: 'Safety', icon: Shield, color: 'text-yellow-500 bg-yellow-100' },
    { value: 'resource', label: 'Resource', icon: Package, color: 'text-purple-500 bg-purple-100' },
  ];

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700 border-gray-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };

  const availableBarangays = [
    'Brgy. Poblacion',
    'Brgy. San Miguel',
    'Brgy. Santo Niño',
    'Brgy. Bagong Silang',
    'All Barangays',
  ];

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getGlobalAlerts();
      if (response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiService.createGlobalAlert(newAlert);
      if (response.data) {
        setAlerts([response.data, ...alerts]);
        setShowCreateForm(false);
        setNewAlert({
          type: 'community',
          priority: 'medium',
          title: '',
          message: '',
          affected_areas: [],
          expires_in: '24',
        });
        onAlertCreated?.();
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      const response = await apiService.acknowledgeAlert(alertId);
      if (response.data) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, acknowledged_count: a.acknowledged_count + 1 } : a));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleToggleStatus = async (alertId: number) => {
    try {
      const response = await apiService.toggleAlertStatus(alertId);
      if (response.data) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_active: !a.is_active } : a));
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const toggleArea = (area: string) => {
    setNewAlert(prev => ({
      ...prev,
      affected_areas: prev.affected_areas.includes(area)
        ? prev.affected_areas.filter(a => a !== area)
        : [...prev.affected_areas, area],
    }));
  };

  const getTypeInfo = (type: string) => {
    return alertTypes.find(t => t.value === type) || alertTypes[2];
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return alert.is_active;
    if (filter === 'expired') return !alert.is_active;
    return true;
  });

  const parseAffectedAreas = (areasString: string): string[] => {
    try {
      return JSON.parse(areasString);
    } catch {
      return [areasString];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-burnt-orange/10 rounded-xl">
                <Bell className="w-6 h-6 text-burnt-orange" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-deep-slate">Global Alerts</h2>
                <p className="text-sm text-gray-500">Manage community-wide notifications</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Filter Tabs & Create Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {(['all', 'active', 'expired'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-burnt-orange text-white rounded-lg font-medium hover:bg-burnt-orange/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Alert
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Create Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateAlert} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-4">
              <h3 className="font-bold text-lg text-deep-slate">Create New Alert</h3>
              
              {/* Type Selection */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">Alert Type</legend>
                <div className="flex flex-wrap gap-2">
                  {alertTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setNewAlert({ ...newAlert, type: type.value })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          newAlert.type === type.value
                            ? `${type.color} border-current`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Priority */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">Priority</legend>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'critical'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewAlert({ ...newAlert, priority: p })}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        newAlert.priority === p
                          ? priorityColors[p]
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Title */}
              <div>
                <label htmlFor="alert-title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  id="alert-title"
                  type="text"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="Alert title"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="alert-message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  id="alert-message"
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  placeholder="Detailed message for the community..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  required
                />
              </div>

              {/* Affected Areas */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">Affected Areas</legend>
                <div className="flex flex-wrap gap-2">
                  {availableBarangays.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        newAlert.affected_areas.includes(area)
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Expires In */}
              <div>
                <label htmlFor="alert-expires" className="block text-sm font-medium text-gray-700 mb-2">Expires In (hours)</label>
                <select
                  id="alert-expires"
                  value={newAlert.expires_in}
                  onChange={(e) => setNewAlert({ ...newAlert, expires_in: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                </select>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || newAlert.affected_areas.length === 0}
                  className="flex-1 py-2 bg-burnt-orange text-white rounded-lg font-medium hover:bg-burnt-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Alert'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Alerts List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No alerts found</p>
              <p className="text-sm">Create a new alert to notify your community</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map(alert => {
                const typeInfo = getTypeInfo(alert.type);
                const Icon = typeInfo.icon;
                const areas = parseAffectedAreas(alert.affected_areas);

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      alert.is_active
                        ? `${priorityColors[alert.priority]} border-current`
                        : 'bg-gray-100 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-deep-slate">{alert.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[alert.priority]}`}>
                            {alert.priority}
                          </span>
                          {!alert.is_active && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>By {alert.created_by}</span>
                          <span>•</span>
                          <span>{areas.join(', ')}</span>
                          {alert.expires_at && (
                            <>
                              <span>•</span>
                              <span>Expires: {alert.expires_at}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-current/10">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4" />
                        <span>{alert.acknowledged_count} acknowledged</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-1.5 text-sm font-medium bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleToggleStatus(alert.id)}
                          className="p-1.5 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
                          title={alert.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {alert.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalAlertsModal;
