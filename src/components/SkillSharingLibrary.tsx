import React, { useState } from 'react';

interface SkillContent {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  viewCount: number;
  saveCount: number;
  rating: number;
  createdAt: string;
  tags: string[];
  isSaved: boolean;
}

interface SkillSharingLibraryProps {
  className?: string;
}

const categories = [
  { id: 'water-safety', name: 'Water Safety', icon: '💧', color: 'bg-blue-100 text-blue-700' },
  { id: 'first-aid', name: 'First Aid', icon: '🏥', color: 'bg-red-100 text-red-700' },
  { id: 'solar-power', name: 'Solar Power', icon: '☀️', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'food-preservation', name: 'Food Preservation', icon: '🥫', color: 'bg-green-100 text-green-700' },
  { id: 'communication', name: 'Communication', icon: '📡', color: 'bg-purple-100 text-purple-700' },
  { id: 'shelter', name: 'Emergency Shelter', icon: '🏠', color: 'bg-orange-100 text-orange-700' },
];

const mockContent: SkillContent[] = [
  {
    id: '1',
    title: 'How to Purify Water During Emergencies',
    category: 'water-safety',
    difficulty: 'beginner',
    author: { name: 'Dr. Maria Santos', avatar: '👩‍⚕️', verified: true },
    content: 'Learn 5 effective methods to purify water when clean water is not available. This guide covers boiling, chlorination, solar disinfection (SODIS), filtration, and commercial purification tablets...',
    viewCount: 1234,
    saveCount: 89,
    rating: 4.8,
    createdAt: '3 days ago',
    tags: ['water', 'purification', 'survival', 'essential'],
    isSaved: false,
  },
  {
    id: '2',
    title: 'Basic First Aid: Treating Wounds and Burns',
    category: 'first-aid',
    difficulty: 'beginner',
    author: { name: 'Nurse Juan Reyes', avatar: '👨‍⚕️', verified: true },
    content: 'Step-by-step guide on how to properly clean and dress wounds, treat minor burns, and when to seek professional medical help...',
    mediaType: 'video',
    viewCount: 2567,
    saveCount: 156,
    rating: 4.9,
    createdAt: '1 week ago',
    tags: ['first-aid', 'wounds', 'burns', 'medical'],
    isSaved: true,
  },
  {
    id: '3',
    title: 'Building a DIY Solar Phone Charger',
    category: 'solar-power',
    difficulty: 'intermediate',
    author: { name: 'Engineer Pedro Cruz', avatar: '👨‍🔧', verified: true },
    content: 'Complete guide with materials list and step-by-step instructions to build a portable solar phone charger using commonly available components...',
    mediaType: 'image',
    viewCount: 892,
    saveCount: 67,
    rating: 4.6,
    createdAt: '2 weeks ago',
    tags: ['solar', 'DIY', 'charging', 'power'],
    isSaved: false,
  },
  {
    id: '4',
    title: 'Preserving Food Without Refrigeration',
    category: 'food-preservation',
    difficulty: 'intermediate',
    author: { name: 'Lola Carmen', avatar: '👵', verified: false },
    content: 'Traditional Filipino methods of food preservation including salting, smoking, drying, and fermentation. Perfect for when electricity is unavailable...',
    viewCount: 1456,
    saveCount: 123,
    rating: 4.7,
    createdAt: '5 days ago',
    tags: ['food', 'preservation', 'traditional', 'no-power'],
    isSaved: false,
  },
  {
    id: '5',
    title: 'Emergency Radio Communication Basics',
    category: 'communication',
    difficulty: 'advanced',
    author: { name: 'Ham Radio Club PH', avatar: '📻', verified: true },
    content: 'Learn how to use amateur radio during emergencies, including frequencies to monitor, proper protocols, and how to send distress signals...',
    viewCount: 678,
    saveCount: 45,
    rating: 4.5,
    createdAt: '1 month ago',
    tags: ['radio', 'communication', 'emergency', 'ham-radio'],
    isSaved: false,
  },
];

const SkillSharingLibrary: React.FC<SkillSharingLibraryProps> = ({ className = '' }) => {
  const [content, setContent] = useState<SkillContent[]>(mockContent);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedContent, setSelectedContent] = useState<SkillContent | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const filteredContent = content
    .filter((item) => {
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = !difficultyFilter || item.difficulty === difficultyFilter;
      return matchesCategory && matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.viewCount - a.viewCount;
        case 'recent':
          return 0; // Would sort by date in real implementation
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const toggleSave = (id: string) => {
    setContent(content.map(item =>
      item.id === id ? { ...item, isSaved: !item.isSaved, saveCount: item.isSaved ? item.saveCount - 1 : item.saveCount + 1 } : item
    ));
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const getDifficultyBadge = (difficulty: SkillContent['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Beginner</span>;
      case 'intermediate':
        return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Intermediate</span>;
      case 'advanced':
        return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Advanced</span>;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-deep-slate flex items-center gap-2">
              <span className="text-2xl">📚</span> Skill-Sharing Library
            </h2>
            <p className="text-sm text-gray-500 mt-1">Learn and share disaster preparedness skills</p>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span>✏️</span> Share Your Expertise
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search skills, topics, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Category Navigation */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              !selectedCategory ? 'bg-deep-slate text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id ? cat.color : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(difficultyFilter === diff ? null : diff)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                  difficultyFilter === diff
                    ? 'bg-burnt-orange text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              ▦ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
        : 'space-y-4'
      }>
        {filteredContent.map((item) => {
          const category = getCategoryInfo(item.category);
          
          return viewMode === 'grid' ? (
            // Grid View Card
            <div
              key={item.id}
              onClick={() => setSelectedContent(item)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Media Preview */}
              <div className={`h-32 ${category.color} flex items-center justify-center`}>
                <span className="text-5xl">{category.icon}</span>
                {item.mediaType && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                    {item.mediaType === 'video' ? '🎬 Video' : '📷 Image'}
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${category.color}`}>
                    {category.name}
                  </span>
                  {getDifficultyBadge(item.difficulty)}
                </div>

                <h3 className="font-semibold text-deep-slate line-clamp-2 mb-2">{item.title}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{item.author.avatar}</span>
                  <span className="text-sm text-gray-600">{item.author.name}</span>
                  {item.author.verified && <span className="text-blue-500">✓</span>}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>👁 {item.viewCount}</span>
                    <span>⭐ {item.rating}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      item.isSaved ? 'text-burnt-orange' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {item.isSaved ? '🔖' : '📑'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // List View Card
            <div
              key={item.id}
              onClick={() => setSelectedContent(item)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex gap-4">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg ${category.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl sm:text-3xl">{category.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${category.color}`}>
                      {category.name}
                    </span>
                    {getDifficultyBadge(item.difficulty)}
                  </div>
                  <h3 className="font-semibold text-deep-slate mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span>{item.author.avatar}</span> {item.author.name}
                      </span>
                      <span>👁 {item.viewCount}</span>
                      <span>⭐ {item.rating}</span>
                      <span>{item.createdAt}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(item.id);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        item.isSaved ? 'text-burnt-orange' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {item.isSaved ? '🔖' : '📑'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500">No content found matching your criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setDifficultyFilter(null);
            }}
            className="mt-2 text-primary hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryInfo(selectedContent.category).color}`}>
                      {getCategoryInfo(selectedContent.category).name}
                    </span>
                    {getDifficultyBadge(selectedContent.difficulty)}
                  </div>
                  <h3 className="text-xl font-semibold text-deep-slate">{selectedContent.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedContent.author.avatar}</span>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{selectedContent.author.name}</span>
                    {selectedContent.author.verified && <span className="text-blue-500">✓</span>}
                  </div>
                  <span className="text-sm text-gray-500">{selectedContent.createdAt}</span>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none mb-4">
                <p className="text-gray-700">{selectedContent.content}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedContent.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 py-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <span>👁</span>
                  <span className="text-sm text-gray-600">{selectedContent.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="text-sm text-gray-600">{selectedContent.rating} rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔖</span>
                  <span className="text-sm text-gray-600">{selectedContent.saveCount} saves</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleSave(selectedContent.id)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    selectedContent.isSaved
                      ? 'bg-burnt-orange/10 text-burnt-orange'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedContent.isSaved ? '🔖 Saved' : '📑 Save'}
                </button>
                <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  📤 Share
                </button>
                <button className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  💬 Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Expertise Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-deep-slate">Share Your Expertise</h3>
              <p className="text-sm text-gray-500 mt-1">Help the community by sharing your knowledge</p>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter a descriptive title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <div className="flex gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  rows={6}
                  placeholder="Share your knowledge in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Media (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <span className="text-3xl mb-2 block">📸</span>
                  <p className="text-sm text-gray-500">Click or drag to upload images/videos</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="Add tags separated by commas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Preview
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSharingLibrary;
