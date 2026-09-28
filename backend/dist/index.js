"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const arcs_js_1 = __importDefault(require("./routes/arcs.js"));
const habits_js_1 = __importDefault(require("./routes/habits.js"));
const completions_js_1 = __importDefault(require("./routes/completions.js"));
const goals_js_1 = __importDefault(require("./routes/goals.js"));
const journal_js_1 = __importDefault(require("./routes/journal.js"));
const checkin_js_1 = __importDefault(require("./routes/checkin.js"));
const reviews_js_1 = __importDefault(require("./routes/reviews.js"));
const achievements_js_1 = __importDefault(require("./routes/achievements.js"));
const ai_js_1 = __importDefault(require("./routes/ai.js"));
const notifications_js_1 = __importDefault(require("./routes/notifications.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// CORS setup
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/arcs', arcs_js_1.default);
app.use('/api/habits', habits_js_1.default);
app.use('/api/completions', completions_js_1.default);
app.use('/api/goals', goals_js_1.default);
app.use('/api/journal', journal_js_1.default);
app.use('/api/checkin', checkin_js_1.default);
app.use('/api/reviews', reviews_js_1.default);
app.use('/api/achievements', achievements_js_1.default);
app.use('/api/ai', ai_js_1.default);
app.use('/api/notifications', notifications_js_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        app: 'Winter Arc Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});
app.listen(PORT, () => {
    console.log(`❄️ Winter Arc Backend API running on http://localhost:${PORT}`);
});
exports.default = app;
