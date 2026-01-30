import React, { useState } from 'react';
import { 
  Search, Plus, Heart, ChevronLeft, ChevronRight, ArrowLeft,
  Droplets, Zap, Activity, Package, Radio, X, Upload, Check
} from 'lucide-react';
import Layout from '../components/layout/Layout';

interface Tip {
  id: string;
  title: string;
  description: string;
  category: string;
  author: {
    name: string;
    role: string;
    verified: boolean;
    avatar?: string;
  };
  likes: number;
}

interface ShareTipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: 'water', label: 'Water Safety', icon: Droplets },
  { id: 'solar', label: 'Solar Power', icon: Zap },
  { id: 'first-aid', label: 'First Aid', icon: Activity },
  { id: 'emergency-kits', label: 'Emergency Kits', icon: Package },
  { id: 'food', label: 'Food Preservation', icon: Package },
  { id: 'communication', label: 'Communication', icon: Radio },
];

const mockTips: Tip[] = [
  {
    id: '1',
    title: 'How to purify rainwater for non-drinking use',
    description: 'Using a layered filtration system with sand and charcoal can make rainwater safe for washing and irrigation during water shortages.',
    category: 'Water Safety',
    author: { name: 'Elena Cruz', role: 'Community Expert', verified: true },
    likes: 45,
  },
  {
    id: '2',
    title: 'DIY Portable Solar Charger from Old Panels',
    description: "Don't throw away small electronic solar panels. With a simple voltage regulator, you can build a reliable emergency phone charger.",
    category: 'Solar Power',
    author: { name: 'Marc Santos', role: 'Tech Enthusiast', verified: true },
    likes: 128,
  },
  {
    id: '3',
    title: 'Natural antiseptics when supplies run low',
    description: 'Understanding which local herbs can act as temporary antibacterial agents can be a lifesaver when medical kits are depleted.',
    category: 'First Aid',
    author: { name: 'Sarah Lim', role: 'Registered Nurse', verified: true },
    likes: 89,
  },
  {
    id: '4',
    title: 'Securing heavy furniture on a budget',
    description: 'Using simple nylon straps and heavy-duty anchors to prevent wardrobes from tipping during seismic events.',
    category: 'Emergency Kits',
    author: { name: 'David Tan', role: 'Civil Engineer', verified: true },
    likes: 56,
  },
  {
    id: '5',
    title: 'Pickling garden surplus without power',
    description: 'Basic fermentation techniques that require only salt and glass jars to extend the life of your homegrown vegetables.',
    category: 'Food Preservation',
    author: { name: 'Maria Garcia', role: 'Home Cook', verified: true },
    likes: 212,
  },
  {
    id: '6',
    title: 'Using Ham Radio basics for area updates',
    description: 'How to tune into local emergency frequencies when cellular networks are congested or completely offline.',
    category: 'Communication',
    author: { name: 'Roberto Ramos', role: 'Radio Operator', verified: true },
    likes: 74,
  },
];

const ShareTipModal: React.FC<ShareTipModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showName, setShowName] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title || !content) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setCategory('');
    setTitle('');
    setContent('');
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-deep-slate/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-warm-sand w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {showSuccess ? (
          <>
            <div className="px-6 sm:px-8 pt-6 flex justify-end">
              <button 
                onClick={handleClose}
                className="text-deep-slate/40 hover:text-deep-slate transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="px-8 sm:px-10 pb-10 sm:pb-12 pt-4 flex flex-col items-center text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Tip Successfully Published!</h2>
              <p className="text-base sm:text-lg text-deep-slate leading-relaxed mb-8">
                Thank you for sharing your expertise. Your tip is now live in the Skill-Sharing Library and helping your neighbors build resilience.
              </p>
              <button 
                onClick={handleClose}
                className="w-full btn-primary py-4 font-bold flex items-center justify-center gap-2"
              >
                <span>Back to Library</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-deep-slate/5">
              <h2 className="text-primary text-xl sm:text-2xl font-bold">Share Your Expertise</h2>
              <button 
                onClick={handleClose}
                className="text-deep-slate/40 hover:text-deep-slate transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label htmlFor="tip-category" className="block text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="tip-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full input-field py-3 pr-10 appearance-none text-sm sm:text-base"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary rotate-90 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="tip-title" className="block text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider">
                  Catchy Title
                </label>
                <input
                  id="tip-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., '3 ways to store water safely'"
                  className="w-full input-field py-3 text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tip-content" className="block text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider">
                  The Detailed Tip
                </label>
                <div className="relative">
                  <textarea
                    id="tip-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share the steps, tools, and expertise needed..."
                    className="w-full input-field py-3 text-sm sm:text-base resize-none"
                    rows={6}
                    maxLength={2000}
                    required
                  />
                  <div className="absolute bottom-3 right-4 text-[10px] font-bold text-deep-slate/40 uppercase tracking-wider">
                    {content.length} / 2000 characters
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider" id="visual-upload-label">
                  Supporting Visuals
                </span>
                <div 
                  className="border-2 border-dashed border-primary/30 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center bg-white/30 hover:bg-white/50 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-labelledby="visual-upload-label"
                >
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-2" />
                  <p className="text-sm font-medium text-deep-slate">Drag and drop a photo or diagram</p>
                  <p className="text-xs text-deep-slate/50 mt-1">PNG, JPG or PDF (max. 10MB)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="showName"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                  className="w-5 h-5 rounded border-none text-primary focus:ring-primary/40 shadow-sm"
                />
                <label htmlFor="showName" className="text-sm font-medium text-deep-slate">
                  Show my name and verified badge
                </label>
              </div>
            </form>

            <div className="px-6 sm:px-8 py-4 sm:py-6 bg-white/40 flex items-center justify-between border-t border-deep-slate/5">
              <button 
                type="button"
                onClick={handleClose}
                className="text-deep-slate text-sm font-bold hover:underline"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!category || !title || !content || isSubmitting}
                className="btn-primary px-6 sm:px-8 py-3 font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <span>Publish Tip</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SkillSharingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);

  const filteredTips = mockTips.filter(tip =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    return 'bg-primary/10 text-primary';
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <button className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline self-start">
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </button>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-primary">
                Skill-Sharing Library
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-deep-slate/60 mt-2 sm:mt-3 max-w-2xl">
                Learn from your neighbors. Explore tips, tricks, and expertise shared by the SafeZonePH community.
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for tips or skills"
              className="w-full input-field pl-12 py-3 sm:py-4 text-sm sm:text-base"
            />
          </div>
          <button 
            onClick={() => setShowShareModal(true)}
            className="btn-primary flex items-center justify-center gap-2 py-3 sm:py-4 px-6 sm:px-8"
          >
            <Plus className="w-5 h-5" />
            <span>Share a Tip</span>
          </button>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredTips.map((tip) => (
            <div 
              key={tip.id}
              className="card p-4 sm:p-6 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {/* Category Badge */}
              <div className="flex mb-3 sm:mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${getCategoryColor(tip.category)}`}>
                  {tip.category}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base sm:text-lg lg:text-xl font-bold leading-tight mb-2 sm:mb-3">
                {tip.title}
              </h3>
              <p className="text-xs sm:text-sm text-deep-slate/60 mb-4 sm:mb-6 line-clamp-2 flex-grow">
                {tip.description}
              </p>

              {/* Author Info */}
              <div className="pt-4 sm:pt-6 border-t border-deep-slate/5 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs sm:text-sm font-bold">
                    {tip.author.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">{tip.author.name}</span>
                      {tip.author.verified && (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-burnt-orange" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[10px] text-deep-slate/50">{tip.author.role}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 sm:mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-deep-slate/50">
                  <Heart className="w-4 h-4 text-burnt-orange" />
                  {tip.likes} Likes
                </div>
                <button className="text-burnt-orange text-xs sm:text-sm font-bold hover:underline">
                  Read Full Tip
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTips.length === 0 && (
          <div className="card p-12 text-center">
            <Search className="w-12 h-12 text-deep-slate/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-deep-slate mb-2">No tips found</h3>
            <p className="text-deep-slate/60">Try adjusting your search or share a new tip!</p>
          </div>
        )}

        {/* Pagination */}
        {filteredTips.length > 0 && (
          <div className="flex justify-center gap-2 mt-8 sm:mt-12 lg:mt-16">
            <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-primary hover:bg-primary hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-burnt-orange text-white shadow-md'
                    : 'bg-white shadow-sm text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-primary hover:bg-primary hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Share Tip Modal */}
      <ShareTipModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </Layout>
  );
};

export default SkillSharingPage;
