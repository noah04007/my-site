import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { WeeklyReview } from '../types/index.js';

const router = Router();
router.use(authMiddleware);

// GET ALL WEEKLY REVIEWS
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const reviews = db.getWeeklyReviews(userId);
  res.json({ reviews });
});

// GENERATE OR GET CURRENT WEEK PREVIEW
router.get('/current-preview', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const activeArc = db.getActiveArc(userId);

  if (!activeArc) {
    res.json({ preview: null });
    return;
  }

  const start = new Date(activeArc.startDate);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const currentWeekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);

  // Calculate 7-day stats
  const habits = db.getHabits(activeArc.id).filter(h => !h.isPaused);
  const completions = db.getCompletionsForArc(activeArc.id);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const recentCompletions = completions.filter(c => c.date >= sevenDaysAgoStr);

  const habitCounts: Record<string, number> = {};
  recentCompletions.forEach(c => {
    habitCounts[c.habitId] = (habitCounts[c.habitId] || 0) + 1;
  });

  const sortedHabits = [...habits].sort((a, b) => (habitCounts[b.id] || 0) - (habitCounts[a.id] || 0));
  const bestHabit = sortedHabits[0]?.name || 'Daily Focus';
  const difficultHabit = sortedHabits.length > 1 ? sortedHabits[sortedHabits.length - 1]?.name : sortedHabits[0]?.name || 'Workout';

  const totalPossible = Math.max(1, habits.length * 7);
  const completionRate = Math.min(100, Math.round((recentCompletions.length / totalPossible) * 100));

  res.json({
    weekNumber: currentWeekNumber,
    completionRate,
    bestHabit,
    difficultHabit,
    streak: req.user!.currentStreak,
    suggestions: [
      `Try setting a specific time anchor for ${difficultHabit}.`,
      'Consistency compounds quietly. One rep at a time.',
      'Protect your sleep schedule as the cornerstone of energy.'
    ]
  });
});

// SUBMIT WEEKLY REVIEW
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { weekNumber, completionRate, bestHabit, difficultHabit, nextWeekGoal, notes } = req.body;
  const activeArc = db.getActiveArc(userId);

  const now = new Date();
  const weekStart = new Date();
  weekStart.setDate(now.getDate() - 7);

  const review: WeeklyReview = {
    id: `review-${uuidv4().slice(0, 8)}`,
    arcId: activeArc ? activeArc.id : 'default-arc',
    userId,
    weekNumber: weekNumber || 1,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
    completionRate: Number(completionRate || 80),
    bestHabit: bestHabit || 'Reading',
    difficultHabit: difficultHabit || 'Workout',
    streak: req.user!.currentStreak,
    nextWeekGoal: nextWeekGoal || '',
    suggestions: [
      'Focus on small friction-free cues before executing habits.',
      'A bad workout is still infinitely better than no workout.',
      'Maintain an unbroken momentum string.'
    ],
    createdAt: new Date().toISOString()
  };

  const created = db.createWeeklyReview(review);
  res.status(201).json({ review: created });
});

export default router;
