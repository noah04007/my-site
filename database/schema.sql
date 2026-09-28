-- WINTER ARC DATABASE SCHEMA (PostgreSQL Compatible)
-- "Your season. Your rules. Your transformation."

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arcs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    season_name VARCHAR(100) DEFAULT 'Winter Arc',
    duration_days INTEGER NOT NULL DEFAULT 90,
    intensity VARCHAR(20) NOT NULL DEFAULT 'Balanced', -- 'Chill', 'Balanced', 'Hardcore'
    main_goal TEXT,
    categories JSONB DEFAULT '[]'::jsonb, -- e.g. ["Fitness", "Studies", "Discipline"]
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'completed', 'paused'
    reflection_proud TEXT,
    reflection_changed TEXT,
    reflection_keep TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habits (
    id VARCHAR(64) PRIMARY KEY,
    arc_id VARCHAR(64) REFERENCES arcs(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Flame',
    category VARCHAR(50) NOT NULL DEFAULT 'Discipline',
    frequency VARCHAR(30) DEFAULT 'daily', -- 'daily', 'weekdays', 'custom'
    target_time VARCHAR(10), -- e.g. "07:30", "22:00"
    days_per_week INTEGER DEFAULT 7,
    active_days JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
    is_paused BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habit_completions (
    id VARCHAR(64) PRIMARY KEY,
    habit_id VARCHAR(64) REFERENCES habits(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    arc_id VARCHAR(64) REFERENCES arcs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    UNIQUE(habit_id, date)
);

CREATE TABLE IF NOT EXISTS goals (
    id VARCHAR(64) PRIMARY KEY,
    arc_id VARCHAR(64) REFERENCES arcs(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'Personal growth',
    target_date DATE,
    progress_percent INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goal_tasks (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) REFERENCES goals(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_check_ins (
    id VARCHAR(64) PRIMARY KEY,
    arc_id VARCHAR(64) REFERENCES arcs(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood VARCHAR(30) NOT NULL, -- 'Great', 'Good', 'Okay', 'Difficult', 'Exhausted'
    productivity_score INTEGER NOT NULL CHECK (productivity_score BETWEEN 1 AND 10),
    proud_of TEXT,
    improve_tomorrow TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, arc_id, date)
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id VARCHAR(64) PRIMARY KEY,
    arc_id VARCHAR(64) REFERENCES arcs(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood VARCHAR(30),
    productivity_score INTEGER,
    title VARCHAR(150),
    proud_of TEXT,
    improve_tomorrow TEXT,
    note TEXT,
    habits_completed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) DEFAULT 'discipline',
    xp_reward INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(64) REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
    id VARCHAR(64) PRIMARY KEY,
    arc_id VARCHAR(64) REFERENCES arcs(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    completion_rate INTEGER DEFAULT 0,
    best_habit VARCHAR(150),
    difficult_habit VARCHAR(150),
    streak INTEGER DEFAULT 0,
    next_week_goal TEXT,
    suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'reminder', -- 'reminder', 'streak', 'achievement', 'weekly_review'
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial achievements
INSERT INTO achievements (id, code, title, description, icon, category, xp_reward) VALUES
('ach-1', 'FIRST_STEP', 'First Step', 'Complete your first day of your Winter Arc.', '🌱', 'consistency', 100),
('ach-2', '7_DAYS_STRONG', '7 Days Strong', 'Complete 7 days with relentless consistency.', '🔥', 'streak', 250),
('ach-3', 'CONSISTENT', 'Consistent', 'Complete 30 days of deliberate self-mastery.', '💪', 'streak', 500),
('ach-4', 'BOOKWORM', 'Bookworm', 'Complete 10 reading sessions.', '📚', 'mind', 200),
('ach-5', 'SLEEP_RESET', 'Sleep Reset', 'Complete your sleep habit consistently.', '🌙', 'recovery', 200),
('ach-6', 'MOVING', 'Moving', 'Complete 20 workout or walking sessions.', '🏃', 'fitness', 300),
('ach-7', 'GOAL_GETTER', 'Goal Getter', 'Complete your first major goal.', '🎯', 'transformation', 350),
('ach-8', 'ARC_COMPLETE', 'Arc Complete', 'Finished your full Winter Arc transformation.', '🏆', 'transcendence', 1000)
ON CONFLICT (code) DO NOTHING;
