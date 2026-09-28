import {
  User,
  LevelInfo,
  Arc,
  Habit,
  Goal,
  DailyCheckIn,
  JournalEntry,
  Achievement,
  WeeklyReview,
  AppNotification,
  ArcStats
} from '../types/index.js';

const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('winter_arc_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('winter_arc_token', token);
    } else {
      localStorage.removeItem('winter_arc_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async register(data: { email: string; password: string; name: string }) {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async guestLogin() {
    const res = await this.request<{ user: User; token: string }>('/auth/guest', {
      method: 'POST'
    });
    this.setToken(res.token);
    return res;
  }

  async oauthLogin(provider: 'google' | 'apple') {
    const res = await this.request<{ user: User; token: string }>('/auth/oauth', {
      method: 'POST',
      body: JSON.stringify({ provider })
    });
    this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request<{ user: User; levelInfo: LevelInfo }>('/auth/me');
  }

  async updateProfile(updates: Partial<User>) {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // Arcs
  async getArcs() {
    return this.request<{ arcs: Arc[] }>('/arcs');
  }

  async getActiveArc() {
    return this.request<{ arc: Arc | null; stats: ArcStats | null; todayHabits: Habit[] }>('/arcs/active');
  }

  async createArc(data: Partial<Arc>) {
    return this.request<{ arc: Arc }>('/arcs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async setActiveArc(arcId: string) {
    return this.request<{ success: boolean; activeArcId: string }>(`/arcs/${arcId}/active`, {
      method: 'PUT'
    });
  }

  async completeArc(arcId: string, reflections: { reflectionProud: string; reflectionChanged: string; reflectionKeep: string }) {
    return this.request<{ arc: Arc; message: string }>(`/arcs/${arcId}/complete`, {
      method: 'POST',
      body: JSON.stringify(reflections)
    });
  }

  async getTimeline(arcId: string) {
    return this.request<{
      arc: Arc;
      currentWeekNumber: number;
      totalWeeks: number;
      timeline: Array<{
        weekNumber: number;
        title: string;
        dateRange: string;
        status: 'completed' | 'current' | 'upcoming';
        completionsCount: number;
        isFinalWeek: boolean;
      }>;
    }>(`/arcs/${arcId}/timeline`);
  }

  // Habits
  async getHabits(date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.request<{ habits: Habit[] }>(`/habits${query}`);
  }

  async createHabit(habitData: Partial<Habit>) {
    return this.request<{ habit: Habit }>('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData)
    });
  }

  async updateHabit(id: string, updates: Partial<Habit>) {
    return this.request<{ habit: Habit }>(`/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteHabit(id: string) {
    return this.request<{ success: boolean }>(`/habits/${id}`, {
      method: 'DELETE'
    });
  }

  // Completions
  async toggleHabit(habitId: string, date?: string) {
    return this.request<{
      completed: boolean;
      user: { xp: number; level: number; currentStreak: number; longestStreak: number };
      levelInfo: LevelInfo;
      allCompletedToday: boolean;
      bonusXpAwarded: number;
    }>('/completions/toggle', {
      method: 'POST',
      body: JSON.stringify({ habitId, date })
    });
  }

  async getHistory(days = 90) {
    return this.request<{
      heatmap: Array<{ date: string; count: number; level: number; completionRate: number }>;
      totalCompletions: number;
    }>(`/completions/history?days=${days}`);
  }

  async getStats(timeframe: '7' | '30' | 'entire' = '30') {
    return this.request<{
      timeframe: string;
      overallRate: number;
      totalCompletions: number;
      mostConsistentHabit: any;
      hardestHabit: any;
      habitRanking: any[];
      dayStats: Array<{ day: string; completions: number }>;
      trend: Array<{ date: string; rate: number; count: number }>;
    }>(`/completions/stats?timeframe=${timeframe}`);
  }

  // Goals
  async getGoals() {
    return this.request<{ goals: Goal[] }>('/goals');
  }

  async createGoal(data: { title: string; category?: string; targetDate?: string; tasks?: string[] }) {
    return this.request<{ goal: Goal }>('/goals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async toggleGoalTask(taskId: string) {
    return this.request<{ task: any; user: { xp: number; level: number }; levelInfo: LevelInfo }>(
      `/goals/tasks/${taskId}/toggle`,
      { method: 'POST' }
    );
  }

  async deleteGoal(id: string) {
    return this.request<{ success: boolean }>(`/goals/${id}`, {
      method: 'DELETE'
    });
  }

  // Daily Check-in & Journal
  async getTodayCheckIn() {
    return this.request<{ checkIn: DailyCheckIn | null }>('/checkin/today');
  }

  async submitCheckIn(data: { mood: string; productivityScore: number; proudOf: string; improveTomorrow: string }) {
    return this.request<{
      checkIn: DailyCheckIn;
      xpAwarded: number;
      user: { xp: number; level: number; currentStreak: number; longestStreak: number };
      levelInfo: LevelInfo;
      message: string;
    }>('/checkin', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getJournal(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<{ entries: JournalEntry[] }>(`/journal${query}`);
  }

  async getOnThisDay() {
    return this.request<{ memories: JournalEntry[] }>('/journal/on-this-day');
  }

  async createJournalEntry(data: { note: string; mood?: string; title?: string; proudOf?: string; improveTomorrow?: string }) {
    return this.request<{ entry: JournalEntry }>('/journal', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Weekly Reviews
  async getWeeklyReviews() {
    return this.request<{ reviews: WeeklyReview[] }>('/reviews');
  }

  async getCurrentReviewPreview() {
    return this.request<{
      weekNumber: number;
      completionRate: number;
      bestHabit: string;
      difficultHabit: string;
      streak: number;
      suggestions: string[];
    }>('/reviews/current-preview');
  }

  async submitWeeklyReview(data: Partial<WeeklyReview>) {
    return this.request<{ review: WeeklyReview }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Achievements
  async getAchievements() {
    return this.request<{
      achievements: Achievement[];
      unlockedCount: number;
      totalCount: number;
    }>('/achievements');
  }

  // AI Coach
  async askAICoach(message: string, contextType?: string) {
    return this.request<{
      reply: string;
      generatedBy: string;
      context?: any;
    }>('/ai/coach', {
      method: 'POST',
      body: JSON.stringify({ message, contextType })
    });
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: AppNotification[] }>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST'
    });
  }
}

export const api = new ApiService();
