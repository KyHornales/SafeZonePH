export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)}, ${formatTime(dateString)}`;
};

export const timeAgo = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Import rank tiers for progress calculation
const rankTiers = [
  { name: 'Bagong Kaibigan', minPoints: 0, maxPoints: 249 },
  { name: 'Kapit-Bisig Helper', minPoints: 250, maxPoints: 749 },
  { name: 'Kapit-Bisig Hero', minPoints: 750, maxPoints: 1499 },
  { name: 'Bayanihan Pillar', minPoints: 1500, maxPoints: 2999 },
  { name: 'Community Guardian', minPoints: 3000, maxPoints: 10000 },
];

export const getRankProgress = (points: number, currentRankName: string): { current: number; next: number; percentage: number } => {
  const currentTierIndex = rankTiers.findIndex(t => t.name === currentRankName);
  const currentTier = rankTiers[currentTierIndex] || rankTiers[0];
  const nextTier = rankTiers[currentTierIndex + 1] || currentTier;
  
  const range = currentTier.maxPoints - currentTier.minPoints;
  const progress = points - currentTier.minPoints;
  const percentage = Math.min(Math.round((progress / range) * 100), 100);
  
  return {
    current: currentTier.minPoints,
    next: nextTier.minPoints,
    percentage,
  };
};

export const getMoodEmoji = (mood: string): string => {
  const moods: Record<string, string> = {
    great: '😊',
    good: '🙂',
    okay: '😐',
    struggling: '😔',
    crisis: '😰',
  };
  return moods[mood] || '😐';
};

export const getMoodColor = (mood: string): string => {
  const colors: Record<string, string> = {
    great: 'text-green-600 bg-green-100',
    good: 'text-blue-600 bg-blue-100',
    okay: 'text-yellow-600 bg-yellow-100',
    struggling: 'text-orange-600 bg-orange-100',
    crisis: 'text-red-600 bg-red-100',
  };
  return colors[mood] || 'text-gray-600 bg-gray-100';
};

export const getRiskLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };
  return colors[status] || 'bg-gray-400';
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };
  return colors[priority] || 'bg-gray-100 text-gray-700';
};

export const getTaskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};
