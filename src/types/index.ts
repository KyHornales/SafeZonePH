export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  barangay?: string;
  city?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  points: number;
  rank: string;
  skills: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface Buddy {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  riskLevel: 'low' | 'medium' | 'high';
  relationship: string;
  lastCheckIn?: string;
  isVerified: boolean;
  phone?: string;
  location?: string;
  skills?: string[];
  checkInCount?: number;
}

export interface CheckIn {
  id: string;
  buddyId: string;
  buddyName: string;
  mood: 'great' | 'good' | 'okay' | 'struggling' | 'crisis';
  message?: string;
  notes?: string;
  date?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'wellness' | 'logistics' | 'relief' | 'evacuation' | 'medical' | 'wellness_check' | 'supply_delivery' | 'emergency_response' | 'community_event' | 'training';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  points: number;
  dueDate?: string;
  assignedTo?: string;
  location?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
  read?: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  buddyId?: string;
  buddyName?: string;
  buddyAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status?: 'online' | 'offline' | 'away';
  messages: Message[];
}

export interface Notification {
  id: string;
  type: 'check-in' | 'message' | 'task' | 'alert' | 'achievement';
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface PointsHistory {
  id: string;
  type: 'check-in' | 'task' | 'achievement' | 'bonus' | 'task_completed' | 'buddy_added' | 'badge_earned';
  description: string;
  points: number;
  date?: string;
  timestamp: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  content?: string;
}

export interface EmergencyHotline {
  name: string;
  number: string;
  icon?: string;
  description?: string;
}
