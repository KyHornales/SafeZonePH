import React, { useState, useEffect } from 'react';

interface EmergencyDashboardProps {
  className?: string;
}

interface Incident {
  id: string;
  type: 'flood' | 'fire' | 'earthquake' | 'typhoon' | 'accident' | 'medical';
  title: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'responding' | 'contained' | 'resolved';
  reportedAt: string;
  respondersAssigned: number;
  affectedResidents: number;
}

interface AlertStatus {
  level: 'normal' | 'advisory' | 'warning' | 'critical';
  message: string;
  issuedAt: string;
  expiresIn?: string;
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    type: 'flood',
    title: 'Flash Flooding - Riverside Area',
    location: 'Brgy. San Miguel, Zone C',
    severity: 'high',
    status: 'active',
    reportedAt: '15 mins ago',
    respondersAssigned: 5,
    affectedResidents: 45,
  },
  {
    id: '2',
    type: 'medical',
    title: 'Medical Emergency - Elderly Resident',
    location: 'Brgy. Poblacion, Block 7',
    severity: 'medium',
    status: 'responding',
    reportedAt: '32 mins ago',
    respondersAssigned: 2,
    affectedResidents: 1,
  },
  {
    id: '3',
    type: 'fire',
    title: 'Kitchen Fire - Residential',
    location: 'Brgy. Santo Niño, Sitio Bagong Buhay',
    severity: 'high',
    status: 'contained',
    reportedAt: '1 hour ago',
    respondersAssigned: 8,
    affectedResidents: 12,
  },
];

const incidentTypes = {
  flood: { icon: '🌊', label: 'Flood', color: 'bg-blue-500' },
  fire: { icon: '🔥', label: 'Fire', color: 'bg-red-500' },
  earthquake: { icon: '🌍', label: 'Earthquake', color: 'bg-orange-500' },
  typhoon: { icon: '🌀', label: 'Typhoon', color: 'bg-purple-500' },
  accident: { icon: '⚠️', label: 'Accident', color: 'bg-yellow-500' },
  medical: { icon: '🏥', label: 'Medical', color: 'bg-green-500' },
};

const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({ className = '' }) => {
  const [alertStatus, setAlertStatus] = useState<AlertStatus>({
    level: 'warning',
    message: 'Typhoon Signal #2 in effect. Stay alert and monitor official announcements.',
    issuedAt: '2 hours ago',
    expiresIn: '24 hours',
  });
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);

  // Simulated live update counter
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (liveUpdatesEnabled) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [liveUpdatesEnabled]);

  const getAlertLevelStyle = (level: AlertStatus['level']) => {
    switch (level) {
      case 'normal':
        return 'bg-green-500 text-white';
      case 'advisory':
        return 'bg-blue-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'critical':
        return 'bg-red-500 text-white animate-pulse';
    }
  };

  const getSeverityBadge = (severity: Incident['severity']) => {
    switch (severity) {
      case 'low':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Low</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Medium</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">High</span>;
      case 'critical':
        return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full animate-pulse">Critical</span>;
    }
  };

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Active</span>;
      case 'responding':
        return <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">Responding</span>;
      case 'contained':
        return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Contained</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Resolved</span>;
    }
  };

  const stats = {
    activeIncidents: incidents.filter(i => i.status === 'active' || i.status === 'responding').length,
    volunteersDeployed: incidents.reduce((sum, i) => sum + i.respondersAssigned, 0),
    residentsAffected: incidents.reduce((sum, i) => sum + i.affectedResidents, 0),
  };

  return (
    <div className={`${className}`}>
      {/* Alert Banner */}
      <div className={`${getAlertLevelStyle(alertStatus.level)} rounded-xl p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {alertStatus.level === 'critical' ? '🚨' : alertStatus.level === 'warning' ? '⚠️' : '📢'}
            </span>
            <div>
              <div className="font-bold uppercase text-sm">
                {alertStatus.level} Alert
              </div>
              <p className="text-sm opacity-90">{alertStatus.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-80">
            <span>Issued: {alertStatus.issuedAt}</span>
            {alertStatus.expiresIn && <span>Expires in: {alertStatus.expiresIn}</span>}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Incidents</p>
              <p className="text-3xl font-bold text-red-600">{stats.activeIncidents}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔴</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Volunteers Deployed</p>
              <p className="text-3xl font-bold text-primary">{stats.volunteersDeployed}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Residents Affected</p>
              <p className="text-3xl font-bold text-burnt-orange">{stats.residentsAffected}</p>
            </div>
            <div className="w-12 h-12 bg-burnt-orange/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Incidents */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-deep-slate flex items-center gap-2">
                <span className="text-xl">🚨</span> Active Incidents
              </h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${liveUpdatesEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                  <span className="text-gray-500">Live</span>
                  <button
                    onClick={() => setLiveUpdatesEnabled(!liveUpdatesEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors ${liveUpdatesEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${liveUpdatesEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                  </button>
                </label>
                <button className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors">
                  + Report Incident
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-3">
            {incidents.map((incident) => {
              const typeInfo = incidentTypes[incident.type];
              return (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                    incident.status === 'active'
                      ? 'border-l-red-500 bg-red-50'
                      : incident.status === 'responding'
                      ? 'border-l-blue-500 bg-blue-50'
                      : 'border-l-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 ${typeInfo.color} text-white rounded-lg flex items-center justify-center text-xl`}>
                        {typeInfo.icon}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-deep-slate">{incident.title}</h3>
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                        </div>
                        <p className="text-sm text-gray-600">📍 {incident.location}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>🕐 {incident.reportedAt}</span>
                          <span>👥 {incident.respondersAssigned} responders</span>
                          <span>🏠 {incident.affectedResidents} affected</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                        Details
                      </button>
                      {incident.status === 'active' && (
                        <button className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                          Respond
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Communication Center */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="font-semibold text-deep-slate mb-4 flex items-center gap-2">
              <span>📡</span> Communication Center
            </h3>
            <div className="space-y-3">
              <button className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                <span>🚨</span> Send Emergency Broadcast
              </button>
              <button className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <span>📢</span> Post Community Update
              </button>
              <button className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <span>💬</span> Contact Responders
              </button>
            </div>
          </div>

          {/* Volunteer Availability */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="font-semibold text-deep-slate mb-4 flex items-center gap-2">
              <span>👥</span> Volunteer Availability
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm">Available Now</span>
                <span className="font-bold text-green-700">24</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm">On Active Task</span>
                <span className="font-bold text-blue-700">15</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Off Duty</span>
                <span className="font-bold text-gray-600">8</span>
              </div>
            </div>
            <button className="w-full mt-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors">
              View All Volunteers →
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="font-semibold text-deep-slate mb-4 flex items-center gap-2">
              <span>⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <span className="text-xl block mb-1">🗺️</span>
                <span className="text-xs">View Map</span>
              </button>
              <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <span className="text-xl block mb-1">📊</span>
                <span className="text-xs">Reports</span>
              </button>
              <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <span className="text-xl block mb-1">📋</span>
                <span className="text-xs">Resources</span>
              </button>
              <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <span className="text-xl block mb-1">⚙️</span>
                <span className="text-xs">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Last Update Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
        {liveUpdatesEnabled && <span className="ml-2">• Auto-refreshing every 30s</span>}
      </div>
    </div>
  );
};

export default EmergencyDashboard;
