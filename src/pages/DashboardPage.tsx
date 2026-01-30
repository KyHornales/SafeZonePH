import React, { useEffect } from 'react';
import { 
  Users, CheckCircle2, Award, Calendar, TrendingUp, 
  AlertTriangle, Phone, MessageCircle, ArrowRight
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTasksStore } from '../store';
import { mockBuddies, mockTasks, mockCheckIns, emergencyHotlines } from '../data/mockData';
import { getMoodEmoji, getRankProgress } from '../utils/helpers';
import TaskCard from '../components/tasks/TaskCard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, setTasks } = useTasksStore();

  // Initialize tasks from mock data if empty
  useEffect(() => {
    if (tasks.length === 0) {
      setTasks(mockTasks);
    }
  }, [tasks.length, setTasks]);

  const stats = [
    { icon: Users, label: 'Active Buddies', value: mockBuddies.filter(b => b.status === 'online').length, color: 'text-green-500' },
    { icon: CheckCircle2, label: 'Check-ins Today', value: mockCheckIns.filter(c => c.date === new Date().toISOString().split('T')[0]).length, color: 'text-primary' },
    { icon: Award, label: 'Bayanihan Points', value: user?.points || 0, color: 'text-burnt-orange' },
    { icon: Calendar, label: 'Tasks Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'text-blue-500' },
  ];

  const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 3);
  const recentCheckIns = mockCheckIns.slice(0, 5);
  const activeBuddies = mockBuddies.filter(b => b.status !== 'offline').slice(0, 4);

  const rankProgress = user ? getRankProgress(user.points, user.rank) : { current: 0, next: 100, percentage: 0 };

  return (
    <Layout>
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="font-display text-base sm:text-xl md:text-2xl font-bold text-deep-slate mb-0.5 sm:mb-1">
            Magandang Araw, {user?.firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-deep-slate/60">
            Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="card p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-deep-slate/5 flex items-center justify-center shrink-0 ${stat.color}`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-bold text-deep-slate leading-none">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-deep-slate/60 leading-tight mt-0.5">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rank Progress */}
        <div className="card p-2.5 sm:p-4 md:p-5">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-burnt-orange/10 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-burnt-orange" />
              </div>
              <div>
                <h3 className="font-semibold text-deep-slate text-xs sm:text-sm">{user?.rank}</h3>
                <p className="text-[10px] sm:text-xs text-deep-slate/60">{user?.points} pts</p>
              </div>
            </div>
            <button className="btn btn-outline text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3">Rewards</button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-deep-slate/60">Next rank</span>
              <span className="font-semibold text-deep-slate">{rankProgress.percentage}%</span>
            </div>
            <div className="h-2 sm:h-2.5 bg-deep-slate/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-burnt-orange rounded-full transition-all"
                style={{ width: `${rankProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-2 sm:gap-4 md:gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-4 md:space-y-5">
            {/* Pending Tasks */}
            <div className="card">
              <div className="px-3 py-2 sm:p-3 md:p-4 border-b border-deep-slate/10">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm sm:text-base text-deep-slate">Pending Tasks</h2>
                  <a href="/tasks" className="text-primary text-xs font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
                    View All <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map(task => (
                    <TaskCard key={task.id} task={task} compact />
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-deep-slate/60">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 opacity-50" />
                    <p className="text-xs sm:text-sm">All tasks completed!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="px-3 py-2 sm:p-3 md:p-4 border-b border-deep-slate/10">
                <h2 className="font-semibold text-sm sm:text-base text-deep-slate">Recent Check-ins</h2>
              </div>
              <div className="divide-y divide-deep-slate/10">
                {recentCheckIns.slice(0, 3).map(checkIn => {
                  const buddy = mockBuddies.find(b => b.id === checkIn.buddyId);
                  return (
                    <div key={checkIn.id} className="px-3 py-2 sm:p-3 md:p-4 flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm shrink-0">
                        {buddy?.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-deep-slate text-xs sm:text-sm truncate">{buddy?.name}</span>
                          <span className="text-sm shrink-0">{getMoodEmoji(checkIn.mood)}</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-deep-slate/60 truncate">{checkIn.notes}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* Active Buddies */}
            <div className="card">
              <div className="px-3 py-2 sm:p-3 md:p-4 border-b border-deep-slate/10">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm sm:text-base text-deep-slate">Active Buddies</h2>
                  <a href="/buddies" className="text-primary text-xs font-medium">See All</a>
                </div>
              </div>
              <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
                {activeBuddies.slice(0, 3).map(buddy => (
                  <div key={buddy.id} className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-lg hover:bg-deep-slate/5 active:bg-deep-slate/10 transition-colors">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                        {buddy.name[0]}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
                        buddy.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-deep-slate text-xs sm:text-sm truncate">{buddy.name}</div>
                      <div className="text-[10px] sm:text-xs text-deep-slate/60 capitalize">{buddy.status}</div>
                    </div>
                    <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Send message">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Hotlines */}
            <div className="card bg-red-50 border-red-100">
              <div className="px-3 py-2 sm:p-3 md:p-4 border-b border-red-100">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                  <h2 className="font-semibold text-sm sm:text-base text-red-700">Emergency Hotlines</h2>
                </div>
              </div>
              <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
                {emergencyHotlines.slice(0, 3).map((hotline, index) => (
                  <a
                    key={index}
                    href={`tel:${hotline.number.replace(/\s/g, '')}`}
                    className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-deep-slate text-xs sm:text-sm truncate">{hotline.name}</div>
                      <div className="text-[10px] sm:text-xs text-red-600">{hotline.number}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-2 sm:p-3 md:p-4">
              <h3 className="font-semibold text-deep-slate text-sm sm:text-base mb-2 sm:mb-3 px-1">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <a href="/buddies" className="btn btn-outline text-[11px] sm:text-xs justify-center py-2 sm:py-2.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Find Buddy</span>
                </a>
                <a href="/tasks" className="btn btn-outline text-[11px] sm:text-xs justify-center py-2 sm:py-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </a>
                <a href="/resources" className="btn btn-outline text-[11px] sm:text-xs justify-center py-2 sm:py-2.5 col-span-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Resources
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
