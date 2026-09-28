"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_js_1 = require("../database/db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
// GET ALL USER ARCS
router.get('/', (req, res) => {
    const userId = req.user.id;
    const arcs = db_js_1.db.getArcs(userId);
    res.json({ arcs });
});
// GET ACTIVE ARC WITH REAL-TIME STATS
router.get('/active', (req, res) => {
    const userId = req.user.id;
    let activeArc = db_js_1.db.getActiveArc(userId);
    if (!activeArc) {
        const userArcs = db_js_1.db.getArcs(userId);
        if (userArcs.length > 0) {
            activeArc = userArcs[0];
            db_js_1.db.updateArc(activeArc.id, { isActive: true });
        }
    }
    if (!activeArc) {
        res.json({ arc: null, stats: null });
        return;
    }
    // Calculate day progress
    const start = new Date(activeArc.startDate);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - start.getTime());
    const currentDay = Math.min(activeArc.durationDays, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const progressPercent = Math.min(100, Math.round((currentDay / activeArc.durationDays) * 100));
    // Today's habits completion
    const habits = db_js_1.db.getHabits(activeArc.id);
    const todayStr = now.toISOString().split('T')[0];
    const completionsToday = db_js_1.db.getCompletionsForDate(userId, todayStr);
    const completedHabitIds = new Set(completionsToday.map(c => c.habitId));
    const todayHabits = habits.map(h => ({
        ...h,
        isCompletedToday: completedHabitIds.has(h.id)
    }));
    const habitsCompletedCount = todayHabits.filter(h => h.isCompletedToday).length;
    const totalActiveHabitsCount = todayHabits.filter(h => !h.isPaused).length;
    res.json({
        arc: activeArc,
        stats: {
            currentDay,
            durationDays: activeArc.durationDays,
            progressPercent,
            currentStreak: req.user.currentStreak,
            longestStreak: req.user.longestStreak,
            habitsCompletedToday: habitsCompletedCount,
            totalHabitsToday: totalActiveHabitsCount,
            todayCompletionPercent: totalActiveHabitsCount > 0 ? Math.round((habitsCompletedCount / totalActiveHabitsCount) * 100) : 0,
            level: req.user.level,
            xp: req.user.xp
        },
        todayHabits
    });
});
// CREATE NEW ARC (e.g. from Onboarding or switcher)
router.post('/', (req, res) => {
    const userId = req.user.id;
    const { title, durationDays, intensity, mainGoal, categories, seasonName, startDate } = req.body;
    const days = durationDays || 90;
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    const arc = {
        id: `arc-${(0, uuid_1.v4)().slice(0, 8)}`,
        userId,
        title: title || `${seasonName || 'Winter Arc'} ${new Date().getFullYear()}`,
        seasonName: seasonName || 'Winter Arc',
        durationDays: days,
        intensity: intensity || 'Balanced',
        mainGoal: mainGoal || '',
        categories: categories || ['Fitness', 'Discipline'],
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        isActive: true,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    db_js_1.db.createArc(arc);
    res.status(201).json({ arc });
});
// SET ACTIVE ARC
router.put('/:id/active', (req, res) => {
    const userId = req.user.id;
    const arcId = req.params.id;
    const arc = db_js_1.db.getArcById(arcId);
    if (!arc || arc.userId !== userId) {
        res.status(404).json({ error: 'Arc not found' });
        return;
    }
    db_js_1.db.updateArc(arcId, { isActive: true });
    res.json({ success: true, activeArcId: arcId });
});
// END OF ARC FLOW
router.post('/:id/complete', (req, res) => {
    const userId = req.user.id;
    const arcId = req.params.id;
    const { reflectionProud, reflectionChanged, reflectionKeep } = req.body;
    const arc = db_js_1.db.getArcById(arcId);
    if (!arc || arc.userId !== userId) {
        res.status(404).json({ error: 'Arc not found' });
        return;
    }
    const updated = db_js_1.db.updateArc(arcId, {
        status: 'completed',
        reflectionProud,
        reflectionChanged,
        reflectionKeep
    });
    // Award Arc Complete achievement and bonus XP
    db_js_1.db.unlockAchievement(userId, 'ARC_COMPLETE');
    db_js_1.db.addXp(userId, 1000);
    res.json({ arc: updated, message: 'Arc completed! You showed up for yourself.' });
});
// ARC TIMELINE (Start -> Week 1 -> Week 2 ... -> Final Day)
router.get('/:id/timeline', (req, res) => {
    const arcId = req.params.id;
    const arc = db_js_1.db.getArcById(arcId);
    if (!arc) {
        res.status(404).json({ error: 'Arc not found' });
        return;
    }
    const start = new Date(arc.startDate);
    const now = new Date();
    const totalWeeks = Math.ceil(arc.durationDays / 7);
    const diffDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const currentWeekNumber = Math.min(totalWeeks, Math.floor(diffDays / 7) + 1);
    const completions = db_js_1.db.getCompletionsForArc(arcId);
    const timelineWeeks = [];
    for (let w = 1; w <= totalWeeks; w++) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + (w - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];
        const weekCompletions = completions.filter(c => c.date >= weekStartStr && c.date <= weekEndStr).length;
        let status = 'upcoming';
        if (w < currentWeekNumber) {
            status = 'completed';
        }
        else if (w === currentWeekNumber) {
            status = 'current';
        }
        timelineWeeks.push({
            weekNumber: w,
            title: `Week ${w}`,
            dateRange: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            status,
            completionsCount: weekCompletions,
            isFinalWeek: w === totalWeeks
        });
    }
    res.json({
        arc,
        currentWeekNumber,
        totalWeeks,
        timeline: timelineWeeks
    });
});
exports.default = router;
