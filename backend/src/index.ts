import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import arcsRouter from './routes/arcs.js';
import habitsRouter from './routes/habits.js';
import completionsRouter from './routes/completions.js';
import goalsRouter from './routes/goals.js';
import journalRouter from './routes/journal.js';
import checkinRouter from './routes/checkin.js';
import reviewsRouter from './routes/reviews.js';
import achievementsRouter from './routes/achievements.js';
import aiRouter from './routes/ai.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/arcs', arcsRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/completions', completionsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/notifications', notificationsRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Winter Arc Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`❄️ Winter Arc Backend API running on http://localhost:${PORT}`);
});

export default app;
