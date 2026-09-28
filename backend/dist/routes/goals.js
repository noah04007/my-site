"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_js_1 = require("../database/db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
// GET GOALS FOR ACTIVE ARC
router.get('/', (req, res) => {
    const userId = req.user.id;
    const activeArc = db_js_1.db.getActiveArc(userId);
    if (!activeArc) {
        res.json({ goals: [] });
        return;
    }
    const goals = db_js_1.db.getGoals(activeArc.id);
    res.json({ goals });
});
// CREATE GOAL
router.post('/', (req, res) => {
    const userId = req.user.id;
    const { title, category, targetDate, tasks } = req.body;
    const activeArc = db_js_1.db.getActiveArc(userId);
    if (!activeArc) {
        res.status(400).json({ error: 'No active arc found' });
        return;
    }
    if (!title) {
        res.status(400).json({ error: 'Goal title required' });
        return;
    }
    const goalId = `goal-${(0, uuid_1.v4)().slice(0, 8)}`;
    const goalTasks = Array.isArray(tasks)
        ? tasks.map((t, idx) => ({
            id: `task-${(0, uuid_1.v4)().slice(0, 8)}`,
            goalId,
            title: typeof t === 'string' ? t : t.title,
            isCompleted: false,
            orderIndex: idx
        }))
        : [];
    const goal = {
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
    const created = db_js_1.db.createGoal(goal);
    res.status(201).json({ goal: created });
});
// TOGGLE TASK STATUS
router.post('/tasks/:taskId/toggle', (req, res) => {
    const userId = req.user.id;
    const { taskId } = req.params;
    const task = db_js_1.db.toggleGoalTask(userId, taskId);
    if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
    }
    const user = db_js_1.db.findUserById(userId);
    const levelInfo = db_js_1.db.calculateLevel(user.xp);
    res.json({
        task,
        user: { xp: user.xp, level: user.level },
        levelInfo
    });
});
// DELETE GOAL
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const success = db_js_1.db.deleteGoal(id);
    res.json({ success });
});
exports.default = router;
