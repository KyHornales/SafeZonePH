import React, { useState } from 'react';
import { Search, UserPlus, MessageCircle, Phone, MapPin, Star } from 'lucide-react';
import Layout from '../components/layout/Layout';
import BuddyCard from '../components/buddies/BuddyCard';
import Modal from '../components/ui/Modal';
import { mockBuddies } from '../data/mockData';
import { Buddy } from '../types';

const BuddiesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [checkInData, setCheckInData] = useState({
    mood: 'good',
    notes: '',
    needsSupport: false,
  });

  const filteredBuddies = mockBuddies.filter(buddy => {
    const matchesSearch = buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (buddy.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || buddy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
    setShowCheckInModal(true);
  };

  const handleViewProfile = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
    setShowProfileModal(true);
  };

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the backend
    alert(`Check-in recorded for ${selectedBuddy?.name}!`);
    setShowCheckInModal(false);
    setCheckInData({ mood: 'good', notes: '', needsSupport: false });
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
          <button className="btn btn-primary text-sm md:text-base w-full sm:w-auto justify-center">
            <UserPlus className="w-5 h-5" />
            Find New Buddy
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
      </div>
    </Layout>
  );
};

export default BuddiesPage;
