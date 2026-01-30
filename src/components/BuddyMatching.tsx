import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Shield, 
  Clock,
  ChevronRight,
  X,
  Heart,
  CheckCircle
} from 'lucide-react';

interface Buddy {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  distance: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isOnline: boolean;
  bio: string;
  skills: string[];
  availability: string;
  matchScore?: number;
}

interface BuddyMatchingProps {
  buddies: Buddy[];
  onSelectBuddy: (buddy: Buddy) => void;
  onRequestBuddy: (buddyId: string) => void;
  currentUserLocation?: string;
  className?: string;
}

const FILTER_SKILLS = [
  'Walking Companion',
  'Errand Helper',
  'Night Safety',
  'Transportation',
  'Emergency Response',
  'First Aid',
  'Local Guide',
];

const BuddyMatching: React.FC<BuddyMatchingProps> = ({
  buddies,
  onSelectBuddy,
  onRequestBuddy,
  currentUserLocation = 'Your Location',
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    onlineOnly: false,
    maxDistance: 50,
    minRating: 0,
    skills: [] as string[],
  });
  const [sortBy, setSortBy] = useState<'match' | 'distance' | 'rating'>('match');

  // Filter and sort buddies
  const filteredBuddies = useMemo(() => {
    let result = buddies.filter(buddy => {
      // Search filter
      if (searchQuery && !buddy.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Verified filter
      if (filters.verifiedOnly && !buddy.isVerified) {
        return false;
      }
      // Online filter
      if (filters.onlineOnly && !buddy.isOnline) {
        return false;
      }
      // Distance filter
      if (buddy.distance > filters.maxDistance) {
        return false;
      }
      // Rating filter
      if (buddy.rating < filters.minRating) {
        return false;
      }
      // Skills filter
      if (filters.skills.length > 0) {
        const hasMatchingSkill = filters.skills.some(skill => 
          buddy.skills.includes(skill)
        );
        if (!hasMatchingSkill) return false;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'match':
        default:
          return (b.matchScore || 0) - (a.matchScore || 0);
      }
    });

    return result;
  }, [buddies, searchQuery, filters, sortBy]);

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const clearFilters = () => {
    setFilters({
      verifiedOnly: false,
      onlineOnly: false,
      maxDistance: 50,
      minRating: 0,
      skills: [],
    });
  };

  const activeFiltersCount = 
    (filters.verifiedOnly ? 1 : 0) +
    (filters.onlineOnly ? 1 : 0) +
    (filters.maxDistance < 50 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    filters.skills.length;

  return (
    <div className={className}>
      {/* Search and Filter Bar */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
              placeholder="Search buddies by name..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-outline flex items-center gap-2 relative ${
              showFilters ? 'bg-primary/10 border-primary' : ''
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-burnt-orange text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-deep-slate/60">Sort by:</span>
          <div className="flex gap-1">
            {[
              { value: 'match', label: 'Best Match' },
              { value: 'distance', label: 'Nearest' },
              { value: 'rating', label: 'Top Rated' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as typeof sortBy)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-deep-slate">Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Toggle Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters(f => ({ ...f, verifiedOnly: !f.verifiedOnly }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.verifiedOnly
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              Verified Only
            </button>
            <button
              onClick={() => setFilters(f => ({ ...f, onlineOnly: !f.onlineOnly }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.onlineOnly
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${filters.onlineOnly ? 'bg-white' : 'bg-green-500'}`} />
              Online Now
            </button>
          </div>

          {/* Distance Slider */}
          <div>
            <label className="block text-sm font-medium text-deep-slate mb-2">
              Max Distance: {filters.maxDistance} km
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.maxDistance}
              onChange={(e) => setFilters(f => ({ ...f, maxDistance: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-deep-slate mb-2">
              Minimum Rating
            </label>
            <div className="flex gap-1">
              {[0, 3, 4, 4.5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFilters(f => ({ ...f, minRating: rating }))}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                    filters.minRating === rating
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
                  }`}
                >
                  {rating === 0 ? 'Any' : (
                    <>
                      <Star className="w-3 h-3 fill-current" />
                      {rating}+
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="block text-sm font-medium text-deep-slate mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {FILTER_SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filters.skills.includes(skill)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-deep-slate/60 mb-3">
        {filteredBuddies.length} {filteredBuddies.length === 1 ? 'buddy' : 'buddies'} found near {currentUserLocation}
      </div>

      {/* Buddy List */}
      <div className="space-y-3">
        {filteredBuddies.length === 0 ? (
          <div className="card p-8 text-center">
            <Search className="w-12 h-12 text-deep-slate/20 mx-auto mb-3" />
            <h3 className="font-semibold text-deep-slate mb-1">No buddies found</h3>
            <p className="text-sm text-deep-slate/60">
              Try adjusting your filters or search in a different area.
            </p>
          </div>
        ) : (
          filteredBuddies.map(buddy => (
            <div
              key={buddy.id}
              className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectBuddy(buddy)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {buddy.avatar ? (
                      <img src={buddy.avatar} alt={buddy.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {buddy.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {buddy.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-deep-slate truncate">{buddy.name}</h3>
                    {buddy.isVerified && (
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-deep-slate/60 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {buddy.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {buddy.rating.toFixed(1)} ({buddy.reviewCount})
                    </span>
                  </div>

                  <p className="text-sm text-deep-slate/60 mt-1 line-clamp-1">
                    {buddy.bio}
                  </p>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {buddy.skills.slice(0, 3).map(skill => (
                      <span
                        key={skill}
                        className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {buddy.skills.length > 3 && (
                      <span className="text-xs text-deep-slate/40">
                        +{buddy.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score & Action */}
                <div className="flex flex-col items-end gap-2">
                  {buddy.matchScore && (
                    <div className="flex items-center gap-1 text-sm">
                      <Heart className="w-4 h-4 text-burnt-orange" />
                      <span className="font-semibold text-burnt-orange">{buddy.matchScore}%</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestBuddy(buddy.id);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Request
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuddyMatching;
