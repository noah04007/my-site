import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { User, Arc, Habit } from '../types/index.js';

const router = Router();

// Guest user generator with rich initial Winter Arc setup
export function seedGuestUser(): { user: User; arc: Arc; habits: Habit[] } {
  const userId = `guest-${uuidv4().slice(0, 8)}`;
  const user: User = {
    id: userId,
    email: `${userId}@winterarc.app`,
    name: 'Winter Disciple',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Consistency over perfection. Building the best version of myself.',
    level: 3,
    xp: 680,
    currentStreak: 12,
    longestStreak: 21,
    isGuest: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createUser(user);

  // Calculate start date: 17 days ago, so today is Day 17 of 90 (matching Section 3!)
  const now = new Date();
  const startDateObj = new Date();
  startDateObj.setDate(now.getDate() - 16); // 17th day is today
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(startDateObj.getDate() + 90);

  const arcId = `arc-${uuidv4().slice(0, 8)}`;
  const arc: Arc = {
    id: arcId,
    userId,
    title: 'Winter Arc 2026',
    seasonName: 'Winter Arc',
    durationDays: 90,
    intensity: 'Balanced',
    mainGoal: 'I want to become more disciplined, improve my English, exercise regularly and take better care of myself.',
    categories: ['Fitness', 'Studies', 'Discipline', 'Health', 'Mental wellbeing'],
    startDate: startDateObj.toISOString().split('T')[0],
    endDate: endDateObj.toISOString().split('T')[0],
    isActive: true,
    status: 'active',
    createdAt: startDateObj.toISOString()
  };
  db.createArc(arc);

  // Create default habits matching Section 3 and 2
  const defaultHabits: Omit<Habit, 'id'>[] = [
    {
      arcId,
      userId,
      name: 'Workout',
      icon: 'Dumbbell',
      category: 'Fitness',
      frequency: 'daily',
      targetTime: '07:30',
      daysPerWeek: 5,
      activeDays: [1, 2, 3, 4, 5],
      isPaused: false,
      orderIndex: 0,
      createdAt: startDateObj.toISOString()
    },
    {
      arcId,
      userId,
      name: 'Read 20 minutes',
      icon: 'BookOpen',
      category: 'Reading',
      frequency: 'daily',
      targetTime: '21:30',
      daysPerWeek: 7,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      isPaused: false,
      orderIndex: 1,
      createdAt: startDateObj.toISOString()
    },
    {
      arcId,
      userId,
      name: 'Practice English',
      icon: 'Languages',
      category: 'Studies',
      frequency: 'daily',
      targetTime: '18:00',
      daysPerWeek: 6,
      activeDays: [1, 2, 3, 4, 5, 6],
      isPaused: false,
      orderIndex: 2,
      createdAt: startDateObj.toISOString()
    },
    {
      arcId,
      userId,
      name: 'Drink 2L water',
      icon: 'Droplets',
      category: 'Health',
      frequency: 'daily',
      targetTime: '12:00',
      daysPerWeek: 7,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      isPaused: false,
      orderIndex: 3,
      createdAt: startDateObj.toISOString()
    },
    {
      arcId,
      userId,
      name: 'Daily Journal',
      icon: 'PenTool',
      category: 'Mental wellbeing',
      frequency: 'daily',
      targetTime: '22:00',
      daysPerWeek: 7,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      isPaused: false,
      orderIndex: 4,
      createdAt: startDateObj.toISOString()
    },
    {
      arcId,
      userId,
      name: 'Sleep before 11 PM',
      icon: 'Moon',
      category: 'Sleep',
      frequency: 'daily',
      targetTime: '23:00',
      daysPerWeek: 7,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      isPaused: false,
      orderIndex: 5,
      createdAt: startDateObj.toISOString()
    }
  ];

  const createdHabits: Habit[] = [];
  defaultHabits.forEach(h => {
    const created = db.createHabit({ ...h, id: `h-${uuidv4().slice(0, 8)}` });
    createdHabits.push(created);
  });

  // Seed completions for previous days to give authentic streak & heatmap history
  const todayStr = now.toISOString().split('T')[0];
  for (let i = 16; i >= 1; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Complete 3-5 habits per past day
    createdHabits.slice(0, 4).forEach(h => {
      db.toggleHabitCompletion(userId, arcId, h.id, dateStr);
    });
  }

  // Today: Complete Workout, Read 20 min, Drink water (matching Section 3 example!)
  const workout = createdHabits.find(h => h.name === 'Workout');
  const read = createdHabits.find(h => h.name.includes('Read'));
  const water = createdHabits.find(h => h.name.includes('Drink'));
  if (workout) db.toggleHabitCompletion(userId, arcId, workout.id, todayStr);
  if (read) db.toggleHabitCompletion(userId, arcId, read.id, todayStr);
  if (water) db.toggleHabitCompletion(userId, arcId, water.id, todayStr);

  // Add initial goal matching Section 9
  const goalId = `goal-${uuidv4().slice(0, 8)}`;
  db.createGoal({
    id: goalId,
    arcId,
    userId,
    title: 'Improve my English',
    category: 'Studies',
    progressPercent: 50,
    isCompleted: false,
    createdAt: startDateObj.toISOString(),
    tasks: [
      { id: `task-${uuidv4().slice(0, 8)}`, goalId, title: 'Learn 20 new words', isCompleted: true, orderIndex: 0 },
      { id: `task-${uuidv4().slice(0, 8)}`, goalId, title: 'Practice speaking', isCompleted: true, orderIndex: 1 },
      { id: `task-${uuidv4().slice(0, 8)}`, goalId, title: 'Watch one English video', isCompleted: false, orderIndex: 2 },
      { id: `task-${uuidv4().slice(0, 8)}`, goalId, title: 'Complete one listening exercise', isCompleted: false, orderIndex: 3 }
    ]
  });

  // Check achievements
  db.checkAndUnlockAchievements(userId);

  return { user, arc, habits: createdHabits };
}

// REGISTER
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user: User = {
      id: uuidv4(),
      email,
      passwordHash,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      bio: 'Ready to transform during this Winter Arc.',
      level: 1,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      isGuest: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createUser(user);
    const token = generateToken(user);
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

// LOGIN
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    res.json({ user: sanitizeUser(user), token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during login' });
  }
});

// GUEST MODE
router.post('/guest', (req, res: Response) => {
  try {
    const { user } = seedGuestUser();
    const token = generateToken(user);
    res.json({ user: sanitizeUser(user), token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error initializing guest mode' });
  }
});

// OAUTH (Google & Apple Mock Login)
router.post('/oauth', (req, res: Response) => {
  try {
    const { provider, email, name } = req.body;
    const cleanEmail = email || `user_${provider}_${Date.now()}@winterarc.app`;
    let user = db.findUserByEmail(cleanEmail);

    if (!user) {
      user = {
        id: uuidv4(),
        email: cleanEmail,
        name: name || `${provider === 'apple' ? 'Apple' : 'Google'} Disciple`,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        bio: 'Embracing the cold. Finding my true power.',
        level: 1,
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        isGuest: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.createUser(user);
    }

    const token = generateToken(user);
    res.json({ user: sanitizeUser(user), token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OAuth login error' });
  }
});

// GET CURRENT USER (/me)
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const levelInfo = db.calculateLevel(req.user.xp);
  res.json({
    user: sanitizeUser(req.user),
    levelInfo
  });
});

// UPDATE PROFILE
router.patch('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { name, bio, avatarUrl } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(name && { name }),
    ...(bio !== undefined && { bio }),
    ...(avatarUrl && { avatarUrl })
  });
  res.json({ user: sanitizeUser(updated!) });
});

function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash, ...rest } = user;
  return rest;
}

export default router;
