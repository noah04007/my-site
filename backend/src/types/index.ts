export type MoodType = 'Great' | 'Good' | 'Okay' | 'Difficult' | 'Exhausted';
export type ArcIntensity = 'Chill' | 'Balanced' | 'Hardcore';
export type ArcStatus = 'active' | 'completed' | 'paused';
export type HabitFrequency = 'daily' | 'weekdays' | 'custom';

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Arc {
  id: string;
  userId: string;
  title: string;
  seasonName: string;
  durationDays: number;
  intensity: ArcIntensity;
  mainGoal: string;
  categories: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: ArcStatus;
  reflectionProud?: string;
  reflectionChanged?: string;
  reflectionKeep?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  arcId: string;
  userId: string;
  name: string;
  icon: string;
  category: string;
  frequency: HabitFrequency;
  targetTime?: string;
  daysPerWeek: number;
  activeDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  isPaused: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  arcId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
  note?: string;
}

export interface GoalTask {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface Goal {
  id: string;
  arcId: string;
  userId: string;
  title: string;
  category: string;
  targetDate?: string;
  progressPercent: number;
  isCompleted: boolean;
  createdAt: string;
  tasks: GoalTask[];
}

export interface DailyCheckIn {
  id: string;
  arcId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  productivityScore: number; // 1-10
  proudOf: string;
  improveTomorrow: string;
  completedAt: string;
}

export interface JournalEntry {
  id: string;
  arcId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood?: MoodType;
  productivityScore?: number;
  title?: string;
  proudOf?: string;
  improveTomorrow?: string;
  note: string;
  habitsCompletedCount: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement?: Achievement;
}

export interface WeeklyReview {
  id: string;
  arcId: string;
  userId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  completionRate: number;
  bestHabit: string;
  difficultHabit: string;
  streak: number;
  nextWeekGoal?: string;
  suggestions: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'streak' | 'achievement' | 'weekly_review' | 'system';
  isRead: boolean;
  scheduledTime?: string;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
