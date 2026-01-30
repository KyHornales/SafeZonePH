import React, { useState } from 'react';

interface Resource {
  id: string;
  name: string;
  category: 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'equipment';
  quantity: number;
  unit: string;
  status: 'available' | 'low' | 'critical' | 'depleted';
  location: string;
  lastUpdated: string;
  expiryDate?: string;
  notes?: string;
}

interface ResourceTrackingProps {
  className?: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Rice',
    category: 'food',
    quantity: 150,
    unit: 'kg',
    status: 'available',
    location: 'Evacuation Center A',
    lastUpdated: '1 hour ago',
    expiryDate: 'Dec 2025',
  },
  {
    id: '2',
    name: 'Bottled Water',
    category: 'water',
    quantity: 50,
    unit: 'cases',
    status: 'low',
    location: 'Evacuation Center A',
    lastUpdated: '30 mins ago',
  },
  {
    id: '3',
    name: 'First Aid Kits',
    category: 'medical',
    quantity: 5,
    unit: 'kits',
    status: 'critical',
    location: 'Community Health Center',
    lastUpdated: '2 hours ago',
  },
  {
    id: '4',
    name: 'Blankets',
    category: 'shelter',
    quantity: 200,
    unit: 'pcs',
    status: 'available',
    location: 'Barangay Hall',
    lastUpdated: '4 hours ago',
  },
  {
    id: '5',
    name: 'Canned Goods',
    category: 'food',
    quantity: 0,
    unit: 'cans',
    status: 'depleted',
    location: 'Evacuation Center B',
    lastUpdated: '15 mins ago',
    expiryDate: 'Mar 2026',
  },
  {
    id: '6',
    name: 'Sleeping Mats',
    category: 'shelter',
    quantity: 85,
    unit: 'pcs',
    status: 'available',
    location: 'Evacuation Center A',
    lastUpdated: '3 hours ago',
  },
  {
    id: '7',
    name: 'Flashlights',
    category: 'equipment',
    quantity: 20,
    unit: 'pcs',
    status: 'low',
    location: 'Barangay Hall',
    lastUpdated: '5 hours ago',
  },
  {
    id: '8',
    name: 'Used Clothing',
    category: 'clothing',
    quantity: 300,
    unit: 'pcs',
    status: 'available',
    location: 'Community Center',
    lastUpdated: '1 day ago',
  },
];

const categoryConfig = {
  food: { icon: '🍚', label: 'Food', color: 'bg-green-100 text-green-700' },
  water: { icon: '💧', label: 'Water', color: 'bg-blue-100 text-blue-700' },
  medical: { icon: '🏥', label: 'Medical', color: 'bg-red-100 text-red-700' },
  shelter: { icon: '🏠', label: 'Shelter', color: 'bg-orange-100 text-orange-700' },
  clothing: { icon: '👕', label: 'Clothing', color: 'bg-purple-100 text-purple-700' },
  equipment: { icon: '🔧', label: 'Equipment', color: 'bg-gray-100 text-gray-700' },
};

const ResourceTracking: React.FC<ResourceTrackingProps> = ({ className = '' }) => {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filteredResources = resources.filter((r) => {
    const matchesCategory = !selectedCategory || r.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: Resource['status']) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Available</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Low Stock</span>;
      case 'critical':
        return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Critical</span>;
      case 'depleted':
        return <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">Depleted</span>;
    }
  };

  const getCategorySummary = () => {
    const summary: Record<string, { total: number; critical: number }> = {};
    resources.forEach((r) => {
      if (!summary[r.category]) {
        summary[r.category] = { total: 0, critical: 0 };
      }
      summary[r.category].total++;
      if (r.status === 'critical' || r.status === 'depleted') {
        summary[r.category].critical++;
      }
    });
    return summary;
  };

  const categorySummary = getCategorySummary();

  return (
    <div className={`${className}`}>
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-deep-slate flex items-center gap-2">
              <span className="text-2xl">📦</span> Community Resource Tracking
            </h2>
            <p className="text-sm text-gray-500 mt-1">Track and manage community resources and supplies</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-burnt-orange text-white rounded-lg font-medium hover:bg-burnt-orange/90 transition-colors"
            >
              📋 Request Resource
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              ➕ Add Resource
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search resources or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Category Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const summary = categorySummary[key] || { total: 0, critical: 0 };
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedCategory === key
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className="text-sm font-medium text-deep-slate">{config.label}</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{summary.total} items</span>
                  {summary.critical > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                      {summary.critical}!
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Table/Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResources.map((resource) => {
                const cat = categoryConfig[resource.category];
                return (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <div className="font-medium text-deep-slate">{resource.name}</div>
                          {resource.expiryDate && (
                            <div className="text-xs text-gray-500">Expires: {resource.expiryDate}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${cat.color}`}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${resource.quantity === 0 ? 'text-gray-400' : 'text-deep-slate'}`}>
                        {resource.quantity} {resource.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(resource.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">📍 {resource.location}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{resource.lastUpdated}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedResource(resource)}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                        >
                          Update
                        </button>
                        <button className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                          Share
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {filteredResources.map((resource) => {
            const cat = categoryConfig[resource.category];
            return (
              <div
                key={resource.id}
                className="p-4 rounded-lg border border-gray-100 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <div className="font-medium text-deep-slate">{resource.name}</div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(resource.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium ml-1">{resource.quantity} {resource.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <span className="ml-1">{resource.lastUpdated}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  📍 {resource.location}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedResource(resource)}
                    className="flex-1 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Update
                  </button>
                  <button className="flex-1 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">No resources found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-2 text-primary hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-deep-slate">Add New Resource</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Name</label>
                <input
                  type="text"
                  placeholder="e.g., Rice, Water, Medicine..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50">
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.icon} {config.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    placeholder="kg, pcs, boxes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Storage location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (if applicable)</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Resource Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-deep-slate">Request Resource</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Needed</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50">
                  <option>Select a resource...</option>
                  {resources.filter(r => r.status !== 'depleted').map((r) => (
                    <option key={r.id} value={r.id}>{r.name} - {r.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Needed</label>
                <input
                  type="number"
                  placeholder="How many do you need?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                    <button
                      key={level}
                      className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  rows={3}
                  placeholder="Why do you need this resource?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-burnt-orange text-white rounded-lg font-medium hover:bg-burnt-orange/90 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceTracking;
