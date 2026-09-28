import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Arc,
  Habit,
  HabitCompletion,
  Goal,
  GoalTask,
  DailyCheckIn,
  JournalEntry,
  Achievement,
  UserAchievement,
  WeeklyReview,
  AppNotification
} from '../types/index.js';

interface DatabaseSchema {
  users: User[];
  arcs: Arc[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  goals: Goal[];
  goalTasks: GoalTask[];
  dailyCheckIns: DailyCheckIn[];
  journalEntries: JournalEntry[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  weeklyReviews: WeeklyReview[];
  notifications: AppNotification[];
}

function resolveDbPath(): string {
  if (process.env.DATABASE_FILE) {
    return path.resolve(process.env.DATABASE_FILE);
  }
  const candidate1 = path.resolve(process.cwd(), '../database/store.json');
  if (fs.existsSync(candidate1)) return candidate1;

  const candidate2 = path.resolve(process.cwd(), 'database/store.json');
  if (fs.existsSync(candidate2)) return candidate2;

  if (fs.existsSync(path.resolve(process.cwd(), 'database'))) {
    return path.resolve(process.cwd(), 'database/store.json');
  }
  if (fs.existsSync(path.resolve(process.cwd(), '../database'))) {
    return path.resolve(process.cwd(), '../database/store.json');
  }

  return path.resolve(process.cwd(), 'store.json');
}

const DB_PATH = resolveDbPath();

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    code: 'FIRST_STEP',
    title: 'First Step',
    description: 'Complete your first day of your Winter Arc.',
    icon: '🌱',
    category: 'consistency',
    xpReward: 100
  },
  {
    id: 'ach-2',
    code: '7_DAYS_STRONG',
    title: '7 Days Strong',
    description: 'Complete 7 days with relentless consistency.',
    icon: '🔥',
    category: 'streak',
    xpReward: 250
  },
  {
    id: 'ach-3',
    code: 'CONSISTENT',
    title: 'Consistent',
    description: 'Complete 30 days of deliberate self-mastery.',
    icon: '💪',
    category: 'streak',
    xpReward: 500
  },
  {
    id: 'ach-4',
    code: 'BOOKWORM',
    title: 'Bookworm',
    description: 'Complete 10 reading sessions.',
    icon: '📚',
    category: 'mind',
    xpReward: 200
  },
  {
    id: 'ach-5',
    code: 'SLEEP_RESET',
    title: 'Sleep Reset',
    description: 'Complete your sleep habit consistently.',
    icon: '🌙',
    category: 'recovery',
    xpReward: 200
  },
  {
    id: 'ach-6',
    code: 'MOVING',
    title: 'Moving',
    description: 'Complete 20 workout or walking sessions.',
    icon: '🏃',
    category: 'fitness',
    xpReward: 300
  },
  {
    id: 'ach-7',
    code: 'GOAL_GETTER',
    title: 'Goal Getter',
    description: 'Complete your first major goal.',
    icon: '🎯',
    category: 'transformation',
    xpReward: 350
  },
  {
    id: 'ach-8',
    code: 'ARC_COMPLETE',
    title: 'Arc Complete',
    description: 'Finished your full Winter Arc transformation.',
    icon: '🏆',
    category: 'transcendence',
    xpReward: 1000
  }
];

export class Database {
  private data: DatabaseSchema;
  private filePath: string;

  constructor(filePath = DB_PATH) {
    this.filePath = filePath;
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.achievements || parsed.achievements.length === 0) {
          parsed.achievements = INITIAL_ACHIEVEMENTS;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing store, creating fresh store', e);
    }

    const defaultData: DatabaseSchema = {
      users: [],
      arcs: [],
      habits: [],
      habitCompletions: [],
      goals: [],
      goalTasks: [],
      dailyCheckIns: [],
      journalEntries: [],
      achievements: INITIAL_ACHIEVEMENTS,
      userAchievements: [],
      weeklyReviews: [],
      notifications: []
    };

    this.save(defaultData);
    return defaultData;
  }

  public save(customData?: DatabaseSchema): void {
    const toSave = customData || this.data;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  // Helper for XP and Levels
  public calculateLevel(xp: number): { level: number; title: string; minXp: number; nextLevelXp: number; progressPercent: number } {
    const tiers = [
      { level: 1, title: 'Beginning', minXp: 0, nextLevelXp: 200 },
      { level: 2, title: 'Getting Started', minXp: 200, nextLevelXp: 500 },
      { level: 3, title: 'Consistent', minXp: 500, nextLevelXp: 1000 },
      { level: 4, title: 'Disciplined', minXp: 1000, nextLevelXp: 1800 },
      { level: 5, title: 'Unstoppable', minXp: 1800, nextLevelXp: 3000 },
      { level: 6, title: 'Transformed', minXp: 3000, nextLevelXp: 5000 },
      { level: 7, title: 'Ascended', minXp: 5000, nextLevelXp: 10000 }
    ];

    let currentTier = tiers[0];
    for (const tier of tiers) {
      if (xp >= tier.minXp) {
        currentTier = tier;
      } else {
        break;
      }
    }

    const span = currentTier.nextLevelXp - currentTier.minXp;
    const progress = Math.min(100, Math.max(0, Math.round(((xp - currentTier.minXp) / span) * 100)));

    return {
      level: currentTier.level,
      title: currentTier.title,
      minXp: currentTier.minXp,
      nextLevelXp: currentTier.nextLevelXp,
      progressPercent: progress
    };
  }

  public addXp(userId: string, amount: number): { newXp: number; level: number; levelTitle: string; leveledUp: boolean } {
    const user = this.findUserById(userId);
    if (!user) return { newXp: 0, level: 1, levelTitle: 'Beginning', leveledUp: false };

    const oldLevel = user.level;
    user.xp = (user.xp || 0) + amount;
    const levelInfo = this.calculateLevel(user.xp);
    user.level = levelInfo.level;
    const leveledUp = user.level > oldLevel;
    this.save();

    return {
      newXp: user.xp,
      level: user.level,
      levelTitle: levelInfo.title,
      leveledUp
    };
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.users[idx];
  }

  // Arcs
  public getArcs(userId: string): Arc[] {
    return this.data.arcs.filter(a => a.userId === userId);
  }

  public getActiveArc(userId: string): Arc | undefined {
    return this.data.arcs.find(a => a.userId === userId && a.isActive);
  }

  public getArcById(id: string): Arc | undefined {
    return this.data.arcs.find(a => a.id === id);
  }

  public createArc(arc: Arc): Arc {
    // If setting active, deactivate existing ones
    if (arc.isActive) {
      this.data.arcs.forEach(a => {
        if (a.userId === arc.userId) a.isActive = false;
      });
    }
    this.data.arcs.push(arc);
    this.save();
    return arc;
  }

  public updateArc(id: string, updates: Partial<Arc>): Arc | undefined {
    const idx = this.data.arcs.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    if (updates.isActive) {
      const userId = this.data.arcs[idx].userId;
      this.data.arcs.forEach(a => {
        if (a.userId === userId && a.id !== id) a.isActive = false;
      });
    }
    this.data.arcs[idx] = { ...this.data.arcs[idx], ...updates };
    this.save();
    return this.data.arcs[idx];
  }

  // Habits
  public getHabits(arcId: string): Habit[] {
    return this.data.habits
      .filter(h => h.arcId === arcId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public getHabitById(id: string): Habit | undefined {
    return this.data.habits.find(h => h.id === id);
  }

  public createHabit(habit: Habit): Habit {
    this.data.habits.push(habit);
    this.save();
    return habit;
  }

  public updateHabit(id: string, updates: Partial<Habit>): Habit | undefined {
    const idx = this.data.habits.findIndex(h => h.id === id);
    if (idx === -1) return undefined;
    this.data.habits[idx] = { ...this.data.habits[idx], ...updates };
    this.save();
    return this.data.habits[idx];
  }

  public deleteHabit(id: string): boolean {
    const initialLen = this.data.habits.length;
    this.data.habits = this.data.habits.filter(h => h.id !== id);
    this.data.habitCompletions = this.data.habitCompletions.filter(c => c.habitId !== id);
    this.save();
    return this.data.habits.length < initialLen;
  }

  // Habit Completions
  public getCompletionsForArc(arcId: string, startDate?: string, endDate?: string): HabitCompletion[] {
    return this.data.habitCompletions.filter(c => {
      if (c.arcId !== arcId) return false;
      if (startDate && c.date < startDate) return false;
      if (endDate && c.date > endDate) return false;
      return true;
    });
  }

  public getCompletionsForDate(userId: string, date: string): HabitCompletion[] {
    return this.data.habitCompletions.filter(c => c.userId === userId && c.date === date);
  }

  public toggleHabitCompletion(userId: string, arcId: string, habitId: string, date: string, note?: string): { completed: boolean; completion?: HabitCompletion } {
    const existingIdx = this.data.habitCompletions.findIndex(c => c.habitId === habitId && c.date === date);
    if (existingIdx !== -1) {
      // Remove completion
      this.data.habitCompletions.splice(existingIdx, 1);
      this.save();
      this.recalculateStreak(userId);
      return { completed: false };
    } else {
      // Add completion
      const newCompletion: HabitCompletion = {
        id: uuidv4(),
        habitId,
        userId,
        arcId,
        date,
        completedAt: new Date().toISOString(),
        note
      };
      this.data.habitCompletions.push(newCompletion);
      this.save();
      this.addXp(userId, 15);
      this.recalculateStreak(userId);
      this.checkAndUnlockAchievements(userId);
      return { completed: true, completion: newCompletion };
    }
  }

  // Streak calculation (Respecting "Consistency over perfection" philosophy)
  public recalculateStreak(userId: string): { currentStreak: number; longestStreak: number } {
    const completions = this.data.habitCompletions.filter(c => c.userId === userId);
    const activeDates = Array.from(new Set(completions.map(c => c.date))).sort();

    if (activeDates.length === 0) {
      this.updateUser(userId, { currentStreak: 0 });
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Sort descending
    const sortedDesc = [...activeDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // Check if yesterday or today was completed
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const hasToday = activeDates.includes(today);
    const hasYesterday = activeDates.includes(yesterday);

    let currentStreak = 0;
    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? new Date(today) : new Date(yesterday);
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activeDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Grace margin: In Winter Arc philosophy, if they missed 1 day between 2 solid days, we check
          break;
        }
      }
    }

    // Longest streak
    let longestStreak = currentStreak;
    let tempStreak = 1;
    for (let i = 1; i < activeDates.length; i++) {
      const prev = new Date(activeDates[i - 1]).getTime();
      const curr = new Date(activeDates[i]).getTime();
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
    }

    const user = this.findUserById(userId);
    if (user && longestStreak < (user.longestStreak || 0)) {
      longestStreak = user.longestStreak;
    }

    this.updateUser(userId, { currentStreak, longestStreak });
    return { currentStreak, longestStreak };
  }

  // Goals
  public getGoals(arcId: string): Goal[] {
    const goals = this.data.goals.filter(g => g.arcId === arcId);
    return goals.map(g => ({
      ...g,
      tasks: this.data.goalTasks.filter(t => t.goalId === g.id).sort((a, b) => a.orderIndex - b.orderIndex)
    }));
  }

  public createGoal(goal: Goal): Goal {
    const tasks = goal.tasks || [];
    const goalWithoutTasks = { ...goal, tasks: [] };
    this.data.goals.push(goalWithoutTasks);
    tasks.forEach(t => this.data.goalTasks.push(t));
    this.save();
    return { ...goalWithoutTasks, tasks };
  }

  public updateGoal(id: string, updates: Partial<Goal>): Goal | undefined {
    const idx = this.data.goals.findIndex(g => g.id === id);
    if (idx === -1) return undefined;
    this.data.goals[idx] = { ...this.data.goals[idx], ...updates };
    this.save();
    const tasks = this.data.goalTasks.filter(t => t.goalId === id);
    return { ...this.data.goals[idx], tasks };
  }

  public toggleGoalTask(userId: string, taskId: string): GoalTask | undefined {
    const task = this.data.goalTasks.find(t => t.id === taskId);
    if (!task) return undefined;
    task.isCompleted = !task.isCompleted;

    // Recalculate goal progress
    const allGoalTasks = this.data.goalTasks.filter(t => t.goalId === task.goalId);
    const completedTasks = allGoalTasks.filter(t => t.isCompleted).length;
    const progress = allGoalTasks.length > 0 ? Math.round((completedTasks / allGoalTasks.length) * 100) : 0;

    const goal = this.data.goals.find(g => g.id === task.goalId);
    if (goal) {
      goal.progressPercent = progress;
      goal.isCompleted = progress === 100;
      if (goal.isCompleted) {
        this.addXp(userId, 150);
        this.checkAndUnlockAchievements(userId);
      }
    }

    if (task.isCompleted) {
      this.addXp(userId, 25);
    }

    this.save();
    return task;
  }

  public deleteGoal(id: string): boolean {
    const initLen = this.data.goals.length;
    this.data.goals = this.data.goals.filter(g => g.id !== id);
    this.data.goalTasks = this.data.goalTasks.filter(t => t.goalId !== id);
    this.save();
    return this.data.goals.length < initLen;
  }

  // Daily Check-ins & Journal
  public createDailyCheckIn(checkIn: DailyCheckIn): DailyCheckIn {
    const existingIdx = this.data.dailyCheckIns.findIndex(c => c.userId === checkIn.userId && c.date === checkIn.date);
    if (existingIdx !== -1) {
      this.data.dailyCheckIns[existingIdx] = checkIn;
    } else {
      this.data.dailyCheckIns.push(checkIn);
    }

    // Also sync to journal entry
    const habitCount = this.data.habitCompletions.filter(c => c.userId === checkIn.userId && c.date === checkIn.date).length;
    const existingJournal = this.data.journalEntries.find(j => j.userId === checkIn.userId && j.date === checkIn.date);
    if (existingJournal) {
      existingJournal.mood = checkIn.mood;
      existingJournal.productivityScore = checkIn.productivityScore;
      existingJournal.proudOf = checkIn.proudOf;
      existingJournal.improveTomorrow = checkIn.improveTomorrow;
      existingJournal.habitsCompletedCount = habitCount;
    } else {
      this.data.journalEntries.push({
        id: uuidv4(),
        arcId: checkIn.arcId,
        userId: checkIn.userId,
        date: checkIn.date,
        mood: checkIn.mood,
        productivityScore: checkIn.productivityScore,
        proudOf: checkIn.proudOf,
        improveTomorrow: checkIn.improveTomorrow,
        note: `Check-in: ${checkIn.mood} mood with ${checkIn.productivityScore}/10 productivity.`,
        habitsCompletedCount: habitCount,
        createdAt: new Date().toISOString()
      });
    }

    this.addXp(checkIn.userId, 40);
    this.save();
    this.checkAndUnlockAchievements(checkIn.userId);
    return checkIn;
  }

  public getDailyCheckIns(userId: string): DailyCheckIn[] {
    return this.data.dailyCheckIns.filter(c => c.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
  }

  public getJournalEntries(userId: string, search?: string): JournalEntry[] {
    let entries = this.data.journalEntries.filter(j => j.userId === userId);
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter(e => 
        (e.note && e.note.toLowerCase().includes(q)) ||
        (e.proudOf && e.proudOf.toLowerCase().includes(q)) ||
        (e.improveTomorrow && e.improveTomorrow.toLowerCase().includes(q))
      );
    }
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }

  public getOnThisDay(userId: string, todayMonthDay: string): JournalEntry[] {
    // Finds entries on same MM-DD in previous years or arcs
    return this.data.journalEntries.filter(j => j.userId === userId && j.date.endsWith(todayMonthDay));
  }

  // Weekly Reviews
  public getWeeklyReviews(userId: string): WeeklyReview[] {
    return this.data.weeklyReviews.filter(r => r.userId === userId).sort((a, b) => b.weekNumber - a.weekNumber);
  }

  public createWeeklyReview(review: WeeklyReview): WeeklyReview {
    this.data.weeklyReviews.push(review);
    this.addXp(review.userId, 75);
    this.save();
    return review;
  }

  // Achievements
  public getAchievements(): Achievement[] {
    return this.data.achievements;
  }

  public getUserAchievements(userId: string): (UserAchievement & { achievement: Achievement })[] {
    const userAchs = this.data.userAchievements.filter(ua => ua.userId === userId);
    return userAchs.map(ua => ({
      ...ua,
      achievement: this.data.achievements.find(a => a.id === ua.achievementId)!
    })).filter(ua => !!ua.achievement);
  }

  public unlockAchievement(userId: string, code: string): Achievement | null {
    const ach = this.data.achievements.find(a => a.code === code);
    if (!ach) return null;

    const alreadyUnlocked = this.data.userAchievements.some(ua => ua.userId === userId && ua.achievementId === ach.id);
    if (alreadyUnlocked) return null;

    this.data.userAchievements.push({
      id: uuidv4(),
      userId,
      achievementId: ach.id,
      unlockedAt: new Date().toISOString()
    });

    this.addXp(userId, ach.xpReward);
    this.save();
    return ach;
  }

  public checkAndUnlockAchievements(userId: string): Achievement[] {
    const unlocked: Achievement[] = [];
    const completions = this.data.habitCompletions.filter(c => c.userId === userId);
    const user = this.findUserById(userId);
    const goals = this.data.goals.filter(g => g.userId === userId);

    // 1. FIRST_STEP
    if (completions.length >= 1) {
      const res = this.unlockAchievement(userId, 'FIRST_STEP');
      if (res) unlocked.push(res);
    }

    // 2. 7_DAYS_STRONG
    if (user && user.currentStreak >= 7) {
      const res = this.unlockAchievement(userId, '7_DAYS_STRONG');
      if (res) unlocked.push(res);
    }

    // 3. CONSISTENT (30 days)
    if (user && (user.currentStreak >= 30 || user.longestStreak >= 30)) {
      const res = this.unlockAchievement(userId, 'CONSISTENT');
      if (res) unlocked.push(res);
    }

    // 4. BOOKWORM (10 reading sessions)
    const readHabitIds = this.data.habits.filter(h => h.userId === userId && (h.name.toLowerCase().includes('read') || h.category.toLowerCase().includes('reading'))).map(h => h.id);
    const readCompletions = completions.filter(c => readHabitIds.includes(c.habitId)).length;
    if (readCompletions >= 10) {
      const res = this.unlockAchievement(userId, 'BOOKWORM');
      if (res) unlocked.push(res);
    }

    // 5. MOVING (20 workout or walking sessions)
    const movingHabitIds = this.data.habits.filter(h => h.userId === userId && (
      h.name.toLowerCase().includes('workout') || 
      h.name.toLowerCase().includes('walk') || 
      h.name.toLowerCase().includes('gym') ||
      h.name.toLowerCase().includes('run')
    )).map(h => h.id);
    const movingCompletions = completions.filter(c => movingHabitIds.includes(c.habitId)).length;
    if (movingCompletions >= 20) {
      const res = this.unlockAchievement(userId, 'MOVING');
      if (res) unlocked.push(res);
    }

    // 6. GOAL_GETTER
    const completedGoals = goals.filter(g => g.isCompleted).length;
    if (completedGoals >= 1) {
      const res = this.unlockAchievement(userId, 'GOAL_GETTER');
      if (res) unlocked.push(res);
    }

    return unlocked;
  }

  // Notifications
  public getNotifications(userId: string): AppNotification[] {
    return this.data.notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public createNotification(notification: AppNotification): AppNotification {
    this.data.notifications.unshift(notification);
    this.save();
    return notification;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
  }
}

export const db = new Database();
