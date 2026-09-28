import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Sparkles,
  Calendar,
  Smile,
  CheckCircle2,
  Trash2,
  Clock,
  History
} from 'lucide-react';
import { JournalEntry, MoodType } from '../types/index.js';
import { soundManager } from '../utils/audio.js';

interface JournalTabProps {
  entries: JournalEntry[];
  onThisDay: JournalEntry[];
  onOpenCheckIn: () => void;
  onCreateEntry: (data: {
    note: string;
    mood?: string;
    title?: string;
    proudOf?: string;
    improveTomorrow?: string;
  }) => Promise<void>;
}

const MOOD_EMOJIS: Record<string, string> = {
  Great: '😄',
  Good: '🙂',
  Okay: '😐',
  Difficult: '😔',
  Exhausted: '😴'
};

export const JournalTab: React.FC<JournalTabProps> = ({
  entries,
  onThisDay,
  onOpenCheckIn,
  onCreateEntry
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [quickMood, setQuickMood] = useState<MoodType>('Good');
  const [loading, setLoading] = useState(false);

  const filteredEntries = entries.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      e.note.toLowerCase().includes(q) ||
      (e.proudOf && e.proudOf.toLowerCase().includes(q)) ||
      (e.improveTomorrow && e.improveTomorrow.toLowerCase().includes(q)) ||
      (e.mood && e.mood.toLowerCase().includes(q)) ||
      e.date.includes(q)
    );
  });

  const handleSaveQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    setLoading(true);
    try {
      await onCreateEntry({
        note: quickNote.trim(),
        mood: quickMood,
        proudOf: 'Showed up with consistency today.',
        improveTomorrow: 'Focus on early sleep and deliberate energy.'
      });
      soundManager.playCheck();
      setQuickNote('');
      setShowQuickNote(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black text-white font-display tracking-tight">MY JOURNAL</h1>
          <p className="text-xs text-slate-400">Chronicle of your personal evolution</p>
        </div>

        <button
          onClick={() => setShowQuickNote(!showQuickNote)}
          className="px-3.5 py-2 rounded-2xl bg-winter-cyan text-winter-950 font-bold text-xs font-display flex items-center gap-1.5 shadow-glow-cyan transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search thoughts, reflections, moods..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs"
        />
      </div>

      {/* Quick Note Inline Composer */}
      {showQuickNote && (
        <form
          onSubmit={handleSaveQuickNote}
          className="p-4 rounded-3xl glass-card border border-winter-cyan/30 shadow-glow-cyan space-y-3 animate-slide-up"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-display">Log Today's Reflection</span>
            {/* Mood selector */}
            <div className="flex items-center gap-1">
              {(['Great', 'Good', 'Okay', 'Difficult', 'Exhausted'] as MoodType[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setQuickMood(m)}
                  className={`text-sm p-1 rounded-lg transition ${
                    quickMood === m ? 'bg-winter-cyan/20 scale-125' : 'opacity-60'
                  }`}
                >
                  {MOOD_EMOJIS[m]}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            required
            placeholder="Write freely. What moved the needle today? Where was the friction?"
            value={quickNote}
            onChange={e => setQuickNote(e.target.value)}
            className="w-full p-3 rounded-2xl glass-input text-xs resize-none"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowQuickNote(false)}
              className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-xl bg-winter-cyan text-winter-950 font-bold text-xs shadow-glow-cyan"
            >
              {loading ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </form>
      )}

      {/* ON THIS DAY Highlight Card */}
      {onThisDay && onThisDay.length > 0 && (
        <section className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 shadow-lg space-y-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-300 font-display">
              ON THIS DAY
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            What you felt & wrote earlier in your Arc:
          </p>

          <div className="p-3 rounded-2xl bg-winter-900/80 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">{onThisDay[0].date}</span>
              <span className="text-xs">
                {onThisDay[0].mood ? MOOD_EMOJIS[onThisDay[0].mood] || '🙂' : '🙂'}
              </span>
            </div>
            <p className="text-xs text-slate-200 italic">“{onThisDay[0].note}”</p>
            {onThisDay[0].proudOf && (
              <p className="text-[11px] text-emerald-400 font-medium">
                ★ Proud of: {onThisDay[0].proudOf}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Entries Feed */}
      <section className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 rounded-3xl glass-card text-center space-y-3 border border-white/5">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="font-bold text-white text-sm">No journal entries yet</h4>
            <p className="text-xs text-slate-400">
              Complete a daily evening check-in or write your first entry.
            </p>
            <button
              onClick={onOpenCheckIn}
              className="px-4 py-2 rounded-xl bg-winter-800 text-white font-semibold text-xs border border-white/10"
            >
              Open Daily Check-In
            </button>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className="p-4 rounded-3xl glass-card border border-white/5 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {entry.mood ? MOOD_EMOJIS[entry.mood] || '🙂' : '🙂'}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-white">{entry.date}</h5>
                    <span className="text-[10px] text-slate-400">
                      {entry.mood ? `Mood: ${entry.mood}` : 'Daily entry'}
                    </span>
                  </div>
                </div>

                {entry.productivityScore && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-winter-cyan/15 text-winter-cyan border border-winter-cyan/30">
                    Productivity {entry.productivityScore}/10
                  </span>
                )}
              </div>

              {/* Note body */}
              <p className="text-xs text-slate-200 leading-relaxed">{entry.note}</p>

              {/* Proud of & Tomorrow */}
              {(entry.proudOf || entry.improveTomorrow) && (
                <div className="pt-2 border-t border-white/5 space-y-1 text-[11px]">
                  {entry.proudOf && (
                    <div className="flex items-start gap-1.5 text-emerald-400">
                      <span className="font-bold">Proud:</span>
                      <span className="text-slate-300">{entry.proudOf}</span>
                    </div>
                  )}
                  {entry.improveTomorrow && (
                    <div className="flex items-start gap-1.5 text-purple-400">
                      <span className="font-bold">Tomorrow:</span>
                      <span className="text-slate-300">{entry.improveTomorrow}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-winter-cyan" />
                  <span>{entry.habitsCompletedCount} habits completed</span>
                </span>
                <span>
                  {new Date(entry.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};
