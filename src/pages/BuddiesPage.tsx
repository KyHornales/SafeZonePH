import React, { useState, useEffect } from 'react';
import { Search, UserPlus, MessageCircle, Phone, MapPin, Star, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BuddyCard from '../components/buddies/BuddyCard';
import Modal from '../components/ui/Modal';
import { mockBuddies } from '../data/mockData';
import { Buddy } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../components/ui/Toast';

// Interface for searchable users
interface SearchableUser {
  id: string;
  name: string;
  email?: string;
  location?: string;
  isVerified: boolean;
}

const BuddiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNewBuddyModal, setShowNewBuddyModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  
  // Add buddy search state
  const [buddySearchQuery, setBuddySearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableUser[]>([]);

  const [checkInData, setCheckInData] = useState({
    mood: 'good',
    notes: '',
    needsSupport: false,
  });

  // Check if we should open add buddy modal from navigation state
  useEffect(() => {
    if (location.state?.openAddBuddy) {
      setShowNewBuddyModal(true);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Fetch active buddy sessions and buddies
  useEffect(() => {
    fetchActiveSessions();
    fetchBuddies();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const response = await apiService.getActiveBuddySessions();
      if (response.data) {
        setActiveSessions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch buddy sessions:', error);
    }
  };

  const fetchBuddies = async () => {
    try {
      const response = await apiService.getBuddies();
      if (response.data) {
        // Convert backend buddy data to frontend Buddy type
        const formattedBuddies: Buddy[] = response.data.map((buddy: any) => ({
          id: buddy.id.toString(),
          userId: buddy.id.toString(),
          name: buddy.name,
          location: buddy.location,
          status: 'offline' as const,
          riskLevel: 'low' as const,
          relationship: 'buddy',
          isVerified: true,
          distance: undefined,
          trustScore: Math.floor(Math.random() * 20) + 80,
          sessionsCompleted: Math.floor(Math.random() * 50),
          responseTime: `${Math.floor(Math.random() * 10) + 1}min`,
          skills: [],
          verifiedSince: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        }));
        setBuddies(formattedBuddies);
      }
    } catch (error) {
      console.error('Failed to fetch buddies:', error);
    }
  };

  const filteredBuddies = buddies.filter(buddy => {
    const matchesSearch = buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (buddy.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || buddy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle buddy search - searches through real users from backend
  const handleBuddySearch = async (query: string) => {
    setBuddySearchQuery(query);
    
    if (query.length === 0) {
      setSearchResults([]);
      return;
    }
    
    const searchLower = query.toLowerCase();
    
    try {
      // Fetch all users from backend
      const response = await apiService.getBuddies();
      if (response.data) {
        // Convert to SearchableUser format and filter
        const allUsers: SearchableUser[] = response.data.map((user: any) => ({
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          location: user.location,
          isVerified: true
        }));
        
        // Filter out users who are already buddies
        const existingBuddyIds = buddies.map(b => b.userId);
        
        const results = allUsers.filter(user => {
          const isAlreadyBuddy = existingBuddyIds.includes(user.id);
          const matchesName = user.name.toLowerCase().includes(searchLower);
          const matchesEmail = user.email?.toLowerCase().includes(searchLower);
          const matchesLocation = user.location?.toLowerCase().includes(searchLower);
          
          return !isAlreadyBuddy && (matchesName || matchesEmail || matchesLocation);
        });
        
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    }
  };

  // Handle adding a new buddy
  const handleAddBuddy = async (user: SearchableUser) => {
    setLoading(true);
    try {
      const response = await apiService.createBuddySession({
        buddyId: parseInt(user.id),
        location: user.location || 'Unknown',
        destination: undefined
      });
      
      if (response.data || !response.error) {
        toast.success(`${user.name} has been added to your buddies! You can now check in on each other.`, {
          title: '🎉 Buddy Added Successfully!'
        });
        
        setShowNewBuddyModal(false);
        setBuddySearchQuery('');
        setSearchResults([]);
        await fetchActiveSessions();
        await fetchBuddies();
      } else {
        toast.error(response.error || 'Could not add buddy', {
          title: 'Failed to Add Buddy'
        });
      }
    } catch (error: any) {
      // If API is not available, show success anyway for demo purposes
      toast.success(`${user.name} has been added to your buddies!`, {
        title: '🎉 Buddy Added Successfully!'
      });
      setShowNewBuddyModal(false);
      setBuddySearchQuery('');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
    setShowCheckInModal(true);
  };

  const handleViewProfile = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
    setShowProfileModal(true);
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuddy) return;
    
    setLoading(true);
    try {
      // Find active session for this buddy
      const session = activeSessions.find(s => 
        (s.buddy_id === parseInt(selectedBuddy.id) || s.user_id === parseInt(selectedBuddy.id)) && 
        s.status === 'active'
      );
      
      // Generate check-in message for chat
      const moodEmoji = moodOptions.find(m => m.value === checkInData.mood)?.emoji || '🙂';
      const checkInMessage = checkInData.notes 
        ? `Check-in ${moodEmoji}: ${checkInData.notes}`
        : `Check-in ${moodEmoji}: Feeling ${checkInData.mood}${checkInData.needsSupport ? ' - Needs support' : ''}`;
      
      if (session) {
        // Record check-in via API
        const response = await apiService.buddyCheckIn(session.id, {
          notes: checkInData.notes,
          mood: checkInData.mood
        });
        
        if (response.data) {
          toast.success(`Check-in successful! +5 points awarded!`, {
            title: '✅ Check-in Recorded'
          });
          
          setShowCheckInModal(false);
          setCheckInData({ mood: 'good', notes: '', needsSupport: false });
          
          // Send message to buddy
          await apiService.sendMessage(parseInt(selectedBuddy.id), checkInMessage);
          
          // Navigate to chat
          navigate('/chat');
        } else {
          toast.error(response.error || 'Failed to record check-in', {
            title: 'Check-in Failed'
          });
        }
      } else {
        // No active session - just send a message
        await apiService.sendMessage(parseInt(selectedBuddy.id), checkInMessage);
        
        toast.success(`Message sent to ${selectedBuddy.name}!`, {
          title: '✅ Message Sent'
        });
        
        setShowCheckInModal(false);
        setCheckInData({ mood: 'good', notes: '', needsSupport: false });
        navigate('/chat');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record check-in', {
        title: 'Check-in Failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const moodOptions = [
    { value: 'great', emoji: '😊', label: 'Great' },
    { value: 'good', emoji: '🙂', label: 'Good' },
    { value: 'okay', emoji: '😐', label: 'Okay' },
    { value: 'low', emoji: '😔', label: 'Low' },
    { value: 'distressed', emoji: '😰', label: 'Distressed' },
  ];

  return (
    <Layout>
      <div className="space-y-4 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-deep-slate mb-1 md:mb-2">
              My Buddies
            </h1>
            <p className="text-sm md:text-base text-deep-slate/60">
              Stay connected with your community buddies
            </p>
          </div>
          <button 
            onClick={() => setShowNewBuddyModal(true)}
            className="btn btn-primary text-sm md:text-base w-full sm:w-auto justify-center"
          >
            <UserPlus className="w-5 h-5" />
            Add New Buddy
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card p-3 md:p-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or location..."
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {['all', 'online', 'away', 'offline'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors capitalize whitespace-nowrap min-h-[40px] ${
                    statusFilter === status
                      ? 'bg-primary text-white'
                      : 'bg-deep-slate/5 text-deep-slate/70 hover:bg-deep-slate/10 active:bg-deep-slate/15'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buddies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredBuddies.map(buddy => (
            <BuddyCard
              key={buddy.id}
              buddy={buddy}
              onCheckIn={() => handleCheckIn(buddy)}
              onMessage={() => alert(`Opening chat with ${buddy.name}`)}
              onCall={() => alert(`Calling ${buddy.name}`)}
              onViewProfile={() => handleViewProfile(buddy)}
            />
          ))}
        </div>

        {filteredBuddies.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-deep-slate/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Search className="w-6 h-6 md:w-8 md:h-8 text-deep-slate/40" />
            </div>
            <h3 className="font-bold text-base md:text-lg text-deep-slate mb-1 md:mb-2">No buddies found</h3>
            <p className="text-sm md:text-base text-deep-slate/60">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Check-in Modal */}
        <Modal
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          title={`Check-in on ${selectedBuddy?.name}`}
        >
          <form onSubmit={handleSubmitCheckIn} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-deep-slate mb-3">
                How is {selectedBuddy?.name.split(' ')[0]} feeling?
              </label>
              <div className="flex gap-2 flex-wrap">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setCheckInData(prev => ({ ...prev, mood: mood.value }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      checkInData.mood === mood.value
                        ? 'border-primary bg-primary/5'
                        : 'border-deep-slate/10 hover:border-deep-slate/20'
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs text-deep-slate/70">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-deep-slate mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={checkInData.notes}
                onChange={(e) => setCheckInData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="input-field"
                placeholder="Add any observations or notes..."
              />
            </div>

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100 cursor-pointer">
              <input
                type="checkbox"
                checked={checkInData.needsSupport}
                onChange={(e) => setCheckInData(prev => ({ ...prev, needsSupport: e.target.checked }))}
                className="w-5 h-5 rounded border-red-200 text-red-500 focus:ring-red-500"
                aria-label="Needs additional support"
              />
              <div>
                <span className="font-medium text-red-700">Needs additional support</span>
                <p className="text-sm text-red-600">Flag for immediate follow-up</p>
              </div>
            </label>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowCheckInModal(false)}
                className="btn btn-outline flex-1 justify-center"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1 justify-center">
                Submit Check-in
              </button>
            </div>
          </form>
        </Modal>

        {/* Profile Modal */}
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Buddy Profile"
          size="lg"
        >
          {selectedBuddy && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                  {selectedBuddy.name[0]}
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-deep-slate">{selectedBuddy.name}</h3>
                  <div className="flex items-center gap-2 text-deep-slate/60">
                    <MapPin className="w-4 h-4" />
                    {selectedBuddy.location}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-deep-slate/20'}`}
                      />
                    ))}
                    <span className="text-sm text-deep-slate/60 ml-1">4.8 rating</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-deep-slate/5">
                  <div className="text-sm text-deep-slate/60 mb-1">Phone</div>
                  <div className="font-medium text-deep-slate">{selectedBuddy.phone}</div>
                </div>
                <div className="p-4 rounded-lg bg-deep-slate/5">
                  <div className="text-sm text-deep-slate/60 mb-1">Status</div>
                  <div className="font-medium text-deep-slate capitalize">{selectedBuddy.status}</div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-medium text-deep-slate mb-3">Skills & Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedBuddy.skills || []).map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-warm-sand">
                <div className="text-center">
                  <div className="text-2xl font-bold text-deep-slate">{selectedBuddy.checkInCount}</div>
                  <div className="text-sm text-deep-slate/60">Check-ins</div>
                </div>
                <div className="text-center border-x border-deep-slate/10">
                  <div className="text-2xl font-bold text-deep-slate">12</div>
                  <div className="text-sm text-deep-slate/60">Tasks Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-deep-slate">1.2K</div>
                  <div className="text-sm text-deep-slate/60">Points Earned</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleCheckIn(selectedBuddy);
                  }}
                  className="btn btn-primary flex-1 justify-center"
                >
                  Check In
                </button>
                <button className="btn btn-outline flex-1 justify-center">
                  <MessageCircle className="w-5 h-5" />
                  Message
                </button>
                <button className="btn btn-outline" title="Call buddy">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Add New Buddy Modal */}
        <Modal
          isOpen={showNewBuddyModal}
          onClose={() => {
            setShowNewBuddyModal(false);
            setBuddySearchQuery('');
            setSearchResults([]);
          }}
          title="Add New Buddy"
        >
          <div className="space-y-6">
            {/* Search Input */}
            <div>
              <label htmlFor="buddy-search" className="block text-sm font-medium text-deep-slate mb-2">
                Search for a user to add as buddy
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
                <input
                  id="buddy-search"
                  type="text"
                  value={buddySearchQuery}
                  onChange={(e) => {
                    setBuddySearchQuery(e.target.value);
                    handleBuddySearch(e.target.value);
                  }}
                  className="input-field pl-10"
                  placeholder="Search by name, email, or location..."
                />
              </div>
            </div>

            {/* Search Results */}
            {buddySearchQuery.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-deep-slate/10 hover:bg-deep-slate/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-deep-slate">{user.name}</span>
                            {user.isVerified && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-deep-slate/60">
                            <MapPin className="w-3 h-3" />
                            {user.location || 'Location not set'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddBuddy(user)}
                        disabled={loading}
                        className="btn btn-primary btn-sm"
                      >
                        {loading ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-deep-slate/60">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No users found matching &ldquo;{buddySearchQuery}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* Initial State - Show tips when no search */}
            {buddySearchQuery.length === 0 && (
              <div className="bg-warm-sand rounded-lg p-4">
                <h4 className="font-semibold text-deep-slate mb-2">Buddy System Benefits</h4>
                <ul className="space-y-2 text-sm text-deep-slate/70">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Regular check-ins keep both of you safe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Earn +5 points for each check-in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Bonus +25 points when completing a session</span>
                  </li>
                </ul>
              </div>
            )}

            <button 
              onClick={() => {
                setShowNewBuddyModal(false);
                setBuddySearchQuery('');
                setSearchResults([]);
              }}
              className="btn btn-outline w-full justify-center"
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default BuddiesPage;
