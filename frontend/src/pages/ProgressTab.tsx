import React, { useState } from 'react';
import {
  Flame,
  Trophy,
  Award,
  Zap,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Target,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ArcStats, LevelInfo, Achievement, Goal, Arc } from '../types/index.js';
import { soundManager } from '../utils/audio.js';
import { fireCelebrationConfetti } from '../utils/confetti.js';

interface ProgressTabProps {
  stats: ArcStats | null;
  levelInfo: LevelInfo | null;
  achievements: Achievement[];
  goals: Goal[];
  arc: Arc | null;
  onToggleGoalTask: (taskId: string) => Promise<void>;
  onOpenAddGoal: () => void;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  stats,
  levelInfo,
  achievements,
  goals,
  arc,
  onToggleGoalTask,
  onOpenAddGoal,
  onDeleteGoal
}) => {
  const [timeframe, setTimeframe] = useState<'7' | '30' | 'entire'>('30');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'goals' | 'timeline' | 'badges'>('overview');

  // Heatmap sample days (90 days / last 12 weeks grid)
  const heatmapWeeks = Array.from({ length: 12 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      // Deterministic fill for realistic preview
      const seed = (w * 7 + d) % 9;
      return {
        level: seed > 2 ? (seed % 4) + 1 : 0,
        dayIndex: w * 7 + d
      };
    })
  );

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-purple-950/80 border-purple-900/60';
      case 2:
        return 'bg-purple-800/80 border-purple-700/60';
      case 3:
        return 'bg-purple-600/90 border-purple-500/80';
      case 4:
        return 'bg-purple-400 border-white/40 shadow-glow-purple';
      default:
        return 'bg-winter-900 border-white/5';
    }
  };

  // Day distribution mock data
  const dayDistribution = [
    { day: 'Mon', value: 88 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 85 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 78 },
    { day: 'Sat', value: 82 },
    { day: 'Sun', value: 95 }
  ];

  const handleTaskToggle = async (taskId: string) => {
    soundManager.playCheck();
    await onToggleGoalTask(taskId);
  };

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black text-white font-display tracking-tight">MY PROGRESS</h1>
          <p className="text-xs text-slate-400">Transforming discipline into momentum</p>
        </div>

        {/* Timeframe Pill Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-winter-850 border border-white/5 text-[11px] font-semibold">
          {(['7', '30', 'entire'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => {
                soundManager.playCheck();
                setTimeframe(tf);
              }}
              className={`px-2.5 py-1 rounded-xl transition ${
                timeframe === tf
                  ? 'bg-winter-cyan text-winter-950 font-bold shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf === '7' ? '7 Days' : tf === '30' ? '30 Days' : 'Entire Arc'}
            </button>
          ))}
        </div>
      </div>

      {/* Subtab Selector */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-winter-900 border border-white/5 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'goals', label: `Goals (${goals.length})` },
          { id: 'timeline', label: 'Arc Timeline' },
          { id: 'badges', label: `Badges (${achievements.filter(a => a.isUnlocked).length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              soundManager.playCheck();
              setActiveSubTab(tab.id as any);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeSubTab === tab.id
                ? 'bg-winter-800 text-white border border-white/10 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-3xl glass-card border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Days Completed</span>
              <div className="text-2xl font-black font-display text-white">
                {stats?.currentDay || 1} <span className="text-xs text-slate-500 font-normal">/ {arc?.durationDays || 90}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-3xl glass-card border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Streak</span>
              <div className="text-2xl font-black font-display text-orange-400 flex items-center gap-1">
                <Flame className="w-5 h-5 fill-orange-400" />
                <span>{stats?.currentStreak || 1}d</span>
              </div>
            </div>

            <div className="p-3.5 rounded-3xl glass-card border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Best Streak</span>
              <div className="text-2xl font-black font-display text-amber-400 flex items-center gap-1">
                <Trophy className="w-5 h-5" />
                <span>{stats?.longestStreak || 7}d</span>
              </div>
            </div>

            <div className="p-3.5 rounded-3xl glass-card border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Completion Rate</span>
              <div className="text-2xl font-black font-display text-winter-cyan">
                {stats?.todayCompletionPercent || 85}%
              </div>
            </div>
          </div>

          {/* XP & Level Card */}
          <section className="p-5 rounded-3xl glass-card border border-white/10 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-winter-cyan/20 border border-winter-cyan/30 flex items-center justify-center text-winter-cyan shadow-glow-cyan">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white font-display">
                    {levelInfo?.title || 'Level 3 — Consistent'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Total XP: {stats?.xp || 450} • Keep showing up
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-winter-cyan px-2.5 py-1 rounded-full bg-winter-cyan/15 border border-winter-cyan/30">
                Level {levelInfo?.level || 3}
              </span>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Current progress</span>
                <span>{levelInfo?.progressPercent || 65}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-winter-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-winter-cyan to-indigo-500 rounded-full transition-all duration-500 shadow-glow-cyan"
                  style={{ width: `${levelInfo?.progressPercent || 65}%` }}
                />
              </div>
            </div>
          </section>

          {/* GitHub-Style Habit Contribution Graph Heatmap */}
          <section className="p-5 rounded-3xl glass-card border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-winter-cyan" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Consistency Calendar
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded bg-winter-900 border border-white/5" />
                <span className="w-2.5 h-2.5 rounded bg-purple-950 border border-purple-900" />
                <span className="w-2.5 h-2.5 rounded bg-purple-800 border border-purple-700" />
                <span className="w-2.5 h-2.5 rounded bg-purple-400 shadow-glow-purple" />
                <span>More</span>
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto pb-1 pt-2">
              <div className="flex gap-1.5 min-w-[320px]">
                {heatmapWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5">
                    {week.map((cell, dIdx) => (
                      <div
                        key={dIdx}
                        title={`Day ${cell.dayIndex + 1}`}
                        className={`w-3.5 h-3.5 rounded-sm border transition-all duration-150 hover:scale-125 ${getHeatmapColor(
                          cell.level
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Weekly Productive Days Bar Chart */}
          <section className="p-5 rounded-3xl glass-card border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Most Productive Days
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold">Sunday & Tuesday Peak</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-28 pt-2">
              {dayDistribution.map(item => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-winter-800 rounded-xl overflow-hidden flex flex-col justify-end h-20">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-fuchsia-400 rounded-t-xl transition-all duration-500 shadow-glow-purple"
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SUBTAB 2: GOALS */}
      {activeSubTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Arc Objectives ({goals.length})
            </h3>
            <button
              onClick={onOpenAddGoal}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card text-center space-y-3 border border-dashed border-white/10">
              <Target className="w-10 h-10 text-purple-400 mx-auto" />
              <h4 className="font-bold text-sm text-white">No active goals yet</h4>
              <p className="text-xs text-slate-400">
                Set milestones to focus your energy during this season.
              </p>
              <button
                onClick={onOpenAddGoal}
                className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs"
              >
                Create Goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="p-4 rounded-3xl glass-card border border-white/5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25">
                        {goal.category}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-1">{goal.title}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black font-display text-purple-400">
                        {goal.progressPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-winter-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>

                  {/* Tasks List */}
                  {goal.tasks && goal.tasks.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      {goal.tasks.map(task => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleTaskToggle(task.id)}
                          className={`w-full p-2 rounded-xl border flex items-center justify-between text-left text-xs transition ${
                            task.isCompleted
                              ? 'bg-winter-900/40 border-emerald-500/20 text-slate-400 line-through'
                              : 'bg-winter-850 border-white/5 text-slate-200 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                task.isCompleted ? 'text-emerald-400' : 'text-slate-600'
                              }`}
                            />
                            <span>{task.title}</span>
                          </div>
                          {task.isCompleted && (
                            <span className="text-[10px] text-emerald-400 font-bold">+25 XP</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: ARC TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl glass-card border border-white/5 text-xs space-y-1">
            <h4 className="font-bold text-white font-display">Arc Journey Road</h4>
            <p className="text-slate-400">
              Each week represents a stepping stone toward your transformed self.
            </p>
          </div>

          <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
            {Array.from({ length: 8 }, (_, i) => {
              const weekNum = i + 1;
              const isPast = weekNum < 3;
              const isCurrent = weekNum === 3;

              return (
                <div key={weekNum} className="relative pl-11">
                  {/* Timeline Node */}
                  <div
                    className={`absolute left-3 top-3.5 w-4 h-4 rounded-full border-2 -translate-x-1/2 flex items-center justify-center ${
                      isPast
                        ? 'bg-emerald-500 border-emerald-400 shadow-glow-emerald'
                        : isCurrent
                        ? 'bg-winter-cyan border-white shadow-glow-cyan animate-pulse'
                        : 'bg-winter-900 border-white/20'
                    }`}
                  />

                  <div
                    className={`p-3.5 rounded-2xl border transition ${
                      isCurrent
                        ? 'glass-card border-winter-cyan/40 shadow-glow-cyan'
                        : isPast
                        ? 'bg-winter-900/60 border-emerald-500/20'
                        : 'bg-winter-900/40 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-display">
                        Week {weekNum}
                      </span>
                      {isPast && (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Complete</span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-winter-cyan/15 text-winter-cyan font-bold border border-winter-cyan/30">
                          Current Focus
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isPast
                        ? 'Completed 34 habit sessions • Maintained sleep hygiene.'
                        : isCurrent
                        ? 'Current milestone • Focus on workout frequency and reading pace.'
                        : 'Upcoming phase of transformation.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 4: BADGES & ACHIEVEMENTS */}
      {activeSubTab === 'badges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-4 rounded-3xl border transition flex flex-col justify-between ${
                  ach.isUnlocked
                    ? 'glass-card border-winter-cyan/30 shadow-glow-cyan'
                    : 'bg-winter-900/50 border-white/5 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-winter-800 flex items-center justify-center text-xl shadow-sm">
                    {ach.icon}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">{ach.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-winter-cyan">+{ach.xpReward} XP</span>
                  <span
                    className={`font-semibold ${
                      ach.isUnlocked ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {ach.isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
