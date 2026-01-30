import React, { useState } from 'react';

interface Volunteer {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  isAvailable: boolean;
  currentTask: string | null;
  completedTasks: number;
  rating: number;
  responseTime: string;
  distance: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  lastActive: string;
}

interface VolunteerManagementProps {
  className?: string;
}

const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'Maria Santos',
    avatar: '👩‍⚕️',
    skills: ['First Aid', 'Medical Support', 'Elderly Care'],
    isAvailable: true,
    currentTask: null,
    completedTasks: 45,
    rating: 4.9,
    responseTime: '~5 mins',
    distance: '0.8 km',
    verificationStatus: 'verified',
    lastActive: '2 mins ago',
  },
  {
    id: '2',
    name: 'Juan Dela Cruz',
    avatar: '👨‍🔧',
    skills: ['Technical Repairs', 'Logistics', 'Search & Rescue'],
    isAvailable: true,
    currentTask: null,
    completedTasks: 32,
    rating: 4.7,
    responseTime: '~10 mins',
    distance: '1.2 km',
    verificationStatus: 'verified',
    lastActive: '5 mins ago',
  },
  {
    id: '3',
    name: 'Ana Reyes',
    avatar: '👩‍🍳',
    skills: ['Food Preparation', 'Emotional Support'],
    isAvailable: false,
    currentTask: 'Relief Distribution - Zone A',
    completedTasks: 28,
    rating: 4.8,
    responseTime: '~8 mins',
    distance: '0.5 km',
    verificationStatus: 'verified',
    lastActive: 'Now',
  },
  {
    id: '4',
    name: 'Pedro Garcia',
    avatar: '👨',
    skills: ['Logistics', 'Translation'],
    isAvailable: true,
    currentTask: null,
    completedTasks: 12,
    rating: 4.5,
    responseTime: '~15 mins',
    distance: '2.3 km',
    verificationStatus: 'pending',
    lastActive: '1 hour ago',
  },
];

const allSkills = [
  'First Aid',
  'Medical Support',
  'Elderly Care',
  'Technical Repairs',
  'Logistics',
  'Search & Rescue',
  'Food Preparation',
  'Emotional Support',
  'Translation',
];

const VolunteerManagement: React.FC<VolunteerManagementProps> = ({ className = '' }) => {
  const [volunteers] = useState<Volunteer[]>(mockVolunteers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'busy'>('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some(skill => v.skills.includes(skill));
    const matchesAvailability = availabilityFilter === 'all' ||
      (availabilityFilter === 'available' ? v.isAvailable : !v.isAvailable);
    return matchesSearch && matchesSkills && matchesAvailability;
  });

  const getVerificationBadge = (status: Volunteer['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">✓ Verified</span>;
      case 'pending':
        return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">⏳ Pending</span>;
      case 'unverified':
        return <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">Unverified</span>;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-deep-slate flex items-center gap-2">
              <span className="text-2xl">👥</span> Volunteer Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage and assign tasks to volunteers</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {volunteers.filter(v => v.isAvailable).length} Available
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {volunteers.filter(v => !v.isAvailable).length} On Task
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Search volunteers by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Availability Filter */}
            <div className="flex gap-2">
              {(['all', 'available', 'busy'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setAvailabilityFilter(status)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    availabilityFilter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'available' ? 'Available' : 'On Task'}
                </button>
              ))}
            </div>

            {/* Skill Filters */}
            <div className="flex-1 flex flex-wrap gap-2">
              {allSkills.slice(0, 5).map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    setSelectedSkills(
                      selectedSkills.includes(skill)
                        ? selectedSkills.filter(s => s !== skill)
                        : [...selectedSkills, skill]
                    );
                  }}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-burnt-orange text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVolunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              onClick={() => setSelectedVolunteer(volunteer)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedVolunteer?.id === volunteer.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-warm-sand rounded-full flex items-center justify-center text-2xl">
                  {volunteer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-deep-slate truncate">{volunteer.name}</h3>
                    {volunteer.isAvailable ? (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    ) : (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="mt-1">{getVerificationBadge(volunteer.verificationStatus)}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {volunteer.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {volunteer.skills.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{volunteer.skills.length - 3}
                  </span>
                )}
              </div>

              {volunteer.currentTask && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Current Task:</span> {volunteer.currentTask}
                  </p>
                </div>
              )}

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-sm font-bold text-deep-slate">{volunteer.completedTasks}</div>
                  <div className="text-xs text-gray-500">Tasks</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-sm font-bold text-burnt-orange">⭐ {volunteer.rating}</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-sm font-bold text-primary">{volunteer.distance}</div>
                  <div className="text-xs text-gray-500">Away</div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVolunteer(volunteer);
                    setShowAssignModal(true);
                  }}
                  disabled={!volunteer.isAvailable}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    volunteer.isAvailable
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {volunteer.isAvailable ? 'Assign Task' : 'On Task'}
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  💬
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-2 text-center">
                Response time: {volunteer.responseTime} • Active {volunteer.lastActive}
              </p>
            </div>
          ))}
        </div>

        {filteredVolunteers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">No volunteers found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkills([]);
                setAvailabilityFilter('all');
              }}
              className="mt-2 text-primary hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && selectedVolunteer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-deep-slate">
                Assign Task to {selectedVolunteer.name}
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Task</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary">
                  <option>Relief Distribution - Zone B</option>
                  <option>Wellness Check - Elderly Residents</option>
                  <option>Medical Support - Evacuation Center</option>
                  <option>Logistics Support - Supply Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                    <button
                      key={priority}
                      className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Add any special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerManagement;
