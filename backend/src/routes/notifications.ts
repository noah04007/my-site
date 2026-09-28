import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET USER NOTIFICATIONS
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  let notifications = db.getNotifications(userId);

  if (notifications.length === 0) {
    // Seed sample default notifications
    const defaultNotifs = [
      {
        id: `notif-1`,
        userId,
        title: 'Winter Arc Discipline',
        message: 'Your Arc is waiting for you. Step into the cold with purpose.',
        type: 'reminder' as const,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: `notif-2`,
        userId,
        title: 'Daily Reflection',
        message: 'Time for your evening check-in. Reflect on your wins.',
        type: 'reminder' as const,
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: `notif-3`,
        userId,
        title: 'Streak Milestone 🔥',
        message: "You've completed 12 days in a row. Relentless consistency.",
        type: 'streak' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: `notif-4`,
        userId,
        title: 'Weekly Review Ready',
        message: 'Your weekly transformation recap is ready to inspect.',
        type: 'weekly_review' as const,
        isRead: false,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    defaultNotifs.forEach(n => db.createNotification(n));
    notifications = db.getNotifications(userId);
  }

  res.json({ notifications });
});

// MARK NOTIFICATION AS READ
router.post('/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.markNotificationAsRead(id);
  res.json({ success: true });
});

export default router;
