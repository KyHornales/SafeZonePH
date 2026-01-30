import React, { useState } from 'react';
import { 
  Trophy, 
  Star, 
  Shield, 
  Users, 
  Heart,
  Target,
  Zap,
  Award,
  Lock,
  CheckCircle
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'safety' | 'community' | 'helper' | 'explorer' | 'milestone';
  points: number;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface AchievementSystemProps {
  achievements: Achievement[];
  totalPoints: number;
  userLevel: number;
  pointsToNextLevel: number;
  className?: string;
}

const CATEGORY_ICONS = {
  safety: Shield,
  community: Users,
  helper: Heart,
  explorer: Target,
  milestone: Star,
};

const CATEGORY_COLORS = {
  safety: 'text-primary bg-primary/10',
  community: 'text-blue-500 bg-blue-100',
  helper: 'text-pink-500 bg-pink-100',
  explorer: 'text-green-500 bg-green-100',
  milestone: 'text-yellow-500 bg-yellow-100',
};

const RARITY_COLORS = {
  common: 'border-gray-300 bg-gray-50',
  uncommon: 'border-green-300 bg-green-50',
  rare: 'border-blue-300 bg-blue-50',
  epic: 'border-purple-300 bg-purple-50',
  legendary: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50',
};

const RARITY_LABELS = {
  common: { text: 'Common', color: 'text-gray-500' },
  uncommon: { text: 'Uncommon', color: 'text-green-600' },
  rare: { text: 'Rare', color: 'text-blue-600' },
  epic: { text: 'Epic', color: 'text-purple-600' },
  legendary: { text: 'Legendary', color: 'text-yellow-600' },
};

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    trophy: <Trophy className="w-6 h-6" />,
    star: <Star className="w-6 h-6" />,
    shield: <Shield className="w-6 h-6" />,
    users: <Users className="w-6 h-6" />,
    heart: <Heart className="w-6 h-6" />,
    target: <Target className="w-6 h-6" />,
    zap: <Zap className="w-6 h-6" />,
    award: <Award className="w-6 h-6" />,
  };
  return icons[iconName] || <Star className="w-6 h-6" />;
};

const AchievementSystem: React.FC<AchievementSystemProps> = ({
  achievements,
  totalPoints,
  userLevel,
  pointsToNextLevel,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'safety', label: 'Safety' },
    { value: 'community', label: 'Community' },
    { value: 'helper', label: 'Helper' },
    { value: 'explorer', label: 'Explorer' },
    { value: 'milestone', label: 'Milestones' },
  ];

  const filteredAchievements = achievements.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (showUnlockedOnly && !a.isUnlocked) return false;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const levelProgress = ((totalPoints % 1000) / pointsToNextLevel) * 100;

  return (
    <div className={className}>
      {/* Level & Points Header */}
      <div className="card p-4 sm:p-6 mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{userLevel}</span>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-deep-slate">Level {userLevel}</h2>
            <p className="text-sm text-deep-slate/60">
              {totalPoints.toLocaleString()} total points
            </p>
          </div>
          <div className="text-right">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-deep-slate/60">
              {unlockedCount}/{achievements.length}
            </p>
          </div>
        </div>

        {/* Level Progress */}
        <div>
          <div className="flex justify-between text-xs text-deep-slate/60 mb-1">
            <span>Progress to Level {userLevel + 1}</span>
            <span>{pointsToNextLevel - (totalPoints % 1000)} points to go</span>
          </div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-deep-slate/60">
          <input
            type="checkbox"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          Show unlocked only
        </label>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredAchievements.map(achievement => {
          const CategoryIcon = CATEGORY_ICONS[achievement.category];
          const rarityStyle = RARITY_COLORS[achievement.rarity];
          const rarityLabel = RARITY_LABELS[achievement.rarity];

          return (
            <div
              key={achievement.id}
              className={`card border-2 p-4 transition-all ${rarityStyle} ${
                achievement.isUnlocked ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-3 rounded-xl ${CATEGORY_COLORS[achievement.category]} relative`}>
                  {achievement.isUnlocked ? (
                    getIconComponent(achievement.icon)
                  ) : (
                    <Lock className="w-6 h-6 text-deep-slate/40" />
                  )}
                  {achievement.isUnlocked && (
                    <CheckCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`font-semibold truncate ${
                      achievement.isUnlocked ? 'text-deep-slate' : 'text-deep-slate/50'
                    }`}>
                      {achievement.title}
                    </h3>
                  </div>
                  
                  <p className={`text-xs mb-2 ${rarityLabel.color}`}>
                    {rarityLabel.text} • {achievement.points} pts
                  </p>

                  <p className="text-sm text-deep-slate/60 line-clamp-2">
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {!achievement.isUnlocked && achievement.progress > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-deep-slate/50 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked Date */}
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-deep-slate/40 mt-2">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="card p-8 text-center">
          <Trophy className="w-12 h-12 text-deep-slate/20 mx-auto mb-3" />
          <h3 className="font-semibold text-deep-slate mb-1">No achievements found</h3>
          <p className="text-sm text-deep-slate/60">
            Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementSystem;
