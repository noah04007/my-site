import React, { useState } from 'react';
import { X, Calendar, Flame, CheckCircle, TrendingUp, Sparkles, Award } from 'lucide-react';
import { WeeklyReview } from '../types/index.js';
import { soundManager } from '../utils/audio.js';
import { fireGrandCelebration } from '../utils/confetti.js';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<WeeklyReview>) => Promise<void>;
  previewData: {
    weekNumber: number;
    completionRate: number;
    bestHabit: string;
    difficultHabit: string;
    streak: number;
    suggestions: string[];
  } | null;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  previewData
}) => {
  const [nextWeekGoal, setNextWeekGoal] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !previewData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        weekNumber: previewData.weekNumber,
        completionRate: previewData.completionRate,
        bestHabit: previewData.bestHabit,
        difficultHabit: previewData.difficultHabit,
        streak: previewData.streak,
        nextWeekGoal: (nextWeekGoal || selectedSuggestion || 'Maintain relentless consistency and protect sleep.').trim()
      });
      soundManager.playCelebration();
      fireGrandCelebration();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-winter-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-winter-cyan/20 border border-winter-cyan/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-winter-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-white font-display text-sm tracking-tight">
                YOUR WEEK IN REVIEW
              </h3>
              <p className="text-[11px] text-slate-400">Week {previewData.weekNumber} Transformation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Main Highlights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl glass-card border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-winter-cyan" />
                <span>Habits completed</span>
              </span>
              <div className="text-2xl font-black text-winter-cyan font-display">
                {previewData.completionRate}%
              </div>
            </div>

            <div className="p-3 rounded-2xl glass-card border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400">Current streak</span>
              <div className="text-2xl font-black text-amber-400 font-display flex items-center gap-1">
                <Flame className="w-5 h-5 fill-amber-400" />
                <span>{previewData.streak}d</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-winter-850 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">Best habit:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {previewData.bestHabit}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-winter-850 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">Most difficult habit:</span>
              <span className="font-semibold text-amber-300">
                {previewData.difficultHabit}
              </span>
            </div>
          </div>

          {/* Question: What would you like to improve next week? */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-slate-200 block">
              What would you like to improve next week?
            </label>
            <textarea
              rows={2}
              value={nextWeekGoal}
              onChange={e => setNextWeekGoal(e.target.value)}
              placeholder="e.g. Anchor my workout right after morning coffee, reduce phone time..."
              className="w-full p-3 rounded-xl glass-input text-xs text-white resize-none"
            />
          </div>

          {/* Suggestions */}
          {previewData.suggestions && previewData.suggestions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Suggestions for you:</span>
              <div className="space-y-1.5">
                {previewData.suggestions.map((sug, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedSuggestion(sug);
                      setNextWeekGoal(sug);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-[11px] transition ${
                      selectedSuggestion === sug
                        ? 'border-winter-cyan bg-winter-cyan/15 text-white'
                        : 'border-white/5 bg-winter-850 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    • {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* XP Banner */}
          <div className="p-3 rounded-xl bg-winter-850 border border-winter-cyan/20 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-winter-cyan" />
              <span>Review XP Reward</span>
            </div>
            <span className="font-bold text-winter-cyan font-mono">+75 XP</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-winter-cyan to-indigo-500 text-winter-950 font-bold tracking-wide shadow-glow-cyan transition flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>FINISH WEEKLY REVIEW</span>
          </button>
        </form>
      </div>
    </div>
  );
};
