import React, { useState, useEffect } from 'react';
import { 
  Award, TrendingUp, Gift, Crown, 
  Lock, Check, ArrowUp, MapPin, Users
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { mockPointsHistory, rankTiers } from '../data/mockData';
import { getRankProgress, timeAgo } from '../utils/helpers';
import { PointsHistory } from '../types';
import apiService from '../services/api';

const PointsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'rewards' | 'leaderboard'>('history');
  const [leaderboardView, setLeaderboardView] = useState<'national' | 'regional' | 'barangay'>('national');
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);

  useEffect(() => {
    // Load points history from API
    const loadPointsHistory = async () => {
      try {
        const response = await apiService.getPointsHistory();
        if (response.data) {
          setPointsHistory(response.data);
        } else if (response.error) {
          console.error('Failed to load points history:', response.error);
          // Fallback to mock data
          setPointsHistory(mockPointsHistory);
        }
      } catch (error) {
        console.error('Failed to load points history:', error);
        // Fallback to mock data
        setPointsHistory(mockPointsHistory);
      }
    };
    
    loadPointsHistory();
  }, []);

  const rankProgress = user ? getRankProgress(user.points, user.rank) : { current: 0, next: 100, percentage: 0 };
  const currentTierIndex = rankTiers.findIndex(t => t.name === user?.rank);
  const currentTier = rankTiers[currentTierIndex];
  const nextTier = rankTiers[currentTierIndex + 1];

  const rewards = [
    { id: '1', name: 'Priority Support Badge', points: 500, description: 'Get priority access to community support', unlocked: (user?.points || 0) >= 500 },
    { id: '2', name: 'Grocery Voucher ₱100', points: 1000, description: 'Redeemable at partner stores', unlocked: (user?.points || 0) >= 1000 },
    { id: '3', name: 'Load Credits ₱50', points: 750, description: 'Mobile load for any network', unlocked: (user?.points || 0) >= 750 },
    { id: '4', name: 'Community Leader Badge', points: 2000, description: 'Exclusive recognition as community leader', unlocked: (user?.points || 0) >= 2000 },
    { id: '5', name: 'Emergency Kit Voucher', points: 3000, description: 'Redeem for emergency supplies', unlocked: (user?.points || 0) >= 3000 },
    { id: '6', name: 'SafeZonePH Merchandise', points: 1500, description: 'Exclusive t-shirt and cap', unlocked: (user?.points || 0) >= 1500 },
  ];

  const leaderboard = [
    { rank: 1, name: 'Maria Santos', points: 5420, avatar: 'MS' },
    { rank: 2, name: 'Juan Dela Cruz', points: 4890, avatar: 'JD' },
    { rank: 3, name: 'Ana Garcia', points: 4350, avatar: 'AG' },
    { rank: 4, name: 'Pedro Reyes', points: 3980, avatar: 'PR' },
    { rank: 5, name: 'Rosa Mendoza', points: 3650, avatar: 'RM' },
    { rank: 6, name: user?.firstName + ' ' + user?.lastName, points: user?.points || 0, avatar: user?.firstName?.[0] || 'U', isCurrentUser: true },
    { rank: 7, name: 'Carlos Tan', points: 2890, avatar: 'CT' },
    { rank: 8, name: 'Elena Cruz', points: 2450, avatar: 'EC' },
    { rank: 9, name: 'Miguel Santos', points: 2100, avatar: 'MS' },
    { rank: 10, name: 'Lisa Reyes', points: 1850, avatar: 'LR' },
  ].sort((a, b) => b.points - a.points).map((entry, index) => ({ ...entry, rank: index + 1 }));

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return '✅';
      case 'check_in': return '📋';
      case 'buddy_added': return '🤝';
      case 'badge_earned': return '🏆';
      default: return '⭐';
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Points Overview */}
        <div className="card p-4 sm:p-6 md:p-8 bg-gradient-to-br from-burnt-orange/10 to-primary/10">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-burnt-orange to-primary flex items-center justify-center">
                <Award className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-deep-slate text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                {user?.rank}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-deep-slate mb-1 sm:mb-2">
                {user?.points?.toLocaleString()} Points
              </h1>
              <p className="text-sm sm:text-base text-deep-slate/60 mb-4 sm:mb-6">
                Keep helping your community to earn more Bayanihan Points!
              </p>

              {/* Progress to Next Rank */}
              {nextTier && (
                <div className="max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-deep-slate">{currentTier?.name}</span>
                    <span className="text-sm font-medium text-deep-slate">{nextTier.name}</span>
                  </div>
                  <div className="h-4 bg-deep-slate/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-burnt-orange to-primary rounded-full transition-all"
                      style={{ width: `${rankProgress.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <ArrowUp className="w-4 h-4 text-primary" />
                    <span className="text-sm text-deep-slate/60">
                      {nextTier.minPoints - (user?.points || 0)} points to reach {nextTier.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="text-sm text-deep-slate/60 mb-1">This Month</div>
              <div className="text-3xl font-bold text-primary">+350</div>
              <div className="text-sm text-deep-slate/60">points earned</div>
            </div>
          </div>
        </div>

        {/* Rank Tiers */}
        <div className="card p-6 mb-8">
          <h2 className="font-bold text-lg text-deep-slate mb-4">Rank Progression</h2>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {rankTiers.map((tier, index) => {
              const isActive = tier.name === user?.rank;
              const isPast = index < currentTierIndex;
              const isFuture = index > currentTierIndex;
              
              return (
                <div key={tier.name} className="flex items-center">
                  <div className={`flex flex-col items-center min-w-[100px] ${isFuture ? 'opacity-50' : ''}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isActive ? 'bg-gradient-to-br from-burnt-orange to-primary text-white' :
                      isPast ? 'bg-primary text-white' : 'bg-deep-slate/10 text-deep-slate/40'
                    }`}>
                      {isPast ? <Check className="w-6 h-6" /> :
                       isActive ? <Crown className="w-6 h-6" /> :
                       <Lock className="w-5 h-5" />}
                    </div>
                    <div className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-deep-slate/60'}`}>
                      {tier.name}
                    </div>
                    <div className="text-xs text-deep-slate/40">{tier.minPoints}+ pts</div>
                  </div>
                  {index < rankTiers.length - 1 && (
                    <div className={`w-12 h-1 mx-2 rounded ${isPast ? 'bg-primary' : 'bg-deep-slate/10'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'history', label: 'Points History', icon: TrendingUp },
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap min-h-[44px] ${
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

        {/* Tab Content */}
        {activeTab === 'history' && (
          <div className="card">
            <div className="p-3 sm:p-4 border-b border-deep-slate/10">
              <h2 className="font-bold text-base sm:text-lg text-deep-slate">Recent Activity</h2>
            </div>
            <div className="divide-y divide-deep-slate/10">
              {pointsHistory.map((activity) => (
                <div key={activity.id} className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg sm:text-xl shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-deep-slate text-sm sm:text-base truncate">{activity.description}</div>
                    <div className="text-xs sm:text-sm text-deep-slate/60">{timeAgo(activity.date)}</div>
                  </div>
                  <div className={`font-bold text-sm sm:text-base shrink-0 ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.points > 0 ? '+' : ''}{activity.points}
                  </div>
                </div>
              ))}
              {pointsHistory.length === 0 && (
                <div className="p-8 text-center text-deep-slate/60">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No activity yet. Complete tasks to start earning points!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rewards.map((reward) => (
              <div 
                key={reward.id} 
                className={`card p-4 sm:p-6 ${reward.unlocked ? '' : 'opacity-60'}`}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-burnt-orange/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-burnt-orange" />
                  </div>
                  {reward.unlocked ? (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                      Available
                    </span>
                  ) : (
                    <span className="bg-deep-slate/10 text-deep-slate/60 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base sm:text-lg text-deep-slate mb-1">{reward.name}</h3>
                <p className="text-xs sm:text-sm text-deep-slate/60 mb-3 sm:mb-4">{reward.description}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-burnt-orange font-bold text-sm sm:text-base">
                    <Award className="w-4 h-4" />
                    {reward.points} pts
                  </div>
                  <button 
                    disabled={!reward.unlocked}
                    className={`btn text-xs sm:text-sm py-2 px-3 ${reward.unlocked ? 'btn-primary' : 'bg-deep-slate/10 text-deep-slate/40 cursor-not-allowed'}`}
                  >
                    {reward.unlocked ? 'Redeem' : 'Locked'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="card overflow-x-auto">
            <div className="p-3 sm:p-4 border-b border-deep-slate/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="font-bold text-base sm:text-lg text-deep-slate">Community Leaderboard</h2>
                {/* Regional Ranking Toggle */}
                <div className="flex items-center gap-1 bg-deep-slate/5 p-1 rounded-lg">
                  <button
                    onClick={() => setLeaderboardView('national')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                      leaderboardView === 'national'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-deep-slate/60 hover:text-deep-slate'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    National
                  </button>
                  <button
                    onClick={() => setLeaderboardView('regional')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                      leaderboardView === 'regional'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-deep-slate/60 hover:text-deep-slate'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Regional
                  </button>
                  <button
                    onClick={() => setLeaderboardView('barangay')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                      leaderboardView === 'barangay'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-deep-slate/60 hover:text-deep-slate'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Barangay
                  </button>
                </div>
              </div>
              {/* Region/Barangay Indicator */}
              {leaderboardView === 'regional' && (
                <div className="mt-3 flex items-center gap-2 text-sm text-deep-slate/60">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Showing rankings for <strong className="text-deep-slate">NCR - Metro Manila</strong></span>
                </div>
              )}
              {leaderboardView === 'barangay' && (
                <div className="mt-3 flex items-center gap-2 text-sm text-deep-slate/60">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Showing rankings for <strong className="text-deep-slate">Barangay Commonwealth, Quezon City</strong></span>
                </div>
              )}
            </div>
            <div className="divide-y divide-deep-slate/10 min-w-[320px]">
              {leaderboard.map((entry) => (
                <div 
                  key={entry.rank} 
                  className={`p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 ${entry.isCurrentUser ? 'bg-primary/5' : ''}`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                    entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    entry.rank === 3 ? 'bg-orange-300 text-orange-800' :
                    'bg-deep-slate/10 text-deep-slate/60'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {entry.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm sm:text-base truncate ${entry.isCurrentUser ? 'text-primary' : 'text-deep-slate'}`}>
                      {entry.name}
                      {entry.isCurrentUser && <span className="text-xs ml-1 sm:ml-2">(You)</span>}
                    </div>
                    {leaderboardView !== 'national' && (
                      <div className="text-xs text-deep-slate/50">
                        {leaderboardView === 'regional' ? 'Metro Manila' : 'Brgy. Commonwealth'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-bold text-burnt-orange text-sm sm:text-base shrink-0">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {entry.points.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            {/* Regional Stats Footer */}
            {leaderboardView !== 'national' && (
              <div className="p-4 border-t border-deep-slate/10 bg-deep-slate/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-deep-slate/60">
                    Your regional rank: <strong className="text-primary">#{leaderboard.findIndex(e => e.isCurrentUser) + 1}</strong>
                  </span>
                  <span className="text-deep-slate/60">
                    Total participants: <strong className="text-deep-slate">{leaderboardView === 'regional' ? '1,245' : '89'}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PointsPage;
