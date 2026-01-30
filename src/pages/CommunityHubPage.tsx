import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Users, MapPin, Clock, 
  CheckCircle, AlertCircle, HelpCircle, Megaphone,
  Heart, ArrowRight, List, Map, Loader2
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import SOSEmergencyModal from '../components/SOSEmergencyModal';
import HelpRequestModal from '../components/HelpRequestModal';
import GlobalAlertsModal from '../components/GlobalAlertsModal';
import { useToast } from '../context/ToastContext';
import apiService from '../services/api';

interface RiskArea {
  id: string;
  name: string;
  sector: string;
  riskLevel: 'low' | 'medium' | 'high';
  issue: string;
  priority: number;
}

interface CommunityTask {
  id: number;
  title: string;
  description: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  points: number;
  status: string;
  created_at: string;
}

const CommunityHubPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [taskFilter, setTaskFilter] = useState<'all' | 'urgent'>('all');
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showHelpRequestModal, setShowHelpRequestModal] = useState(false);
  const [showGlobalAlertsModal, setShowGlobalAlertsModal] = useState(false);
  const [communityTasks, setCommunityTasks] = useState<CommunityTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [volunteeringTaskId, setVolunteeringTaskId] = useState<number | null>(null);
  const { showToast } = useToast();

  // Load community tasks on mount
  useEffect(() => {
    loadCommunityTasks();
  }, []);

  const loadCommunityTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await apiService.getCommunityTasks();
      if (response.data) {
        setCommunityTasks(response.data);
      } else if (response.error) {
        console.error('Error from API:', response.error);
        showToast('error', `Failed to load community tasks: ${response.error}`);
      }
    } catch (error: any) {
      console.error('Error loading community tasks:', error);
      showToast('error', error.message || 'Failed to load community tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleVolunteer = async (taskId: number) => {
    setVolunteeringTaskId(taskId);
    try {
      const response = await apiService.volunteerForTask(taskId);
      if (response.data) {
        showToast('success', 'You have successfully volunteered! Task added to your personal tasks.');
        // Remove the task from the list since it's now assigned
        setCommunityTasks(prev => prev.filter(t => t.id !== taskId));
      } else if (response.error) {
        showToast('error', response.error);
      }
    } catch (error) {
      showToast('error', 'Failed to volunteer for task. Please try again.');
    } finally {
      setVolunteeringTaskId(null);
    }
  };

  const handleHelpRequest = async (data: {
    type: string;
    title: string;
    description: string;
    location: string;
    urgency: string;
    responders_needed: number;
  }) => {
    const response = await apiService.createHelpRequest(data);
    if (response.data) {
      showToast('success', 'Help request sent successfully! Community members will be notified.');
    } else if (response.error) {
      showToast('error', response.error);
      throw new Error(response.error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  // Mock data based on the designs
  const riskStats = {
    low: 12,
    medium: 5,
    high: 3,
    needingHelp: 7,
  };

  const riskAreas: RiskArea[] = [
    {
      id: '1',
      name: 'Barangay A',
      sector: 'Sector 4-B',
      riskLevel: 'high',
      issue: 'Flash Flood + Buddy Communication Failure',
      priority: 1,
    },
    {
      id: '2',
      name: 'Campus B',
      sector: 'Academic Zone',
      riskLevel: 'medium',
      issue: 'Multiple Rescue Requests Pending',
      priority: 2,
    },
    {
      id: '3',
      name: 'Barangay C',
      sector: 'Sector 2-A',
      riskLevel: 'low',
      issue: 'Power Outage Reported',
      priority: 3,
    },
  ];

  // Mock tasks as fallback when database is empty
  const mockTasks: CommunityTask[] = [
    {
      id: 999001,
      title: 'Emergency Supplies for Lola Rosa',
      location: 'Brgy. Malolos, Sector 3',
      urgency: 'high',
      points: 75,
      status: 'open',
      description: 'Requiring immediate delivery of maintenance medication and drinking water.',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 999002,
      title: 'Elderly Wellness Check',
      location: 'Quezon City, Zone 2',
      urgency: 'medium',
      points: 50,
      status: 'open',
      description: 'Verify medicine stockpile and secondary power supply for Mrs. Reyes.',
      created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 999003,
      title: 'Community Center Cleanup',
      location: 'Brgy. Hall Multi-Purpose',
      urgency: 'low',
      points: 35,
      status: 'open',
      description: 'Assistance needed to organize the donation intake area for tomorrow\'s relief drive.',
      created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
  ];

  // Use database tasks or fall back to mock
  const displayTasks = communityTasks.length > 0 ? communityTasks : mockTasks;

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
    }
  };

  const getRiskBorderColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'border-l-green-500';
      case 'medium': return 'border-l-yellow-500';
      case 'high': return 'border-l-red-500';
    }
  };

  const getUrgencyBadge = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'low': return 'bg-primary text-white';
      case 'medium': return 'bg-yellow-500 text-deep-slate';
      case 'high': return 'bg-red-500 text-white';
    }
  };

  const filteredTasks = taskFilter === 'urgent' 
    ? displayTasks.filter(t => t.urgency === 'high')
    : displayTasks;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-deep-slate">
              Buddy Community Hub
            </h1>
            <p className="mt-2 text-sm sm:text-base lg:text-lg text-deep-slate/60 max-w-2xl">
              Priority real-time oversight and emergency coordination for your community sectors.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowHelpRequestModal(true)}
              className="flex-1 sm:flex-none btn-secondary flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Request Help</span>
            </button>
            <button 
              onClick={() => setShowGlobalAlertsModal(true)}
              className="flex-1 sm:flex-none btn-primary flex items-center justify-center gap-2"
            >
              <Megaphone className="w-5 h-5" />
              <span>Global Alerts</span>
            </button>
          </div>
        </div>

        {/* Risk Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className={`card p-4 sm:p-6 border-l-4 sm:border-l-6 ${getRiskBorderColor('low')}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
              <span className="text-[10px] sm:text-xs font-bold text-deep-slate/40 uppercase tracking-wider">Normal</span>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-deep-slate">{riskStats.low}</p>
            <p className="text-xs sm:text-sm font-medium text-deep-slate/60 uppercase tracking-wide">Low Risk Areas</p>
          </div>

          <div className={`card p-4 sm:p-6 border-l-4 sm:border-l-6 ${getRiskBorderColor('medium')}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
              <span className="text-[10px] sm:text-xs font-bold text-deep-slate/40 uppercase tracking-wider">Watch</span>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-deep-slate">{String(riskStats.medium).padStart(2, '0')}</p>
            <p className="text-xs sm:text-sm font-medium text-deep-slate/60 uppercase tracking-wide">Medium Risk</p>
          </div>

          <div className={`card p-4 sm:p-6 border-l-4 sm:border-l-6 ${getRiskBorderColor('high')}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-deep-slate/40 uppercase tracking-wider">Critical</span>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-deep-slate">{String(riskStats.high).padStart(2, '0')}</p>
            <p className="text-xs sm:text-sm font-medium text-deep-slate/60 uppercase tracking-wide">High Risk</p>
          </div>

          <div className="card p-4 sm:p-6 border-l-4 sm:border-l-6 border-l-burnt-orange">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-burnt-orange" />
              <span className="text-[10px] sm:text-xs font-bold text-deep-slate/40 uppercase tracking-wider">Urgent</span>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-deep-slate">{String(riskStats.needingHelp).padStart(2, '0')}</p>
            <p className="text-xs sm:text-sm font-medium text-deep-slate/60 uppercase tracking-wide">Need Help</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Priority Neighborhood Areas */}
          <div className="lg:col-span-8 space-y-6">
            <div className="card p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Priority Neighborhood Areas</h2>
                </div>
                <div className="flex bg-warm-sand/50 p-1 rounded-xl gap-1">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                      viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-deep-slate/40 hover:text-primary'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('map')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                      viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-deep-slate/40 hover:text-primary'
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                </div>
              </div>

              {/* Priority Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-warm-sand">
                      <th className="pb-4 px-4 text-[10px] sm:text-xs font-bold text-deep-slate/40 uppercase tracking-wider">Priority</th>
                      <th className="pb-4 px-4 text-[10px] sm:text-xs font-bold text-deep-slate/40 uppercase tracking-wider">Location</th>
                      <th className="pb-4 px-4 text-[10px] sm:text-xs font-bold text-deep-slate/40 uppercase tracking-wider">Risk Level</th>
                      <th className="pb-4 px-4 text-[10px] sm:text-xs font-bold text-deep-slate/40 uppercase tracking-wider">Issue Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskAreas.map((area) => (
                      <tr key={area.id} className="group hover:bg-primary/5 transition-colors cursor-pointer">
                        <td className="py-4 sm:py-6 px-4">
                          <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-md ${
                            area.riskLevel === 'high' ? 'bg-red-500' : 
                            area.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}>
                            {area.priority}
                          </div>
                        </td>
                        <td className="py-4 sm:py-6 px-4">
                          <span className="font-bold text-sm sm:text-lg">{area.name}</span>
                          <p className="text-xs text-deep-slate/40">{area.sector}</p>
                        </td>
                        <td className="py-4 sm:py-6 px-4">
                          <div className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full border ${getRiskColor(area.riskLevel)}`}>
                            <div className={`w-2 h-2 rounded-full ${
                              area.riskLevel === 'high' ? 'bg-red-500 animate-pulse' : 
                              area.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <span className="font-bold text-[10px] sm:text-xs uppercase">{area.riskLevel}</span>
                          </div>
                        </td>
                        <td className="py-4 sm:py-6 px-4">
                          <p className="text-xs sm:text-sm font-medium text-deep-slate/70">{area.issue}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Tasks Section */}
            <div className="card bg-primary/10 p-4 sm:p-6 lg:p-8 border border-primary/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-burnt-orange" />
                  Active Tasks
                </h2>
                <div className="flex bg-white/50 p-1 rounded-xl gap-1 shadow-sm border border-primary/10">
                  <button 
                    onClick={() => setTaskFilter('all')}
                    className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                      taskFilter === 'all' ? 'bg-primary text-white shadow-md' : 'text-deep-slate/60 hover:text-primary'
                    }`}
                  >
                    All Tasks
                  </button>
                  <button 
                    onClick={() => setTaskFilter('urgent')}
                    className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                      taskFilter === 'urgent' ? 'bg-primary text-white shadow-md' : 'text-deep-slate/60 hover:text-primary'
                    }`}
                  >
                    Urgent
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {isLoadingTasks ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-deep-slate/60">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No tasks available</p>
                    <p className="text-sm">Check back later for new community tasks</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div key={task.id} className="bg-warm-sand p-4 sm:p-6 rounded-xl shadow-sm border border-deep-slate/5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                        <div className="flex-1 space-y-2 sm:space-y-3">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2 sm:px-3 py-1 rounded-full ${getUrgencyBadge(task.urgency)}`}>
                              {task.urgency} Urgency
                            </span>
                            <span className="text-xs font-medium text-deep-slate/40 flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {formatTimeAgo(task.created_at)}
                            </span>
                            <span className="text-xs font-medium text-burnt-orange bg-burnt-orange/10 px-2 py-0.5 rounded-full">
                              +{task.points} pts
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl text-deep-slate">{task.title}</h3>
                            <p className="text-xs sm:text-sm font-medium text-deep-slate/60 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                              {task.location}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-deep-slate/70 italic line-clamp-2">{task.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <button 
                            onClick={() => handleVolunteer(task.id)}
                            disabled={volunteeringTaskId === task.id}
                            className="w-full lg:w-auto btn-primary px-6 sm:px-10 py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {volunteeringTaskId === task.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Volunteering...
                              </>
                            ) : (
                              'Volunteer'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 sm:mt-8 text-center">
                <button className="text-sm font-bold text-primary hover:text-burnt-orange transition-colors inline-flex items-center gap-2">
                  See All Tasks
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Real-Time Buddy Status */}
            <div className="card p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  Real-Time Status
                </h3>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-4 sm:p-5 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-red-500 p-2 rounded-lg text-white">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-red-600">Emergency Status</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">03</p>
                </div>

                <div className="flex items-center justify-between p-4 sm:p-5 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-yellow-500 p-2 rounded-lg text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-yellow-600">Awaiting Check-in</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">12</p>
                </div>

                <div className="flex items-center justify-between p-4 sm:p-5 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-green-500 p-2 rounded-lg text-white">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-green-600">Safe & Verified</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">45</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary to-primary-dark text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowSOSModal(true)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Send SOS Alert
                </button>
                <button 
                  onClick={() => setShowHelpRequestModal(true)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Request Help
                </button>
                <button 
                  onClick={() => setShowGlobalAlertsModal(true)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Megaphone className="w-4 h-4" />
                  Global Alerts
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* SOS Emergency Modal */}
      <SOSEmergencyModal 
        isOpen={showSOSModal} 
        onClose={() => setShowSOSModal(false)} 
      />

      {/* Help Request Modal */}
      <HelpRequestModal
        isOpen={showHelpRequestModal}
        onClose={() => setShowHelpRequestModal(false)}
        onSubmit={handleHelpRequest}
      />

      {/* Global Alerts Modal */}
      <GlobalAlertsModal
        isOpen={showGlobalAlertsModal}
        onClose={() => setShowGlobalAlertsModal(false)}
        onAlertCreated={() => showToast('success', 'Alert created and sent to community!')}
      />
    </Layout>
  );
};

export default CommunityHubPage;
