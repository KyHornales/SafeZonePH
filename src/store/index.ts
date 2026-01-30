import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { User, Buddy, Task, CheckIn, Notification } from '../types';

// User Store
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

type UserPersist = (
  config: StateCreator<UserState>,
  options: PersistOptions<UserState>
) => StateCreator<UserState>;

export const useUserStore = create<UserState>()(
  (persist as UserPersist)(
    (set): UserState => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
      updateUser: (updates: Partial<User>) =>
        set((state: UserState) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'safezoneph-user',
    }
  )
);

// Buddies Store
interface BuddiesState {
  buddies: Buddy[];
  selectedBuddy: Buddy | null;
  isLoading: boolean;
  setBuddies: (buddies: Buddy[]) => void;
  addBuddy: (buddy: Buddy) => void;
  updateBuddy: (id: string, updates: Partial<Buddy>) => void;
  removeBuddy: (id: string) => void;
  setSelectedBuddy: (buddy: Buddy | null) => void;
}

export const useBuddiesStore = create<BuddiesState>()((set): BuddiesState => ({
  buddies: [],
  selectedBuddy: null,
  isLoading: false,
  setBuddies: (buddies: Buddy[]) => set({ buddies }),
  addBuddy: (buddy: Buddy) => set((state: BuddiesState) => ({ buddies: [...state.buddies, buddy] })),
  updateBuddy: (id: string, updates: Partial<Buddy>) =>
    set((state: BuddiesState) => ({
      buddies: state.buddies.map((b: Buddy) => (b.id === id ? { ...b, ...updates } : b)),
    })),
  removeBuddy: (id: string) =>
    set((state: BuddiesState) => ({
      buddies: state.buddies.filter((b: Buddy) => b.id !== id),
    })),
  setSelectedBuddy: (buddy: Buddy | null) => set({ selectedBuddy: buddy }),
}));

// Tasks Store
type TaskFilter = 'all' | 'pending' | 'in-progress' | 'completed';

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  filter: TaskFilter;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  setFilter: (filter: TaskFilter) => void;
}

type TasksPersist = (
  config: StateCreator<TasksState>,
  options: PersistOptions<TasksState>
) => StateCreator<TasksState>;

export const useTasksStore = create<TasksState>()(
  (persist as TasksPersist)(
    (set): TasksState => ({
      tasks: [],
      selectedTask: null,
      filter: 'all',
      setTasks: (tasks: Task[]) => set({ tasks }),
      addTask: (task: Task) => set((state: TasksState) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id: string, updates: Partial<Task>) =>
        set((state: TasksState) => ({
          tasks: state.tasks.map((t: Task) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      removeTask: (id: string) =>
        set((state: TasksState) => ({
          tasks: state.tasks.filter((t: Task) => t.id !== id),
        })),
      setSelectedTask: (task: Task | null) => set({ selectedTask: task }),
      setFilter: (filter: TaskFilter) => set({ filter }),
    }),
    {
      name: 'safezoneph-tasks',
    }
  )
);

// Check-ins Store
interface CheckInsState {
  checkIns: CheckIn[];
  addCheckIn: (checkIn: CheckIn) => void;
  getCheckInsByBuddy: (buddyId: string) => CheckIn[];
}

export const useCheckInsStore = create<CheckInsState>()((set, get): CheckInsState => ({
  checkIns: [],
  addCheckIn: (checkIn: CheckIn) => set((state: CheckInsState) => ({ checkIns: [checkIn, ...state.checkIns] })),
  getCheckInsByBuddy: (buddyId: string) => get().checkIns.filter((c: CheckIn) => c.buddyId === buddyId),
}));

// Notifications Store
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set): NotificationsState => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification: Notification) =>
    set((state: NotificationsState) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id: string) =>
    set((state: NotificationsState) => ({
      notifications: state.notifications.map((n: Notification) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state: NotificationsState) => ({
      notifications: state.notifications.map((n: Notification) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  removeNotification: (id: string) =>
    set((state: NotificationsState) => ({
      notifications: state.notifications.filter((n: Notification) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// App Settings Store
type ThemeSetting = 'light' | 'dark' | 'system';
type LanguageSetting = 'en' | 'tl';

interface AppSettingsState {
  theme: ThemeSetting;
  language: LanguageSetting;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  setTheme: (theme: ThemeSetting) => void;
  setLanguage: (language: LanguageSetting) => void;
  toggleNotifications: () => void;
  toggleLocation: () => void;
}

type AppSettingsPersist = (
  config: StateCreator<AppSettingsState>,
  options: PersistOptions<AppSettingsState>
) => StateCreator<AppSettingsState>;

export const useAppSettingsStore = create<AppSettingsState>()(
  (persist as AppSettingsPersist)(
    (set): AppSettingsState => ({
      theme: 'light',
      language: 'en',
      notificationsEnabled: true,
      locationEnabled: false,
      setTheme: (theme: ThemeSetting) => set({ theme }),
      setLanguage: (language: LanguageSetting) => set({ language }),
      toggleNotifications: () =>
        set((state: AppSettingsState) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleLocation: () =>
        set((state: AppSettingsState) => ({ locationEnabled: !state.locationEnabled })),
    }),
    {
      name: 'safezoneph-settings',
    }
  )
);

// Onboarding Store
interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  totalSteps: number;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
}

type OnboardingPersist = (
  config: StateCreator<OnboardingState>,
  options: PersistOptions<OnboardingState>
) => StateCreator<OnboardingState>;

export const useOnboardingStore = create<OnboardingState>()(
  (persist as OnboardingPersist)(
    (set): OnboardingState => ({
      hasCompletedOnboarding: false,
      currentStep: 0,
      totalSteps: 5,
      setHasCompletedOnboarding: (completed: boolean) => set({ hasCompletedOnboarding: completed }),
      setCurrentStep: (step: number) => set({ currentStep: step }),
      nextStep: () => set((state: OnboardingState) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1) })),
      prevStep: () => set((state: OnboardingState) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
      resetOnboarding: () => set({ currentStep: 0, hasCompletedOnboarding: false }),
    }),
    {
      name: 'safezoneph-onboarding',
    }
  )
);
