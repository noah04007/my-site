import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { Goal, GoalTask } from '../types/index.js';

const router = Router();
router.use(authMiddleware);

// GET GOALS FOR ACTIVE ARC
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const activeArc = db.getActiveArc(userId);
  if (!activeArc) {
    res.json({ goals: [] });
    return;
  }
  const goals = db.getGoals(activeArc.id);
  res.json({ goals });
});

// CREATE GOAL
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, category, targetDate, tasks } = req.body;

  const activeArc = db.getActiveArc(userId);
  if (!activeArc) {
    res.status(400).json({ error: 'No active arc found' });
    return;
  }

  if (!title) {
    res.status(400).json({ error: 'Goal title required' });
    return;
  }

  const goalId = `goal-${uuidv4().slice(0, 8)}`;
  const goalTasks: GoalTask[] = Array.isArray(tasks)
    ? tasks.map((t: string | { title: string }, idx: number) => ({
        id: `task-${uuidv4().slice(0, 8)}`,
        goalId,
        title: typeof t === 'string' ? t : t.title,
        isCompleted: false,
        orderIndex: idx
      }))
    : [];

  const goal: Goal = {
    id: goalId,
    arcId: activeArc.id,
    userId,
    title,
    category: category || 'Personal growth',
    targetDate: targetDate || undefined,
    progressPercent: 0,
    isCompleted: false,
    createdAt: new Date().toISOString(),
    tasks: goalTasks
  };

  const created = db.createGoal(goal);
  res.status(201).json({ goal: created });
});

// TOGGLE TASK STATUS
router.post('/tasks/:taskId/toggle', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { taskId } = req.params;

  const task = db.toggleGoalTask(userId, taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const user = db.findUserById(userId)!;
  const levelInfo = db.calculateLevel(user.xp);

  res.json({
    task,
    user: { xp: user.xp, level: user.level },
    levelInfo
  });
});

// DELETE GOAL
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.deleteGoal(id);
  res.json({ success });
});

export default router;
