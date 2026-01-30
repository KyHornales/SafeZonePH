import React, { useState } from 'react';

interface AreaStats {
  id: string;
  name: string;
  barangay: string;
  activeVolunteers: number;
  totalResidents: number;
  alertStatus: 'normal' | 'advisory' | 'warning' | 'critical';
  resourceAvailability: {
    food: number;
    water: number;
    medical: number;
    shelter: number;
  };
  recentIncidents: number;
  lastUpdated: string;
}

interface AreaOverviewProps {
  className?: string;
}

const mockAreas: AreaStats[] = [
  {
    id: '1',
    name: 'Zone A - Riverside',
    barangay: 'Brgy. San Miguel',
    activeVolunteers: 12,
    totalResidents: 458,
    alertStatus: 'normal',
    resourceAvailability: { food: 85, water: 92, medical: 78, shelter: 100 },
    recentIncidents: 0,
    lastUpdated: '2 mins ago',
  },
  {
    id: '2',
    name: 'Zone B - Lowland',
    barangay: 'Brgy. Santo Niño',
    activeVolunteers: 8,
    totalResidents: 623,
    alertStatus: 'advisory',
    resourceAvailability: { food: 65, water: 70, medical: 55, shelter: 80 },
    recentIncidents: 2,
    lastUpdated: '5 mins ago',
  },
  {
    id: '3',
    name: 'Zone C - Coastal',
    barangay: 'Brgy. Poblacion',
    activeVolunteers: 15,
    totalResidents: 892,
    alertStatus: 'warning',
    resourceAvailability: { food: 45, water: 38, medical: 60, shelter: 50 },
    recentIncidents: 5,
    lastUpdated: '1 min ago',
  },
  {
    id: '4',
    name: 'Zone D - Hillside',
    barangay: 'Brgy. Bagong Silang',
    activeVolunteers: 3,
    totalResidents: 234,
    alertStatus: 'critical',
    resourceAvailability: { food: 20, water: 15, medical: 30, shelter: 25 },
    recentIncidents: 8,
    lastUpdated: 'Just now',
  },
];

const AreaOverview: React.FC<AreaOverviewProps> = ({ className = '' }) => {
  const [selectedArea, setSelectedArea] = useState<AreaStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'normal' | 'advisory' | 'warning' | 'critical'>('all');

  const getStatusColor = (status: AreaStats['alertStatus']) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'advisory':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusBadge = (status: AreaStats['alertStatus']) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'advisory':
        return 'Advisory';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
    }
  };

  const getResourceColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredAreas = filter === 'all' 
    ? mockAreas 
    : mockAreas.filter(area => area.alertStatus === filter);

  const totalStats = {
    volunteers: mockAreas.reduce((sum, a) => sum + a.activeVolunteers, 0),
    residents: mockAreas.reduce((sum, a) => sum + a.totalResidents, 0),
    incidents: mockAreas.reduce((sum, a) => sum + a.recentIncidents, 0),
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-deep-slate">Area Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Sector and barangay breakdown</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{totalStats.volunteers}</div>
              <div className="text-xs text-gray-500">Active Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-deep-slate">{totalStats.residents.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Residents</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-burnt-orange">{totalStats.incidents}</div>
              <div className="text-xs text-gray-500">Incidents</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(['all', 'normal', 'advisory', 'warning', 'critical'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Areas' : getStatusBadge(status)}
              <span className="ml-1 opacity-70">
                ({status === 'all' ? mockAreas.length : mockAreas.filter(a => a.alertStatus === status).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Area Cards */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAreas.map((area) => (
            <div
              key={area.id}
              onClick={() => setSelectedArea(selectedArea?.id === area.id ? null : area)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedArea?.id === area.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-deep-slate">{area.name}</h3>
                  <p className="text-sm text-gray-500">{area.barangay}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(area.alertStatus)}`}>
                  {getStatusBadge(area.alertStatus)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-primary">{area.activeVolunteers}</div>
                  <div className="text-xs text-gray-500">Volunteers</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-deep-slate">{area.totalResidents}</div>
                  <div className="text-xs text-gray-500">Residents</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-burnt-orange">{area.recentIncidents}</div>
                  <div className="text-xs text-gray-500">Incidents</div>
                </div>
              </div>

              {/* Expanded View */}
              {selectedArea?.id === area.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Resource Availability</h4>
                  <div className="space-y-2">
                    {Object.entries(area.resourceAvailability).map(([resource, value]) => (
                      <div key={resource} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-16 capitalize">{resource}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getResourceColor(value)} transition-all`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-8">{value}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Updated {area.lastUpdated}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AreaOverview;
