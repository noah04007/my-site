import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Calendar,
  Flame,
  Plus,
  Trash2,
  Clock,
  Shield
} from 'lucide-react';
import { HabitIcon, AVAILABLE_ICONS } from './HabitIcon.js';
import { fireGrandCelebration } from '../utils/confetti.js';
import { soundManager } from '../utils/audio.js';

interface OnboardingFlowProps {
  onComplete: (data: {
    categories: string[];
    mainGoal: string;
    durationDays: number;
    intensity: 'Chill' | 'Balanced' | 'Hardcore';
    habits: Array<{
      name: string;
      icon: string;
      category: string;
      frequency: 'daily' | 'weekdays' | 'custom';
      targetTime?: string;
      daysPerWeek: number;
    }>;
  }) => Promise<void>;
  onCancel?: () => void;
}

const CATEGORIES = [
  { id: 'Fitness', name: 'Fitness', icon: '🏃' },
  { id: 'Health', name: 'Health', icon: '💧' },
  { id: 'Studies', name: 'Studies', icon: '📚' },
  { id: 'Career', name: 'Career', icon: '💼' },
  { id: 'Money', name: 'Money', icon: '💰' },
  { id: 'Reading', name: 'Reading', icon: '📖' },
  { id: 'Self-care', name: 'Self-care', icon: '✨' },
  { id: 'Beauty', name: 'Beauty', icon: '🧴' },
  { id: 'Mental wellbeing', name: 'Mental wellbeing', icon: '🧠' },
  { id: 'Discipline', name: 'Discipline', icon: '⚡' },
  { id: 'Sleep', name: 'Sleep', icon: '🌙' },
  { id: 'Spirituality', name: 'Spirituality', icon: '🕯️' },
  { id: 'Relationships', name: 'Relationships', icon: '🤝' },
  { id: 'Personal growth', name: 'Personal growth', icon: '🌱' },
  { id: 'Other', name: 'Other', icon: '🎯' }
];

const PRESET_HABITS = [
  { name: 'Drink 2L water', icon: 'Droplets', category: 'Health', frequency: 'daily' as const, targetTime: '12:00', daysPerWeek: 7 },
  { name: 'Daily Workout', icon: 'Dumbbell', category: 'Fitness', frequency: 'daily' as const, targetTime: '07:30', daysPerWeek: 5 },
  { name: 'Read 20 minutes', icon: 'BookOpen', category: 'Reading', frequency: 'daily' as const, targetTime: '21:30', daysPerWeek: 7 },
  { name: 'Practice English', icon: 'Languages', category: 'Studies', frequency: 'daily' as const, targetTime: '18:00', daysPerWeek: 6 },
  { name: 'Daily Journal', icon: 'PenTool', category: 'Mental wellbeing', frequency: 'daily' as const, targetTime: '22:00', daysPerWeek: 7 },
  { name: 'Sleep before 11 PM', icon: 'Moon', category: 'Sleep', frequency: 'daily' as const, targetTime: '23:00', daysPerWeek: 7 },
  { name: 'Daily Walk', icon: 'Footprints', category: 'Fitness', frequency: 'daily' as const, targetTime: '17:00', daysPerWeek: 7 },
  { name: 'Skincare routine', icon: 'Sparkles', category: 'Self-care', frequency: 'daily' as const, targetTime: '08:00', daysPerWeek: 7 }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Fitness', 'Discipline', 'Studies', 'Health']);
  const [mainGoal, setMainGoal] = useState<string>(
    'I want to become more disciplined, improve my English, exercise regularly and take better care of myself.'
  );
  const [durationDays, setDurationDays] = useState<number>(90);
  const [customDays, setCustomDays] = useState<number>(45);
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<'Chill' | 'Balanced' | 'Hardcore'>('Balanced');

  // Habits selection
  const [selectedHabits, setSelectedHabits] = useState(PRESET_HABITS.slice(0, 5));
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Discipline');
  const [newHabitIcon, setNewHabitIcon] = useState('Flame');
  const [newHabitTime, setNewHabitTime] = useState('08:00');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleNext = () => {
    soundManager.playCheck();
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const togglePresetHabit = (preset: typeof PRESET_HABITS[0]) => {
    const exists = selectedHabits.some(h => h.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      setSelectedHabits(prev => prev.filter(h => h.name.toLowerCase() !== preset.name.toLowerCase()));
    } else {
      setSelectedHabits(prev => [...prev, preset]);
    }
  };

  const handleAddCustomHabit = () => {
    if (!newHabitName.trim()) return;
    setSelectedHabits(prev => [
      ...prev,
      {
        name: newHabitName.trim(),
        icon: newHabitIcon,
        category: newHabitCategory,
        frequency: 'daily',
        targetTime: newHabitTime,
        daysPerWeek: 7
      }
    ]);
    setNewHabitName('');
    setShowAddCustom(false);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({
        categories: selectedCategories,
        mainGoal: mainGoal.trim() || 'Transform with consistency and discipline.',
        durationDays: isCustomDuration ? customDays : durationDays,
        intensity,
        habits: selectedHabits
      });
      soundManager.playCelebration();
      fireGrandCelebration();
    } catch (e) {
      console.error('Error completing onboarding:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectedEndDate = new Date();
  projectedEndDate.setDate(projectedEndDate.getDate() + (isCustomDuration ? customDays : durationDays));

  return (
    <div className="min-h-screen bg-winter-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto relative overflow-hidden">
      {/* Ambient Winter Glow */}
      <div className="ambient-glow" />

      {/* Progress Dots */}
      <div className="w-full flex items-center justify-between z-10 pt-2 pb-4">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition"
          >
            Back
          </button>
        )}
        <div className="flex items-center gap-1.5 mx-auto">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-winter-cyan shadow-glow-cyan' : i < step ? 'w-2 bg-winter-cyan/60' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-slate-500 font-mono">Step {step}/6</div>
      </div>

      {/* STEP 1: WELCOME */}
      {step === 1 && (
        <div className="my-auto flex flex-col items-center text-center space-y-6 animate-fade-in z-10 py-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-winter-cyan/20 via-winter-800 to-indigo-900/30 border border-winter-cyan/30 flex items-center justify-center shadow-glow-cyan">
              <Flame className="w-12 h-12 text-winter-cyan animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-winter-cyan rounded-full animate-ping opacity-75" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-winter-cyan/90 bg-winter-cyan/10 px-3 py-1 rounded-full border border-winter-cyan/20">
              The Winter Arc Awakening
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              WELCOME TO YOUR <br />
              <span className="bg-gradient-to-r from-winter-cyan via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                WINTER ARC
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
              “Use this season to become the person you want to be.”
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-white/5 text-left text-xs text-slate-400 space-y-2 max-w-xs">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Shield className="w-4 h-4 text-winter-cyan" />
              <span>Core Philosophy</span>
            </div>
            <p className="italic">
              “Consistency over perfection. Your season. Your rules. Your transformation.”
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-winter-cyan to-indigo-500 text-winter-950 font-bold tracking-wide shadow-glow-cyan hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>START MY ARC</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 2: CATEGORIES */}
      {step === 2 && (
        <div className="my-auto space-y-5 animate-fade-in z-10 py-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              What do you want to work on?
            </h2>
            <p className="text-slate-400 text-xs">
              Select the pillars of your transformation this season.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[52vh] overflow-y-auto pr-1">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-3 rounded-xl flex items-center gap-2.5 text-xs text-left transition border ${
                    isSelected
                      ? 'bg-winter-cyan/15 border-winter-cyan/60 text-white shadow-glow-cyan'
                      : 'bg-winter-900/60 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium flex-1 truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-winter-cyan shrink-0" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedCategories.length === 0}
            className="w-full py-3.5 rounded-xl bg-winter-cyan text-winter-950 font-bold text-sm tracking-wide shadow-glow-cyan disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            <span>Continue ({selectedCategories.length} selected)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: MAIN GOAL */}
      {step === 3 && (
        <div className="my-auto space-y-6 animate-fade-in z-10 py-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              What is your main goal?
            </h2>
            <p className="text-slate-400 text-xs">
              Define the person you are committing to become.
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={mainGoal}
              onChange={e => setMainGoal(e.target.value)}
              placeholder="e.g. I want to become more disciplined, improve my English, exercise regularly and take better care of myself."
              className="w-full p-4 rounded-2xl glass-input text-sm leading-relaxed text-slate-100 resize-none"
            />
            <p className="text-[11px] text-slate-500 italic">
              Example: “I want to become more disciplined, improve my English, exercise regularly and take better care of myself.”
            </p>
          </div>

          <div className="p-4 rounded-xl bg-winter-900/80 border border-white/5 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-winter-cyan shrink-0" />
            <p className="text-xs text-slate-300">
              Clear commitments create strong identities. Your words will anchor your daily dashboard.
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={!mainGoal.trim()}
            className="w-full py-3.5 rounded-xl bg-winter-cyan text-winter-950 font-bold text-sm tracking-wide shadow-glow-cyan disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            <span>Lock In Goal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: DURATION */}
      {step === 4 && (
        <div className="my-auto space-y-6 animate-fade-in z-10 py-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              How long is your Arc?
            </h2>
            <p className="text-slate-400 text-xs">
              Choose your transformation timeframe.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[30, 60, 90].map(days => (
              <button
                key={days}
                onClick={() => {
                  setDurationDays(days);
                  setIsCustomDuration(false);
                }}
                className={`p-4 rounded-2xl border text-left transition ${
                  !isCustomDuration && durationDays === days
                    ? 'bg-winter-cyan/15 border-winter-cyan text-white shadow-glow-cyan'
                    : 'bg-winter-900/60 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="text-2xl font-black font-display">{days} Days</div>
                <div className="text-xs text-slate-400 mt-1">
                  {days === 90 ? 'The Classic Winter Arc' : days === 60 ? 'Deep Reset' : 'Quick Sprint'}
                </div>
              </button>
            ))}

            <button
              onClick={() => setIsCustomDuration(true)}
              className={`p-4 rounded-2xl border text-left transition ${
                isCustomDuration
                  ? 'bg-winter-cyan/15 border-winter-cyan text-white shadow-glow-cyan'
                  : 'bg-winter-900/60 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="text-2xl font-black font-display">Custom</div>
              <div className="text-xs text-slate-400 mt-1">Set your own timeline</div>
            </button>
          </div>

          {isCustomDuration && (
            <div className="p-4 rounded-xl glass-card space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Duration:</span>
                <span className="text-winter-cyan font-bold font-mono">{customDays} Days</span>
              </div>
              <input
                type="range"
                min="14"
                max="180"
                step="1"
                value={customDays}
                onChange={e => setCustomDays(Number(e.target.value))}
                className="w-full accent-winter-cyan cursor-pointer"
              />
            </div>
          )}

          {/* Visual Projected Timeline */}
          <div className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-winter-cyan" />
              <span>Projected Target Completion</span>
            </div>
            <div className="text-sm font-semibold text-white">
              {projectedEndDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-gradient-to-r from-winter-cyan to-indigo-500 h-full w-full rounded-full animate-pulse" />
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-winter-cyan text-winter-950 font-bold text-sm tracking-wide shadow-glow-cyan transition flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 5: INTENSITY */}
      {step === 5 && (
        <div className="my-auto space-y-6 animate-fade-in z-10 py-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Choose your Arc intensity
            </h2>
            <p className="text-slate-400 text-xs">
              Every pace transforms you. Choose what suits your current life rhythm.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'Chill',
                title: 'Chill',
                desc: 'Subtle, steady progress without excessive pressure. Focus on low-friction daily wins.',
                badge: 'Gentle & Sustainable'
              },
              {
                id: 'Balanced',
                title: 'Balanced',
                desc: 'Focused momentum with room for life and recovery. The recommended sweet spot.',
                badge: 'Recommended'
              },
              {
                id: 'Hardcore',
                title: 'Hardcore',
                desc: 'Intense focus, strict standards, relentless consistency. For seasoned practitioners.',
                badge: 'Maximum Discipline'
              }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setIntensity(item.id as any)}
                className={`w-full p-4 rounded-2xl border text-left transition flex flex-col gap-1.5 ${
                  intensity === item.id
                    ? 'bg-winter-cyan/15 border-winter-cyan text-white shadow-glow-cyan'
                    : 'bg-winter-900/60 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-white">{item.title}</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-winter-900/60 border border-white/5 text-xs text-slate-400 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-winter-cyan shrink-0" />
            <span>This is not a performance obligation. Consistency over perfection always.</span>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-winter-cyan text-winter-950 font-bold text-sm tracking-wide shadow-glow-cyan transition flex items-center justify-center gap-2"
          >
            <span>Set Intensity</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 6: HABITS BUILDER */}
      {step === 6 && (
        <div className="my-auto space-y-5 animate-fade-in z-10 py-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Build your daily habits
            </h2>
            <p className="text-slate-400 text-xs">
              Select or customize the actions that form your daily identity.
            </p>
          </div>

          {/* Selected Habits List */}
          <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
            {selectedHabits.map((habit, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl glass-card flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-winter-800 flex items-center justify-center border border-white/5">
                    <HabitIcon name={habit.icon} category={habit.category} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{habit.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{habit.category}</span>
                      {habit.targetTime && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          {habit.targetTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedHabits(prev => prev.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {selectedHabits.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No habits selected yet. Choose from presets below or add a custom habit.
              </div>
            )}
          </div>

          {/* Preset Suggestions Quick Add */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Popular Winter Arc Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_HABITS.map((p, idx) => {
                const isAdded = selectedHabits.some(h => h.name.toLowerCase() === p.name.toLowerCase());
                return (
                  <button
                    key={idx}
                    onClick={() => togglePresetHabit(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition ${
                      isAdded
                        ? 'bg-winter-cyan/20 border border-winter-cyan text-winter-cyan'
                        : 'bg-winter-900 border border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{isAdded ? '✓' : '+'}</span>
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Habit Modal/Form */}
          {showAddCustom ? (
            <div className="p-4 rounded-2xl glass-panel border border-winter-cyan/30 space-y-3 text-xs">
              <div className="font-semibold text-white flex justify-between items-center">
                <span>Create Custom Habit</span>
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                placeholder="Habit name (e.g. Meditate 10 min)"
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newHabitCategory}
                    onChange={e => setNewHabitCategory(e.target.value)}
                    className="w-full p-2 rounded-xl glass-input text-xs text-white bg-winter-900"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Time</label>
                  <input
                    type="time"
                    value={newHabitTime}
                    onChange={e => setNewHabitTime(e.target.value)}
                    className="w-full p-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Icon</label>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {AVAILABLE_ICONS.map(i => (
                    <button
                      key={i.name}
                      onClick={() => setNewHabitIcon(i.name)}
                      className={`p-2 rounded-lg border ${
                        newHabitIcon === i.name
                          ? 'border-winter-cyan bg-winter-cyan/20'
                          : 'border-white/10 bg-winter-900'
                      }`}
                    >
                      <i.icon className="w-4 h-4 text-winter-cyan" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddCustomHabit}
                disabled={!newHabitName.trim()}
                className="w-full py-2.5 rounded-xl bg-winter-cyan text-winter-950 font-bold disabled:opacity-40"
              >
                Add Habit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCustom(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-winter-cyan/50 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Habit</span>
            </button>
          )}

          <button
            onClick={handleFinish}
            disabled={selectedHabits.length === 0 || isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-winter-cyan via-indigo-400 to-winter-cyan text-winter-950 font-bold tracking-wide shadow-glow-cyan disabled:opacity-40 transition flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <span>IGNITING YOUR ARC...</span>
            ) : (
              <>
                <Flame className="w-5 h-5 fill-winter-950" />
                <span>IGNITE MY WINTER ARC</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
