import React, { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  barangay: string;
  points: number;
  tasksCompleted: number;
  checkIns: number;
  badges: number;
  trend: 'up' | 'down' | 'same';
  trendValue: number;
  isCurrentUser?: boolean;
}

interface CommunityLeaderboardProps {
  className?: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    id: '1',
    name: 'Maria Santos',
    avatar: '👩‍⚕️',
    barangay: 'Brgy. Poblacion',
    points: 12450,
    tasksCompleted: 89,
    checkIns: 156,
    badges: 12,
    trend: 'up',
    trendValue: 2,
  },
  {
    rank: 2,
    id: '2',
    name: 'Juan Dela Cruz',
    avatar: '👨‍🔧',
    barangay: 'Brgy. San Miguel',
    points: 11200,
    tasksCompleted: 76,
    checkIns: 143,
    badges: 10,
    trend: 'up',
    trendValue: 1,
  },
  {
    rank: 3,
    id: '3',
    name: 'Ana Reyes',
    avatar: '👩‍🍳',
    barangay: 'Brgy. Santo Niño',
    points: 10850,
    tasksCompleted: 82,
    checkIns: 128,
    badges: 11,
    trend: 'down',
    trendValue: 1,
  },
  {
    rank: 4,
    id: '4',
    name: 'Pedro Garcia',
    avatar: '👨',
    barangay: 'Brgy. Poblacion',
    points: 9780,
    tasksCompleted: 65,
    checkIns: 112,
    badges: 8,
    trend: 'same',
    trendValue: 0,
  },
  {
    rank: 5,
    id: '5',
    name: 'Rosa Mendoza',
    avatar: '👩',
    barangay: 'Brgy. Bagong Silang',
    points: 8950,
    tasksCompleted: 58,
    checkIns: 98,
    badges: 7,
    trend: 'up',
    trendValue: 3,
  },
  {
    rank: 6,
    id: '6',
    name: 'You',
    avatar: '😊',
    barangay: 'Brgy. Poblacion',
    points: 5240,
    tasksCompleted: 28,
    checkIns: 45,
    badges: 5,
    trend: 'up',
    trendValue: 4,
    isCurrentUser: true,
  },
  {
    rank: 7,
    id: '7',
    name: 'Carlos Tan',
    avatar: '👨‍💼',
    barangay: 'Brgy. San Miguel',
    points: 4890,
    tasksCompleted: 24,
    checkIns: 42,
    badges: 4,
    trend: 'down',
    trendValue: 2,
  },
  {
    rank: 8,
    id: '8',
    name: 'Elena Cruz',
    avatar: '👩‍🏫',
    barangay: 'Brgy. Santo Niño',
    points: 4560,
    tasksCompleted: 21,
    checkIns: 38,
    badges: 4,
    trend: 'up',
    trendValue: 1,
  },
];

const barangays = [
  'All Barangays',
  'Brgy. Poblacion',
  'Brgy. San Miguel',
  'Brgy. Santo Niño',
  'Brgy. Bagong Silang',
];

const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({ className = '' }) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [category, setCategory] = useState<'overall' | 'tasks' | 'checkins' | 'badges'>('overall');
  const [selectedBarangay, setSelectedBarangay] = useState('All Barangays');
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);

  const filteredLeaderboard = mockLeaderboard
    .filter(entry => selectedBarangay === 'All Barangays' || entry.barangay === selectedBarangay)
    .sort((a, b) => {
      switch (category) {
        case 'tasks':
          return b.tasksCompleted - a.tasksCompleted;
        case 'checkins':
          return b.checkIns - a.checkIns;
        case 'badges':
          return b.badges - a.badges;
        default:
          return b.points - a.points;
      }
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getTrendIndicator = (trend: LeaderboardEntry['trend'], value: number) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500 text-sm">▲ {value}</span>;
      case 'down':
        return <span className="text-red-500 text-sm">▼ {value}</span>;
      default:
        return <span className="text-gray-400 text-sm">–</span>;
    }
  };

  const currentUser = filteredLeaderboard.find(e => e.isCurrentUser);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-deep-slate flex items-center gap-2">
              <span className="text-2xl">🏆</span> Community Leaderboard
            </h2>
            <p className="text-sm text-gray-500 mt-1">Top contributors in the community</p>
          </div>
          
          {/* Time Filter */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['weekly', 'monthly', 'alltime'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeframe === tf ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tf === 'weekly' ? 'Weekly' : tf === 'monthly' ? 'Monthly' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {([
            { id: 'overall', label: 'Overall', icon: '⭐' },
            { id: 'tasks', label: 'Tasks', icon: '✅' },
            { id: 'checkins', label: 'Check-ins', icon: '📍' },
            { id: 'badges', label: 'Badges', icon: '🎖️' },
          ] as const).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                category === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 text-sm"
          >
            {barangays.map((brgy) => (
              <option key={brgy} value={brgy}>{brgy}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFriendsOnly}
              onChange={(e) => setShowFriendsOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">Friends only</span>
          </label>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-warm-sand/30 to-transparent">
        <div className="flex items-end justify-center gap-2 sm:gap-4">
          {/* 2nd Place */}
          {filteredLeaderboard[1] && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-warm-sand rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-2">
                {filteredLeaderboard[1].avatar}
              </div>
              <div className="text-center">
                <span className="text-2xl">🥈</span>
                <p className="text-sm font-medium text-deep-slate truncate max-w-[80px] sm:max-w-none">
                  {filteredLeaderboard[1].name}
                </p>
                <p className="text-xs text-gray-500">{filteredLeaderboard[1].points.toLocaleString()} pts</p>
              </div>
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 rounded-t-lg mt-2"></div>
            </div>
          )}

          {/* 1st Place */}
          {filteredLeaderboard[0] && (
            <div className="flex flex-col items-center -mt-4">
              <div className="w-18 h-18 sm:w-20 sm:h-20 bg-yellow-100 border-4 border-yellow-400 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-2">
                {filteredLeaderboard[0].avatar}
              </div>
              <div className="text-center">
                <span className="text-3xl">🥇</span>
                <p className="font-semibold text-deep-slate">{filteredLeaderboard[0].name}</p>
                <p className="text-sm text-primary font-medium">{filteredLeaderboard[0].points.toLocaleString()} pts</p>
              </div>
              <div className="w-20 sm:w-24 h-24 sm:h-28 bg-primary/20 rounded-t-lg mt-2"></div>
            </div>
          )}

          {/* 3rd Place */}
          {filteredLeaderboard[2] && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-2">
                {filteredLeaderboard[2].avatar}
              </div>
              <div className="text-center">
                <span className="text-2xl">🥉</span>
                <p className="text-sm font-medium text-deep-slate truncate max-w-[80px] sm:max-w-none">
                  {filteredLeaderboard[2].name}
                </p>
                <p className="text-xs text-gray-500">{filteredLeaderboard[2].points.toLocaleString()} pts</p>
              </div>
              <div className="w-16 sm:w-20 h-12 sm:h-14 bg-orange-200 rounded-t-lg mt-2"></div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-4 sm:p-6">
        <div className="space-y-2">
          {filteredLeaderboard.slice(3).map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                entry.isCurrentUser
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Rank */}
              <div className="w-10 text-center">
                {getRankBadge(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-warm-sand rounded-full flex items-center justify-center text-xl">
                {entry.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-deep-slate truncate">
                    {entry.name}
                    {entry.isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                  </p>
                  {getTrendIndicator(entry.trend, entry.trendValue)}
                </div>
                <p className="text-xs text-gray-500">{entry.barangay}</p>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                <div className="text-center">
                  <div className="font-medium text-deep-slate">{entry.tasksCompleted}</div>
                  <div>Tasks</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-deep-slate">{entry.checkIns}</div>
                  <div>Check-ins</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-deep-slate">{entry.badges}</div>
                  <div>Badges</div>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="font-bold text-primary">{entry.points.toLocaleString()}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>

        {/* Current User Position (if not in view) */}
        {currentUser && currentUser.rank > 10 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Your Position</p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border-2 border-primary">
              <div className="w-10 text-center">
                <span className="text-lg font-bold text-primary">#{currentUser.rank}</span>
              </div>
              <div className="w-10 h-10 bg-warm-sand rounded-full flex items-center justify-center text-xl">
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-deep-slate">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.barangay}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{currentUser.points.toLocaleString()}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityLeaderboard;
