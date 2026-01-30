import React, { useState } from 'react';

interface Alert {
  id: string;
  type: 'emergency' | 'weather' | 'community' | 'safety' | 'resource';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affectedAreas: string[];
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  acknowledgedCount: number;
}

interface GlobalAlertsProps {
  className?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'weather',
    priority: 'high',
    title: 'Typhoon Signal #2 Warning',
    message: 'Typhoon Kristine approaching. Expected landfall in 24-48 hours. Please prepare emergency supplies and secure your homes.',
    affectedAreas: ['Brgy. Poblacion', 'Brgy. San Miguel', 'Brgy. Santo Niño'],
    createdBy: 'Municipal DRRMO',
    createdAt: '2 hours ago',
    expiresAt: '48 hours',
    isActive: true,
    acknowledgedCount: 234,
  },
  {
    id: '2',
    type: 'emergency',
    priority: 'critical',
    title: 'Evacuation Notice - Zone D',
    message: 'Immediate evacuation required for Zone D residents due to rising water levels. Report to designated evacuation centers.',
    affectedAreas: ['Brgy. Bagong Silang'],
    createdBy: 'Barangay Captain',
    createdAt: '30 mins ago',
    isActive: true,
    acknowledgedCount: 45,
  },
  {
    id: '3',
    type: 'resource',
    priority: 'medium',
    title: 'Relief Goods Distribution',
    message: 'Relief goods will be distributed at the covered court tomorrow from 8AM to 5PM. Bring valid ID.',
    affectedAreas: ['All Barangays'],
    createdBy: 'LGU Relief Team',
    createdAt: '5 hours ago',
    expiresAt: '24 hours',
    isActive: true,
    acknowledgedCount: 567,
  },
];

const GlobalAlerts: React.FC<GlobalAlertsProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [newAlert, setNewAlert] = useState({
    type: 'community' as Alert['type'],
    priority: 'medium' as Alert['priority'],
    title: '',
    message: '',
    affectedAreas: [] as string[],
    expiresIn: '24',
  });

  const alertTypes = [
    { value: 'emergency', label: 'Emergency', icon: '🚨', color: 'red' },
    { value: 'weather', label: 'Weather', icon: '🌧️', color: 'blue' },
    { value: 'community', label: 'Community', icon: '👥', color: 'green' },
    { value: 'safety', label: 'Safety', icon: '🛡️', color: 'yellow' },
    { value: 'resource', label: 'Resource', icon: '📦', color: 'purple' },
  ];

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700 border-gray-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };

  const getTypeInfo = (type: Alert['type']) => {
    return alertTypes.find(t => t.value === type) || alertTypes[2];
  };

  const handleCreateAlert = () => {
    const alert: Alert = {
      id: Date.now().toString(),
      ...newAlert,
      createdBy: 'You',
      createdAt: 'Just now',
      expiresAt: `${newAlert.expiresIn} hours`,
      isActive: true,
      acknowledgedCount: 0,
    };
    setAlerts([alert, ...alerts]);
    setShowCreateModal(false);
    setNewAlert({
      type: 'community',
      priority: 'medium',
      title: '',
      message: '',
      affectedAreas: [],
      expiresIn: '24',
    });
  };

  const toggleAlertStatus = (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const availableBarangays = [
    'Brgy. Poblacion',
    'Brgy. San Miguel',
    'Brgy. Santo Niño',
    'Brgy. Bagong Silang',
    'All Barangays',
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-deep-slate flex items-center gap-2">
              <span className="text-2xl">📢</span> Global Alerts
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage community-wide alerts and notifications</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-burnt-orange text-white rounded-lg font-medium hover:bg-burnt-orange/90 transition-colors flex items-center gap-2"
          >
            <span>+</span> Create Alert
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {(['all', 'active', 'expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === status
                  ? 'bg-deep-slate text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 sm:p-6 space-y-4">
        {alerts
          .filter(a => filter === 'all' || (filter === 'active' ? a.isActive : !a.isActive))
          .map((alert) => {
            const typeInfo = getTypeInfo(alert.type);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.isActive
                    ? alert.priority === 'critical'
                      ? 'border-l-red-500 bg-red-50'
                      : alert.priority === 'high'
                      ? 'border-l-orange-500 bg-orange-50'
                      : 'border-l-primary bg-primary/5'
                    : 'border-l-gray-300 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xl">{typeInfo.icon}</span>
                      <h3 className="font-semibold text-deep-slate">{alert.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[alert.priority]}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                      {!alert.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{alert.message}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {alert.affectedAreas.map((area, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-full">
                          📍 {area}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span>👤 {alert.createdBy}</span>
                      <span>🕐 {alert.createdAt}</span>
                      {alert.expiresAt && <span>⏱️ Expires: {alert.expiresAt}</span>}
                      <span>✓ {alert.acknowledgedCount} acknowledged</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => toggleAlertStatus(alert.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        alert.isActive
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {alert.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-deep-slate">Create New Alert</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {/* Alert Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {alertTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewAlert({ ...newAlert, type: type.value as Alert['type'] })}
                      className={`p-2 rounded-lg border-2 text-center transition-colors ${
                        newAlert.type === type.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl block">{type.icon}</span>
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewAlert({ ...newAlert, priority })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        newAlert.priority === priority
                          ? priorityColors[priority]
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Title</label>
                <input
                  type="text"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="Enter alert title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  placeholder="Enter detailed message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Affected Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Affected Areas</label>
                <div className="flex flex-wrap gap-2">
                  {availableBarangays.map((brgy) => (
                    <button
                      key={brgy}
                      onClick={() => {
                        const areas = newAlert.affectedAreas.includes(brgy)
                          ? newAlert.affectedAreas.filter(a => a !== brgy)
                          : [...newAlert.affectedAreas, brgy];
                        setNewAlert({ ...newAlert, affectedAreas: areas });
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        newAlert.affectedAreas.includes(brgy)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {brgy}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expires In */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expires In</label>
                <select
                  value={newAlert.expiresIn}
                  onChange={(e) => setNewAlert({ ...newAlert, expiresIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                  <option value="">Never</option>
                </select>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={!newAlert.title || !newAlert.message || newAlert.affectedAreas.length === 0}
                className="px-4 py-2 bg-burnt-orange text-white rounded-lg font-medium hover:bg-burnt-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Broadcast Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalAlerts;
