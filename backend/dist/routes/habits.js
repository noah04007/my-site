"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_js_1 = require("../database/db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
// GET HABITS FOR ACTIVE ARC
router.get('/', (req, res) => {
    const userId = req.user.id;
    const arcIdQuery = req.query.arcId;
    const dateQuery = req.query.date || new Date().toISOString().split('T')[0];
    let arcId = arcIdQuery;
    if (!arcId) {
        const activeArc = db_js_1.db.getActiveArc(userId);
        if (!activeArc) {
            res.json({ habits: [] });
            return;
        }
        arcId = activeArc.id;
    }
    const habits = db_js_1.db.getHabits(arcId);
    const completions = db_js_1.db.getCompletionsForDate(userId, dateQuery);
    const completedSet = new Set(completions.map(c => c.habitId));
    const enriched = habits.map(h => ({
        ...h,
        isCompletedToday: completedSet.has(h.id)
    }));
    res.json({ habits: enriched });
});
// CREATE HABIT
router.post('/', (req, res) => {
    const userId = req.user.id;
    const { arcId, name, icon, category, frequency, targetTime, daysPerWeek, activeDays } = req.body;
    let targetArcId = arcId;
    if (!targetArcId) {
        const activeArc = db_js_1.db.getActiveArc(userId);
        if (!activeArc) {
            res.status(400).json({ error: 'No active arc found to attach habit' });
            return;
        }
        targetArcId = activeArc.id;
    }
    if (!name) {
        res.status(400).json({ error: 'Habit name is required' });
        return;
    }
    const existingHabits = db_js_1.db.getHabits(targetArcId);
    const habit = {
        id: `h-${(0, uuid_1.v4)().slice(0, 8)}`,
        arcId: targetArcId,
        userId,
        name,
        icon: icon || 'Flame',
        category: category || 'Discipline',
        frequency: frequency || 'daily',
        targetTime: targetTime || undefined,
        daysPerWeek: daysPerWeek || 7,
        activeDays: activeDays || [0, 1, 2, 3, 4, 5, 6],
        isPaused: false,
        orderIndex: existingHabits.length,
        createdAt: new Date().toISOString()
    };
    const created = db_js_1.db.createHabit(habit);
    res.status(201).json({ habit: created });
});
// UPDATE HABIT
router.patch('/:id', (req, res) => {
    const userId = req.user.id;
    const habitId = req.params.id;
    const habit = db_js_1.db.getHabitById(habitId);
    if (!habit || habit.userId !== userId) {
        res.status(404).json({ error: 'Habit not found' });
        return;
    }
    const { name, icon, category, frequency, targetTime, daysPerWeek, activeDays, isPaused } = req.body;
    const updated = db_js_1.db.updateHabit(habitId, {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(category !== undefined && { category }),
        ...(frequency !== undefined && { frequency }),
        ...(targetTime !== undefined && { targetTime }),
        ...(daysPerWeek !== undefined && { daysPerWeek }),
        ...(activeDays !== undefined && { activeDays }),
        ...(isPaused !== undefined && { isPaused })
    });
    res.json({ habit: updated });
});
// DELETE HABIT
router.delete('/:id', (req, res) => {
    const userId = req.user.id;
    const habitId = req.params.id;
    const habit = db_js_1.db.getHabitById(habitId);
    if (!habit || habit.userId !== userId) {
        res.status(404).json({ error: 'Habit not found' });
        return;
    }
    db_js_1.db.deleteHabit(habitId);
    res.json({ success: true, message: 'Habit deleted' });
});
exports.default = router;
