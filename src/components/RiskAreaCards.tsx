import React from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Eye,
  ChevronRight,
  Shield,
  AlertCircle,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

interface RiskArea {
  id: string;
  name: string;
  type: 'high_risk' | 'moderate_risk' | 'low_risk' | 'safe_zone';
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  reportsCount: number;
  lastReportedAt: Date;
  incidents: string[];
  safetyTips?: string[];
  verifiedBy?: number;
}

interface RiskAreaCardsProps {
  areas: RiskArea[];
  onSelectArea: (area: RiskArea) => void;
  onReportIncident: (areaId: string) => void;
  onConfirmReport: (areaId: string) => void;
  className?: string;
}

const getRiskStyles = (type: RiskArea['type']) => {
  switch (type) {
    case 'high_risk':
      return {
        bg: 'bg-red-50 border-red-200',
        badge: 'bg-red-500 text-white',
        icon: 'text-red-500',
        label: 'High Risk',
      };
    case 'moderate_risk':
      return {
        bg: 'bg-orange-50 border-orange-200',
        badge: 'bg-orange-500 text-white',
        icon: 'text-orange-500',
        label: 'Moderate Risk',
      };
    case 'low_risk':
      return {
        bg: 'bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-500 text-white',
        icon: 'text-yellow-600',
        label: 'Low Risk',
      };
    case 'safe_zone':
    default:
      return {
        bg: 'bg-green-50 border-green-200',
        badge: 'bg-green-500 text-white',
        icon: 'text-green-500',
        label: 'Safe Zone',
      };
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const RiskAreaCards: React.FC<RiskAreaCardsProps> = ({
  areas,
  onSelectArea,
  onReportIncident,
  onConfirmReport,
  className = '',
}) => {
  // Sort by risk level then by recency
  const sortedAreas = [...areas].sort((a, b) => {
    const riskOrder = { high_risk: 0, moderate_risk: 1, low_risk: 2, safe_zone: 3 };
    const riskDiff = riskOrder[a.type] - riskOrder[b.type];
    if (riskDiff !== 0) return riskDiff;
    return b.lastReportedAt.getTime() - a.lastReportedAt.getTime();
  });

  if (areas.length === 0) {
    return (
      <div className={`card p-8 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-primary/30 mx-auto mb-3" />
        <h3 className="font-semibold text-deep-slate mb-1">No area data</h3>
        <p className="text-sm text-deep-slate/60">
          Help your community by reporting safety information about areas you know.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {sortedAreas.map(area => {
        const styles = getRiskStyles(area.type);

        return (
          <div
            key={area.id}
            className={`border rounded-xl overflow-hidden transition-all hover:shadow-md ${styles.bg}`}
          >
            {/* Header */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => onSelectArea(area)}
            >
              <div className="flex items-start gap-3">
                {/* Risk Icon */}
                <div className={`p-2 rounded-lg ${area.type === 'safe_zone' ? 'bg-green-100' : 'bg-white/50'}`}>
                  {area.type === 'safe_zone' ? (
                    <Shield className={`w-6 h-6 ${styles.icon}`} />
                  ) : (
                    <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-deep-slate truncate">
                      {area.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${styles.badge}`}>
                      {styles.label}
                    </span>
                  </div>

                  <p className="text-sm text-deep-slate/60 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {area.location.address}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-deep-slate/40" />
              </div>

              {/* Description */}
              <p className="text-sm text-deep-slate/70 mt-3 line-clamp-2">
                {area.description}
              </p>

              {/* Incidents Tags */}
              {area.incidents.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {area.incidents.slice(0, 3).map((incident, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white/70 text-deep-slate/70 px-2 py-0.5 rounded-full"
                    >
                      {incident}
                    </span>
                  ))}
                  {area.incidents.length > 3 && (
                    <span className="text-xs text-deep-slate/50">
                      +{area.incidents.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-xs text-deep-slate/60">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {area.reportsCount} reports
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last report: {formatTimeAgo(area.lastReportedAt)}
                </span>
                {area.verifiedBy && area.verifiedBy > 0 && (
                  <span className="flex items-center gap-1 text-green-600">
                    <ThumbsUp className="w-3 h-3" />
                    {area.verifiedBy} verified
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-white/50 border-t border-white flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirmReport(area.id);
                }}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark"
              >
                <ThumbsUp className="w-4 h-4" />
                Confirm
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReportIncident(area.id);
                }}
                className="flex items-center gap-1 text-sm text-deep-slate/60 hover:text-deep-slate"
              >
                <AlertCircle className="w-4 h-4" />
                Report Update
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectArea(area);
                }}
                className="flex items-center gap-1 text-sm text-deep-slate/60 hover:text-deep-slate ml-auto"
              >
                <MessageSquare className="w-4 h-4" />
                Discuss
              </button>
            </div>

            {/* Safety Tips for High Risk */}
            {(area.type === 'high_risk' || area.type === 'moderate_risk') && area.safetyTips && area.safetyTips.length > 0 && (
              <div className="px-4 py-3 bg-white/80 border-t">
                <p className="text-xs font-semibold text-deep-slate mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" />
                  Safety Tips
                </p>
                <ul className="text-xs text-deep-slate/70 space-y-0.5">
                  {area.safetyTips.slice(0, 2).map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RiskAreaCards;
