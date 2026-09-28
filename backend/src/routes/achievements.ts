import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET ALL ACHIEVEMENTS WITH UNLOCK STATUS
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const allAchievements = db.getAchievements();
  const userAchievements = db.getUserAchievements(userId);

  const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]));

  const enriched = allAchievements.map(a => ({
    ...a,
    isUnlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) || null
  }));

  res.json({
    achievements: enriched,
    unlockedCount: userAchievements.length,
    totalCount: allAchievements.length
  });
});

export default router;
