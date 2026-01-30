import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, Plus, CheckCircle2, Clock, AlertCircle,
  MapPin, Calendar, Award
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import TaskCard from '../components/tasks/TaskCard';
import Modal from '../components/ui/Modal';
import { mockBuddies } from '../data/mockData';
import { useTasksStore } from '../store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Task } from '../types';
import apiService from '../services/api';

const TasksPage: React.FC = () => {
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const { tasks, setTasks, addTask, updateTask } = useTasksStore();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'wellness_check',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    points: 50,
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'wellness_check', label: 'Wellness Check' },
    { value: 'supply_delivery', label: 'Supply Delivery' },
    { value: 'emergency_response', label: 'Emergency Response' },
    { value: 'community_event', label: 'Community Event' },
    { value: 'training', label: 'Training' },
  ];

  const statuses = [
    { value: 'all', label: 'All', icon: null },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-500' },
    { value: 'in_progress', label: 'In Progress', icon: AlertCircle, color: 'text-blue-500' },
    { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  ];

  // Check if we should open create task modal from navigation state
  useEffect(() => {
    if (location.state?.openCreateTask) {
      setShowCreateModal(true);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await apiService.getTasks();
        if (response.data) {
          setTasks(response.data.map((task: any) => ({
            id: task.id.toString(),
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            status: task.status,
            points: task.points,
            dueDate: task.due_date,
            assignedTo: task.assigned_to,
            location: task.location,
          })));
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };
    
    loadTasks();
  }, [setTasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiService.createTask({
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        priority: newTask.priority,
        points: newTask.points,
        due_date: newTask.dueDate || undefined,
        assigned_to: newTask.assignedTo || undefined,
        location: undefined,
      });
      
      if (response.error) {
        showToast('error', response.error);
        return;
      }
      
      if (response.data) {
        const newTaskData = {
          id: response.data.id.toString(),
          title: response.data.title,
          description: response.data.description,
          category: response.data.category,
          priority: response.data.priority,
          status: response.data.status,
          points: response.data.points,
          dueDate: response.data.due_date,
          assignedTo: response.data.assigned_to,
          location: response.data.location,
        };
        
        addTask(newTaskData);
        showToast('success', `Task "${newTask.title}" created successfully!`);
        setShowCreateModal(false);
        setNewTask({
          title: '',
          description: '',
          category: 'wellness_check',
          priority: 'medium',
          assignedTo: '',
          dueDate: '',
          points: 50,
        });
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to create task');
    }
  };

  const handleStartTask = async (task: Task) => {
    try {
      const response = await apiService.updateTask(task.id, { status: 'in-progress' });
      
      if (response.error) {
        showToast('error', response.error);
        return;
      }
      
      updateTask(task.id, { status: 'in-progress' });
      showToast('info', `Started task: ${task.title}`);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to start task');
    }
  };

  const handleCompleteTask = async (task: Task) => {
    if (!user) return;
    
    try {
      const response = await apiService.updateTask(task.id, { status: 'completed' });
      
      if (response.error) {
        showToast('error', response.error);
        return;
      }
      
      // Update local state
      updateTask(task.id, { status: 'completed' });
      
      // Update user points (this is handled by the backend)
      const newPoints = (user.points || 0) + task.points;
      updateUser({ points: newPoints });
      
      showToast('success', `Task completed! +${task.points} Bayanihan Points earned!`);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to complete task');
    }
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-deep-slate mb-1 md:mb-2">
              Community Tasks
            </h1>
            <p className="text-sm md:text-base text-deep-slate/60">
              Help your community and earn Bayanihan Points
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-sm md:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Create Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Total Tasks', value: taskStats.total, color: 'bg-deep-slate/5', textColor: 'text-deep-slate' },
            { label: 'Pending', value: taskStats.pending, color: 'bg-yellow-50', textColor: 'text-yellow-600' },
            { label: 'In Progress', value: taskStats.inProgress, color: 'bg-blue-50', textColor: 'text-blue-600' },
            { label: 'Completed', value: taskStats.completed, color: 'bg-green-50', textColor: 'text-green-600' },
          ].map((stat, index) => (
            <div key={index} className={`card p-3 md:p-4 ${stat.color}`}>
              <div className={`text-2xl md:text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
              <div className="text-xs md:text-sm text-deep-slate/60">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-3 md:p-4">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="input-field pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap min-h-[40px] ${
                    statusFilter === status.value
                      ? 'bg-primary text-white'
                      : 'bg-deep-slate/5 text-deep-slate/70 hover:bg-deep-slate/10 active:bg-deep-slate/15'
                  }`}
                >
                  {status.icon && <status.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  {status.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field w-auto"
              title="Filter by category"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={() => handleStartTask(task)}
              onComplete={() => handleCompleteTask(task)}
              onViewDetails={() => setSelectedTask(task)}
            />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-deep-slate/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-deep-slate/40" />
            </div>
            <h3 className="font-bold text-lg text-deep-slate mb-2">No tasks found</h3>
            <p className="text-deep-slate/60">Try adjusting your filters or create a new task</p>
          </div>
        )}

        {/* Create Task Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Task"
          size="lg"
        >
          <form onSubmit={handleCreateTask} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-deep-slate mb-1">
                Task Title
              </label>
              <input
                type="text"
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-deep-slate mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="input-field"
                placeholder="Describe the task..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-deep-slate mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={newTask.category}
                  onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  {categories.filter(c => c.value !== 'all').map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-deep-slate mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-deep-slate mb-1">
                  Assign To
                </label>
                <select
                  id="assignedTo"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select buddy</option>
                  {mockBuddies.map((buddy) => (
                    <option key={buddy.id} value={buddy.id}>{buddy.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-deep-slate mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="points" className="block text-sm font-medium text-deep-slate mb-1">
                Bayanihan Points Reward
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="points"
                  min="10"
                  max="200"
                  step="10"
                  value={newTask.points}
                  onChange={(e) => setNewTask(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 bg-burnt-orange/10 text-burnt-orange px-3 py-1 rounded-lg font-bold">
                  <Award className="w-4 h-4" />
                  {newTask.points}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-outline flex-1 justify-center"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1 justify-center">
                Create Task
              </button>
            </div>
          </form>
        </Modal>

        {/* Task Details Modal */}
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title="Task Details"
          size="lg"
        >
          {selectedTask && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                    selectedTask.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    selectedTask.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-deep-slate">{selectedTask.title}</h3>
                </div>
                <div className="flex items-center gap-1 bg-burnt-orange/10 text-burnt-orange px-3 py-1 rounded-lg font-bold">
                  <Award className="w-5 h-5" />
                  +{selectedTask.points}
                </div>
              </div>

              <p className="text-deep-slate/70">{selectedTask.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-deep-slate/5">
                  <div className="flex items-center gap-2 text-deep-slate/60 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Due Date</span>
                  </div>
                  <div className="font-medium text-deep-slate">{selectedTask.dueDate}</div>
                </div>
                <div className="p-4 rounded-lg bg-deep-slate/5">
                  <div className="flex items-center gap-2 text-deep-slate/60 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Location</span>
                  </div>
                  <div className="font-medium text-deep-slate">{selectedTask.location || 'Not specified'}</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-deep-slate/5">
                <div className="text-sm text-deep-slate/60 mb-2">Status</div>
                <div className="flex items-center gap-2">
                  {selectedTask.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {selectedTask.status === 'in-progress' && <Clock className="w-5 h-5 text-blue-500" />}
                  {selectedTask.status === 'pending' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  <span className="font-medium text-deep-slate capitalize">
                    {selectedTask.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="btn btn-outline flex-1 justify-center"
                >
                  Close
                </button>
                {selectedTask.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStartTask(selectedTask);
                      setSelectedTask(null);
                    }}
                    className="btn btn-primary flex-1 justify-center"
                  >
                    Start Task
                  </button>
                )}
                {selectedTask.status === 'in-progress' && (
                  <button
                    onClick={() => {
                      handleCompleteTask(selectedTask);
                      setSelectedTask(null);
                    }}
                    className="btn btn-primary flex-1 justify-center"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default TasksPage;
