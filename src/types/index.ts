// TaskMaster Pro - TypeScript Types

// ============ User Types ============
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  xp: number;
  level: number;
  streakCurrent: number;
  streakBest: number;
  lastActivityDate?: Date;
  achievements: string[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  pomodoroWork: number;
  pomodoroBreak: number;
  pomodoroLong: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

// ============ Task Types ============
export type TaskStatus = 'inbox' | 'todo' | 'doing' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  order: number;
}

export interface Reminder {
  remindAt: Date;
  sent: boolean;
}

export interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
}

export interface Task {
  id: string;
  ownerId: string;
  projectId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  dueTime?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags: string[];
  position: string;
  subtasks: Subtask[];
  reminders: Reminder[];
  recurring?: RecurringRule;
  pomodorosUsed: number;
  notes?: string;
  completedAt?: Date;
  deletedAt?: Date;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  dueTime?: string;
  estimatedMinutes?: number;
  projectId?: string;
  tags?: string[];
  recurring?: RecurringRule;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  dueTime?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  projectId?: string;
  tags?: string[];
  position?: string;
  subtasks?: Subtask[];
  recurring?: RecurringRule;
  notes?: string;
}

// ============ Project Types ============
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
  deadline?: Date;
  status: ProjectStatus;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectInput {
  name: string;
  emoji: string;
  color: string;
  description?: string;
  deadline?: Date;
}

// ============ Tag Types ============
export interface Tag {
  id: string;
  ownerId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Auth Types ============
export interface LoginInput {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  username: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: UserWithoutPassword;
    accessToken: string;
  };
  error?: string;
  message?: string;
}

// ============ Analytics Types ============
export interface AnalyticsSummary {
  todayCompleted: number;
  todayTotal: number;
  weekCompleted: number;
  streakCurrent: number;
  totalXP: number;
  level: number;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface WeeklyData {
  date: string;
  completed: number;
}

export interface PriorityData {
  priority: TaskPriority;
  count: number;
}

// ============ API Response Types ============
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// ============ Notification Types ============
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ============ Achievement Types ============
export interface Achievement {
  id: string;
  label: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

// ============ Gamification ============
export const XP_LEVELS = [0, 500, 1500, 3500, 7000, 12000, 20000, 32000, 50000, 75000, 100000];

export const XP_REWARDS = {
  low: 10,
  medium: 25,
  high: 50,
  urgent: 100,
} as const;

export const ACHIEVEMENTS = [
  { id: 'first_task', label: 'Premier Pas', icon: '🎯' },
  { id: 'streak_7', label: 'Série de 7 jours', icon: '🔥' },
  { id: 'streak_30', label: 'Mois parfait', icon: '⚡' },
  { id: 'tasks_100', label: 'Centenaire', icon: '💯' },
  { id: 'tasks_10_day', label: 'Productivité Max', icon: '🚀' },
  { id: 'level_5', label: 'Expert', icon: '🏆' },
  { id: 'pomodoro_25', label: 'Maître Focus', icon: '🎯' },
  { id: 'urgent_5', label: 'Pompier', icon: '🚒' },
  { id: 'early_10', label: 'Ponctuel', icon: '⏰' },
  { id: 'night_owl', label: 'Oiseau de nuit', icon: '🦉' },
] as const;

export type AchievementId = typeof ACHIEVEMENTS[number]['id'];
