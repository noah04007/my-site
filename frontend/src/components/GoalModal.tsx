import React, { useState } from 'react';
import { X, Target, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio.js';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; category?: string; targetDate?: string; tasks?: string[] }) => Promise<void>;
}

const CATEGORIES = ['Studies', 'Fitness', 'Career', 'Health', 'Mental wellbeing', 'Personal growth', 'Discipline'];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Studies');
  const [targetDate, setTargetDate] = useState('');
  const [tasks, setTasks] = useState<string[]>([
    'Learn 20 new words',
    'Practice speaking 15 mins'
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddTask = () => {
    if (newTaskInput.trim()) {
      setTasks(prev => [...prev, newTaskInput.trim()]);
      setNewTaskInput('');
      soundManager.playCheck();
    }
  };

  const handleRemoveTask = (idx: number) => {
    setTasks(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        category,
        targetDate: targetDate || undefined,
        tasks: tasks.filter(t => t.trim().length > 0)
      });
      soundManager.playCelebration();
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
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-display">Define Major Goal</h3>
              <p className="text-[11px] text-slate-400">Transform intention into milestones</p>
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
          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Goal Statement</label>
            <input
              type="text"
              required
              placeholder="e.g. Improve my English, Bench 100kg, Build MVP..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs"
            />
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
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-semibold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks checklist */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Action Tasks / Milestones ({tasks.length})
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-winter-850 border border-white/5"
                >
                  <span className="text-slate-300 text-xs">☐ {task}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new task input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add sub-task..."
                value={newTaskInput}
                onChange={e => setNewTaskInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-2 rounded-xl bg-winter-800 hover:bg-winter-700 border border-white/10 text-white font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs font-display flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Goal...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Establish Goal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
