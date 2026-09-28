"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_js_1 = require("../database/db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
// GET TODAY'S CHECK-IN
router.get('/today', (req, res) => {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const checkIns = db_js_1.db.getDailyCheckIns(userId);
    const todayCheckIn = checkIns.find(c => c.date === todayStr);
    res.json({ checkIn: todayCheckIn || null });
});
// SUBMIT DAILY CHECK-IN ("COMPLETE MY DAY")
router.post('/', (req, res) => {
    const userId = req.user.id;
    const { mood, productivityScore, proudOf, improveTomorrow, date } = req.body;
    if (!mood || productivityScore === undefined) {
        res.status(400).json({ error: 'Mood and productivity score are required' });
        return;
    }
    const activeArc = db_js_1.db.getActiveArc(userId);
    const targetDate = date || new Date().toISOString().split('T')[0];
    const checkIn = {
        id: `checkin-${(0, uuid_1.v4)().slice(0, 8)}`,
        arcId: activeArc ? activeArc.id : 'default-arc',
        userId,
        date: targetDate,
        mood,
        productivityScore: Number(productivityScore),
        proudOf: proudOf || '',
        improveTomorrow: improveTomorrow || '',
        completedAt: new Date().toISOString()
    };
    const saved = db_js_1.db.createDailyCheckIn(checkIn);
    const user = db_js_1.db.findUserById(userId);
    const levelInfo = db_js_1.db.calculateLevel(user.xp);
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
exports.default = router;
