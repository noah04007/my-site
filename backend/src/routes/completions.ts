import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// TOGGLE HABIT COMPLETION
router.post('/toggle', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { habitId, date, note } = req.body;

  if (!habitId) {
    res.status(400).json({ error: 'Habit ID required' });
    return;
  }

  const habit = db.getHabitById(habitId);
  if (!habit || habit.userId !== userId) {
    res.status(404).json({ error: 'Habit not found' });
    return;
  }

  const targetDate = date || new Date().toISOString().split('T')[0];
  const result = db.toggleHabitCompletion(userId, habit.arcId, habitId, targetDate, note);

  // Check if all active habits completed today
  let allCompletedToday = false;
  let bonusXpAwarded = 0;
  if (result.completed) {
    const habits = db.getHabits(habit.arcId).filter(h => !h.isPaused);
    const completionsToday = db.getCompletionsForDate(userId, targetDate);
    const completedSet = new Set(completionsToday.map(c => c.habitId));
    const allDone = habits.length > 0 && habits.every(h => completedSet.has(h.id));

    if (allDone) {
      allCompletedToday = true;
      bonusXpAwarded = 50;
      db.addXp(userId, 50);
    }
  }

  const user = db.findUserById(userId)!;
  const levelInfo = db.calculateLevel(user.xp);

  res.json({
    completed: result.completed,
    user: {
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak
    },
    levelInfo,
    allCompletedToday,
    bonusXpAwarded
  });
});

// HEATMAP / CALENDAR HISTORY
router.get('/history', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const days = parseInt((req.query.days as string) || '90', 10);

  const activeArc = db.getActiveArc(userId);
  const arcId = (req.query.arcId as string) || (activeArc ? activeArc.id : undefined);

  if (!arcId) {
    res.json({ heatmap: [], totalCompletions: 0 });
    return;
  }

  const completions = db.getCompletionsForArc(arcId);
  const habits = db.getHabits(arcId).filter(h => !h.isPaused);
  const totalHabits = habits.length || 1;

  // Build daily count map
  const dateMap: Record<string, number> = {};
  completions.forEach(c => {
    dateMap[c.date] = (dateMap[c.date] || 0) + 1;
  });

  const now = new Date();
  const heatmap: { date: string; count: number; level: number; completionRate: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = dateMap[dateStr] || 0;
    const rate = Math.round((count / totalHabits) * 100);

    // Heatmap level 0-4 (similar to GitHub)
    let level = 0;
    if (count > 0) {
      if (rate >= 80) level = 4;
      else if (rate >= 50) level = 3;
      else if (rate >= 25) level = 2;
      else level = 1;
    }

    heatmap.push({
      date: dateStr,
      count,
      level,
      completionRate: Math.min(100, rate)
    });
  }

  res.json({
    heatmap,
    totalCompletions: completions.length
  });
});

// STATS BREAKDOWN (Section 5: Daily progression, Most consistent habits, Most productive days, Completion rate)
router.get('/stats', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const timeframe = (req.query.timeframe as string) || '30'; // '7', '30', 'entire'
  const activeArc = db.getActiveArc(userId);

  if (!activeArc) {
    res.json({ stats: null });
    return;
  }

  let days = 30;
  if (timeframe === '7') days = 7;
  else if (timeframe === 'entire') days = activeArc.durationDays;

  const habits = db.getHabits(activeArc.id);
  const completions = db.getCompletionsForArc(activeArc.id);

  // Filter completions in timeframe
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const recentCompletions = completions.filter(c => c.date >= startDateStr);

  // Habit consistency ranking
  const habitCounts: Record<string, number> = {};
  recentCompletions.forEach(c => {
    habitCounts[c.habitId] = (habitCounts[c.habitId] || 0) + 1;
  });

  const habitRanking = habits.map(h => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    category: h.category,
    completedSessions: habitCounts[h.id] || 0,
    rate: Math.min(100, Math.round(((habitCounts[h.id] || 0) / days) * 100))
  })).sort((a, b) => b.completedSessions - a.completedSessions);

  // Day of week productivity (0=Sun, 1=Mon... 6=Sat)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayProductivity = [0, 0, 0, 0, 0, 0, 0];
  recentCompletions.forEach(c => {
    const day = new Date(c.date).getDay();
    dayProductivity[day]++;
  });

  const dayStats = dayNames.map((name, idx) => ({
    day: name,
    completions: dayProductivity[idx]
  }));

  // Completion rate trend (grouped by days)
  const trendDays = Math.min(days, 14);
  const trend = [];
  for (let i = trendDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = recentCompletions.filter(c => c.date === dateStr).length;
    const rate = habits.length > 0 ? Math.min(100, Math.round((count / habits.length) * 100)) : 0;
    trend.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      rate,
      count
    });
  }

  const totalPossible = habits.length * days;
  const overallRate = totalPossible > 0 ? Math.min(100, Math.round((recentCompletions.length / totalPossible) * 100)) : 0;

  res.json({
    timeframe,
    overallRate,
    totalCompletions: recentCompletions.length,
    mostConsistentHabit: habitRanking[0] || null,
    hardestHabit: habitRanking.length > 1 ? habitRanking[habitRanking.length - 1] : null,
    habitRanking,
    dayStats,
    trend
  });
});

export default router;
