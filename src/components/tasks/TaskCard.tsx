import React from 'react';
import { Task } from '../../types';
import { getPriorityColor, getTaskStatusColor } from '../../utils/helpers';
import { Clock, Award, CheckCircle, Play, Eye } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStart?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStart, onComplete, onViewDetails, compact = false }) => {
  const categoryIcons: Record<string, string> = {
    wellness: '💚',
    logistics: '📦',
    relief: '🎁',
    evacuation: '🚨',
    medical: '🏥',
    wellness_check: '💚',
    supply_delivery: '📦',
    emergency_response: '🚨',
    community_event: '👥',
    training: '📚',
  };

  if (compact) {
    return (
      <div 
        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-deep-slate/5 transition-colors cursor-pointer"
        onClick={() => onViewDetails?.(task)}
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
          {categoryIcons[task.category] || '📋'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-deep-slate text-xs sm:text-sm truncate">{task.title}</h4>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-deep-slate/60">
            <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-0.5 hidden sm:flex">
                <Clock className="w-2.5 h-2.5" />
                {task.dueDate}
              </span>
            )}
          </div>
        </div>
        <span className="flex items-center gap-0.5 text-burnt-orange font-semibold text-[10px] sm:text-xs shrink-0">
          <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          +{task.points}
        </span>
      </div>
    );
  }

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
          {categoryIcons[task.category] || '📋'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-deep-slate">{task.title}</h3>
            <span className={`badge ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
          
          <p className="text-sm text-deep-slate/60 mb-3 line-clamp-2">{task.description}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className={`badge ${getTaskStatusColor(task.status)}`}>
              {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            
            {task.dueDate && (
              <span className="flex items-center gap-1 text-deep-slate/50">
                <Clock className="w-4 h-4" />
                {task.dueDate}
              </span>
            )}
            
            <span className="flex items-center gap-1 text-burnt-orange font-semibold">
              <Award className="w-4 h-4" />
              +{task.points} pts
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {task.status !== 'completed' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
          {task.status === 'pending' && (
            <button
              onClick={() => onStart?.(task)}
              className="flex-1 btn btn-outline text-sm py-2"
            >
              <Play className="w-4 h-4" />
              Start Task
            </button>
          )}
          <button
            onClick={() => onComplete?.(task)}
            className="flex-1 btn btn-primary text-sm py-2"
          >
            <CheckCircle className="w-4 h-4" />
            Complete
          </button>
        </div>
      )}

      {task.status === 'completed' && onViewDetails && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
          <button
            onClick={() => onViewDetails(task)}
            className="flex-1 btn btn-outline text-sm py-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
