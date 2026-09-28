import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { DailyCheckIn } from '../types/index.js';

const router = Router();
router.use(authMiddleware);

// GET TODAY'S CHECK-IN
router.get('/today', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const todayStr = new Date().toISOString().split('T')[0];
  const checkIns = db.getDailyCheckIns(userId);
  const todayCheckIn = checkIns.find(c => c.date === todayStr);
  res.json({ checkIn: todayCheckIn || null });
});

// SUBMIT DAILY CHECK-IN ("COMPLETE MY DAY")
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { mood, productivityScore, proudOf, improveTomorrow, date } = req.body;

  if (!mood || productivityScore === undefined) {
    res.status(400).json({ error: 'Mood and productivity score are required' });
    return;
  }

  const activeArc = db.getActiveArc(userId);
  const targetDate = date || new Date().toISOString().split('T')[0];

  const checkIn: DailyCheckIn = {
    id: `checkin-${uuidv4().slice(0, 8)}`,
    arcId: activeArc ? activeArc.id : 'default-arc',
    userId,
    date: targetDate,
    mood,
    productivityScore: Number(productivityScore),
    proudOf: proudOf || '',
    improveTomorrow: improveTomorrow || '',
    completedAt: new Date().toISOString()
  };

  const saved = db.createDailyCheckIn(checkIn);
  const user = db.findUserById(userId)!;
  const levelInfo = db.calculateLevel(user.xp);

  res.status(201).json({
    checkIn: saved,
    xpAwarded: 40,
    user: {
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak
    },
    levelInfo,
    message: 'Day completed with honor. Consistency over perfection.'
  });
});

export default router;
