"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedGuestUser = seedGuestUser;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const db_js_1 = require("../database/db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Guest user generator with rich initial Winter Arc setup
function seedGuestUser() {
    const userId = `guest-${(0, uuid_1.v4)().slice(0, 8)}`;
    const user = {
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
    db_js_1.db.createUser(user);
    // Calculate start date: 17 days ago, so today is Day 17 of 90 (matching Section 3!)
    const now = new Date();
    const startDateObj = new Date();
    startDateObj.setDate(now.getDate() - 16); // 17th day is today
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 90);
    const arcId = `arc-${(0, uuid_1.v4)().slice(0, 8)}`;
    const arc = {
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
    db_js_1.db.createArc(arc);
    // Create default habits matching Section 3 and 2
    const defaultHabits = [
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
    const createdHabits = [];
    defaultHabits.forEach(h => {
        const created = db_js_1.db.createHabit({ ...h, id: `h-${(0, uuid_1.v4)().slice(0, 8)}` });
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
            db_js_1.db.toggleHabitCompletion(userId, arcId, h.id, dateStr);
        });
    }
    // Today: Complete Workout, Read 20 min, Drink water (matching Section 3 example!)
    const workout = createdHabits.find(h => h.name === 'Workout');
    const read = createdHabits.find(h => h.name.includes('Read'));
    const water = createdHabits.find(h => h.name.includes('Drink'));
    if (workout)
        db_js_1.db.toggleHabitCompletion(userId, arcId, workout.id, todayStr);
    if (read)
        db_js_1.db.toggleHabitCompletion(userId, arcId, read.id, todayStr);
    if (water)
        db_js_1.db.toggleHabitCompletion(userId, arcId, water.id, todayStr);
    // Add initial goal matching Section 9
    const goalId = `goal-${(0, uuid_1.v4)().slice(0, 8)}`;
    db_js_1.db.createGoal({
        id: goalId,
        arcId,
        userId,
        title: 'Improve my English',
        category: 'Studies',
        progressPercent: 50,
        isCompleted: false,
        createdAt: startDateObj.toISOString(),
        tasks: [
            { id: `task-${(0, uuid_1.v4)().slice(0, 8)}`, goalId, title: 'Learn 20 new words', isCompleted: true, orderIndex: 0 },
            { id: `task-${(0, uuid_1.v4)().slice(0, 8)}`, goalId, title: 'Practice speaking', isCompleted: true, orderIndex: 1 },
            { id: `task-${(0, uuid_1.v4)().slice(0, 8)}`, goalId, title: 'Watch one English video', isCompleted: false, orderIndex: 2 },
            { id: `task-${(0, uuid_1.v4)().slice(0, 8)}`, goalId, title: 'Complete one listening exercise', isCompleted: false, orderIndex: 3 }
        ]
    });
    // Check achievements
    db_js_1.db.checkAndUnlockAchievements(userId);
    return { user, arc, habits: createdHabits };
}
// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }
        const existing = db_js_1.db.findUserByEmail(email);
        if (existing) {
            res.status(400).json({ error: 'An account with this email already exists' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = {
            id: (0, uuid_1.v4)(),
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
        db_js_1.db.createUser(user);
        const token = (0, auth_js_1.generateToken)(user);
        res.status(201).json({ user: sanitizeUser(user), token });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Server error during registration' });
    }
});
// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password required' });
            return;
        }
        const user = db_js_1.db.findUserByEmail(email);
        if (!user || !user.passwordHash) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        const token = (0, auth_js_1.generateToken)(user);
        res.json({ user: sanitizeUser(user), token });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Server error during login' });
    }
});
// GUEST MODE
router.post('/guest', (req, res) => {
    try {
        const { user } = seedGuestUser();
        const token = (0, auth_js_1.generateToken)(user);
        res.json({ user: sanitizeUser(user), token });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Error initializing guest mode' });
    }
});
// OAUTH (Google & Apple Mock Login)
router.post('/oauth', (req, res) => {
    try {
        const { provider, email, name } = req.body;
        const cleanEmail = email || `user_${provider}_${Date.now()}@winterarc.app`;
        let user = db_js_1.db.findUserByEmail(cleanEmail);
        if (!user) {
            user = {
                id: (0, uuid_1.v4)(),
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
            db_js_1.db.createUser(user);
        }
        const token = (0, auth_js_1.generateToken)(user);
        res.json({ user: sanitizeUser(user), token });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'OAuth login error' });
    }
});
// GET CURRENT USER (/me)
router.get('/me', auth_js_1.authMiddleware, (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const levelInfo = db_js_1.db.calculateLevel(req.user.xp);
    res.json({
        user: sanitizeUser(req.user),
        levelInfo
    });
});
// UPDATE PROFILE
router.patch('/profile', auth_js_1.authMiddleware, (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const { name, bio, avatarUrl } = req.body;
    const updated = db_js_1.db.updateUser(req.user.id, {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl })
    });
    res.json({ user: sanitizeUser(updated) });
});
function sanitizeUser(user) {
    const { passwordHash, ...rest } = user;
    return rest;
}
exports.default = router;
