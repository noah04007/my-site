export type MoodType = 'Great' | 'Good' | 'Okay' | 'Difficult' | 'Exhausted';
export type ArcIntensity = 'Chill' | 'Balanced' | 'Hardcore';
export type ArcStatus = 'active' | 'completed' | 'paused';
export type HabitFrequency = 'daily' | 'weekdays' | 'custom';
export type ActiveTab = 'home' | 'habits' | 'progress' | 'journal' | 'profile';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  isGuest: boolean;
  createdAt: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  progressPercent: number;
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
  activeDays: number[];
  isPaused: boolean;
  orderIndex: number;
  createdAt: string;
  isCompletedToday?: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  arcId: string;
  date: string;
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
  date: string;
  mood: MoodType;
  productivityScore: number;
  proudOf: string;
  improveTomorrow: string;
  completedAt: string;
}

export interface JournalEntry {
  id: string;
  arcId: string;
  userId: string;
  date: string;
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
  isUnlocked?: boolean;
  unlockedAt?: string | null;
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

export interface ArcStats {
  currentDay: number;
  durationDays: number;
  progressPercent: number;
  currentStreak: number;
  longestStreak: number;
  habitsCompletedToday: number;
  totalHabitsToday: number;
  todayCompletionPercent: number;
  level: number;
  xp: number;
}
