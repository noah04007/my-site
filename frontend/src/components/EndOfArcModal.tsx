import React, { useState } from 'react';
import { X, Trophy, Sparkles, Flame, CheckCircle, Award, ArrowRight } from 'lucide-react';
import { Arc, ArcStats } from '../types/index.js';
import { soundManager } from '../utils/audio.js';
import { fireGrandCelebration } from '../utils/confetti.js';

interface EndOfArcModalProps {
  isOpen: boolean;
  onClose: () => void;
  arc: Arc | null;
  stats: ArcStats | null;
  totalGoalsCompleted?: number;
  totalJournalEntries?: number;
  onCompleteArc: (reflections: {
    reflectionProud: string;
    reflectionChanged: string;
    reflectionKeep: string;
  }) => Promise<void>;
  onStartNewArc: () => void;
}

export const EndOfArcModal: React.FC<EndOfArcModalProps> = ({
  isOpen,
  onClose,
  arc,
  stats,
  totalGoalsCompleted = 3,
  totalJournalEntries = 12,
  onCompleteArc,
  onStartNewArc
}) => {
  const [step, setStep] = useState<'summary' | 'reflection'>('summary');
  const [reflectionProud, setReflectionProud] = useState('');
  const [reflectionChanged, setReflectionChanged] = useState('');
  const [reflectionKeep, setReflectionKeep] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !arc) return null;

  const handleFinishReflection = async () => {
    setLoading(true);
    try {
      await onCompleteArc({
        reflectionProud: reflectionProud.trim() || 'Showed up through the cold days and held my line.',
        reflectionChanged: reflectionChanged.trim() || 'Built calm discipline and improved consistency.',
        reflectionKeep: reflectionKeep.trim() || 'Daily reading, morning hydration and deliberate focus.'
      });
      soundManager.playCelebration();
      fireGrandCelebration();
      onStartNewArc();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-winter-900 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'summary' ? (
          <div className="space-y-6 pt-2 text-center">
            {/* Trophy Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-400/40 flex items-center justify-center mx-auto shadow-glow-flame">
              <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-winter-cyan">
                SEASON TRANSFORMATION COMPLETE
              </span>
              <h2 className="text-2xl font-black font-display text-white tracking-tight">
                ARC COMPLETE
              </h2>
              <p className="text-sm font-medium text-slate-300 italic">
                “You showed up for yourself.”
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left pt-2">
              <div className="p-3 rounded-2xl glass-card border border-white/5">
                <span className="text-[10px] text-slate-400 block">Total Days</span>
                <span className="text-xl font-black font-display text-white">
                  {stats?.currentDay || arc.durationDays}d
                </span>
              </div>

              <div className="p-3 rounded-2xl glass-card border border-white/5">
                <span className="text-[10px] text-slate-400 block">Completion Rate</span>
                <span className="text-xl font-black font-display text-winter-cyan">
                  {stats ? `${stats.todayCompletionPercent}%` : '85%'}
                </span>
              </div>

              <div className="p-3 rounded-2xl glass-card border border-white/5">
                <span className="text-[10px] text-slate-400 block">Best Streak</span>
                <span className="text-xl font-black font-display text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  {stats?.longestStreak || 14}d
                </span>
              </div>

              <div className="p-3 rounded-2xl glass-card border border-white/5">
                <span className="text-[10px] text-slate-400 block">XP Earned</span>
                <span className="text-xl font-black font-display text-emerald-400">
                  +{stats?.xp || 1200}
                </span>
              </div>

              <div className="p-3 rounded-2xl glass-card border border-white/5">
                <span className="text-[10px] text-slate-400 block">Goals Completed</span>
                <span className="text-xl font-black font-display text-purple-400">
                  {totalGoalsCompleted}
                </span>
              </div>

              <div className="p-3 rounded-2xl glass-card border border-white/5">
                <span className="text-[10px] text-slate-400 block">Journal Entries</span>
                <span className="text-xl font-black font-display text-indigo-400">
                  {totalJournalEntries}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playCheck();
                setStep('reflection');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-winter-cyan to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-bold text-xs font-display flex items-center justify-center gap-2 shadow-glow-cyan transition active:scale-95"
            >
              <span>Reflect On What Changed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="text-center space-y-1 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-winter-cyan">
                CLOSING THE CHAPTER
              </span>
              <h2 className="text-xl font-black font-display text-white">WHAT CHANGED?</h2>
              <p className="text-xs text-slate-400">
                Seal this season by acknowledging your evolution.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  What are you most proud of?
                </label>
                <textarea
                  rows={2}
                  value={reflectionProud}
                  onChange={e => setReflectionProud(e.target.value)}
                  placeholder="The mornings I wanted to stay in bed but pushed through anyway..."
                  className="w-full p-3 rounded-2xl glass-input text-xs resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  What changed during this Arc?
                </label>
                <textarea
                  rows={2}
                  value={reflectionChanged}
                  onChange={e => setReflectionChanged(e.target.value)}
                  placeholder="My relationship with discipline. I stopped waiting for motivation..."
                  className="w-full p-3 rounded-2xl glass-input text-xs resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  What habits do you want to keep?
                </label>
                <textarea
                  rows={2}
                  value={reflectionKeep}
                  onChange={e => setReflectionKeep(e.target.value)}
                  placeholder="Daily cold hydration, reading before bed, evening shutdown..."
                  className="w-full p-3 rounded-2xl glass-input text-xs resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinishReflection}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs font-display flex items-center justify-center gap-2 shadow-glow-flame transition active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>START A NEW ARC</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
