import React, { useState } from 'react';
import { 
  Search, Book, Video, FileText, ExternalLink, Phone, 
  AlertTriangle, Heart, Shield, Download, Share2, Bookmark
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { emergencyHotlines } from '../data/mockData';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'guide' | 'infographic';
  url: string;
  featured?: boolean;
}

const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'resources' | 'hotlines'>('resources');

  const categories = [
    { value: 'all', label: 'All Resources', icon: Book },
    { value: 'disaster', label: 'Disaster Preparedness', icon: AlertTriangle },
    { value: 'health', label: 'Health & Wellness', icon: Heart },
    { value: 'safety', label: 'Safety Tips', icon: Shield },
  ];

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Typhoon Preparedness Guide',
      description: 'Complete guide on preparing your home and family for typhoon season.',
      category: 'disaster',
      type: 'guide',
      url: '#',
      featured: true,
    },
    {
      id: '2',
      title: 'First Aid Basics',
      description: 'Learn essential first aid techniques that could save lives.',
      category: 'health',
      type: 'video',
      url: '#',
      featured: true,
    },
    {
      id: '3',
      title: 'Community Emergency Response',
      description: 'How to organize your community for emergency situations.',
      category: 'safety',
      type: 'article',
      url: '#',
    },
    {
      id: '4',
      title: 'Earthquake Safety',
      description: 'What to do before, during, and after an earthquake.',
      category: 'disaster',
      type: 'infographic',
      url: '#',
    },
    {
      id: '5',
      title: 'Mental Health During Crisis',
      description: 'Managing stress and anxiety during emergency situations.',
      category: 'health',
      type: 'article',
      url: '#',
    },
    {
      id: '6',
      title: 'Flood Safety Measures',
      description: 'Protect your family and property during floods.',
      category: 'disaster',
      type: 'guide',
      url: '#',
    },
    {
      id: '7',
      title: 'Home Safety Checklist',
      description: 'Regular checks to keep your home safe from hazards.',
      category: 'safety',
      type: 'guide',
      url: '#',
    },
    {
      id: '8',
      title: 'CPR Tutorial',
      description: 'Step-by-step guide on performing CPR.',
      category: 'health',
      type: 'video',
      url: '#',
    },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = resources.filter(r => r.featured);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'guide': return FileText;
      case 'infographic': return FileText;
      default: return Book;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-600';
      case 'guide': return 'bg-blue-100 text-blue-600';
      case 'infographic': return 'bg-purple-100 text-purple-600';
      default: return 'bg-green-100 text-green-600';
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-deep-slate mb-1 sm:mb-2">
            Resources & Emergency Info
          </h1>
          <p className="text-sm sm:text-base text-deep-slate/60">
            Stay informed with guides, tips, and emergency contacts
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 sm:gap-4 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap min-h-[44px] ${
              activeTab === 'resources'
                ? 'bg-primary text-white'
                : 'bg-deep-slate/5 text-deep-slate/70 hover:bg-deep-slate/10'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Book className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Resources</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hotlines')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap min-h-[44px] ${
              activeTab === 'hotlines'
                ? 'bg-red-500 text-white'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Emergency Hotlines</span>
            </div>
          </button>
        </div>

        {activeTab === 'resources' ? (
          <>
            {/* Featured Resources */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h2 className="font-bold text-lg sm:text-xl text-deep-slate mb-3 sm:mb-4">Featured Resources</h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {featuredResources.map(resource => {
                  const TypeIcon = getTypeIcon(resource.type);
                  return (
                    <div key={resource.id} className="card p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <TypeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-lg text-deep-slate mb-1 truncate">{resource.title}</h3>
                          <p className="text-sm sm:text-base text-deep-slate/60 mb-3 sm:mb-4 line-clamp-2">{resource.description}</p>
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <a href={resource.url} className="btn btn-primary text-xs sm:text-sm py-2 px-3">
                              View Resource
                              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </a>
                            <button className="p-2 text-deep-slate/40 hover:text-primary transition-colors touch-target" title="Bookmark resource">
                              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button className="p-2 text-deep-slate/40 hover:text-primary transition-colors touch-target" title="Share resource">
                              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card p-3 sm:p-4 mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-deep-slate/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resources..."
                    className="input-field pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap overflow-x-auto hide-scrollbar pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[40px] ${
                        selectedCategory === cat.value
                          ? 'bg-primary text-white'
                          : 'bg-deep-slate/5 text-deep-slate/70 hover:bg-deep-slate/10'
                      }`}
                    >
                      <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredResources.map(resource => {
                const TypeIcon = getTypeIcon(resource.type);
                return (
                  <div key={resource.id} className="card hover:shadow-lg transition-shadow">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg text-xs font-medium ${getTypeColor(resource.type)}`}>
                          <TypeIcon className="w-3 h-3" />
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </div>
                        <button className="p-1.5 text-deep-slate/40 hover:text-primary transition-colors touch-target" title="Bookmark resource">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-deep-slate mb-1 sm:mb-2">{resource.title}</h3>
                      <p className="text-deep-slate/60 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{resource.description}</p>
                      <a 
                        href={resource.url}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium text-sm"
                      >
                        Read More
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-deep-slate/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-deep-slate/40" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-deep-slate mb-1 sm:mb-2">No resources found</h3>
                <p className="text-sm sm:text-base text-deep-slate/60">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        ) : (
          /* Emergency Hotlines */
          <div className="space-y-4 sm:space-y-6">
            {/* Emergency Alert */}
            <div className="card bg-red-50 border-red-200 p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-red-700 mb-1">In Case of Emergency</h3>
                  <p className="text-sm sm:text-base text-red-600">
                    If you or someone you know is in immediate danger, please call the appropriate emergency hotline below.
                  </p>
                </div>
              </div>
            </div>

            {/* Hotlines Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {emergencyHotlines.map((hotline, index) => (
                <a
                  key={index}
                  href={`tel:${hotline.number.replace(/\s/g, '')}`}
                  className="card p-4 sm:p-6 hover:shadow-lg transition-all hover:border-primary group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-deep-slate group-hover:text-primary transition-colors truncate">
                        {hotline.name}
                      </h3>
                      <p className="text-lg sm:text-xl font-bold text-red-600">{hotline.number}</p>
                      {hotline.description && (
                        <p className="text-xs sm:text-sm text-deep-slate/60 mt-0.5 sm:mt-1 line-clamp-1">{hotline.description}</p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Download Section */}
            <div className="card p-4 sm:p-6 bg-deep-slate/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-base sm:text-lg text-deep-slate mb-0.5 sm:mb-1">Download Emergency Card</h3>
                  <p className="text-sm sm:text-base text-deep-slate/60">Save these numbers offline for quick access</p>
                </div>
                <button className="btn btn-primary w-full sm:w-auto justify-center text-sm sm:text-base">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResourcesPage;
