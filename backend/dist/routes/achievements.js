"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../database/db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
// GET ALL ACHIEVEMENTS WITH UNLOCK STATUS
router.get('/', (req, res) => {
    const userId = req.user.id;
    const allAchievements = db_js_1.db.getAchievements();
    const userAchievements = db_js_1.db.getUserAchievements(userId);
    const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]));
    const enriched = allAchievements.map(a => ({
        ...a,
        isUnlocked: unlockedMap.has(a.id),
        unlockedAt: unlockedMap.get(a.id) || null
    }));
    res.json({
        achievements: enriched,
        unlockedCount: userAchievements.length,
        totalCount: allAchievements.length
    });
});
exports.default = router;
