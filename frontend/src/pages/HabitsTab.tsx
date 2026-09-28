import React, { useState } from 'react';
import {
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  Edit2,
  Trash2,
  MoreVertical,
  Flame,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Habit } from '../types/index.js';
import { HabitIcon } from '../components/HabitIcon.js';
import { soundManager } from '../utils/audio.js';

interface HabitsTabProps {
  habits: Habit[];
  onToggleHabit: (habitId: string) => Promise<void>;
  onOpenAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onPauseHabit: (habitId: string, isPaused: boolean) => Promise<void>;
  onDeleteHabit: (habitId: string) => Promise<void>;
}

const CATEGORY_FILTERS = [
  'All',
  'Today',
  'Fitness',
  'Studies',
  'Health',
  'Reading',
  'Self-care',
  'Discipline',
  'Paused'
];

export const HabitsTab: React.FC<HabitsTabProps> = ({
  habits,
  onToggleHabit,
  onOpenAddHabit,
  onEditHabit,
  onPauseHabit,
  onDeleteHabit
}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedMenuHabitId, setSelectedMenuHabitId] = useState<string | null>(null);

  const filteredHabits = habits.filter(h => {
    if (activeFilter === 'All') return !h.isPaused;
    if (activeFilter === 'Paused') return h.isPaused;
    if (activeFilter === 'Today') return !h.isPaused; // In real use, habits scheduled for today
    return (
      !h.isPaused &&
      (h.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
        activeFilter.toLowerCase().includes(h.category.toLowerCase()))
    );
  });

  const activeCount = habits.filter(h => !h.isPaused).length;
  const completedTodayCount = habits.filter(h => !h.isPaused && h.isCompletedToday).length;

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header and stats */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black text-white font-display tracking-tight">HABITS</h1>
          <p className="text-xs text-slate-400">
            {completedTodayCount} of {activeCount} checked today • Consistency over perfection
          </p>
        </div>

        <button
          onClick={onOpenAddHabit}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-winter-cyan to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-bold text-xs font-display flex items-center gap-1.5 shadow-glow-cyan transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Filter Chips Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORY_FILTERS.map(filter => {
          const isSelected = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => {
                soundManager.playCheck();
                setActiveFilter(filter);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-winter-cyan text-winter-950 border-winter-cyan shadow-glow-cyan'
                  : 'bg-winter-850/80 hover:bg-winter-800 text-slate-400 border-white/5'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="p-8 rounded-3xl glass-card text-center space-y-3 border border-white/5 my-4">
          <div className="w-12 h-12 rounded-2xl bg-winter-800 flex items-center justify-center mx-auto text-slate-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400">No habits found in this filter.</p>
          <button
            onClick={() => setActiveFilter('All')}
            className="text-xs text-winter-cyan font-semibold hover:underline"
          >
            Show All Active Habits
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map(habit => {
            const isDone = habit.isCompletedToday;
            const isMenuOpen = selectedMenuHabitId === habit.id;

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-3xl border transition relative ${
                  habit.isPaused
                    ? 'bg-winter-900/40 border-white/5 opacity-60'
                    : isDone
                    ? 'glass-card border-emerald-500/20'
                    : 'glass-card hover:border-winter-cyan/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      type="button"
                      disabled={habit.isPaused}
                      onClick={() => onToggleHabit(habit.id)}
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center transition shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald scale-105'
                          : 'bg-winter-800 border border-white/10 hover:border-winter-cyan/40 text-transparent'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 transition-all ${
                          isDone ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </button>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-bold text-sm tracking-tight truncate ${
                            isDone ? 'line-through text-slate-400 font-normal' : 'text-white'
                          }`}
                        >
                          {habit.name}
                        </h4>
                        {habit.isPaused && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Paused
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-winter-800 text-slate-300 font-medium border border-white/5">
                          {habit.category}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {habit.frequency === 'daily'
                            ? 'Every day'
                            : habit.frequency === 'weekdays'
                            ? 'Mon-Fri'
                            : `${habit.daysPerWeek} days/wk`}
                        </span>

                        {habit.targetTime && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {habit.targetTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Icon & Menu Button */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-winter-800/80 border border-white/5 flex items-center justify-center">
                      <HabitIcon name={habit.icon} category={habit.category} className="w-4 h-4" />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMenuHabitId(isMenuOpen ? null : habit.id)
                      }
                      className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 7-Day Consistency mini tracker dots */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">Recent Rhythm</span>
                  <div className="flex items-center gap-1.5">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                      // Demo active rhythm simulation
                      const isCompletedDot = isDone ? true : idx < 5;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-0.5">
                          <span className="text-[8px] text-slate-500">{day}</span>
                          <span
                            className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[8px] ${
                              isCompletedDot
                                ? 'bg-winter-cyan/20 border border-winter-cyan/40 text-winter-cyan font-bold'
                                : 'bg-winter-800 border border-white/5 text-slate-600'
                            }`}
                          >
                            {isCompletedDot ? '✓' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action dropdown drawer */}
                {isMenuOpen && (
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMenuHabitId(null);
                        onEditHabit(habit);
                      }}
                      className="p-2 rounded-xl bg-winter-800 hover:bg-winter-700 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-winter-cyan" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMenuHabitId(null);
                        onPauseHabit(habit.id, !habit.isPaused);
                      }}
                      className="p-2 rounded-xl bg-winter-800 hover:bg-winter-700 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      {habit.isPaused ? (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pause</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMenuHabitId(null);
                        if (confirm(`Remove habit "${habit.name}"?`)) {
                          onDeleteHabit(habit.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
