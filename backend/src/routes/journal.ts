import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { JournalEntry } from '../types/index.js';

const router = Router();
router.use(authMiddleware);

// GET JOURNAL ENTRIES
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const search = req.query.search as string;
  const entries = db.getJournalEntries(userId, search);
  res.json({ entries });
});

// ON THIS DAY FLASHBACK
router.get('/on-this-day', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const memories = db.getOnThisDay(userId, monthDay);
  res.json({ memories });
});

// CREATE JOURNAL ENTRY
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { note, mood, productivityScore, proudOf, improveTomorrow, title, date } = req.body;

  const activeArc = db.getActiveArc(userId);
  const targetDate = date || new Date().toISOString().split('T')[0];
  const habitCount = db.getCompletionsForDate(userId, targetDate).length;

  const entry: JournalEntry = {
    id: `journal-${uuidv4().slice(0, 8)}`,
    arcId: activeArc ? activeArc.id : 'general',
    userId,
    date: targetDate,
    mood,
    productivityScore: productivityScore ? Number(productivityScore) : undefined,
    title: title || undefined,
    proudOf,
    improveTomorrow,
    note: note || '',
    habitsCompletedCount: habitCount,
    createdAt: new Date().toISOString()
  };

  db.save({
    ...db['data'],
    journalEntries: [entry, ...db['data'].journalEntries]
  });

  db.addXp(userId, 30);
  res.status(201).json({ entry });
});

export default router;
