import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Calendar, Check } from 'lucide-react';
import { Habit, HabitFrequency } from '../types/index.js';
import { AVAILABLE_ICONS } from './HabitIcon.js';
import { soundManager } from '../utils/audio.js';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => Promise<void>;
  editingHabit?: Habit | null;
}

const CATEGORIES = [
  'Fitness',
  'Health',
  'Studies',
  'Reading',
  'Self-care',
  'Discipline',
  'Mental wellbeing',
  'Sleep',
  'Career',
  'Money',
  'Personal growth'
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHabit
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Discipline');
  const [icon, setIcon] = useState('Flame');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetTime, setTargetTime] = useState('08:00');
  const [daysPerWeek, setDaysPerWeek] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setCategory(editingHabit.category);
      setIcon(editingHabit.icon);
      setFrequency(editingHabit.frequency);
      setTargetTime(editingHabit.targetTime || '08:00');
      setDaysPerWeek(editingHabit.daysPerWeek || 7);
    } else {
      setName('');
      setCategory('Discipline');
      setIcon('Flame');
      setFrequency('daily');
      setTargetTime('08:00');
      setDaysPerWeek(7);
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        category,
        icon,
        frequency,
        targetTime,
        daysPerWeek
      });
      soundManager.playCheck();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-winter-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-winter-cyan/15 flex items-center justify-center border border-winter-cyan/30">
              <Sparkles className="w-4 h-4 text-winter-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-display">
                {editingHabit ? 'Edit Habit' : 'Build New Habit'}
              </h3>
              <p className="text-[11px] text-slate-400">Design your daily routine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Habit Name */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Habit Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Read 20 minutes, Drink 2L water, Morning run..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Choose Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS.map(item => {
                const IconComponent = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                      isSelected
                        ? 'bg-winter-cyan/20 border-winter-cyan text-winter-cyan scale-105'
                        : 'bg-winter-850 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[9px] truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] border transition ${
                    category === cat
                      ? 'bg-winter-cyan/20 border-winter-cyan text-winter-cyan font-semibold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as HabitFrequency)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-winter-900"
              >
                <option value="daily">Daily (7 days/wk)</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="custom">Custom target</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Target Time (Optional)
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={targetTime}
                  onChange={e => setTargetTime(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs font-display flex items-center justify-center gap-2 shadow-glow-purple transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingHabit ? 'Update Habit' : 'Add to My Winter Arc'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
