"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_js_1 = require("../database/db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
// GET JOURNAL ENTRIES
router.get('/', (req, res) => {
    const userId = req.user.id;
    const search = req.query.search;
    const entries = db_js_1.db.getJournalEntries(userId, search);
    res.json({ entries });
});
// ON THIS DAY FLASHBACK
router.get('/on-this-day', (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const memories = db_js_1.db.getOnThisDay(userId, monthDay);
    res.json({ memories });
});
// CREATE JOURNAL ENTRY
router.post('/', (req, res) => {
    const userId = req.user.id;
    const { note, mood, productivityScore, proudOf, improveTomorrow, title, date } = req.body;
    const activeArc = db_js_1.db.getActiveArc(userId);
    const targetDate = date || new Date().toISOString().split('T')[0];
    const habitCount = db_js_1.db.getCompletionsForDate(userId, targetDate).length;
    const entry = {
        id: `journal-${(0, uuid_1.v4)().slice(0, 8)}`,
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
    db_js_1.db.save({
        ...db_js_1.db['data'],
        journalEntries: [entry, ...db_js_1.db['data'].journalEntries]
    });
    db_js_1.db.addXp(userId, 30);
    res.status(201).json({ entry });
});
exports.default = router;
