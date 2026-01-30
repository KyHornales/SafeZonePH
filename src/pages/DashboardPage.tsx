import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle2, Award, Calendar, TrendingUp, 
  AlertTriangle, Phone, MessageCircle, ArrowRight
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTasksStore } from '../store';
import { emergencyHotlines } from '../data/mockData';
import { getRankProgress } from '../utils/helpers';
import TaskCard from '../components/tasks/TaskCard';
import apiService from '../services/api';

interface BuddySession {
  id: number;
  user_id: number;
  buddy_id: number;
  buddy_name?: string;
  status: 'active' | 'completed' | 'cancelled';
  last_check_in: string | null;
  created_at: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, setTasks } = useTasksStore();
  const [activeBuddies, setActiveBuddies] = useState<BuddySession[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  // Load active buddy sessions from backend
  useEffect(() => {
    const fetchActiveBuddies = async () => {
      try {
        const response = await apiService.getActiveBuddySessions();
        if (response.data) {
          // Map to include buddy_name from the response
          const sessionsWithNames = response.data.map((session: any) => ({
            ...session,
            buddy_name: session.buddyName || `User ${session.buddyId}`
          }));
          setActiveBuddies(sessionsWithNames);
        }
      } catch (error) {
        console.error('Failed to fetch active buddies:', error);
      }
    };
    fetchActiveBuddies();
  }, []);

  // Load recent check-in messages from conversations
  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const response = await apiService.getConversations();
        if (response.data) {
          // Filter for check-in messages (messages that start with "Check-in")
          const checkInMessages = response.data
            .filter((conv: any) => conv.last_message && conv.last_message.startsWith('Check-in'))
            .map((conv: any) => ({
              id: conv.id,
              buddyName: conv.participant_name,
              message: conv.last_message,
              timestamp: conv.last_message_at
            }))
            .slice(0, 5);
          setRecentMessages(checkInMessages);
        }
      } catch (error) {
        console.error('Failed to fetch recent messages:', error);
      }
    };
    fetchRecentMessages();
  }, []);

  const stats = [
    { icon: Users, label: 'Active Buddies', value: activeBuddies.length, color: 'text-green-500' },
    { icon: CheckCircle2, label: 'Check-ins Today', value: recentMessages.filter(m => {
      const today = new Date().toISOString().split('T')[0];
      return m.timestamp && m.timestamp.startsWith(today);
    }).length, color: 'text-primary' },
    { icon: Award, label: 'Bayanihan Points', value: user?.points || 0, color: 'text-burnt-orange' },
    { icon: Calendar, label: 'Tasks Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'text-blue-500' },
  ];

  const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 3);
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
            <button onClick={() => navigate('/points')} className="btn btn-outline text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3">Rewards</button>
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
                  <button onClick={() => navigate('/tasks')} className="text-primary text-xs font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
                    View All <ArrowRight className="w-3 h-3" />
                  </button>
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
                {recentMessages.length > 0 ? (
                  recentMessages.map(msg => {
                    // Extract mood emoji and notes from message like "Check-in 🙂: Feeling great!"
                    const parts = msg.message.split(': ');
                    const moodEmoji = parts[0].replace('Check-in ', '').trim();
                    const notes = parts.slice(1).join(': ');
                    
                    return (
                      <div key={msg.id} className="px-3 py-2 sm:p-3 md:p-4 flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm shrink-0">
                          {msg.buddyName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-deep-slate text-xs sm:text-sm truncate">{msg.buddyName}</span>
                            <span className="text-sm shrink-0">{moodEmoji}</span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-deep-slate/60 truncate">{notes}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-xs sm:text-sm text-deep-slate/60">
                    No recent check-ins
                  </div>
                )}
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
                  <button onClick={() => navigate('/buddies')} className="text-primary text-xs font-medium">See All</button>
                </div>
              </div>
              <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
                {activeBuddies.length === 0 ? (
                  <p className="text-center text-xs sm:text-sm text-deep-slate/60 py-4">No active buddy sessions</p>
                ) : (
                  activeBuddies.slice(0, 3).map(session => {
                    const buddyName = session.buddy_name || `Buddy ${session.buddy_id}`;
                    return (
                      <div key={session.id} className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-lg hover:bg-deep-slate/5 active:bg-deep-slate/10 transition-colors">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                            {buddyName[0]}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white bg-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-deep-slate text-xs sm:text-sm truncate">{buddyName}</div>
                          <div className="text-[10px] sm:text-xs text-deep-slate/60 capitalize">Active session</div>
                        </div>
                        <button onClick={() => navigate('/chat')} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Send message">
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
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
                <button onClick={() => navigate('/buddies', { state: { openAddBuddy: true } })} className="btn btn-outline text-[11px] sm:text-xs justify-center py-2 sm:py-2.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Find Buddy</span>
                </button>
                <button onClick={() => navigate('/tasks', { state: { openCreateTask: true } })} className="btn btn-outline text-[11px] sm:text-xs justify-center py-2 sm:py-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </button>
                <button onClick={() => navigate('/resources')} className="btn btn-outline text-[11px] sm:text-xs justify-center py-2 sm:py-2.5 col-span-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
