"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../database/db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
// GET USER NOTIFICATIONS
router.get('/', (req, res) => {
    const userId = req.user.id;
    let notifications = db_js_1.db.getNotifications(userId);
    if (notifications.length === 0) {
        // Seed sample default notifications
        const defaultNotifs = [
            {
                id: `notif-1`,
                userId,
                title: 'Winter Arc Discipline',
                message: 'Your Arc is waiting for you. Step into the cold with purpose.',
                type: 'reminder',
                isRead: false,
                createdAt: new Date().toISOString()
            },
            {
                id: `notif-2`,
                userId,
                title: 'Daily Reflection',
                message: 'Time for your evening check-in. Reflect on your wins.',
                type: 'reminder',
                isRead: false,
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: `notif-3`,
                userId,
                title: 'Streak Milestone 🔥',
                message: "You've completed 12 days in a row. Relentless consistency.",
                type: 'streak',
                isRead: true,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: `notif-4`,
                userId,
                title: 'Weekly Review Ready',
                message: 'Your weekly transformation recap is ready to inspect.',
                type: 'weekly_review',
                isRead: false,
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        defaultNotifs.forEach(n => db_js_1.db.createNotification(n));
        notifications = db_js_1.db.getNotifications(userId);
    }
    res.json({ notifications });
});
// MARK NOTIFICATION AS READ
router.post('/:id/read', (req, res) => {
    const { id } = req.params;
    db_js_1.db.markNotificationAsRead(id);
    res.json({ success: true });
});
exports.default = router;
