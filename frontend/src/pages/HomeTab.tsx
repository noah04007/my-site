import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  RefreshCw,
  Sparkles,
  Calendar,
  ChevronRight,
  TrendingUp,
  Target,
  Moon,
  Clock,
  Zap
} from 'lucide-react';
import { Arc, Habit, ArcStats, Goal, DailyCheckIn } from '../types/index.js';
import { HabitIcon } from '../components/HabitIcon.js';
import { soundManager } from '../utils/audio.js';
import { fireCelebrationConfetti } from '../utils/confetti.js';

interface HomeTabProps {
  arc: Arc | null;
  stats: ArcStats | null;
  todayHabits: Habit[];
  goals: Goal[];
  todayCheckIn: DailyCheckIn | null;
  onToggleHabit: (habitId: string) => Promise<void>;
  onOpenCheckIn: () => void;
  onOpenWeeklyReview: () => void;
  onOpenAddHabit: () => void;
  onOpenAddGoal: () => void;
  onSwitchTab: (tab: any) => void;
}

const MOTIVATIONAL_QUOTES = [
  "Small steps. Big transformation.",
  "Keep showing up.",
  "You don’t need motivation. You need consistency.",
  "Your future self is watching.",
  "Consistency over perfection.",
  "The cold sharpens the blade.",
  "Win the morning. Master the season."
];

export const HomeTab: React.FC<HomeTabProps> = ({
  arc,
  stats,
  todayHabits,
  goals,
  todayCheckIn,
  onToggleHabit,
  onOpenCheckIn,
  onOpenWeeklyReview,
  onOpenAddHabit,
  onOpenAddGoal,
  onSwitchTab
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [togglingHabitId, setTogglingHabitId] = useState<string | null>(null);

  const rotateQuote = () => {
    soundManager.playCheck();
    setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const handleToggle = async (habitId: string) => {
    if (togglingHabitId) return;
    setTogglingHabitId(habitId);
    try {
      await onToggleHabit(habitId);
    } finally {
      setTogglingHabitId(null);
    }
  };

  const currentDay = stats?.currentDay || 1;
  const duration = arc?.durationDays || 90;
  const arcProgressPercent = Math.min(100, Math.round((currentDay / duration) * 100));

  const completedTodayCount = todayHabits.filter(h => h.isCompletedToday).length;
  const totalTodayCount = todayHabits.length;
  const todayRate = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  // Circular ring calculations
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (arcProgressPercent / 100) * circumference;

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* 1. Header & Arc Day Progress */}
      <section className="relative overflow-hidden rounded-3xl p-5 sm:p-6 glass-card border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-winter-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
          {/* Left Text */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-winter-cyan/10 border border-winter-cyan/30 text-winter-cyan text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{arc ? arc.seasonName || 'Winter Arc' : 'MY WINTER ARC'}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                Day {currentDay} <span className="text-slate-500 font-normal text-lg">/ {duration}</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {duration - currentDay > 0
                  ? `${duration - currentDay} days remaining in your transformation`
                  : 'Season completed! Showed up for yourself.'}
              </p>
            </div>

            {/* Streak flame badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-display font-black text-xs shadow-glow-flame">
              <Flame className="w-4 h-4 fill-orange-400 animate-pulse" />
              <span>🔥 {stats?.currentStreak || 1} DAY ARC</span>
            </div>
          </div>

          {/* Right Circular Gauge */}
          <div className="relative flex flex-col items-center justify-center shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#161B26"
                  strokeWidth="11"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#arcGlowGradient)"
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="progress-ring-circle"
                />
                <defs>
                  <linearGradient id="arcGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-display text-white tracking-tight">
                  {arcProgressPercent}%
                </span>
                <span className="text-[10px] uppercase font-bold text-winter-cyan tracking-wider">
                  COMPLETE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Rotating Motivational Quote Banner */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-300 italic font-medium flex-1">
            “{MOTIVATIONAL_QUOTES[quoteIndex]}”
          </p>
          <button
            onClick={rotateQuote}
            title="Next quote"
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition shrink-0 active:scale-90"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 2. Today's Habits Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-display tracking-tight">TODAY</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-winter-800 text-slate-300 font-semibold border border-white/5">
                {completedTodayCount}/{totalTodayCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{todayDateString}</p>
          </div>

          <button
            onClick={onOpenAddHabit}
            className="px-3 py-1.5 rounded-xl bg-winter-800 hover:bg-winter-700 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-winter-cyan" />
            <span>Add Habit</span>
          </button>
        </div>

        {/* Daily Habits List */}
        {todayHabits.length === 0 ? (
          <div className="p-8 rounded-3xl glass-card text-center space-y-3 border border-dashed border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-winter-cyan/10 border border-winter-cyan/20 flex items-center justify-center mx-auto text-winter-cyan">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">No habits configured yet</h4>
              <p className="text-xs text-slate-400">
                Shape your season by defining daily non-negotiables.
              </p>
            </div>
            <button
              onClick={onOpenAddHabit}
              className="px-4 py-2 rounded-xl bg-winter-cyan text-winter-950 font-bold text-xs"
            >
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayHabits.map(habit => {
              const isDone = habit.isCompletedToday;
              const isToggling = togglingHabitId === habit.id;

              return (
                <div
                  key={habit.id}
                  onClick={() => handleToggle(habit.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] ${
                    isDone
                      ? 'bg-winter-900/60 border-emerald-500/30 text-slate-400'
                      : 'glass-card-interactive hover:border-winter-cyan/40 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox Button */}
                    <button
                      type="button"
                      disabled={isToggling}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald scale-105'
                          : 'bg-white/5 border border-white/15 text-transparent group-hover:border-winter-cyan/50'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 transition-all ${
                          isDone ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                        }`}
                      />
                    </button>

                    {/* Habit Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-xs tracking-tight truncate ${
                            isDone ? 'line-through text-slate-400 font-normal' : 'text-white'
                          }`}
                        >
                          {habit.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 font-medium">
                          {habit.category}
                        </span>
                        {habit.targetTime && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {habit.targetTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Habit Category Icon */}
                  <div className="w-8 h-8 rounded-xl bg-winter-800/80 border border-white/5 flex items-center justify-center shrink-0">
                    <HabitIcon name={habit.icon} category={habit.category} className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Daily Check-In Evening CTA Banner */}
      <section>
        <div
          onClick={onOpenCheckIn}
          className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between gap-4 group active:scale-[0.99] ${
            todayCheckIn
              ? 'bg-winter-900/80 border-emerald-500/20 shadow-glow-emerald'
              : 'bg-gradient-to-r from-winter-850 to-winter-800 border-winter-cyan/25 hover:border-winter-cyan/50 shadow-glow-cyan'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                todayCheckIn
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-winter-cyan/15 border-winter-cyan/30 text-winter-cyan'
              }`}
            >
              <Moon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-white font-display">
                  {todayCheckIn ? 'Daily Reflection Recorded' : 'HOW WAS YOUR DAY?'}
                </h4>
                {todayCheckIn && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    ✓ Done
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {todayCheckIn
                  ? `Mood: ${todayCheckIn.mood} • Score: ${todayCheckIn.productivityScore}/10`
                  : 'Log your mood, wins, and tomorrow’s intention.'}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 4. Active Goals Quick Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Goals ({goals.length})
            </h3>
          </div>
          <button
            onClick={onOpenAddGoal}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
          >
            + New Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="p-4 rounded-2xl glass-card border border-white/5 text-center text-xs text-slate-500">
            No goals set yet. Define what success looks like in this Arc.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {goals.slice(0, 2).map(goal => (
              <div
                key={goal.id}
                onClick={() => onSwitchTab('progress')}
                className="p-3.5 rounded-2xl glass-card border border-white/5 hover:border-purple-500/30 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25">
                      {goal.category}
                    </span>
                    <h5 className="font-semibold text-xs text-white truncate max-w-[200px]">
                      {goal.title}
                    </h5>
                  </div>
                  <span className="text-xs font-bold text-purple-400 font-display">
                    {goal.progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-winter-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Weekly Review CTA trigger */}
      <section className="pt-1">
        <button
          onClick={onOpenWeeklyReview}
          className="w-full p-3.5 rounded-2xl bg-winter-850 hover:bg-winter-800 border border-white/5 flex items-center justify-between text-xs transition active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-medium">Inspect Your Week in Review</span>
          </div>
          <span className="text-indigo-400 font-semibold flex items-center gap-1">
            <span>View Summary</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </section>
    </div>
  );
};
