import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react';
import { MoodType } from '../types/index.js';
import { soundManager } from '../utils/audio.js';
import { fireCelebrationConfetti } from '../utils/confetti.js';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    mood: MoodType;
    productivityScore: number;
    proudOf: string;
    improveTomorrow: string;
  }) => Promise<void>;
  alreadyDone?: boolean;
}

const MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'Great', emoji: '😄', label: 'Great' },
  { type: 'Good', emoji: '🙂', label: 'Good' },
  { type: 'Okay', emoji: '😐', label: 'Okay' },
  { type: 'Difficult', emoji: '😔', label: 'Difficult' },
  { type: 'Exhausted', emoji: '😴', label: 'Exhausted' }
];

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  alreadyDone
}) => {
  const [mood, setMood] = useState<MoodType>('Good');
  const [productivityScore, setProductivityScore] = useState<number>(8);
  const [proudOf, setProudOf] = useState<string>('');
  const [improveTomorrow, setImproveTomorrow] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        mood,
        productivityScore,
        proudOf: proudOf.trim() || 'Showed up for myself today.',
        improveTomorrow: improveTomorrow.trim() || 'Maintain consistency and focus on energy.'
      });
      soundManager.playCelebration();
      fireCelebrationConfetti();
      onClose();
    } catch (err) {
      console.error('Check-in submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductivityLabel = (val: number) => {
    if (val >= 9) return '⚡ Elite Momentum';
    if (val >= 7) return '🔥 Solid & Productive';
    if (val >= 5) return '🌱 Steady Baseline';
    if (val >= 3) return '🛡️ Showed up despite friction';
    return '🛌 Recovery & Rest';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-winter-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-winter-cyan/15 flex items-center justify-center border border-winter-cyan/30">
              <Sparkles className="w-4 h-4 text-winter-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-display tracking-tight">
                HOW WAS YOUR DAY?
              </h3>
              <p className="text-[11px] text-slate-400">Evening Winter Arc Reflection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {alreadyDone && (
            <div className="px-3.5 py-2 rounded-xl bg-winter-cyan/10 border border-winter-cyan/20 text-winter-cyan text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-winter-cyan" />
              <span>You already checked in today. Submitting again will update your daily entry.</span>
            </div>
          )}

          {/* Mood Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Your state of mind today:</label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map(m => (
                <button
                  type="button"
                  key={m.type}
                  onClick={() => {
                    setMood(m.type);
                    soundManager.playCheck();
                  }}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition border ${
                    mood === m.type
                      ? 'bg-winter-cyan/20 border-winter-cyan shadow-glow-cyan scale-105'
                      : 'bg-winter-850 border-white/5 hover:border-white/20 opacity-80'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-medium text-slate-300">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Productivity Slider 1-10 */}
          <div className="p-4 rounded-2xl glass-card space-y-2.5 border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">How productive did you feel today?</span>
              <span className="font-mono font-bold text-winter-cyan text-sm">{productivityScore}/10</span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={productivityScore}
              onChange={e => setProductivityScore(Number(e.target.value))}
              className="w-full accent-winter-cyan cursor-pointer"
            />

            <div className="text-[11px] text-winter-cyan font-medium text-center">
              {getProductivityLabel(productivityScore)}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>What are you proud of today?</span>
            </label>
            <textarea
              rows={2}
              value={proudOf}
              onChange={e => setProudOf(e.target.value)}
              placeholder="e.g. Read without distractions, drank my 2L water..."
              className="w-full p-3 rounded-xl glass-input text-xs text-white resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>What do you want to improve tomorrow?</span>
            </label>
            <textarea
              rows={2}
              value={improveTomorrow}
              onChange={e => setImproveTomorrow(e.target.value)}
              placeholder="e.g. Wake up on the first alarm, start workout 15 min earlier..."
              className="w-full p-3 rounded-xl glass-input text-xs text-white resize-none"
            />
          </div>

          {/* XP Incentive Callout */}
          <div className="p-3 rounded-xl bg-winter-850 border border-winter-cyan/20 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-winter-cyan" />
              <span>Completion reward</span>
            </div>
            <span className="text-winter-cyan font-bold font-mono">+40 XP</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-winter-cyan to-indigo-500 text-winter-950 font-bold tracking-wide shadow-glow-cyan active:scale-98 transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span>SAVING CHECK-IN...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>COMPLETE MY DAY</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
